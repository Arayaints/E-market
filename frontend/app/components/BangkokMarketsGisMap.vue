<template>
  <div class="bma-gis-wrapper card" style="padding: 0; position: relative; overflow: hidden; border-radius: var(--radius-xl);">
    <!-- Map Header Overlay Controls -->
    <div class="bma-gis-overlay">
      <div class="bma-gis-badge">
        <span class="badge-dot" style="background-color: var(--primary);"></span>
        <span>แผนที่ GIS 12 ตลาดในสังกัดกรุงเทพมหานคร</span>
      </div>

      <div class="bma-gis-controls">
        <button class="gis-ctrl-btn" @click="recenterMap" title="กลับสู่ศูนย์กลาง กทม." style="display: inline-flex; align-items: center; gap: 5px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/>
          </svg>
          <span>ศูนย์กลาง กทม.</span>
        </button>
        <button class="gis-ctrl-btn" @click="toggleLayer" style="display: inline-flex; align-items: center; gap: 5px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span>{{ isSatellite ? 'โหมดแผนที่ถนน' : 'โหมดดาวเทียม' }}</span>
        </button>
      </div>
    </div>

    <!-- Leaflet Map Container -->
    <div id="bma-markets-map" style="height: 520px; width: 100%; z-index: 1;"></div>

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

let L: any = null
let map: any = null
let streetLayer: any = null
let satelliteLayer: any = null
let markersGroup: any = null
const isSatellite = ref(false)

const bmaCenter = [13.7563, 100.5250] // Central Bangkok

onMounted(async () => {
  if (process.client) {
    L = await import('leaflet')
    initMap()
    renderMarkers()
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})

watch(() => props.markets, () => {
  if (map && L) {
    renderMarkers()
  }
}, { deep: true })

watch(() => props.selectedMarketId, (newId) => {
  if (map && newId && props.markets) {
    const target = props.markets.find(m => m.id === newId)
    if (target) {
      map.flyTo([target.lat, target.lng], 14, { duration: 1.2 })
    }
  }
})

const initMap = () => {
  const container = document.getElementById('bma-markets-map')
  if (!container || map) return

  streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 19
  })

  satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri World Imagery',
    maxZoom: 19
  })

  map = L.map('bma-markets-map', {
    center: bmaCenter,
    zoom: 11,
    minZoom: 10,
    maxZoom: 18,
    layers: [streetLayer]
  })
}

const toggleLayer = () => {
  if (!map) return
  isSatellite.value = !isSatellite.value
  if (isSatellite.value) {
    map.removeLayer(streetLayer)
    map.addLayer(satelliteLayer)
  } else {
    map.removeLayer(satelliteLayer)
    map.addLayer(streetLayer)
  }
}

const recenterMap = () => {
  if (map) {
    map.flyTo(bmaCenter, 11, { duration: 1 })
  }
}

const renderMarkers = () => {
  if (!map || !L) return

  if (markersGroup) {
    map.removeLayer(markersGroup)
  }

  markersGroup = L.featureGroup()

  props.markets.forEach((m) => {
    const isAvail = m.status === 'open' && m.available_stalls > 0
    const pinColor = isAvail ? '#10b981' : '#ef4444'
    const pinBg = isAvail ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'

    const customIcon = L.divIcon({
      className: 'custom-bma-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="background: ${pinColor}; color: #ffffff; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; font-family: 'Bai Jamjuree', sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.18); white-space: nowrap; border: 2px solid #ffffff; display: flex; align-items: center; gap: 4px;">
            <span>${m.name}</span>
            <span style="background: rgba(255,255,255,0.25); padding: 1px 6px; border-radius: 10px; font-size: 10px;">${isAvail ? `ว่าง ${m.available_stalls}` : 'เต็ม'}</span>
          </div>
          <div style="width: 14px; height: 14px; background: ${pinColor}; transform: rotate(45deg); margin-top: -6px; border: 2px solid #ffffff; border-top: none; border-left: none;"></div>
          <div style="width: 24px; height: 8px; border-radius: 50%; background: ${pinBg}; filter: blur(2px); margin-top: -2px;"></div>
        </div>
      `,
      iconSize: [0, 0]
    })

    const marker = L.marker([m.lat, m.lng], { icon: customIcon })

    // Popup content
    const popupContent = `
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
          ค่าเช่าเริ่มต้น: <strong style="color: #059669;">฿${m.starting_price_daily}/วัน</strong> (฿${m.starting_price_monthly.toLocaleString()}/ด.)
        </div>
        <div style="display: flex; gap: 6px;">
          <a href="/stalls/book?market=${m.id}" style="flex: 1; text-align: center; background: #4361ee; color: #fff; text-decoration: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">
            จองแผง ➔
          </a>
          <a href="/stalls?market=${m.id}" style="text-align: center; background: #f1f5f9; color: #334155; text-decoration: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;">
            ผังตลาด
          </a>
        </div>
      </div>
    `

    marker.bindPopup(popupContent, { maxWidth: 280, className: 'bma-market-popup' })

    marker.on('click', () => {
      emit('selectMarket', m)
    })

    markersGroup.addLayer(marker)
  })

  markersGroup.addTo(map)
}
</script>

<style scoped>
.bma-gis-wrapper {
  background: #ffffff;
  border: 1px solid var(--border-card);
}

.bma-gis-overlay {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  flex-wrap: wrap;
  gap: 10px;
}

.bma-gis-badge {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
}

.bma-gis-controls {
  display: flex;
  gap: 8px;
  pointer-events: auto;
}

.gis-ctrl-btn {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  color: #334155;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: var(--transition);
}

.gis-ctrl-btn:hover {
  background: #ffffff;
  color: var(--primary);
  border-color: var(--primary);
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
</style>
