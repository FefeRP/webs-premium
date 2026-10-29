# Prompts de foto de producto (edición por referencia)

En inglés, que es como mejor responden los modelos. Las partes entre `[ ]` se rellenan.

## Estructura
```
[REFERENCIAS Y SU PAPEL] Reference 1 is the exact product: [descripción breve: material, forma]. Reference 2 is a close-up of its label.
[ESCENA] [dónde está].
[ENCUADRE] [plano + óptica + altura de cámara].
[LUZ] [preámbulo de luz fijo de la serie].
[QUÉ NO CAMBIA] Keep the product's shape, proportions, label layout, logo and exact colours identical to reference 1.
The label reads exactly "[TEXTO LITERAL]". Do not add, remove or change any part of the product.
[COMPOSICIÓN] Product occupies [70-80] % of the frame height, [centred / right third], with empty space on the [left] for a headline.
[NEGATIVOS] No extra objects, no text other than the label, no hands, no props touching the product.
```

## Preámbulos de luz (elige uno por serie y repítelo igual)
- **Estudio suave** (cosmética, tecnología): `three-point softbox lighting, soft diffused key light from upper left, gentle fill, clean subtle reflections, neutral colour temperature 5000K.`
- **Dramático** (relojes, perfume, bebida premium): `chiaroscuro lighting, single hard key light from the left, deep soft shadows, crisp rim light outlining the silhouette, dark seamless backdrop.`
- **Natural cálido** (comida, artesanía): `natural window light from the left, warm late-afternoon tone, soft long shadows, slight haze.`
- **Contraluz** (líquidos, cristal): `strong backlight behind the product, glowing translucent liquid, rim light, dark background, subtle lens bloom.`

## Plantillas por encuadre
| Toma | Encuadre (añadir a la estructura) | Para qué |
|---|---|---|
| Hero ¾ | `three-quarter view, eye level, 85mm lens, shallow depth of field f/4` | hero, imagen clave de vídeo |
| Packshot | `straight-on front view, centred, seamless [color] background, 100mm lens, everything in focus` | ficha, recorte, capas |
| Cenital | `top-down flat lay, camera directly above, even light` | comida, kits, cosmética abierta |
| Macro | `macro lens, extreme close-up of the [logo / texture / cap], f/2.8, shallow depth of field` | sección de detalle |
| En uso / lifestyle | `on a [surface] in a [place], natural context, product sharp, background softly blurred` | apoyo, redes |
| Flotante | `product floating in mid-air, slightly tilted, soft shadow on the ground below` | levitar, hero dinámico |
| Elemento flotante (capa) | `[2-3 raspberries / leaves / ice cubes] isolated on a seamless pure [color] background, no other objects` | capas de primer plano |
| **Escena vacía (plato)** | `the same scene without any product, empty [surface], identical lighting and camera` | plato limpio para la sombra |
| **Producto en la escena vacía** | (editando la imagen vacía) `place the product from reference 2 on the [surface] exactly at the centre, keep everything else in the image identical` | foto + plato alineados |

## Consistencia en una serie
- Mismo preámbulo de luz, misma óptica y altura de cámara, mismo color de fondo en todas.
- Usa la **primera imagen aprobada como referencia adicional** de las siguientes ("same lighting and colour grading as reference 3").
- Para vídeo: la imagen clave aprobada es la que se anima (y, si el modelo lo admite, la final se genera desde ella).
- Proporción: 16:9 o 21:9 para el hero de escritorio; 9:16 o 4:5 para móvil, **generada aparte** con las mismas referencias (no recortada si el producto queda pequeño).

## Negativos útiles
`no extra objects, no duplicate products, no text, no watermark, no distorted label, no warped logo, no hands, no reflections of the photographer, no colour cast`
(Los negativos ayudan poco con los logos: la defensa real es la revisión y la composición del producto real.)
