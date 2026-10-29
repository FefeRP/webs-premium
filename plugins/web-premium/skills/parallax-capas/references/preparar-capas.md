# Preparar las capas

## A. Generarlas con IA por separado (lo más limpio)
Misma luz y estilo para todas (preámbulo fijo, como en `video-ia-para-scroll`), cada capa en su imagen:
- **Fondo**: `[escena] without any [sujeto], empty centre, soft focus, same lighting as the rest of the set, wide 16:9, extra margin on all sides.`
- **Sujeto**: `[producto] alone, centred, on a seamless pure [color] background, soft contact shadow, sharp focus, no other objects.` → recorte + sombra con `capas-sombra.mjs` (pide también la misma imagen vacía como plato: ver [sombras.md](sombras.md)). Si el producto es real, parte de sus fotos: skill `fotos-producto-ia`.
- **Primer plano**: `[2-3 raspberries / leaves / petals] isolated on a seamless pure [color] background, shot slightly out of focus as if very close to the lens.` → recorte.
- **Atmósfera**: mejor con código (partículas, bruma con degradados, grano).
Genera el fondo más grande que el marco (≈ 120 %) para que el parallax no enseñe bordes.

## B. Separar una imagen existente (foto del cliente o imagen única)
1. **Recorte del sujeto** con alfa: `rembg i -m birefnet-general foto.jpg sujeto.png` (por lotes: `rembg p -m birefnet-general in/ out/`; necesita Python, `pip install "rembg[cli]"`; aún sin probar por nosotros). Alternativas: recorte de Higgsfield Layers, remove.bg, Photoshop. Revisa el borde a 200 %; retoca pelo y transparencias. **La sombra se pierde aquí**: recupérala con `capas-sombra.mjs` ([sombras.md](sombras.md)).
2. **Clean plate**: rellena el hueco del sujeto en el fondo con relleno generativo (Photoshop Generative Fill, o inpainting con el generador de imágenes: "fill the masked area with the continuation of the background"). Sin clean plate, el parallax enseña el recorte.
3. **Primer plano**: si hay elementos delante del sujeto, recórtalos igual (otra capa).
4. **Mapa de profundidad (opcional, avanzado)**: con un modelo de profundidad (Depth Anything) se puede hacer parallax por píxel en un shader (efecto "foto 3D"). Queda para la skill futura de profundidad por mapa.

## C. Capas hechas con código (sin activos)
- Anillos, esferas, retículas, cifras gigantes: **SVG** en línea (nítido a cualquier tamaño, pesa bytes).
- Halo/luz: `radial-gradient` grandes y suaves.
- Bruma: 2-3 `radial-gradient` muy desenfocados con `mix-blend-mode: screen`.
- Grano: SVG `feTurbulence` en una capa fija con opacidad 0,05-0,08 (no animarlo).
- Partículas/polvo: unos pocos `div` redondos con blur estático, o un canvas pequeño si son cientos.

## Exportar
- WebP con alfa (`cwebp -q 80 -alpha_q 90`) o AVIF. Tamaño real de visualización ×2 como máximo.
- Nombres por capa y profundidad: `hero-fondo.webp`, `hero-sujeto.webp`, `hero-frente.webp`.
- Peso orientativo: fondo ≤ 250 KB, sujeto ≤ 200 KB, primer plano ≤ 80 KB.
