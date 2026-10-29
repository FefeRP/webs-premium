# Ideas del motion de mapas (ref9) y del vídeo de la web (ref8)

Lo que se puede llevar a una web, y con qué coste. Los análisis completos están en `docs/referencias/analisis-ref8-vid-153107.md` y `analisis-ref9-vid-125941.md`. Las ideas se aprovechan; los diseños, los nombres y los activos de los autores no se copian.

## De ref8 (web inmobiliaria: nubes → satélite → parcela → render)
- **Arranque entre nubes.** Un velo de nubes que se abre con el primer 10-15 % del scroll.
  - En la demo se hace con degradados CSS.
  - Para que sea fotográfico, usa un PNG o WebP de nubes con alfa, propio o generado con licencia, en dos capas a distinta velocidad (skill `parallax-capas`).
- **HUD de texto por fases** ("WHY DUBAI" → barrio → parcela). Un texto por fase, que entra y sale con el progreso.
- **Corte seco satélite → render.** Es el fallo que Gemini marcó en ref8: aquí se sustituye por el relevo encuadrado (ver `patrones-codigo.md`).
- **Selector de plantas y plano 2D** después del edificio. Es otra sección, no parte del mapa: plantas con `scroll-frames` o capas, y planos en SVG.
  - Lo que se aprende de ref8 es animar el cambio de planta, que ellos hacen plano.

## De ref9 (anuncio de mapas en 3D, motion)
| Idea | En web | Coste/cuidado |
|---|---|---|
| Ciudad "de arcilla" (blanca, sombras suaves) | En MapLibre: estilo propio con `fill-extrusion` claro, fondo neutro y sin ortofoto. En three.js: edificios OSM extruidos con AO horneado | Barato con MapLibre; three.js a medida, días |
| Ruta que se dibuja | Capa `line` con `line-gradient` o `line-dasharray` animado por progreso, sobre GeoJSON de la ruta | Barato |
| Tarjeta de lugar anclada (POI) | HTML posicionado con `m.proyectar()` | Barato |
| Corte circular del suelo que enseña el metro | three.js con stencil o clipping planes y una maqueta del túnel. No se puede hacer con MapLibre | Caro: pieza a medida |
| Dolly zoom a una puerta | Cambiar el FOV a la vez que se acerca la cámara. MapLibre no expone el FOV de forma práctica: en three.js | Medio |
| Árboles con `InstancedMesh` y geometría fusionada | Solo en escenas three.js propias | Medio |

Mientras no haya encargo, estas ideas quedan como 🔜 en el catálogo de técnicas de la skill maestra.
