# Fuentes de mapa: licencias, precios y atribución

Investigado el 25-10-2026 en las fuentes oficiales (enlaces abajo). **Las condiciones cambian: revísalas antes de
publicar una web de cliente.** Nunca metas claves en el repo: si una fuente necesita key, va en `.env` (con
restricción por dominio en el panel del proveedor) y fuera de git.

## Resumen: qué usar
- **España:** PNOA del IGN (ortofoto) + OpenFreeMap `liberty` (calles, etiquetas, edificios 3D). **0 €, sin clave.**
- **Fuera de España:**
  1. La ortofoto oficial abierta del país, si su licencia permite el uso comercial: compruébalo en cada caso.
  2. Si no la hay, MapTiler Satellite: gratis con logo hasta 5.000 sesiones al mes, o 30 $/mes.
  3. Si no, Esri a través de Location Platform, con key: 2M teselas gratis al mes.
  4. Si no, Mapbox raster: 750.000 teselas gratis al mes.
- **Edificios texturizados gratis para uso comercial:** no hay ninguna fuente fiable. El plano final del edificio sale del material del cliente.

## Gratis y sin clave
| Fuente | Qué da | Licencia | Atribución obligatoria |
|---|---|---|---|
| **PNOA máxima actualidad** (IGN) | Ortofoto aérea de 25-50 cm; a escalas pequeñas, Sentinel-2. Teselas hasta z19 (z20 responde). CORS `*` | **CC BY 4.0** (Orden FOM/2807/2015). Uso comercial libre, se puede descargar y alojar | "PNOA cedido por © Instituto Geográfico Nacional" (corta: "CC BY 4.0 scne.es") |
| **OpenFreeMap** | Teselas vectoriales OpenMapTiles y estilos `liberty`, `bright`, `positron`. Solo `liberty` trae `building-3d` (desde z14, `render_height`) | Gratis, sin key ni límite de visitas, uso comercial permitido. **Sin SLA** (vive de donaciones) | "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (lo de OSM/ODbL es obligatorio; lo de OpenFreeMap, cortesía) |
| **MapLibre GL JS** | El motor | BSD-3-Clause | Se respeta con el `attributionControl` (no lo quites) |

URL XYZ del PNOA para MapLibre (probada: 200 JPEG con CORS):
```
https://www.ign.es/wmts/pnoa-ma?request=GetTile&service=WMTS&version=1.0.0&layer=OI.OrthoimageCoverage&style=default&format=image/jpeg&tilematrixset=GoogleMapsCompatible&tilematrix={z}&tilerow={y}&tilecol={x}
```
Alternativa TMS: `https://tms-pnoa-ma.idee.es/1.0.0/pnoa-ma/{z}/{x}/{y}.jpeg` con `scheme: 'tms'`.
El IGN no publica un cupo para el WMTS. Si la web va a tener mucho tráfico, descarga las teselas de la zona y sírvelas
desde la propia web (CC BY lo permite).

Extras en España (CC BY 4.0):
- **LiDAR PNOA** (CNIG): nubes de puntos LAZ.
- **Catastro INSPIRE**: edificios con número de plantas, útiles si la altura de OSM es mala.

## Con clave o de pago (solo con presupuesto y vale)
| Fuente | Gratis | Después | Ojo |
|---|---|---|---|
| **MapTiler** Satellite/estilos | 5.000 sesiones y 100.000 peticiones al mes, con logo obligatorio | Flex 30 $/mes (25.000 sesiones) | Nativo en MapLibre. En España usa ortofoto aérea a zooms altos |
| **Esri World Imagery** (Location Platform) | 2M teselas al mes | 0,15 $ por 1.000 | Sin key **solo** para apps que no ganan dinero. Prohíbe cachear y alojar. Atribución "Powered by Esri" + proveedores |
| **Mapbox** Raster Tiles (`mapbox.satellite`) | 750.000 teselas al mes | desde 0,25 $ por 1.000 | Con Mapbox GL JS se cobra por carga de mapa (50.000 gratis, luego 5 $ por 1.000) |
| **Stadia** Alidade Satellite | El plan gratis **no** permite uso comercial | desde 20 $/mes | Cada tesela de satélite gasta 4 créditos |
| **Cesium ion** | Community, no comercial | desde 149 $/mes | OSM Buildings sin textura |
| **Google Photorealistic 3D Tiles** | 1.000 root tiles al mes | 6 $ por 1.000 | **Devuelve 403 con facturación en el EEE desde el 8-7-2025.** Prohíbe precargar y cachear. Logo de Google visible |

## Evitar
- **`tile.openstreetmap.org`:** su política prohíbe precargar y el uso masivo, y pueden cortarlo sin aviso. No sirve para webs de clientes.
- **Sentinel-2 cloudless (EOX):** licencia CC BY-NC-SA, así que no es comercial sin pagar. Además, con 10 m por píxel no se ven edificios.
- **Vídeo de IA del barrido satélite→edificio:** se inventa el sitio. Aunque quede bonito, no es la ubicación real.

## IA para el tramo final (opcional, con precio y vale)
Úsala solo para animar material **real**: una foto o un plano de dron del edificio pasado por image-to-video, o un plano de ambiente marcado como recreación.

Precios orientativos (de agregadores, no oficiales):

| Herramienta | Precio |
|---|---|
| Veo 3.1 | ~0,40 $/s |
| Veo Fast | desde 0,10 $/s |
| Veo Lite | 0,05 $/s |
| Kling 3.0 | 0,14-0,56 $ por clip de 5 s |

Un clip útil, contando varios intentos, sale por 1-5 $. Cómo pedirlo: skill `video-ia-para-scroll`.

## Enlaces
- OpenFreeMap: https://openfreemap.org/ · https://openfreemap.org/quick_start/
- Política de teselas de OSM: https://operations.osmfoundation.org/policies/tiles/
- PNOA:
  - Registro IDEE: https://www.idee.es/csw-codsi-idee/srv/api/records/spaignwmts_pnoa-ma
  - Licencia del IGN: https://www.ign.es/resources/licencia/Condiciones_licenciaUso_IGN.pdf
  - LiDAR CNIG: https://centrodedescargas.cnig.es/CentroDescargas/lidar-tercera-cobertura
  - Catastro INSPIRE: https://www.catastro.hacienda.gob.es/webinspire/index.html
- Esri:
  - Precios: https://location.arcgis.com/pricing/
  - Atribución: https://developers.arcgis.com/documentation/mapping-apis-and-services/deployment/basemap-attribution/
- MapTiler: https://www.maptiler.com/cloud/pricing/
- Mapbox:
  - Precios: https://www.mapbox.com/pricing
  - Uso con MapLibre: https://docs.mapbox.com/help/dive-deeper/mapbox-in-maplibre/
- Stadia: https://stadiamaps.com/pricing/
- Google:
  - Aviso EEE: https://developers.google.com/maps/comms/eea/map-tiles
  - Políticas: https://developers.google.com/maps/documentation/tile/policies
- Cesium: https://cesium.com/platform/cesium-ion/pricing/
- EOX: https://cloudless.eox.at/documentation/license
- Atribución de Overture: https://docs.overturemaps.org/attribution/
