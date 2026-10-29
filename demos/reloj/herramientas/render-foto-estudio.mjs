// Renderiza la foto de estudio de prueba (foto, plato limpio y máscara) para validar capas-sombra.mjs.
// Uso (con `npm run dev` en marcha): node herramientas/render-foto-estudio.mjs <carpeta-salida>
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const salida = resolve(process.argv[2] || 'herramientas/_foto');
mkdirSync(salida, { recursive: true });
const W = 1600, H = 1200;
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('pageerror', (e) => console.log('[error]', e.message));
await page.goto(`http://127.0.0.1:5190/herramientas/render-foto-estudio.html?w=${W}&h=${H}`);
await page.waitForFunction(() => window.listo === true, null, { timeout: 120000 });
for (const pase of ['foto', 'plato', 'mascara']) {
  const url = await page.evaluate((p) => window.renderPase(p), pase);
  writeFileSync(join(salida, `${pase}.png`), Buffer.from(url.split(',')[1], 'base64'));
  console.log('listo', pase);
}
await browser.close();
