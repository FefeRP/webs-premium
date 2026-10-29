// Prueba de interacción de la página (lo que verificar-scroll no hace: cursor, clic, dedo).
// Uso (desde demos/reloj, donde está playwright-core):
//   node ../../pruebas/lente-envase/probar-interaccion.mjs http://127.0.0.1:5193/pruebas/lente-envase/ ../../capturas/prueba-lente-envase
import { mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [url, salidaArg] = process.argv.slice(2);
const salida = resolve(salidaArg); mkdirSync(salida, { recursive: true });
const pw = await import(pathToFileURL(resolve('node_modules/playwright-core/index.mjs')).href);
const chrome = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'].find(existsSync);
const nav = await pw.chromium.launch({ executablePath: chrome });
const fallos = [];
const ok = (cond, msg) => { console.log(`${cond ? 'OK ' : 'MAL'} ${msg}`); if (!cond) fallos.push(msg); };

async function pagina(opts) {
  const ctx = await nav.newContext(opts);
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('pageerror', (e) => errores.push(String(e)));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('html.listo', { timeout: 10000 });
  return { ctx, page, errores };
}
// Lee el color de un píxel del canvas de la lata en coordenadas relativas (0..1).
const pixelLata = (page, fx, fy) => page.evaluate(([fx, fy]) => {
  const c = document.querySelector('.slider__lata');
  return [...c.getContext('2d').getImageData(Math.round(c.width * fx), Math.round(c.height * fy), 1, 1).data];
}, [fx, fy]);
const mascara = (page, modo) => page.evaluate((m) => getComputedStyle(document.querySelector(`[data-revelado] [data-modo="${m}"]`)).maskImage, modo);

// --- Escritorio ---
{
  const { ctx, page, errores } = await pagina({ viewport: { width: 1440, height: 900 } });
  const a = await pixelLata(page, 0.5, 0.5);
  ok(a[3] === 255, `la lata se pinta (alfa en el centro = ${a[3]})`);
  ok((await pixelLata(page, 0.02, 0.5))[3] === 0, 'fuera del cilindro, transparente');
  await page.screenshot({ path: join(salida, 'int-1-slider-mora.png') });
  await page.click('.slider__flecha--sig');
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(salida, 'int-2-slider-girando.png') });
  await page.waitForTimeout(1200);
  const b = await pixelLata(page, 0.5, 0.5);
  ok(b.slice(0, 3).join() !== a.slice(0, 3).join(), `la etiqueta cambia tras el clic (${a.slice(0, 3)} → ${b.slice(0, 3)})`);
  ok(await page.evaluate(() => document.querySelector('.slider__titulo span').textContent) === 'Arándano', 'el título pasa a Arándano');
  await page.screenshot({ path: join(salida, 'int-3-slider-arandano.png') });

  // Lente: sin cursor encima, cerrada; con cursor, círculo en su sitio.
  await page.evaluate(() => document.querySelector('#escaneo').scrollIntoView());
  await page.waitForTimeout(400);
  const caja = await page.locator('[data-revelado]').boundingBox();
  await page.mouse.move(caja.x + caja.width * 0.55, caja.y + caja.height * 0.5, { steps: 8 });
  await page.waitForTimeout(700);
  const m1 = await mascara(page, 'rayosx');
  ok(/radial-gradient/.test(m1) && /120px/.test(m1), `la lente se abre bajo el cursor (${m1.slice(0, 60)}…)`);
  await page.screenshot({ path: join(salida, 'int-4-lente-rayosx.png') });
  await page.click('.modos button[data-a="termica"]');
  await page.mouse.move(caja.x + caja.width * 0.35, caja.y + caja.height * 0.35, { steps: 8 });
  await page.waitForTimeout(700);
  ok(/radial-gradient/.test(await mascara(page, 'termica')), 'modo térmica: la lente usa la otra capa');
  ok(await page.evaluate(() => getComputedStyle(document.querySelector('[data-revelado] [data-modo="rayosx"]')).visibility) === 'hidden', 'la capa de rayos X se oculta');
  await page.screenshot({ path: join(salida, 'int-5-lente-termica.png') });
  await page.mouse.move(5, 5, { steps: 4 });
  await page.waitForTimeout(800);
  const m3 = await mascara(page, 'termica');
  ok(/transparent, transparent|0px/.test(m3) || !/radial/.test(m3), 'al salir el cursor la lente se cierra');
  ok(errores.length === 0, `escritorio sin errores de consola (${errores.length})${errores.length ? ": " + errores.join(" | ").slice(0, 300) : ""}`);
  await ctx.close();
}

// --- Móvil: la lente pasea sola y se arrastra con el dedo ---
{
  const { ctx, page, errores } = await pagina({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.evaluate(() => document.querySelector('#escaneo').scrollIntoView());
  const m1 = await mascara(page, 'rayosx'); await page.waitForTimeout(900); const m2 = await mascara(page, 'rayosx');
  ok(/radial/.test(m1) && m1 !== m2, 'móvil: la lente está abierta y pasea sola');
  await page.screenshot({ path: join(salida, 'int-6-movil-lente.png') });
  ok(errores.length === 0, `móvil sin errores de consola (${errores.length})${errores.length ? ": " + errores.join(" | ").slice(0, 300) : ""}`);
  await ctx.close();
}

// --- Menos movimiento: lente quieta; el clic cambia de sabor sin giro ---
{
  const { ctx, page, errores } = await pagina({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.click('.slider__flecha--sig');
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.querySelector('.slider__titulo span').textContent) === 'Arándano', 'reduced-motion: cambia de sabor al momento');
  ok(errores.length === 0, `reduced-motion sin errores de consola (${errores.length})${errores.length ? ": " + errores.join(" | ").slice(0, 300) : ""}`);
  await ctx.close();
}
await nav.close();
console.log(fallos.length ? `\n${fallos.length} fallos` : '\nTodo bien');
process.exit(fallos.length ? 1 : 0);
