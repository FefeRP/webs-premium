# Deformaciones: detectarlas y corregirlas

Datos de partida (Photoroom, agosto 2026, 3.400 imágenes generadas desde foto de producto):
- 20,1 % con logo o texto deformado.
- 12,5 % con piezas de menos.
- 11,4 % con el patrón cambiado.
- El mejor modelo dejó el producto entero bien solo en un 29 %.

Cuenta con revisar y retocar casi siempre.

## 1. Detectar (gratis, en este orden)
1. **Superposición al 50 %** (proporciones): misma altura, una encima de otra.
   ```
   ffmpeg -i real.png -i generada.png -filter_complex "[0]scale=-1:900,format=rgba[a];[1]scale=-1:900,format=rgba,colorchannelmixer=aa=0.5[b];[a][b]overlay=(W-w)/2:0" superposicion.png
   ```
   Bordes dobles = forma o tamaño distinto. Solo sirve si el encuadre es parecido; si no, recorta los dos al producto y compara ancho/alto.
2. **Lado a lado con zoom** (texto, piezas, color):
   ```
   ffmpeg -i real.png -i generada.png -filter_complex "[0]scale=-1:1000[a];[1]scale=-1:1000[b];[a][b]hstack" comparativa.png
   ```
3. **Revisión con un modelo de visión** (Claude abriendo la imagen, o Gemini) usando el prompt de control de abajo sobre `comparativa.png`.

**Probado (25-10-2026)** con un reloj renderizado y una "generada" con tres fallos sembrados:
- Los fallos eran: tono cobrizo, pantalla digital en espejo y producto un 6 % más ancho.
- Gemini (flash, ~0,005 $) detectó el **tono** y la **pantalla ilegible**, aunque no dijo "en espejo", y dio veredicto RETOCAR.
- **No vio el 6 % de anchura.** La superposición sí: bordes dobles a ambos lados.

Conclusión: el modelo de visión no basta para proporciones; haz siempre la superposición.

### Prompt de control
```
Eres un control de calidad de fotografía de producto generada con IA. A la IZQUIERDA está la foto REAL del producto
(referencia, manda siempre). A la DERECHA, una imagen GENERADA que debe mostrar EXACTAMENTE el mismo producto.
Compara solo el producto (no el fondo ni la luz) y revisa uno por uno: 1) forma y proporciones, 2) piezas que faltan,
sobran o se funden, 3) texto, números y logos (mal escritos, en espejo, inventados, borrosos), 4) color y material,
5) patrones y texturas, 6) reflejos o sombras imposibles. Para cada fallo: zona concreta, qué está mal, gravedad
(alta = el cliente lo notaría / media / baja) y cómo corregirlo (inpaint de esa zona, componer el producto real
recortado encima, corregir color, regenerar). Termina con un veredicto: APTA, RETOCAR (lista de zonas) o REGENERAR.
```

## 2. Fallos típicos y arreglo
| Fallo | Cómo se ve | Arreglo (de más barato a más seguro) |
|---|---|---|
| Logo o texto deformado / inventado | letras derretidas, palabras que no existen | 1) Inpaint solo de la etiqueta, con el detalle del logo como referencia y el texto literal entre comillas. 2) **Componer la etiqueta o el producto real encima** |
| Texto o pieza **en espejo** | logo al revés, corona en el lado contrario | Regenerar diciendo "not mirrored, same orientation as reference 1" o voltear la imagen entera si la escena lo permite. Si el producto es simétrico salvo el logo, componer la etiqueta real |
| Proporciones (más ancho, más alto, tapón más grande) | bordes dobles en la superposición | Regenerar con la vista que más se parezca como referencia principal. Si persiste, componer el producto real |
| Piezas de menos, de más o fundidas | botón que falta, dos tapones, correa pegada | Inpaint de la zona con la referencia de ese detalle. Si es estructural, regenerar |
| Color o material desviado | dorado → cobre, mate → brillo | Corrección de color (curvas o tono/saturación por zona) midiendo con el cuentagotas sobre la referencia; en el prompt, el color con nombre y código ("champagne gold #C9A86A, brushed, not copper") |
| Patrón o textura cambiada | trenzado distinto, estampado inventado | Inpaint con la referencia de detalle; en telas complejas, componer la real |
| Reflejo o sombra imposible | reflejo de otra escena, sombra hacia la luz | Reiluminar (Higgsfield Layers relight, IC-Light) o borrar el reflejo con inpaint; la sombra se puede **rehacer** con `capas-sombra.mjs --sintetica` |
| Producto "plastificado", demasiado perfecto | sin micro-detalle | Upscale con detalle, o bajar la "creatividad" del modelo; a veces queda mejor la foto real reiluminada |

## 3. La vía segura: producto real compuesto sobre escena generada
Cuando el logo o la forma no salen fieles en 2-3 tiradas, deja de gastar:
1. Genera **solo la escena**, vacía, con la luz y la perspectiva de tu foto real (y, si puedes, la escena con un producto "de relleno" en su sitio para tener sombra y foto/plato alineados).
2. Recorta el producto de la foto real: rembg o BiRefNet, Photoshop, o Higgsfield Layers con alfa. El script `capas-sombra.mjs` ya hace el producto con bordes limpios si tienes foto y plato.
3. Colócalo y ajusta la escala, la perspectiva y el color de la luz (curvas hacia el tono de la escena).
4. La sombra se pone como capa propia: la de la escena de relleno extraída con `capas-sombra.mjs`, o una sintética (`--sintetica`).
5. Reilumina si la luz no casa (IC-Light o Layers relight) y revisa otra vez.

Así el producto son píxeles reales: el logo no se puede deformar. Es lo que hacen los estudios ("plate-first").

## 4. Cuándo regenerar en vez de retocar
- Más de dos zonas con gravedad alta.
- La perspectiva del producto no casa con la escena.
- La luz va en sentido contrario a la de la serie.

Regenerar cuesta lo mismo que una tirada; retocar a mano varias zonas cuesta más tiempo y suele notarse.
