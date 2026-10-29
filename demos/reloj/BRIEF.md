# BRIEF · Orbe 01 (demo local)

- **Negocio / producto:** Orbe, marca ficticia de relojes cronógrafo. Protagonista: el Orbe 01 (reloj "Chronograph Watch" de Khronos, rebautizado para la demo).
- **Objetivo y CTA:** reservar el reloj ("Reservar el Orbe 01") y, de apoyo, "Ver la ficha técnica".
- **Público y dispositivo:** comprador de relojes de gama media-alta; escritorio y móvil a partes iguales (demo pensada para enseñar en ambos).
- **Momento estrella:** sección fijada (≈300 %) en la que el reloj gira en arco de perfil a frente y vuelve al otro perfil con el scroll, con 3 textos cortos sincronizados (caja, esfera, correa).
- **Técnicas (fuerte + apoyo) y por qué:**
  - Fuerte: `scroll-frames` (frame-scrubber, 120 frames WebP/AVIF ya renderizados). Giro preciso y nítido en cualquier móvil, sin GPU.
  - Apoyo 1: `parallax-capas` en el hero, capas hechas con código (anillos de esfera en SVG, halo/brillo con degradados, polvo dorado). Profundidad sin activos.
  - Apoyo 2: `escena-3d-gltf` en "Míralo tú": el reloj en 3D real que se arrastra y gira con el scroll, cargado en diferido con póster. Justificado porque aquí el visitante interactúa.
- **Recorrido:** 1) hero con capas + nombre · 2) secuencia fijada (estrella) · 3) respiro: ficha con cifras · 4) míralo tú (3D) · 5) cierre con CTA + pie con créditos.
- **Activos:** frames y GLB derivados de "Chronograph Watch" (Khronos glTF-Sample-Assets, CC-BY 4.0, Eric Chadwick; incluye logos de Khronos/DGG). Capas del hero, textos y marca: código. Coste: 0 €.
- **Marca:** fondo #171412 (= fondo del vídeo), texto #efe9e1, acento #c9a46a. Display serif del sistema (Palatino Linotype → Georgia), texto sans del sistema. Tono sobrio y concreto (materiales y medidas).
- **Destino técnico:** HTML estático con Vite 8 + GSAP ScrollTrigger + Lenis + three 0.186 (solo en la sección 3D, import dinámico). Servidor de desarrollo en 127.0.0.1:5190.
