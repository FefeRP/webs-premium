---
name: envase-giratorio
description: Lata, bote, tarro o botella cilíndrica que gira de verdad sin modelo 3D ni vídeo - la etiqueta PLANA (desplegada) se enrolla sobre un cilindro en un canvas 2D con sombreado, brillo y tapa metálica; el giro se liga al scroll, a un arrastre o a un slider de sabores/variantes (fondo, título y frutas que cambian a la vez). Incluye cómo preparar la etiqueta (diseño o IA) y el slider de variantes con elemento compartido. Úsala cuando pidan "lata que gira", "slider de sabores", "cambiar de sabor y que gire la lata", "mockup de lata animado", "etiqueta que da la vuelta", "bebida con varios sabores", "can rotation", "drink flavour slider", "3D can without 3D", "rotating label", "product variant slider".
license: MIT
version: 1.0.0-beta.3
---

# Envase que gira (sin 3D)

Las webs de bebidas enseñan la lata girando al cambiar de sabor. En ref10 (@DESIGNGEMSTUDIO, Figma) el truco es una **franja de
etiquetas planas que se desliza dentro de una máscara con forma de lata**. Esta skill hace lo mismo pero **curvando** la
etiqueta columna a columna (`u = asin(x/r)`): los bordes se comprimen como en un cilindro real, y el giro puede ir con el scroll o el
dedo. Un canvas 2D, sin three.js ni modelo, ~200 líneas y unos 10 KB.

## Cuándo sí y cuándo no
- **Sí:** latas, botes, tarros, velas, botellas de cuerpo recto, rollos, pilas, termos. Sliders de sabores o variantes.
  Hero con el envase girando despacio con el scroll.
- **No:**
  - Formas no cilíndricas (botella con hombros marcados, perfume facetado, zapatilla) → `escena-3d-gltf` o frames (`scroll-frames`).
  - Si hay que ver el envase desde arriba o inclinado más de ~15°: el canvas solo hace una vista frontal con poca perspectiva.

## Pasos
1. **Etiqueta plana** por variante ([references/etiquetas.md](references/etiquetas.md)):
   - Proporción = perímetro / alto del cuerpo pintado: con la forma por defecto ≈ **1,5:1** (`lata.proporcionEtiqueta` da el valor exacto). Si no casa, se ve estirada.
   - **Los bordes izquierdo y derecho deben casar** (la costura se ve al girar).
   - Lo importante (logo y nombre) en el primer tercio, que es lo que se ve de frente con `girar(0)`.
   - Fuente: el arte de imprenta del cliente (lo mejor), un diseño propio en SVG o IA (con su presupuesto).
2. **Motor:**
   ```js
   const lata = crearEnvaseGiratorio(canvas, { etiqueta: '/latas/mora.webp' });
   await lata.listo;
   lata.girar(v);  // v en vueltas
   ```
   Opciones:
   - `forma` (ancho, tapa, cuello y base, como fracción del alto).
   - `perspectiva` (0-0,25).
   - `brillo`, `sombra`, `metal` (colores del aluminio; dorado o negro mate para otros envases).
3. **Con qué gira:**
   - Scroll: `onUpdate: st => lata.girar(st.progress * 0.5)`.
   - Arrastre: `dx / ancho` → vueltas.
   - Slider: tween de +1 vuelta y `cambiarEtiqueta()` a mitad. Patrón completo en [references/patrones-codigo.md](references/patrones-codigo.md).
4. **Alrededor** (lo que hace "premium" el slider de ref10):
   - Fondo con variables CSS por variante.
   - **Título gigante detrás** del envase (z-index entre el fondo y el canvas), que sale y entra por su máscara.
   - Frutas o ingredientes por delante y por detrás, con desenfoque por profundidad (`parallax-capas`).
   - Texto y CTA.
5. **Verifica:** capturas (`verificar-scroll.mjs`) y una prueba de clic en el slider. La etiqueta debe cambiar y el título también (ejemplo: `pruebas/lente-envase/probar-interaccion.mjs` del repo).

## Reglas
- **Cambio de etiqueta a mitad de giro**, cuando la lata va más rápida: así no se ve el salto. 1,2-1,6 s por cambio (Figma usaba 2,4 s, lento en web) con easing in-out.
- **El título detrás, cortado por la lata**, se lee igual. Que no compita: una palabra, cursiva display, color de acento.
- **Precarga** las etiquetas de las otras variantes al empezar.
- **Menos movimiento:** sin giro con el scroll; el slider cambia de variante al momento.
- **Accesibilidad:** el canvas, con `role="img"` y un `aria-label` que diga la variante. Las flechas son `<button>` con nombre. El título, `aria-live="polite"`.
- **Sin JS:** una imagen fija de la lata de frente por variante (render del propio motor con `canvas.toBlob`, o foto).

## Checklist de rendimiento
- [ ] Etiquetas WebP de ~1200-2000 px de ancho (50-200 KB). Un SVG también sirve si es sencillo.
- [ ] El motor pinta solo cuando cambia el giro o el tamaño. El coste es una `drawImage` por columna, ~300-800 por fotograma: va sobrado en móvil.
- [ ] `dprMax` 2. En pantallas 3x no se nota y ahorra.

## Referencias
- [references/patrones-codigo.md](references/patrones-codigo.md): slider de sabores completo (fondo, título en máscara, frutas, flechas, scroll), arrastre y trampas.
- [references/etiquetas.md](references/etiquetas.md): cómo preparar o pedir la etiqueta plana (IA: prompts y coste), costura y revisión.
