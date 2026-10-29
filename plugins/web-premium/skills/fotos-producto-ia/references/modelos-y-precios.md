# Modelos de imagen y precios (consultado 25-10-2026; los precios cambian: confírmalos en la herramienta antes de presupuestar)

## Higgsfield (higgsfield.ai)
- **Planes:**
  - Starter: 19 $/mes, 270 créditos.
  - Plus: 59 $/mes, 1.200 créditos.
  - Ultra: 129 $/mes, 3.000 créditos.
  - Free: sin créditos y con marca de agua.
  - Un crédito sale por ~0,04-0,05 $.
  - Los créditos del plan no se acumulan de un mes a otro.

| Modelo / herramienta | Referencias | Máx. | Coste aprox. | Para |
|---|---|---|---|---|
| Nano Banana Pro | hasta 14 | 4K | ~2 créditos (~0,10 $), ~4 en 4K | producto con texto y logo, el más fiable |
| Nano Banana 2 | hasta 14 | 4K | sin confirmar (Plus/Ultra: 7 días ilimitado a 2K) | lo mismo, más rápido |
| GPT Image 2.5 | hasta 16 | 4K | 1,5 (1K baja) · 5,5 (2K alta) · 26,5 créditos (4K máx.) | texto exacto, composición |
| Seedream 5.0 | hasta 14 (dato de terceros) | 4096² | ~1 crédito | volumen barato, variaciones |
| Soul 2.0 | sin confirmar | — | ~0,12 créditos | estética, escenas (poco fiel al producto) |
| Marketing Studio / Recreate | 1 foto | — | 2-4 créditos por foto | serie hero, lifestyle y modelo desde una foto |
| Layers (Seedream 5.0) | — | 4K | sin confirmar | separar capas, inpaint dibujando, recorte con alfa, reiluminar |

- **API:**
  - En cloud.higgsfield.ai, pago por uso desde un saldo en dólares.
  - Soul 2: ~0,0032 $/imagen. Marketing Studio Image: ~0,0059 $.
  - La tarifa de Nano Banana Pro y GPT Image por API **no está confirmada**.
- **Fidelidad:** Higgsfield no promete fidelidad de logo o texto. Revisa siempre.

## Alternativas (gratis en local, necesitan GPU)
| Modelo | Licencia | Requisitos | Nota |
|---|---|---|---|
| Qwen-Image-Edit-2511 | Apache 2.0 (uso comercial permitido) | 24 GB VRAM; 12 GB con GGUF Q4 | edición por referencia, inpaint crop-and-stitch |
| FLUX.1 Kontext dev | no comercial | 12-24 GB | solo para probar |
| IC-Light v1 | OpenRAIL-M | ~6-8 GB (sin confirmar) | reiluminar un recorte para que case con la escena |
| BiRefNet / rembg | MIT | CPU vale | recorte con alfa (rembg necesita Python) |

## Presupuesto tipo (web con hero por capas + 3 tomas de apoyo + imagen clave de vídeo)
- Tomas finales: hero 16:9, hero 9:16, escena vacía, 3 de apoyo e imagen clave. En total, 7.
- Con margen ×3 por las tiradas: ~21 imágenes × 2 créditos ≈ 42 créditos ≈ **2-3 $** con Nano Banana Pro a 2K.
- Rehacer 2 a 4K: +8 créditos.
- El vídeo va aparte y es mucho más caro: ver `video-ia-para-scroll`.
