<template>
  <div class="bma-gis-wrapper card" style="padding: 0; position: relative; overflow: hidden; border-radius: var(--radius-xl);">
    <!-- Map Floating Top Controls (Top-Right): แผนที่ vs ดาวเทียม & ปุ่มศูนย์กลาง กทม. -->
    <div class="map-floating-top-controls">
      <div class="map-floating-style-switcher">
        <button
          type="button"
          class="map-mode-tab"
          :class="{ active: currentMode === 'street' }"
          @click="setMapMode('street')"
          title="มุมมองแผนที่ (Street Map)"
        >
          แผนที่
        </button>
        <button
          type="button"
          class="map-mode-tab"
          :class="{ active: currentMode === 'satellite' }"
          @click="setMapMode('satellite')"
          title="มุมมองภาพถ่ายดาวเทียม (Satellite Imagery)"
        >
          ดาวเทียม
        </button>
      </div>

      <button
        type="button"
        class="map-floating-recenter-btn"
        @click="recenterMap"
        title="กลับสู่ศูนย์กลาง กทม."
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="22" y1="12" x2="18" y2="12"></line>
          <line x1="6" y1="12" x2="2" y2="12"></line>
          <line x1="12" y1="6" x2="12" y2="2"></line>
          <line x1="12" y1="22" x2="12" y2="18"></line>
        </svg>
        <span>ศูนย์กลาง กทม.</span>
      </button>
    </div>

    <!-- MapLibre Map Canvas Container -->
    <div id="bma-markets-map" class="maplibre-container" style="width: 100%; position: relative;"></div>

    <!-- Map Legend Bar -->
    <div class="bma-gis-legend">
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px; font-size: 0.8rem;">สัญลักษณ์แผนที่:</div>
      <div style="display: flex; gap: 14px; font-size: 0.78rem;">
        <span style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 12px; height: 12px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
          <span style="color: #334155;">เปิดรับจองแผง (มีแผงว่าง)</span>
        </span>
        <span style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 12px; height: 12px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
          <span style="color: #334155;">แผงเต็มแล้ว (ลงชื่อสำรอง)</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  markets: any[]
  selectedMarketId?: number | null
}>()

const emit = defineEmits<{
  (e: 'selectMarket', market: any): void
}>()

let maplibregl: any = null
let map: any = null
const markers: any[] = []
const currentMode = ref<'street' | 'satellite'>('street')

// Central Bangkok coordinates in [lng, lat] for MapLibre
const bmaCenter: [number, number] = [100.5250, 13.7563]

// MapLibre Raster Tile Styles
const streetStyle: any = {
  version: 8,
  sources: {
    'osm-street': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxzoom: 19
    }
  },
  layers: [
    {
      id: 'osm-street-layer',
      type: 'raster',
      source: 'osm-street',
      minzoom: 0,
      maxzoom: 19
    }
  ]
}

const satelliteStyle: any = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    'esri-labels': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri'
    }
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 20
    },
    {
      id: 'esri-labels-layer',
      type: 'raster',
      source: 'esri-labels',
      minzoom: 0,
      maxzoom: 20
    }
  ]
}

const { role } = useAuth()
const isOfficer = computed(() => role.value === 'admin' || role.value === 'staff')

onMounted(async () => {
  if (process.client) {
    (window as any).$navigateToMarket = (marketId: number | string, action: 'book' | 'stalls') => {
      if (action === 'book') {
        navigateTo(isOfficer.value ? `/stalls/manage?market=${marketId}` : `/stalls/book?market=${marketId}`)
      } else {
        navigateTo(`/stalls?market=${marketId}`)
      }
    }

    const ml = await import('maplibre-gl')
    maplibregl = ml.default || ml
    initMap()
  }
})

onBeforeUnmount(() => {
  if (map) {
    const mapInstance = map
    map = null
    try {
      mapInstance.remove()
    } catch {}
  }
})

watch(() => props.markets, () => {
  if (map && maplibregl) {
    renderMarkers()
  }
}, { deep: true })

watch(() => props.selectedMarketId, (newId) => {
  if (map && newId && props.markets) {
    const target = props.markets.find(m => m.id === newId)
    if (target && target.lat && target.lng) {
      map.flyTo({
        center: [target.lng, target.lat],
        zoom: 15,
        essential: true,
        duration: 1500
      })
    }
  }
})

const initMap = () => {
  const container = document.getElementById('bma-markets-map')
  if (!container || map || !maplibregl) return

  map = new maplibregl.Map({
    container: 'bma-markets-map',
    style: streetStyle,
    center: bmaCenter,
    zoom: 11,
    minZoom: 9,
    maxZoom: 19
  })

  // Add standard navigation controls (zoom, pitch, compass)
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right')

  map.on('load', () => {
    renderMarkers()
  })
}

const setMapMode = (mode: 'street' | 'satellite') => {
  if (currentMode.value === mode || !map) return
  currentMode.value = mode
  map.setStyle(mode === 'satellite' ? satelliteStyle : streetStyle)
  map.once('style.load', () => {
    renderMarkers()
  })
}

const recenterMap = () => {
  if (map) {
    map.flyTo({
      center: bmaCenter,
      zoom: 11,
      pitch: 0,
      bearing: 0,
      essential: true,
      duration: 1200
    })
  }
}

const renderMarkers = () => {
  if (!map || !maplibregl || !props.markets) return

  // Clear existing markers
  markers.forEach(m => m.remove())
  markers.length = 0

  props.markets.forEach((m) => {
    if (!m.lat || !m.lng) return
    const isAvail = m.status === 'open' && m.available_stalls > 0
    const pinColor = isAvail ? '#10b981' : '#ef4444'
    const pinBg = isAvail ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'

    const el = document.createElement('div')
    el.className = 'custom-maplibre-marker'
    el.style.cursor = 'pointer'
    el.innerHTML = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background: ${pinColor}; color: #ffffff; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; font-family: 'Bai Jamjuree', sans-serif; box-shadow: 0 4px 14px rgba(0,0,0,0.25); white-space: nowrap; border: 2px solid #ffffff; display: flex; align-items: center; gap: 5px; transition: transform 0.2s ease;">
          <span>${m.name}</span>
          <span style="background: rgba(255,255,255,0.25); padding: 1px 6px; border-radius: 10px; font-size: 10px;">${isAvail ? `ว่าง ${m.available_stalls}` : 'เต็ม'}</span>
        </div>
        <div style="width: 14px; height: 14px; background: ${pinColor}; transform: rotate(45deg); margin-top: -6px; border: 2px solid #ffffff; border-top: none; border-left: none;"></div>
        <div style="width: 24px; height: 8px; border-radius: 50%; background: ${pinBg}; filter: blur(2px); margin-top: -2px;"></div>
      </div>
    `

    const popupHtml = `
      <div style="font-family: 'Bai Jamjuree', sans-serif; width: 240px; padding: 4px;">
        <div style="border-radius: 8px; overflow: hidden; height: 110px; margin-bottom: 8px; position: relative;">
          <img src="${m.image_url}" style="width: 100%; height: 100%; object-fit: cover;" alt="${m.name}" />
          <span style="position: absolute; top: 6px; right: 6px; background: ${isAvail ? '#10b981' : '#ef4444'}; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px;">
            ${isAvail ? `ว่าง ${m.available_stalls} แผง` : 'เต็ม'}
          </span>
        </div>
        <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 2px;">${m.name}</strong>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">เขต ${m.district}</div>
        <div style="font-size: 11px; color: #334155; margin-bottom: 10px;">
          ค่าเช่าเริ่มต้น: <strong style="color: #059669;">฿${m.starting_price_daily}/วัน</strong> (฿${Number(m.starting_price_monthly).toLocaleString()}/ด.)
        </div>
        <div style="display: flex; gap: 6px;">
          <button type="button" onclick="window.$navigateToMarket('${m.id}', 'book')" style="flex: 1; text-align: center; background: #4361ee; color: #fff; border: none; padding: 7px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: 'Bai Jamjuree', sans-serif;">
            จองแผง &rarr;
          </button>
          <button type="button" onclick="window.$navigateToMarket('${m.id}', 'stalls')" style="text-align: center; background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; padding: 7px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'Bai Jamjuree', sans-serif;">
            ผังตลาด
          </button>
        </div>
      </div>
    `

    const popup = new maplibregl.Popup({
      offset: 15,
      closeButton: true,
      maxWidth: '280px',
      className: 'bma-maplibre-popup'
    }).setHTML(popupHtml)

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([m.lng, m.lat])
      .setPopup(popup)
      .addTo(map)

    el.addEventListener('click', () => {
      emit('selectMarket', m)
    })

    markers.push(marker)
  })
}
</script>

<style scoped>
.bma-gis-wrapper {
  background: #ffffff;
  border: 1px solid var(--border-card);
}

/* Floating Map Style Switcher & Recenter Controls (inside map - Top Right) */
.map-floating-top-controls {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.map-floating-style-switcher {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 3px;
  border-radius: 9999px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
}

.map-floating-style-switcher .map-mode-tab {
  padding: 6px 16px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.18s ease;
  line-height: 1.2;
}

.map-floating-style-switcher .map-mode-tab:hover {
  color: #1e293b;
}

.map-floating-style-switcher .map-mode-tab.active {
  background: #ffffff;
  color: #2563eb;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.map-floating-recenter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 6px 14px;
  border-radius: 9999px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.18s ease;
  line-height: 1.2;
}

.map-floating-recenter-btn svg {
  color: #2563eb;
}

.map-floating-recenter-btn:hover {
  background: #ffffff;
  color: #1e293b;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.16);
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .map-floating-top-controls {
    top: 10px;
    right: 10px;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

.bma-gis-legend {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  box-shadow: var(--shadow-md);
}

.maplibre-container {
  height: 540px;
}

:deep(.maplibregl-popup-content) {
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  border: 1px solid #e2e8f0;
}

:deep(.maplibregl-popup-close-button) {
  font-size: 16px;
  color: #64748b;
  padding: 4px 8px;
}

@media (max-width: 640px) {
  .bma-gis-overlay {
    position: static;
    padding: 10px 12px;
    background: #ffffff;
    border-bottom: 1px solid var(--border-subtle);
  }
  .bma-gis-controls {
    width: 100%;
    justify-content: space-between;
    margin-top: 4px;
  }
  .gis-ctrl-btn {
    padding: 5px 10px;
    font-size: 0.75rem;
  }
  .gis-mode-tab {
    padding: 4px 8px;
    font-size: 0.75rem;
  }
  .maplibre-container {
    height: 400px !important;
  }
  .bma-gis-legend {
    position: static;
    margin: 10px 12px;
    font-size: 0.72rem;
  }
}
</style>
