---
name: mapa-zoom-ubicacion
description: Del mapa al edificio - sección en la que, con el scroll, la cámara baja desde la ciudad (ortofoto/satélite REAL) hasta un edificio concreto, con inclinación, giro, edificios 3D, el destino resaltado y el relevo final a la foto o el render del cliente. Para inmobiliarias, promociones, hoteles, oficinas, tiendas y cualquier negocio con ubicación. Usa MapLibre GL JS con fuentes de mapa gratis y con licencia (PNOA del IGN en España, OpenFreeMap/OSM), un motor sin dependencias propias (mapa-scroll.js) y una receta probada. Úsala cuando pidan "mapa que hace zoom al edificio", "zoom desde el satélite", "mostrar la ubicación con scroll", "vuelo de cámara a la parcela", "mapa 3D de la promoción", "dónde está el piso", "map zoom to building", "scroll-driven map", "satellite zoom intro", "location reveal", "fly to property on scroll".
license: MIT
version: 1.0.0-beta.3
---

# Del mapa al edificio (zoom de ubicación con scroll)

El momento "¿dónde está?" contado como plano de cine: la ciudad desde arriba, el barrio, la calle y, al final,
**el edificio** resaltado. Con mapa **real** (ortofoto de verdad, no un dibujo) y la cámara pegada al scroll.
Referencia de partida: ref8 en `docs/referencias/` (Reposé Residence: nubes → satélite → parcela → render).

## Cuándo sí y cuándo no
- **Sí:** inmobiliaria y promociones, hoteles, oficinas, coworkings, tiendas físicas, eventos con sede, "nuestras sedes".
- **No:** si la ubicación no es un argumento de venta (sobra un mapa de 5 pantallas para una tienda online), o si no
  hay datos del sitio (zona sin ortofoto buena: mejor una ilustración o vídeo propio).
- **Motion de mapas tipo anuncio** (ciudad de arcilla, rutas, cortes del suelo con el metro: ref9) es otra cosa: vídeo
  o three.js a medida. Ideas aprovechables en [references/ideas-ref9.md](references/ideas-ref9.md).

## Qué conviene (la decisión, ya tomada)
| Pieza | Recomendado | Por qué |
|---|---|---|
| Motor | **MapLibre GL JS** (libre, BSD-3) | Mapa real en WebGL, inclinación, giro, extrusión 3D, sin claves ni cuentas |
| Ortofoto en España | **PNOA del IGN** (CC BY 4.0, gratis, sin clave, CORS abierto, 25-50 cm) | Lo más realista y legal sin pagar |
| Fuera de España | Ortofoto oficial abierta del país si su licencia lo permite; si no **MapTiler Satellite** (gratis con logo hasta 5.000 sesiones/mes) o Esri vía Location Platform (2M teselas/mes gratis, con key) | Ver [references/fuentes-mapa.md](references/fuentes-mapa.md) |
| Calles, etiquetas, edificios 3D | **OpenFreeMap** estilo `liberty` (gratis, sin clave, OSM/ODbL) | Trae `render_height` de OSM para extruir |
| Plano final del edificio | **Material real del cliente** (foto, dron, render, glTF) | El mapa no tiene fachadas: el relevo lo da la foto |
| IA (Higgsfield, Kling, Veo) | **Solo** para animar la foto real del final (image-to-video) o un plano de ambiente | Un barrido generado se inventa calles: publicidad engañosa |
| Evitar | Teselas de `tile.openstreetmap.org` (prohíbe este uso), Google Photorealistic 3D Tiles (bloqueado con facturación en el EEE desde 07-2025, y prohíbe cachear), Sentinel-2 cloudless de EOX (no comercial, 10 m) | Licencia o resolución |

Coste práctico en España: **0 €** (PNOA + OpenFreeMap + MapLibre). Si hay que generar algo con IA, **precio estimado y vale del dueño antes**.

## Pasos
1. **El sitio y el guion de cámara.** Coordenadas del edificio (centro de su huella en OSM, no la del portal) y 3-5
   **paradas** `{ en, centro, zoom, pitch, bearing }`: ciudad (z 11-12, pitch 0) → barrio (z 14-14,5, pitch 30-40) →
   edificio (z 17-17,5, pitch 55-62) → órbita final (mismo centro, bearing ±40°). Ajusta mirando el mapa, no a ojo.
2. **Fuentes y atribución.** Elige la ortofoto (tabla de arriba) y escribe la atribución: en el control de MapLibre
   (sale solo con `attribution` de cada fuente) **y** en el pie. Es obligatoria.
3. **Monta la sección** con la plantilla de `web-premium` (`nueva-web.mjs … --con mapa`) y el patrón de
   [references/patrones-codigo.md](references/patrones-codigo.md): sección alta (400-550 vh) + escenario `sticky` +
   ScrollTrigger con `scrub: true` → `m.progreso(p)`. Textos de cada fase en HTML encima, con velo para leerse.
4. **Edificio destino.** `resaltar: { punto }` detecta su huella en las teselas y la extruye en el color de acento al
   final del recorrido. Si OSM no la tiene bien, pasa `huella` (GeoJSON) y `altura` en metros.
5. **Relevo al edificio real** (lo que en ref8 es un corte seco): en el último tramo, funde a la foto/render del
   cliente **encuadrado con la misma cámara** que la parada final (mismo ángulo y posición en pantalla). Así el mapa
   "se convierte" en la foto en vez de saltar.
6. **Precarga** las teselas de la ruta (`m.precargar({ senal })`) mientras se lee la intro y córtala cuando la sección
   asome. Sin esto, al bajar rápido se ven teselas borrosas.
7. **Verifica** con `verificar-scroll.mjs` (escritorio, móvil, menos movimiento; 0 errores) con `--espera 4000`
   (las teselas tardan) y mira las capturas: ¿el destino se queda centrado?, ¿se lee el texto?, ¿atribución visible?

## Código base (probado)
- [scripts/mapa-scroll.js](scripts/mapa-scroll.js): `crearMapaScroll({ contenedor, maplibregl, estilo, paradas,
  satelite, resaltar, … })` → `{ progreso(p), precargar(), proyectar(lngLat), resaltado, destruir(), mapa }`.
  Interpola la cámara anclando el destino (no "patina"), mete la ortofoto bajo las etiquetas, extruye los edificios,
  resalta el destino, oculta los POI y deja el mapa no interactivo.
- Demo completa: `demos/mapa/` (Barcelona, Torre Glòries como ubicación de ejemplo; capturas en `capturas/demo-mapa/`).

## Trampas (todas vividas)
- **MapLibre 6 no tiene export por defecto:** `import * as maplibregl from 'maplibre-gl'`.
- **Vite pierde el worker** (pre-empaqueta maplibre en `.vite/deps`): `import urlWorker from
  'maplibre-gl/dist/maplibre-gl-worker.mjs?url'; maplibregl.setWorkerUrl(urlWorker)`. Si no: "Worker failed to load".
- **MapLibre pesa ~1,1 MB** (300 KB gzip): cárgalo con `await import('maplibre-gl')` para que vaya en su propio
  trozo y no frene el primer pintado (el worker sale como asset aparte con `?url`; probado en `vite build` + preview).
- **El lienzo se queda en 0 px:** el CSS de MapLibre (`.maplibregl-map { position: relative }`) llega después del
  tuyo. Sube la especificidad (`.escenario > .lienzo { position: absolute; inset: 0 }`).
- **Interpolar lng/lat y zoom por separado marea** (el destino se va de lado y vuelve). Mueve el centro en Mercator en
  proporción a 1/escala (lo hace el motor).
- **No uses `flyTo`/`easeTo` con scroll:** animan por su cuenta y pelean con el scrub. `jumpTo` por frame (en rAF).
- **`fadeDuration: 0`** y `raster-fade-duration: 0`: con scrub, el fundido de teselas parece parpadeo.
- **`querySourceFeatures` devuelve la huella recortada por tesela:** un edificio entre dos teselas llega en trozos.
  El motor junta los trozos gemelos (misma altura, que se tocan). Y devuelve también teselas de zoom bajo aún
  cargadas, con los edificios **fusionados por manzana**: sin cuidado se pinta media manzana de naranja (nos pasó en
  móvil). El motor detecta desde z15, elige la huella más pequeña que contiene el punto y la mejora hasta z16,5.
- **Peso:** el recorrido completo mueve 25-60 MB de teselas (medido: 60 MB escritorio con precarga, 26 MB móvil). Es
  red, no bloquea el primer pintado, pero en móvil con datos conviene menos pasos de precarga y paradas más cortas.
- **Volúmenes translúcidos parecen cristal.** O maqueta opaca (0,9) sobre la ortofoto, o solo el destino extruido.
- **Etiquetas e iconos:** a pie de calle el estilo llena la vista de POI ajenos (`ocultarPuntos` los quita). Los
  avisos "Expected value to be of type number… highway-shield" son del estilo `liberty`, no tuyos (avisos, no errores).
- **Mapa interactivo = scroll secuestrado.** `interactive: false` siempre en la versión con scroll.
- **Sin WebGL o sin red** el mapa no carga: captura el error y deja textos y ficha visibles (lo hace la demo).
- **Atribución**: no la tapes con la ficha ni con el velo; en móvil, compacta pero visible.
- **Tráfico alto**: el WMTS del IGN no publica cupo. Para una web con mucho tráfico, descarga y aloja las teselas de
  la zona (PNOA lo permite, CC BY). Las de servicios comerciales **no** se pueden cachear ni alojar.

## Rendimiento y accesibilidad
- `pixelRatio` tope 2 (1,5 en móvil); el mapa solo pinta cuando cambia la cámara (no hay bucle propio).
- Zooms de 11 a 17,5 cargan ~60-120 teselas raster + vectoriales: precarga y `preconnect` a los dos dominios.
- Móvil: paradas con 0,5-0,7 menos de zoom (pantalla estrecha), menos pasos de precarga, textos arriba.
- `prefers-reduced-motion`: sin recorrido; vista final fija con la ficha visible.
- El lienzo lleva `aria-hidden`: la dirección y lo importante, en HTML (y un enlace "Abrir en el mapa" si procede).

## Checklist
- [ ] Ortofoto y estilo con licencia que permite el uso (y comercial si lo es); atribución en el mapa y en el pie.
- [ ] Destino centrado y quieto durante el acercamiento; el resalte aparece al final, no antes.
- [ ] Relevo a material real alineado con la última parada (o, sin material, ficha clara del edificio).
- [ ] Precarga cortada al entrar; nada de teselas a medio cargar en las capturas.
- [ ] Móvil y menos movimiento revisados; 0 errores en consola; sin claves en el repo.
