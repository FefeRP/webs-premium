# Dirección: que parezca imposible sin cansar

## El recorrido (4-7 secciones)
1. **Entrada (hero)**: marca + promesa en una frase + el protagonista visible. Debe verse completa en 1 segundo, antes de que cargue nada pesado (póster).
2. **Momento estrella**: la técnica fuerte, fijada (pin) 200-400 % de alto de pantalla. Como mucho 3-4 textos cortos sincronizados.
3. **Apoyo** (2-3): detalle, beneficios, prueba social, galería. Animación discreta (reveals, parallax suave).
4. **Cierre**: CTA claro, datos de contacto/compra, créditos.

## Reglas de dirección
- **Un pico**: un momento estrella por página. Si hay dos, el segundo más corto y de otra técnica.
- **Contraste de ritmo**: tras una sección fijada larga, una sección que respire (texto, espacio).
- **El scroll manda**: nada de animaciones que se reproduzcan solas en bucle y compitan con el scroll (salvo un fondo ambiente muy sutil).
- **Texto legible siempre**: comprueba en cada posición que el texto tenga contraste sobre lo que pasa detrás (velo degradado si hace falta).
- **Móvil primero**: el momento estrella debe funcionar en vertical (recorte 9:16 o encuadre propio). Si no, rediseñarlo para móvil, no encogerlo.
- **Duración**: un pin de 300 % ≈ 3 pantallas de pulgar. Más de 500 % cansa.
- **Velocidad coherente**: el mismo `ease` y duraciones parecidas en toda la web (p. ej. `power3.out` 0,8-1,2 s en reveals; `none` en scrub).

## Tipografía y color
- Dos familias como mucho (una display con carácter + una de texto). Tamaños con `clamp()`.
- Paleta: un fondo (rara vez blanco puro o negro puro), un texto, un acento. El color del fondo de la web = el del fondo del vídeo/render, para que el lienzo "desaparezca".
- Números con `font-variant-numeric: tabular-nums` si se animan.

## Lo que da "aspecto de IA" y cómo evitarlo
| Huele a plantilla | Mejor |
|---|---|
| Degradado morado-azul y tarjetas con sombra suave | Paleta del producto real; superficies planas o con textura |
| Todo aparece con el mismo fade-up | Una técnica por sección y reveals distintos según el contenido |
| Emojis o iconos genéricos como ilustración | Fotos/frames del producto, detalle tipográfico |
| Textos vagos ("Innovación que transforma") | Datos concretos del producto (materiales, medidas, origen) |
| Tres columnas de "features" | Recorrido narrativo: un beneficio por pantalla |
| Botón "Empezar ahora" sin contexto | CTA que dice lo que pasa ("Reservar mesa", "Ver tallas") |

## Brief mínimo (BRIEF.md)
```
Negocio / producto:
Objetivo y CTA:
Público y dispositivo principal:
Momento estrella:
Técnicas (fuerte + apoyo) y por qué:
Recorrido (secciones):
Activos: origen, licencia, coste estimado:
Marca: colores, tipografía, tono:
Destino técnico (Vite / Next / …):
```
