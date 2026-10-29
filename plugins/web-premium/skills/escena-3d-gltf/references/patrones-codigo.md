# Patrones de código: escena-3d-gltf

Probados en `demos/reloj` (sección "En tus manos").

## Maqueta con póster
```html
<section class="vivo" id="vivo">
  <div class="vivo__escena">
    <img class="vivo__poster" src="/img/producto-poster.webp" width="1600" height="1600" alt="El reloj de frente" loading="lazy">
    <!-- escena-producto.js mete aquí el canvas -->
  </div>
  <p class="vivo__ayuda">Arrastra para girarlo</p>
</section>
```
```css
.vivo__escena { position: relative; aspect-ratio: 1; max-height: 80svh; margin-inline: auto; }
.vivo__poster, .vivo__escena canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.vivo__escena canvas { opacity: 0; transition: opacity .6s; }
.vivo__escena.lista canvas { opacity: 1; }
.vivo__escena.lista .vivo__poster { opacity: 0; transition: opacity .6s .2s; }
```

## Carga diferida (three solo cuando hace falta)
```js
const contenedor = document.querySelector('.vivo__escena');
const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches; // antes del import(): si no, baja three para nada
const io = new IntersectionObserver(async ([e]) => {
  if (!e.isIntersecting || menosMovimiento) return;                               // se queda el póster
  io.disconnect();
  const { crearEscenaProducto, hayWebGL2 } = await import('./escena-producto.js');
  if (!hayWebGL2()) return;                                                       // se queda el póster
  const movil = matchMedia('(max-width: 767px)').matches;
  const escena = await crearEscenaProducto({ contenedor, modelo: movil ? '/modelos/reloj-movil.glb' : '/modelos/reloj.glb' });
  contenedor.classList.add('lista');
  escena.alPerderContexto = () => contenedor.classList.remove('lista');
  ScrollTrigger.create({ trigger: '#vivo', start: 'top bottom', end: 'bottom top', scrub: true, onUpdate: (s) => escena.progreso(s.progress) });
}, { rootMargin: '100% 0px' });
io.observe(contenedor);
```
Si quieres que la reduced-motion siga viendo el 3D (estático, girable a mano), crea la escena con `giroScroll: 0, acercarScroll: 0, autoGiro: 0` en vez de no crearla.

## Coreografía más rica con una timeline
`escena-producto.js` expone `camara`, `pivote`, `modelo` e `invalidar()`. Anima lo que quieras con GSAP y pide render en cada actualización:
```js
const tl = gsap.timeline({ scrollTrigger: { trigger: '#historia', start: 'top top', end: '+=400%', pin: true, scrub: true },
  onUpdate: () => escena.invalidar() });
tl.to(escena.pivote.rotation, { y: Math.PI * 2, ease: 'none' }, 0)
  .to(escena.camara, { fov: 22, onUpdate: () => escena.camara.updateProjectionMatrix() }, 0.3);
// despiece: piezas por nombre
const tapa = escena.modelo.getObjectByName('Bezel Frame');
tl.to(tapa.position, { y: '+=0.4' }, 0.5);
```
(No combines `progreso()` con una timeline que también toque `pivote.rotation`: elige uno.)

Cámara sobre una curva (recorrido): `const curva = new THREE.CatmullRomCurve3([...puntos])` y en `onUpdate` `curva.getPointAt(p, camara.position); camara.lookAt(objetivo); escena.invalidar()`. Puntos exportables de una curva de Blender (ver Codrops 2026-07-07 en docs/investigacion).

## Materiales "premium" (retoques)
- Metales: `metalness 1`, `roughness 0.2-0.35`, y que el entorno tenga contraste (RoomEnvironment lo da); `envMapIntensity` 1-1,5.
- Cristal: `MeshPhysicalMaterial({ transmission: 1, thickness: 0.5, roughness: 0.05, ior: 1.5 })` — caro: solo escritorio.
- Tela/terciopelo: `sheen: 1, sheenRoughness: 0.5, sheenColor`.
- Tone mapping ACES + exposición 0,9-1,1; fondo de la web del mismo tono que el ambiente de la escena.

## React Three Fiber (proyectos React/Next)
```jsx
'use client';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, PerformanceMonitor } from '@react-three/drei';
import { useState } from 'react';
function Reloj(props) {
  const { scene } = useGLTF('/modelos/reloj.glb'); // Meshopt/Draco incluidos en drei
  return <primitive object={scene} {...props} />;
}
export default function Escena() {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas frameloop="demand" dpr={dpr} camera={{ fov: 30, position: [0, 0.35, 2.6] }} gl={{ antialias: true }} aria-hidden>
      <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => setDpr(1)} />
      <Environment preset="studio" />
      <Reloj />
      <ContactShadows position={[0, -0.5, 0]} opacity={0.5} blur={2.5} />
    </Canvas>
  );
}
useGLTF.preload('/modelos/reloj.glb');
```
En Next: `const Escena = dynamic(() => import('./Escena'), { ssr: false, loading: () => <img src="/img/poster.webp" alt="…" /> })`.
Scroll en R3F: o `ScrollControls` + `useScroll()` de drei (scroll propio dentro del canvas), o ScrollTrigger escribiendo en un ref que lee `useFrame` + `invalidate()`.
