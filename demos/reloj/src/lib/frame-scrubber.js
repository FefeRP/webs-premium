// frame-scrubber.js: dibuja una secuencia de frames en un <canvas> según un progreso 0..1.
// Sin dependencias. Lee el manifest.json que genera extraer-frames.mjs.
//
//   import { crearFrameScrubber } from './frame-scrubber.js';
//   const seq = await crearFrameScrubber({ canvas, base: '/frames/producto/' });
//   // con GSAP:  ScrollTrigger.create({ trigger, pin: true, scrub: true, end: '+=300%', onUpdate: s => seq.progreso(s.progress) });
//   // sin GSAP:  seq.progreso(valor) desde tu propio cálculo de scroll
//
// Decisiones (ver references/rendimiento.md):
// - Descarga TODOS los frames comprimidos (Blob, ~40-120 KB cada uno) en orden progresivo: 1º, último, cada 16, 8, 4, 2, 1.
//   Así la secuencia es usable enseguida a baja "resolución temporal" y se va rellenando.
// - Decodifica con createImageBitmap (fuera del hilo principal) y guarda solo una ventana LRU de bitmaps
//   (memoria acotada: un frame 1920x1080 decodificado ocupa ~8 MB; 120 frames serían ~1 GB y Safari iOS mata la pestaña).
// - Si el frame pedido aún no está, dibuja el más cercano disponible (nunca un hueco en blanco).
// - Solo redibuja cuando cambia el índice o el tamaño. Respeta DPR con tope (por defecto 2).

const ORDEN_CACHE = Symbol('lru');

export async function crearFrameScrubber({
  canvas,
  base,                    // carpeta con manifest.json (acaba en /)
  manifest = null,         // o el objeto ya cargado
  variante = 'auto',       // 'auto' | 'escritorio' | 'movil'
  ajuste = 'cover',        // 'cover' | 'contain'
  dprMax = 2,
  paralelo = 6,            // descargas simultáneas
  maxBitmaps = null,       // ventana LRU de frames decodificados (auto: 48 escritorio / 24 móvil)
  alCargar = null,         // (cargados, total) => {}
  fondo = null,            // color de relleno para 'contain'
} = {}) {
  if (!canvas) throw new Error('frame-scrubber: falta canvas');
  if (!base.endsWith('/')) base += '/';
  const m = manifest ?? (await (await fetch(base + 'manifest.json')).json());

  const esMovil = matchMedia('(max-width: 767px), (orientation: portrait) and (max-width: 1024px)').matches;
  const nombre = variante === 'auto' ? (esMovil && m.variantes.movil ? 'movil' : 'escritorio') : variante;
  const v = m.variantes[nombre] ?? m.variantes.escritorio;
  const ext = await elegirFormato(m.formatos);
  const total = m.frames;
  const url = (i) => base + v.ruta.replace('{i}', String(i + 1).padStart(m.pad ?? 4, '0')).replace('{ext}', ext);
  const limite = maxBitmaps ?? (esMovil ? 24 : 48);

  const ctx = canvas.getContext('2d', { alpha: ajuste === 'contain' && !fondo });
  const blobs = new Array(total).fill(null);
  const bitmaps = new Map();       // índice -> ImageBitmap
  bitmaps[ORDEN_CACHE] = [];       // orden de uso para LRU
  const decodificando = new Map(); // índice -> Promise
  let actual = 0;
  let dibujado = -1;
  let cargados = 0;
  let destruido = false;
  let rafPendiente = 0;
  const abort = new AbortController();

  // --- tamaño del canvas: CSS * DPR, sin pasar de la resolución real del frame ---
  function ajustarTamano() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, dprMax);
    const escala = Math.min(dpr, Math.max(v.ancho / Math.max(r.width, 1), v.alto / Math.max(r.height, 1)));
    const w = Math.max(1, Math.round(r.width * escala));
    const h = Math.max(1, Math.round(r.height * escala));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      dibujado = -1;
      pedirDibujo();
    }
  }
  const ro = new ResizeObserver(ajustarTamano);
  ro.observe(canvas);

  // --- descarga progresiva ---
  const orden = ordenProgresivo(total);
  const cola = orden.slice();
  async function trabajador() {
    while (cola.length && !destruido) {
      const i = cola.shift();
      try {
        const r = await fetch(url(i), { signal: abort.signal });
        if (!r.ok) throw new Error(`${r.status} ${url(i)}`);
        blobs[i] = await r.blob();
        cargados++;
        alCargar?.(cargados, total);
        if (Math.abs(i - actual) <= 2 || dibujado === -1) pedirDibujo();
      } catch (e) {
        if (destruido) return;
        console.warn('frame-scrubber:', e.message);
      }
    }
  }
  const primero = (async () => {
    // el primer frame va solo y antes que nada (es el póster vivo)
    // si falla, no se rompe la página: se avisa y los trabajadores lo reintentan con el resto
    const i0 = cola.shift();
    try {
      const r = await fetch(url(i0), { signal: abort.signal });
      if (!r.ok) throw new Error(`${r.status} ${url(i0)}`);
      blobs[i0] = await r.blob();
      cargados++;
      alCargar?.(cargados, total);
      await decodificar(i0);
    } catch (e) {
      if (!destruido) { console.warn('frame-scrubber (primer frame):', e.message); cola.push(i0); }
    }
  })();
  await primero;
  ajustarTamano();
  dibujar();
  const descargas = Promise.all(Array.from({ length: paralelo }, trabajador));

  // --- decodificación con ventana LRU ---
  function tocar(i) {
    const o = bitmaps[ORDEN_CACHE];
    const k = o.indexOf(i);
    if (k !== -1) o.splice(k, 1);
    o.push(i);
    while (o.length > limite) {
      const fuera = o.shift();
      if (fuera === actual) { o.push(fuera); continue; }
      bitmaps.get(fuera)?.close?.();
      bitmaps.delete(fuera);
    }
  }
  function decodificar(i) {
    if (bitmaps.has(i)) { tocar(i); return Promise.resolve(bitmaps.get(i)); }
    if (decodificando.has(i)) return decodificando.get(i);
    if (!blobs[i]) return Promise.resolve(null);
    const p = createImageBitmap(blobs[i])
      .then((bmp) => {
        decodificando.delete(i);
        if (destruido) { bmp.close?.(); return null; }
        bitmaps.set(i, bmp);
        tocar(i);
        return bmp;
      })
      .catch((e) => { decodificando.delete(i); console.warn('frame-scrubber: no se pudo decodificar', i, e); return null; });
    decodificando.set(i, p);
    return p;
  }

  function masCercanoConBitmap(i) {
    if (bitmaps.has(i)) return i;
    for (let d = 1; d < total; d++) {
      if (i - d >= 0 && bitmaps.has(i - d)) return i - d;
      if (i + d < total && bitmaps.has(i + d)) return i + d;
    }
    return -1;
  }

  function pintar(bmp) {
    const cw = canvas.width, ch = canvas.height;
    const iw = bmp.width, ih = bmp.height;
    const s = ajuste === 'cover' ? Math.max(cw / iw, ch / ih) : Math.min(cw / iw, ch / ih);
    const w = iw * s, h = ih * s;
    if (ajuste === 'contain') {
      if (fondo) { ctx.fillStyle = fondo; ctx.fillRect(0, 0, cw, ch); } else ctx.clearRect(0, 0, cw, ch);
    }
    ctx.drawImage(bmp, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  function dibujar() {
    rafPendiente = 0;
    if (destruido) return;
    const i = actual;
    const disponible = masCercanoConBitmap(i);
    if (disponible !== -1 && disponible !== dibujado) {
      pintar(bitmaps.get(disponible));
      dibujado = disponible;
    }
    if (disponible !== i && blobs[i]) {
      decodificar(i).then(() => { if (actual === i) pedirDibujo(); });
    } else if (!blobs[i]) {
      // aún no ha llegado: decodifica el blob más cercano que sí esté
      for (let d = 1; d < total; d++) {
        const a = i - d, b = i + d;
        if (a >= 0 && blobs[a] && !bitmaps.has(a)) { decodificar(a).then(pedirDibujo); break; }
        if (b < total && blobs[b] && !bitmaps.has(b)) { decodificar(b).then(pedirDibujo); break; }
        if ((a >= 0 && bitmaps.has(a)) || (b < total && bitmaps.has(b))) break;
      }
    }
    // precarga en la dirección del movimiento
    const dir = Math.sign(i - (dibujar.anterior ?? i)) || 1;
    dibujar.anterior = i;
    for (let k = 1; k <= 3; k++) {
      const j = i + dir * k;
      if (j >= 0 && j < total && blobs[j]) decodificar(j);
    }
  }
  function pedirDibujo() {
    if (!rafPendiente && !destruido) rafPendiente = requestAnimationFrame(dibujar);
  }

  return {
    total,
    variante: nombre,
    formato: ext,
    /** p entre 0 y 1 */
    progreso(p) {
      const i = Math.round(Math.min(1, Math.max(0, p)) * (total - 1));
      if (i !== actual) { actual = i; pedirDibujo(); }
    },
    /** índice de frame directo */
    frame(i) {
      i = Math.min(total - 1, Math.max(0, Math.round(i)));
      if (i !== actual) { actual = i; pedirDibujo(); }
    },
    listo: descargas,
    destruir() {
      destruido = true;
      abort.abort();
      ro.disconnect();
      if (rafPendiente) cancelAnimationFrame(rafPendiente);
      for (const b of bitmaps.values()) b.close?.();
      bitmaps.clear();
    },
  };
}

// 0, último, y luego cada 16, 8, 4, 2, 1: la secuencia se puede recorrer casi desde el principio.
export function ordenProgresivo(total) {
  const visto = new Uint8Array(total);
  const orden = [];
  const add = (i) => { if (i >= 0 && i < total && !visto[i]) { visto[i] = 1; orden.push(i); } };
  add(0);
  add(total - 1);
  for (let paso = 16; paso >= 1; paso = paso >> 1) for (let i = 0; i < total; i += paso) add(i);
  return orden;
}

async function elegirFormato(formatos) {
  if (formatos.includes('avif') && (await soportaAvif())) return 'avif';
  return formatos.includes('webp') ? 'webp' : formatos[0];
}

function soportaAvif() {
  return new Promise((ok) => {
    const img = new Image();
    img.onload = () => ok(img.width > 0);
    img.onerror = () => ok(false);
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}
