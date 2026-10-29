// mapa-scroll.js: mapa REAL (MapLibre GL JS) cuya cámara avanza con el scroll, desde la vista amplia hasta un edificio.
// Requiere maplibre-gl (>= 5; probado con 6.16). Se pasa la librería por parámetro: el motor no la importa.
//
//   import * as maplibregl from 'maplibre-gl'; import 'maplibre-gl/dist/maplibre-gl.css';  (v6: sin export default)
//   import { crearMapaScroll } from './mapa-scroll.js';
//   const m = await crearMapaScroll({ contenedor, maplibregl, estilo, paradas, satelite, resaltar });
//   await m.precargar();          → recorre la ruta en silencio para tener las teselas en caché (sin huecos al bajar)
//   m.progreso(p)                 → 0..1 (lo enlazas a un ScrollTrigger con scrub)
//   m.destruir()                  → libera WebGL y eventos
//
// Qué resuelve:
// - Interpolación de cámara "acercarse a un punto": el centro se mueve en coordenadas Mercator en proporción a 1/escala, así
//   el destino se queda quieto en pantalla mientras el zoom crece (si se interpola lng/lat y zoom a la vez, el mapa
//   "patina" de lado y se marea; es el fallo típico).
// - Satélite/ortofoto como capa raster bajo las etiquetas, con su atribución (obligatoria).
// - Edificios 3D (fill-extrusion) desde las teselas vectoriales y el edificio destino resaltado (huella dada o detectada).
// - Mapa no interactivo (no secuestra la rueda ni el dedo), render solo cuando cambia, precarga y limpieza.

const DEF_RESALTE = { color: '#f2a541', opacidad: 0.95, altura: null };

export async function crearMapaScroll({
  contenedor,
  maplibregl,
  estilo,                       // URL de estilo o objeto (p. ej. 'https://tiles.openfreemap.org/styles/liberty')
  paradas,                      // [{ centro:[lng,lat], zoom, pitch=0, bearing=0, en:0..1 }] ordenadas por `en`
  satelite = null,              // { tiles:[url], atribucion, tamTesela=256, maxzoom=19, opacidad=1 (número o expresión) }
  edificios = true,             // extruye la capa `building` de las teselas OpenMapTiles si el estilo no lo hace
  colorEdificios = '#f4efe6',
  opacidadEdificios = 0.55,
  resaltar = null,              // { punto:[lng,lat], huella?:GeoJSON Polygon/Feature, color, altura? (m) }
  ocultarPuntos = true,         // oculta los iconos de POI del estilo (capa `poi` de OpenMapTiles)
  suavizado = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  dprMax = 2,
} = {}) {
  if (!contenedor || !maplibregl) throw new Error('mapa-scroll: faltan contenedor o maplibregl');
  if (!paradas?.length) throw new Error('mapa-scroll: faltan paradas');
  const ps = [...paradas].sort((a, b) => a.en - b.en);

  const inicial = ps[0];
  const mapa = new maplibregl.Map({
    container: contenedor,
    style: estilo,
    center: inicial.centro,
    zoom: inicial.zoom,
    pitch: inicial.pitch ?? 0,
    bearing: inicial.bearing ?? 0,
    interactive: false,           // el scroll manda; el mapa no captura rueda ni gestos
    attributionControl: { compact: true },
    fadeDuration: 0,              // sin fundido de teselas/etiquetas: con scrub el fundido parece parpadeo
    maxPitch: 85,
    pixelRatio: Math.min(window.devicePixelRatio || 1, dprMax),
    canvasContextAttributes: { antialias: true },
  });
  contenedor.setAttribute('aria-hidden', 'true');
  // Iconos que el estilo pide y su sprite no trae (pasa con liberty): uno transparente en vez de un aviso por icono.
  mapa.setMissingStyleImageResolver?.((id) => {
    if (!mapa.hasImage(id)) mapa.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) });
  });

  await new Promise((ok, mal) => {
    mapa.once('load', ok);
    mapa.once('error', (e) => { if (!mapa.loaded()) mal(e.error || new Error('mapa-scroll: el estilo no cargó')); });
  });

  const capas = mapa.getStyle().layers;
  const primeraEtiqueta = capas.find((c) => c.type === 'symbol')?.id;

  // Puntos de interés (tiendas, paradas, papeleras…): a pie de calle llenan la vista de iconos ajenos al cliente.
  if (ocultarPuntos) {
    for (const c of capas) if (c.type === 'symbol' && /^(poi|aerodrome_label)$/.test(c['source-layer'] ?? '')) mapa.setLayoutProperty(c.id, 'visibility', 'none');
  }

  // --- satélite / ortofoto ---
  if (satelite) {
    mapa.addSource('wp-satelite', {
      type: 'raster', tiles: satelite.tiles, tileSize: satelite.tamTesela ?? 256,
      maxzoom: satelite.maxzoom ?? 19, attribution: satelite.atribucion,
    });
    mapa.addLayer({ id: 'wp-satelite', type: 'raster', source: 'wp-satelite',
      paint: { 'raster-opacity': satelite.opacidad ?? 1, 'raster-fade-duration': 0 } }, primeraEtiqueta);
  }

  // --- edificios 3D ---
  const fuenteVector = Object.entries(mapa.getStyle().sources).find(([, s]) => s.type === 'vector')?.[0];
  let capaEdificios = capas.find((c) => c.type === 'fill-extrusion' && c['source-layer'] === 'building')?.id;
  if (edificios && fuenteVector) {
    // los edificios planos del estilo sobran bajo la extrusión (y con satélite tapan la foto)
    for (const c of capas) if (c['source-layer'] === 'building' && c.type === 'fill') mapa.setLayoutProperty(c.id, 'visibility', 'none');
    if (capaEdificios) mapa.setLayoutProperty(capaEdificios, 'visibility', 'none');
    capaEdificios = 'wp-edificios';
    mapa.addLayer({
      id: capaEdificios, type: 'fill-extrusion', source: fuenteVector, 'source-layer': 'building', minzoom: 13,
      paint: {
        'fill-extrusion-color': colorEdificios,
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 9],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
        'fill-extrusion-opacity': opacidadEdificios,
      },
    }, primeraEtiqueta);
  }

  // --- edificio destino ---
  const r = resaltar ? { ...DEF_RESALTE, ...resaltar } : null;
  if (r) {
    mapa.addSource('wp-resalte', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    mapa.addLayer({
      id: 'wp-resalte', type: 'fill-extrusion', source: 'wp-resalte',
      paint: {
        'fill-extrusion-color': r.color,
        'fill-extrusion-height': ['coalesce', ['get', 'altura'], ['get', 'render_height'], ['get', 'height'], 20],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-opacity': 0,
        'fill-extrusion-opacity-transition': { duration: 0 },
      },
    });
    if (r.huella) ponerHuella(r.huella);
  }
  let huellaPuesta = Boolean(r?.huella);
  let areaPuesta = Infinity, definitiva = Boolean(r?.huella);   // detectada: se mejora hasta verla de cerca (z>=16,5)

  function ponerHuella(f, extra = []) {
    const aFeature = (g) => (g.type === 'Feature' ? { ...g } : { type: 'Feature', geometry: g, properties: {} });
    const features = [f, ...extra].map(aFeature).map((g) => ({
      ...g, properties: { ...g.properties, ...(r.altura ? { altura: r.altura } : {}) },
    }));
    mapa.getSource('wp-resalte').setData({ type: 'FeatureCollection', features });
    huellaPuesta = true;
  }

  // Busca la huella del edificio que contiene el punto en las teselas cargadas (si no se dio `huella`).
  // Ojo: querySourceFeatures da la geometría RECORTADA por tesela: un edificio que cae entre dos teselas llega en
  // trozos. Se toma el trozo que contiene el punto y se le suman los trozos gemelos (misma altura) que lo tocan.
  function detectarHuella() {
    // Y devuelve también las teselas de zoom bajo que siguen cargadas, donde los edificios vienen FUSIONADOS en
    // manchas de manzana: se detecta desde z15 y se elige la huella más pequeña que contiene el punto.
    if (!r || definitiva || !fuenteVector || mapa.getZoom() < 15) return;
    const candidatos = mapa.querySourceFeatures(fuenteVector, { sourceLayer: 'building' });
    const dentro = candidatos.filter((f) => contiene(f.geometry, r.punto));
    if (!dentro.length) return;
    const area = (g) => { const c = caja(g); return (c[2] - c[0]) * (c[3] - c[1]); };
    dentro.sort((a, b) => area(a.geometry) - area(b.geometry)
      || (b.properties.render_height ?? 0) - (a.properties.render_height ?? 0));
    if (area(dentro[0].geometry) >= areaPuesta) { if (mapa.getZoom() >= 16.5) definitiva = true; return; }
    const base = dentro[0], cb = caja(base.geometry), h = base.properties.render_height, hm = base.properties.render_min_height;
    const tope = area(base.geometry) * 4;
    const gemelos = candidatos.filter((f) => f !== base && f.properties.render_height === h
      && f.properties.render_min_height === hm && tocan(cb, caja(f.geometry), -2e-6) && area(f.geometry) <= tope);   // solapan (búfer de tesela), no solo se tocan como vecinos de pared
    const limpio = (f) => ({ type: 'Feature', geometry: f.geometry, properties: { ...f.properties } });
    ponerHuella(limpio(base), gemelos.map(limpio));
    areaPuesta = area(base.geometry);
    if (mapa.getZoom() >= 16.5) definitiva = true;
  }

  // --- cámara ---
  const M = maplibregl.MercatorCoordinate;
  const merc = ps.map((p) => M.fromLngLat(p.centro));
  function camara(p) {
    p = Math.min(1, Math.max(0, p));
    let i = ps.length - 2;
    for (let k = 0; k < ps.length - 1; k++) if (p <= ps[k + 1].en) { i = k; break; }
    if (ps.length === 1) return { center: ps[0].centro, zoom: ps[0].zoom, pitch: ps[0].pitch ?? 0, bearing: ps[0].bearing ?? 0 };
    const a = ps[i], b = ps[i + 1];
    const t = suavizado(Math.min(1, Math.max(0, (p - a.en) / Math.max(1e-6, b.en - a.en))));
    const zoom = a.zoom + (b.zoom - a.zoom) * t;
    // fracción del recorrido del centro: proporcional a 1/escala (acercarse a un punto sin patinar)
    let f = t;
    if (Math.abs(b.zoom - a.zoom) > 0.01) {
      const ia = 2 ** -a.zoom, ib = 2 ** -b.zoom, iz = 2 ** -zoom;
      f = (iz - ia) / (ib - ia);
    }
    const ma = merc[i], mb = merc[i + 1];
    const centro = new M(ma.x + (mb.x - ma.x) * f, ma.y + (mb.y - ma.y) * f).toLngLat();
    let db = ((b.bearing ?? 0) - (a.bearing ?? 0)) % 360;
    if (db > 180) db -= 360; if (db < -180) db += 360;   // giro por el lado corto
    return {
      center: centro, zoom,
      pitch: (a.pitch ?? 0) + ((b.pitch ?? 0) - (a.pitch ?? 0)) * t,
      bearing: (a.bearing ?? 0) + db * t,
    };
  }

  let objetivo = 0, pedido = 0, destruido = false, cortarEspera = null;
  function aplicar() {
    pedido = 0;
    if (destruido) return;
    mapa.jumpTo(camara(objetivo));
    if (r) {
      detectarHuella();
      // el resalte se enciende al empezar el último tramo (en su primer 15 %) y se queda durante la órbita final
      const ultimo = ps[ps.length - 2]?.en ?? 0;
      const k = Math.min(1, Math.max(0, (objetivo - ultimo) / Math.max(1e-6, 1 - ultimo) / 0.15));
      mapa.setPaintProperty('wp-resalte', 'fill-extrusion-opacity', r.opacidad * k);
    }
  }
  if (r) mapa.on('sourcedata', (e) => { if (!definitiva && e.isSourceLoaded && e.sourceId === fuenteVector) detectarHuella(); });

  // Recorre la ruta en `pasos` posiciones esperando a que cada vista termine de cargar (o `espera` ms).
  // Mueve la cámara de verdad: hazlo solo con la sección fuera de vista. Se corta con `senal` (AbortSignal; abórtala
  // cuando la sección entre en pantalla) o en cuanto llega un progreso() nuevo, y deja la cámara en su sitio.
  async function precargar({ pasos = 10, espera = 6000, alProgreso = null, senal = null } = {}) {
    const inicio = objetivo;
    for (let i = 0; i <= pasos && !destruido && objetivo === inicio && !senal?.aborted; i++) {
      mapa.jumpTo(camara(i / pasos));
      await new Promise((ok) => {
        const fin = () => { clearTimeout(tm); senal?.removeEventListener('abort', fin); ok(); };
        const tm = setTimeout(fin, espera);
        mapa.once('idle', fin);
        senal?.addEventListener('abort', fin);
        cortarEspera = fin;   // destruir() también la corta
      });
      if (r) detectarHuella();
      alProgreso?.((i + 1) / (pasos + 1));
    }
    if (!destruido) aplicar();
  }

  return {
    mapa,
    camara,
    precargar,
    /** 0..1 */
    progreso(p) { objetivo = p; if (!pedido && !destruido) pedido = requestAnimationFrame(aplicar); },
    /** px de pantalla de un [lng,lat] (para anclar etiquetas HTML sobre el mapa) */
    proyectar: (lngLat) => mapa.project(lngLat),
    /** true cuando ya hay huella del edificio destino (dada o detectada) */
    get resaltado() { return huellaPuesta; },
    destruir() {
      destruido = true;
      cortarEspera?.();
      if (pedido) cancelAnimationFrame(pedido);
      mapa.remove();
    },
  };
}

// --- utilidades geométricas (punto en polígono, sin dependencias) ---
function enAnillo([x, y], anillo) {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i], [xj, yj] = anillo[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}
function caja(geom) {
  const cs = (geom.type === 'Polygon' ? geom.coordinates : geom.coordinates.flat()).flat();
  const xs = cs.map((c) => c[0]), ys = cs.map((c) => c[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
function tocan(a, b, margen = 1e-5) {
  return a[0] - margen <= b[2] && b[0] - margen <= a[2] && a[1] - margen <= b[3] && b[1] - margen <= a[3];
}
function contiene(geom, punto) {
  const polis = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
  return polis.some((anillos) => enAnillo(punto, anillos[0]) && !anillos.slice(1).some((h) => enAnillo(punto, h)));
}
