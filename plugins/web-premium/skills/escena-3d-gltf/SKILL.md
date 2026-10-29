---
name: escena-3d-gltf
description: Escena 3D real con three.js y un modelo glTF/GLB (producto, objeto, personaje) para webs premium - conseguir y optimizar el modelo (gltf-transform, Meshopt/Draco, texturas WebP/KTX2, versión móvil), escena de estudio con luz realista sin HDR externo, producto que gira o se acerca con el scroll (GSAP ScrollTrigger), arrastre que no secuestra el scroll, render bajo demanda, póster de reserva, limpieza de memoria, y equivalente en React Three Fiber. Úsala cuando pidan "modelo 3D en la web", "producto en 3D que se pueda girar", "three.js", "glTF/GLB", "configurador 3D", "3D al hacer scroll", "3D product viewer", "WebGL hero", "react-three-fiber".
license: MIT
version: 1.0.0-beta.3
---

# Escena 3D con modelo glTF

3D de verdad: el visitante puede girar el objeto, la luz reacciona, la cámara se mueve con el scroll.
Es lo más caro (modelo, peso, GPU, móvil) y no siempre hace falta: si el visitante no va a interactuar con el objeto,
`scroll-frames` (vídeo) suele verse mejor con menos riesgo. Usa 3D cuando la interacción o la flexibilidad lo justifiquen
(girar, configurar colores/variantes, escenas que cambian con datos, un objeto que aparece en varias secciones).

## Pasos

### 1. Conseguir el modelo
- **Del cliente** (CAD, Blender, 3ds Max): pide glTF/GLB, o FBX/OBJ y conviértelo en Blender (Export → glTF 2.0, "+Y up", aplicar modificadores, texturas incrustadas).
- **Libres**: Khronos glTF-Sample-Assets (licencia por modelo, suele ser CC-BY 4.0: hay que citar), Poly Haven (CC0), Sketchfab (filtra CC0/CC-BY y guarda la atribución).
- **Generado con IA** (imagen → 3D): sirve para objetos de fondo; para el producto protagonista casi nunca da la calidad (topología y texturas). Valídalo antes de prometerlo.
- Apunta autor y licencia en el proyecto (`CREDITOS.md` o pie de página si es CC-BY).

### 2. Inspeccionar y limpiar
```bash
npx @gltf-transform/cli inspect modelo.glb        # vértices, materiales, texturas, extensiones, tamaño
```
Quita lo que no es del producto (suelos, placas, cámaras de la escena original) — ejemplo en
[references/optimizar-modelos.md](references/optimizar-modelos.md). Comprueba en https://gltf-viewer.donmccurdy.com.

### 3. Optimizar (obligatorio antes de servir)
```bash
npx @gltf-transform/cli optimize limpio.glb public/modelos/producto.glb --compress meshopt --texture-compress webp --texture-size 2048
npx @gltf-transform/cli optimize limpio.glb public/modelos/producto-movil.glb --compress meshopt --texture-compress webp --texture-size 1024
```
Prueba real (reloj de Khronos): 7,1 MB → 2,0 MB (escritorio) y 1,5 MB (móvil). Presupuestos y KTX2/Draco en references.

### 4. Escena
Copia `scripts/escena-producto.js` al proyecto (necesita `three`) y:
```js
import { crearEscenaProducto, hayWebGL2 } from './escena-producto.js';
if (hayWebGL2() && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const movil = matchMedia('(max-width: 767px)').matches;
  const e = await crearEscenaProducto({ contenedor, modelo: movil ? '/modelos/producto-movil.glb' : '/modelos/producto.glb' });
  contenedor.classList.add('lista');                     // fundido del póster al canvas
  e.alPerderContexto = () => contenedor.classList.remove('lista');
}
```
Trae: luz de estudio (RoomEnvironment, sin descargar HDR), tone mapping ACES, sombra de contacto barata, DPR con tope
(2 / 1,5 móvil), render **solo cuando algo cambia**, pausa fuera de pantalla y con la pestaña oculta, arrastre horizontal con
inercia (`touch-action: pan-y`: en móvil el scroll vertical sigue funcionando), `destruir()` que libera GPU.

### 5. Enlazar al scroll
```js
ScrollTrigger.create({ trigger: '#seccion-3d', start: 'top bottom', end: 'bottom top', scrub: true,
  onUpdate: (s) => e.progreso(s.progress) });   // gira giroScroll rad y se acerca acercarScroll
```
Para coreografías de cámara más ricas (recorrido por curva, cambio de material, despiece por piezas) ver
[references/patrones-codigo.md](references/patrones-codigo.md).

### 6. Carga diferida y reservas
- El 3D **nunca** es el LCP: póster `<img>` (un render del modelo o una foto) en su sitio, y el canvas aparece encima al estar listo.
- Carga three y el modelo al acercarse la sección (`IntersectionObserver`, `rootMargin: '100% 0px'`) con `import()` dinámico.
- Sin WebGL2, con reduced-motion o en gama baja (`@pmndrs/detect-gpu` tier 0-1): se queda el póster.
- Lo que se pueda pulsar en 3D tiene su botón HTML equivalente (accesible con teclado).

### 7. Verificar
- Capturas en 3 posiciones de scroll, escritorio y móvil; consola sin errores ni avisos de WebGL.
- Peso del modelo en Red; tiempo hasta que aparece el canvas.
- Rendimiento: Performance de Chrome con CPU ×4 y "Mid-tier mobile": sin tareas largas al hacer scroll.
- Arrastrar en móvil no debe impedir hacer scroll vertical.

## Checklist de rendimiento
- [ ] Modelo optimizado (Meshopt o Draco), texturas ≤ 2048 (≤ 1024 móvil), ≤ 2-3 MB escritorio / ≤ 1,5 MB móvil.
- [ ] ≤ 300k vértices renderizados en móvil; < 100 draw calls (`renderer.info.render.calls`).
- [ ] DPR con tope; render bajo demanda; pausa fuera de pantalla.
- [ ] Postprocesado: 0-2 pases y solo en escritorio de gama alta.
- [ ] Decodificadores (Draco/Basis) servidos desde el propio dominio si se usan.
- [ ] `destruir()` al desmontar; sin fugas al navegar (SPA/Next).
- [ ] Póster como LCP, `aria-hidden` en el canvas, equivalentes HTML.

## Referencias
- [references/optimizar-modelos.md](references/optimizar-modelos.md): limpiar nodos, Meshopt vs Draco, texturas WebP/KTX2, presupuestos, variantes de material, licencias.
- [references/patrones-codigo.md](references/patrones-codigo.md): maqueta con póster, carga diferida, coreografía con timeline, materiales premium, React Three Fiber.
- Para shaders, partículas y postprocesado avanzados: skills `webgl-animation-skills:*` (si están instaladas).
