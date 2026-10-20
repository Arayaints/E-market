<template>
  <div class="gis-map-wrapper">
    <!-- Map Header / Overlay Controls -->
    <div class="gis-overlay-header">
      <div class="gis-controls-left">
        <span class="gis-badge">
          <span class="badge-dot" style="background-color: var(--primary);"></span>
          GIS Map: ตลาดกลางชุมชน (Chatuchak Market Area)
        </span>

        <!-- Zone Selector -->
        <select v-model="selectedZoneId" class="gis-select" @change="applyFilters">
          <option value="">ทุกโซน (All Zones)</option>
          <option v-for="z in zones" :key="z.id" :value="z.id">
            {{ z.code }} - {{ z.name }}
          </option>
        </select>

        <!-- Only Available Checkbox -->
        <label class="gis-checkbox-label">
          <input type="checkbox" v-model="onlyAvailable" @change="applyFilters" />
          <span>เฉพาะแผงที่ว่างพร้อมจอง</span>
        </label>
      </div>

      <div class="gis-controls-right">
        <button class="gis-btn" @click="recenterMap" title="กลับสู่จุดศูนย์กลางตลาด" style="display: inline-flex; align-items: center; gap: 6px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/>
          </svg>
          <span>รีเซ็ตมุมมอง</span>
        </button>
        <button class="gis-btn" @click="toggleMapLayer" style="display: inline-flex; align-items: center; gap: 6px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span>{{ currentLayerName === 'street' ? 'โหมดแผนที่ดาวเทียม' : 'โหมดแผนที่ถนน' }}</span>
        </button>
      </div>
    </div>

    <!-- The Leaflet Map Canvas -->
    <div id="gis-map-canvas" class="map-canvas"></div>

    <!-- Selected Stall Drawer / Floating Popup Card -->
    <transition name="slide-up">
      <div v-if="selectedStall" class="gis-stall-card card">
        <div class="gis-card-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="stall-code" style="font-size: 1.35rem; color: var(--primary);">{{ selectedStall.stall_number }}</span>
              <span :class="getStatusBadgeClass(selectedStall.status)">
                {{ getStatusLabel(selectedStall.status) }}
              </span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              โซน {{ selectedStall.zone_code }}: {{ selectedStall.category }}
            </div>
          </div>
          <button class="btn-logout" @click="selectedStall = null" style="font-size: 1.1rem;">✕</button>
        </div>

        <div class="gis-card-body">
          <div class="gis-detail-grid">
            <div>
              <span class="gis-label">ขนาดพื้นที่:</span>
              <strong>{{ selectedStall.size_width }} × {{ selectedStall.size_length }} ม. ({{ selectedStall.area_sqm }} ตร.ม.)</strong>
            </div>
            <div>
              <span class="gis-label">ค่าเช่ารายเดือน:</span>
              <strong style="color: #34d399; font-size: 1.05rem;">฿{{ Number(selectedStall.monthly_rate).toLocaleString() }}</strong>
            </div>
            <div>
              <span class="gis-label">ค่าเช่ารายวัน:</span>
              <strong>฿{{ Number(selectedStall.daily_rate).toLocaleString() }}</strong>
            </div>
            <div>
              <span class="gis-label">พิกัด GIS:</span>
              <span style="font-family: monospace; font-size: 0.78rem;">{{ selectedStall.lat?.toFixed(5) }}, {{ selectedStall.lng?.toFixed(5) }}</span>
            </div>
          </div>

          <div
            v-if="selectedStall.has_active_booking"
            class="gis-booking-alert"
            style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;"
            @click="$emit('viewBooking', selectedStall)"
          >
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>มีคำขอจองเข้าดูแผงนี้อยู่แล้ว (เลขที่: {{ selectedStall.active_booking_number }})</span>
            </span>
            <span style="text-decoration: underline; font-weight: 600; font-size: 0.78rem;">คลิกดู &rarr;</span>
          </div>

          <div class="gis-card-footer">
            <button
              v-if="selectedStall.status === 'available'"
              class="btn btn-primary"
              style="width: 100%; padding: 12px; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 6px;"
              @click="$emit('bookStall', selectedStall)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>กดจองดูแผงนี้ (Book Stall Visit)</span>
            </button>

            <!-- Button to view active booking details -->
            <button
              v-if="selectedStall.has_active_booking"
              class="btn btn-primary"
              style="width: 100%; padding: 11px; font-size: 0.92rem; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 8px;"
              @click="$emit('viewBooking', selectedStall)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <span>ดูรายละเอียดการจอง ({{ selectedStall.active_booking_number }})</span>
            </button>

            <div v-if="selectedStall.status !== 'available' && !selectedStall.has_active_booking" style="text-align: center; font-size: 0.85rem; color: var(--text-dim); padding: 8px;">
              แผงนี้ไม่ว่างสำหรับจอง (สถานะ: {{ getStatusLabel(selectedStall.status) }})
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Map Legend -->
    <div class="gis-legend">
      <div class="legend-title">สัญลักษณ์สถานะแผง (GIS Legend)</div>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-color" style="background-color: #10b981; border: 2px solid #059669;"></span>
          <span>ว่างพร้อมจอง (Available)</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #f59e0b; border: 2px solid #d97706;"></span>
          <span>มีผู้เช่าแล้ว (Occupied)</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #8b5cf6; border: 2px solid #7c3aed;"></span>
          <span>ติดจอง/รออนุมัติ (Pending)</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #f43f5e; border: 2px solid #e11d48;"></span>
          <span>ปิดปรับปรุง (Maintenance)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  zones: any[]
}>()

const emit = defineEmits<{
  (e: 'bookStall', stall: any): void
  (e: 'viewBooking', stall: any): void
}>()

const { get } = useApi()

let L: any = null
let map: any = null
let geoJsonLayer: any = null
let streetLayer: any = null
let satelliteLayer: any = null

const selectedZoneId = ref('')
const onlyAvailable = ref(false)
const currentLayerName = ref<'street' | 'satellite'>('street')
const selectedStall = ref<any>(null)
const geojsonData = ref<any>(null)

const marketCenter = [13.7998, 100.5501] // Bangkok Chatuchak Area

onMounted(async () => {
  if (process.client) {
    L = await import('leaflet')
    await initMap()
    await loadStallsGeoJson()
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})

const initMap = async () => {
  if (!document.getElementById('gis-map-canvas')) return

  // Base Tiles
  streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 20
  })

  satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri World Imagery',
    maxZoom: 19
  })

  map = L.map('gis-map-canvas', {
    center: marketCenter,
    zoom: 18,
    maxZoom: 20,
    minZoom: 15,
    layers: [streetLayer]
  })

  // Add Market Footprint Boundary Polygon
  const marketBounds = [
    [13.8005, 100.5498],
    [13.8005, 100.5508],
    [13.7991, 100.5508],
    [13.7991, 100.5498]
  ]

  L.polygon(marketBounds, {
    color: '#3B82F6',
    weight: 2,
    dashArray: '6, 6',
    fillColor: '#3B82F6',
    fillOpacity: 0.04
  }).addTo(map).bindPopup('ขอบเขตพื้นที่ตลาด e-Market Community Center')
}

const loadStallsGeoJson = async () => {
  try {
    const data = await get('/stalls/gis-geojson')
    geojsonData.value = data
    renderGeoJsonLayer()
  } catch (err) {
    console.error('Failed to load GIS GeoJSON:', err)
  }
}

const getStallColor = (status: string, hasBooking: boolean) => {
  if (hasBooking) return { fill: '#8b5cf6', stroke: '#7c3aed' } // Purple for pending booking
  switch (status) {
    case 'available': return { fill: '#10b981', stroke: '#059669' } // Emerald Green
    case 'occupied': return { fill: '#f59e0b', stroke: '#d97706' } // Amber
    case 'reserved': return { fill: '#8b5cf6', stroke: '#7c3aed' } // Purple
    case 'maintenance': return { fill: '#f43f5e', stroke: '#e11d48' } // Rose Red
    default: return { fill: '#6b7280', stroke: '#4b5563' }
  }
}

const renderGeoJsonLayer = () => {
  if (!map || !L || !geojsonData.value) return

  if (geoJsonLayer) {
    map.removeLayer(geoJsonLayer)
  }

  // Filter features
  let features = geojsonData.value.features || []
  if (selectedZoneId.value) {
    features = features.filter((f: any) => f.properties.zone_id === Number(selectedZoneId.value))
  }
  if (onlyAvailable.value) {
    features = features.filter((f: any) => f.properties.status === 'available')
  }

  const filteredCollection = {
    type: 'FeatureCollection',
    features
  }

  geoJsonLayer = L.geoJSON(filteredCollection, {
    style: (feature: any) => {
      const colors = getStallColor(feature.properties.status, feature.properties.has_active_booking)
      return {
        fillColor: colors.fill,
        weight: 2,
        opacity: 1,
        color: colors.stroke,
        fillOpacity: 0.75
      }
    },
    onEachFeature: (feature: any, layer: any) => {
      const p = feature.properties

      // Interactive tooltip on hover
      layer.bindTooltip(
        `<div style="font-family: 'Bai Jamjuree', sans-serif; font-size: 12px; font-weight: 600;">
          <strong>แผง ${p.stall_number}</strong> (${p.zone_code})<br/>
          <span style="font-size: 11px; color: #475569;">${p.category}</span><br/>
          <span style="color: #059669;">฿${Number(p.monthly_rate).toLocaleString()}/ด.</span>
        </div>`,
        { permanent: false, direction: 'top', className: 'gis-tooltip' }
      )

      // Hover and Click events
      layer.on({
        mouseover: (e: any) => {
          const l = e.target
          l.setStyle({
            weight: 4,
            color: '#ffffff',
            fillOpacity: 0.95
          })
          l.bringToFront()
        },
        mouseout: (e: any) => {
          geoJsonLayer.resetStyle(e.target)
        },
        click: (e: any) => {
          selectedStall.value = p
          map.panTo([p.lat, p.lng])
        }
      })
    }
  }).addTo(map)
}

const applyFilters = () => {
  renderGeoJsonLayer()
}

const recenterMap = () => {
  if (map) {
    map.setView(marketCenter, 18)
  }
}

const toggleMapLayer = () => {
  if (!map) return
  if (currentLayerName.value === 'street') {
    map.removeLayer(streetLayer)
    map.addLayer(satelliteLayer)
    currentLayerName.value = 'satellite'
  } else {
    map.removeLayer(satelliteLayer)
    map.addLayer(streetLayer)
    currentLayerName.value = 'street'
  }
  if (geoJsonLayer) {
    geoJsonLayer.bringToFront()
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'available': return 'badge badge-available'
    case 'occupied': return 'badge badge-occupied'
    case 'reserved': return 'badge badge-reserved'
    case 'maintenance': return 'badge badge-maintenance'
    default: return 'badge'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'available': return 'ว่างพร้อมจอง'
    case 'occupied': return 'มีผู้เช่าแล้ว'
    case 'reserved': return 'ติดจอง'
    case 'maintenance': return 'ปิดปรับปรุง'
    default: return status
  }
}

defineExpose({
  loadStallsGeoJson
})
</script>

<style scoped>
.gis-map-wrapper {
  position: relative;
  width: 100%;
  height: 640px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-lg);
}

.map-canvas {
  width: 100%;
  height: 100%;
  background: #111827;
  z-index: 1;
}

/* Overlay Header Controls */
.gis-overlay-header {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  pointer-events: none;
}

.gis-controls-left, .gis-controls-right {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}

.gis-badge {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0f172a;
  box-shadow: var(--shadow-md);
}

.gis-select {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  color: #0f172a;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  box-shadow: var(--shadow-md);
}

.gis-checkbox-label {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  color: #0f172a;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: var(--shadow-md);
}

.gis-btn {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  color: #334155;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow-md);
}

.gis-btn:hover {
  background: #ffffff;
  border-color: var(--primary);
  color: var(--primary);
}

/* Floating Stall Details Card */
.gis-stall-card {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 380px;
  max-width: calc(100% - 40px);
  z-index: 20;
  background: #ffffff;
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-card);
  box-shadow: var(--shadow-popup);
  padding: 20px;
  border-radius: var(--radius-xl);
  color: #0f172a;
}

.gis-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 10px;
}

.gis-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  font-size: 0.85rem;
  margin-bottom: 14px;
}

.gis-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.gis-booking-alert {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #2563eb;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  margin-bottom: 12px;
}

/* Legend */
.gis-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 0.78rem;
  box-shadow: var(--shadow-md);
  color: #0f172a;
}

.legend-title {
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: inline-block;
}

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
