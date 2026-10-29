# Plantillas de prompt para vídeo de scroll

Los prompts van en inglés (los modelos responden mejor). Estructura fija:

```
[PREÁMBULO DE ESTILO — idéntico en todas las tomas del proyecto]

[MOVIMIENTO: qué hace la cámara y qué hace el objeto, de principio a fin]
[ESTABILIDAD: qué NO cambia]
Negative: [lista de negativos]
```
Pega el preámbulo **literal** en cada toma del mismo proyecto (consistencia entre clips). Con imagen a vídeo, no describas
el aspecto del producto: ya está en la imagen. Describe el movimiento.

## Preámbulos de estilo (elige uno por proyecto y no lo toques)
- **Estudio oscuro cálido (lujo, relojería, perfume, licor):**
  `Premium product film, seamless warm charcoal studio background (#171412), soft large softbox key light from upper left, subtle cool rim light from behind right, gentle contact shadow, shallow depth of field, photoreal, 24 fps, clean and calm.`
- **Estudio claro (tecnología, cosmética, auriculares):**
  `Premium product film, seamless light warm-grey studio background, soft diffused key light from upper left, gentle fill from the right, soft contact shadow beneath, razor sharp focus, neutral colour, photoreal, 24 fps.`
- **Color de marca (helados, bebidas, snacks):**
  `Premium product film on a seamless solid [pastel pink #F4C6D0] background, soft even top light, tiny soft shadow, vivid but natural colours, photoreal food photography, 24 fps.`
- **Natural (café, panadería, artesanía):**
  `Premium editorial film, warm morning window light from the left, seamless soft beige background, natural textures, gentle shadows, photoreal, 24 fps.`

## Negativos base (siempre)
`Negative: cuts, scene change, camera shake, handheld, jitter, wobble, sudden zoom, speed ramp, warping, morphing, melting edges, shape change, colour shift, logo distortion, garbled text, new text, watermark, flicker, extra objects, hands.`

## 1. Giro / arco alrededor del producto (el más seguro)
Imagen clave: producto centrado, ¾, con aire a los lados.
```
The camera performs one slow, steady arc of about 160 degrees around the product, moving at constant speed from the very first frame to the very last, ending slightly closer than it starts (gentle dolly in). The product stays perfectly still and centred. Every part keeps its exact shape, colour, material and logo. Lighting stays constant.
```
Higgsfield preset: **Arc Left/Right** o **360 Orbit** (para 360° completo); **Lazy Susan** si prefieres que gire el producto y la cámara quieta.

## 2. Producto que gira sobre sí mismo (cámara fija)
```
Static locked-off camera. The product rotates smoothly on a hidden turntable, exactly one full rotation at constant angular speed, starting immediately and never pausing. Every part keeps its exact shape, colour and material. Background and lighting never change.
```
Para bucle: misma imagen inicial y final (giro de 360° exacto).

## 3. Dolly de revelado (de detalle a producto entero o al revés)
```
The camera starts in an extreme close-up on the [crown / texture / label area] and pulls back in one slow, continuous, constant-speed dolly out until the whole product is visible, centred, with generous empty space on the left for text. No other movement.
```
Preset: **Dolly Out** (o **Dolly In** al revés). Evita **Crash/Rapid Zoom**.

## 4. Despiece (exploded view)
Imagen clave: producto montado, ocupando ~80 % del alto. Nombra cada pieza.
```
The disassembly begins in the very first frame and continues without pause until the final frame. The [product] separates into a clean exploded view: the [part A] lifts straight up, the [part B] slides forward, the [internal part C] floats free, the [part D] drops down. Each component drifts slowly along its own axis and stays suspended, fully separated and evenly spaced by the last frame. The camera holds a slow steady orbit of about 30 degrees. Every component keeps its exact shape, colour and material.
```
Con fotograma final: imagen 2 = despiece ya generado (como imagen). Pide "slow and subtle transitions".
**Montaje**: invierte el despiece (`-vf reverse`).

## 5. Ingredientes flotando / orbitando (alimentación, cosmética)
```
Static camera. The [ice cream cone] stays centred and still. Around it, [three raspberries, two mint leaves and chocolate shavings] drift slowly in mid-air, each along its own gentle path at constant speed, slightly rotating, never touching the product, never leaving the frame. Soft focus on the ingredients closest to camera. No new objects appear.
```
Para parallax real (no vídeo) usa mejor `parallax-capas` con cada ingrediente en su capa: pesa menos y es interactivo.

## 6. Caída / líquido / salpicadura (un evento)
```
Static camera. [Coffee beans] fall from the top of frame into the [grinder] in a single continuous slow-motion stream at constant speed, from the first frame to the last. The [grinder] stays perfectly still. Photoreal slow motion, no splashes leaving the frame, no new objects.
```
Los fluidos son donde la IA brilla y el 3D en tiempo real sufre: buen candidato para frames.

## 7. Vuelo a través (through object / world flight)
```
One continuous FPV-smooth camera move forward at constant speed: the camera glides through the [arch of the building / open box lid] and continues into the [interior], never cutting, never turning sharply. Stable horizon, consistent lighting.
```
Preset: **Through Object In**, **Super Dolly In** o **FPV Drone** (solo si es suave). Mejor 2-3 clips encadenados que uno largo.

## 8. Transición entre escenas (encadenado)
Clip A termina en la imagen clave B (fotograma final = imagen B); clip B empieza en ella.
```
Seamless continuous transformation from the first image to the last image: the camera keeps one slow forward movement while the [scene A element] gradually becomes the [scene B element]. No cuts, no fades, constant speed.
```
Comprueba la costura con `revisar-video.mjs` sobre el vídeo concatenado (no debe haber pico en la unión).

## 9. Bucle de fondo para hero (no scroll, autoplay)
```
Subtle ambient motion only: [steam rising slowly from the cup / fabric moving gently in a breeze]. Static camera. The first and last frames are identical so the clip loops seamlessly.
```
Imagen inicial = imagen final. Luma (modo loop) o Kling con inicial+final.

## Plantilla de pedido para dejar por escrito (para el cliente o para el registro del proyecto)
```
Proyecto: …  Sección: hero / sección 2…
Coreografía (0→100 % del scroll): …
Textos y dónde: …   Lado libre para texto: izquierda/derecha
Imagen clave: ruta/archivo (aprobada el …)   Fotograma final: sí/no
Modelo: …   Preset de cámara: …   Duración: … s   Resolución: 1080p   Aspecto: 16:9 (+ 9:16 aparte / recorte)
Prompt: …
Tiradas: N   Coste estimado: …   Vale de: …
Resultado elegido: archivo, informe de revisar-video (apto, variación, cortes)
```
