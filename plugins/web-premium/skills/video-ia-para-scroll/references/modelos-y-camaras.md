# Modelos y cámaras (estado a octubre de 2026; revisa antes de presupuestar)

## Higgsfield
Agregador con créditos: un plan da acceso a muchos modelos y a sus propios presets de cámara. Tiene MCP (permite ver el coste
antes de generar) y una skill oficial para Claude (junio 2026) que hace webs con scroll vía MCP + Remotion.
Precios **sin confirmar** (las fuentes no coinciden): Starter ~15 $/200 créditos, Plus ~29-34 $/1.000-1.200; un usuario reporta
~72 créditos por clip y ~27 $ por web completa. **Siempre presupuesto y vale antes de generar.**

### Presets de cámara: cuáles sirven para scroll
| Sirven (movimiento único y constante) | Evitar (cambian de velocidad o tiemblan) |
|---|---|
| 360 Orbit, Lazy Susan, Arc Left/Right, 3D Rotation | Handheld, Wiggle, Snorricam |
| Dolly In/Out, Super Dolly In/Out, Dolly Left/Right | Crash Zoom, Rapid Zoom, YoYo Zoom |
| Crane Up/Down, Jib Up/Down, Robo Arm | Whip Pan, Dutch Angle |
| Through Object In/Out, Static, Overhead | FPV Drone y Hyperlapse (solo si salen muy suaves) |
| Aerial Pullback (paisajes, inmobiliaria) | Bullet Time, Disintegration (efectistas; prueba aparte) |

## Modelos
| Modelo | Duración / resolución | Inicial + final | Para qué |
|---|---|---|---|
| **Kling 4.0** | 3-30 s, hasta 4K, hasta 10 fotogramas clave | Sí (varios) | Planos largos y bucles controlados. Flash: 20 s, 720p, sin varios clave |
| **Kling 3.0 / Turbo / Omni** | hasta 15 s, 720p-1080p (Omni 4K) | Sí | El caballo de batalla para producto; Turbo barato |
| **Veo 3.1** (Google) | 4/6/8 s, 720p/1080p (4K a 8 s) | Sí, **el final solo con 8 s** | Máxima calidad de luz/material. Lite 0,05 $/s, Fast 0,10, Standard 0,40 (precios Google) |
| **Luma Ray 3.x** | 5/10 s, 1080p, HDR | Sí, **modo loop**, hasta 16 clave | Bucles de producto y fondos de hero |
| **Seedance 2.5** (ByteDance) | hasta 30 s, 480/720p | Referencias (hasta 50) | Planos largos; resolución justa para escritorio |
| **Runway Gen-4.5 / Aleph 2.0** | — | Gen-4.5 desde imagen; Aleph edita vídeo existente | Arreglar un vídeo (quitar un objeto, cambiar fondo) |
| **WAN 2.5/2.6, Hailuo** | specs sin confirmar | — | Alternativas baratas para pruebas |
| **Sora 2** | **cerrado** (API apagada el 24-09-2026) | — | No usar |

## Elección rápida
- Producto que gira / arco → Kling 3.0 Turbo (pruebas) → Kling 4.0 o Veo 3.1 (final).
- Despiece → Veo 3.1 8 s con fotograma final, o Kling con inicial+final.
- Bucle de fondo → Luma (loop) o Kling inicial = final.
- Plano largo de recorrido (inmobiliaria, mundo) → 2-4 clips Kling encadenados por fotograma, mejor que uno de 30 s.
- Comida/fluidos → Veo 3.1 o Kling (los dos lo hacen bien); prueba ambos con 1 tirada barata.

## Resolución y aspecto
- Pide 1080p mínimo. 4K solo si el hero es a pantalla completa en pantallas grandes y el presupuesto de peso lo aguanta (se reescala a 1920 al extraer igualmente).
- 16:9 con margen lateral → el recorte 9:16 para móvil sale del centro (`--recorte-movil`). Si el producto es alto y estrecho (botella), genera también una toma 9:16 con la misma imagen clave.
- 24 fps es suficiente: 6 s = 144 frames, de sobra para 300 % de scroll.
