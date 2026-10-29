# Ecosistema de webs premium (investigación 2026-10-24)

Versiones de npm a 24-10-2026. [?] = sin confirmar.

## Núcleo
| Pieza | Versión / licencia | Cuándo |
|---|---|---|
| three.js | 0.186.1 (r186), MIT | Base de todo el 3D. `WebGLRenderer` sigue siendo lo seguro en producción; `WebGPURenderer` (cae a WebGL2) + TSL para compute/partículas masivas. Desde r183 `PostProcessing` → `RenderPipeline`. |
| Loaders | `three/addons/loaders/` | GLTFLoader + DRACOLoader + KTX2Loader(`detectSupport(renderer)`) + `setMeshoptDecoder` (`three/addons/libs/meshopt_decoder.module.js`). Meshopt suele ganar a Draco (decodifica más rápido, comprime animación). |
| @react-three/fiber | 9.8.2, MIT | Si el proyecto ya es React/Next. v10 alfa = WebGPU. |
| @react-three/drei | 10.7.9, MIT | ScrollControls/useScroll, useGLTF, Environment, MeshTransmissionMaterial, Float, PerformanceMonitor, AdaptiveDpr, View. |
| @react-three/postprocessing | 3.2.2, MIT | Postpro en R3F. |
| 14islands/r3f-scroll-rig | MIT | Sincroniza DOM ↔ meshes WebGL con Lenis. |
| OGL | 1.0.11, Unlicense | ~30 KB; galerías de imágenes con shaders (estilo Codrops). Poco activo. |
| Babylon.js | 9.32, Apache-2.0 | Configuradores / tipo juego. |
| Spline | runtime propietario (~500 KB+ [?]) | Prototipos; malo para LCP. Hay `splinetool/spline-skills`. |
| Theatre.js | 0.7.2 (2024), parado | No usar en proyectos nuevos. |
| GSAP | 3.15.0, "Standard no charge" | Gratis entero (ScrollTrigger, ScrollSmoother, SplitText, Flip, MorphSVG…). Revisar cláusula de competencia con Webflow antes de vender plantillas [?]. |
| Lenis | 1.3.27, MIT | Scroll suave estándar. `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0)`. Nunca con ScrollSmoother a la vez. |
| Locomotive Scroll v5 | 5.0.1, MIT | Lenis + parallax declarativo (`data-scroll-speed`). |
| Motion | 14.6.0, MIT | UI en React; scroll acelerado con ScrollTimeline. |
| CSS scroll-driven | Chrome 115+, Safari 26, Firefox 159 (27-10-2026) | 1ª opción para reveals/parallax/progreso; `@supports (animation-timeline: view())`. |
| View Transitions | same-doc Baseline (FF144); cross-doc Chrome 126+/Safari 18.2+, Firefox [?] | MPA/Astro sin router. |
| Swup 4.10 / Taxi 2.0 / Barba 2.10 | MIT / BSD / MIT | Transiciones con canvas WebGL persistente. Barba poco activo. |

## Herramientas 3D y efectos
- glTF-Transform 4.5.1 (MIT): `gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 2048`. KTX2 (`uastc`/`etc1s`) necesita `toktx`. Paso obligatorio antes de servir un .glb.
- gltfjsx 6.5.3: `npx gltfjsx model.glb --transform --types` (sin release desde 2024).
- glTF Viewer (gltf-viewer.donmccurdy.com) para inspeccionar.
- Activos libres: Poly Haven (CC0: HDRI, texturas, modelos), Khronos glTF-Sample-Assets (licencia por modelo), ambientCG (CC0), Sketchfab (filtrar CC0/CC-BY).
- pmndrs/postprocessing 6.39.5 (Zlib): bloom, DOF, SMAA, tone mapping, agrupa efectos en un pase.
- three-gpu-pathtracer: renders fotorrealistas fijos.
- Shaders: LYGIA (licencia Prosperity: solo no comercial gratis, ¡ojo!), The Book of Shaders.
- curtains.js: mantenimiento mínimo; hoy three/OGL + sincronía DOM.
- GPGPU: `GPUComputationRenderer` (WebGL) o compute TSL (WebGPU). Fluidos: PavelDoGreat/WebGL-Fluid-Simulation (MIT).
- Gaussian splatting: Spark 2.4 (MIT, World Labs, para three, LoD y móvil) recomendado; SuperSplat para editar.

## Referencias de efectos (para futuras skills)
Codrops (tympanus.net/codrops/tag/webgl, github.com/codrops):
- Distorsión y grano al scroll: /2024/07/18/how-to-create-distortion-and-grain-effects-on-scroll-with-shaders-in-three-js/
- Hover con distorsión: /2019/10/21/how-to-create-motion-hover-effects-with-image-distortions-using-three-js/
- Shaders con GSAP: /2025/10/08/how-to-animate-webgl-shaders-with-gsap-ripples-reveals-and-dynamic-blur-effects/
- Galería circular OGL: /2021/02/23/creating-an-infinite-circular-gallery-using-webgl-with-ogl-and-glsl-shaders/ (github.com/bizarro/infinite-circular-webgl-gallery); /2024/12/03/how-to-create-a-webgl-rotating-image-gallery-using-ogl-and-glsl-shaders/
- Carrusel 3D: github.com/codrops/3DCarousel
- Cámara sobre curva de Blender con scroll: /2026/07/07/building-a-scroll-driven-3d-gallery-using-a-blender-camera-path-with-three-js-and-gsap/
- Texto 3D al scroll: /2025/02/03/building-an-on-scroll-3d-circle-text-animation-with-three-js-and-shaders/ y /2026/10/13/scroll-driven-ghost-trails/
- Transición de página WebGPU persistente: /2026/06/30/building-persistent-page-transitions-with-webgpu-and-vanilla-javascript/; GSAP+Three+Astro+Barba: /2026/02/02/...
- Galería por velocidad de scroll: /2026/03/09/...; parallax horizontal DOM→WebGL: /2026/02/19/...; mundo 3D por scroll: /2026/04/28/...; atmósfera ligera: /2026/07/10/the-sleepers-...
Casos: Igloo Inc (awwwards.com/igloo-inc-case-study.html), Lusion, Active Theory, 14islands, darkroom.engineering, Bruno Simon (folio-2025 MIT). Colecciones: AxiomeCG/awesome-threejs, terkelg/awesome-creative-coding, threejs.org/examples, drei.docs.pmnd.rs.

## Skills/marketplaces parecidos (aparte de los 3 instalados)
| Repo | Qué | Actividad | Licencia |
|---|---|---|---|
| CloudAI-X/threejs-skills | 13 skills three (r186, R3F 9.8, gltf-transform 4.5) | ~3.7k★, oct-2026 | MIT |
| juliobsz/skills (awwwards) | director creativo + dev; GSAP+Lenis+OGL; verifica en navegador | ~930★, oct-2026 | MIT |
| MengTo/Skills | cinematic-scroll-storytelling, cinematic-gsap-lenis-motion-system | ~7k★ | MIT |
| freshtechbro/claudedesignskills | 27 plugins (three, GSAP, R3F, Babylon, Spline, Rive…) | ~1.1k★, parado nov-2025 | MIT |
| majidmanzarpour/threejs-game-skills | juegos three | ~2.6k★ | MIT |
| EnzeD/r3f-skills | R3F | ~130★ | sin licencia |
| iart-ai/web-animation-skills | GSAP, SVG, Lottie | ~54★ | MIT |
| Impertio-Studio/Three.js-Claude-Skill-Package | 24 skills three | ~23★ | MIT |
| flash-hero/GOATED-UI-SKILL | 474 recetas | ~5★ | MIT |
| splinetool/spline-skills | oficial Spline | nuevo | MIT |
| Higgsfield (skill oficial para Claude, 4-6-2026) | kit de marca → web con scroll, vía MCP Higgsfield + Remotion | — | — |
Directorios: claudemarketplaces.com, mcpmarket.com/tools/skills, skillsdirectory.com, skills.sh, claudepluginhub.com.
Hueco libre: pipeline de assets con presupuestos por dispositivo, accesibilidad/fallback, recetas verificadas, y una maestra que combine.

## Buenas prácticas
- LCP: héroe en HTML real (titular + `<img fetchpriority="high">` póster); el canvas encima, con fundido cuando su primer frame está listo.
- Carga diferida: `import()` de three tras idle o al entrar en viewport; decodificadores servidos en local.
- DPR: `Math.min(devicePixelRatio, 2)` (1–1,5 en móvil); R3F `dpr={[1,2]}` + PerformanceMonitor.
- Pausar render fuera de pantalla (IntersectionObserver + `visibilitychange`); render bajo demanda si la escena es estática.
- Presupuesto móvil (heurístico): <100 draw calls, 100–300k triángulos, texturas ≤2048 (KTX2), <2–5 MB de 3D inicial, 1–3 pases de postpro, instancing, sombras horneadas, `dispose()`.
- `@pmndrs/detect-gpu` 6.0.27: tier 0–1 o móvil → póster o escena reducida.
- Un único bucle RAF (gsap.ticker o Lenis). DOM: solo transform y opacity.
- Accesibilidad: `prefers-reduced-motion` (sin Lenis, sin scrub/parallax, póster); contenido real en HTML; canvas `aria-hidden` o `role="img"`; foco visible y equivalentes HTML de lo clicable en 3D; no scroll-jacking; contraste sobre el frame más desfavorable; página completa sin JS/WebGL; `webglcontextlost`.
