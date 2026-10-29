// Base común de toda web premium: scroll suave (Lenis) + GSAP ScrollTrigger en un único bucle,
// respeto a prefers-reduced-motion y un sitio para enchufar cada técnica.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('menos-movimiento', menosMovimiento);

// Scroll suave solo si el usuario no pide menos movimiento. Lenis mueve el scroll nativo (anclas, Ctrl+F y teclado siguen funcionando).
export let lenis = null;
if (!menosMovimiento) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis; // lo usa verificar-scroll.mjs para saltar a cada posición sin animación
}

// Cuando cargan fuentes e imágenes cambian las alturas: recalcula los disparadores.
document.fonts?.ready.then(() => ScrollTrigger.refresh());
addEventListener('load', () => ScrollTrigger.refresh());

// === Técnicas ===
// Ojo: los import se evalúan ANTES que el cuerpo de este fichero, así que las secciones no importan
// `menosMovimiento`/`lenis` de aquí (estarían sin inicializar): cada una consulta matchMedia por su cuenta.
import './secciones/hero-capas.js';
import './secciones/secuencia.js';
import './secciones/ficha.js';
import './secciones/vivo-3d.js';
