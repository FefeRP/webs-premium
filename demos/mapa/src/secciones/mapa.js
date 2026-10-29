// Sección "del mapa al edificio" (skill mapa-zoom-ubicacion): escenario sticky + ScrollTrigger con scrub → cámara del mapa.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'maplibre-gl/dist/maplibre-gl.css';
// Vite pre-empaqueta maplibre en .vite/deps y el worker (que se busca junto a import.meta.url) se pierde:
// se le da la URL del worker a mano (funciona en dev y en build).
import urlWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { crearMapaScroll } from '../lib/mapa-scroll.js';

gsap.registerPlugin(ScrollTrigger);

const seccion = document.querySelector('.mapa');
const lienzo = seccion?.querySelector('[data-mapa]');
const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const movil = matchMedia('(max-width: 700px)').matches;

// Ubicación de ejemplo: Torre Glòries (Barcelona). Las paradas se ajustan mirando el mapa, no a ojo de coordenadas.
const DESTINO = [2.18952, 41.40351];  // centro de la huella en OSM
const PARADAS = [
  { en: 0,    centro: [2.1700, 41.3950], zoom: movil ? 11 : 11.8, pitch: 0,  bearing: 0 },
  { en: 0.32, centro: [2.1880, 41.4020], zoom: movil ? 13.8 : 14.4, pitch: 35, bearing: -12 },
  { en: 0.8,  centro: DESTINO,           zoom: movil ? 16.4 : 17.1, pitch: 60, bearing: -28 },
  { en: 1,    centro: DESTINO,           zoom: movil ? 16.6 : 17.3, pitch: 62, bearing: 18 },  // órbita final
];

// PNOA (IGN): ortofoto CC BY 4.0, sin clave, con CORS. Fuera de España: ver references/fuentes-mapa.md.
const PNOA = {
  tiles: ['https://www.ign.es/wmts/pnoa-ma?request=GetTile&service=WMTS&version=1.0.0&layer=OI.OrthoimageCoverage&style=default&format=image/jpeg&tilematrixset=GoogleMapsCompatible&tilematrix={z}&tilerow={y}&tilecol={x}'],
  atribucion: 'Ortofoto: PNOA cedido por © <a href="https://www.ign.es">IGN</a> (CC BY 4.0)',
  maxzoom: 19,
  // a nivel de calle la ortofoto cede un poco para que manden los volúmenes 3D
  opacidad: ['interpolate', ['linear'], ['zoom'], 15, 1, 17, 0.7],
};

if (seccion && lienzo) iniciar();

async function iniciar() {
  let m;
  try {
    // maplibre (~1 MB) en su propio trozo: no frena el primer pintado de la página
    const maplibregl = await import('maplibre-gl');   // v6: sin export por defecto (import * / namespace)
    maplibregl.setWorkerUrl(urlWorker);
    m = await crearMapaScroll({
      contenedor: lienzo,
      maplibregl,
      estilo: 'https://tiles.openfreemap.org/styles/liberty',
      paradas: PARADAS,
      satelite: PNOA,
      colorEdificios: '#e9e2d6',
      opacidadEdificios: ['interpolate', ['linear'], ['zoom'], 14.5, 0, 16, 0.92],
      resaltar: { punto: DESTINO, color: '#f2a541' },
      dprMax: movil ? 1.5 : 2,
    });
  } catch (e) {
    // Sin WebGL o sin red: la sección se queda con su fondo y los textos (la ficha sigue visible abajo).
    console.warn('Mapa no disponible:', e?.message || e);
    seccion.classList.add('mapa--sin-mapa');
    seccion.querySelector('[data-ficha]')?.classList.add('activo');
    return;
  }
  window.__mapa = m; // para depurar y para las pruebas

  const pasos = [...seccion.querySelectorAll('.mapa__paso')];
  const ficha = seccion.querySelector('[data-ficha]');

  if (menosMovimiento) {
    m.progreso(1);
    ficha.classList.add('activo');
    return;
  }

  const pintar = (p) => {
    m.progreso(p);
    seccion.style.setProperty('--nubes', String(Math.max(0, 1 - p / 0.12)));
    for (const el of pasos) el.classList.toggle('activo', p >= +el.dataset.desde && p < +el.dataset.hasta);
    ficha.classList.toggle('activo', p >= 0.86);
  };

  ScrollTrigger.create({
    trigger: seccion,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,           // Lenis ya suaviza: scrub numérico aquí añadiría retraso doble
    onUpdate: (st) => pintar(st.progress),
    onRefresh: (st) => pintar(st.progress),
  });
  pintar(ScrollTrigger.getAll().find((st) => st.trigger === seccion)?.progress ?? 0);

  // Precarga las teselas de toda la ruta mientras el usuario lee la intro; se corta en cuanto la sección asoma.
  if (seccion.getBoundingClientRect().top > innerHeight * 0.05) {
    const corte = new AbortController();
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { corte.abort(); io.disconnect(); } });
    io.observe(seccion);
    m.precargar({ pasos: movil ? 6 : 10, senal: corte.signal }).finally(() => io.disconnect());
  }
}
