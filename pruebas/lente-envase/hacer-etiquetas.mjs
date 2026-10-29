// Genera las etiquetas planas de prueba (SVG, sin IA): 3 sabores de una marca inventada, costura que casa en los bordes.
import { writeFileSync, mkdirSync } from 'node:fs';
mkdirSync('activos', { recursive: true });
const sabores = [
  { id: 'mora', nombre: 'MORA', fondo: '#5b2bd6', b: '#c6ff3d', c: '#1d0b4f' },
  { id: 'arandano', nombre: 'ARÁNDANO', fondo: '#1d8ef0', b: '#ff4fa3', c: '#06274d' },
  { id: 'lima', nombre: 'LIMA', fondo: '#c9e83a', b: '#0f3d1e', c: '#f5ffd0' },
];
const W = 1200, H = 820;   // ≈ π × 0,36 / 0,78: la proporción que pide la forma por defecto del motor
for (const s of sabores) {
  // Círculos que se repiten cada 200 px: múltiplo del ancho, así la costura casa.
  let puntos = '';
  for (let x = 0; x < W; x += 200) for (let y = 60; y < H; y += 160)
    puntos += `<circle cx="${x + ((y / 160) % 2) * 100}" cy="${y}" r="34" fill="${s.c}" opacity=".35"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${s.fondo}"/>${puntos}
  <rect y="0" width="${W}" height="26" fill="${s.c}"/><rect y="${H - 26}" width="${W}" height="26" fill="${s.c}"/>
  <path d="M0 640 Q 150 590 300 640 T 600 640 T 900 640 T 1200 640 V 794 H 0 Z" fill="${s.b}" opacity=".9"/>
  <text x="300" y="400" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-style="italic" font-size="120" fill="${s.b}" stroke="${s.c}" stroke-width="5" paint-order="stroke">NÉBULA</text>
  <text x="300" y="470" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="44" fill="${s.c}" letter-spacing="8">${s.nombre}</text>
  <g font-family="Arial, sans-serif" font-size="18" fill="${s.c}">
    <text x="760" y="300">ENERGY DRINK · 330 ml</text><text x="760" y="330">Ingredientes: agua carbonatada,</text>
    <text x="760" y="356">zumo de ${s.nombre.toLowerCase()} 12 %, cafeína.</text>
    <rect x="1000" y="380" width="120" height="70" fill="#fff"/>
    ${Array.from({ length: 22 }, (_, i) => `<rect x="${1006 + i * 5}" y="386" width="${i % 3 ? 2 : 3}" height="52" fill="#111"/>`).join('')}
  </g></svg>`;
  writeFileSync(`activos/etiqueta-${s.id}.svg`, svg);
}
console.log('etiquetas listas');
