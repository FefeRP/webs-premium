# Patrones de código: parallax-capas

Probados en `demos/reloj` (hero).

## Maqueta
```html
<header class="hero" data-parallax>
  <div class="hero__capa hero__capa--fondo" data-profundidad="-0.7" aria-hidden="true">…</div>
  <img class="hero__capa hero__sujeto" data-profundidad="0" src="/img/sujeto.webp" width="1200" height="1200" alt="…" fetchpriority="high">
  <div class="hero__texto">…titular y CTA (sin parallax)…</div>
  <div class="hero__capa hero__capa--frente" data-profundidad="0.6" aria-hidden="true">…</div>
</header>
```
```css
.hero { position: relative; height: 100svh; overflow: hidden; isolation: isolate; }
.hero__capa { position: absolute; inset: -10%; }            /* más grande que el marco: no se ven bordes */
.hero__capa--fondo { z-index: 0; }
.hero__sujeto { z-index: 1; inset: auto; left: 50%; top: 50%; width: min(70vmin, 720px); height: auto; translate: -50% -50%; }
.hero__texto { position: relative; z-index: 2; }
.hero__capa--frente { z-index: 3; pointer-events: none; filter: blur(6px); } /* blur estático, nunca animado */
```
Nota: el motor escribe `transform`; si centras con `transform`, usa la propiedad `translate` (como arriba) para no pisarlo.

## JS (scroll + puntero, sin dependencias)
```js
import { crearParallax } from './capas-parallax.js';
const p = crearParallax(document.querySelector('[data-parallax]'), { recorrido: 0.2, intensidad: 20 });
// con Lenis no hace falta nada (Lenis mueve el scroll nativo y dispara 'scroll')
// al desmontar (SPA): p.destruir()
```

## Solo CSS (scroll-driven, sin puntero)
```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .hero__capa { animation: parallax linear both; animation-timeline: view(); animation-range: exit; }
    .hero__capa--fondo  { --d: -0.7; }
    .hero__capa--frente { --d: 0.6; }
    @keyframes parallax { to { transform: translate3d(0, calc(var(--d) * -25svh), 0); } }
  }
}
```
`animation-range: exit` = solo mientras el hero sale por arriba (lo normal en un hero). Para secciones intermedias usa `cover`.
Soporte: Chrome/Edge 115+, Safari 26, Firefox 159+. Sin soporte → capas quietas (correcto).

## GSAP (dentro de una sección fijada con más animación)
```js
gsap.utils.toArray('[data-profundidad]').forEach((el) => {
  const z = Number(el.dataset.profundidad);
  gsap.to(el, { yPercent: -20 * z, ease: 'none', scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } });
});
```

## React / Next.js
```jsx
'use client';
import { useEffect, useRef } from 'react';
import { crearParallax } from '@/lib/capas-parallax';
export function Hero() {
  const ref = useRef(null);
  useEffect(() => { const p = crearParallax(ref.current); return () => p.destruir(); }, []);
  return <header ref={ref} className="hero" data-parallax>…</header>;
}
```
