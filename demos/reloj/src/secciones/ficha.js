// Sección de respiro: las cifras entran una vez, con el ease común de la web (power3.out).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const filas = gsap.utils.toArray('.ficha__lista > div');
  gsap.from(filas, {
    autoAlpha: 0, y: 32, duration: 0.8, ease: 'power3.out', stagger: 0.06,
    scrollTrigger: { trigger: '.ficha__lista', start: 'top 85%', once: true },
  });
}
