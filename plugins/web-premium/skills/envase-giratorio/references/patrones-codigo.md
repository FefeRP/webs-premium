# Patrones de código: envase-giratorio

Probados en `pruebas/lente-envase/` del repo (sin GSAP). Aquí, con GSAP, como en la plantilla.

## Maqueta del slider de sabores (ref10)
```html
<section class="slider" id="sabores" aria-label="Sabores">
  <h2 class="slider__titulo" aria-live="polite"><span>Mora</span></h2>          <!-- detrás de la lata -->
  <div class="slider__frutas" aria-hidden="true">                                 <!-- imágenes con alfa -->
    <img class="fruta" data-profundidad="-0.4" src="/frutas/mora-1.webp" alt="">
    <img class="fruta fruta--cerca" data-profundidad="0.8" src="/frutas/mora-2.webp" alt="">
  </div>
  <canvas class="slider__lata" role="img" aria-label="Lata sabor mora"></canvas>
  <button class="slider__flecha" data-dir="-1" aria-label="Sabor anterior">‹</button>
  <button class="slider__flecha" data-dir="1"  aria-label="Sabor siguiente">›</button>
</section>
```
```css
.slider { --fondo: #5b2bd6; --acento: #c6ff3d; position: relative; height: 100svh; overflow: hidden; display: grid; place-items: center;
  background: radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--fondo) 75%, #fff), var(--fondo) 60%); }
.slider__titulo { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden;   /* la máscara del título */
  font: italic 900 clamp(4rem, 17vw, 15rem)/1 var(--fuente-display); color: var(--acento); }
.slider__lata { position: relative; z-index: 2; width: min(46vh, 70vw); height: min(78vh, 118vw); filter: drop-shadow(0 30px 40px #0005); }
.fruta--cerca { z-index: 3; filter: blur(6px); }          /* primer plano desenfocado: profundidad */
```

## Motor + slider con GSAP
```js
import gsap from 'gsap';
import { crearEnvaseGiratorio } from './lib/envase-giratorio.js';
const sabores = [{ id: 'mora', nombre: 'Mora', fondo: '#5b2bd6', acento: '#c6ff3d' }, /* … */];
const lata = crearEnvaseGiratorio(document.querySelector('.slider__lata'), { etiqueta: `/latas/${sabores[0].id}.webp` });
sabores.slice(1).forEach((s) => { new Image().src = `/latas/${s.id}.webp`; });   // precarga
const giro = { v: 0 }; let i = 0, ocupado = false;
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

function cambiar(dir) {
  if (ocupado) return; ocupado = true;
  i = (i + dir + sabores.length) % sabores.length; const s = sabores[i];
  const slider = document.querySelector('.slider'), titulo = slider.querySelector('.slider__titulo span');
  const aplicar = () => {
    lata.cambiarEtiqueta(`/latas/${s.id}.webp`);
    gsap.to(slider, { '--fondo': s.fondo, '--acento': s.acento, duration: 0.6 });
    slider.querySelector('.slider__lata').setAttribute('aria-label', `Lata sabor ${s.nombre.toLowerCase()}`);
  };
  if (reducido) { aplicar(); titulo.textContent = s.nombre; ocupado = false; return; }
  const tl = gsap.timeline({ onComplete: () => { ocupado = false; } });
  tl.to(giro, { v: `+=${dir}`, duration: 1.4, ease: 'power3.inOut', onUpdate: () => lata.girar(giro.v) }, 0)
    .call(aplicar, null, 0.7)                                                       // a mitad del giro
    .to(titulo, { xPercent: -110 * dir, duration: 0.6, ease: 'power3.in' }, 0)
    .call(() => { titulo.textContent = s.nombre; }, null, 0.6)
    .fromTo(titulo, { xPercent: 110 * dir }, { xPercent: 0, duration: 0.7, ease: 'power3.out' }, 0.62)
    .to('.fruta', { yPercent: -40, autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: 'power2.in' }, 0)
    .to('.fruta', { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: 'power2.out' }, 0.75);
    // Si las frutas cambian por variante, cambia su src en el .call de 0.7 s.
}
document.querySelectorAll('.slider__flecha').forEach((b) => b.addEventListener('click', () => cambiar(+b.dataset.dir)));
```

## Giro con el scroll (hero)
```js
ScrollTrigger.create({ trigger: '#sabores', start: 'top top', end: 'bottom top', scrub: true,
  onUpdate: (st) => lata.girar(giro.v + st.progress * 0.35) });   // media vuelta larga: que se note, sin marear
```

## Arrastrar para girar
```js
let x0 = null, v0 = 0;
canvas.addEventListener('pointerdown', (e) => { x0 = e.clientX; v0 = giro.v; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', (e) => { if (x0 == null) return; giro.v = v0 - (e.clientX - x0) / canvas.clientWidth * 0.6; lata.girar(giro.v); });
canvas.addEventListener('pointerup', () => { x0 = null; });
canvas.style.touchAction = 'pan-y';
```

## Trampas vividas
- **Etiqueta SVG:** sirve directamente (`etiqueta: '/latas/mora.svg'`) si lleva `width`/`height` en la raíz. Si usa fuentes web, que
  estén incrustadas o convertidas a trazos: el SVG cargado como imagen no ve las fuentes de la página.
- **Costura:** el motor duplica la etiqueta en horizontal (no hay salto en el borde del fichero), pero si el diseño no casa, se ve.
- **Flechas encima de la lata:** el cuerpo mide `forma.ancho` (0,36) del **alto** del canvas, no el ancho del canvas. Coloca las flechas con ese dato.
- **Canvas CORS:** la etiqueta, del mismo dominio (o con CORS), o `drawImage` "ensucia" el canvas. Aquí no se lee el canvas, así que solo importa si luego quieres exportarlo.
