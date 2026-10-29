# Marketplaces de este estilo ya publicados (estudio 2026-10-24)

Estudiados: `nateherk` (scroll-craft), `gsap-skills` y `webgl-animation-skills`. Los tres MIT.

## Formato (copiado de nateherk y del oficial)
- `.claude-plugin/marketplace.json`: `name`, `owner{name,url|email}`, `plugins[]` con `name`, `source` ("./plugins/x"), `description`, opc. `version`, `author`, `license`, `category`, `homepage`. `$schema` opcional.
- `plugins/<p>/.claude-plugin/plugin.json`: solo `name` es obligatorio; habitual `description`, `version`, `author`, `license`, `keywords`.
- `skills/<skill>/SKILL.md` con frontmatter `name` + `description` (larga, con frases-disparador entre comillas); extras usados: `allowed-tools`, `license`, `version`. Carpetas `references/` (se cargan bajo demanda, enlazadas desde SKILL.md) y `scripts/`.
- `commands/*.md` (frontmatter `description`, `argument-hint`, `allowed-tools`), `agents/*.md`, `hooks/hooks.json`: los usa el oficial (plugin-dev, hookify); los otros tres no.

## nateherkai/scroll-craft (v0.3.1)
Skill única muy opinada: entrevista → BRIEF.md → curva de sensaciones → 8 "gramáticas" de página → "signature move" → "fingerprint gate" (cada web distinta en ≥4 de 6 dimensiones) → assets con kie.ai (seedream + kling) → HTML sobre su motor propio (`engine/scrollcraft.js`, ~1300 líneas, sin GSAP ni three) → verificación con Playwright (`shoot.mjs`: 6 posiciones por acto, "dead scroll", contraste sobre el frame más claro, `sheet.png`).
- Scrub con `<video>` + `currentTime`, no frames. `encode.sh`: `-c:v libx264 -crf 20 -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart` (móvil 720p, `-g 4`, crf 24). Vídeo cargado como blob (no depende de HTTP Range); lerp 0,18 hacia el objetivo; zona muerta; no lanza seek si `seeking`; reintento a 700 ms; iOS: `play()`+`pause()` para cebar el decodificador; póster = primer frame y se quita tras `seeked`.
- Modo canvas existe (`data-sc-sequence`) pero sin documentar ni pipeline.
- Hero por capas (`hero-depth.md`): fondo / sujeto / primer plano / atmósfera, "clean plate", alfa real, "contact anchors", texto entre planos, composición propia para móvil, 3 capas bastan.
- Prompts: "style preamble" literal + escena; un solo movimiento de cámara continuo, lento; negativos fijos "blur, distortion, low quality, warping, morphing, jitter, flicker, text, watermark, cut, scene change"; el objeto real como `--ref`.
- `CHANGELOG.md` (622 líneas) con lo que falló en cada build: muy valioso.

## greensock/gsap-skills (oficial, v1.0.0)
gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-plugins, gsap-utils, gsap-react, gsap-frameworks, gsap-performance. Buena referencia de API, genérica: sin canvas/frames, vídeo ni 3D.

## iart-ai/webgl-animation-skills (v0.1.0)
threejs-animation (escena, cámara con scroll, AnimationMixer, InstancedMesh, R3F, bloom/DOF, `resource-disposal.md` bueno), shader-glsl (noise, SDF, transiciones), particle-system. Nivel medio; reduced-motion de pasada; nada de optimización de assets.

## Huecos que cubre nuestro marketplace
Pipeline de frames completo; criterio vídeo vs frames; guía de prompts Higgsfield/Kling/Veo/Luma; optimización glTF (gltf-transform, Meshopt/Draco, KTX2); 3D + ScrollTrigger unidos; rendimiento móvil y accesibilidad transversales; skill maestra que elige y combina; comandos y agente verificador; español.

## Cómo convivimos
Los tres siguen instalados: nuestra maestra puede remitir a `gsap-skills:gsap-scrolltrigger` (API) y `webgl-animation-skills:*` (shaders/partículas). Adaptamos con atribución (MIT) las ideas de scroll-craft: GOP denso, primado iOS, preámbulo de estilo, reglas de prompt, checklist de capas y verificación por posiciones.
