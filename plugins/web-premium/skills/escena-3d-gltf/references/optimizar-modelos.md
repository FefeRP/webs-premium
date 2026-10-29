# Optimizar modelos glTF

## Herramienta: glTF-Transform (MIT, v4.5)
`npx @gltf-transform/cli <comando>`; también como librería (`@gltf-transform/core`, `/functions`, `/extensions`).

| Comando | Para qué |
|---|---|
| `inspect m.glb` | Resumen: escenas, mallas, vértices, materiales, texturas, extensiones |
| `optimize in out --compress meshopt --texture-compress webp --texture-size 2048` | Todo en uno: dedup, prune, weld, simplify suave, compresión de geometría y texturas |
| `meshopt` / `draco` | Solo compresión de geometría |
| `webp` / `avif` / `resize --width 1024` | Solo texturas |
| `uastc` / `etc1s` | Texturas KTX2 (Basis): menos memoria de GPU. Necesita `toktx` (KTX-Software) instalado |
| `simplify --ratio 0.5 --error 0.001` | Reducir polígonos (revisa el resultado) |

## Meshopt o Draco
- **Meshopt** (por defecto): decodifica más rápido, comprime también animaciones y morphs. three lo trae (`three/addons/libs/meshopt_decoder.module.js`), no hay que servir nada.
- **Draco**: algo más pequeño en mallas estáticas muy densas, decodificador WASM aparte (copiar `three/examples/jsm/libs/draco/gltf/` a `/draco/` y pasar `rutaDraco`).

## Texturas
- WebP: menos peso de descarga; en GPU ocupan lo mismo que sin comprimir (ancho × alto × 4).
- KTX2 (ETC1S para color, UASTC para normales): se quedan comprimidas también en GPU → mucha menos memoria (clave en móvil con muchas texturas). Requiere `toktx` y servir el transcoder (`three/examples/jsm/libs/basis/` → `rutaBasis`).
- 2048 escritorio / 1024 móvil. 4096 casi nunca compensa.

## Limpiar nodos que sobran
Los modelos de muestra o de Sketchfab traen suelos, placas, cámaras, luces. Quítalos antes de optimizar (si no, el centrado y la escala salen mal):
```js
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read('in.glb');
for (const n of doc.getRoot().listNodes()) if (['Backplate Khronos'].includes(n.getName())) n.dispose();
await doc.transform(prune());
await io.write('limpio.glb', doc);
```

## Presupuestos (heurísticos)
| | Escritorio | Móvil |
|---|---|---|
| Peso del .glb | ≤ 2-3 MB | ≤ 1,5 MB |
| Vértices renderizados | ≤ 500k | ≤ 300k |
| Draw calls | < 150 | < 100 |
| Texturas | ≤ 2048 | ≤ 1024 |
| Pases de postpro | 0-2 | 0 |
Medido en la demo: reloj Khronos 261k vértices, 7,1 → 2,0 MB (2048) y 1,5 MB (1024).

## Materiales y variantes
- `KHR_materials_variants`: el mismo modelo con varias combinaciones (colores de correa, acabados). Base de un configurador: `gltf.userData.variants` / `gltf.functions.selectVariant` en three (ver ejemplo `webgl_loader_gltf_variants`).
- `KHR_materials_transmission` (cristal) es caro: en móvil plantéate sustituirlo por `MeshPhysicalMaterial` con `transmission: 0` y algo de `opacity`.

## Licencias
Guarda autor, licencia y enlace de cada modelo (CC-BY obliga a citar). En la demo: "Chronograph Watch" de Eric Chadwick (y logos de Khronos/DGG), CC-BY 4.0, glTF-Sample-Assets.
