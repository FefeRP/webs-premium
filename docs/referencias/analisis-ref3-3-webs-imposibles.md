# Revision de ref3-3-webs-imposibles.mp4

> 2026-10-24 21:22 | gemini-3.8-flash | video/mp4 | 2 fps | tokens: 32908 entrada, 4993 salida, 628 pensamiento | coste aprox. 0.0458 USD
> Instrucciones: Eres un desarrollador front-end experto en webs "premium" (3D, WebGL, scroll cinematografico, parallax, scroll-scrubbing de video, shaders). Analiza este video (suele ser un reel que ensena webs). Responde en espanol, muy detallado y tecnico: 1) TRANSCRIPCION literal de todo lo que se dice (voz) y de TODO el texto que aparezca en pantalla (titulos, URLs, nombres de repos de GitHub, nombres de librerias, nombres de webs/marcas, descripciones). Copia exactamente nombres de usuario/repo de GitHub y URLs aunque salgan pequenos. 2) Para cada web o seccion que aparece (con marcas mm:ss): describe que se ve y cada EFECTO visual uno por uno (que pasa al hacer scroll, al mover el raton, transiciones, profundidad, 3D, particulas, texto animado, distorsiones, etc.). 3) Para cada efecto: con que tecnologia se logra con mayor probabilidad (three.js/R3F con modelo glTF, shader GLSL, GSAP ScrollTrigger con pin y scrub, Lenis smooth scroll, secuencia de frames en canvas, video con currentTime, parallax por capas CSS/JS, CSS scroll-driven animations, view transitions, Spline, etc.) y COMO se implementaria paso a paso. Indica si es 3D real o fake-3D (video/frames/capas). 4) Lista final: tecnologias, librerias y repos mencionados o deducidos, con nivel de confianza.

## Resumen

El video analizado (00:00-00:58) es un contenido promocional en formato vertical (*reel/short*) del creador "Sanjai Builds" enfocado en desarrollo web avanzado e inteligencia artificial. Presenta tres sitios web con interacciones complejas (*Sweet Tape*, *ERA Residence*, *Nick Ho*) y los repositorios de GitHub asociados a *skills* para agentes de IA (Cursor, Claude Code, etc.) que permiten replicar dichos efectos (GSAP, Lenis, Three.js, WebGL/shaders). 

Técnicamente, el ritmo visual es ágil y utiliza recursos tipo *clay/3D flat*, mockups de navegador animados y capturas reales de repositorios y sitios web. Presenta algunos problemas de legibilidad tipográfica por tamaño y contraste en las capturas de código/GitHub, recortes en vistas móviles y una sincronización de subtítulos que en ciertos momentos se adelanta a la locución.

---

## Linea de tiempo

* **00:00 - 00:03**: 
  * *Visual*: Fondo verde brillante (#84f800 aprox.) con retícula de puntos. Animación de entrada de tarjetas de navegador inclinadas y texto central. Aparece el titular "These 3 websites look almost impossible to build." con icono de rayo 3D bordado.
  * *Texto en pantalla*: `SANJAI BUILDS · WEB PACK`, `These 3 websites look almost impossible to build.`.
  * *Transición / Movimiento*: Pop-up con *overshoot/spring* de las ventanas y palabras.
  * *Audio / SFX*: Efecto de *pop* / chasquido ligero al entrar cada bloque de texto y ventana (sincronía simultánea, desfase <30 ms). Locución: *"These three websites look almost impossible to build."*

* **00:03 - 00:08**:
  * *Visual*: Transición rápida mediante barrido/corte a fondo verde oscuro con retícula. Surge una ventana de navegador estilo arcilla/bordado 3D, una lupa animada, una carpeta con código (`</>`), logo de GitHub y un robot azul sonriente del que brotan esferas de colores.
  * *Texto en pantalla*: `So I found what powers them`, `and the GitHub repos that teach your AI to build like this.`.
  * *Transición / Movimiento*: Escala y flotación (*floating idle*) de los elementos 3D vectoriales/rasterizados con animación de resorte.
  * *Audio / SFX*: Sonidos de inserción suaves (*whoosh*, *clic* de interfaz). La voz dice: *"So I found what powers them, and the GitHub repos that teach your AI to build like this."*.

* **00:08 - 00:22**:
  * *Visual*: Transición a ventana 1 (*Sweet Tape*). Encabezado `01 / 03 · WEBSITE` con fondo verde neón. El mockup muestra la animación de la cinta adhesiva y el scroll interactivo. Abajo aparecen chips interactivos de librerías (`Next.js`, `GSAP`, `Three.js`, `Lenis`). A partir de 00:15 se reduce la ventana y aparece la tarjeta del repositorio GitHub `nateherkai / scroll-craft` con demostraciones de scroll cinemático y badges: `Cinematic scrolling`, `Responsive motion`, `Clean structure`.
  * *Texto en pantalla*: `01 / 03 · WEBSITE`, `Sweet Tape.`, `sweet-tape.com`, `Next.js`, `GSAP`, `Three.js`, `Lenis`, `THE SKILL TO BUILD IT: Scroll Craft`, `nateherkai / scroll-craft`, `SKILL`, `Cinematic scrolling`, `Responsive motion`, `Clean structure`.
  * *Transición / Movimiento*: Zoom progresivo y desplazamiento vertical en el mockup; entrada lateral y rebote de badges.
  * *Audio / SFX*: Sonido de despegue/cinta adhesiva y clics mecánicos al aparecer los badges tecnológicos. Locución: *"First, Sweet Tape. Its stack includes Next.js, GSAP, Three.js, and Lenis. For this, check out Scroll Craft. It teaches your coding agent cinematic scrolling, responsive motion, and clean animation structure."*

* **00:22 - 00:34**:
  * *Visual*: Transición por cambio de color a magenta/púrpura oscuro. Encabezado `02 / 03 · WEBSITE`. Mockup de `era-residence.com`. Despliegue de fotos de arquitectura con transiciones suaves, reveal tipográfico y paneo de piscina. Chips: `Webflow`, `GSAP`. En 00:27 transición a pantalla de GitHub: `greensock / gsap-skills`. Badges: `Timelines`, `ScrollTrigger`, `SplitText`, `Sequencing`.
  * *Texto en pantalla*: `02 / 03 · WEBSITE`, `ERA Residence.`, `era-residence.com`, `Webflow`, `GSAP`, `THE SKILL TO BUILD IT: GSAP Skills`, `greensock / gsap-skills`, `OFFICIAL`, `Timelines`, `ScrollTrigger`, `SplitText`, `Sequencing`.
  * *Transición / Movimiento*: Desplazamiento de página web emulando *ScrollTrigger* y apertura de dropdown en el README del repo.
  * *Audio / SFX*: Clics rápidos tipo tecla mecánica al aparecer las etiquetas de GSAP. La locución dice: *"Second, ERA Residence. This one uses Webflow and GSAP. Here, I'd use the official GSAP Skills repo. It teaches timelines, ScrollTrigger, SplitText, and proper sequencing."*

* **00:34 - 00:44**:
  * *Visual*: Transición a fondo negro con matriz de puntos. Encabezado `03 / 03 · WEBSITE`. Mockup de `nickho-motorsports.nl`. Contador numérico animado (`98`), aparición de foto de piloto de F1/automovilismo, rejilla tipográfica y casco 3D giratorio. Chips: `Webflow`, `GSAP`, `Three.js`. En 00:39 cambia al repo `iart-ai / webgl-animation-skills`. Muestra esferas con shaders, partículas y cubos 3D de fieltro.
  * *Texto en pantalla*: `03 / 03 · WEBSITE`, `Nick Ho.`, `nickho-motorsports.nl`, `Webflow`, `GSAP`, `Three.js`, `THE SKILL TO BUILD IT: WebGL Skills`, `iart-ai / webgl-animation-skills`, `3D`, `shaders`, `particles`, `interactive 3D`.
  * *Transición / Movimiento*: Rotación interactiva de objeto 3D en mockup y aparición secuencial de iconos 3D renderizados.
  * *Audio / SFX*: Efecto de aceleración/motor sutil y golpes secos (*thuds*) con los iconos 3D. Locución: *"Third, Nick Ho. It combines Webflow, GSAP, and Three.js. For this style, WebGL Animation Skills helps with shaders, particles, and interactive 3D."*

* **00:44 - 00:52**:
  * *Visual*: Fondo degradado magenta-naranja vertical con texto: `And these are only three.`. Transición (00:46) a fondo marfil texturizado con navegador mostrando un carrusel de 10 repositorios (`github.com/MengTo/Skills`, `github.com/iart-ai/web-animation-skills`, `github.com/anthropics/skills`, `github.com/mrdoob/three.js`, `github.com/darkroomengineering/lenis`, `github.com/pmndrs/drei`). Trofeos y elementos 3D decorativos en las esquinas.
  * *Texto en pantalla*: `And these are only three.`, `THE FULL PACK · 10 REPOS`, `I collected more repos.`, URLs de los 10 repositorios, badges temáticos: `Awwwards-style layouts`, `smooth scrolling`, `3D and web animation.`.
  * *Audio / SFX*: Locución: *"And these are only three. I collected more repos for Awwwards-style layouts, smooth scrolling, 3D, and web animation."*

* **00:52 - 00:58**:
  * *Visual*: Pantalla final verde con Call-to-Action (CTA). Barra de comentarios interactiva simulada donde se escribe automáticamente `WEB`. Aparece notificación de DM tipo mensaje instantáneo (`Sent! The full GitHub pack is in your DMs.`), botón `Follow Sanjai Builds` con animación de confeti y caja de regalo 3D.
  * *Texto en pantalla*: `FREE · FULL GITHUB PACK`, `Comment WEB`, `Add a comment...`, `Sent! The full GitHub pack is in your DMs.`, `Follow Sanjai Builds`, `for more.`.
  * *Audio / SFX*: Sonido de teclado escribiendo (00:52.5), sonido de notificación / "burbuja" de mensaje enviado (00:53.8, sincronía exacta), sonido de matraca de fiesta/pop de confeti (00:54.2). Locución: *"Comment WEB and I'll send you the full GitHub pack. Follow Sanjai Builds for more."*

---

## Que se ve / se oye

### 1. Transcripción Literal
* **Voz en off**:
  > *"These three websites look almost impossible to build. So I found what powers them, and the GitHub repos that teach your AI to build like this. First, Sweet Tape. Its stack includes Next.js, GSAP, Three.js, and Lenis. For this, check out Scroll Craft. It teaches your coding agent cinematic scrolling, responsive motion, and clean animation structure. Second, ERA Residence. This one uses Webflow and GSAP. Here, I'd use the official GSAP Skills repo. It teaches timelines, ScrollTrigger, SplitText, and proper sequencing. Third, Nick Ho. It combines Webflow, GSAP, and Three.js. For this style, WebGL Animation Skills helps with shaders, particles, and interactive 3D. And these are only three. I collected more repos for Awwwards-style layouts, smooth scrolling, 3D, and web animation. Comment WEB and I'll send you the full GitHub pack. Follow Sanjai Builds for more."*

* **Texto en pantalla (marcas, URLs y repositorios)**:
  * Creador: `SANJAI BUILDS`
  * Sitio 1: `sweet-tape.com` | Stack: `Next.js`, `GSAP`, `Three.js`, `Lenis`.
  * Repo 1: `nateherkai / scroll-craft` | Habilidades: `Cinematic scrolling`, `Responsive motion`, `Clean structure`.
  * Sitio 2: `era-residence.com` | Stack: `Webflow`, `GSAP`.
  * Repo 2: `greensock / gsap-skills` (Oficial GreenSock) | Habilidades: `Timelines`, `ScrollTrigger`, `SplitText`, `Sequencing`.
  * Sitio 3: `nickho-motorsports.nl` | Stack: `Webflow`, `GSAP`, `Three.js`.
  * Repo 3: `iart-ai / webgl-animation-skills` (etiqueta `3D`) | Habilidades: `shaders`, `particles`, `interactive 3D`.
  * Repositorios del pack extendido (00:46-00:51):
    * `github.com/MengTo/Skills` (03 / 10)
    * `github.com/iart-ai/web-animation-skills` (04 / 10)
    * `github.com/anthropics/skills` (05 / 10 - Frontend Design)
    * `github.com/mrdoob/three.js`
    * `github.com/darkroomengineering/lenis`
    * `github.com/pmndrs/drei`
    * `github.com/greensock/gsap-skills`
    * `github.com/nateherkai/scroll-craft`

---

### 2. Análisis Técnico de Efectos y Desarrollo Front-End

#### A. Web 1: `sweet-tape.com` (00:08 - 00:15)
* **Descripción de efectos**:
  1. *Cinta adhesiva desplegable (Hero/Scroll)*: Al hacer scroll, un rollo de cinta adhesiva texturizada gira sobre su propio eje en el centro de la pantalla mientras desenrolla tiras de cinta adhesiva que fijan tarjetas y fotos contra un cartón corrugado de fondo.
  2. *Deformación y desgarro*: Textura rugosa con mapas de normales y rugosidad que dan aspecto hiperrealista a la cinta de embalaje con microreflejos.
  3. *Inercia de scroll suave*: La página responde con una aceleración y frenado orgánico.
* **Tecnología probable e Implementación**:
  * **Tipo de 3D**: **3D Real** (Three.js / WebGL) combinado con DOM elástico.
  * **Stack**: Next.js + Three.js + GSAP ScrollTrigger + Lenis.
  * **Paso a paso**:
    1. Instalar `@studio-freight/lenis` o `lenis` para normalizar el scroll delta del navegador en el `requestAnimationFrame`.
    2. Crear un `<canvas>` WebGL a pantalla completa o sincronizado con un contenedor DOM mediante Three.js.
    3. Cargar el rollo de cinta como modelo `.glb` optimizado (material `MeshPhysicalMaterial` con valores de `roughness: 0.2`, `transmission: 0.1` y mapa de normales de arrugas).
    4. La tira desenrollada es una malla plana procedural (`PlaneGeometry`) con vértices deformados dinámicamente mediante un Vertex Shader que curva la malla según la posición del eje Y.
    5. Conectar la rotación `mesh.rotation.x` y el avance de la cinta mediante `gsap.to()` mapeado a `ScrollTrigger.create({ trigger: container, scrub: 1, pin: true })`.

#### B. Web 2: `era-residence.com` (00:22 - 00:27)
* **Descripción de efectos**:
  1. *Text Reveal & Masking*: Tipografía serif de lujo con revelado por máscara (*clip-path* o *overflow hidden* por líneas y caracteres).
  2. *Parallax de capas y cortina*: Imagen arquitectónica que escala suavemente (`scale: 1.1 -> 1.0`) a la par que la caja de texto se desliza a distinta velocidad angular.
  3. *Rueda de texto / Pin rotativo*: Una medalla circular tipo sello que rota con el scroll (`rotate: 360deg`).
* **Tecnología probable e Implementación**:
  * **Tipo de 3D**: **Fake 3D** (Composición 2.5D en capas DOM/CSS mediante transformaciones matriciales).
  * **Stack**: Webflow (maquetación base) + GSAP Core + ScrollTrigger + SplitText plugin.
  * **Paso a paso**:
    1. Dividir el texto del encabezado usando `SplitType` o `gsap SplitText` en `<div class="char">` o `<div class="line">` con `overflow: hidden` en el padre.
    2. Animar los caracteres con `gsap.from(".char", { yPercent: 100, stagger: 0.02, ease: "power4.out" })`.
    3. Configurar timeline maestro sincronizado con ScrollTrigger:
       ```javascript
       const tl = gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true, pin: true } });
       tl.to(".bg-image", { scale: 1, yPercent: 15 }, 0)
         .to(".badge-rotate", { rotation: 360 }, 0);
       ```

#### C. Web 3: `nickho-motorsports.nl` (00:34 - 00:39)
* **Descripción de efectos**:
  1. *Contador numérico acelerado*: Al cargar la vista, el número "98" cuenta rápidamente o se expande en escala con *motion blur*.
  2. *Rejilla tipográfica dinámica*: Distribución en rejilla tipo editorial que se separa al hacer scroll revelando el objeto central.
  3. *Casco de piloto interactivo 3D*: Casco de carreras en el centro que rota según la posición del cursor (efecto de seguimiento / *mouse parallax*) y continúa rotando en 3D mientras el scroll desplaza las placas de patrocinadores alrededor.
* **Tecnología probable e Implementación**:
  * **Tipo de 3D**: **3D Real** (Three.js con renderizado WebGL PBR).
  * **Stack**: Webflow / Custom Code + Three.js / React Three Fiber + GSAP.
  * **Paso a paso**:
    1. Exportar el modelo del casco en formato GLTF/GLB optimizado con Draco Compression y texturas KTX2 para carga instantánea.
    2. Configurar la escena en Three.js con un `EnvironmentMap` HDRI de estudio de iluminación automotriz para reflejos realistas en la visera del casco.
    3. Mapear el puntero del ratón con interpolación lineal (*lerp*):
       ```javascript
       window.addEventListener('mousemove', (e) => {
         targetRotationY = (e.clientX / window.innerWidth - 0.5) * Math.PI;
         targetRotationX = (e.clientY / window.innerHeight - 0.5) * 0.5;
       });
       // En el loop:
       helmet.rotation.y += (targetRotationY - helmet.rotation.y) * 0.05;
       helmet.rotation.x += (targetRotationX - helmet.rotation.x) * 0.05;
       ```
    4. Las capas HTML flotantes (logos de Porsche, GP Elite, McDonald's) se anclan mediante CSS grid y se mueven en dirección contraria con transformaciones `translate3d()` mediante GSAP ScrollTrigger para acentuar la profundidad.

---

## Problemas

* **Alta** (00:27-00:33 y 00:46-00:51): **Legibilidad nula en capturas de repositorios en dispositivos móviles**. Las capturas del archivo `README.md` y fragmentos de código del repositorio de GSAP y la vista de GitHub de 10 repos son textos diminutos e ilegibles. En una pantalla de smartphone de 6 pulgadas, la tipografía de código tiene una altura inferior a 1.5 mm.
* **Media** (00:15-00:21 y 00:27-00:33): **Sobrecarga cognitiva por competición visual**. La pantalla se divide simultáneamente en 4 focos de atención: el video del sitio web arriba a la izquierda, la captura del repo al centro, el robot animado abajo a la derecha y los subtítulos con badges brotando en el tercio inferior. El usuario no sabe si leer el código, mirar la interacción web o seguir los subtítulos.
* **Media** (00:00-00:02 y 00:52-00:55): **Contraste de color deficiente**. El texto blanco (`white`) sobre fondo verde lima neón (`#84f800`) no cumple con los criterios mínimos de contraste WCAG 2.1 AA (contraste aproximado 1.4:1, cuando se exige mínimo 4.5:1). Resulta molesto a la vista e ilegible para personas con sensibilidad visual.
* **Baja** (00:01-00:02): **Desfase en la animación de texto (*word highlight*)**. La palabra *"impossible"* se colorea de magenta unas fracciones de segundo (~120 ms) antes de que la voz en off termine de pronunciar la primera sílaba, provocando una ligera asincronía perceptiva.

---

## Sugerencias

1. **Hacer zoom a áreas clave del código (Punch-in zoom)** (00:28-00:33): En lugar de mostrar la página web de GitHub completa a escala reducida, realizar un zoom digital del 180% hacia la sección concreta del prompt o del bloque de código de ejemplo (ej. el bloque de `gsap.timeline`).
2. **Jerarquía visual más limpia**: Ocultar la miniatura del sitio web cuando se habla del repositorio (a partir de 00:16), o ubicar el sitio web a pantalla completa con el badge del repositorio superpuesto en formato *Picture-in-Picture* estilizado.
3. **Corrección de accesibilidad cromática**: Aplicar una sombra suave oscura o cambiar la tipografía sobre el verde lima a un verde bosque ultra oscuro (`#0b2904`) o negro neutro (`#111111`) en los primeros y últimos segundos para garantizar contraste óptimo.
4. **Sincronización milimétrica de subtítulos**: Reajustar la curva de animación de la palabra "impossible" a `00:01.350` para sincronizar el golpe de acento de la voz con el cambio de color magenta.

---

## Veredicto

**RETOCAR**. La edición visual, el diseño de sonido y la selección técnica de los sitios web y librerías son de alto nivel y muy atractivos para desarrolladores web. Sin embargo, requiere ajustes en el contraste de texto sobre el fondo verde neón y en la escala/zoom de las capturas de código de GitHub para que el valor didáctico del contenido sea legible en pantallas móviles.
