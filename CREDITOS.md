# Créditos y material de terceros

La licencia MIT de este repositorio cubre el código y los textos propios. Lo de abajo conserva su propia licencia.

## Activos
- **Chronograph Watch** (`demos/reloj/public/activos/ChronographWatch.glb` y sus derivados `public/modelos/reloj*.glb`, `public/frames/reloj/`, `fuente/`, `pruebas/capas-sombra/entrada/`, `pruebas/fotos-producto/`, `pruebas/lente-envase/activos/`, `docs/media/reloj-giro.gif`).
  - Origen: Khronos Group, [glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets).
  - Autor: Eric Chadwick. Licencia: [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
  - Modificado: sin placa de fondo, optimizado con gltf-transform (meshopt, WebP) y renderizado con three.js.
  - Incluye logotipos de Khronos y DGG, que son marcas de sus titulares; se usan solo como demostración.
  - Detalle en `demos/reloj/CREDITOS.md`.

## Datos de mapa (demo `demos/mapa/`; se piden en directo, no se guardan en el repo)
- Datos © [colaboradores de OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL), servidos por [OpenFreeMap](https://openfreemap.org) con el esquema y el estilo de [OpenMapTiles](https://openmaptiles.org).
- Ortofoto: PNOA cedido por © [Instituto Geográfico Nacional](https://www.ign.es) ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), scne.es).
- Las hojas de `capturas/demo-mapa/` muestran esos datos (ortofoto PNOA y mapa de OpenStreetMap) con su atribución visible en cada captura.
- La Torre Glòries es solo una ubicación de ejemplo; "Glòries 33" es una marca inventada, sin relación con el edificio.

## Activos de la prueba `pruebas/lente-envase/`
- Etiquetas de lata (marca inventada "Nébula") hechas con código (`hacer-etiquetas.mjs`); variantes rayos X y térmica del reloj (CC-BY, arriba) sacadas con ffmpeg.

## Ideas y código adaptado
- **nateherkai/scroll-craft** (MIT): carga del vídeo como blob, lerp hacia el objetivo sin encadenar seeks, y MP4 con fotogramas clave frecuentes para buscar rápido.
  - Adaptado y citado en `plugins/web-premium/skills/scroll-frames/scripts/video-scrubber.js` y `extraer-frames.mjs`.
- Librerías que usan las webs generadas (no incluidas en el repo; se instalan con npm): three.js (MIT), GSAP (licencia estándar de GSAP, gratuita), Lenis (MIT), Vite (MIT), MapLibre GL JS (BSD-3-Clause).

## Referencias analizadas
`docs/referencias/analisis-ref*.md` son análisis propios (comentario y descripción técnica) de vídeos públicos de otros creadores:
- Sanjai Builds
- @DESIGNGEMSTUDIO
- @ASCENTA.STUDIO
- @W.WEAREBRAND
- @RIKI.BOSSO
- y las webs que muestran

Los vídeos **no se distribuyen**; los derechos son de sus autores.
