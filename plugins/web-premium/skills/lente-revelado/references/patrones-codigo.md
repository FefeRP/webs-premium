# Patrones de código: lente-revelado

Probados en `pruebas/lente-envase/` del repo (Chrome, escritorio, móvil y reduced-motion; 0 errores).

## Maqueta
```html
<section class="escaneo" aria-label="Mira por dentro">
  <h2>Visión de rayos X. <em>Sin abrirlo.</em></h2>
  <p>Pasa el cursor por encima (en el móvil, arrástralo con el dedo).</p>
  <div class="modos" role="group" aria-label="Modo de la lente">
    <button aria-pressed="true" data-a="rayosx">Rayos X</button>
    <button aria-pressed="false" data-a="termica">Térmica</button>
  </div>
  <div class="revelado" data-revelado>
    <img class="revelado__capa" src="/revelado/base.webp" width="1200" height="1450" alt="(describe el producto)">
    <img class="revelado__capa" data-modo="rayosx"  src="/revelado/rayosx.webp"  alt="" aria-hidden="true">
    <img class="revelado__capa" data-modo="termica" src="/revelado/termica.webp" alt="" aria-hidden="true">
    <div class="revelado__anillo" aria-hidden="true"></div>
  </div>
</section>
```
```css
.revelado { position: relative; width: min(80vw, 52svh); aspect-ratio: 1200 / 1450; }   /* = proporción de las imágenes */
.revelado__capa { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
/* La mira: anillo fino + marcas cada 15° (conic) recortadas a una corona con mask. */
.revelado__anillo { border: 1px solid rgba(160,210,255,.8); box-shadow: 0 0 0 6px rgba(160,210,255,.08), inset 0 0 30px rgba(120,190,255,.25);
  background: repeating-conic-gradient(rgba(160,210,255,.7) 0 .6deg, transparent .6deg 15deg);
  mask: radial-gradient(circle, transparent calc(100% - 7px), #000 calc(100% - 6px)); }
```

## Motor
```js
import { crearLenteRevelado } from './lib/lente-revelado.js';
const lente = crearLenteRevelado(document.querySelector('[data-revelado]'), { radio: 120, borde: 18 });
for (const b of document.querySelectorAll('.modos button')) b.addEventListener('click', () => {
  lente.modo(b.dataset.a);
  for (const o of document.querySelectorAll('.modos button')) o.setAttribute('aria-pressed', String(o === b));
});
```
Opciones: `radio`, `borde`, `suavizado` (lerp hacia el cursor), `modoInicial`, `paseo` (móvil), `alSalir: 'ocultar' | 'quedar'`.
Métodos: `modo(nombre)`, `cortina(p | null)`, `llevarA(x, y)` (0..1, p. ej. para señalar un detalle desde el scroll), `destruir()`.

## Antes/después con el scroll (cortina)
```js
const comp = crearLenteRevelado(document.querySelector('[data-comparar]'));   // dos capas: base + data-modo="despues"
ScrollTrigger.create({ trigger: '#comparar', start: 'top top', end: '+=150%', pin: true, scrub: true,
  onUpdate: (st) => comp.cortina(st.progress) });
// Menos movimiento: comp.cortina(0.5) fijo y un texto que explique el cambio.
```

## La lente señala un detalle mientras se baja
```js
ScrollTrigger.create({ trigger: '#escaneo', start: 'top center', onEnter: () => lente.llevarA(0.62, 0.40) });
```

## Trampas vividas
- **Capas con distinto `object-fit` o distinto tamaño de fichero:** la variante "patina" bajo la lente. Todas las capas, mismo tamaño. Se comprueba con `variantes-revelado.mjs --comprobar`.
- **`mask-image` sin prefijo:** Chrome, Edge, Firefox y Safari ≥ 15.4 lo aceptan. El motor pone también `-webkit-mask-image`.
- **`clip-path: circle()` en vez de máscara:** sirve, pero da un borde seco. Con `radial-gradient` el borde se funde.
- **Lente en una sección con transform (pin de GSAP):** el motor mide con `getBoundingClientRect` en cada movimiento, así que funciona; no caches la caja.
- **En táctil, `touch-action: none` bloquearía el scroll:** el motor pone `pan-y` (el dedo mueve la lente en horizontal y la página en vertical).
