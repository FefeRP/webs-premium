# Revision de ref4-vid-20261024.mp4

> 2026-10-24 21:21 | gemini-3.8-flash | video/mp4 | 3 fps | tokens: 28615 entrada, 2144 salida, 1147 pensamiento | coste aprox. 0.0338 USD
> Instrucciones: Eres un desarrollador front-end experto en webs "premium" (3D, WebGL, scroll cinematografico, parallax, scroll-scrubbing de video, shaders). Analiza este video (suele ser un reel que ensena webs). Responde en espanol, muy detallado y tecnico: 1) TRANSCRIPCION literal de todo lo que se dice (voz) y de TODO el texto que aparezca en pantalla (titulos, URLs, nombres de repos de GitHub, nombres de librerias, nombres de webs/marcas, descripciones). Copia exactamente nombres de usuario/repo de GitHub y URLs aunque salgan pequenos. 2) Para cada web o seccion que aparece (con marcas mm:ss): describe que se ve y cada EFECTO visual uno por uno (que pasa al hacer scroll, al mover el raton, transiciones, profundidad, 3D, particulas, texto animado, distorsiones, etc.). 3) Para cada efecto: con que tecnologia se logra con mayor probabilidad (three.js/R3F con modelo glTF, shader GLSL, GSAP ScrollTrigger con pin y scrub, Lenis smooth scroll, secuencia de frames en canvas, video con currentTime, parallax por capas CSS/JS, CSS scroll-driven animations, view transitions, Spline, etc.) y COMO se implementaria paso a paso. Indica si es 3D real o fake-3D (video/frames/capas). 4) Lista final: tecnologias, librerias y repos mencionados o deducidos, con nivel de confianza.

## Resumen

El video es un microtutorial de formato vertical (Reel / TikTok) producido por la cuenta `@DESIGNGEMSTUDIO`. Muestra inicialmente una maqueta interactiva funcional ("Ice cream slider") ejecutada en un monitor en un entorno oscuro (00:00-00:07) y posteriormente explica de forma acelerada cómo recrear dicha animación de carrusel/slider dentro de Figma mediante Smart Animate y variantes de componentes (00:07-00:30), finalizando con una llamada a la acción / logotipo de Instagram (00:30-00:34). 

Técnicamente, el concepto visual en Figma emula un sitio web editorial de lujo con efectos de parallax de ingredientes flotantes, cambio de tipografías por clipping masks/frames anidados y zoom de producto central. A nivel de front-end real, esto se traduce conceptualmente en un slider sincronizado mediante WebGL/Three.js o GSAP Flip / ScrollTrigger. El video tiene fallos de ritmo, falta de información clave en los pasos de Figma, recortes tipográficos agresivos y un corte de audio final tosco.

---

## Linea de tiempo

* **00:00 - 00:01**: Plano fijo del monitor físico. Texto superior centrado *"ICE CREAM SLIDER IN FIGMA"*. El usuario pulsa con el ratón la flecha derecha. Transición en pantalla de "Ruby Velvet Swirl" (cereza) a "Violet Bloom Swirl" (higo). Comienza la pista de música instrumental y vocalización.
* **00:01 - 00:03**: Animación suave de elementos tipográficos y rotación de frutas en el monitor. El audio canta *"the way you..."* sincronizado sin acento percusivo específico.
* **00:03 - 00:04**: Segundo clic del usuario. Transición hacia "Amber Caramel & Amalfi Lemon".
* **00:05 - 00:06**: Tercer clic hacia "Midnight Blueberry & Wild Nectar Swirl". Los ingredientes flotantes cambian de posición.
* **00:07**: **Corte directo** a captura de pantalla vertical en Figma (lienzo oscuro). Aparece el sticker de Instagram `@DESIGNGEMSTUDIO` arriba a la derecha. Pista de audio canta *"whisper to me"*.
* **00:07 - 00:09**: Texto inferior: *"Select all titles and apply Frame Selection"*. Menú contextual con clic derecho sobre la tira de títulos.
* **00:08 - 00:09**: Texto inferior cambia a: *"Adjust the opacity"*. Se añade autolayout y se ajusta el frame a la pantalla del MacBook Pro.
* **00:09 - 00:11**: **Corte/salto de paso**. Texto inferior: *"Select all text layers and apply Frame Selection"*. Se encuadran los bloques de descripción y botón "Buy Now" apilados verticalmente y se reduce la altura del frame padre con *clip content*.
* **00:11 - 00:12**: Inserción rápida del frame en la maqueta base a 00:11.
* **00:12 - 00:14**: **Corte**. Texto inferior: *"Select all ice cream elements, align them and resize them"*. Se alinean verticalmente los conos de helado.
* **00:13 - 00:14**: Texto inferior: *"Apply Frame Selection"*. Se empaquetan en un frame vertical.
* **00:14 - 00:15**: **Corte**. Inserción del cono en el frame del MacBook y salto a una capa de frutas sueltas ("Frame 62"). Texto inferior: *"Select all elements"*.
* **00:15 - 00:16**: Menú contextual: texto inferior: *"Create a Component"*.
* **00:16 - 00:17**: Menú contextual: texto inferior: *"Add Variant"*.
* **00:17 - 00:19**: Texto inferior: *"Change the position of the elements"*. El cursor desplaza manualmente trozos de cereza y hojas dentro del marco delimitador.
* **00:19 - 00:20**: **Corte temporal**. Se muestran verticalmente 5 marcos con los diferentes ingredientes de cada sabor. Texto inferior: *"Select all components except the first one"*.
* **00:20 - 00:22**: Menú contextual. Texto inferior: *"Choose Variant 2"*.
* **00:22 - 00:27**: **Corte**. Dos marcos de página completos apilados. Texto inferior: *"Duplicate the design"* (00:21) y cambia a *"Replace all elements with the next ones"* (00:22-00:27). Se desplaza el slider vertical de textos, el cono activo y el fondo.
* **00:27 - 00:30**: **Zoom out** mostrando los 5 layouts apilados. Aparece cableado de prototipado. Texto inferior: *"Connect all frames and use these settings"*. Se abre modal flotante: `Interaction: On click -> Navigate to -> Smart animate, Gentle, 2400ms`.
* **00:30**: **Corte directo** a pantalla negra con logo de Instagram animado en degradado fucsia/naranja y texto `@DESIGNGEMSTUDIO`.
* **00:30 - 00:34**: Estática final en negro. El audio corta con un fade-out brusco a 00:30 y decae a silencio total.

---

## Que se ve / se oye

* **Visual**:
  * Monitor Ultrawide curvo montado en brazo con iluminación posterior cian/azul suave. Teclado delgado y mano interactuando con el ratón.
  * Diseño web UI "Super Cono" (SC.) de helados gourmet con fondo degradado oscuro, tipografía display serif elegante con ligaduras, layout asimétrico, botón de CTA tipo píldora translúcido ("Buy Now"), selector numérico/dots a la izquierda y miniaturas a la derecha con flechas de navegación `← →`.
  * Tutorial en Figma en modo oscuro mostrando operaciones de framing, clips de contenido, componentes interactivos y panel de Prototyping (`Smart animate` + `Gentle`).
* **Audio**:
  * Canción de fondo: *Milky - Just The Way You Are*.
  * No hay locución explicativa ni efectos de sonido de interfaz (clicks, whooshes de Figma o deslizamientos).
  * Sincronía: La música actúa meramente como fondo musical ("royalty/trending audio"). No existe correspondencia rítmica exacta entre los cortes de edición y el compás musical.

---

## Problemas (de mas a menos grave)

1. **Gravedad Alta (Didáctica / Contenido en 00:22-00:27)**: El paso *"Replace all elements with the next ones"* omite la clave técnica de Figma para que funcione `Smart Animate`: mantener exactamente la misma jerarquía de capas y nombres de capa entre frames hermanos. Si un usuario principiante solo "reemplaza", Smart Animate generará una disolución cruzada en lugar de una transición vectorial fluida de posición/escala.
2. **Gravedad Media (Tipografía y legibilidad en 00:07-00:10 y 00:19-00:20)**: El texto dentro del lienzo de Figma queda diminuto e ilegible en pantallas de móvil debido al formato vertical extremo de captura de una pantalla horizontal panorámica (zoom insuficiente del lienzo).
3. **Gravedad Media (Audio y cierre en 00:30-00:34)**: El video se corta de golpe visualmente y deja casi 4 segundos de pantalla prácticamente estática con la tarjeta de Instagram, interrumpiendo la melodía sin un remate musical limpio ni bucle (looping) continuo.
4. **Gravedad Baja (UI y ergonomía visual en 00:24-00:26)**: El menú flotante de selección de propiedades tapa la zona donde se está produciendo el cambio en el canvas, impidiendo comprobar qué variant switch se está activando exactamente.

---

## Sugerencias

1. Añadir zooms dinámicos (crop in) sobre el panel de capas y el canvas de Figma para que los nombres de los frames (`Frame 44`, `Frame 63`, etc.) sean legibles en smartphones.
2. Incluir una nota de texto emergente en 00:23 recordando: *"Mantén el mismo nombre de capas en todos los frames para activar Smart Animate correctamente"*.
3. Sustituir los 4 segundos finales estáticos (00:30-00:34) por una recapitulación del resultado final funcionando en el prototipo en bucle perfecto, fundiendo el audio de forma continua.
4. Agregar efectos de sonido sutiles de UI (sonido de "click" y "swoosh" sutil en 00:01, 00:03 y 00:28) para dotar de dinamismo técnico al tutorial.

---

## Veredicto

**Retocar**. El concepto visual y el resultado del diseño son atractivos y de alta calidad estética, pero el ritmo de la explicación técnica omite pasos críticos de Figma y el remate final (00:30-00:34) desmerece el acabado general del clip.
