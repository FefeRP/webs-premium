# Vídeo IA para scroll, frames y reproducción (investigación 2026-10-24)

El contenido útil está ya volcado en las skills `video-ia-para-scroll` y `scroll-frames` (references). Aquí, lo esencial, lo no confirmado y las fuentes.

## Datos clave
- Sora 2 cerrado (app 26-04-2026, API 24-09-2026): no recomendarlo.
- Higgsfield = agregador con créditos: Kling 4.0 (portada), Kling 3.0, Seedance 2.5 (30 s, 720p, ago-2026), Veo 3.1, WAN 2.5/2.6, Hailuo, Genjutsu (propio), Cinema Studio 3.0, Soul (imagen). Tiene MCP propio y una skill oficial para Claude (4-6-2026) que hace webs con scroll vía MCP + Remotion.
- Presets de cámara de Higgsfield útiles para scroll: 360 Orbit, Lazy Susan, Arc, Dolly In/Out, Super Dolly, Crane, Robo Arm, Through Object, Static. Evitar Handheld, Wiggle, Crash/Rapid/YoYo Zoom, Whip Pan, Snorricam.
- Veo 3.1: 4/6/8 s; `lastFrame` solo con 8 s; Lite 0,05 $/s 720p, Fast 0,10, Standard 0,40.
- Kling 3.0 hasta 15 s; Kling 4.0 3-30 s, 4K, hasta 10 fotogramas clave.
- Luma Ray 3.x: inicial+final, modo loop, hasta 16 fotogramas clave: muy bueno para bucles.
- Medida de learnwithhasan (8 s, 192 frames 1280×720): JPEG q85 11,1 MB; WebP q60 4,0 MB; **H.264 -g 8: 849 KB**, listo en 117 ms vs 585 ms. Pero en iOS con ahorro de batería el `<video>` no funciona → frames o póster.
- Memoria decodificada: 1920×1080 = 8,3 MB/frame; 720×1280 = 3,7 MB. Safari limita memoria de canvas (≈384 MB en iOS 15; iOS 26 [?]). → LRU de ImageBitmap (≈30), no decodificar todo.
- Librerías: ScrollyVideo.js (github.com/dkaoster/scrolly-video, MIT, WebCodecs → playbackRate → currentTime), helper oficial GSAP `imageSequence` (carga todo de golpe), Scrollsequence (WordPress), basementstudio/scrollytelling (React).

## Sin confirmar
Precios exactos de Higgsfield (fuentes: Starter 15 $/200 cr, Plus 29-34 $/1.000-1.200 cr; un usuario: ~72 cr por clip, ~27 $ por web), si sigue ofreciendo Sora 2, specs de DoP/Genjutsu, Pika/Hailuo/WAN 2.6, fecha global de Kling 4.0, flags de rife-ncnn-vulkan, límite de canvas en iOS 26.
Comprobado por nosotros (2026-10-24): ffmpeg 8.1 saca AVIF por frame con `-c:v libaom-av1 -still-picture 1` (lo usa `extraer-frames.mjs`).

## Fuentes
higgsfield.ai/camera-controls · higgsfield.ai/blog/seedance-2-5-on-higgsfield-2026 · pasqualepillitteri.it/en/news/677/higgsfield-ai-video-guide · geo.higgsfield.ai/blog/best-way-create-cinematic-360-degree-orbit-shot-ai · alphasignal.ai/news/higgsfield-ships-a-claude-skill-that-builds-animated-websites-automatically · mavgpt.ai/resources/claude-cinematic-3d-websites-higgsfield-2026 · rumjahn.substack.com/p/i-built-a-10k-cinematic-website-for · komputermechanic.com/tutorials/scroll-animation-website.md · learnwithhasan.com/guide/ai-video-scroll-animation-page/ · scrolltide.co/academy/perfect-loop-ai-video-scroll-frames · the-ai-surfer.remixr.io/resources/scroll-animation-prompt-full-walkthrough · vulk.dev/blog/how-to-build-an-apple-style-scroll-website-with-ai · atlascloud.ai/blog/guides/kling-3.0-turbo-kling-omni · fal.ai/learn/tools/what-is-kling-4-0 · cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1 · help.scenario.com/articles/1727809780-luma-ray-3-2-the-essentials · lumalabs.ai/learning-center/articles/luma-video-models-field-guide · help.runwayml.com/hc/en-us/articles/39789879462419 · promptzone.com/kim/a-practical-prompt-framework-for-better-ai-product-videos-11ih.md · magichour.ai/blog/how-to-make-seamless-ai-video-loops · magichour.ai/blog/how-to-fix-flicker-in-ai-video · github.com/dkaoster/scrolly-video · gsap.com/docs/v3/HelperFunctions/helpers/imageSequenceScrub · pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/ · caniuse.com/mdn-api_videodecoder · github.com/TNTwise/rife-ncnn-vulkan
