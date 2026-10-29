#!/usr/bin/env node
// Verifica una web con scroll: capturas en N posiciones (escritorio y móvil), una pasada con reduced-motion,
// errores de consola, peticiones fallidas, peso transferido y hojas de contactos.
// Uso: node verificar-scroll.mjs <url> <carpeta-salida> [--posiciones 8] [--espera 700] [--chrome ruta] [--tramos "#secuencia"]
//   --tramos: selectores de secciones fijadas (pin); captura 5 puntos dentro de cada una y hace su hoja (hoja-<pasada>-tramos.png)
// Necesita playwright-core (o playwright) en el proyecto: npm i -D playwright-core. Usa el Chrome instalado.

import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const [url, salidaArg] = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));
const op = (k, d) => { const i = argv.indexOf(`--${k}`); return i !== -1 ? argv[i + 1] : d; };
if (!url || !salidaArg) { console.error('Uso: node verificar-scroll.mjs <url> <carpeta> [--posiciones 8] [--espera 700]'); process.exit(2); }
const salida = resolve(salidaArg);
mkdirSync(salida, { recursive: true });
const N = Number(op('posiciones', 8));
const espera = Number(op('espera', 700));
const tramos = (op('tramos', '') || '').split(',').map((s) => s.trim()).filter(Boolean);

const req = createRequire(join(process.cwd(), 'noop.js'));
let chromium;
for (const m of ['playwright-core', 'playwright']) { try { ({ chromium } = req(m)); break; } catch {} }
if (!chromium) { console.error('Falta playwright-core en este proyecto: npm i -D playwright-core'); process.exit(1); }

const candidatos = [op('chrome'), process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
const exe = candidatos.find((c) => existsSync(c));
const navegador = await chromium.launch(exe ? { executablePath: exe } : {});

const informe = { url, fecha: new Date().toISOString(), pasadas: [] };
const pasadas = [
  { nombre: 'escritorio', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { nombre: 'movil', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { nombre: 'menos-movimiento', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce', posiciones: 4 },
];

for (const p of pasadas) {
  const ctx = await navegador.newContext({ viewport: p.viewport, deviceScaleFactor: p.deviceScaleFactor, isMobile: p.isMobile, hasTouch: p.hasTouch, reducedMotion: p.reducedMotion });
  const page = await ctx.newPage();
  const r = { nombre: p.nombre, errores: [], fallidas: [], bytes: 0, capturas: [] };
  // con la URL: "Failed to load resource: 404" sin decir cuál no sirve (p. ej. /favicon.ico, que no pasa por 'response')
  // el favicon que falta no es un fallo de la web (el navegador lo pide solo)
  const ruido = (t) => /favicon\.ico/.test(t);
  page.on('console', (m) => { if (m.type() === 'error') { const u = m.location()?.url; if (!ruido(m.text() + ' ' + (u || ''))) r.errores.push(m.text() + (u ? ` [${u}]` : '')); } });
  page.on('pageerror', (e) => r.errores.push(e.message));
  page.on('response', async (res) => {
    if (res.status() >= 400 && !ruido(res.url())) r.fallidas.push(`${res.status()} ${res.url()}`);
    const len = Number(res.headers()['content-length'] || 0);
    r.bytes += len;
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(1500);
  const alto = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const n = p.posiciones ?? N;
  for (let i = 0; i < n; i++) {
    const y = Math.round((alto * i) / Math.max(1, n - 1));
    await page.evaluate((yy) => (window.lenis ? window.lenis.scrollTo(yy, { immediate: true }) : window.scrollTo(0, yy)), y);
    await page.waitForTimeout(espera);
    const f = join(salida, `${p.nombre}-${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: f });
    r.capturas.push(f);
  }
  // Tramos fijados (pin): las N posiciones equiespaciadas pueden caer siempre en el mismo punto del tramo
  // (p. ej. justo entre dos textos sincronizados). --tramos "#secuencia,#otra" captura 5 puntos dentro de cada uno.
  if (tramos.length && !p.reducedMotion) {
    r.tramos = [];
    for (const [t, sel] of tramos.entries()) {
      const rango = await page.evaluate((s) => {
        const el = document.querySelector(s); if (!el) return null;
        const caja = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
        const ini = caja.getBoundingClientRect().top + scrollY;
        return [ini, ini + Math.max(0, caja.offsetHeight - innerHeight)];
      }, sel);
      if (!rango) { r.errores.push(`--tramos: no existe ${sel}`); continue; }
      for (const [k, q] of [0.1, 0.3, 0.5, 0.7, 0.9].entries()) {
        const y = Math.round(rango[0] + q * (rango[1] - rango[0]));
        await page.evaluate((yy) => (window.lenis ? window.lenis.scrollTo(yy, { immediate: true }) : window.scrollTo(0, yy)), y);
        await page.waitForTimeout(espera);
        const f = join(salida, `${p.nombre}-tramo${t + 1}-${k + 1}.png`);
        await page.screenshot({ path: f });
        r.tramos.push(f);
      }
    }
  }
  informe.pasadas.push(r);
  await ctx.close();
}
await navegador.close();

// hojas de contactos con ffmpeg (si está)
const ff = [process.env.FFMPEG, 'C:/ffmpeg/bin/ffmpeg.exe', 'ffmpeg'].filter(Boolean).find((c) => c === 'ffmpeg' || existsSync(c));
for (const r of informe.pasadas) {
  const cols = r.nombre === 'movil' ? Math.min(8, r.capturas.length) : Math.min(4, r.capturas.length);
  const filas = Math.ceil(r.capturas.length / cols);
  const ancho = r.nombre === 'movil' ? 260 : 480;
  const hoja = join(salida, `hoja-${r.nombre}.png`);
  const s = spawnSync(ff, ['-v', 'error', '-y', '-framerate', '1', '-i', join(salida, `${r.nombre}-%02d.png`),
    '-vf', `scale=${ancho}:-2,tile=${cols}x${filas}:padding=6:color=white`, '-frames:v', '1', hoja]);
  if (s.status === 0) r.hoja = hoja;
  if (r.tramos?.length) {
    const hojaT = join(salida, `hoja-${r.nombre}-tramos.png`);
    // ffmpeg no admite dos contadores en un patrón de nombres: se pasan las capturas como entradas sueltas
    const entradas = r.tramos.flatMap((f) => ['-i', f]);
    const n = r.tramos.length, colsT = Math.min(5, n), filasT = Math.ceil(n / colsT);
    const filtro = r.tramos.map((_, i) => `[${i}]scale=${ancho}:-2[e${i}]`).join(';') + ';' +
      r.tramos.map((_, i) => `[e${i}]`).join('') + `concat=n=${n}:v=1:a=0,tile=${colsT}x${filasT}:padding=6:color=white`;
    const s2 = spawnSync(ff, ['-v', 'error', '-y', ...entradas, '-filter_complex', filtro, '-frames:v', '1', hojaT]);
    if (s2.status === 0) r.hojaTramos = hojaT;
  }
}

writeFileSync(join(salida, 'informe.json'), JSON.stringify(informe, null, 2));
for (const r of informe.pasadas) {
  console.log(`${r.nombre}: ${r.capturas.length} capturas, ${(r.bytes / 1048576).toFixed(1)} MB transferidos (aprox.), ${r.errores.length} errores, ${r.fallidas.length} peticiones fallidas${r.hoja ? `, hoja ${r.hoja}` : ''}${r.hojaTramos ? `, tramos ${r.hojaTramos}` : ''}`);
  for (const e of r.errores.slice(0, 5)) console.log('   error: ' + e);
  for (const e of r.fallidas.slice(0, 5)) console.log('   fallida: ' + e);
}
const mal = informe.pasadas.some((r) => r.errores.length || r.fallidas.length);
process.exit(mal ? 1 : 0);
