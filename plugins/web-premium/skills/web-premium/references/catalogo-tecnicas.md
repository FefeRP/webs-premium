# Catálogo de efectos y técnicas (por técnica, no por estilo)

Cada entrada tiene: **qué se ve** · **cómo se hace** · **coste** (€ activos / rendimiento / horas) · **skill** (✅ existe, 🔜 fase siguiente).
"Ref" señala el vídeo de referencia de `docs/referencias` donde aparece:
- ref1: The Seed (girasol)
- ref2: Igloo Inc
- ref3: sweet-tape, era-residence, nickho-motorsports
- ref4: slider de helados
- ref5: café POUR/PLAY
- ref6: cosmética 9:16 (@ASCENTA.STUDIO)
- ref7: Reposé y latas en órbita (@W.WEAREBRAND)
- ref8: Reposé Residence, del satélite al edificio (@W.WEAREBRAND)
- ref9: mapas de arcilla en Barcelona (@RIKI.BOSSO, motion)
- ref10: slider de latas en Figma (@DESIGNGEMSTUDIO)
- ref11: cruasán por dentro (@W.WEAREBRAND)

Coste de rendimiento: 🟢 ligero (cualquier móvil) · 🟡 medio (cuidar móvil) · 🔴 pesado (solo escritorio o con alternativa).

## A. Scroll y ritmo (la columna vertebral)
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Scroll suave con inercia | Lenis + `ScrollTrigger.update` en un único ticker | 🟢 | plantilla ✅ · ref2, ref3 |
| Sección fijada (pin) que "reproduce" una escena | ScrollTrigger `pin:true, scrub:true, end:'+=300%'` | 🟢 | scroll-frames ✅ · ref1, ref5 |
| Textos que aparecen sincronizados con la escena | timeline con etiquetas, `autoAlpha`+`y`, normalizado 0..1 | 🟢 | scroll-frames (patrones) ✅ · ref1 |
| HUD de datos ligado al progreso (contador, tiempo, °C, estado, barra) | el mismo `progress` que los frames → texto con `tabular-nums` y curva suave | 🟢 | scroll-frames (patrones, "HUD de datos") ✅ · ref1 (Day 0→90), ref3 (contador 98), ref11 (migas en el aire, horno) |
| Scroll horizontal dentro de vertical | pin + `x: -(ancho-vw)` con scrub; `containerAnimation` para hijos | 🟢 | 🔜 scroll-horizontal |
| Snap a capítulos | `snap:{snapTo:'labels'}` o CSS scroll-snap | 🟢 | 🔜 |
| Animaciones CSS ligadas al scroll sin JS | `animation-timeline: view()/scroll()` + `animation-range` | 🟢 (Chrome/Edge/Safari 26) | parallax-capas (patrones) ✅ |

## B. Vídeo y secuencias de frames
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Producto que gira/se abre/se transforma al bajar | vídeo IA (imagen→vídeo) → frames WebP/AVIF → canvas | 🟡 (4-8 MB) · € vídeo IA | video-ia-para-scroll + scroll-frames ✅ · ref1, ref5, ref3 (sweet-tape) |
| Lo mismo con poco peso | MP4 con GOP corto + `currentTime` | 🟢 peso · 🟡 fluidez iOS | scroll-frames (modo vídeo) ✅ |
| Despiece/ensamblado ("exploded view") | vídeo de explosión invertido | 🟡 | video-ia-para-scroll (trucos) ✅ |
| Entrar en un objeto o un lugar (fly-through) | plantilla "Through Object"/dolly + frames | 🟡 | video-ia-para-scroll ✅ · ref2 (portal) |
| Transición de escena a escena | encadenar vídeos por último frame + fundido | 🟡 | video-ia-para-scroll ✅ · ref1 |
| Fondo vivo en bucle | vídeo corto en bucle (inicio=fin), `muted playsinline`, pausa fuera de vista | 🟢 | 🔜 fondo-video |
| Frames en sprite CSS (muy pocos frames) | `steps()` + `background-position` | 🟢 | scroll-frames (tabla de modos) ✅ |
| La secuencia "aterriza" en la ficha de producto (PDP) o en la parrilla | último frame = foto exacta del producto en la UI; fundido de canvas a `<img>` y la UI (precio, botón) entra después | 🟡 | scroll-frames + video-ia-para-scroll ✅ (el frame final, desde `fotos-producto-ia`) · ref6 |
| Vuelo multiescala (cielo → plano del lugar → fachada → interior) | 2-4 vídeos encadenados por último frame, cada uno una escala; textos editoriales entre tramos | 🟡 · € vídeo IA | video-ia-para-scroll (transición encadenada) ✅ · ref7 (Reposé) |
| Antes/después guiado por el scroll (manchas que se borran, limpieza) | frames de un vídeo IA, o barato: dos fotos alineadas + cortina con máscara (`lente.cortina(p)`); shader de mezcla con ruido 🔜 | 🟢-🟡 | lente-revelado (cortina) ✅ · ref6 (sérum) |
| Producto realista contado por dentro en tramos (se parte → capas → entrar dentro → cambio de estado) | imagen clave sobre negro + 3-4 vídeos IA encadenados por fotograma (inicial/final) → frames por tramo + HUD | 🟡 · € vídeo IA (~15-35 $) | video-ia-para-scroll (receta-producto-por-dentro) + scroll-frames ✅ · ref11 |
| Cambio de estado ligado al scroll (crudo → horneado, cerrado → abierto) | vídeo IA con fotograma inicial y final del mismo encuadre → frames; el HUD pone nombre al estado | 🟡 | video-ia-para-scroll (receta) ✅ · ref11 |
| Composición vertical 9:16 propia para móvil | vídeo o frames generados aparte en vertical (no recortar el horizontal) | 🟡 | scroll-frames (`--recorte-movil` o variante móvil) ✅ · ref6, ref7 |

## C. Profundidad 2.5D (sin 3D)
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Parallax de capas en el scroll | `[data-profundidad]` + translate3d | 🟢 | parallax-capas ✅ · ref4, ref5 |
| Capas que siguen al ratón | puntero → lerp por profundidad (solo hover) | 🟢 | parallax-capas ✅ · ref3 (nickho) |
| Ingredientes/objetos flotando alrededor del producto | PNG recortados con rotación + flotación lenta + parallax | 🟢 | parallax-capas ✅ · ref4 |
| Texto entre planos (detrás del producto) | z-index: fondo < título < producto recortado | 🟢 | parallax-capas ✅ · ref4 |
| Sombra como capa propia: el producto levita y la sombra se abre y difumina; cambiar de fondo sin perder la sombra | `capas-sombra.mjs` (foto + plato → fondo, sombra semitransparente, producto) + CSS `view-timeline` | 🟢 | parallax-capas (sombras.md) ✅ |
| Fotos del producto real en escenas imposibles, iguales entre tomas | edición por referencia con IA + revisión con superposición | € imagen IA (céntimos) | fotos-producto-ia ✅ |
| Mirar dentro con el cursor: lente de rayos X / térmica / interior, con interruptor de modo | dos imágenes alineadas + `mask-image: radial-gradient` que sigue al puntero (lerp); variantes con ffmpeg o edición IA | 🟢 | lente-revelado ✅ · ref11 (X-ray / Thermal) |
| Lata o envase cilíndrico que gira sin 3D | etiqueta plana enrollada en canvas 2D (`u = asin(x/r)`) + sombreado y tapa; giro con scroll, arrastre o slider | 🟢 | envase-giratorio ✅ · ref10 (en Figma: franja dentro de máscara) |
| Tarjetas en perspectiva (CSS 3D) | `perspective` + `rotateX/Y` + stagger | 🟢 | 🔜 tarjetas-3d-css · ref5 |
| Tilt de tarjeta con brillo | puntero → rotateX/Y + degradado radial de brillo | 🟢 | 🔜 |
| Profundidad desde una foto (depth map) | foto + mapa de profundidad (Depth Anything) → shader de desplazamiento | 🟡 | 🔜 foto-profundidad |

## D. 3D real (three.js / R3F)
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Producto 3D que gira con scroll y arrastre | glTF optimizado + entorno PBR + render bajo demanda | 🟡 | escena-3d-gltf ✅ · ref3 (casco nickho) |
| Objeto que sigue al ratón | rotación objetivo + lerp | 🟢 sobre 🟡 | escena-3d-gltf (patrones) ✅ · ref3 |
| Cámara que recorre una escena con el scroll | CatmullRomCurve3 + progreso | 🟡 | escena-3d-gltf (patrones) ✅ · ref2 |
| Configurador (colores/materiales) | KHR_materials_variants o cambiar material | 🟡 | escena-3d-gltf (optimizar) ✅ |
| Del mapa al edificio (ciudad → barrio → parcela → edificio resaltado) | MapLibre + ortofoto con licencia (PNOA en España) + extrusión OSM; cámara por paradas ligada al scroll, relevo a foto/render real | 🟢-🟡 · 0 € en España | mapa-zoom-ubicacion ✅ · ref8 (Reposé, satélite) |
| Mapa "de arcilla" con ruta que se dibuja y tarjetas ancladas | estilo propio de extrusión clara sin ortofoto; capa `line` animada; HTML con `proyectar()` | 🟢-🟡 | mapa-zoom-ubicacion (ideas-ref9) parcial · ref9 |
| Corte circular del suelo que enseña el subsuelo (metro, cimientos) / dolly zoom | three.js con stencil/clipping; FOV animado | 🔴 | 🔜 · ref9 |
| Carrusel orbital de variantes → una gira y muestra ingredientes → todas en fila | varias instancias del mismo glTF con variantes de material, en círculo sobre un pedestal; GSAP timeline con scrub para órbita → foco → line-up | 🟡 | escena-3d-gltf (patrones) parcial · ref7 (Ciao) |
| Vidrio/hielo con refracción | MeshPhysicalMaterial `transmission`, `ior`, `thickness`; drei MeshTransmissionMaterial | 🔴 | 🔜 materiales-premium · ref2 |
| Wireframe → sólido / bloques que se dispersan | dos materiales + uniform de progreso; instancias con offset | 🟡 | 🔜 · ref2 |
| Niebla/whiteout como transición | `scene.fog` animado + overlay | 🟢 | 🔜 · ref2 |
| Postprocesado (bloom, aberración cromática, grano) | EffectComposer / pmndrs postprocessing | 🔴 | 🔜 postpro · ref2 |
| Escenas hechas en Spline | `@splinetool/runtime` (pesado; bueno para prototipos) | 🔴 | 🔜 |

## E. Shaders y GPU
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Partículas que forman una figura (y se deshacen) | MeshSurfaceSampler → posiciones; GPGPU (GPUComputationRenderer) + curl noise | 🔴 | 🔜 particulas-gpgpu · ref2 (pingüino) |
| Imagen que se distorsiona al pasar / al hacer scroll | plano con shader de desplazamiento (OGL o three) | 🟡 | 🔜 imagen-shader · ref3 (sweet-tape vertex) |
| Fondo de degradado vivo / ruido | fragment shader a pantalla completa (OGL, ligero) | 🟡 | 🔜 fondo-shader |
| Transición líquida entre imágenes | mezcla de texturas con mapa de desplazamiento | 🟡 | 🔜 |
| Cursor con estela/metaball | canvas 2D o shader | 🟢-🟡 | 🔜 |

## F. Tipografía cinética
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Reveal por líneas/palabras con máscara | SplitText (`mask:'lines'`) + `yPercent` stagger | 🟢 | 🔜 tipografia-cinetica (apoyo: gsap-skills) · ref1, ref3 (era) |
| Título que se recorta al cambiar (slider) | máscara `overflow:hidden` + salida/entrada en `xPercent`/`yPercent` | 🟢 | envase-giratorio (patrones) ✅ · ref4, ref10 |
| Contador que sube | `gsap.to(obj,{v})` o ligado al progreso + `textContent` redondeado, `tabular-nums` | 🟢 | scroll-frames (patrones, HUD) ✅ · ref3, ref11 |
| Sello/insignia giratoria | SVG `textPath` + rotación ligada al scroll | 🟢 | 🔜 · ref3 (era) |
| Texto gigante que se escala/rellena | `scale`/`clip-path` con scrub | 🟢 | 🔜 |
| Marquesina infinita con velocidad del scroll | duplicar pista + `x` modulado por la velocidad de Lenis | 🟢 | 🔜 |

## G. Transiciones y layout
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Slider de producto con elemento compartido | GSAP Flip o View Transitions API (`view-transition-name`) | 🟢 | 🔜 transiciones · ref4 |
| Slider de sabores: la lata gira y cambian a la vez fondo, título gigante detrás, frutas y texto | `envase-giratorio` + variables CSS + título en máscara + frutas con parallax; cambio de etiqueta a mitad de giro | 🟢 | envase-giratorio (patrones) ✅ · ref10, ref4 |
| Cambio de color de fondo por sección o variante | ScrollTrigger `onEnter` o el slider → variables CSS | 🟢 | envase-giratorio (patrones) ✅ · ref4, ref10 |
| Imagen que crece hasta pantalla completa | `clip-path`/`scale` con scrub | 🟢 | 🔜 · ref3 (era) |
| Transiciones entre páginas | View Transitions (MPA: `@view-transition`) o Barba/Next | 🟢 | 🔜 |
| Preloader con progreso real | progreso de frames/modelo (callbacks de los motores) | 🟢 | 🔜 · ref3 (contador) |

## H. Sonido
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Sonido ambiente con interruptor | `<audio>` solo tras gesto, interruptor visible, apagado por defecto | 🟢 | 🔜 sonido · ref1, ref11 ("Sound off", el crujido) |
| Sonidos de interfaz ligados al scroll | Web Audio, volumen/filtro por progreso | 🟢 | 🔜 |

## I. Microinteracciones
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Botón magnético | puntero → translate con lerp, solo hover | 🟢 | 🔜 microinteracciones |
| Cursor personalizado contextual | div con `mix-blend-mode` y estados | 🟢 | 🔜 |
| Hover que revela imagen | imagen siguiendo al puntero con lerp | 🟢 | 🔜 (la variante "revela otra versión de la misma imagen" es `lente-revelado` ✅) |

## Repos y librerías que nombran los vídeos
- Del vídeo ref3 (Sanjai Builds):
  - nateherkai/scroll-craft
  - greensock/gsap-skills
  - iart-ai/webgl-animation-skills
  - iart-ai/web-animation-skills
  - MengTo/Skills
  - anthropics/skills (frontend-design)
  - mrdoob/three.js
  - darkroomengineering/lenis
  - pmndrs/drei
- Detectados en las webs analizadas: GSAP (ScrollTrigger, SplitText, Flip), Lenis, three.js / R3F, Webflow, Next.js.
- Igloo Inc (ref2) además usa técnicas de GPGPU, MeshSurfaceSampler y postprocesado.

## Combinaciones que funcionan (ejemplos, no plantillas)
- **Producto físico pequeño** (reloj, perfume, zapatilla): hero con capas + **frames** del giro + 3D vivo opcional para "míralo tú".
- **Comida y bebida**: hero con ingredientes flotando (capas) + **frames** del vertido o el montaje + slider de sabores con la **lata que gira** (ref10). Para un producto con interior que vende (pan, chocolate, fruta): el **producto por dentro** en tramos + HUD + **lente de rayos X** (ref11).
- **Lugar** (restaurante, hotel, tienda): **frames** de fly-through de la entrada + fotos con reveal + tarjetas CSS 3D. Para inmobiliaria o resorts, vuelo multiescala (ref7) o **del mapa al edificio** con mapa real (ref8, `mapa-zoom-ubicacion`) + plantas con capas.
- **Cosmética y e-commerce**: **frames** del producto que se abre (tapa, flor, gota) que aterrizan en la ficha con precio y botón (ref6); antes/después con el scroll; producto que levita sobre su sombra.
- **Gama de bebidas o variantes**: 3D real con carrusel orbital → foco en una → line-up (ref7).
- **Marca tecnológica o abstracta**: **3D real** con shaders y partículas + tipografía cinética (solo escritorio en el pico, con póster en móvil).
