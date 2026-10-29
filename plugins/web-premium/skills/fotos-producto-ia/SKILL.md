---
name: fotos-producto-ia
description: Fotos de producto de calidad con IA (Higgsfield con Nano Banana Pro/2, GPT Image, Seedream, Soul, Marketing Studio; también Flux Kontext, Qwen-Image-Edit) partiendo de fotos REALES del producto, para webs premium. Cubre cómo hacer las fotos de referencia con el móvil, encuadres e iluminación de producto, prompts por referencia que conservan forma/logo/texto/color, consistencia entre tomas (mismo producto en varias escenas, imagen clave para vídeo), capas por separado (fondo vacío, producto, flotantes, plato limpio para la sombra) y qué hacer cuando sale deformado (revisión contra la referencia, inpaint por zona, componer el producto real recortado encima). Úsala cuando pidan "fotos de producto con IA", "foto del producto en otra escena", "packshot con Higgsfield", "imagen clave del producto", "que el producto salga igual", "arreglar logo deformado", "AI product photography", "product photo from reference", "keep product consistent".
license: MIT
version: 1.0.0-beta.3
---

# Fotos de producto con IA desde fotos reales

El objetivo no es "una foto bonita": es **el mismo producto del cliente**, idéntico, en la escena y la luz que necesita la web,
y en piezas que se puedan usar por capas o como imagen clave de un vídeo (`video-ia-para-scroll`).
Los modelos de edición por referencia aún fallan: en un estudio de agosto de 2026 (Photoroom, 3.400 imágenes), el 20 %
traía el logo o texto deformado, el 12 % piezas de menos, y el mejor modelo dejaba el producto perfecto solo en ~3 de cada 10.
Por eso el proceso **asume que habrá fallos** y trae la forma de arreglarlos.

> **Dinero:** cada imagen cuesta créditos. Ejemplos en Higgsfield (oct. 2026): Nano Banana Pro ~2 créditos (~0,10 $) por imagen, ~4 en 4K;
> GPT Image 2.5 entre 1,5 y 26,5 créditos según calidad; Seedream ~1. Antes de generar: **nº de imágenes × coste**
> (con margen ×3 por las tiradas fallidas) y **vale de quien paga**. Itera a 1K (barato) y saca la final a 2K/4K.
> Valida antes todo lo que se pueda gratis (composición, capas, sombras y revisión: con las fotos reales y código).

## Reglas de oro
1. **Edición por referencia, nunca texto a imagen.** Siempre con las fotos reales como referencia; con texto solo, sale *otro* producto.
2. **3-6 referencias limpias** mejor que 14 regulares: frontal, ¾, perfil, trasera si importa, cenital y un **detalle del logo/etiqueta**.
3. **Di qué NO cambia**, con palabras concretas: "keep the bottle shape, label layout, logo and exact colours identical to reference 1". El texto de la etiqueta, literal y entre comillas.
4. **Una variable por tirada**: cambia la escena *o* la luz *o* el encuadre, no todo a la vez.
5. **La foto real manda**: cada resultado se compara con la referencia antes de usarlo (paso 6). Si el producto ha cambiado, no vale, por bonita que sea.
6. **Piensa en capas desde el principio** (ver paso 5): fondo vacío primero, producto después, cada elemento flotante aparte.
7. **Misma luz en toda la serie**: fija un preámbulo de luz y estilo y repítelo en cada prompt (como en `video-ia-para-scroll`).

## Proceso
1. **Lista de tomas**: qué imágenes necesita la web y para qué capa o sección, con su proporción. Ejemplos: hero 16:9 con aire a la izquierda para el titular, versión 9:16 para móvil, detalle macro, imagen clave del vídeo. Esa lista es el presupuesto.
2. **Fotos de referencia** (las hace el cliente con el móvil; guía para pasarle en [references/fotos-referencia.md](references/fotos-referencia.md)).
3. **Elige modelo** (tabla en [references/modelos-y-precios.md](references/modelos-y-precios.md)):
   - Producto con texto o logo: Nano Banana Pro o GPT Image en calidad alta.
   - Volumen barato: Seedream o Soul.
   - Serie de marketing desde una sola foto: Marketing Studio.
   - Separar en capas, reiluminar o retocar zonas: Higgsfield Layers.
4. **Prompt**: plantillas por encuadre y luz en [references/prompts-foto.md](references/prompts-foto.md). Estructura: *referencias y su papel* + *escena* + *encuadre y óptica* + *luz* + *qué no cambia* + *fondo y aire para el texto*.
5. **Capas** (si la web las usa: hero con profundidad, levitar, otro fondo):
   1. **Escena vacía** (el plato limpio) primero.
   2. **Producto en esa escena**, editando la imagen vacía con la referencia del producto ("place the product from reference 2…, keep everything else identical"). Ya tienes foto y plato alineados.
   3. **Elementos flotantes** cada uno sobre fondo liso.
   4. Después `parallax-capas` → `capas-sombra.mjs` saca fondo, **sombra como capa propia** y producto (ver su `references/sombras.md`).
6. **Revisión contra la referencia** (gratis, antes de dar nada por bueno):
   - **Superposición al 50 %** para las proporciones (bordes dobles = forma distinta) y **lado a lado con zoom** para texto y color. Comandos en `fallos-y-arreglos.md`.
   - Probado: un modelo de visión cazó el color y el texto, pero no un producto un 6 % más ancho; la superposición sí lo vio.
   - Revisa: forma y proporciones, piezas, texto y logo (¿en espejo?, ¿inventado?), color del material, patrones, reflejos.
   - Puede revisarla el propio Claude (abrir la imagen) o un modelo de visión con el prompt de control de [references/fallos-y-arreglos.md](references/fallos-y-arreglos.md).
   - Veredicto: APTA, RETOCAR (qué zonas) o REGENERAR.
7. **Arreglar** según el fallo (tabla en `fallos-y-arreglos.md`):
   - Inpaint solo de la zona mal.
   - Corrección de color.
   - Si el producto no sale fiel tras 2-3 tiradas: **componer el producto real recortado encima de la escena generada**. Sus píxeles no cambian nunca: es la vía segura para logos y texto.
8. **Exportar**: al tamaño de uso ×2 como máximo, WebP/AVIF. Apunta en `CREDITOS.md` o el brief el origen (foto del cliente + modelo usado).

## Checklist
- [ ] Presupuesto aprobado antes de la primera imagen de pago (nº de imágenes × coste × 3).
- [ ] Referencias: 3-6, nítidas, luz uniforme, logo legible, sin otros objetos.
- [ ] Cada imagen final revisada contra la referencia (forma, logo/texto, color): veredicto APTA.
- [ ] Misma luz, temperatura de color y óptica en toda la serie (se nota en el scroll si una toma "salta").
- [ ] Aire para el titular donde va el texto; versión vertical para móvil si el hero lo necesita.
- [ ] Si va por capas: plato limpio (escena vacía) alineado con la foto del producto.
- [ ] Derechos: producto y fotos del cliente; sin marcas ni personas reales ajenas.

## Referencias
- [references/fotos-referencia.md](references/fotos-referencia.md): cómo hacer (o pedir al cliente) las fotos reales con el móvil.
- [references/prompts-foto.md](references/prompts-foto.md): preámbulo de luz, plantillas por encuadre (hero ¾, packshot, cenital, macro, en uso, contraluz, flotante, escena vacía) y negativos.
- [references/fallos-y-arreglos.md](references/fallos-y-arreglos.md): deformaciones típicas, cómo detectarlas (prompt de control) y cómo corregirlas.
- [references/modelos-y-precios.md](references/modelos-y-precios.md): modelos de imagen de Higgsfield y alternativas locales, referencias que admiten, precios con fecha.
