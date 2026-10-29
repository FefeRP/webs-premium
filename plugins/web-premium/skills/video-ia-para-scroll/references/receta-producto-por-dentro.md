# Receta: el producto "por dentro" en tramos (scroll sobre imagen realista)

Sacada de ref11 (cruasán, @W.WEAREBRAND): no hay 3D, son **imagen y vídeo generados y realistas**, en tramos encadenados y montados
con código (frames en canvas, HUD, textos, lente de rayos X). Sirve para comida (pan, chocolate, fruta, café), cosmética (una crema
que se abre), objetos con interior (reloj, zapatilla, auriculares) o materiales (madera, piedra, tejido).

## La historia (5 tramos; usa 3-4, no todos)
| Tramo | Qué pasa | Cómo se pide | En la web |
|---|---|---|---|
| 0 · Hero | Producto entero, quieto, sobre negro | **imagen clave** (la que más se itera) | póster + primer frame |
| 1 · Rotura | Se parte o se abre; migas o piezas al aire | imagen → vídeo, cámara fija ("se parte por la mitad") | frames + contador HUD; "sube para recomponerlo" |
| 2 · Despiece o corte | Rodajas, capas o piezas separadas | **fotograma final generado como imagen** (rodajas) + vídeo inicial→final | frames + cotas en HTML ("0,3 mm") |
| 3 · Entrar dentro | La cámara vuela dentro de la textura (miga, mecanismo) | empieza en un **primer plano** de la textura del final del tramo 2; "Through Object In" o dolly macro | frames; tarjeta de dato ("71 % aire") |
| 4 · Cambio de estado | Crudo → horneado, cerrado → abierto, apagado → encendido | **dos imágenes del mismo encuadre** (estado A y B) como fotograma inicial y final | frames + HUD (tiempo, grados, estado) |
| 5 · Rayos X o térmica | Lente bajo el cursor | edición de la imagen clave (alineada) o filtro gratis | `lente-revelado` |

**Encadenar sin saltos:** el último fotograma de cada tramo es la imagen inicial del siguiente
(`ffmpeg -sseof -0.05 -i a.mp4 -frames:v 1 ultimo.png`). El salto de escala de ref11 (de las rodajas al túnel) se evita así:
el tramo 2 termina acercándose a la miga y el tramo 3 empieza ahí.

## Prompts (imagen a vídeo; describe el movimiento, no el aspecto)
- **Imagen clave:**
  ```
  A single [golden butter croissant] floating centred on a pure black background, low-key studio lighting with warm rim light
  from behind, a few crumbs suspended around it, hyper-real macro food photography, sharp focus, no text, no props, no surface.
  ```
- **1 · Rotura** (cámara fija):
  ```
  Static camera. The croissant slowly tears apart into two halves from the centre, pulling left and right at constant speed from
  the first frame to the last; flaky crumbs burst outward and float in slow motion. Same lighting, pure black background, no cuts.
  ```
- **2 · Corte** (con fotograma final = imagen de las rodajas, generada antes con la imagen clave como referencia):
  ```
  Static camera. The croissant separates into seven vertical slices that slide apart evenly at constant speed, revealing the
  laminated layers inside. Every slice keeps its exact shape. Pure black background, no new objects.
  ```
- **3 · Entrar dentro** (imagen inicial = primer plano de la miga):
  ```
  One continuous slow dolly forward at constant speed into the honeycomb crumb: the camera glides through the golden air pockets
  like a tunnel, warm light glowing ahead, never cutting, never turning. Macro, shallow depth of field.
  ```
- **4 · Cambio de estado** (inicial = cruda, final = horneada; el mismo encuadre):
  ```
  Static camera. Time-lapse of the croissant baking: the dough slowly rises and turns from pale cream to deep golden brown at a
  steady pace, butter glistening. The croissant stays in place; the dark oven background and reflections stay stable.
  ```
- **Variante de rayos X para la lente:** ver `lente-revelado/references/activos-ia.md`.

## Montaje
- Cada tramo, una sección fijada con su `frame-scrubber` (`scroll-frames`). Carga perezosa: el tramo N+1 empieza a cargar cuando el N entra en pantalla.
- Fundido corto a negro **solo** donde el encadenado no es perfecto (en ref11, antes del horno).
- Los textos en HTML: un rótulo pequeño de capítulo ("03 · El laminado") + un titular sans con la palabra clave en serif cursiva ("Hecho en capas. *Ochenta y una*.").
- El HUD, con el patrón de `scroll-frames/references/patrones-codigo.md`.
- Un menú de capítulos que se marca con el scroll (Overview · Crunch · Lamination…), y sonido opcional apagado por defecto (en ref11, el "crunch").
- **Móvil:** frames verticales aparte o recorte con margen; 60-90 frames por tramo en vez de 120-150.

## Presupuesto orientativo (Higgsfield, oct-2026, a confirmar en la herramienta antes de generar)
| Activo | Tiradas | Créditos aprox. |
|---|---|---|
| Imagen clave + 2-3 fotogramas finales (rodajas, primer plano, crudo/horneado) | ~4 imágenes × 3 | ~25 (Nano Banana Pro, 2 cada una) |
| Variante de rayos X | 3 | ~6 |
| 4 tramos de vídeo de 5-8 s | 2-3 cada uno (~10 clips) | ~300-700 (30-70 por clip según el modelo: Kling 3.0 o Veo 3.1) |
| **Total** | | **≈ 330-730 créditos ≈ 15-35 $** (un mes del plan Plus, 59 $ y 1.200 créditos, va sobrado; con Starter, 270 créditos, no llega) |

Itera en las imágenes (céntimos), no en los vídeos. **Nada se genera sin el vale de quien paga, con este presupuesto delante.**
