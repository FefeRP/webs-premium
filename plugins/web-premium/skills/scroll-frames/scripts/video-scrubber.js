// video-scrubber.js: avanza un <video> según un progreso 0..1 (modo vídeo del scroll-scrubbing).
// Sin dependencias. Pensado para el MP4 "para buscar" que genera extraer-frames.mjs --video-scrub
// (GOP denso: un fotograma clave cada 4-8, así cada salto es barato).
// Ideas adaptadas de nateherkai/scroll-craft (MIT): carga como blob, lerp hacia el objetivo, no encadenar seeks,
// cebar el decodificador en iOS con play()+pause().
//
//   import { crearVideoScrubber } from './video-scrubber.js';
//   const vs = await crearVideoScrubber({ video, src: '/frames/x/scrub-escritorio.mp4', srcMovil: '/frames/x/scrub-movil.mp4' });
//   ScrollTrigger.create({ ..., onUpdate: s => vs.progreso(s.progress) });
//   if (!vs.ok) → enseña el póster (iOS en ahorro de batería bloquea el vídeo)

export async function crearVideoScrubber({
  video,
  src,
  srcMovil = null,
  suavizado = 0.18,  // 0..1: fracción del camino que avanza cada frame (1 = sin suavizado)
  zonaMuerta = null, // segundos; por defecto 0.008 escritorio / 0.02 móvil
} = {}) {
  const movil = matchMedia('(max-width: 767px)').matches;
  const url = movil && srcMovil ? srcMovil : src;
  const muerta = zonaMuerta ?? (movil ? 0.02 : 0.008);
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.preload = 'auto';

  // Blob: el seek no depende de que el servidor acepte peticiones Range.
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`video-scrubber: ${resp.status} al cargar ${url}`);
  const blob = await resp.blob();
  const objUrl = URL.createObjectURL(blob);
  video.src = objUrl;
  await new Promise((ok, mal) => {
    video.addEventListener('loadedmetadata', ok, { once: true });
    video.addEventListener('error', () => mal(new Error('video-scrubber: no se pudo cargar el vídeo')), { once: true });
  });

  let ok = true;
  let destruido = false;
  let reintento = null;
  // Cebar el decodificador (iOS no pinta frames con seek hasta que se ha reproducido algo).
  const cebar = async () => {
    try { await video.play(); video.pause(); return true; } catch { return false; }
  };
  const quitarReintento = () => {
    if (!reintento) return;
    removeEventListener('pointerdown', reintento);
    removeEventListener('touchstart', reintento);
    reintento = null;
  };
  if (!(await cebar())) {
    // Ahorro de batería o autoplay bloqueado: reintenta con el primer gesto; mientras, el llamador muestra el póster.
    ok = false;
    reintento = async () => {
      if (destruido) return;
      if (await cebar()) { quitarReintento(); ok = true; api.ok = true; api.alRecuperar?.(); }
    };
    addEventListener('pointerdown', reintento, { passive: true });
    addEventListener('touchstart', reintento, { passive: true });
  }

  const duracion = video.duration;
  let objetivo = 0;
  let actual = 0;
  let raf = 0;
  let desde = 0;

  function paso() {
    raf = 0;
    if (destruido) return;
    actual += (objetivo - actual) * suavizado;
    if (Math.abs(objetivo - actual) < muerta) actual = objetivo;
    // Un seek a la vez: si el anterior sigue en curso, esperamos (salvo atasco > 700 ms).
    const atascado = video.seeking && performance.now() - desde > 700;
    if ((!video.seeking || atascado) && Math.abs(video.currentTime - actual) >= muerta) {
      desde = performance.now();
      video.currentTime = actual;
    }
    if (actual !== objetivo || video.seeking) raf = requestAnimationFrame(paso);
  }

  const api = {
    ok,
    duracion,
    alRecuperar: null,
    progreso(p) {
      objetivo = Math.min(1, Math.max(0, p)) * Math.max(0, duracion - 0.04);
      if (!raf) raf = requestAnimationFrame(paso);
    },
    destruir() {
      destruido = true;
      quitarReintento();
      if (raf) cancelAnimationFrame(raf);
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(objUrl);
    },
  };
  return api;
}
