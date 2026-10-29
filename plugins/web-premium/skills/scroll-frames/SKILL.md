---
name: scroll-frames
description: Scroll-scrubbing de vídeo estilo Apple - un vídeo (generado con IA o del cliente) partido en frames que avanza al hacer scroll, dibujado en canvas con GSAP ScrollTrigger, o en modo vídeo con currentTime. Incluye la extracción y optimización de frames con ffmpeg (WebP/AVIF, escritorio y móvil, manifest), el motor de reproducción con carga progresiva y memoria acotada, textos sincronizados, reduced-motion y verificación. Úsala cuando pidan "que al hacer scroll avance el vídeo", "secuencia de imágenes en canvas", "scroll como el de los AirPods", "producto que gira al hacer scroll", "explosión del producto al bajar", "image sequence scroll", "scroll-driven video", "scrub video on scroll", "frame sequence canvas".
license: MIT
version: 1.0.0-beta.3
---

# Scroll-scrubbing: vídeo → frames → scroll

El scroll hace de cabezal de reproducción: el visitante "arrastra" un vídeo. Es fake-3D: parece 3D real
(producto que gira, se despieza, cámara que vuela) pero son imágenes. Es la técnica con mejor relación
impacto/coste: funciona en cualquier móvil y no hace falta modelo 3D.

## Cuándo sí y cuándo no
- **Sí:** producto protagonista (gira, se abre, se monta), un recorrido de cámara, una transformación (ingredientes que caen, líquido, materia). Todo lo que en 3D real sería carísimo (fluidos, humo, telas, comida).
- **No:** si el visitante tiene que *interactuar* con el objeto (girarlo a su gusto, configurar colores) → `escena-3d-gltf`. Si solo quieres profundidad sin movimiento de cámara → `parallax-capas` (pesa mucho menos).

## Elegir modo (decídelo y apúntalo)
| Modo | Cuándo | Peso típico (6 s) |
|---|---|---|
| **Frames en canvas** (por defecto) | 60-150 frames, hero o sección fijada. Preciso en todos los navegadores, también iOS en ahorro de batería. | 3-8 MB escritorio, 1,5-4 MB móvil |
| **Vídeo con currentTime** | Secuencias largas (>10 s o >200 frames), o el peso manda. Necesita póster de reserva (iOS en ahorro de batería no lo deja reproducir). | 0,8-3 MB |
| **CSS sprite + `animation-timeline`** | Micro-secuencias (≤24 frames, iconos, pequeños objetos). Sin JS. | <500 KB |

## Pasos

### 1. Conseguir el vídeo bueno
- Si hay que generarlo con IA, **usa la skill `video-ia-para-scroll`** (prompts, cámara, fondo, duración). Un mal vídeo no se arregla después.
- Si viene del cliente: un solo plano, sin cortes, velocidad constante, sin texto quemado.
- Revisa antes de extraer: `ffprobe` (fps, duración, resolución) y una hoja de contactos:
  `ffmpeg -i v.mp4 -vf "fps=2,scale=480:-2,tile=6x3" -frames:v 1 hoja.png` → mira que no haya saltos, morphing ni parpadeos.

### 2. Extraer y optimizar
```bash
node scripts/extraer-frames.mjs fuente.mp4 public/frames/producto --frames 120
#   --formato ambos      añade AVIF (≈30 % menos peso; el motor lo usa si el navegador lo soporta)
#   --ancho 1600         si el canvas no ocupa toda la pantalla
#   --recorte-movil x=0.45   desplaza el recorte 9:16 del móvil hacia el sujeto
#   --inicio 0.5 --fin 5.5   descarta arranque/frenada del generador
#   --video-scrub        además el MP4 con GOP denso para el modo vídeo
```
Sale `escritorio/0001.webp…`, `movil/0001.webp…`, `poster-*.webp` y `manifest.json`. Lee el peso que imprime y compáralo
con el presupuesto (references/rendimiento.md). Si te pasas: menos frames (90-100 suelen bastar), `--calidad 65`, o AVIF.

### 3. Maquetar (HTML real primero)
El póster es un `<img>` real (cuenta como LCP y es lo que ve quien no tiene JS o pide menos movimiento); el canvas va encima.
Patrón completo en [references/patrones-codigo.md](references/patrones-codigo.md) (sección "Maqueta").

### 4. Conectar al scroll
Copia `scripts/frame-scrubber.js` al proyecto (no lo edites; se configura por opciones) y:
```js
import { crearFrameScrubber } from './frame-scrubber.js';
const seq = await crearFrameScrubber({ canvas, base: '/frames/producto/' });
ScrollTrigger.create({ trigger: '#seccion', start: 'top top', end: '+=300%', pin: true, scrub: true,
  onUpdate: (s) => seq.progreso(s.progress) });
```
- Con Lenis: `scrub: true` (sin número) para no apilar dos suavizados. Sin Lenis: `scrub: 0.5`.
- Duración del tramo: ~2,5-4 pantallas (`+=250%`…`+=400%`) para 120 frames. Más corto se siente brusco; más largo, aburrido.
- Modo vídeo: `scripts/video-scrubber.js` con el MP4 de `--video-scrub` (patrón en references).
- Textos que aparecen en momentos del vídeo: una timeline con el mismo ScrollTrigger (references, "Textos sincronizados").

### 5. Accesibilidad y reservas (obligatorio)
- `prefers-reduced-motion: reduce` → no se crea el scrubber ni el pin: se queda el póster y el contenido fluye normal.
- Sin JS / fallo de carga → el `<img>` póster ya está en su sitio. El canvas lleva `aria-hidden="true"`.
- El texto importante, siempre en HTML encima (nunca dentro del vídeo).

### 6. Verificar (no lo des por hecho)
- Capturas en 6+ posiciones del tramo, escritorio (1440×900) y móvil (390×844): `node ../web-premium/scripts/verificar-scroll.mjs <url> <carpeta>`.
- Que en la pestaña Red no haya 404 de frames y que el peso total cuadre.
- Scroll rápido arriba y abajo: nunca debe verse el canvas vacío (el motor pinta el frame cargado más cercano).
- Revisión visual con un modelo de visión (p. ej. Gemini) de las capturas o de una grabación.

## Checklist de rendimiento
- [ ] ≤150 frames; peso dentro del presupuesto (escritorio ≤8 MB, móvil ≤4 MB).
- [ ] Variante móvil propia (vertical 9:16, 720 px de ancho), no el frame de escritorio reescalado.
- [ ] Póster `<img fetchpriority="high">` y `width/height` puestos (sin CLS).
- [ ] DPR con tope 2; el canvas no supera la resolución del frame.
- [ ] Solo se redibuja al cambiar el índice; un único bucle rAF (gsap.ticker si hay Lenis).
- [ ] Memoria acotada (ventana LRU de bitmaps: 48 escritorio / 24 móvil) y `destruir()` al desmontar (SPA/Next).
- [ ] Frames servidos con caché larga (`Cache-Control: public, max-age=31536000, immutable`) y nombre de carpeta versionado.
- [ ] reduced-motion y sin-JS comprobados con captura.

## Referencias
- [references/patrones-codigo.md](references/patrones-codigo.md): maqueta, GSAP + Lenis, sin GSAP, modo vídeo, textos sincronizados, HUD de datos ligado al progreso (contador, tiempo, temperatura, estado), React/Next.
- [references/rendimiento.md](references/rendimiento.md): presupuestos, memoria en iOS, formatos, caché, interpolación de frames, fondo transparente.
- [references/problemas.md](references/problemas.md): síntomas → causa → arreglo.
