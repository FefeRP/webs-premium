#!/usr/bin/env node
// Convierte un vídeo en una secuencia de frames lista para scroll-scrubbing.
// Sin dependencias: solo Node >= 18 y ffmpeg/ffprobe (en PATH, en FFMPEG/FFPROBE o junto a este script).
//
// Uso:
//   node extraer-frames.mjs <video> <carpeta-salida> [opciones]
//
// Opciones:
//   --frames N          frames totales (por defecto 120). Alternativa: --fps N
//   --inicio S --fin S  recorta el vídeo (segundos)
//   --ancho N           ancho escritorio (por defecto 1920; nunca escala hacia arriba)
//   --ancho-movil N     ancho móvil (por defecto 720; 0 = sin variante móvil)
//   --recorte-movil R   "centro" (recorta a 9:16 desde el centro) | "no" (escala el encuadre entero). Por defecto centro
//                       si el vídeo es horizontal; "x=0.6" desplaza el centro del recorte (0 = izquierda, 1 = derecha)
//   --formato F         webp (por defecto) | avif | ambos
//   --calidad Q         calidad WebP 0-100 (por defecto 72). AVIF usa --crf (por defecto 34)
//   --video-scrub       además genera un MP4 "para buscar" (GOP denso) por si se prefiere <video> + currentTime
//
// Salida:
//   <salida>/escritorio/0001.webp ... , <salida>/movil/0001.webp ...
//   <salida>/poster-escritorio.webp, <salida>/poster-movil.webp  (primer frame, para LCP y reduced-motion)
//   <salida>/manifest.json  (lo lee frame-scrubber.js)

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const aqui = dirname(fileURLToPath(import.meta.url));

function args(argv) {
  const pos = [];
  const op = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const sig = argv[i + 1];
      if (sig === undefined || sig.startsWith('--')) op[k] = true;
      else { op[k] = sig; i++; }
    } else pos.push(a);
  }
  return { pos, op };
}

function buscarBinario(nombre) {
  const env = process.env[nombre.toUpperCase()];
  if (env && existsSync(env)) return env;
  const exe = process.platform === 'win32' ? `${nombre}.exe` : nombre;
  const local = join(aqui, exe);
  if (existsSync(local)) return local;
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [nombre], { encoding: 'utf8' });
  if (r.status === 0) return r.stdout.split(/\r?\n/)[0].trim();
  const comunes = ['C:\\ffmpeg\\bin', 'C:\\Program Files\\ffmpeg\\bin', '/usr/bin', '/usr/local/bin', '/opt/homebrew/bin'];
  for (const c of comunes) if (existsSync(join(c, exe))) return join(c, exe);
  throw new Error(`No encuentro ${nombre}. Instálalo o pon su ruta en la variable ${nombre.toUpperCase()}.`);
}

function ejecutar(bin, argumentos) {
  return new Promise((ok, mal) => {
    const p = spawn(bin, argumentos, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err += d; if (err.length > 20000) err = err.slice(-20000); });
    p.on('close', (c) => (c === 0 ? ok() : mal(new Error(`${basename(bin)} salió con ${c}:\n${err.slice(-2000)}`))));
  });
}

function sondear(ffprobe, video) {
  const r = spawnSync(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=width,height,r_frame_rate,nb_frames:format=duration', '-of', 'json', video], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffprobe no puede leer el vídeo: ${r.stderr}`);
  const j = JSON.parse(r.stdout);
  const s = j.streams[0];
  const [n, d] = s.r_frame_rate.split('/').map(Number);
  return { ancho: s.width, alto: s.height, fps: n / (d || 1), duracion: Number(j.format.duration) };
}

function pesoCarpeta(dir, ext) {
  return readdirSync(dir).filter((f) => f.endsWith(ext)).reduce((t, f) => t + statSync(join(dir, f)).size, 0);
}

async function enParalelo(tareas, n) {
  let i = 0;
  const trabajadores = Array.from({ length: n }, async () => {
    while (i < tareas.length) { const t = tareas[i++]; await t(); }
  });
  await Promise.all(trabajadores);
}

async function main() {
  const { pos, op } = args(process.argv.slice(2));
  if (pos.length < 2) {
    console.error('Uso: node extraer-frames.mjs <video> <carpeta-salida> [--frames 120] [--ancho 1920] [--ancho-movil 720] [--formato webp|avif|ambos] [--calidad 72] [--inicio s] [--fin s] [--recorte-movil centro|no|x=0.5] [--video-scrub]');
    process.exit(2);
  }
  const video = resolve(pos[0]);
  const salida = resolve(pos[1]);
  if (!existsSync(video)) throw new Error(`No existe ${video}`);
  const ffmpeg = buscarBinario('ffmpeg');
  const ffprobe = buscarBinario('ffprobe');
  const info = sondear(ffprobe, video);

  const inicio = Number(op.inicio ?? 0);
  const fin = Math.min(Number(op.fin ?? info.duracion), info.duracion);
  const tramo = fin - inicio;
  if (!(tramo > 0)) throw new Error('El tramo --inicio/--fin está vacío');

  let fps;
  if (op.fps) fps = Number(op.fps);
  else fps = Number(op.frames ?? 120) / tramo;
  fps = Math.min(fps, info.fps); // no inventamos frames: para más, interpola antes (ver references)

  const ancho = Math.min(Number(op.ancho ?? 1920), info.ancho);
  const anchoMovil = Number(op['ancho-movil'] ?? 720);
  const formato = String(op.formato ?? 'webp');
  const calidad = Number(op.calidad ?? 72);
  const crf = Number(op.crf ?? 34);
  const horizontal = info.ancho > info.alto;
  const recorte = String(op['recorte-movil'] ?? (horizontal ? 'centro' : 'no'));

  const recorteFiltro = (() => {
    if (recorte === 'no') return null;
    if (recorte !== 'centro' && !/^x=(0(\.\d+)?|1(\.0+)?)$/.test(recorte))
      throw new Error(`--recorte-movil no válido: "${recorte}" (usa centro, no o x=0..1, p. ej. x=0.3)`);
    const x = recorte.startsWith('x=') ? Number(recorte.slice(2)) : 0.5;
    // 9:16 a partir del alto; si el vídeo ya es más estrecho que 9:16, no recorta
    return `crop='min(iw,ih*9/16)':ih:'(iw-min(iw,ih*9/16))*${x}':0`;
  })();

  mkdirSync(salida, { recursive: true });
  const variantes = [{ nombre: 'escritorio', filtros: [`scale=${ancho}:-2:flags=lanczos`] }];
  if (anchoMovil > 0) {
    const f = [];
    if (recorteFiltro) f.push(recorteFiltro);
    f.push(`scale='min(${anchoMovil},iw)':-2:flags=lanczos`);
    variantes.push({ nombre: 'movil', filtros: f });
  }
  const formatos = formato === 'ambos' ? ['webp', 'avif'] : [formato];
  const recortarEntrada = ['-ss', String(inicio), '-t', String(tramo)];
  const manifest = {
    version: 1,
    generado: new Date().toISOString(),
    fuente: basename(video),
    frames: 0,
    fps: Number(fps.toFixed(4)),
    pad: 4,
    formatos,
    variantes: {},
  };

  const hilos = Math.max(1, Math.min(8, os.cpus().length));

  for (const v of variantes) {
    const dir = join(salida, v.nombre);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const vf = [`fps=${fps}`, ...v.filtros, 'format=yuv420p'].join(',');

    if (formatos.includes('webp')) {
      await ejecutar(ffmpeg, ['-hide_banner', '-y', ...recortarEntrada, '-i', video, '-vf', vf,
        '-c:v', 'libwebp', '-quality', String(calidad), '-compression_level', '5', '-preset', 'picture',
        '-start_number', '1', join(dir, '%04d.webp')]);
    }
    if (formatos.includes('avif')) {
      // AVIF: primero PNG sin pérdida y luego cada frame con el muxer avif (still-picture)
      const tmp = join(salida, `_png-${v.nombre}`);
      rmSync(tmp, { recursive: true, force: true });
      mkdirSync(tmp, { recursive: true });
      await ejecutar(ffmpeg, ['-hide_banner', '-y', ...recortarEntrada, '-i', video, '-vf', vf.replace(',format=yuv420p', ''),
        '-start_number', '1', join(tmp, '%04d.png')]);
      const pngs = readdirSync(tmp).filter((f) => f.endsWith('.png')).sort();
      await enParalelo(pngs.map((f) => () => ejecutar(ffmpeg, ['-hide_banner', '-y', '-i', join(tmp, f),
        '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', String(crf), '-cpu-used', '6', '-pix_fmt', 'yuv420p',
        join(dir, f.replace('.png', '.avif'))])), hilos);
      rmSync(tmp, { recursive: true, force: true });
    }

    const ficheros = readdirSync(dir).filter((f) => f.endsWith(`.${formatos[0]}`)).sort();
    if (!ficheros.length) throw new Error(`No se generó ningún frame en ${dir}`);
    const dims = sondear(ffprobe, join(dir, ficheros[0]));
    copyFileSync(join(dir, ficheros[0]), join(salida, `poster-${v.nombre}.${formatos[0]}`));
    // Todas las variantes deben tener los mismos frames: el visor usa un único total para cualquiera.
    if (manifest.frames && manifest.frames !== ficheros.length)
      throw new Error(`${v.nombre} tiene ${ficheros.length} frames y la variante anterior ${manifest.frames}: revisa los filtros`);
    manifest.frames = ficheros.length;
    const bytes = {};
    for (const fmt of formatos) bytes[fmt] = pesoCarpeta(dir, `.${fmt}`);
    manifest.variantes[v.nombre] = {
      ancho: dims.ancho,
      alto: dims.alto,
      ruta: `${v.nombre}/{i}.{ext}`,
      poster: `poster-${v.nombre}.${formatos[0]}`,
      bytes,
    };
    const resumen = formatos.map((fmt) => `${fmt} ${(bytes[fmt] / 1048576).toFixed(1)} MB (${(bytes[fmt] / ficheros.length / 1024).toFixed(0)} KB/frame)`).join(' · ');
    console.log(`${v.nombre}: ${ficheros.length} frames de ${dims.ancho}x${dims.alto} · ${resumen}`);
  }

  if (op['video-scrub']) {
    // MP4 "para buscar": todos los frames clave cada 4-8 (seek barato). Lección tomada de scroll-craft (MIT).
    const out = join(salida, 'scrub-escritorio.mp4');
    await ejecutar(ffmpeg, ['-hide_banner', '-y', ...recortarEntrada, '-i', video, '-an',
      '-vf', `scale=${ancho}:-2:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-profile:v', 'high',
      '-preset', 'slow', '-crf', '20', '-g', '8', '-keyint_min', '8', '-sc_threshold', '0', '-movflags', '+faststart', out]);
    manifest.videoScrub = { escritorio: 'scrub-escritorio.mp4' };
    if (anchoMovil > 0) {
      const outM = join(salida, 'scrub-movil.mp4');
      const fM = [recorteFiltro, `scale='min(${anchoMovil},iw)':-2:flags=lanczos`, 'format=yuv420p'].filter(Boolean).join(',');
      await ejecutar(ffmpeg, ['-hide_banner', '-y', ...recortarEntrada, '-i', video, '-an', '-vf', fM,
        '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '24', '-g', '4', '-keyint_min', '4',
        '-sc_threshold', '0', '-movflags', '+faststart', outM]);
      manifest.videoScrub.movil = 'scrub-movil.mp4';
    }
    console.log('video-scrub: generado');
  }

  writeFileSync(join(salida, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`manifest.json listo en ${salida}`);
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
