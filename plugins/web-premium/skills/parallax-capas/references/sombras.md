# La sombra como capa propia

Un recorte normal (rembg, BiRefNet, remove.bg, el recorte de Higgsfield Layers) deja el producto con alfa y **tira la sombra**.
Sin sombra el producto "flota pegado" encima del fondo y se nota el truco. La solución es tener la sombra en **su propia
capa semitransparente**: negro (o su tinte) con alfa, que oscurece lo que tenga debajo.

Qué permite:
- **Recomponer sobre cualquier fondo** (otro color, otra escena) sin rehacer la foto.
- **Parallax honesto**: la sombra se mueve con el suelo, no "pintada" en el fondo.
- **Levitar**: el producto sube con el scroll y su sombra se queda en el suelo, se aclara y se difumina (efecto muy premium y barato).

## 1. Conseguir el plato limpio (lo que hace que salga bien)
La sombra se calcula **dividiendo la foto entre el fondo sin producto**: `alfa = 1 − lum(foto) / lum(fondo)`.
Con el fondo de verdad el resultado es preciso; estimado, es aproximado. Medido con el script (escena de estudio con foco):

| Cómo | Error medio del alfa | Sombra falsa en el fondo |
|---|---|---|
| Con plato limpio | 0,008 | 0,1 % |
| Sin plato (fondo estimado) | 0,04 | ~9 % (tenue, lejos del producto) |

Cómo tener el plato:
- **Foto real**: trípode, exposición y balance de blancos en manual, enfoque fijo. Foto con producto → quitas el producto → foto sin él. Mismo encuadre.
- **Con IA (orden "plato primero")**: genera primero la escena vacía (ver `fotos-producto-ia`). Después, con esa imagen como base, pide el producto dentro (edición por referencia: "place the product from reference 2 on the table, keep everything else identical"). Así tienes las dos.
- **Con IA a partir de la foto con producto**: pide "remove the product and its shadow, keep everything else pixel-identical". Comprueba que no ha movido nada: si `prueba-recomposicion.png` no se parece a la foto (PSNR < 34 dB), el plato está desalineado.
- **Fondo continuo liso** (estudio, papel sin fin) sin plato: el script lo estima. Revisa `revisar-sombra.png` y borra lo falso con `--zona-sombra`.

## 2. Extraer las capas
```bash
# máscara: la del recortador (PNG con alfa) o una en blanco y negro (blanco = producto)
node scripts/capas-sombra.mjs --foto foto.png --recorte producto-rembg.png --plato plato.png --salida public/capas/hero
# sin plato (fondo liso): aproximado
node scripts/capas-sombra.mjs --foto foto.png --mascara mascara.png --salida public/capas/hero [--zona-sombra zona.png]
# producto sin sombra (render, catálogo, IA sobre blanco): sombra inventada de contacto + proyectada
node scripts/capas-sombra.mjs --sintetica --recorte producto.png --salida public/capas/hero --luz -0.4
```
Salida:
- `fondo.webp`: el fondo limpio, a pantalla completa.
- `sombra.webp`: color o tinte + alfa, para mezcla normal.
- `sombra-multiply.webp`: el color exacto de la sombra, para `mix-blend-mode: multiply`.
- `producto.webp`: el recorte con los bordes descontaminados (sin el halo del color del fondo).
- `capas.json`: cajas en px y en % del encuadre, más avisos.
- `revisar-sombra.png`, `prueba-recomposicion.png` y `prueba-otro-fondo.png`: para revisar.

Las capas salen recortadas a su caja: pesan poco. Con la foto de prueba de 1600×1200: sombra 44 KB y producto 64 KB.

Revisa siempre:
1. **`prueba-recomposicion.png` ≈ la foto.** El script da el PSNR: ≥ 38 dB está bien.
2. **`revisar-sombra.png`.** Lo blanco es sombra. Si sale algo lejos del producto, es falso.
3. **El aviso "la sombra toca el borde".** Esa sombra no se puede escalar ni desplazar mucho, porque se vería el corte. Mejor repetir la foto con margen: la sombra entera dentro del encuadre.

## 3. Componer en la web
- **Orden de capas**: fondo → sombra → producto → texto / primer plano. Coloca cada capa con los `cajaPct` de `capas.json` dentro de un contenedor con la **misma proporción que la foto** (`aspect-ratio`), escalado tipo *cover*. Escribe los % en el CSS final para que no haya saltos al cargar.
- **Profundidad**:
  - Sombra y producto en la **misma `data-profundidad`**: están en contacto (regla 4 de anclas).
  - El fondo lejano, negativo.
  - Si la sombra es muy larga y se aleja hacia el fondo, ponle una profundidad intermedia (p. ej. −0,1).
- **Sobre otro fondo**:
  - La capa `sombra` (mezcla normal) vale para cualquier color.
  - Sobre fondos con color fuerte o textura, usa `sombra-multiply` con `mix-blend-mode: multiply`, que conserva el tinte.
  - En fondos muy oscuros la sombra casi no se ve. Es lo físico. Si hace falta más, apila dos copias de la capa.
- **Levitar** (probado en `pruebas/capas-sombra/web`):
  - El producto sube con `translate`. La sombra no se mueve: se cruza de la copia nítida a una copia con `filter: blur()` **estático**. El desenfoque nunca se anima.
  - El `transform-origin` de la sombra va en el punto de contacto (la base del producto).
  - Escalar la sombra solo si no toca el borde de la foto.
  - Bajo el producto el script deja sombra de contacto, así que al subir no asoma suelo iluminado.

```css
.sombra { transform-origin: var(--origen-sombra, 50% 90%); }
.sombra--difusa { filter: blur(14px); opacity: 0; }
@supports (animation-timeline: view()) {
  .producto, .sombra { animation-timeline: --tramo; animation-range: contain 10% contain 90%; animation-fill-mode: both; animation-timing-function: linear; }
  .producto { animation-name: levitar; }      @keyframes levitar { to { translate: 0 -12%; rotate: -4deg; } }
  .sombra--nitida { animation-name: s-n; }    @keyframes s-n { to { opacity: 0; } }
  .sombra--difusa { animation-name: s-d; }    @keyframes s-d { to { opacity: .6; } }
}
```
(`--tramo` es un `view-timeline` en la sección; con GSAP es lo mismo con un timeline y `scrub`.)

## 4. Sombra sintética: cuándo
Úsala para productos sin sombra: un recorte de catálogo, un render o una imagen IA sobre blanco puro.
- Hace dos sombras: una de contacto (estrecha y oscura) y otra proyectada (larga y difusa) hacia el lado contrario a `--luz` (−1 = luz desde la izquierda).
- Sirve para objetos que se apoyan en el suelo.
- Para objetos colgando o flotando, mejor solo la difusa (baja `--intensidad`).
- Es una sombra "de diseño", no física. Si la escena tiene una luz clara y dura, mejor la extraída de una foto real.

## 5. Con IA en vez de con código
- **Higgsfield Layers**: separa en capas y reilumina, con créditos.
- **Relight / IC-Light**: armoniza la luz de un recorte con una escena nueva.
- Una plantilla de ComfyUI de relight sobre producto compuesto.
- Sirven cuando la luz del producto y de la escena no casan. Para la sombra en sí, el plato limpio + este script es más preciso y gratis.
- Cualquier opción de pago: presupuesto y vale antes (ver `video-ia-para-scroll`, regla de dinero).
