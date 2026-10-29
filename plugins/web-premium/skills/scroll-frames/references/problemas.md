# Problemas frecuentes: scroll-frames

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| El scroll "salta" a tirones aunque cargó todo | Vídeo con velocidad no constante, o pocos frames para un tramo largo | Revisa la hoja de contactos; recorta arranque/frenada (`--inicio/--fin`); más frames o tramo más corto; interpola |
| Va suave en escritorio y a tirones en móvil | Frames de escritorio en móvil, DPR sin tope, o dos suavizados apilados (Lenis + `scrub: 1`) | Variante `movil`, `dprMax: 2`, `scrub: true` con Lenis |
| La pestaña de Safari iOS se recarga sola | Memoria: demasiados frames decodificados o canvas enormes | Ventana LRU más pequeña (`maxBitmaps: 16`), frames de 720 px, un solo canvas |
| Canvas en blanco un instante al entrar | Se muestra el canvas antes de su primer frame | El canvas empieza con `opacity: 0` y se añade `.lista` tras `await crearFrameScrubber` |
| Borde/franja alrededor del producto | `cover` en una pantalla de otra proporción y fondo de sección distinto al del vídeo | Mismo color de fondo exacto; pide al generador margen alrededor del producto |
| Producto cortado en móvil | Recorte 9:16 centrado y el sujeto no está en el centro | `--recorte-movil x=0.4` (o lo que toque) o una toma vertical propia |
| El texto encima no se lee en algún momento | Contraste medido en un solo frame | Mide sobre el frame más claro de su tramo; pon degradado o placa detrás |
| El pin "pega un salto" al empezar | La sección cambia de altura al cargar (fuentes/imágenes) | `width/height` en el póster, `ScrollTrigger.refresh()` tras cargar fuentes |
| Modo vídeo: no se mueve en iPhone | Ahorro de batería / autoplay bloqueado | `vs.ok === false` → enseña el póster; reintenta con el primer toque (ya lo hace el motor) |
| Modo vídeo: seeks lentos | GOP largo (vídeo "para reproducir") | Recodifica con `--video-scrub` (`-g 8`, móvil `-g 4`) |
| 404 de frames en producción | Ruta base distinta (subcarpeta, CDN) | `base` absoluto y con `/` final; revisa `manifest.json` en Red |
