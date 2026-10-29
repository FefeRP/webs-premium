// Quita nodos que no son del producto (placas, suelos de la escena original) antes de optimizar.
// Uso: node herramientas/limpiar-glb.mjs entrada.glb salida.glb "Nombre nodo" ["Otro nodo"...]
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';

const [entrada, salida, ...nombres] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(entrada);
let quitados = 0;
for (const n of doc.getRoot().listNodes()) {
  if (nombres.includes(n.getName())) { n.dispose(); quitados++; }
}
await doc.transform(prune());
await io.write(salida, doc);
console.log(`quitados ${quitados} nodos -> ${salida}`);
