# ref10 · Slider de latas "3D" en Figma (@DESIGNGEMSTUDIO)

- **Vídeo:** `ref10-vid-070840.mp4` (local, fuera de git), original `VID_20261026_070840_254.mp4`, 33,7 s, vertical.
- **Tipo:** **prototipo de Figma** (Smart Animate), no una web. Es el mismo estudio que ref4 (slider de helados). Título: **"3D DRINK SLIDER IN FIGMA"**. Música: The Chemical Brothers.
- **Análisis:** mi revisión de las hojas de fotogramas (1 fps) y de los fotogramas grandes + Gemini 3.5 Flash Lite (~0,007 $). Gemini leyó bien los pasos del tutorial, pero propuso un glTF para la lata, y no hace falta: la lata es una **etiqueta plana dentro de una máscara**.

## Escenas
| t | Qué se ve |
|---|---|
| 0-6 s | El resultado en un monitor. Slider por sabores de la marca inventada "Coypu": **Monstpure** (morado, mora), **Deeplake** (azul, arándano), **Oxigreen** (lima) y uno rosa. Al pasar de slide cambian a la vez el fondo (color + patrón ilustrado de monstruos), el **título gigante en cursiva** (detrás de la lata, cortado por ella), la **lata, que gira** mientras cambia de etiqueta, las **frutas que flotan** (en primer plano y desenfocadas) y el texto de sabor con su botón "ORDER NOW". Flechas ‹ › junto a la lata. |
| 6-29 s | El tutorial en Figma, con sus rótulos: "Add a rounded background with a pattern" → "Select all titles and apply Auto Layout" → "Move them into the design" → "Select all labels and apply Auto Layout" → **"Move them to the can and use them as a mask"** → "Select all text layers and apply Frame Selection" → "Select all element frames" → "Duplicate the design" → "Replace all elements with the next ones" → **"Connect all frames and use these settings"**. |
| 28-33 s | Ajustes del prototipo: **On click → Navigate to · Smart Animate · Gentle · 2400 ms**. |

## La técnica (lo nuevo frente a ref4)
- **Lata falsa en 3D:** una lata plateada vacía + **todas las etiquetas planas puestas en fila** (Auto Layout) **dentro de una máscara con la forma de la lata**.
  - Al pasar de slide, Smart Animate desliza la fila en horizontal y la etiqueta parece girar sobre la lata.
  - La curvatura no existe (la franja es plana) y se disimula con el brillo y la sombra de la lata de encima.
- **Títulos y textos en fila con máscara:** el mismo truco con los títulos ("Monstpure", "Deeplake"…) y los textos. Por eso entran y salen deslizándose.
- **Todo cambia a la vez con un easing con muelle** ("Gentle", 2,4 s): fondo, título, etiqueta y frutas. Las frutas, con distinto recorrido según su profundidad (parallax en la transición).

## Qué es generado y qué es código (en una web)
- **Activos** (generados o diseñados):
  - Etiqueta plana de cada sabor, como una impresión desplegada que case en los bordes.
  - Patrón de fondo de cada sabor.
  - Frutas recortadas con alfa (3-4 por sabor).
  - Opcional: foto de la lata vacía.
  - Con Higgsfield: la etiqueta, con Nano Banana Pro o GPT Image (texto exacto) pidiendo "flat unwrapped label artwork, seamless left/right edges"; las frutas, con Seedream o Nano Banana sobre fondo liso, recortadas después.
- **Código:**
  - La lata girando: nuestra `envase-giratorio`, que **curva** la etiqueta de verdad, cosa que Figma no hace.
  - El cambio de sabor: variables CSS de color y fondo.
  - Los títulos en máscara (`overflow:hidden` + `xPercent`).
  - Las frutas con parallax y blur por profundidad.
  - Las flechas y el arrastre.
  - Opcional: girar la lata con el scroll.

## Cómo se reproduce
1. Preparar la etiqueta plana de cada sabor (proporción ≈ 3:1) y comprobar la costura.
2. `envase-giratorio.js` en un `<canvas>`.
3. Al pulsar ›: tween de `vueltas` +1 con un easing suave (≈1,2-1,6 s; Figma usa 2,4 s, lento para la web); a mitad del giro, `cambiarEtiqueta()`.
4. A la vez, el fondo cambia por variables CSS y el título sale y entra en su máscara.
5. Las frutas salen hacia fuera y entran las del sabor nuevo, con distinto retardo según su profundidad.
6. Sin JS o con reduced-motion: una imagen fija por sabor y cambio sin giro.
7. **Coste orientativo** (Higgsfield, sin generar nada), para 4 sabores: etiqueta + fondo + 3 frutas = 5 imágenes por sabor, ×3 tiradas ≈ 60 imágenes × ~2 créditos ≈ **120 créditos ≈ 5-6 $**. Sin vídeo: el giro es código.

## Puntos débiles del original
- Etiqueta plana sin curvatura: de cerca se nota que "patina".
- 2,4 s por transición es lento para la web.
- Sin versión móvil.
- Los títulos gigantes en cursiva con contorno cuestan de leer encima del patrón.
