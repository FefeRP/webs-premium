// Mide capas-sombra.mjs contra la verdad del render de prueba (foto + plato real + máscara exacta).
// Uso: node medir.mjs <carpeta-salida-de-capas-sombra>   (desde esta carpeta)
import { leer, mascaraDe } from '../../plugins/web-premium/skills/parallax-capas/scripts/capas-sombra.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
const foto = leer('entrada/foto.png'), plato = leer('entrada/plato.png'), m = mascaraDe(leer('entrada/mascara.png'));
const { w, h } = foto, n = w * h;
const info = JSON.parse(readFileSync(join(dir, 'capas.json'), 'utf8'));
const capa = (nombre) => {
  const c = info.capas.find((x) => x.nombre === nombre);
  const img = leer(join(dir, c.fichero.replace('.webp', '.png')));
  const full = new Float32Array(n * 4);
  for (let y = 0; y < c.caja.h; y++) for (let x = 0; x < c.caja.w; x++) for (let k = 0; k < 4; k++)
    full[((y + c.caja.y) * w + x + c.caja.x) * 4 + k] = img.d[(y * c.caja.w + x) * 4 + k];
  return full;
};
const lum = (d, i) => 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2];
const fondo = capa('fondo'), sombra = capa('sombra');
let eF = 0, eA = 0, cuentaA = 0, falsa = 0, cuentaFuera = 0, maxVerdad = 0;
for (let i = 0; i < n; i++) {
  if (m[i] > 0.01) continue;
  eF += Math.abs(lum(fondo, i) - lum(plato.d, i));
  const verdad = Math.max(0, 1 - lum(foto.d, i) / Math.max(1, lum(plato.d, i)));
  const est = sombra[i * 4 + 3] / 255;
  maxVerdad = Math.max(maxVerdad, verdad);
  if (verdad > 0.03) { eA += Math.abs(est - verdad); cuentaA++; } else { cuentaFuera++; if (est > 0.05) falsa++; }
}
const fuera = n - m.reduce((s, v) => s + (v > 0.01 ? 1 : 0), 0);
console.log(`${dir}: error medio del fondo ${(eF / fuera).toFixed(2)}/255 · error medio del alfa de sombra ${(eA / cuentaA).toFixed(3)} (alfa máx real ${maxVerdad.toFixed(2)}) · sombra falsa >5% en ${(100 * falsa / cuentaFuera).toFixed(2)}% del fondo`);
