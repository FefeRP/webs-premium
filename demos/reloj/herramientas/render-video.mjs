// Renderiza el vídeo de producto de la demo con three.js en Chrome headless y lo codifica con ffmpeg.
// Sustituye al vídeo que se pediría a Higgsfield (mismo tipo de plano). Uso: node herramientas/render-video.mjs
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const N = Number(process.env.N || 144);           // 6 s a 24 fps
const W = 1920, H = 1080;
const tmp = join(process.cwd(), 'herramientas', '_png');
rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[error]', e.message));
await page.goto(`http://127.0.0.1:5190/herramientas/render-video.html?w=${W}&h=${H}`);
await page.waitForFunction(() => window.listo === true, null, { timeout: 120000 });
const t0 = Date.now();
for (let i = 0; i < N; i++) {
  const url = await page.evaluate((t) => window.renderFrame(t), i / (N - 1));
  writeFileSync(join(tmp, String(i + 1).padStart(4, '0') + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  if (i % 24 === 0) console.log(`frame ${i + 1}/${N} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
await browser.close();
const ff = process.env.FFMPEG || 'ffmpeg'; // ruta de ffmpeg en la variable FFMPEG, o el del PATH
const out = join(process.cwd(), 'fuente', 'reloj-orbita.mp4');
mkdirSync(join(process.cwd(), 'fuente'), { recursive: true });
const r = spawnSync(ff, ['-y', '-hide_banner', '-framerate', '24', '-i', join(tmp, '%04d.png'), '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', out], { stdio: 'inherit' });
if (r.status !== 0) process.exit(1);
rmSync(tmp, { recursive: true, force: true });
console.log('vídeo listo:', out);
