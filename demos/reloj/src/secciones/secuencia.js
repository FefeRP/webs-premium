// Momento estrella (skill scroll-frames): el reloj gira con el scroll en una sección fijada (≈300 %),
// con 3 textos sincronizados. Con reduced-motion no se crea nada: se queda el póster y los textos en orden.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { crearFrameScrubber } from '../lib/frame-scrubber.js';

gsap.registerPlugin(ScrollTrigger);

const seccion = document.querySelector('#secuencia');
const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (seccion && !menosMovimiento) {
  seccion.classList.add('secuencia--viva');
  const canvas = seccion.querySelector('.secuencia__canvas');
  // misma consulta que usa el motor para elegir la variante móvil (608×1080): en vertical, 'contain' para no cortar el reloj
  const movil = matchMedia('(max-width: 767px), (orientation: portrait) and (max-width: 1024px)').matches;
  let seq = null;
  let progreso = 0;

  // El pin se crea ya (para que las alturas de la página sean estables); los frames se cargan al acercarse.
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: seccion, start: 'top top', end: '+=300%', pin: true, scrub: true,
      onUpdate: (s) => { progreso = s.progress; seq?.progreso(progreso); },
    },
  });
  gsap.utils.toArray('.dato', seccion).forEach((el) => {
    const en = Number(el.dataset.en);
    tl.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.06, ease: 'none' }, en)
      .to(el, { autoAlpha: 0, y: -24, duration: 0.06, ease: 'none' }, Math.min(en + 0.25, 0.94));
  });
  // (ventanas de 0,3 casi seguidas: si quedan huecos largos sin texto, el tramo fijado se siente vacío)
  tl.set({}, {}, 1); // duración 1: data-en es proporción del tramo

  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    try {
      seq = await crearFrameScrubber({
        canvas, base: '/frames/reloj/',
        ajuste: movil ? 'contain' : 'cover', fondo: '#171412',
      });
      seq.progreso(progreso);
      seccion.classList.add('lista');
    } catch (err) {
      console.warn('Secuencia no disponible, se queda el póster', err);
    }
  }, { rootMargin: '200% 0px' });
  io.observe(seccion);
}
