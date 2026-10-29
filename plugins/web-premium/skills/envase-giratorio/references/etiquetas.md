# La etiqueta plana

## Medidas
- **Proporción** = perímetro / alto del cuerpo impreso. Lata 330 ml "sleek": Ø 58 mm, cuerpo ~100 mm → 182/100 ≈ **1,8:1**.
  Lata 330 ml estándar: Ø 66 mm, cuerpo ~92 mm → ≈ **2,25:1**. Lata 500 ml alta: ≈ **1,6:1**.
  El motor estira la etiqueta al alto del cuerpo, y la vuelta entera es su ancho: la proporción buena es la de **la forma que
  pintas** (`lata.proporcionEtiqueta`; con la forma por defecto, que es una lata alta, ≈ 1,5:1). Ajusta `forma.ancho` a tu lata
  real o diseña la etiqueta a esa proporción. Una etiqueta 3:1 en la forma por defecto sale con las letras estrechas.
- **Resolución:** 1200-2000 px de ancho. Por encima no se nota: de frente se ve media vuelta en ~300-500 px de pantalla.
- **Zonas:**
  - El primer 0-50 % del ancho es lo que se ve de frente con `girar(0)` (centrado en el 25 %): ahí van logo y nombre.
  - El 50-100 % es la espalda: ingredientes, código de barras, legal.

## De dónde sale
1. **Arte de imprenta del cliente** (PDF o AI): exportar el plano de la etiqueta, quitar marcas de corte y sangrado. Lo mejor: es real.
2. **Diseño propio** en SVG o Figma: patrones que se repiten en un múltiplo del ancho (así casa la costura).
3. **IA** (Higgsfield):
   - **Modelo:** Nano Banana Pro o GPT Image 2.5 si hay texto, porque escriben mejor.
   - **Prompt:**
     ```
     Flat unwrapped beverage can label artwork, full 360° wrap as a single horizontal strip, aspect ratio 2:1,
     front panel on the left half with the brand name "[MARCA]" and flavour "[SABOR]", back panel on the right half with
     small ingredient text and a barcode, [estilo: bold cartoon monsters / minimal / botanical], [paleta],
     seamless: the left and right edges continue each other. Flat print file, no can, no perspective, no shadows, no mockup.
     ```
   - **Revisión:**
     - Que no salga una lata en perspectiva (pasa a menudo: insiste en "flat print file").
     - Que el texto esté bien escrito.
     - **La costura:** `ffmpeg -i e.png -filter_complex "[0]crop=iw/2:ih:iw/2:0[d];[0]crop=iw/2:ih:0:0[i];[d][i]hstack" costura.png` deja el borde en el centro para verlo.
     - Si no casa, arreglar con inpaint en el centro de esa imagen y recortar de vuelta.
   - **Coste orientativo** (oct-2026, a confirmar): 3 tiradas × ~2 créditos por sabor ≈ 6 créditos ≈ **0,30 $ por sabor**.
     Las frutas e ingredientes recortados, ~2 créditos cada uno (ver `fotos-producto-ia`).
   - **Marca del cliente:** si existe la lata real, mejor su arte. Una etiqueta inventada por IA para un producto real es publicidad engañosa.

## Otros envases
- **Tarro o vela:** `forma: { ancho: 0.7, tapa: 0.12, cuello: 0.02, base: 0.03 }`, `metal` en dorado (`['#fff3c4','#c9a24a','#7a5a1c']`) o negro mate.
- **Botella de cuerpo recto:** gira el cuerpo con el motor y pon encima el cuello como imagen PNG fija (no gira de forma visible).
