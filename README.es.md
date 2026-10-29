# webs-premium · marketplace de Claude Code

**v1.0.0-beta.3** · [Read in English](README.md)

Skills para construir webs que parecen imposibles: scroll cinematográfico, vídeo convertido en frames, el producto contado por dentro con imagen realista, profundidad por capas (con la sombra como capa propia), 3D real, lata que gira sin 3D, lente de rayos X bajo el cursor, fotos de producto con IA y mapa real que baja hasta el edificio. Se organizan **por técnicas que se combinan**, no por estilos.

## Instalar
Requisitos:
- Claude Code reciente, con `/plugin`.
- Para los scripts: Node 20+ y ffmpeg en el PATH (o su ruta en las variables `FFMPEG` / `FFPROBE`).
- Para las webs que salen: npm.

**Desde GitHub:**
```
/plugin marketplace add FefeRP/webs-premium
/plugin install web-premium@webs-premium
```

**Desde una copia local:**
```
git clone https://github.com/FefeRP/webs-premium.git
/plugin marketplace add ./webs-premium
/plugin install web-premium@webs-premium
```

Reinicia Claude Code (o `/reload-plugins`) y comprueba con `/plugin` que `web-premium` está activo.

- **Actualizar:** `/plugin marketplace update webs-premium`.
- **Probar sin instalar:** `claude --plugin-dir plugins/web-premium`.

## Usar
Escribe **WEB PREMIUM: …** (o `/web-premium …`) con el negocio, el producto y los activos que tienes. La skill maestra:
1. Hace el brief.
2. Elige el momento estrella y las técnicas.
3. Planifica los activos con su coste.
4. Monta la web con la plantilla (Vite + GSAP + Lenis).
5. La verifica con capturas en escritorio, móvil y modo de movimiento reducido.

Ejemplo: `WEB PREMIUM: landing para un reloj de edición limitada; tengo 4 fotos del producto y el logo; quiero que gire al hacer scroll`.

> Las skills nunca gastan en servicios de pago (Higgsfield, APIs de vídeo o imagen) sin dar antes un presupuesto y esperar tu sí.

## Skills
| Skill | Para qué |
|---|---|
| `web-premium` | Maestra: dirige todo el proceso; plantilla Vite + GSAP + Lenis; `nueva-web.mjs` y `verificar-scroll.mjs` |
| `scroll-frames` | Vídeo → frames WebP/AVIF (escritorio y móvil) → canvas ligado al scroll; modo vídeo alternativo |
| `video-ia-para-scroll` | Cómo pedir el vídeo a Higgsfield, Kling, Veo, Luma… (cámara, fondo, bucle, consistencia, prompts) y revisarlo automáticamente; receta "producto por dentro" en tramos encadenados con presupuesto |
| `fotos-producto-ia` | Fotos del producto real en otras escenas con IA: referencias, prompts por encuadre y luz, consistencia entre tomas, capas, detección y arreglo de deformaciones, precios |
| `parallax-capas` | Profundidad 2.5D: capas con scroll y puntero, CSS scroll-driven; `capas-sombra.mjs` saca la sombra como capa semitransparente (producto que levita, cambio de fondo) |
| `escena-3d-gltf` | three.js con glTF optimizado (meshopt), entorno PBR, arrastre y scroll, rendimiento móvil, cancelación de carga |
| `lente-revelado` | Lente que sigue al cursor (o al dedo) y enseña otra versión alineada: rayos X, térmica, interior; interruptor de modos; cortina antes/después con el scroll; `variantes-revelado.mjs` saca rayos X y térmica de una foto con ffmpeg y comprueba la alineación |
| `envase-giratorio` | Lata, bote o tarro que gira sin 3D: etiqueta plana enrollada en canvas con sombreado y tapa; giro con scroll, arrastre o slider de sabores (fondo, título y frutas que cambian a la vez) |
| `mapa-zoom-ubicacion` | Del mapa al edificio: MapLibre con ortofoto real (PNOA en España, gratis) y edificios 3D de OSM; cámara por paradas ligada al scroll, edificio resaltado, relevo a la foto; fuentes de mapa con licencias y precios |

## Qué hay en el repo
- `.claude-plugin/marketplace.json` → `plugins/web-premium/` (el plugin: `plugin.json`, `commands/`, `skills/`).
- `demos/reloj/`: web de demostración hecha con la skill maestra. Para verla: `cd demos/reloj && npm install && npm run dev` y abrir http://127.0.0.1:5190.
- `demos/mapa/`: del mapa al edificio (Barcelona, ubicación de ejemplo). `cd demos/mapa && npm install && npm run dev` (necesita internet: las teselas se piden en directo).
- `docs/referencias/`: análisis escritos de 11 webs y vídeos de referencia. Los vídeos no se incluyen porque son de sus autores.
- `docs/investigacion/`: ecosistema, marketplaces y vídeo IA.
- `pruebas/`: validación de los scripts con resultado conocido. `pruebas/lente-envase/` es la página de prueba de la lata, el HUD y la lente (se sirve tal cual, sin build).
- `capturas/`: hojas de capturas de la verificación.

## Estado de la beta
**Probado:**
- Validación estricta del marketplace y del plugin.
- Instalación desde cero.
- Demos (reloj y mapa) verificadas sin errores en escritorio, móvil y movimiento reducido (Chrome con WebGL por software).
- `capas-sombra` medido contra una verdad renderizada.
- Motores probados en Chrome: cancelación de carga y reintento de frames; lata que gira, lente y cortina con prueba de interacción (cursor, clic, dedo).

**Sin probar:**
- Generación real con Higgsfield (de pago).
- rembg, IC-Light y modelos de edición locales (necesitan Python o GPU).
- Mapa: relevo a foto real del edificio (la demo no tiene foto propia; el patrón está documentado) y fuentes de pago (MapTiler, Esri…).

Cambios: ver [CHANGELOG.md](CHANGELOG.md).

## Licencia y créditos
Código y textos: [MIT](LICENSE). Material de terceros (modelo 3D CC-BY de la demo, datos de mapa de OSM/OpenFreeMap/IGN, ideas adaptadas de `nateherkai/scroll-craft`): ver [CREDITOS.md](CREDITOS.md).
