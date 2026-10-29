// capas-parallax.js: profundidad por capas (scroll + puntero) sin dependencias.
// Cada capa lleva data-profundidad: 0 = plano de foco (no se mueve), positivo = más cerca (se mueve más y en sentido
// contrario al fondo), negativo = más lejos. Valores útiles: -1 … 1. Con 3-4 capas basta; 6+ parece un diorama.
//
//   <div class="escena" data-parallax>
//     <div class="capa" data-profundidad="-0.6">fondo</div>
//     <div class="capa" data-profundidad="0">sujeto</div>
//     <div class="capa" data-profundidad="0.5">primer plano</div>
//   </div>
//   import { crearParallax } from './capas-parallax.js';
//   const p = crearParallax(document.querySelector('[data-parallax]'));
//
// Solo usa transform (translate3d/scale): compone en GPU, no provoca layout.
// Se para fuera de pantalla (IntersectionObserver) y cuando ya no hay nada que mover.
// Con prefers-reduced-motion no hace nada (las capas se quedan en su sitio).

export function crearParallax(raiz, {
  scroll = true,          // desplazamiento vertical según el paso de la escena por la pantalla
  recorrido = 0.25,       // fracción del alto de la escena que se mueve una capa de profundidad 1
  puntero = true,         // las capas siguen al ratón (solo en dispositivos con hover)
  intensidad = 24,        // px que se mueve una capa de profundidad 1 con el puntero en el borde
  escalaPorProfundidad = 0, // ej. 0.04: las capas cercanas crecen un poco al avanzar el scroll (sensación de dolly)
  suavizado = 0.08,       // lerp por frame (0..1)
} = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return { destruir() {} };
  const capas = [...raiz.querySelectorAll('[data-profundidad]')].map((el) => ({
    el, z: Number(el.dataset.profundidad) || 0, x: 0, y: 0, s: 1,
  }));
  const conHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let px = 0, py = 0;          // puntero objetivo (-1..1)
  let visible = true, raf = 0, destruido = false;

  function progresoScroll() {
    const r = raiz.getBoundingClientRect();
    // 0 cuando la escena entra por abajo, 0.5 centrada, 1 cuando sale por arriba
    return Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
  }

  function tick() {
    raf = 0;
    if (destruido || !visible) return;
    const alto = raiz.offsetHeight;
    const p = scroll ? progresoScroll() - 0.5 : 0;
    let moviendo = false;
    for (const c of capas) {
      const tx = puntero && conHover ? -px * intensidad * c.z : 0;
      const ty = (scroll ? -p * recorrido * alto * c.z : 0) + (puntero && conHover ? -py * intensidad * c.z : 0);
      const ts = 1 + (escalaPorProfundidad ? Math.max(0, p + 0.5) * escalaPorProfundidad * c.z : 0);
      c.x += (tx - c.x) * suavizado;
      c.y += (ty - c.y) * suavizado;
      c.s += (ts - c.s) * suavizado;
      if (Math.abs(tx - c.x) > 0.05 || Math.abs(ty - c.y) > 0.05 || Math.abs(ts - c.s) > 0.0005) moviendo = true;
      c.el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) scale(${c.s.toFixed(4)})`;
    }
    if (moviendo) raf = requestAnimationFrame(tick);
  }
  const pedir = () => { if (!raf && visible && !destruido) raf = requestAnimationFrame(tick); };

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; pedir(); }, { rootMargin: '20% 0px' });
  io.observe(raiz);
  const alScroll = () => pedir();
  const alMover = (e) => {
    px = (e.clientX / innerWidth) * 2 - 1;
    py = (e.clientY / innerHeight) * 2 - 1;
    pedir();
  };
  if (scroll) addEventListener('scroll', alScroll, { passive: true });
  if (puntero && conHover) addEventListener('pointermove', alMover, { passive: true });
  addEventListener('resize', alScroll, { passive: true });
  for (const c of capas) c.el.style.willChange = 'transform';
  pedir();

  return {
    destruir() {
      destruido = true;
      io.disconnect();
      removeEventListener('scroll', alScroll);
      removeEventListener('pointermove', alMover);
      removeEventListener('resize', alScroll);
      if (raf) cancelAnimationFrame(raf);
      for (const c of capas) { c.el.style.transform = ''; c.el.style.willChange = ''; }
    },
    /** para enlazarlo a Lenis/GSAP si el scroll no es el nativo */
    actualizar: pedir,
  };
}
