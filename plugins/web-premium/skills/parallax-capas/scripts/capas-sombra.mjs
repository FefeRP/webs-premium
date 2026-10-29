#!/usr/bin/env node
// capas-sombra.mjs: separa una foto de producto en capas alineadas para parallax:
//   fondo limpio · SOMBRA (capa semitransparente propia, con su tinte) · producto recortado (bordes descontaminados).
// El recorte normal (rembg, remove.bg, Photoshop) tira la sombra; aquí se recupera dividiendo la foto entre el fondo limpio:
//   sombra_alfa = 1 - lum(foto) / lum(fondo)   →  negro con ese alfa encima de cualquier fondo = la misma sombra.
// Sin dependencias: solo ffmpeg (lo busca como extraer-frames.mjs).
//
// Uso:
//   node capas-sombra.mjs --foto foto.png --mascara mascara.png [--plato plato.png] --salida capas/
//   node capas-sombra.mjs --foto foto.png --recorte producto-rembg.png --salida capas/         (máscara = alfa del recorte)
//   node capas-sombra.mjs --sintetica --recorte producto.png --salida capas/ [--luz -0.4]      (inventa sombra de contacto + proyectada)
// Opciones: --formato webp|png|ambos (webp) · --calidad 88 · --umbral (ruido que no es sombra; 0.008 con plato, 0.025 sin él)
//           --sin-recortar · --fondo-prueba "#24303a" (color de la composición de prueba sobre otro fondo)
//   Sin plato (fondo estimado, APROXIMADO): --fondo-modelo cierre|polinomio · --radio-sombra 0.1 (½ del ancho de la sombra / lado mayor)
//           --zona-sombra m.png (blanco = donde puede haber sombra; borra la sombra falsa) · --alcance 0.3 (máx. distancia al producto)
// Salida: fondo.<fmt>, sombra.<fmt> (negro/tinte + alfa, mezcla normal), sombra-multiply.<fmt> (color exacto, mix-blend-mode: multiply),
//         producto.<fmt> (recortados a su caja, salvo fondo), capas.json (cajas en px y %), revisar-sombra.png (alfa en gris),
//         prueba-recomposicion.png (debe ser igual que la foto) y prueba-otro-fondo.png.
// Medido (pruebas/capas-sombra): con plato, error medio del alfa 0,008 y recomposición a 40,5 dB; sin plato, error 0,04
// y ~9 % del fondo con sombra falsa tenue → con fotos reales, consigue SIEMPRE el plato limpio (ver references/sombras.md).

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- ffmpeg y E/S de píxeles en bruto (RGBA 8 bits) ----------
function buscar(nombre) {
  const env = process.env[nombre.toUpperCase()];
  const exe = process.platform === 'win32' ? `${nombre}.exe` : nombre;
  const cand = [env, `C:/ffmpeg/bin/${exe}`, `C:/Program Files/ffmpeg/bin/${exe}`, '/usr/bin/' + nombre, '/opt/homebrew/bin/' + nombre].filter(Boolean);
  return cand.find((c) => existsSync(c)) || nombre; // si no, el del PATH
}
const FFMPEG = buscar('ffmpeg');
const FFPROBE = buscar('ffprobe');

export function leer(fichero, ancho, alto) {
  if (!existsSync(fichero)) throw new Error(`No existe ${fichero}`);
  let w = ancho, h = alto;
  if (!w) {
    const p = spawnSync(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', fichero], { encoding: 'utf8' });
    [w, h] = p.stdout.trim().split(',').map(Number);
    if (!w || !h) throw new Error(`No pude leer el tamaño de ${fichero}: ${p.stderr}`);
  }
  const r = spawnSync(FFMPEG, ['-v', 'error', '-i', fichero, '-vf', `scale=${w}:${h}:flags=lanczos`, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 1 << 30 });
  if (r.status !== 0 || r.stdout.length !== w * h * 4) throw new Error(`ffmpeg no pudo leer ${fichero}: ${r.stderr}`);
  return { w, h, d: new Uint8Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length) };
}

export function escribir(fichero, img, calidad = 88) {
  const webp = fichero.endsWith('.webp');
  const args = ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${img.w}x${img.h}`, '-i', '-'];
  if (webp) args.push('-c:v', 'libwebp', '-quality', String(calidad), '-pix_fmt', 'yuva420p', '-compression_level', '6');
  args.push('-frames:v', '1', fichero);
  const r = spawnSync(FFMPEG, args, { input: Buffer.from(img.d.buffer, img.d.byteOffset, img.d.length), maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`ffmpeg no pudo escribir ${fichero}: ${r.stderr}`);
}

// ---------- utilidades de imagen ----------
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

// desenfoque de caja separable, 3 pasadas ≈ gaussiano
export function desenfocar(src, w, h, radio) {
  const r = Math.max(1, Math.round(radio));
  let a = Float32Array.from(src), b = new Float32Array(src.length);
  const pasada = (ent, sal, horizontal) => {
    const n = horizontal ? w : h, m = horizontal ? h : w;
    for (let j = 0; j < m; j++) {
      const idx = (i) => (horizontal ? j * w + i : i * w + j);
      let suma = 0;
      for (let i = -r; i <= r; i++) suma += ent[idx(Math.min(n - 1, Math.max(0, i)))];
      for (let i = 0; i < n; i++) {
        sal[idx(i)] = suma / (2 * r + 1);
        suma += ent[idx(Math.min(n - 1, i + r + 1))] - ent[idx(Math.max(0, i - r))];
      }
    }
  };
  for (let k = 0; k < 3; k++) { pasada(a, b, true); pasada(b, a, false); }
  return a;
}

// máscara 0..1: alfa si la imagen lo tiene, si no luminancia (blanco = producto)
export function mascaraDe(img) {
  const n = img.w * img.h, m = new Float32Array(n);
  let hayAlfa = false;
  for (let i = 0; i < n; i++) if (img.d[i * 4 + 3] < 250) { hayAlfa = true; break; }
  for (let i = 0; i < n; i++) m[i] = hayAlfa ? img.d[i * 4 + 3] / 255 : lum(img.d[i * 4], img.d[i * 4 + 1], img.d[i * 4 + 2]) / 255;
  return m;
}

// Fondo estimado sin plato, método "cierre" (por defecto): a baja resolución, máximo y luego mínimo en una ventana de
// radio R (cierre morfológico). Rellena los valles oscuros más estrechos que 2R (la sombra) y conserva los degradados
// amplios de la luz (caída de un foco, viñeta). R ≈ la mitad del ancho de la sombra en su parte más estrecha.
export function estimarFondoCierre(foto, zonaProducto, radioRel = 0.1) {
  const { w, h, d } = foto;
  const k = Math.max(1, Math.ceil(Math.max(w, h) / 240));
  const lw = Math.ceil(w / k), lh = Math.ceil(h / k), ln = lw * lh;
  const canal = [new Float32Array(ln), new Float32Array(ln), new Float32Array(ln)];
  const valido = new Uint8Array(ln);
  for (let ly = 0; ly < lh; ly++) for (let lx = 0; lx < lw; lx++) {
    const s = [0, 0, 0]; let c = 0;
    for (let y = ly * k; y < Math.min(h, ly * k + k); y++) for (let x = lx * k; x < Math.min(w, lx * k + k); x++) {
      const i = y * w + x; if (zonaProducto[i] > 0.001) continue;
      s[0] += d[i * 4]; s[1] += d[i * 4 + 1]; s[2] += d[i * 4 + 2]; c++;
    }
    const j = ly * lw + lx;
    if (c > (k * k) / 4) { valido[j] = 1; for (let ch = 0; ch < 3; ch++) canal[ch][j] = s[ch] / c; }
  }
  const R = Math.max(2, Math.round((radioRel * Math.max(w, h)) / k));
  // máximo/mínimo separable ignorando celdas no válidas (las del producto); el criterio es la luminancia
  const L = new Float32Array(ln); for (let j = 0; j < ln; j++) L[j] = valido[j] ? lum(canal[0][j], canal[1][j], canal[2][j]) : NaN;
  const filtro = (ent, esMax) => {
    const peor = esMax ? -Infinity : Infinity, mejor = esMax ? Math.max : Math.min;
    const tmp = new Float32Array(ln), out = new Float32Array(ln);
    for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) {
      let v = peor; for (let t = Math.max(0, x - R); t <= Math.min(lw - 1, x + R); t++) { const e = ent[y * lw + t]; if (e === e) v = mejor(v, e); }
      tmp[y * lw + x] = v === peor ? NaN : v;
    }
    for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) {
      let v = peor; for (let t = Math.max(0, y - R); t <= Math.min(lh - 1, y + R); t++) { const e = tmp[t * lw + x]; if (e === e) v = mejor(v, e); }
      out[y * lw + x] = v === peor ? NaN : v;
    }
    return out;
  };
  const cerrado = filtro(filtro(L, true), false);
  // color: el de la foto escalado a la luminancia del cierre (conserva el tono del fondo)
  const ganancia = new Float32Array(ln), peso = new Float32Array(ln);
  for (let j = 0; j < ln; j++) if (valido[j] && cerrado[j] === cerrado[j]) { ganancia[j] = Math.max(1, cerrado[j] / Math.max(1, L[j])); peso[j] = 1; }
  const suave = (arr) => { const a = desenfocar(arr.map((v, j) => v * peso[j]), lw, lh, R / 3), b = desenfocar(peso, lw, lh, R / 3); return a.map((v, j) => (b[j] > 1e-3 ? v / b[j] : 0)); };
  // fondo a baja resolución = color medio local "sin sombra"
  const base = canal.map((cn) => suave(cn.map((v, j) => v * ganancia[j])));
  const out = { w, h, d: new Uint8Array(w * h * 4) };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const fx = Math.min(lw - 1.001, Math.max(0, (x + 0.5) / k - 0.5)), fy = Math.min(lh - 1.001, Math.max(0, (y + 0.5) / k - 0.5));
    const x0 = Math.floor(fx), y0 = Math.floor(fy), ax = fx - x0, ay = fy - y0;
    const i = (y * w + x) * 4;
    for (let ch = 0; ch < 3; ch++) {
      const b = base[ch];
      const v = (b[y0 * lw + x0] * (1 - ax) + b[y0 * lw + x0 + 1] * ax) * (1 - ay) + (b[(y0 + 1) * lw + x0] * (1 - ax) + b[(y0 + 1) * lw + x0 + 1] * ax) * ay;
      out.d[i + ch] = Math.max(0, Math.min(255, Math.round(v)));
    }
    out.d[i + 3] = 255;
  }
  return out;
}

// Fondo estimado, método "polinomio": grado 3 en (x,y) por canal, ajustado solo a píxeles de fondo y descartando en
// cada vuelta los más oscuros que el ajuste (sombras) y los muy brillantes. Bueno para fondos continuos muy uniformes.
export function estimarFondo(foto, zonaProducto) {
  const { w, h, d } = foto;
  const paso = Math.max(2, Math.floor(Math.sqrt((w * h) / 60000)));
  const base = (x, y) => { const u = (2 * x) / w - 1, v = (2 * y) / h - 1; return [1, u, v, u * u, u * v, v * v, u * u * u, u * u * v, u * v * v, v * v * v]; };
  const K = 10;
  const muestras = [];
  for (let y = 0; y < h; y += paso) for (let x = 0; x < w; x += paso) {
    const i = y * w + x;
    if (zonaProducto[i] > 0.001) continue;
    muestras.push({ f: base(x, y), c: [d[i * 4] / 255, d[i * 4 + 1] / 255, d[i * 4 + 2] / 255] });
  }
  if (muestras.length < 200) throw new Error('Casi no hay fondo visible para estimarlo: pasa --plato');
  let usar = muestras.map(() => true);
  let coef = [];
  const resolver = (A, bv) => { // Gauss con pivote parcial
    const n = bv.length, M = A.map((fila, i) => [...fila, bv[i]]);
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      if (Math.abs(M[c][c]) < 1e-12) continue;
      for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map((fila, i) => (Math.abs(fila[i]) < 1e-12 ? 0 : fila[n] / fila[i]));
  };
  for (let vuelta = 0; vuelta < 6; vuelta++) {
    coef = [0, 1, 2].map((ch) => {
      const A = Array.from({ length: K }, () => new Array(K).fill(0)), bv = new Array(K).fill(0);
      muestras.forEach((s, k) => { if (!usar[k]) return; for (let a = 0; a < K; a++) { bv[a] += s.f[a] * s.c[ch]; for (let b = 0; b < K; b++) A[a][b] += s.f[a] * s.f[b]; } });
      return resolver(A, bv);
    });
    const ev = (f, ch) => f.reduce((s, v, k) => s + v * coef[ch][k], 0);
    usar = muestras.map((s) => {
      const lf = lum(ev(s.f, 0), ev(s.f, 1), ev(s.f, 2)), lp = lum(...s.c);
      const ratio = lp / Math.max(1e-4, lf);
      return ratio > 0.985 && ratio < 1.08;
    });
  }
  const out = { w, h, d: new Uint8Array(w * h * 4) };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const f = base(x, y), i = (y * w + x) * 4;
    for (let ch = 0; ch < 3; ch++) out.d[i + ch] = Math.max(0, Math.min(255, Math.round(255 * f.reduce((s, v, k) => s + v * coef[ch][k], 0))));
    out.d[i + 3] = 255;
  }
  return out;
}

// rellena los valores de la zona tapada (debajo del producto) a partir de los de alrededor (convolución normalizada)
function rellenar(valores, tapado, w, h, radio) {
  const peso = new Float32Array(valores.length), vp = new Float32Array(valores.length);
  for (let i = 0; i < valores.length; i++) { peso[i] = 1 - tapado[i]; vp[i] = valores[i] * peso[i]; }
  let r = radio;
  const res = Float32Array.from(valores);
  let pendientes = true;
  for (let intento = 0; intento < 4 && pendientes; intento++, r *= 2.5) {
    const bp = desenfocar(peso, w, h, r), bv = desenfocar(vp, w, h, r);
    pendientes = false;
    for (let i = 0; i < res.length; i++) {
      if (tapado[i] <= 0) continue;
      if (bp[i] > 1e-3) res[i] = valores[i] * (1 - tapado[i]) + (bv[i] / bp[i]) * tapado[i];
      else pendientes = true;
    }
  }
  return res;
}

function caja(alfa, w, h, minimo = 0.004, margen = 2) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (alfa[y * w + x] > minimo) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return { x: 0, y: 0, w, h };
  x0 = Math.max(0, x0 - margen); y0 = Math.max(0, y0 - margen); x1 = Math.min(w - 1, x1 + margen); y1 = Math.min(h - 1, y1 + margen);
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
function recortarImg(img, c) {
  const out = { w: c.w, h: c.h, d: new Uint8Array(c.w * c.h * 4) };
  for (let y = 0; y < c.h; y++) out.d.set(img.d.subarray(((y + c.y) * img.w + c.x) * 4, ((y + c.y) * img.w + c.x + c.w) * 4), y * c.w * 4);
  return out;
}
// "a encima de b" (RGBA 8 bits, alfa normal)
export function componer(...capas) {
  const { w, h } = capas[0];
  const out = new Float32Array(w * h * 3);
  for (const c of capas) for (let i = 0; i < w * h; i++) {
    const a = c.d[i * 4 + 3] / 255;
    for (let ch = 0; ch < 3; ch++) out[i * 3 + ch] = out[i * 3 + ch] * (1 - a) + c.d[i * 4 + ch] * a;
  }
  const img = { w, h, d: new Uint8Array(w * h * 4) };
  for (let i = 0; i < w * h; i++) { for (let ch = 0; ch < 3; ch++) img.d[i * 4 + ch] = Math.round(out[i * 3 + ch]); img.d[i * 4 + 3] = 255; }
  return img;
}
export function psnr(a, b) {
  let s = 0; const n = a.w * a.h;
  for (let i = 0; i < n; i++) for (let ch = 0; ch < 3; ch++) { const e = a.d[i * 4 + ch] - b.d[i * 4 + ch]; s += e * e; }
  const mse = s / (n * 3);
  return mse === 0 ? 99 : 10 * Math.log10((255 * 255) / mse);
}
const hex = (s) => { const m = /^#?([0-9a-f]{6})$/i.exec(s); if (!m) throw new Error(`color no válido: ${s}`); const v = parseInt(m[1], 16); return [v >> 16, (v >> 8) & 255, v & 255]; };

// ---------- sombra extraída de la foto ----------
export function extraer({ foto, mascara, plato = null, umbral = 0.025, modeloFondo = 'cierre', radioSombra = 0.1, alcance = 0, zonaSombra = null }) {
  const { w, h } = foto, n = w * h, diag = Math.hypot(w, h);
  // zona "tapada": producto + 2-3 px de borde (sus píxeles mezclan producto y fondo)
  const ensanchada = desenfocar(mascara, w, h, Math.max(2, diag * 0.0015));
  const tapado = new Float32Array(n);
  for (let i = 0; i < n; i++) tapado[i] = Math.max(mascara[i], ensanchada[i] > 0.01 ? 1 : 0);
  const zona = desenfocar(tapado, w, h, diag * 0.01);
  const fondo = plato || (modeloFondo === 'polinomio' ? estimarFondo(foto, zona) : estimarFondoCierre(foto, zona, radioSombra));

  // alfa de la sombra fuera del producto
  const alfa = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const lf = lum(foto.d[i * 4], foto.d[i * 4 + 1], foto.d[i * 4 + 2]);
    const lb = Math.max(1, lum(fondo.d[i * 4], fondo.d[i * 4 + 1], fondo.d[i * 4 + 2]));
    const a = 1 - Math.min(1, lf / lb);
    alfa[i] = Math.max(0, (a - umbral) / (1 - umbral));
  }
  // alcance: la sombra solo puede estar cerca del producto (quita oscurecimientos lejanos del fondo estimado)
  if (zonaSombra) for (let i = 0; i < n; i++) alfa[i] *= zonaSombra[i];
  if (alcance > 0) {
    const cerca = desenfocar(tapado, w, h, alcance * diag * 0.5);
    for (let i = 0; i < n; i++) alfa[i] *= Math.min(1, cerca[i] / 0.03);
  }
  // capa "multiply": foto/fondo por canal (blanco = sin sombra). Exacta en color; se usa con mix-blend-mode: multiply
  const multiply = { w, h, d: new Uint8Array(n * 4) };
  for (let i = 0; i < n; i++) {
    const f = Math.min(1, alfa[i] * 8); // fuera de la sombra, blanco limpio (sin el ruido del fondo)
    for (let ch = 0; ch < 3; ch++) {
      const r = Math.min(1, foto.d[i * 4 + ch] / Math.max(1, fondo.d[i * 4 + ch]));
      multiply.d[i * 4 + ch] = tapado[i] > 0 ? 255 : Math.round(255 * (1 - f + f * r));
    }
    multiply.d[i * 4 + 3] = 255;
  }
  // debajo del producto no se ve: se rellena desde el borde (al moverse en parallax o levitar, esa zona asoma).
  // Ahí el suelo está tapado a la luz: como mínimo, la sombra fuerte de alrededor (p90 del anillo exterior) → contacto.
  const lejos = desenfocar(tapado, w, h, diag * 0.02), anillo = [];
  for (let i = 0; i < n; i++) if (!tapado[i] && lejos[i] > 0.02 && alfa[i] > 0.02) anillo.push(alfa[i]);
  anillo.sort((a, b) => a - b);
  const contacto = anillo.length ? 0.9 * anillo[Math.floor(anillo.length * 0.9)] : 0;
  const alfaLleno = rellenar(alfa, tapado, w, h, diag * 0.02);
  // solo donde está el producto (no en el anillo de borde, que se ve y saldría un contorno oscuro)
  for (let i = 0; i < n; i++) if (mascara[i] > 0) alfaLleno[i] = Math.max(alfaLleno[i], contacto * mascara[i]);

  // tinte de la sombra: color c tal que fondo·(1-a) + c·a = foto (media ponderada donde la sombra es clara)
  const t = [0, 0, 0]; let pt = 0;
  for (let i = 0; i < n; i++) {
    const a = alfa[i]; if (a < 0.15 || tapado[i] > 0) continue;
    for (let ch = 0; ch < 3; ch++) t[ch] += a * Math.max(0, Math.min(255, (foto.d[i * 4 + ch] - fondo.d[i * 4 + ch] * (1 - a)) / a));
    pt += a;
  }
  const tinte = pt > 0 ? t.map((v) => Math.round(v / pt)) : [0, 0, 0];

  const sombra = { w, h, d: new Uint8Array(n * 4) };
  for (let i = 0; i < n; i++) { sombra.d.set(tinte, i * 4); sombra.d[i * 4 + 3] = Math.round(255 * Math.min(1, alfaLleno[i])); }

  // producto con alfa = máscara y bordes sin el color del fondo (descontaminación)
  const producto = { w, h, d: new Uint8Array(n * 4) };
  for (let i = 0; i < n; i++) {
    const m = mascara[i];
    const a = alfaLleno[i];
    for (let ch = 0; ch < 3; ch++) {
      const detras = fondo.d[i * 4 + ch] * (1 - a) + tinte[ch] * a; // lo que se ve detrás del borde
      const c = m > 0.02 && m < 0.98 ? (foto.d[i * 4 + ch] - detras * (1 - m)) / m : foto.d[i * 4 + ch];
      producto.d[i * 4 + ch] = Math.max(0, Math.min(255, Math.round(c)));
    }
    producto.d[i * 4 + 3] = Math.round(255 * m);
  }
  return { fondo, sombra, producto, tinte, multiply, alfa };
}

// ---------- sombra sintética (producto sin sombra: generado, render, recorte de catálogo) ----------
export function sintetica({ mascara, w, h, luz = -0.4, intensidad = 1 }) {
  const diag = Math.hypot(w, h), n = w * h;
  const c = caja(mascara, w, h, 0.5, 0);
  const suelo = c.y + c.h - 1;
  // aplasta la silueta contra el suelo (factor) y la desplaza según la luz (luz<0: luz desde la izquierda → sombra a la derecha)
  const proyectar = (factor, desp) => {
    const out = new Float32Array(n);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const yo = suelo - (suelo - y) / factor;
      const xo = x + desp * (suelo - y) / factor;
      const xi = Math.round(xo), yi = Math.round(yo);
      if (yi >= 0 && yi < h && xi >= 0 && xi < w && y <= suelo + c.h * factor * 0.15) out[y * w + x] = mascara[yi * w + xi];
    }
    return out;
  };
  const contacto = desenfocar(proyectar(0.06, 0), w, h, diag * 0.004);
  // muestrear hacia el lado de la luz desplaza la sombra al lado contrario
  const proyectada = desenfocar(proyectar(0.28, luz * 1.2), w, h, diag * 0.018);
  const sombra = { w, h, d: new Uint8Array(n * 4) };
  for (let i = 0; i < n; i++) {
    const a = 1 - (1 - 0.75 * contacto[i]) * (1 - 0.38 * proyectada[i]);
    sombra.d[i * 4 + 3] = Math.round(255 * Math.min(1, a * intensidad));
  }
  return sombra;
}

// ---------- programa ----------
async function main() {
  const argv = process.argv.slice(2);
  const op = (k, d) => { const i = argv.indexOf(`--${k}`); return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
  const flag = (k) => argv.includes(`--${k}`);
  const salida = op('salida') && resolve(op('salida'));
  if (!salida || (!op('foto') && !flag('sintetica')) || (!op('mascara') && !op('recorte'))) {
    console.error('Uso: node capas-sombra.mjs --foto f.png (--mascara m.png | --recorte p.png) [--plato fondo.png] --salida dir\n' +
      '     node capas-sombra.mjs --sintetica --recorte p.png --salida dir [--luz -0.4]');
    process.exit(2);
  }
  mkdirSync(salida, { recursive: true });
  const formato = op('formato', 'webp');
  const exts = formato === 'ambos' ? ['webp', 'png'] : [formato];
  const calidad = Number(op('calidad', 88));
  const recortar = !flag('sin-recortar');
  const informe = { version: 1, capas: [] };
  const guardar = (nombre, img, recortable = true) => {
    const alfa = new Float32Array(img.w * img.h);
    for (let i = 0; i < alfa.length; i++) alfa[i] = img.d[i * 4 + 3] / 255;
    const c = recortar && recortable ? caja(alfa, img.w, img.h) : { x: 0, y: 0, w: img.w, h: img.h };
    const sub = c.w === img.w && c.h === img.h ? img : recortarImg(img, c);
    for (const e of exts) escribir(join(salida, `${nombre}.${e}`), sub, calidad);
    const pct = (v, t) => Number(((100 * v) / t).toFixed(3));
    informe.capas.push({ nombre, fichero: `${nombre}.${exts[0]}`, caja: c, cajaPct: { left: pct(c.x, img.w), top: pct(c.y, img.h), width: pct(c.w, img.w), height: pct(c.h, img.h) } });
  };

  if (flag('sintetica')) {
    const rec = leer(op('recorte') || op('mascara'));
    const masc = mascaraDe(rec);
    const sombra = sintetica({ mascara: masc, w: rec.w, h: rec.h, luz: Number(op('luz', -0.4)), intensidad: Number(op('intensidad', 1)) });
    informe.ancho = rec.w; informe.alto = rec.h; informe.modo = 'sintetica';
    guardar('sombra', sombra);
    const fp = hex(op('fondo-prueba', '#d9d2c7'));
    const lienzo = { w: rec.w, h: rec.h, d: new Uint8Array(rec.w * rec.h * 4) };
    for (let i = 0; i < rec.w * rec.h; i++) { lienzo.d.set(fp, i * 4); lienzo.d[i * 4 + 3] = 255; }
    escribir(join(salida, 'prueba-otro-fondo.png'), componer(lienzo, sombra, rec));
  } else {
    const foto = leer(op('foto'));
    const mImg = leer(op('mascara') || op('recorte'), foto.w, foto.h);
    const masc = mascaraDe(mImg);
    const plato = op('plato') ? leer(op('plato'), foto.w, foto.h) : null;
    const t0 = Date.now();
    // con plato limpio solo hay ruido de sensor; sin él, el fondo estimado tiene más error y hace falta más margen
    const { fondo, sombra, producto, tinte, multiply, alfa } = extraer({ foto, mascara: masc, plato, umbral: Number(op('umbral', plato ? 0.008 : 0.025)),
      modeloFondo: op('fondo-modelo', 'cierre'), radioSombra: Number(op('radio-sombra', 0.1)), alcance: Number(op('alcance', 0)),
      zonaSombra: op('zona-sombra') ? desenfocar(mascaraDe(leer(op('zona-sombra'), foto.w, foto.h)), foto.w, foto.h, 4) : null });
    informe.ancho = foto.w; informe.alto = foto.h; informe.modo = plato ? 'con-plato' : 'fondo-estimado';
    informe.tinteSombra = '#' + tinte.map((v) => v.toString(16).padStart(2, '0')).join('');
    guardar('fondo', fondo, false);
    guardar('sombra', sombra);
    guardar('producto', producto);
    // la multiply se recorta a la misma caja que la sombra (fuera es blanco = neutro en multiply)
    const cs = informe.capas.find((c) => c.nombre === 'sombra');
    const bordes = [cs.caja.x <= 2 && 'izquierdo', cs.caja.y <= 2 && 'superior', cs.caja.x + cs.caja.w >= foto.w - 2 && 'derecho', cs.caja.y + cs.caja.h >= foto.h - 2 && 'inferior'].filter(Boolean);
    if (bordes.length) {
      informe.avisos = [...(informe.avisos || []), `la sombra toca el borde ${bordes.join(' y ')}: no la escales ni la desplaces mucho (se vería el corte) o repite la foto con más margen`];
      console.warn('AVISO: ' + informe.avisos.at(-1));
    }
    for (const e of exts) escribir(join(salida, `sombra-multiply.${e}`), recortarImg(multiply, cs.caja), calidad);
    informe.capas.push({ ...cs, nombre: 'sombra-multiply', fichero: `sombra-multiply.${exts[0]}`, mezcla: 'multiply' });
    // revisión visual: alfa de la sombra en gris (blanco = sombra fuerte); lo que salga lejos del producto es falso
    const vis = { w: foto.w, h: foto.h, d: new Uint8Array(foto.w * foto.h * 4) };
    for (let i = 0; i < alfa.length; i++) { const v = Math.round(255 * Math.min(1, alfa[i] * 2)); vis.d.set([v, v, v, 255], i * 4); if (masc[i] > 0.5) vis.d.set([90, 40, 40], i * 4); }
    escribir(join(salida, 'revisar-sombra.png'), vis);
    const recomp = componer(fondo, sombra, producto);
    escribir(join(salida, 'prueba-recomposicion.png'), recomp);
    informe.psnrRecomposicion = Number(psnr(recomp, foto).toFixed(2));
    const fp = hex(op('fondo-prueba', '#24303a'));
    const lienzo = { w: foto.w, h: foto.h, d: new Uint8Array(foto.w * foto.h * 4) };
    for (let i = 0; i < foto.w * foto.h; i++) { lienzo.d.set(fp, i * 4); lienzo.d[i * 4 + 3] = 255; }
    escribir(join(salida, 'prueba-otro-fondo.png'), componer(lienzo, sombra, producto));
    console.log(`modo ${informe.modo} · tinte de sombra ${informe.tinteSombra} · recomposición vs foto: PSNR ${informe.psnrRecomposicion} dB (≥ 38 dB = indistinguible) · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  writeFileSync(join(salida, 'capas.json'), JSON.stringify(informe, null, 2));
  for (const c of informe.capas) console.log(`${c.fichero}: caja ${c.caja.w}x${c.caja.h} en (${c.caja.x},${c.caja.y}) → left ${c.cajaPct.left}% top ${c.cajaPct.top}% width ${c.cajaPct.width}%`);
  console.log(`capas.json listo en ${salida}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
