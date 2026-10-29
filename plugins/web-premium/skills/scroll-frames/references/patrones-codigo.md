# Patrones de código: scroll-frames

Probados en la demo `demos/reloj` del marketplace (three 0.186, GSAP 3.15, Lenis 1.3.27, Vite).

## Maqueta
```html
<section class="secuencia" id="secuencia" aria-label="El reloj, de perfil a frente">
  <div class="secuencia__escena">
    <!-- Póster real: LCP, sin JS y reduced-motion. Mismo encuadre que el frame 1. -->
    <picture>
      <source media="(max-width: 767px)" srcset="/frames/reloj/poster-movil.webp">
      <img class="secuencia__poster" src="/frames/reloj/poster-escritorio.webp" width="1920" height="1080"
           alt="Reloj cronógrafo dorado de perfil" fetchpriority="high" decoding="async">
    </picture>
    <canvas class="secuencia__canvas" aria-hidden="true"></canvas>
    <div class="secuencia__textos">
      <p class="dato" data-en="0.15">Caja de 48 mm…</p>
      <p class="dato" data-en="0.55">Esfera doble…</p>
    </div>
  </div>
</section>
```
```css
.secuencia { position: relative; }
.secuencia__escena { position: relative; height: 100svh; overflow: hidden; background: #171412; } /* = fondo del vídeo */
.secuencia__poster, .secuencia__canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.secuencia__canvas { opacity: 0; transition: opacity .4s; }
.secuencia.lista .secuencia__canvas { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .secuencia__canvas { display: none; } }
```
Fondo de la sección = color exacto del fondo del vídeo (mídelo con un cuentagotas en el frame 1): así los bordes no se notan con `cover` en pantallas de otra proporción.

## GSAP + ScrollTrigger + Lenis (recomendado)
```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { crearFrameScrubber } from './frame-scrubber.js';
gsap.registerPlugin(ScrollTrigger);

const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!menosMovimiento) {
  // Un único bucle: Lenis dentro del ticker de GSAP
  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  const seccion = document.querySelector('#secuencia');
  const canvas = seccion.querySelector('canvas');
  try {
    const seq = await crearFrameScrubber({ canvas, base: '/frames/reloj/' });
    seccion.classList.add('lista');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: seccion, start: 'top top', end: '+=300%', pin: true, scrub: true,
        onUpdate: (s) => seq.progreso(s.progress) },
    });
    // Textos sincronizados (ver abajo)
  } catch (e) {
    console.warn('Secuencia no disponible, se queda el póster', e);
  }
}
```

## Sin GSAP (sticky + cálculo propio)
```html
<section id="pista" style="height: 400vh"><div style="position: sticky; top: 0; height: 100svh">…póster + canvas…</div></section>
```
```js
const pista = document.querySelector('#pista');
let pendiente = false;
addEventListener('scroll', () => {
  if (pendiente) return; pendiente = true;
  requestAnimationFrame(() => {
    const r = pista.getBoundingClientRect();
    seq.progreso(Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))));
    pendiente = false;
  });
}, { passive: true });
```

## Textos sincronizados
Cada texto aparece y se va en un punto del progreso. En la misma timeline del pin (duración total 1 = todo el tramo):
```js
gsap.utils.toArray('.dato').forEach((el) => {
  const en = Number(el.dataset.en);              // 0..1 dentro del tramo
  tl.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.06, ease: 'none' }, en)
    .to(el, { autoAlpha: 0, y: -24, duration: 0.06, ease: 'none' }, en + 0.18);
});
tl.set({}, {}, 1); // fija la duración de la timeline a 1 para que "en" sea proporción del tramo
```
Coloca los textos en el **espacio vacío** que dejó el vídeo (pídelo así al generador). Contraste AA sobre el frame más claro de su tramo.

## HUD de datos ligado al progreso (contador, tiempo, temperatura, estado)
Visto en ref11: "1,343 FLAKES AIRBORNE" sube mientras el cruasán se parte, y en el horneado "07:55 · 190 °C · +25 % · Golden".
Los números van con el **mismo progreso** que los frames: si el visitante sube, bajan. Probado en `pruebas/lente-envase/` (sección HUD).
```html
<div class="hud" aria-hidden="true">               <!-- decorativo: el dato importante, también en texto normal -->
  <b data-hud="migas">0</b><span>migas en el aire</span>
  <span data-hud="tiempo">00:00</span><span data-hud="grados">20 °C</span><span data-hud="estado">Crudo</span>
  <i class="hud__barra"></i>
</div>
```
```css
.hud { font-variant-numeric: tabular-nums; }        /* sin esto, los números "bailan" al cambiar */
.hud__barra { transform-origin: left; transform: scaleX(var(--p, 0)); }
```
```js
const fmt = new Intl.NumberFormat('es-ES');
const campo = (k) => document.querySelector(`[data-hud="${k}"]`);
const suave = gsap.parseEase('power2.inOut');      // curva suave: el contador no "salta" al principio (fallo de ref11)
function pintarHud(p) {                             // p = progreso 0..1 del tramo (el mismo de los frames)
  campo('migas').textContent = fmt.format(Math.round(suave(p) * 1343));
  const s = Math.round(p * 18 * 60);
  campo('tiempo').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  campo('grados').textContent = `${Math.round(20 + 170 * Math.min(1, p / 0.3))} °C`;   // sube y se queda
  campo('estado').textContent = p < 0.35 ? 'Crudo' : p < 0.75 ? 'Dorado claro' : 'Dorado';
  document.querySelector('.hud').style.setProperty('--p', p.toFixed(4));
}
// En el ScrollTrigger del tramo: onUpdate: (st) => { scrubber.setProgreso(st.progress); pintarHud(st.progress); }
```
- **Cifras con sentido:** que el número final sea un dato real del producto (capas, horas, grados), no decoración.
- **Estado que cambia de color con los frames** (crudo → dorado): el vídeo lo hace con fotograma inicial y final (ver `video-ia-para-scroll`, receta "por dentro"). El HUD solo pone nombre al cambio.
- **Menos movimiento:** el HUD con el valor final, sin animar.

## Modo vídeo (currentTime)
```html
<video class="secuencia__video" muted playsinline preload="auto" aria-hidden="true"></video>
```
```js
import { crearVideoScrubber } from './video-scrubber.js';
const vs = await crearVideoScrubber({ video, src: '/frames/reloj/scrub-escritorio.mp4', srcMovil: '/frames/reloj/scrub-movil.mp4' });
if (vs.ok) seccion.classList.add('lista'); else vs.alRecuperar = () => seccion.classList.add('lista');
ScrollTrigger.create({ trigger: seccion, start: 'top top', end: '+=300%', pin: true, scrub: true, onUpdate: (s) => vs.progreso(s.progress) });
```

## React / Next.js
- Componente cliente (`'use client'`), crea el scrubber en `useEffect`/`useGSAP` y llama a `destruir()` + `ScrollTrigger.kill()` en la limpieza.
- Frames en `public/frames/<nombre>/`. El póster con `<img>` normal (no `next/image`, que reescala y cambia el encuadre) o con `unoptimized`.
- Si la página usa View Transitions o navegación cliente, `ScrollTrigger.refresh()` tras montar.
```jsx
'use client';
import { useRef } from 'react';
import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'; import { useGSAP } from '@gsap/react';
import { crearFrameScrubber } from '@/lib/frame-scrubber';
gsap.registerPlugin(ScrollTrigger, useGSAP);
export function Secuencia() {
  const raiz = useRef(null);
  useGSAP(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let seq; let vivo = true;
    crearFrameScrubber({ canvas: raiz.current.querySelector('canvas'), base: '/frames/reloj/' }).then((s) => {
      if (!vivo) return s.destruir();
      seq = s; raiz.current.classList.add('lista');
      ScrollTrigger.create({ trigger: raiz.current, start: 'top top', end: '+=300%', pin: true, scrub: true, onUpdate: (st) => s.progreso(st.progress) });
    });
    return () => { vivo = false; seq?.destruir(); };
  }, { scope: raiz });
  return (<section ref={raiz} className="secuencia">…</section>);
}
```
