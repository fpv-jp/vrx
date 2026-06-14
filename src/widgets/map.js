import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import 'maplibre-gl/dist/maplibre-gl.css'

let map = null
let droneMarker = null
let isFollowing = true

const DEFAULT_CENTER = [139.6917, 35.6895] // 東京
const DEFAULT_ZOOM = 17
const BUILDING_MIN_ZOOM = 15

function pmtilesUrl() {
  // VITE_PMTILES_URL 未設定時はサーバーのプロキシエンドポイントを使用
  return import.meta.env.VITE_PMTILES_URL ?? '/tiles/japan.pmtiles'
}

function styleWithPmtiles(url) {
  return {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      protomaps: {
        type: 'vector',
        url: `pmtiles://${url}`,
      },
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': '#1a1a2e' },
      },
      {
        id: 'earth',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'earth',
        paint: { 'fill-color': '#16213e' },
      },
      {
        id: 'landcover',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'landcover',
        paint: {
          'fill-color': ['match', ['get', 'pmap:kind'],
            'grass', '#0d2b1a',
            'forest', '#0d2b1a',
            'sand', '#1a1206',
            '#16213e',
          ],
        },
      },
      {
        id: 'water',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'water',
        paint: { 'fill-color': '#1e3a5f' },
      },
      {
        id: 'roads-minor',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        filter: ['match', ['get', 'pmap:kind'], ['minor_road', 'path', 'track'], true, false],
        paint: {
          'line-color': '#2a2a4a',
          'line-width': ['interpolate', ['linear'], ['zoom'], 14, 0.5, 18, 2],
        },
      },
      {
        id: 'roads-major',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        filter: ['match', ['get', 'pmap:kind'], ['highway', 'major_road', 'medium_road'], true, false],
        paint: {
          'line-color': '#3a3a6a',
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 18, 4],
        },
      },
      {
        id: 'buildings-3d',
        type: 'fill-extrusion',
        source: 'protomaps',
        'source-layer': 'buildings',
        minzoom: BUILDING_MIN_ZOOM,
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['coalesce', ['get', 'height'], 0],
            0, '#1e3a5f',
            50, '#0f3460',
            200, '#16213e',
          ],
          'fill-extrusion-height': ['coalesce', ['get', 'height'], 5],
          'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
          'fill-extrusion-opacity': 0.8,
        },
      },
      {
        id: 'place-labels',
        type: 'symbol',
        source: 'protomaps',
        'source-layer': 'places',
        minzoom: 12,
        layout: {
          'text-field': ['coalesce', ['get', 'name:ja'], ['get', 'name']],
          'text-size': 11,
          'text-font': ['Noto Sans Bold'],
        },
        paint: {
          'text-color': 'rgba(0, 255, 0, 0.7)',
          'text-halo-color': 'rgba(0, 0, 0, 0.8)',
          'text-halo-width': 1,
        },
      },
    ],
  }
}

function createDroneMarker() {
  const el = document.createElement('div')
  el.style.cssText = `
    width: 16px;
    height: 16px;
    background: rgba(0,255,0,0.9);
    border: 2px solid rgba(0,255,0,1);
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(0,255,0,0.8);
  `
  return new maplibregl.Marker({ element: el, anchor: 'center' })
}

export function init() {
  if (map) return

  const protocol = new Protocol()
  maplibregl.addProtocol('pmtiles', protocol.tile.bind(protocol))

  map = new maplibregl.Map({
    container: 'RadarMap',
    style: styleWithPmtiles(pmtilesUrl()),
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    pitch: 45,
    bearing: 0,
    antialias: true,
    attributionControl: false,
  })

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')

  droneMarker = createDroneMarker()
  droneMarker.setLngLat(DEFAULT_CENTER).addTo(map)

  map.on('error', (e) => { console.error('[DroneMap] error:', e.error?.message ?? e) })
  map.on('styledata', () => { console.log('[DroneMap] style loaded') })

  // ドラッグ開始でフォロー解除、ダブルクリックで再フォロー
  map.on('dragstart', () => { isFollowing = false })
  map.on('dblclick', () => { isFollowing = true })
}

export function updatePosition(longitude, latitude, heading) {
  if (!map) return

  // マーカー更新
  droneMarker.setLngLat([longitude, latitude])

  // 機首方位をベアリングに反映
  if (heading != null) {
    map.setBearing(heading)
  }

  if (isFollowing) {
    map.easeTo({
      center: [longitude, latitude],
      duration: 500,
      easing: (t) => t,
    })
  }
}

export function destroy() {
  if (map) {
    map.remove()
    map = null
    droneMarker = null
    isFollowing = true
  }
}
