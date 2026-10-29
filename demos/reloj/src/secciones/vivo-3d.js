// "Míralo tú" (skill escena-3d-gltf): el reloj en 3D real, arrastrable y girando con el scroll.
// three y el modelo se cargan solo al acercarse la sección (import dinámico); mientras tanto, póster.
// Sin WebGL2 o con reduced-motion: se queda el póster.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const contenedor = document.querySelector('.vivo__escena');
// reduced-motion se mira ANTES del import(): si no, se descarga three para nada
if (contenedor && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    try {
      const { crearEscenaProducto, hayWebGL2 } = await import('../lib/escena-producto.js');
      if (!hayWebGL2()) return;
      const movil = matchMedia('(max-width: 767px)').matches;
      const escena = await crearEscenaProducto({
        contenedor,
        modelo: movil ? '/modelos/reloj-movil.glb' : '/modelos/reloj.glb',
        // de tres cuartos (-0,3π) a tres cuartos (+0,3π): de frente justo cuando la sección está centrada
        giroInicial: -Math.PI * 0.3, giroScroll: Math.PI * 0.6,
        distancia: 2.8, acercarScroll: 0.1,
      });
      contenedor.classList.add('lista');
      escena.alPerderContexto = () => contenedor.classList.remove('lista');
      ScrollTrigger.create({
        trigger: '#vivo', start: 'top bottom', end: 'bottom top', scrub: true,
        onUpdate: (s) => escena.progreso(s.progress),
      });
    } catch (err) {
      console.warn('3D no disponible, se queda el póster', err);
    }
  }, { rootMargin: '100% 0px' });
  io.observe(contenedor);
}
