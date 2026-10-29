// Prueba de los motores nuevos (beta.3) sin GSAP ni bundler: se sirve tal cual desde la raíz del repo.
import { crearEnvaseGiratorio } from '../../plugins/web-premium/skills/envase-giratorio/scripts/envase-giratorio.js';
import { crearLenteRevelado } from '../../plugins/web-premium/skills/lente-revelado/scripts/lente-revelado.js';

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** Progreso 0..1 de una sección fijada con sticky (0 = empieza a fijarse, 1 = se suelta). */
const progresoSticky = (el) => { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); };

// --- 1 · Slider de sabores con la lata que gira -------------------------------------------------------------
const sabores = [
  { id: 'mora', nombre: 'Mora', fondo: '#5b2bd6', acento: '#c6ff3d' },
  { id: 'arandano', nombre: 'Arándano', fondo: '#1d8ef0', acento: '#ff4fa3' },
  { id: 'lima', nombre: 'Lima', fondo: '#b5d22c', acento: '#0f3d1e' },
];
const slider = document.querySelector('#slider');
const lienzo = slider.querySelector('.slider__lata');
const titulo = slider.querySelector('.slider__titulo span');
const lata = crearEnvaseGiratorio(lienzo, { etiqueta: `./activos/etiqueta-${sabores[0].id}.svg` });
// Precarga las otras etiquetas para que el cambio a mitad de giro no espere a la red.
for (const s of sabores.slice(1)) { const i = new Image(); i.src = `./activos/etiqueta-${s.id}.svg`; }
let indice = 0, base = 0, extraScroll = 0, animando = false;
const aplicarGiro = () => lata.girar(base + extraScroll);

function pintarSabor(s) {
  slider.style.setProperty('--fondo', s.fondo);
  slider.style.setProperty('--acento', s.acento);
  slider.dataset.sabor = String(indice);
  lienzo.setAttribute('aria-label', `Lata de Nébula sabor ${s.nombre.toLowerCase()}`);
}

async function cambiar(dir) {
  if (animando) return;
  indice = (indice + dir + sabores.length) % sabores.length;
  const s = sabores[indice];
  if (reducido) { await lata.cambiarEtiqueta(`./activos/etiqueta-${s.id}.svg`); titulo.textContent = s.nombre; pintarSabor(s); return; }
  animando = true;
  const desde = base, dur = 1400, t0 = performance.now();
  let cambiada = false;
  // El título sale por su máscara (overflow:hidden del h1) y entra el nuevo desde el otro lado.
  titulo.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-dir * 110}%)` }],
    { duration: dur / 2, easing: 'cubic-bezier(.6,0,.8,.2)', fill: 'forwards' }).finished.then(() => {
    titulo.textContent = s.nombre;
    titulo.animate([{ transform: `translateX(${dir * 110}%)` }, { transform: 'translateX(0)' }],
      { duration: dur / 2, easing: 'cubic-bezier(.2,.8,.4,1)', fill: 'forwards' });
  });
  await new Promise((fin) => {
    const paso = (ahora) => {
      const t = clamp((ahora - t0) / dur);
      base = desde + dir * suave(t);       // una vuelta entera por cambio
      aplicarGiro();
      if (!cambiada && t >= 0.5) {         // a mitad del giro (lata de canto y rápida) cambia etiqueta y colores
        cambiada = true;
        lata.cambiarEtiqueta(`./activos/etiqueta-${s.id}.svg`);
        pintarSabor(s);
      }
      if (t < 1) requestAnimationFrame(paso); else fin();
    };
    requestAnimationFrame(paso);
  });
  animando = false;
}
slider.querySelector('.slider__flecha--sig').addEventListener('click', () => cambiar(1));
slider.querySelector('.slider__flecha--ant').addEventListener('click', () => cambiar(-1));
lata.listo.then(aplicarGiro);

// --- 2 · HUD de datos ligado al scroll ------------------------------------------------------------------------
const hud = document.querySelector('#hud');
const campo = (k) => hud.querySelector(`[data-hud="${k}"]`);
const fmt = new Intl.NumberFormat('es-ES');
function pintarHud() {
  const p = progresoSticky(hud);
  const e = suave(p);                                   // curva suave: el contador no "salta" al principio
  campo('piezas').textContent = fmt.format(Math.round(e * 1343));
  const seg = Math.round(p * 18 * 60);
  campo('tiempo').textContent = `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`;
  campo('grados').textContent = `${Math.round(20 + 170 * clamp(p / 0.3))} °C`;
  campo('estado').textContent = p < 0.35 ? 'Crudo' : p < 0.75 ? 'Dorado claro' : 'Dorado';
  hud.style.setProperty('--p', p.toFixed(4));
  hud.style.setProperty('--crudo', (1 - p).toFixed(4));
}

// --- 3 · Lente de rayos X / térmica ---------------------------------------------------------------------------
const lente = crearLenteRevelado(document.querySelector('[data-revelado]'), { radio: 120 });
for (const b of document.querySelectorAll('.modos button')) {
  b.addEventListener('click', () => {
    lente.modo(b.dataset.a);
    for (const o of document.querySelectorAll('.modos button')) o.setAttribute('aria-pressed', String(o === b));
  });
}

// --- 4 · Cortina antes/después ligada al scroll ---------------------------------------------------------------
const seccionCortina = document.querySelector('#cortina');
const cortina = crearLenteRevelado(document.querySelector('[data-revelado-cortina]'));
const pintarCortina = () => cortina.cortina(reducido ? 0.5 : progresoSticky(seccionCortina));

// Un solo listener de scroll, en rAF.
let pedido = false;
function alScroll() {
  if (pedido) return;
  pedido = true;
  requestAnimationFrame(() => {
    pedido = false;
    if (!reducido) { extraScroll = clamp(scrollY / innerHeight) * 0.35; aplicarGiro(); }
    pintarHud(); pintarCortina();
  });
}
addEventListener('scroll', alScroll, { passive: true });
addEventListener('resize', alScroll);
alScroll();
// Para la verificación automática: indica que todo cargó.
lata.listo.then(() => document.documentElement.classList.add('listo'));
