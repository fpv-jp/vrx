import * as maplibregl from 'maplibre-gl'
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
      openmaptiles: {
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
        id: 'water',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        paint: { 'fill-color': '#1e3a5f' },
      },
      {
        id: 'landuse',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landuse',
        paint: {
          'fill-color': [
            'match',
            ['get', 'class'],
            'residential', '#16213e',
            'commercial', '#1a1a2e',
            'industrial', '#0f3460',
            'grass', '#0d2b1a',
            'park', '#0d2b1a',
            '#1a1a2e',
          ],
        },
      },
      {
        id: 'roads-minor',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['in', 'class', 'minor', 'service', 'track'],
        paint: {
          'line-color': '#2a2a4a',
          'line-width': ['interpolate', ['linear'], ['zoom'], 14, 0.5, 18, 2],
        },
      },
      {
        id: 'roads-major',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['in', 'class', 'primary', 'secondary', 'tertiary', 'trunk', 'motorway'],
        paint: {
          'line-color': '#3a3a6a',
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 18, 4],
        },
      },
      {
        id: 'buildings-3d',
        type: 'fill-extrusion',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: BUILDING_MIN_ZOOM,
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['get', 'render_height'],
            0, '#1e3a5f',
            50, '#0f3460',
            200, '#16213e',
          ],
          'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 5],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
          'fill-extrusion-opacity': 0.8,
        },
      },
      {
        id: 'place-labels',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        minzoom: 12,
        filter: ['in', 'class', 'city', 'town', 'village'],
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
