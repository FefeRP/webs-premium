---
name: parallax-capas
description: Profundidad sin 3D - hero y secciones "dimensionales" con capas (fondo, sujeto, primer plano, atmósfera) que se mueven a distinta velocidad con el scroll y el puntero; cómo preparar las capas (recorte con alfa, clean plate, imágenes generadas por capa o capas hechas con código), la SOMBRA como capa propia semitransparente (extraída de la foto con capas-sombra.mjs o sintética) para recomponer y levitar, versión solo CSS con scroll-driven animations y versión JS sin dependencias. Úsala cuando pidan "efecto de profundidad", "parallax", "que parezca 3D sin 3D", "hero con capas", "ingredientes flotando alrededor del producto", "separar en capas", "sacar la sombra", "producto que levita", "depth effect", "layered hero", "multiplane parallax", "mouse parallax", "2.5D", "shadow layer", "keep the shadow when removing background".
license: MIT
version: 1.0.0-beta.3
---

# Parallax y profundidad por capas

La forma más barata de que una web "tenga fondo": separar la imagen en planos y moverlos a distinta velocidad.
El cerebro lee la diferencia de velocidad como distancia. Pesa poco, va en cualquier móvil y no necesita WebGL.

## Cuándo sí y cuándo no
- **Sí:** hero con producto y elementos alrededor (helado + frutas, perfume + flores, zapatilla + piezas), paisajes e inmobiliaria, portadas editoriales, fondos de secciones.
- **No:** si el objeto debe girar o verse por detrás → `scroll-frames` (vídeo) o `escena-3d-gltf`.

## Las reglas que separan "premium" de "plantilla"
1. **3-4 capas**: fondo (-0,6…-1), sujeto (0, plano de foco), primer plano (0,3…0,8), atmósfera opcional (partículas, bruma, grano). Más de 5 parece un diorama de cartón.
2. **Recortes con alfa real** y bordes limpios (nada de halos blancos ni damero falso). Revisa a 200 %.
3. **Clean plate**: el fondo sin el sujeto, con el hueco reconstruido. Si no, al moverse el sujeto se ve su "sombra" recortada en el fondo.
4. **Anclas de contacto**: lo que toca algo (la persona sobre la roca, la copa sobre la mesa) va en la **misma capa** que lo que toca.
5. **Desenfoque por distancia**: el primer plano y el fondo lejano, algo desenfocados; el sujeto, nítido. Es lo que más vende la profundidad.
6. **El texto, entre planos** (delante del fondo, detrás del primer plano) o fijo: **nunca el texto con parallax fuerte** (cuesta leerlo).
7. **Movimiento contenido**: con scroll, recorrido 0,15-0,3 del alto; con puntero, 10-30 px. Si se nota "el truco", es demasiado.
8. **Composición propia en móvil**: menos capas (2-3), sin parallax de puntero, el sujeto más grande.

## Pasos
1. **Decide planos y profundidades** (apúntalo): qué hay en cada capa y su `data-profundidad`.
2. **Consigue las capas** (detalle en [references/preparar-capas.md](references/preparar-capas.md)):
   - Imagen generada con IA → pide **cada capa por separado** sobre fondo liso, o una imagen completa y sepárala (recorte con rembg/BiRefNet + clean plate con relleno generativo).
   - Foto del cliente → recorte + clean plate.
   - Capas hechas con código (formas, anillos SVG, brillos, grano, partículas): sin activos, nítidas a cualquier tamaño.
   - Fotos de producto nuevas con IA a partir de fotos reales → skill `fotos-producto-ia` (pide también el plato limpio).
   - **Sombra en su propia capa** (el recorte la tira): `node scripts/capas-sombra.mjs --foto f.png --recorte p.png --plato fondo.png --salida capas/` → fondo + sombra + producto alineados y `capas.json` con las cajas. Sin sombra en la foto: `--sintetica`. Detalle y medidas en [references/sombras.md](references/sombras.md).
   - Exporta WebP/AVIF con alfa, al tamaño que se verá (no 4K para una capa de 600 px).
3. **Maqueta**: un contenedor `position: relative; overflow: hidden` y cada capa `position: absolute`. Las capas que se mueven deben ser **más grandes** que el marco (≈ +10-20 %) para que no se vean sus bordes.
4. **Movimiento** (elige uno):
   - **JS sin dependencias** (scroll + puntero): `scripts/capas-parallax.js` → `crearParallax(raiz)`. Patrón en [references/patrones-codigo.md](references/patrones-codigo.md).
   - **Solo CSS** (`animation-timeline: view()`): cero JS, fuera del hilo principal; sin puntero. Patrón en references.
   - **GSAP ScrollTrigger** si ya hay timeline (sección fijada con más cosas pasando): `gsap.to(capa, { yPercent: -20 * z, ease: 'none', scrollTrigger: { scrub: true } })`.
5. **Reduced motion**: las capas quietas (el motor ya lo respeta; en CSS, envuelve en `@media (prefers-reduced-motion: no-preference)`).
6. **Verifica** con capturas en 3 posiciones de scroll (entrada, centro, salida) en escritorio y móvil: no deben verse bordes de capa, halos ni huecos.

## Checklist de rendimiento
- [ ] Solo `transform` (y `opacity`); nada de `top/left/background-position` animados.
- [ ] Capas con `will-change: transform` solo mientras se animan (el motor lo pone y lo quita al destruir).
- [ ] Imágenes al tamaño mostrado, WebP/AVIF; peso total del hero ≤ 600 KB en móvil.
- [ ] La capa del sujeto es la imagen LCP: `<img fetchpriority="high">` con `width/height`.
- [ ] `filter: blur()` animado NO (carísimo): el desenfoque va horneado en la imagen o estático.
- [ ] El motor se para fuera de pantalla (IntersectionObserver) y cuando ya no hay movimiento.

## Referencias
- [references/preparar-capas.md](references/preparar-capas.md): de una imagen a capas (IA, recorte, clean plate), prompts por capa, capas con código.
- [references/sombras.md](references/sombras.md): la sombra como capa (plato limpio, capas-sombra.mjs, composición, levitar, sintética).
- [references/patrones-codigo.md](references/patrones-codigo.md): maqueta, JS, CSS scroll-driven, GSAP, React.
