// escena-producto.js: base de escena three.js para un producto glTF/GLB "premium".
// Requiere three (>= 0.160; probado con 0.186.1). Importa con el mapa de módulos o el bundler del proyecto.
//
//   import { crearEscenaProducto } from './escena-producto.js';
//   const e = await crearEscenaProducto({ contenedor, modelo: '/modelos/reloj.glb' });
//   e.progreso(p)  → gira/acerca el producto según el scroll (0..1)
//   e.destruir()   → libera GPU y eventos (obligatorio en SPA/Next)
//   Cancelar mientras carga: pasa { senal: controlador.signal } y llama a controlador.abort().
//
// Qué resuelve: cargadores comprimidos (Meshopt, Draco, KTX2), centrado y escala automáticos, luz de estudio sin HDR externo
// (RoomEnvironment), sombra de contacto barata, DPR con tope, render SOLO cuando algo cambia, pausa fuera de pantalla,
// arrastre horizontal con inercia que no secuestra el scroll vertical en móvil, pérdida de contexto WebGL y limpieza.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// DRACOLoader y KTX2Loader se importan solo si se pasan rutaDraco/rutaBasis (import dinámico más abajo):
// importados siempre, el bundler mete en dist sus decodificadores (draco/basis, ~1,8 MB) aunque el modelo use Meshopt.
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export async function crearEscenaProducto({
  contenedor,
  modelo,                          // url .glb/.gltf
  rutaDraco = null,                // ej. '/draco/' (copia de three/examples/jsm/libs/draco/gltf/)
  rutaBasis = null,                // ej. '/basis/' (copia de three/examples/jsm/libs/basis/) para texturas KTX2
  fondo = null,                    // color CSS o null = transparente (se ve el fondo de la web)
  exposicion = 1,
  intensidadEntorno = 1,
  luces = true,                    // clave cálida + contra fría además del entorno
  sombra = true,                   // sombra de contacto (degradado radial, coste ~0)
  tamSombra = 1.1,                 // lado del plano de la sombra (modelo normalizado a 1). Si es muy grande, su parte
                                   // delantera se sale por abajo del encuadre y se ve un corte recto en el borde del canvas
  fov = 30,
  distancia = 2.6,                 // distancia de cámara con el modelo normalizado a 1 de tamaño
  altura = 0.35,
  arrastrar = true,                // girar con el dedo/ratón (solo eje horizontal)
  giroInicial = 0,                 // radianes
  giroScroll = Math.PI * 0.6,      // cuánto gira con progreso 0→1
  acercarScroll = 0.12,            // cuánto se acerca la cámara con progreso 0→1 (fracción de la distancia).
                                   // Ojo: con fov 30 y distancia 2.6 se ven 1,39 unidades de alto; con 0.25 al final quedan 1,04
                                   // y el producto (tamaño 1 + perspectiva) se sale del cuadro. 0.12 deja ~1,2.
  autoGiro = 0,                    // rad/s de giro continuo (0 = nada; se para con reduced-motion)
  dprMax = null,                   // auto: 2 escritorio, 1.5 móvil
  alProgresoCarga = null,          // (0..1) => {}
  senal = null,                    // AbortSignal opcional: cancela durante la carga (lanza AbortError y libera todo)
} = {}) {
  const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const movil = matchMedia('(max-width: 767px)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, dprMax ?? (movil ? 1.5 : 2));

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: !fondo, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposicion;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;';
  contenedor.appendChild(canvas);

  const escena = new THREE.Scene();
  if (fondo) escena.background = new THREE.Color(fondo);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const entorno = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  escena.environment = entorno;
  escena.environmentIntensity = intensidadEntorno;
  pmrem.dispose();
  if (luces) {
    const clave = new THREE.DirectionalLight('#ffe2c4', 2); clave.position.set(-3, 4, 3);
    const contra = new THREE.DirectionalLight('#c9d6ff', 1.2); contra.position.set(3, 2, -4);
    escena.add(clave, contra);
  }

  const camara = new THREE.PerspectiveCamera(fov, 1, 0.01, 100);

  // --- cargadores comprimidos ---
  const cargador = new GLTFLoader();
  cargador.setMeshoptDecoder(MeshoptDecoder);
  let draco = null, ktx2 = null;
  if (rutaDraco) {
    const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
    draco = new DRACOLoader().setDecoderPath(rutaDraco); cargador.setDRACOLoader(draco);
  }
  if (rutaBasis) {
    const { KTX2Loader } = await import('three/addons/loaders/KTX2Loader.js');
    ktx2 = new KTX2Loader().setTranscoderPath(rutaBasis).detectSupport(renderer); cargador.setKTX2Loader(ktx2);
  }

  // si la carga falla o se cancela (senal.abort(), p. ej. el componente se desmonta mientras carga),
  // se libera lo ya creado y se lanza el error: no queda un contexto WebGL huérfano
  const liberarParcial = () => {
    entorno.dispose(); draco?.dispose(); ktx2?.dispose();
    renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
  };
  let gltf;
  try {
    senal?.throwIfAborted();
    gltf = await cargador.loadAsync(modelo, (ev) => {
      if (ev.lengthComputable) alProgresoCarga?.(ev.loaded / ev.total);
    });
    senal?.throwIfAborted();
  } catch (e) {
    if (gltf) gltf.scene.traverse((o) => {
      o.geometry?.dispose?.();
      for (const m of [].concat(o.material || [])) {
        for (const v of Object.values(m)) if (v && v.isTexture) v.dispose();
        m.dispose();
      }
    });
    liberarParcial();
    throw e;
  }
  const objeto = gltf.scene;
  // normalizar: centrado en el origen y tamaño máximo 1
  const caja = new THREE.Box3().setFromObject(objeto);
  const tam = caja.getSize(new THREE.Vector3());
  const centro = caja.getCenter(new THREE.Vector3());
  const s = 1 / Math.max(tam.x, tam.y, tam.z);
  objeto.scale.setScalar(s);
  objeto.position.sub(centro.multiplyScalar(s));
  const pivote = new THREE.Group();
  pivote.add(objeto);
  pivote.rotation.y = giroInicial;
  escena.add(pivote);

  let sombraMesh = null;
  if (sombra) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(0,0,0,0.5)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    sombraMesh = new THREE.Mesh(new THREE.PlaneGeometry(tamSombra, tamSombra),new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    sombraMesh.rotation.x = -Math.PI / 2;
    sombraMesh.position.y = new THREE.Box3().setFromObject(pivote).min.y - 0.002;
    escena.add(sombraMesh);
  }

  // --- estado y render bajo demanda ---
  let progreso = 0;
  let giroUsuario = 0, giroUsuarioObjetivo = 0, velocidad = 0;
  let visible = true, raf = 0, destruido = false, ultimo = performance.now();

  function colocarCamara() {
    const d = distancia * (1 - acercarScroll * progreso);
    camara.position.set(0, altura * (1 - 0.5 * progreso), d);
    camara.lookAt(0, 0, 0);
  }

  function frame(ahora) {
    raf = 0;
    if (destruido || !visible || document.hidden) return;
    const dt = Math.min(0.05, (ahora - ultimo) / 1000); ultimo = ahora;
    let sigue = false;
    // inercia del arrastre
    if (Math.abs(velocidad) > 0.0001) { giroUsuarioObjetivo += velocidad; velocidad *= 0.92; sigue = true; }
    giroUsuario += (giroUsuarioObjetivo - giroUsuario) * 0.15;
    if (Math.abs(giroUsuarioObjetivo - giroUsuario) > 0.0005) sigue = true;
    if (autoGiro && !menosMovimiento && !arrastrando) { giroUsuarioObjetivo += autoGiro * dt; sigue = true; }
    pivote.rotation.y = giroInicial + giroScroll * progreso + giroUsuario;
    colocarCamara();
    renderer.render(escena, camara);
    if (sigue) pedir();
  }
  function pedir() { if (!raf && !destruido) { ultimo = performance.now(); raf = requestAnimationFrame(frame); } }

  function ajustar() {
    const r = contenedor.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camara.aspect = r.width / r.height;
    camara.updateProjectionMatrix();
    pedir();
  }
  const ro = new ResizeObserver(ajustar); ro.observe(contenedor);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) pedir(); }, { rootMargin: '10% 0px' });
  io.observe(contenedor);
  const alVisibilidad = () => { if (!document.hidden) pedir(); };
  document.addEventListener('visibilitychange', alVisibilidad);

  // --- arrastre horizontal (no bloquea el scroll vertical: touch-action: pan-y) ---
  let arrastrando = false, xPrevio = 0;
  const abajo = (e) => { arrastrando = true; xPrevio = e.clientX; velocidad = 0; canvas.setPointerCapture?.(e.pointerId); };
  const mover = (e) => {
    if (!arrastrando) return;
    const dx = (e.clientX - xPrevio) / Math.max(1, contenedor.clientWidth);
    xPrevio = e.clientX;
    giroUsuarioObjetivo += dx * Math.PI * 1.5;
    velocidad = dx * Math.PI * 0.5;
    pedir();
  };
  const arriba = () => { arrastrando = false; };
  if (arrastrar) {
    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', abajo);
    canvas.addEventListener('pointermove', mover);
    canvas.addEventListener('pointerup', arriba);
    canvas.addEventListener('pointercancel', arriba);
  }

  // --- pérdida de contexto: avisa para mostrar el póster ---
  let alPerderContexto = null;
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); alPerderContexto?.(); });

  ajustar();
  colocarCamara();
  renderer.render(escena, camara);

  return {
    renderer, escena, camara, modelo: objeto, pivote, animaciones: gltf.animations,
    set alPerderContexto(fn) { alPerderContexto = fn; },
    /** 0..1: lo enlazas a un ScrollTrigger */
    progreso(p) { progreso = Math.min(1, Math.max(0, p)); pedir(); },
    /** fuerza un render (si cambias materiales, luces…) */
    invalidar: pedir,
    destruir() {
      destruido = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', alVisibilidad);
      escena.traverse((o) => {
        o.geometry?.dispose?.();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        for (const m of mats) {
          for (const v of Object.values(m)) if (v && v.isTexture) v.dispose();
          m.dispose();
        }
      });
      entorno.dispose();
      draco?.dispose(); ktx2?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

/** true si el dispositivo puede con WebGL2 (si no, quédate con el póster) */
export function hayWebGL2() {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
}
