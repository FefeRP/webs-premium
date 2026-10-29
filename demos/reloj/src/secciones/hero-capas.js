// Hero con profundidad por capas (skill parallax-capas): halo, anillos de esfera, nombre, reloj, brillo y polvo dorado.
// El motor respeta prefers-reduced-motion (las capas se quedan quietas) y se para fuera de pantalla.
import { crearParallax } from '../lib/capas-parallax.js';

const hero = document.querySelector('.hero[data-parallax]');
if (hero) crearParallax(hero, { recorrido: 0.22, intensidad: 18 });
