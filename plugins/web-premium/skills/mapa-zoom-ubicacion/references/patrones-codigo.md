# Patrón de código: sección "del mapa al edificio"

Probado en `demos/mapa/`, con Vite 8, MapLibre GL JS 6.16, GSAP 3.15 y Lenis 1.3. Instalación: `npm install maplibre-gl`.

## HTML
Una sección alta con un escenario fijo (`sticky`). El texto va en HTML real encima del mapa.
```html
<section class="mapa" id="ubicacion" aria-labelledby="ubicacion-titulo">
  <div class="mapa__escenario">
    <div class="mapa__lienzo" data-mapa></div>          <!-- MapLibre pinta aquí (aria-hidden lo pone el motor) -->
    <img class="mapa__foto" data-foto src="/edificio-final.webp" alt="" hidden>  <!-- relevo opcional -->
    <div class="mapa__velo" aria-hidden="true"></div>    <!-- degradado para leer el texto -->
    <div class="mapa__textos">
      <div class="mapa__paso" data-desde="0" data-hasta="0.28"><h2 id="ubicacion-titulo">La ciudad</h2></div>
      <div class="mapa__paso" data-desde="0.3" data-hasta="0.6"><h2>El barrio</h2></div>
    </div>
    <article class="mapa__ficha" data-ficha>…dirección, CTA…</article>
  </div>
</section>
<!-- en el <head>: -->
<link rel="preconnect" href="https://tiles.openfreemap.org" crossorigin>
<link rel="preconnect" href="https://www.ign.es" crossorigin>
```

## CSS
Solo lo esencial; el resto está en `demos/mapa/src/estilos.css`.
```css
.mapa { position: relative; height: 520vh; }                 /* largo del recorrido */
.mapa__escenario { position: sticky; top: 0; height: 100svh; overflow: hidden; }
/* Más específico que .maplibregl-map: su CSS llega después y pone position: relative. Sin esto, el lienzo mide 0 px. */
.mapa__escenario > .mapa__lienzo { position: absolute; inset: 0; }
.mapa__foto { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: var(--relevo, 0); }
.menos-movimiento .mapa { height: auto; }
.menos-movimiento .mapa__escenario { position: relative; }
```

## JS
```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'maplibre-gl/dist/maplibre-gl.css';
import urlWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'; // Vite: si no, "Worker failed to load"
import { crearMapaScroll } from '../lib/mapa-scroll.js';
gsap.registerPlugin(ScrollTrigger);
// maplibre (~1,1 MB) con import dinámico: va en su propio trozo y no frena el primer pintado.
const maplibregl = await import('maplibre-gl');                   // v6: sin export por defecto (namespace)
maplibregl.setWorkerUrl(urlWorker);

const seccion = document.querySelector('.mapa');
const movil = matchMedia('(max-width: 700px)').matches;
const DESTINO = [lng, lat];                                       // centro de la huella del edificio
const m = await crearMapaScroll({
  contenedor: seccion.querySelector('[data-mapa]'), maplibregl,
  estilo: 'https://tiles.openfreemap.org/styles/liberty',
  paradas: [
    { en: 0,    centro: [lngCiudad, latCiudad], zoom: movil ? 11 : 11.8, pitch: 0 },
    { en: 0.32, centro: [lngBarrio, latBarrio], zoom: movil ? 13.8 : 14.4, pitch: 35, bearing: -12 },
    { en: 0.8,  centro: DESTINO, zoom: movil ? 16.4 : 17.1, pitch: 60, bearing: -28 },
    { en: 1,    centro: DESTINO, zoom: movil ? 16.6 : 17.3, pitch: 62, bearing: 18 },   // órbita final
  ],
  satelite: { tiles: [URL_PNOA], atribucion: 'Ortofoto: PNOA cedido por © IGN (CC BY 4.0)',
              opacidad: ['interpolate', ['linear'], ['zoom'], 15, 1, 17, 0.7] },
  opacidadEdificios: ['interpolate', ['linear'], ['zoom'], 14.5, 0, 16, 0.92],   // maqueta opaca, no cristal
  resaltar: { punto: DESTINO, color: '#f2a541' },
  dprMax: movil ? 1.5 : 2,
});

ScrollTrigger.create({
  trigger: seccion, start: 'top top', end: 'bottom bottom', scrub: true,   // Lenis ya suaviza
  onUpdate: ({ progress: p }) => {
    m.progreso(p);
    // relevo a la foto real en el último 10 %: misma cámara que la parada final
    seccion.style.setProperty('--relevo', String(Math.max(0, (p - 0.9) / 0.1)));
  },
});

// Precarga solo con la sección fuera de vista; se corta al asomar.
const corte = new AbortController();
new IntersectionObserver(([e], io) => { if (e.isIntersecting) { corte.abort(); io.disconnect(); } }).observe(seccion);
m.precargar({ pasos: movil ? 6 : 10, senal: corte.signal });
```
Envuelve la creación en `try/catch`. Si falla (sin WebGL o sin red), deja los textos y la ficha visibles. La demo lo hace así.

## Encuadrar la foto final con la cámara del mapa
1. Pon la última parada y haz una captura del mapa.
2. Encarga o recorta la foto, el dron o el render con el mismo punto de vista: el edificio a la misma altura de pantalla y desde el mismo lado.
3. Si el material es un render 3D (glTF), mejor aún. Coloca la cámara de three.js con la posición equivalente a `centro`/`zoom`/`pitch`/`bearing`, o haz el relevo con un fundido corto (0,3-0,5 del último tramo).
4. Si la foto no encaja, sube el velo y funde a la ficha antes de la foto. Así no se ve el salto.

## Anclar etiquetas HTML al mapa
`m.proyectar([lng, lat])` devuelve los píxeles en pantalla. Úsalo dentro de `onUpdate`, después de `m.progreso(p)`, para colocar un pin o una tarjeta que siga al edificio. Las tarjetas ancladas de ref9 se hacen así.
