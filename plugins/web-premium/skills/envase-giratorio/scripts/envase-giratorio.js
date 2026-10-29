// envase-giratorio.js: una lata (o bote, o tarro cilíndrico) que gira sin 3D ni modelo: la etiqueta PLANA
// (desplegada, como sale de imprenta) se enrolla sobre un cilindro en un canvas 2D, columna a columna, con sombreado
// cilíndrico, brillo especular y tapa metálica. Sin dependencias.
//
// Idea de ref10 (@DESIGNGEMSTUDIO, "3D drink slider in Figma"): allí la etiqueta es una franja larga que se DESLIZA
// dentro de una máscara con forma de lata (Smart Animate) y el giro se adivina. Aquí la franja se curva de verdad
// (u = asin(x/r)): los bordes se comprimen como en un cilindro real y el giro se puede ligar al scroll o al arrastre.
//
//   <canvas class="lata" aria-label="Lata de Monstpure, sabor mora" role="img"></canvas>
//   import { crearEnvaseGiratorio } from './envase-giratorio.js';
//   const lata = crearEnvaseGiratorio(document.querySelector('.lata'), { etiqueta: '/latas/mora.webp' });
//   await lata.listo;
//   lata.girar(0.25);                  // vueltas (0..1 = una vuelta); llámalo desde ScrollTrigger onUpdate o un tween
//   lata.cambiarEtiqueta('/latas/arandano.webp');  // slider de sabores
//
// La etiqueta: imagen plana con relación ancho/alto = perímetro / alto del cuerpo pintado (con la forma por defecto ≈ 1,5:1;
// lee lata.proporcionEtiqueta). Si no casa, se ve estirada o aplastada. Sus bordes izquierdo y derecho deben casar.
// Render bajo demanda (solo pinta al girar o cambiar de tamaño). Con reduced-motion el que llama no anima: girar()
// sigue funcionando para colocarla en un ángulo fijo.

export function crearEnvaseGiratorio(canvas, {
  etiqueta,               // URL o HTMLImageElement/ImageBitmap de la etiqueta plana
  forma = {},             // proporciones del envase (fracciones del alto del canvas)
  perspectiva = 0.13,     // achatamiento de las elipses (0 = de frente, 0.25 = visto bastante desde arriba)
  brillo = 0.55,          // intensidad de la franja especular (0..1)
  sombra = 0.6,           // oscurecimiento de los bordes del cilindro (0..1)
  metal = ['#f4f5f7', '#9aa0a8', '#5d636b'], // claro / medio / oscuro de la tapa y el fondo de aluminio
  dprMax = 2,
} = {}) {
  const f = { ancho: 0.36, tapa: 0.075, base: 0.05, cuello: 0.035, ...forma }; // ancho del cuerpo / alto
  const ctx = canvas.getContext('2d');
  let img = null, tira = null, vueltas = 0, w = 0, h = 0, dpr = 1, destruido = false, raf = 0;

  async function cargar(src) {
    if (typeof src !== 'string') return src;
    const im = new Image();
    im.decoding = 'async'; im.src = src;
    await im.decode();
    return im;
  }
  // La etiqueta, duplicada en horizontal en un canvas aparte: así una columna nunca se sale por la costura.
  function prepararTira(im) {
    const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
    const c = document.createElement('canvas');
    c.width = iw * 2; c.height = ih;
    const g = c.getContext('2d');
    g.drawImage(im, 0, 0); g.drawImage(im, iw, 0);
    return { c, iw, ih };
  }

  function medir() {
    const b = canvas.getBoundingClientRect();
    dpr = Math.min(dprMax, devicePixelRatio || 1);
    const nw = Math.max(1, Math.round(b.width * dpr)), nh = Math.max(1, Math.round(b.height * dpr));
    if (nw !== canvas.width || nh !== canvas.height) { canvas.width = nw; canvas.height = nh; }
    w = nw; h = nh;
  }

  function metalGrad(x0, x1) {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, metal[2]); g.addColorStop(0.28, metal[0]); g.addColorStop(0.45, metal[1]);
    g.addColorStop(0.75, metal[0]); g.addColorStop(1, metal[2]);
    return g;
  }

  // Geometría: cilindro centrado, el ancho manda salvo que no quepa a lo ancho del canvas.
  function geometria() {
    let rad = (h * f.ancho) / 2;
    if (rad * 2 > w * 0.98) rad = w * 0.49;
    const e = rad * perspectiva;                       // semieje vertical de las elipses
    const arriba = h * 0.02 + e, abajo = h * 0.98 - e;
    return { rad, e, cx: w / 2, arriba, abajo, yEtiq0: arriba + h * (f.tapa + f.cuello), yEtiq1: abajo - h * f.base };
  }

  function pintar() {
    raf = 0;
    if (destruido || !tira) return;
    ctx.clearRect(0, 0, w, h);
    const { rad, e, cx, arriba, abajo, yEtiq0, yEtiq1 } = geometria();

    // 1) Cuerpo de aluminio (tapa → cuello → base), con la misma curvatura que la etiqueta.
    ctx.fillStyle = metalGrad(cx - rad, cx + rad);
    ctx.beginPath();
    ctx.ellipse(cx, abajo, rad, e, 0, 0, Math.PI);           // borde inferior (mitad delantera)
    ctx.lineTo(cx - rad, arriba + h * f.tapa);
    // hombro: la tapa es un poco más estrecha que el cuerpo
    ctx.lineTo(cx - rad * 0.86, arriba);
    ctx.ellipse(cx, arriba, rad * 0.86, e * 0.86, 0, Math.PI, 0, true);
    ctx.lineTo(cx + rad, arriba + h * f.tapa);
    ctx.closePath(); ctx.fill();

    // 2) Etiqueta enrollada: cada columna de píxeles x toma la columna u = asin(x/r) de la etiqueta.
    const { c, iw, ih } = tira;
    const desfase = (((vueltas % 1) + 1) % 1) * iw;
    const altoCuerpo = yEtiq1 - yEtiq0;
    for (let px = Math.ceil(cx - rad); px < cx + rad; px++) {
      const n0 = Math.max(-1, (px - cx) / rad), n1 = Math.min(1, (px + 1 - cx) / rad);
      const a0 = Math.asin(n0), a1 = Math.asin(n1);
      let u = ((a0 + Math.PI / 2) / (2 * Math.PI)) * iw + desfase;   // media vuelta visible
      u %= iw;
      const du = Math.min(iw, Math.max(0.5, ((a1 - a0) / (2 * Math.PI)) * iw)); // nunca más de una vuelta: no se sale de la tira doble
      const dy = e * Math.sqrt(Math.max(0, 1 - ((n0 + n1) / 2) ** 2));  // la parte de delante queda más baja
      ctx.drawImage(c, u, 0, du, ih, px, yEtiq0 + dy, 1, altoCuerpo);
    }

    // 3) Sombreado cilíndrico y brillo, solo sobre lo pintado (source-atop).
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    const s = ctx.createLinearGradient(cx - rad, 0, cx + rad, 0);
    s.addColorStop(0, `rgba(0,0,0,${0.85 * sombra})`); s.addColorStop(0.18, `rgba(0,0,0,${0.15 * sombra})`);
    s.addColorStop(0.5, 'rgba(0,0,0,0)'); s.addColorStop(0.82, `rgba(0,0,0,${0.25 * sombra})`);
    s.addColorStop(1, `rgba(0,0,0,${0.9 * sombra})`);
    ctx.fillStyle = s; ctx.fillRect(cx - rad, 0, rad * 2, h);
    const b = ctx.createLinearGradient(cx - rad, 0, cx + rad, 0);
    b.addColorStop(0.2, 'rgba(255,255,255,0)'); b.addColorStop(0.3, `rgba(255,255,255,${0.55 * brillo})`);
    b.addColorStop(0.36, `rgba(255,255,255,${0.15 * brillo})`); b.addColorStop(0.7, 'rgba(255,255,255,0)');
    b.addColorStop(0.86, `rgba(255,255,255,${0.18 * brillo})`); b.addColorStop(0.92, 'rgba(255,255,255,0)');
    ctx.fillStyle = b; ctx.fillRect(cx - rad, 0, rad * 2, h);
    ctx.restore();

    // 4) Tapa: elipse metálica con anillo y lengüeta sugerida.
    const rt = rad * 0.86;
    const gt = ctx.createLinearGradient(cx - rt, arriba - e, cx + rt, arriba + e);
    gt.addColorStop(0, metal[1]); gt.addColorStop(0.5, metal[0]); gt.addColorStop(1, metal[2]);
    ctx.fillStyle = gt;
    ctx.beginPath(); ctx.ellipse(cx, arriba, rt, e * 0.86, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = Math.max(1, rad * 0.02);
    ctx.beginPath(); ctx.ellipse(cx, arriba, rt * 0.86, e * 0.74, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.beginPath(); ctx.ellipse(cx, arriba - e * 0.1, rt * 0.22, e * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  }
  const pedir = () => { if (!raf && !destruido) raf = requestAnimationFrame(pintar); };

  const ro = new ResizeObserver(() => { medir(); pedir(); });
  ro.observe(canvas);

  // Cada carga lleva su número: si llegan dos seguidas, solo cuenta la última (aunque la primera tarde más en decodificar).
  let peticion = 0;
  async function ponerEtiqueta(src) {
    const id = ++peticion;
    const im = await cargar(src);
    if (destruido || id !== peticion) return;
    img = im; tira = prepararTira(im);
    medir(); pedir();
  }
  const listo = ponerEtiqueta(etiqueta);

  return {
    listo,
    /** Gira a `v` vueltas (0..1 = una vuelta; admite negativos y más de 1). */
    girar(v) { vueltas = v; pedir(); },
    get vueltas() { return vueltas; },
    /** Ancho/alto que debe tener la etiqueta para no verse deformada con esta forma y este canvas. */
    get proporcionEtiqueta() { if (!h) medir(); const g = geometria(); return (2 * Math.PI * g.rad) / (g.yEtiq1 - g.yEtiq0); },
    /** Cambia la etiqueta (slider de sabores). Devuelve una promesa que se cumple cuando ya se ve la nueva. */
    cambiarEtiqueta(src) { return ponerEtiqueta(src); },
    destruir() { destruido = true; cancelAnimationFrame(raf); ro.disconnect(); },
  };
}
