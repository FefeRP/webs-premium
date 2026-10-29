// lente-revelado.js: una imagen "por dentro" (rayos X, térmica, interior, antes/después) que se revela a través de
// una lente circular que sigue al cursor, o de una cortina ligada al scroll. Sin dependencias.
// Idea de ref11 (cruasán, @W.WEAREBRAND): "X-ray vision. No crumbs." con interruptor X-ray / Thermal.
//
//   <div class="revelado" data-revelado>
//     <img class="revelado__capa" src="/revelado/base.webp" alt="Cruasán entero">           <!-- la de siempre -->
//     <img class="revelado__capa" data-modo="rayosx"  src="/revelado/rayosx.webp"  alt="" aria-hidden="true">
//     <img class="revelado__capa" data-modo="termica" src="/revelado/termica.webp" alt="" aria-hidden="true">
//     <div class="revelado__anillo" aria-hidden="true"></div>                                <!-- opcional -->
//   </div>
//   .revelado { position: relative; aspect-ratio: 611/739; }   .revelado__capa { position:absolute; inset:0; width:100%; height:100% }
//   import { crearLenteRevelado } from './lente-revelado.js';
//   const lente = crearLenteRevelado(document.querySelector('[data-revelado]'), { radio: 120 });
//   lente.modo('termica');            // cambia la capa que se ve por la lente (interruptor)
//   lente.cortina(0.4);               // modo antes/después: revela el 40 % de izquierda a derecha (llámalo desde el scroll)
//
// Las capas TIENEN que estar alineadas píxel a píxel con la base (mismo tamaño y encuadre): variantes-revelado.mjs.
// Solo cambia mask-image (compone en GPU, sin layout). Render bajo demanda; se para fuera de pantalla.
// Táctil / sin hover: la lente se arrastra con el dedo y, si no se toca, pasea sola despacio (se ve que hay algo).
// prefers-reduced-motion: lente quieta en el centro (sin paseo); sigue al puntero solo si el usuario la mueve.

export function crearLenteRevelado(raiz, {
  radio = 110,          // px (en CSS) del círculo; en pantallas pequeñas se limita al 30 % del lado menor
  borde = 18,           // px de fundido del borde de la lente (0 = corte seco)
  suavizado = 0.18,     // lerp por frame hacia el puntero (0..1); 1 = pegado al cursor
  modoInicial = null,   // data-modo que se ve al empezar (por defecto, el primero)
  paseo = true,         // sin hover: la lente se mueve sola en un ocho lento hasta que el usuario la toca
  alSalir = 'ocultar',  // 'ocultar' (se cierra al salir el puntero) | 'quedar' (se queda donde estaba)
} = {}) {
  const capas = [...raiz.querySelectorAll('[data-modo]')];
  const anillo = raiz.querySelector('.revelado__anillo');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let actual = modoInicial || capas[0]?.dataset.modo;
  let w = 1, h = 1, r = radio;
  let x = 0.5, y = 0.5, tx = 0.5, ty = 0.5;   // posición (0..1) actual y objetivo
  let abierta = conHover ? 0 : 1, tAbierta = abierta; // 0..1: radio animado (abrir/cerrar la lente)
  let modoCortina = false, pc = 0;              // cortina (antes/después)
  let tocada = false, visible = true, raf = 0, destruido = false, t0 = performance.now();

  for (const c of capas) {
    c.style.pointerEvents = 'none';
    c.style.visibility = c.dataset.modo === actual ? 'visible' : 'hidden';
  }
  if (anillo) Object.assign(anillo.style, { position: 'absolute', left: '0', top: '0', pointerEvents: 'none', borderRadius: '50%' });

  function medir() {
    const b = raiz.getBoundingClientRect();
    w = Math.max(1, b.width); h = Math.max(1, b.height);
    r = Math.min(radio, Math.min(w, h) * 0.3);
  }

  function pintar() {
    if (destruido) return;
    const capa = capas.find((c) => c.dataset.modo === actual);
    if (!capa) return;
    let mascara;
    if (modoCortina) {
      const p = (pc * 100).toFixed(2);
      mascara = `linear-gradient(90deg, #000 calc(${p}% - ${borde / 2}px), transparent calc(${p}% + ${borde / 2}px))`;
    } else {
      const rr = Math.max(0, r * abierta);
      const px = (x * w).toFixed(1), py = (y * h).toFixed(1);
      mascara = rr < 0.5 ? 'linear-gradient(transparent, transparent)'
        : `radial-gradient(circle ${rr.toFixed(1)}px at ${px}px ${py}px, #000 ${Math.max(0, rr - borde).toFixed(1)}px, transparent ${rr.toFixed(1)}px)`;
      if (anillo) {
        const d = rr * 2;
        anillo.style.width = anillo.style.height = `${d.toFixed(1)}px`;
        anillo.style.transform = `translate3d(${(x * w - rr).toFixed(1)}px, ${(y * h - rr).toFixed(1)}px, 0)`;
        anillo.style.opacity = String(Math.min(1, abierta * 1.5));
      }
    }
    capa.style.webkitMaskImage = capa.style.maskImage = mascara;
  }

  function tick(ahora) {
    raf = 0;
    if (destruido || !visible) return;
    let sigue = false;
    if (!conHover && paseo && !tocada && !reducido && !modoCortina) {
      const t = (ahora - t0) / 1000;                       // ocho lento (lemniscata) alrededor del centro
      tx = 0.5 + 0.22 * Math.sin(t * 0.5); ty = 0.5 + 0.14 * Math.sin(t);
      sigue = true;
    }
    const k = reducido ? 1 : suavizado;
    x += (tx - x) * k; y += (ty - y) * k; abierta += (tAbierta - abierta) * (reducido ? 1 : 0.2);
    if (Math.abs(tx - x) > 0.0005 || Math.abs(ty - y) > 0.0005 || Math.abs(tAbierta - abierta) > 0.002) sigue = true;
    pintar();
    if (sigue) raf = requestAnimationFrame(tick);
  }
  const pedir = () => { if (!raf && visible && !destruido) raf = requestAnimationFrame(tick); };

  function mover(e) {
    if (modoCortina) return;
    const b = raiz.getBoundingClientRect();
    if (!conHover && e.pointerType !== 'mouse' && !e.isPrimary) return;
    tx = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width));
    ty = Math.min(1, Math.max(0, (e.clientY - b.top) / b.height));
    tAbierta = 1; tocada = true;
    pedir();
  }
  const entrar = (e) => { mover(e); };
  const salir = () => { if (conHover && alSalir === 'ocultar') { tAbierta = 0; pedir(); } };
  raiz.addEventListener('pointermove', mover);
  raiz.addEventListener('pointerdown', entrar);
  raiz.addEventListener('pointerleave', salir);
  if (!conHover) raiz.style.touchAction = 'pan-y';      // el dedo arrastra la lente en horizontal sin bloquear el scroll

  const ro = new ResizeObserver(() => { medir(); pintar(); });
  ro.observe(raiz);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; pedir(); }, { rootMargin: '10% 0px' });
  io.observe(raiz);
  medir(); pintar(); pedir();

  return {
    /** Cambia la capa que se ve por la lente: 'rayosx', 'termica'… (el data-modo). */
    modo(nombre) {
      if (!capas.some((c) => c.dataset.modo === nombre)) return;
      for (const c of capas) {
        c.style.visibility = c.dataset.modo === nombre ? 'visible' : 'hidden';
        if (c.dataset.modo !== nombre) c.style.webkitMaskImage = c.style.maskImage = '';
      }
      actual = nombre; pintar();
    },
    /** Pasa a modo cortina (antes/después) y revela de 0 a 1. cortina(null) vuelve a la lente. */
    cortina(p) {
      modoCortina = p != null;
      if (anillo) anillo.style.opacity = modoCortina ? '0' : String(abierta);
      if (modoCortina) pc = Math.min(1, Math.max(0, p));
      pintar();
    },
    /** Mueve la lente por código (0..1), p. ej. para colocarla en un detalle desde el scroll. */
    llevarA(nx, ny) { tx = nx; ty = ny; tAbierta = 1; tocada = true; pedir(); },
    get modoActual() { return actual; },
    destruir() {
      destruido = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      raiz.removeEventListener('pointermove', mover);
      raiz.removeEventListener('pointerdown', entrar);
      raiz.removeEventListener('pointerleave', salir);
      for (const c of capas) c.style.webkitMaskImage = c.style.maskImage = c.style.visibility = '';
    },
  };
}
