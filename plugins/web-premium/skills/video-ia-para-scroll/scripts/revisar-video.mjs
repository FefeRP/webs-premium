#!/usr/bin/env node
// Revisa si un vídeo (de Higgsfield, Kling, Veo, Luma… o del cliente) sirve para scroll-scrubbing.
// Mide la diferencia entre frames consecutivos (YDIF de ffmpeg signalstats) y detecta:
//  - cortes / saltos (picos aislados)       → el scrub "teletransporta"
//  - velocidad no constante                 → el scroll se siente a tirones o "se para"
//  - tramos muertos al principio o al final → recorta con --inicio/--fin al extraer
//  - parpadeo de luz (YAVG que oscila)      → flicker visible al arrastrar
// Además deja una hoja de contactos (PNG) para mirarla.
//
// Uso: node revisar-video.mjs <video> [--hoja hoja.png] [--json]
// Sin dependencias: Node >= 18 + ffmpeg/ffprobe.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve, dirname, basename, extname } from 'node:path';

function buscar(nombre) {
  const env = process.env[nombre.toUpperCase()];
  if (env && existsSync(env)) return env;
  const exe = process.platform === 'win32' ? `${nombre}.exe` : nombre;
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [nombre], { encoding: 'utf8' });
  if (r.status === 0) return r.stdout.split(/\r?\n/)[0].trim();
  for (const c of ['C:\\ffmpeg\\bin', 'C:\\Program Files\\ffmpeg\\bin', '/usr/bin', '/usr/local/bin', '/opt/homebrew/bin'])
    if (existsSync(join(c, exe))) return join(c, exe);
  throw new Error(`No encuentro ${nombre} (ponlo en PATH o en la variable ${nombre.toUpperCase()})`);
}

const argv = process.argv.slice(2);
const video = argv.find((a) => !a.startsWith('--'));
if (!video) { console.error('Uso: node revisar-video.mjs <video> [--hoja hoja.png] [--json]'); process.exit(2); }
const iHoja = argv.indexOf('--hoja');
const hoja = iHoja !== -1 ? resolve(argv[iHoja + 1]) : join(dirname(resolve(video)), basename(video, extname(video)) + '-hoja.png');
const comoJson = argv.includes('--json');
const ffmpeg = buscar('ffmpeg');
const ffprobe = buscar('ffprobe');

const p = JSON.parse(spawnSync(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
  'stream=width,height,r_frame_rate:format=duration', '-of', 'json', video], { encoding: 'utf8' }).stdout);
const [fn, fd] = p.streams[0].r_frame_rate.split('/').map(Number);
const info = { ancho: p.streams[0].width, alto: p.streams[0].height, fps: +(fn / (fd || 1)).toFixed(3), duracion: +Number(p.format.duration).toFixed(3) };

const r = spawnSync(ffmpeg, ['-hide_banner', '-i', video, '-vf', 'scale=320:-2,signalstats,metadata=print:file=-', '-an', '-f', 'null', '-'],
  { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const ydif = []; const yavg = [];
for (const l of r.stdout.split(/\r?\n/)) {
  let m = l.match(/lavfi\.signalstats\.YDIF=([\d.]+)/); if (m) ydif.push(Number(m[1]));
  m = l.match(/lavfi\.signalstats\.YAVG=([\d.]+)/); if (m) yavg.push(Number(m[1]));
}
if (ydif.length < 3) { console.error('No pude medir el vídeo:', r.stderr.slice(-800)); process.exit(1); }
const d = ydif.slice(1); // el primero siempre es 0

const media = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const mediana = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
// frames duplicados (diferencia ~0 en mitad del movimiento): el scrub avanza "a escalones"
const conMovimiento = d.filter((v) => v >= 0.1);
const med = conMovimiento.length ? mediana(conMovimiento) : 0;
const duplicados = med > 0.5 ? d.filter((v) => v < 0.1).length : 0;
const pctDuplicados = duplicados / d.length;
// cortes: pico local (≥3× la mediana de sus vecinos y claramente por encima)
const cortes = [];
d.forEach((v, i) => {
  const vec = d.slice(Math.max(0, i - 4), i).concat(d.slice(i + 1, i + 5)).filter((x) => x >= 0.1);
  if (!vec.length) return;
  const mv = mediana(vec);
  if (v > 3 * mv && v - mv > 5) cortes.push({ frame: i + 1, v });
});
// tramos muertos: frames con movimiento < 25 % de la mediana al principio/final
let muertoIni = 0; while (muertoIni < d.length && d[muertoIni] < 0.25 * med) muertoIni++;
let muertoFin = 0; while (muertoFin < d.length && d[d.length - 1 - muertoFin] < 0.25 * med) muertoFin++;
// constancia: coef. de variación del movimiento suavizado (ventana 5), sin tramos muertos, cortes ni duplicados
const esCorte = new Set(cortes.map((c) => c.frame - 1));
const util = d.slice(muertoIni, d.length - muertoFin).filter((v, k) => v >= 0.1 && !esCorte.has(k + muertoIni));
const suav = util.map((_, i) => media(util.slice(Math.max(0, i - 2), i + 3)));
const cv = suav.length > 2 ? Math.sqrt(media(suav.map((x) => (x - media(suav)) ** 2))) / (media(suav) || 1) : 0;
// acelerones: la velocidad suavizada se duplica (o se divide por 2) en ~6 frames
const acelerones = [];
for (let i = 3; i < suav.length - 3; i++) {
  const r = suav[i + 3] / (suav[i - 3] || 1e-6);
  if ((r > 2 || r < 0.5) && !acelerones.some((a) => Math.abs(a - (i + muertoIni)) < 8)) acelerones.push(i + muertoIni);
}
// parpadeo: oscilación de brillo frame a frame (no tendencia)
const dy = yavg.slice(1).map((v, i) => Math.abs(v - yavg[i]));
const parpadeo = mediana(dy);

const veredictos = [];
if (cortes.length) veredictos.push(`CORTES o saltos en frames ${cortes.map((c) => c.frame).join(', ')}: el scrub saltará. Regenera o usa solo el tramo sin cortes.`);
if (pctDuplicados > 0.1) veredictos.push(`FRAMES DUPLICADOS: ${(pctDuplicados * 100).toFixed(0)} % (vídeo ralentizado o a menos fps de los que dice): el scrub irá a escalones. Quítalos antes de extraer: ffmpeg -i v.mp4 -vf "mpdecimate,setpts=N/24/TB" -r 24 limpio.mp4 (o interpola).`);
if (acelerones.length) veredictos.push(`Cambios bruscos de velocidad hacia los frames ${acelerones.join(', ')}: el scroll "acelera" ahí. Recorta ese tramo, remapea el tiempo o regenera con "constant speed".`);
if (cv > 0.7) veredictos.push(`Velocidad MUY irregular (variación ${cv.toFixed(2)}): el scroll irá a tirones. Regenera pidiendo "constant speed" o remapea el tiempo.`);
else if (cv > 0.45) veredictos.push(`Velocidad algo irregular (variación ${cv.toFixed(2)}): aceptable; mejor si recortas los extremos.`);
if (muertoIni > 2 || muertoFin > 2) veredictos.push(`Tramos casi quietos: ${muertoIni} frames al inicio y ${muertoFin} al final → extrae con --inicio ${(muertoIni / info.fps).toFixed(2)} --fin ${((ydif.length - muertoFin) / info.fps).toFixed(2)}.`);
if (parpadeo > 1.2) veredictos.push(`Posible PARPADEO de luz (variación media de brillo ${parpadeo.toFixed(2)}/frame). Revisa la hoja; prueba ffmpeg -vf deflicker o regenera.`);
if (info.ancho < 1280 && info.alto < 1280) veredictos.push(`Resolución baja (${info.ancho}x${info.alto}): en escritorio se verá blando. Pide 1080p o reescala con IA antes.`);
const apto = !cortes.length && !acelerones.length && pctDuplicados <= 0.1 && cv <= 0.7;

// hoja de contactos: 12 frames repartidos
const n = ydif.length;
spawnSync(ffmpeg, ['-hide_banner', '-v', 'error', '-y', '-i', video, '-vf',
  `select='not(mod(n\\,${Math.max(1, Math.floor(n / 12))}))',scale=400:-2,tile=4x3:padding=4:color=white`, '-frames:v', '1', '-fps_mode', 'vfr', hoja]);

const res = { video: basename(video), ...info, frames: n, movimientoMediano: +med.toFixed(2), variacionVelocidad: +cv.toFixed(3),
  cortes: cortes.map((c) => c.frame), acelerones, framesDuplicados: duplicados, quietoInicio: muertoIni, quietoFinal: muertoFin, parpadeo: +parpadeo.toFixed(2), apto, veredictos, hoja };
if (comoJson) console.log(JSON.stringify(res, null, 2));
else {
  console.log(`${res.video}: ${info.ancho}x${info.alto}, ${info.fps} fps, ${info.duracion} s, ${n} frames`);
  console.log(`movimiento mediano ${res.movimientoMediano} · variación de velocidad ${res.variacionVelocidad} · parpadeo ${res.parpadeo}`);
  console.log(apto ? 'APTO para scroll-scrubbing.' : 'NO APTO tal cual.');
  for (const v of veredictos) console.log(' - ' + v);
  console.log(`hoja de contactos: ${hoja}`);
}
