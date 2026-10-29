# Variante interior con IA (cuando el filtro no basta)

`variantes-revelado.mjs` da un rayos X o una térmica **de estilo** a partir de lo que ya se ve.
Para enseñar lo que **no** se ve por fuera (la miga alveolada del cruasán de ref11, el mecanismo de un reloj, el relleno de una
chaqueta), hay que **editar la misma imagen** con un modelo de edición por referencia. Nunca hay que generar una imagen nueva: no casaría.

> **Dinero:** cada imagen cuesta créditos. Presupuesta antes y pide el vale (ver `fotos-producto-ia/references/modelos-y-precios.md`).

## Cómo pedirla (Higgsfield: Nano Banana Pro o GPT Image; también Qwen-Image-Edit en local con GPU)
- **Entrada:** la imagen base exacta (la misma resolución que usará la web) como referencia principal.
- **Prompt (inglés, funciona mejor):**
  ```
  Edit this exact image. Keep the exact same framing, camera, size, position and silhouette of the [croissant]; do not move,
  crop, rotate or rescale anything. Render it as a medical X-ray / CT scan: translucent cool blue-white density, the internal
  [honeycomb crumb and laminated layers] clearly visible inside, soft glow at the edges, pure black background. No text, no labels.
  ```
  - Térmica real: "…as a thermal camera image (FLIR), hot core in yellow-white, cooler crust in magenta and blue…".
  - Corte o interior: "…as a clean cross-section revealing [the movement / filling]…".
- **Tiradas:** 3-4, y elegir la que mejor casa.
- **Revisión:**
  1. `node scripts/variantes-revelado.mjs --comprobar base.png variante.png` → ≤ 0,5 % ideal.
  2. Superposición al 50 % (`ffmpeg -i base.png -i variante.png -filter_complex blend=all_mode=average sup.png`) para ver bordes que bailan.
  3. Si se movió poco: recortar y escalar la variante para casar (ffmpeg `crop`/`scale`) y repetir `--comprobar`.
  4. Si se movió mucho: otra tirada.
- **Coste orientativo** (oct-2026, a confirmar): 3-4 tiradas × ~2 créditos (Nano Banana Pro 2K) ≈ 8 créditos ≈ **0,40 $** por variante. La térmica de estilo es gratis con el script.

## Orden
Primero la base aprobada y luego la edición sobre ella. No pidas las dos en una sola imagen partida en mitades: nada garantiza que
las mitades casen, y separarlas cuesta más que una tirada.
