# Base técnica transversal: rendimiento, accesibilidad, SEO

## Presupuestos (página completa)
| | Escritorio | Móvil |
|---|---|---|
| Primera vista (HTML+CSS+JS crítico+póster) | ≤ 400 KB | ≤ 250 KB |
| JS total (gzip) | ≤ 250 KB (sin three) · ≤ 450 KB (con three) | igual, three cargado en diferido |
| Secuencia de frames | ≤ 8 MB, 90-150 frames | ≤ 4 MB, 60-120 frames |
| Modelo glTF | ≤ 3 MB | ≤ 1,5 MB |
| LCP | < 2,5 s | < 2,5 s (4G) |
| CLS | < 0,05 | < 0,05 |
| Memoria de imágenes decodificadas | ≤ 400 MB | ≤ 200 MB |

## Rendimiento
- **Un solo bucle**: Lenis y todos los motores al ticker de GSAP o render bajo demanda; nada de varios `requestAnimationFrame` sueltos.
- Animar solo `transform`, `opacity`, `filter` (ligero) y `clip-path`. Nunca `top/left/width/height`.
- `will-change` solo mientras se anima. Pausar todo lo que no se ve (IntersectionObserver) y cuando la pestaña está oculta.
- Lo pesado (three, frames) se carga **cuando la sección se acerca** (`IntersectionObserver` con `rootMargin: '100% 0px'`) con un **póster** en su lugar.
- DPR del canvas limitado a 2 (1,5 en 3D en móvil).
- Imágenes: AVIF/WebP con `srcset`/`sizes`, `loading="lazy"` salvo la del hero (`fetchpriority="high"`).
- Fuentes: WOFF2, `font-display: swap`, subset, preload solo de la display del hero.
- `ScrollTrigger.refresh()` tras cargar fuentes e imágenes (la plantilla ya lo hace).

## Accesibilidad
- `prefers-reduced-motion: reduce` → sin Lenis, sin scrub ni parallax: se muestra el póster y los textos en orden (la plantilla pone la clase `menos-movimiento`).
- Todo el texto en el DOM real (no dentro del canvas ni de imágenes). El canvas lleva `aria-hidden="true"` o `role="img"` + `aria-label` si aporta información.
- Enlace "saltar al contenido", foco visible, orden de tabulación lógico; los elementos fijados no atrapan el foco.
- Contraste AA (4,5:1 texto normal) en **todas** las posiciones del scroll.
- Sonido nunca automático; interruptor accesible con `aria-pressed`.
- Arrastrar (3D) no debe bloquear el scroll vertical en táctil (`touch-action: pan-y`).

## SEO y compartir
- `<title>`, `meta description`, `og:image` (usa el póster), `lang`, un `h1`.
- Contenido real en HTML (no generado solo por JS) para que se indexe.
- Datos estructurados (Product, LocalBusiness) cuando aplique.

## Robustez
- Sin WebGL2 → póster + texto (la escena 3D lo detecta con `hayWebGL2()`).
- `webglcontextlost` gestionado (los motores lo hacen).
- Error al cargar frames → se queda el póster, sin pantalla en blanco.
- iOS en ahorro de energía bloquea `<video>`: por eso los frames son el modo por defecto.

## Checklist final (antes de entregar)
- [ ] `verificar-scroll.mjs` sin errores de consola ni peticiones fallidas (escritorio, móvil y reduced-motion).
- [ ] Hojas de contactos revisadas: sin huecos, texto legible, momento estrella visible en móvil.
- [ ] `npm run build` limpio; pesos dentro del presupuesto (mira `dist/` y los frames).
- [ ] Con reduced-motion la página se lee completa y en orden.
- [ ] Teclado: Tab recorre todo; el foco se ve.
- [ ] Créditos y licencias de todos los activos en el pie o en CREDITOS.md.
- [ ] Revisión visual externa (Gemini) leída y sus fallos corregidos o descartados con motivo.
