# Revision de VID_20261025_125941_112.mp4

> 2026-10-25 22:49 | gemini-3.8-flash | video/mp4 | tokens: 3140 entrada, 3024 salida, 1663 pensamiento | coste aprox. 0.0199 USD
> Instrucciones: Eres un desarrollador frontend senior especializado en webs premium (Awwwards), three.js, MapLibre/Mapbox, GSAP ScrollTrigger y motion graphics. Analiza este video en espanol, con marcas de tiempo mm:ss. PRIMERA LINEA OBLIGATORIA: "TIPO: WEB" si es la grabacion de una pagina web real que se navega con scroll/raton, o "TIPO: MOTION" si es un motion graphic / animacion de video (After Effects, Blender, etc.) que no es una web. Justifica en una frase (cursor, barra de scroll, UI de navegador, ritmo de scroll...). Luego, a fondo: 1) Que se ve, escena a escena con mm:ss (textos, marca, ciudad o lugar si se reconoce, UI). 2) Camara: tipo de movimiento (zoom, picado/pitch, giro/bearing, vuelo), de donde a donde, ritmo, easing, si va ligado al scroll (scrub) o es automatico. 3) La transicion mapa -> zoom -> edificio: cuantas fases, como se pasa de mapa 2D/satelite a 3D/edificio (fundido, cambio de escala, modelo 3D, foto, video), que capas hay (mapa base, satelite, edificios extruidos, etiquetas, pines, rutas, UI, textos, nubes/niebla) y en que orden aparecen. 4) Aspecto del mapa: satelite real, vector estilizado, 3D fotorrealista (tipo Google Photorealistic 3D Tiles), render 3D propio, ilustracion; colores, luz, niebla, cielo. 5) Como lo harias tecnicamente para la web: librerias probables (MapLibre GL, Mapbox GL, deck.gl, Cesium, three.js, Google 3D Tiles, video prerenderizado en frames...), estructura de scroll (pin + scrub), y alternativa barata. 6) Rendimiento y movil: que pesaria, riesgos (teselas cargando a medias, parpadeos, WebGL en movil) y como evitarlos. 7) Que aporta para un marketplace de tecnicas web premium que aun no tengamos (ya tenemos: video->frames con scroll, parallax por capas, 3D glTF, vuelo multiescala por frames). 8) Fallos o cosas que se ven baratas. Se concreto y tecnico; no inventes lo que no se ve (dilo si no estas seguro).

TIPO: MOTION. Es una pieza de motion graphics / spot conceptual de Google Maps reproducida dentro de la línea de tiempo de un software de edición (DaVinci Resolve) en una pantalla externa, sin puntero de ratón, scroll nativo ni interfaz de navegador web.

---

## Resumen
El vídeo muestra un portátil de doble pantalla frente a una ventana en Londres (con Tower Bridge de fondo). En la pantalla superior se reproduce un spot conceptual en animación 3D estilizada para Google Maps, ambientado en Barcelona (España), combinando navegación peatonal, visualización de cafeterías, secciones subterráneas de metro (Arc de Triomf / L1), recálculo de ruta y cierre de marca. En la pantalla inferior se aprecia la timeline de DaVinci Resolve en reproducción. A nivel web, la pieza simula una experiencia de navegación 3D basada en capas vectoriales, modelos 3D volumétricos y tarjetas de UI superpuestas.

---

## Que se ve / se oye

### 1) Escena a escena
- **00:00 - 00:01**: Pantalla en blanco con el pin de Google Maps. Entra la voz robótica de GPS: *"In 200 meters, turn right"*.
- **00:01 - 00:03**: Transición a navegación 3D isométrica en Barcelona. Se visualiza la tarjeta de giro: *"Placeta del Comerç, 200 m"*. Cámara en perspectiva baja siguiendo el disco de posición del usuario.
- **00:03 - 00:04**: Zoom out rápido cenital/perspectiva sobre la trama urbana de Barcelona en tono grisáceo minimalista con árboles estilizados.
- **00:04 - 00:06**: Cámara desciende y orbita hacia una cafetería. Se muestra tarjeta de Google Maps: *"Ombra Café, 4.8 (2,131)"* con botones "Directions" y "Save". El edificio se resalta en tono naranja. Voz en off: *"You are here. The coffee everyone's talking about"*.
- **00:07 - 00:08**: La cámara avanza y la superficie de la calle se perfora mediante una máscara booleana circular (cutaway cilíndrico), revelando la estación de metro subterránea con andén y convoy de metro animado. Voz: *"The train you'll actually catch"*.
- **00:09 - 00:10**: Subida rápida de cámara. Aparece indicación de transporte: *"L1 Arc de Triomf, 2 min"*, seguida de otra indicación vial: *"Avinguda de Vilanova, 80 m"*.
- **00:11 - 00:12**: La ruta azul toma un giro incorrecto. Efecto sonoro de scratch / error. Tarjeta de UI: *"Rerouting..."* con spinner de carga y voz GPS sintetizada.
- **00:13 - 00:16**: Zoom dramático hacia la fachada de un edificio con un personaje/avatar amarillo estilo Street View Pegman. Se desplaza a un patio interior/segunda puerta. Voz: *"The door you've never seen, and the one you're looking for"*.
- **00:16 - 00:20**: El mapa rota en perspectiva forzada y se colapsa en un plano 2D que se transforma en el isotipo de Google Maps sobre fondo negro. Texto: *"Google Maps. Wherever you're going."* Sonido característico mnemónico de Google.
- **00:21 - 00:25**: Cortinilla final de redes sociales (@RIKI.BOSSO / Instagram).

### 2) Cámara
- **Movimiento**: Cinematográfica continua tipo *fly-through*, con pitch variable (de 65° cenital a 20° a ras de calle), yaw/bearing girando entre 15° y 90° en los cruces, y cambios dinámicos de FOV/focal (efecto vertigo / dolly zoom en 00:14).
- **Control y ritmo**: No hay scrub de scroll; es una animación con curvas de aceleración agresivas (*fast-in / slow-out* con eases elásticos) para sincronizar con los remates de la locución.

### 3) Transición mapa -> zoom -> edificio
- **Fases**: 3 fases clave:
  1. *Macroguiado*: Extrusiones planas en bloque blanco de baja poligonización con masa arbórea esférica.
  2. *Microinterés*: Destacado cromático (edificio cambia a textura con ventanas e iluminación cálida) y aparición de HUD 2D.
  3. *Corte subterráneo*: Uso de *stencil buffer* o *clipping plane* cilíndrico que recorta el suelo para dejar visible el túnel y andén inferior.
- **Capas visibles**:
  - Mapa base / malla de terreno plano.
  - Edificios procedurales extruidos (LOD bajo) y modelos específicos con mayor detalle (LOD medio).
  - Actores 3D (tren, avatar Pegman).
  - Trazado de ruta vectorizada (spline azul con degradado).
  - UI 2D en espacio de pantalla (overlays CSS/canvas con border-radius, sombras y tipografía Product Sans / Roboto).

### 4) Aspecto del mapa
- Render 3D estilizado tipo *clay render* / maqueta de arquitectura (no es satélite real ni Google Photorealistic 3D Tiles fotorrealista). 
- **Paleta**: Fondos neutros gris/blanco crudo (#EFEFEF), masa vegetal verde menta desaturada, trazados azules característicos de Google Maps (#1A73E8) y acentos naranjas. Iluminación difusa, sombras de contacto suaves (SSAO) y niebla (*linear fog*) muy sutil en el horizonte para recortar el render a media distancia.

---

## Línea de tiempo

| Marca de tiempo | Evento visual | Tipo de evento | Elemento sonoro asociado | Sincronía y desfase |
| :--- | :--- | :--- | :--- | :--- |
| **00:00 - 00:01** | Pin central en pantalla blanca | Animación inicial | Voz GPS: *"In 200 meters..."* | A la vez (0 ms) |
| **00:01 - 00:02** | Despliegue HUD *"Placeta del Comerç"* y plano 3D | Transición / Zoom in | Voz GPS continúa + zumbido motor | A la vez |
| **00:04 - 00:05** | Destacado de "Ombra Café" y tarjeta flotante | POP UI / Keyframe cámara | Voz: *"You are here..."* + chime sutil | Sonido a la vez |
| **00:07 - 00:08** | Perforación cilíndrica del suelo (metro) | Booleana / Clipping | Efecto de tren en vías | A la vez (0 ms) |
| **00:09 - 00:10** | Ascenso de cámara y aviso *"L1 Arc de Triomf"* | Paneo rápido | Transición de locución | A la vez |
| **00:11 - 00:12** | La ruta gira mal; aparece badge *"Rerouting..."* | Animación spline + UI error | Efecto vinilo / scratch cómico + voz GPS | Sonido a la vez |
| **00:13 - 00:15** | Acercamiento a fachada y revelado de puerta | Dolly zoom / Paneo lateral | Locución: *"The door you've never seen..."* | A la vez |
| **00:16 - 00:18** | Rotación del plano a pin plano y fondo negro | Transición a negro | Locución institucional | A la vez |
| **00:18 - 00:20** | Logotipo final + destello central | End card estático | Acorde / sonic branding de Google | A la vez |

---

## Implementación técnica web (Frontend Senior)

### 5) Arquitectura web recomendada
- **Stack principal**: 
  - **Three.js / WebGL puro**: Es la mejor opción para conseguir este aspecto exacto de maqueta publicitaria estilizada. Mapbox o MapLibre tienen restricciones severas para animaciones con *boolean cuts* subterráneos (metro a nivel -1) y movimientos de cámara con FOV dinámico cerrado.
  - Alternativa con mapas reales: **Mapbox GL JS v3 (Standard Style)** o **MapLibre GL v4** con capas personalizadas Threebox, cargando datos de OpenStreetMap extruidos en runtime.
  - Para el túnel de metro (00:07): En Three.js se resuelve mediante `THREE.Material.clippingPlanes` o un material con `stencilWrite: true` que vacía el disco del terreno.
- **Scrub & Scroll**: GSAP `ScrollTrigger` con `scrub: 1` controlando un timeline maestro que interpola los vectores de posición y `lookAt` de una `PerspectiveCamera` a lo largo de una `CatmullRomCurve3D`.
- **Alternativa barata / High-Performance**: Renderizar la cinemática completa en Blender a una secuencia de vídeo WebM/H.265 optimizada y reproducirla mediante scroll scrubbind (`canvas.drawImage(video)` o `<video>.currentTime`), montando los elementos de interfaz (tarjetas de navegación, spinner, textos) como componentes HTML/CSS independientes sincronizados por marcas de tiempo en el scroll.

### 6) Rendimiento y móvil
- **Peso estimado**:
  - Si es WebGL en tiempo real (mallas GLTF/DRACO del barrio + shaders): ~4 a 7 MB transferidos.
  - Si es vídeo en scroll: 3 a 5 MB (alta compresión a 1080p, 30 fps).
- **Riesgos y mitigación**:
  - *Draw calls y sombras*: Los miles de árboles y edificios clonados dispararían los draw calls. Es imprescindible usar `InstancedMesh` para la vegetación y unir la geometría urbana estática en un único buffer (*mergeGeometries*).
  - *Móviles*: En GPUs móviles de gama media, el renderizado de sombras suaves y SSAO colapsará a menos de 20 fps. Desactivar SSAO en pantallas táctiles y usar sombras cocinadas (*baked lightmaps*) o materiales simples tipo `MeshLambertMaterial` con un gradiente de altura por vertex shader.

### 7) Valor para un marketplace de técnicas web premium
- **Técnicas diferenciales**:
  1. **Transición Subterránea Booleana (X-Ray / Cutaway)**: La técnica de perforar el terreno para mostrar infraestructura oculta (metro/aparcamiento) mediante *stencil buffers* interactivos en scroll.
  2. **Dolly Zoom focal adaptativo**: Cambio de proyección de perspectiva amplia isométrica a compresión de teleobjetivo centrada en un POI (*Point of Interest*).
  3. **Hibridación UI Reactiva 2D/3D**: Tarjetas de interfaz que proyectan coordenadas 3D a `Vector3.project(camera)` para anclar Tooltips HTML que no se pixelan con el zoom.

---

## Problemas

- **Gravedad Media (00:02 - 00:04)**: El render 3D presenta un contraste lumínico muy plano en las caras de los edificios; los volúmenes arquitectónicos se empastan visualmente entre sí por falta de gradiente vertical o ambient occlusion en las esquinas interiores.
- **Gravedad Media (00:13 - 00:15)**: Efecto de *motion blur* excesivo y deformación en la transición hacia la puerta del edificio, lo cual delata que es un prerender de postproducción y resultaría mareante si se vinculara a un scroll web.
- **Gravedad Baja (00:11 - 00:12)**: El giro de la línea azul traspasa la volumetría de una acera con un radio de curva no natural respecto a la geometría urbana.
- **Gravedad Baja (00:16 - 00:17)**: La transición final pliega el plano completo en un salto de escala brusco antes de pasar a la pantalla negra del pin.

---

## Sugerencias
1. Añadir sombras de oclusión ambiental sutiles (contact shadows) en la base de los edificios y los árboles para que la escena gane tridimensionalidad sin perder su estilo minimalista.
2. Si se traslada a la web con control de scroll, suavizar las aceleraciones de cámara en los giros de 90° para evitar cinetosis en el usuario.
3. Mantener las etiquetas de UI (distancia, nombres de calles) con escalado vectorial SVG puro proyectado para garantizar nitidez tipográfica en cualquier resolución de pantalla.

---

## Veredicto
**RETOCAR**: Como pieza audiovisual publicitaria está muy bien pulida a nivel de ritmo y sonorización, pero para traducirla a un producto web interactivo funcional requiere optimizar la iluminación (demasiado plana en los planos medios) y suavizar los giros de cámara para que sea viable controlarla mediante scroll sin provocar desorientación.
