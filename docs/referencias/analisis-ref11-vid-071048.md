# ref11 · Cruasán "por dentro" (@W.WEAREBRAND, "Websites in 2026")

- **Vídeo:** `ref11-vid-071048.mp4` (local, fuera de git), original `VID_20261026_071048_777.mp4`, 24,6 s, 1080×1920, grabado con el móvil a un portátil.
- **Tipo:** **web real** en el navegador (cursor visible, menú con secciones, interruptores). Navegación: Overview · Crunch · Lamination · Crumb · Bake · Scan · Compare, botón naranja "Pre-order" y "Sound off".
- **Análisis:** mi revisión fotograma a fotograma (hojas a 1 fps y fotogramas grandes) + Gemini 3.5 Flash Lite (~0,006 $; el modelo principal no tenía cuota ese día). Gemini acertó la estructura y la lente, pero **se equivocó** en dos cosas: dijo que el contador era de calorías (es "FLAKES AIRBORNE") y que el cruasán era un modelo 3D. Por los fotogramas, el cruasán es imagen o vídeo **generado y prerenderizado**: tiene perspectiva fija, luz de estudio idéntica en cada tramo y migas con aspecto fotográfico.

## Escenas (textos leídos en pantalla)
| t | Escena | Texto en pantalla | Cómo se mueve |
|---|---|---|---|
| 0-1 s | Cruasán entero sobre negro, con migas flotando | "02 · THE CRUNCH" · **"Listen closely."** | quieto; arranca con el scroll |
| 1-3 s | Se **parte por la mitad**, migas que saltan | contador **"1,343 · FLAKES AIRBORNE"** · "Each one 0.3 mm of caramelized butter pastry" · "SCROLL BACK UP TO UN-CRUNCH IT" | **ligado al scroll y reversible**: subir "recompone" el cruasán; el contador sube con el progreso |
| 3-5 s | Fundido a la sección de laminado; cruasán **cortado en 7 rodajas** separadas | "03 · THE LAMINATION ENGINE" · **"Built in layers. *Eighty-one* of them."** · "Butter and dough, folded 3 × 3 × 3 over 72 hours." · cotas "0.6 mm" / "0.3 mm" | las rodajas se separan con el scroll (despiece) |
| 6-7 s | Transición | **"Now step inside."** (sans + serif cursiva) | el vídeo del interior sube desde abajo |
| 7-11 s | **Dentro de la miga**: túnel alveolado dorado | tarjeta **"71% air · Light enough to float. Rich enough to matter."** | dolly continuo hacia dentro, ligado al scroll |
| 12-18 s | Horno o barra oscura; cruasán sobre superficie que refleja | HUD **"07:55 · 190°C · +25% · Golden"** (en otros momentos "04:32 … Blonde") · **"18 minutes. Worth the 72-hour wait."** | **horneado ligado al scroll**: el cruasán pasa de crudo y pálido a dorado y el HUD (tiempo, % de volumen, color) cambia a la vez |
| 18-21 s | Fondo negro, cruasán entero | "04 · SEE INSIDE" · **"X-ray vision. *No crumbs.*"** · "Move your cursor over the croissant to scan it." · interruptor **X-ray / Thermal** | **lente circular** que sigue al cursor y enseña el interior en azul (rayos X), con un anillo de mira con marcas y un rótulo pequeño de datos |
| 21-24 s | Cierre | logo de Instagram del autor | — |

## Qué es generado y qué es código
- **Generado (imagen y vídeo IA, prerenderizado):**
  - La imagen clave del cruasán sobre negro.
  - Los tramos de vídeo: rotura con migas, rodajas, vuelo dentro de la miga y horneado de crudo a dorado.
  - La **variante de rayos X**, alineada con la imagen clave. Enseña alvéolos que no se ven por fuera, así que es una edición generada sobre la misma imagen, no un filtro.
  - Encaja con Higgsfield (imagen → vídeo, Kling/Veo con fotograma inicial y final).
- **Código:**
  - Los tramos se montan como secuencias de frames en canvas ligadas al scroll (van y vuelven).
  - Los textos son HTML, en sans + serif cursiva para la palabra que se enfatiza.
  - El contador de migas y el HUD del horno se interpolan con el progreso.
  - La lente es una máscara radial que sigue al puntero sobre dos imágenes alineadas, con el interruptor de modo.
  - El menú de secciones se marca con el scroll, y hay un botón de sonido (el "crunch").

## Cómo se reproduce (receta)
1. **Imagen clave** (1 imagen, la que más se itera): el producto entero, centrado, sobre negro puro, en clave baja con contraluz cálido y sin texto. Será el primer fotograma de todos los tramos y la base de la lente.
2. **Tramos de vídeo, cada uno de imagen a vídeo, encadenados por el último fotograma:**
   - **a) rotura** (se parte con migas);
   - **b) despiece en rodajas**, mejor con fotograma final (rodajas separadas) generado como imagen antes;
   - **c) vuelo dentro** ("Through Object In" o dolly macro), empezando en un primer plano de la miga;
   - **d) horneado** (crudo → dorado): mejor con dos imágenes del mismo encuadre, la cruda y la dorada, como fotograma inicial y final.
3. **Variante interior para la lente:** editar la imagen clave pidiendo "la misma imagen, mismo encuadre, como radiografía azul que deja ver los alvéolos". Comprobarla con `variantes-revelado.mjs --comprobar`. La térmica, gratis, con el mismo script (`--modos termica`).
4. **Montaje:**
   - `scroll-frames` por tramo, con secciones fijadas, fundido a negro entre ellas y textos con `data-en`.
   - HUD con el patrón "HUD de datos" de `scroll-frames/references/patrones-codigo.md`.
   - La lente con `lente-revelado`.
5. **Coste orientativo (Higgsfield, sin generar nada):**
   - Imágenes: ~10-15 imágenes con Nano Banana Pro (~2 créditos cada una) ≈ 30 créditos.
   - Vídeos: 4 tramos × 2-3 tiradas ≈ 10 clips. Un clip de Kling 3.0 o Veo cuesta unos 30-70 créditos, así que salen ≈ 300-700 créditos.
   - **Total ≈ 350-750 créditos ≈ 15-35 $**: un mes de plan Plus (59 $, 1.200 créditos) sobra, y con Starter (19 $, 270 créditos) no llega.
   - Son precios por confirmar en la herramienta antes de generar.

## Fallos o puntos débiles que mejorar en nuestra versión
- El paso de las rodajas al túnel es un salto de escala: mejor que el último fotograma de las rodajas sea ya un primer plano de la miga (encadenar por fotograma).
- El contador sube muy deprisa al principio: hay que ligarlo al progreso con una curva suave y usar `tabular-nums`.
- La lente no sirve en móvil (no hay cursor): se arrastra con el dedo o "pasea" sola, como hace nuestro motor.
- Peso: 4 tramos × ~120 frames. Hay que cargar por tramos (el siguiente cuando el anterior está a la vista) y bajar la resolución en móvil.
