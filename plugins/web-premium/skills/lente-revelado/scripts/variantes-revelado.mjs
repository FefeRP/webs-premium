#!/usr/bin/env node
// variantes-revelado.mjs: saca de UNA imagen sus variantes "rayos X" y "térmica", alineadas píxel a píxel,
// para la lente que sigue al cursor (lente-revelado.js). Sin IA y sin coste: solo ffmpeg.
//
//   node variantes-revelado.mjs --entrada producto.png --salida public/revelado [--modos rayosx,termica]
//        [--invertir] [--paleta turbo] [--calidad 82]
//
// - Si la entrada tiene alfa (producto recortado), las variantes conservan ese alfa: fuera del producto, transparente.
// - Salida: <modo>.png y <modo>.webp (+ base.webp) con el MISMO tamaño que la entrada. Si no casan, la lente "tiembla".
// - Esto da un rayos X "de estilo" (bordes y densidad del propio exterior). Si el interior tiene que ENSEÑAR algo
//   que no se ve por fuera (la miga del cruasán, el mecanismo del reloj), hay que generarlo: edición por referencia
//   sobre la misma imagen (ver references/activos-ia.md) y comprobar la alineación con --comprobar.
//
//   node variantes-revelado.mjs --comprobar base.png variante.png   → diferencia de silueta (alfa) entre las dos

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const argv = process.argv.slice(2);
const op = (k, def) => { const i = argv.indexOf(`--${k}`); return i !== -1 ? argv[i + 1] : def; };
const tiene = (k) => argv.includes(`--${k}`);

// Orden: variable FFMPEG / FFPROBE (ruta del ejecutable) → PATH → carpetas habituales.
function buscarBinario(nombre) {
  const env = process.env[nombre.toUpperCase()];
  if (env && existsSync(env)) return env;
  const r = spawnSync(nombre, ['-version'], { encoding: 'utf8' });
  if (!r.error) return nombre;
  const exe = process.platform === 'win32' ? `${nombre}.exe` : nombre;
  const h = ['C:\\ffmpeg\\bin', 'C:\\Program Files\\ffmpeg\\bin', '/usr/local/bin', '/opt/homebrew/bin'].map((d) => join(d, exe)).find(existsSync);
  if (!h) { console.error(`No encuentro ${nombre}. Instálalo, ponlo en el PATH o pon su ruta en la variable ${nombre.toUpperCase()}.`); process.exit(1); }
  return h;
}
const FFMPEG = buscarBinario('ffmpeg');
const FFPROBE = buscarBinario('ffprobe');

function ff(args) {
  const r = spawnSync(FFMPEG, ['-v', 'error', '-y', ...args], { encoding: 'utf8' });
  if (r.status !== 0) { console.error(r.stderr || r.error); process.exit(1); }
}
function info(f) {
  const r = spawnSync(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,pix_fmt',
    '-of', 'csv=p=0', f], { encoding: 'utf8' });
  const [w, h, fmt] = r.stdout.trim().split(',');
  return { w: +w, h: +h, alfa: /rgba|bgra|argb|abgr|^ya|gbrap|yuva|pal8/.test(fmt || '') };
}

// --- Comprobar alineación de dos imágenes (p. ej. una variante hecha con IA) ---
if (tiene('comprobar')) {
  const i = argv.indexOf('--comprobar');
  const [a, b] = [argv[i + 1], argv[i + 2]];
  if (!a || !b || !existsSync(a) || !existsSync(b)) { console.error('Uso: node variantes-revelado.mjs --comprobar base.png variante.png'); process.exit(2); }
  const ia = info(a), ib = info(b);
  if (ia.w !== ib.w || ia.h !== ib.h) { console.log(`TAMAÑO DISTINTO: ${ia.w}x${ia.h} frente a ${ib.w}x${ib.h}. No sirve: reescala o regenera.`); process.exit(1); }
  // Compara las siluetas: alfa si lo hay; si no, la luminancia umbralizada (producto sobre fondo oscuro).
  const sil = (f, inf) => inf.alfa ? `[${f}]alphaextract,format=gray` : `[${f}]format=gray,lut=y='if(gt(val,24),255,0)'`;
  const r = spawnSync(FFMPEG, ['-v', 'info', '-i', a, '-i', b, '-filter_complex',
    `${sil(0, ia)}[x];${sil(1, ib)}[y];[x][y]blend=all_mode=difference,format=gray,signalstats,metadata=print:key=lavfi.signalstats.YAVG`,
    '-f', 'null', '-'], { encoding: 'utf8' });
  const m = /YAVG=([\d.]+)/.exec(r.stderr || '');
  const pct = m ? (Number(m[1]) / 255) * 100 : NaN;
  console.log(`Píxeles de silueta que no coinciden: ${pct.toFixed(2)} %  (≤ 0,5 % bien · 0,5-2 % revisa bordes · > 2 % desalineada)`);
  process.exit(pct > 2 ? 1 : 0);
}

const entrada = op('entrada');
const salida = resolve(op('salida', 'revelado'));
if (!entrada || !existsSync(entrada)) {
  console.error('Uso: node variantes-revelado.mjs --entrada producto.png --salida carpeta [--modos rayosx,termica] [--invertir] [--paleta turbo]');
  process.exit(2);
}
const modos = op('modos', 'rayosx,termica').split(',').map((s) => s.trim()).filter(Boolean);
const paleta = op('paleta', 'turbo');          // pseudocolor de ffmpeg: turbo, inferno, magma, heat, fiery…
const calidad = op('calidad', '82');
const { w, h, alfa } = info(entrada);
mkdirSync(salida, { recursive: true });

// Rayos X: gris con contraste + bordes (edgedetect) + tinte azul-cian + halo suave (gblur en modo screen).
// --invertir: lo oscuro pasa a claro (más "radiografía" en objetos claros; en objetos oscuros, mejor sin invertir).
const rayosx = (src) =>
  `${src}format=gray,eq=contrast=1.35:brightness=0.03${tiene('invertir') ? ',negate' : ''},split[g][e];` +
  `[e]edgedetect=low=0.06:high=0.2[ed];[g][ed]blend=all_mode=screen,format=gbrp,` +
  `colorchannelmixer=rr=0.28:rg=0:rb=0:gr=0:gg=0.66:gb=0:br=0:bg=0:bb=1,split[t1][t2];` +
  `[t2]gblur=sigma=${Math.max(2, Math.round(w / 300))}[gl];[t1][gl]blend=all_mode=screen`;
// Térmica: luminancia suavizada → paleta de calor. Lo claro es "caliente".
const termica = (src) => `${src}format=gray,gblur=sigma=${Math.max(2, Math.round(w / 200))},format=gbrp,pseudocolor=p=${paleta}`;
const recetas = { rayosx, termica };

for (const modo of modos) {
  if (!recetas[modo]) { console.warn(`modo desconocido: ${modo} (usa rayosx, termica)`); continue; }
  const grafo = alfa
    ? `[0]format=rgba,split[c][a];[a]alphaextract[al];${recetas[modo]('[c]')}[v];[v]format=rgba[v2];[v2][al]alphamerge`
    : recetas[modo]('[0]');
  const png = join(salida, `${modo}.png`);
  ff(['-i', entrada, '-filter_complex', grafo, '-frames:v', '1', png]);
  ff(['-i', png, '-c:v', 'libwebp', '-quality', calidad, '-frames:v', '1', join(salida, `${modo}.webp`)]);
  const i2 = info(png);
  console.log(`${modo}: ${png} (${i2.w}x${i2.h}${alfa ? ', con alfa' : ''})${i2.w !== w || i2.h !== h ? '  ¡TAMAÑO DISTINTO!' : ''}`);
}
ff(['-i', entrada, '-c:v', 'libwebp', '-quality', calidad, '-frames:v', '1', join(salida, 'base.webp')]);
console.log(`base: ${join(salida, 'base.webp')} (${w}x${h})`);
