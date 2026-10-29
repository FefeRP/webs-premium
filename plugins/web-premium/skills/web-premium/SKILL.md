---
name: web-premium
description: Skill maestra para construir webs "premium" (tipo Awwwards) - palabra clave de activación "WEB PREMIUM" o /web-premium. Entiende el pedido, decide el momento estrella y elige y combina técnicas (scroll-scrubbing de vídeo en frames, parallax y profundidad por capas, 3D real con glTF, mapa que baja hasta el edificio, lente de rayos X bajo el cursor, lata que gira sin 3D, tipografía cinética, shaders, transiciones), planifica los activos (y su coste), monta la web con la plantilla base (Vite + GSAP + Lenis) y la verifica con capturas. Úsala SIEMPRE que el pedido diga "WEB PREMIUM", "web premium", "web de las que parecen imposibles", "web con 3D y scroll", "web tipo Apple/Awwwards", "web cinematográfica", "landing con efectos", "premium website", "awwwards style site", "cinematic scroll website", "3D scrolling website".
license: MIT
version: 1.0.0-beta.3
---

# WEB PREMIUM: de un pedido a una web que parece imposible

Esta skill **dirige**: decide qué hacer y en qué orden, y delega el *cómo* en las skills de técnica de este plugin:
- `scroll-frames` — vídeo partido en frames que avanza con el scroll (o vídeo con currentTime).
- `video-ia-para-scroll` — cómo pedir ese vídeo a Higgsfield/Kling/Veo/Luma y revisarlo.
- `parallax-capas` — profundidad sin 3D (capas, puntero, CSS scroll-driven).
- `escena-3d-gltf` — 3D real con three.js y modelos glTF optimizados.
- `fotos-producto-ia` — fotos del producto real en otra escena o luz con IA (Higgsfield…), consistentes entre tomas, por capas y sin deformaciones.
- `mapa-zoom-ubicacion` — mapa real (ortofoto + edificios 3D, MapLibre) que baja con el scroll desde la ciudad hasta el edificio.
- `lente-revelado` — lente que sigue al cursor y enseña el producto por dentro (rayos X, térmica, interior) y cortina antes/después con el scroll.
- `envase-giratorio` — lata, bote o tarro que gira sin 3D (etiqueta plana enrollada en canvas) y slider de sabores o variantes.
Si están instaladas, apóyate también en `gsap-skills:*` (API de GSAP) y `webgl-animation-skills:*` (shaders, partículas).

**Nunca por estilos** ("plantilla de heladería"): por técnicas que se combinan según el producto, la historia y el presupuesto.

## Paso 1 · Entender el pedido (brief)
Saca del pedido (y pregunta **solo** lo que falte y cambie la decisión, en una tanda):
1. **Negocio y protagonista**: qué se vende y cuál es *el objeto* o la idea estrella.
2. **Objetivo**: la acción que debe hacer el visitante (comprar, reservar, contactar) → el CTA.
3. **Activos disponibles**: fotos, vídeo, modelo 3D, logo, textos. Si no hay: ¿se pueden generar con IA? (cuesta dinero → presupuesto y vale).
4. **Destino técnico**: HTML estático (Vite, por defecto) o React/Next u otro CMS.
5. **Público y dispositivos**: si es sobre todo móvil (comercio local: casi siempre), manda el móvil.
6. **Marca**: colores, tipografía, tono. Si no hay, propón una dirección sobria (un neutro cálido + un acento).
Escribe el brief en `BRIEF.md` del proyecto (10-15 líneas).

## Paso 2 · Dirección: un solo momento estrella
Lee [references/direccion.md](references/direccion.md). Decide:
- **El momento estrella** (uno): la escena que la gente recordará (el producto que se despieza al bajar, la cámara que entra en la tienda, el helado rodeado de ingredientes flotando).
- **El recorrido** en 4-7 secciones: entrada (hero) → momento estrella → 2-3 secciones de apoyo (detalle, prueba, oferta) → cierre con CTA.
- **Contención**: el resto de secciones, sobrias (tipografía, reveals suaves). Si todo se mueve, nada impresiona.

## Paso 3 · Elegir técnicas
Usa la matriz de [references/catalogo-tecnicas.md](references/catalogo-tecnicas.md). Regla rápida:
| Quiero… | Técnica | Skill |
|---|---|---|
| Que el producto gire / se abra / se transforme al hacer scroll, sin interacción | Vídeo → frames | `video-ia-para-scroll` + `scroll-frames` |
| Profundidad, "3D" barato, ingredientes o elementos flotando | Capas + parallax | `parallax-capas` |
| Que el visitante gire/configure el objeto, o 3D en varias secciones | 3D real glTF | `escena-3d-gltf` |
| Fluidos, humo, comida, tela, paisajes | Vídeo (IA) → frames; nunca 3D en tiempo real | `scroll-frames` |
| El producto "levita" sobre su sombra, o cambia de fondo sin perder la sombra | Capas con la sombra como capa propia | `parallax-capas` (sombras.md) |
| Fotos del producto real en escenas que no existen | Edición por referencia con IA + revisión | `fotos-producto-ia` |
| Enseñar dónde está (inmobiliaria, hotel, tienda): de la ciudad al edificio | Mapa real con cámara ligada al scroll + relevo a la foto | `mapa-zoom-ubicacion` |
| Contar el producto por dentro con imagen realista (se parte, capas, entrar dentro, horneado) | Tramos de vídeo IA encadenados → frames + HUD de datos | `video-ia-para-scroll` (receta "por dentro") + `scroll-frames` |
| Que el visitante "mire dentro" con el cursor (rayos X, térmica) o compare antes/después | Dos imágenes alineadas + máscara | `lente-revelado` |
| Bebidas o envases cilíndricos con varios sabores: la lata gira al cambiar | Etiqueta plana enrollada en canvas + slider | `envase-giratorio` (+ `parallax-capas` para las frutas) |
| Textos con presencia | Reveals por líneas, máscaras, texto entre capas | catálogo (F) + `gsap-skills` |
| Partículas que forman figuras, distorsiones, portales | Shaders/GPGPU (fase avanzada) | catálogo (E) + `webgl-animation-skills` |
Combina 1 técnica fuerte + 1-2 de apoyo. Anota la decisión y el porqué en `BRIEF.md`.

## Paso 4 · Plan de activos (y su coste)
Lista cada activo: qué es, de dónde sale (cliente / libre / IA / código), formato y peso objetivo.
- Vídeo con IA: sigue `video-ia-para-scroll` (imagen clave primero, prompts por plantilla, presupuesto). **No generes nada de pago sin el vale de quien paga, con el precio estimado delante.**
- Modelos 3D: `escena-3d-gltf` (licencia, limpieza, optimización).
- Fotos de producto con IA (hero, imagen clave del vídeo, escenas): `fotos-producto-ia` (desde fotos reales, revisión contra la referencia, presupuesto).
- Capas: `parallax-capas` (por separado, recorte, clean plate, o código). La sombra, como capa propia con `capas-sombra.mjs`.
- Sin presupuesto: activos libres (Poly Haven, Khronos, fotos del cliente) o hechos con código (SVG, degradados, render con three.js).

## Paso 5 · Construir
```bash
node scripts/nueva-web.mjs <carpeta> --con frames,capas,3d,mapa,lente,envase --titulo "…" --marca "…" --fondo "#…" --texto "#…" --acento "#…"
cd <carpeta> && npm install [three] [maplibre-gl] && npm i -D playwright-core && npm run dev
```
La plantilla trae Lenis + GSAP ScrollTrigger en un único bucle, reduced-motion, tokens de diseño, enlace "saltar al contenido".
Cada técnica en su fichero `src/secciones/<seccion>.js`, con la maqueta y el código de las references de su skill.
**Orden**: primero todo el HTML y el texto real (la página debe tener sentido sin JS) → estilos y móvil → técnicas una a una, comprobando cada una.

## Paso 6 · Verificar (antes de enseñar nada)
1. `node scripts/verificar-scroll.mjs http://127.0.0.1:5173 capturas/` → capturas en 8 posiciones (escritorio y móvil) + pasada con reduced-motion + errores de consola + peticiones fallidas + hojas de contactos. Debe salir sin errores.
2. Mira las hojas: sin huecos en blanco, textos legibles sobre el fondo en todas las posiciones, el momento estrella se ve en móvil.
3. Revisión visual con un modelo de visión (p. ej. Gemini) de las hojas o de una grabación del scroll.
4. `npm run build` sin errores; peso total dentro del presupuesto ([references/base-tecnica.md](references/base-tecnica.md)).
5. Repasa la checklist final de base-tecnica.

## Paso 7 · Entregar
Resumen corto: técnicas usadas y por qué, activos (origen y licencia), pesos, qué se ha comprobado (capturas), qué queda (activos definitivos, textos del cliente, dominio).

## Referencias
- [references/catalogo-tecnicas.md](references/catalogo-tecnicas.md): catálogo de efectos y técnicas (qué es, cómo se hace, coste, skill), organizado por técnica.
- [references/direccion.md](references/direccion.md): recorrido, momento estrella, contención, tipografía, lo que da "aspecto de IA" y cómo evitarlo.
- [references/base-tecnica.md](references/base-tecnica.md): presupuestos globales, rendimiento, accesibilidad, SEO y checklist final.
