<template>
  <div class="projects-master-container" :class="{ 'is-preview-mode': previewMode }">
    <!-- Top Interactive Filter & Quick Search Bar -->
    <div v-if="!previewMode" class="master-map-top-bar">
      <div class="master-map-tools-left">
        <!-- Category Dropdown Filter -->
        <div class="map-category-select-wrapper">
          <select
            :value="categoryFilter || ''"
            @change="handleCategorySelect"
            class="map-category-select"
            aria-label="กรองหมวดหมู่สินค้า"
          >
            <option value="">หมวดหมู่ทั้งหมด ({{ projects.length }} โครงการ)</option>
            <option v-for="cat in categoryStats" :key="cat.name" :value="cat.name">
              {{ cat.name }} ({{ cat.projectCount }} โครงการ)
            </option>
          </select>
          <span class="category-select-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        </div>
      </div>

      <!-- Search Input with Clear Button -->
      <div class="search-input-group">
        <span class="search-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาโครงการหรือหมวดหมู่สินค้า..."
          class="map-search-input"
          @input="handleSearchInput"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="clear-search-btn"
          @click="clearSearch"
          aria-label="ล้างคำค้นหา"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>

    <!-- Preview Mode Top Bar (สำหรับขั้นตอนตรวจสอบยืนยันข้อมูล) -->
    <div v-else class="master-map-top-bar preview-top-bar">
      <div class="master-map-tools-left" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <!-- Clickable Booked Stalls Button / Pill -->
        <button
          type="button"
          class="preview-booked-pill-btn"
          :class="{ 'is-active': activeProjectId === bookedProjectId }"
          @click="focusBookedStalls"
          title="คลิกเพื่อซูมกลับไปยังแผงที่คุณเลือกจองทันที"
        >
          <span class="preview-info-dot" :style="{ backgroundColor: bookedProject?.color || '#2563eb' }"></span>
          <strong style="color: #0f172a; font-size: 0.88rem;">{{ bookedProject?.name || 'โครงการที่เลือก' }}</strong>
          <span class="preview-badge-stalls">
            ล็อคที่คุณเลือกจอง {{ selectedStallCodes.length }} แผง ({{ selectedStallCodes.join(', ') }})
          </span>
          <span v-if="isNotViewingBookedProject" class="return-hint-tag">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px;">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            คลิกเพื่อกลับมาดู
          </span>
        </button>

        <span v-if="activeProjectId && isNotViewingBookedProject" class="viewing-other-badge" style="font-size: 0.78rem; color: #475569; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px;">
          <span>กำลังดู:</span>
          <strong style="color: #0f172a;">{{ activeProject?.name }}</strong>
        </span>
      </div>

      <div class="preview-legend-row">
        <div class="preview-leg-item"><span class="leg-dot is-selected"></span><span>แผงที่คุณเลือก ({{ selectedStallCodes.length }})</span></div>
        <div class="preview-leg-item"><span class="leg-dot is-available"></span><span>แผงว่าง</span></div>
        <div class="preview-leg-item"><span class="leg-dot is-reserved"></span><span>ติดจอง</span></div>
      </div>
    </div>

    <!-- MapLibre GL JS Interactive Map Container -->
    <div class="maplibre-overview-wrapper" :style="previewMode ? { height: '390px' } : {}">
      <div :id="containerId" class="maplibre-overview-canvas"></div>

      <!-- Floating Map Top Controls: แผนที่ vs ดาวเทียม & ปุ่มปรับกึ่งกลาง (มุมซ้ายบน) -->
      <div class="map-floating-top-controls">
        <div class="map-floating-style-switcher">
          <button
            type="button"
            class="map-mode-tab"
            :class="{ active: currentStyle === 'standard' }"
            @click="setMapStyle('standard')"
            title="มุมมองแผนที่ (Street Map)"
          >
            แผนที่
          </button>
          <button
            type="button"
            class="map-mode-tab"
            :class="{ active: currentStyle === 'satellite' }"
            @click="setMapStyle('satellite')"
            title="มุมมองภาพถ่ายดาวเทียม (Satellite Imagery)"
          >
            ดาวเทียม
          </button>
        </div>

        <button
          type="button"
          class="map-floating-recenter-btn"
          @click="recenterMapView"
          title="ปรับมุมมองกลับสู่กึ่งกลาง"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="22" y1="12" x2="18" y2="12"></line>
            <line x1="6" y1="12" x2="2" y2="12"></line>
            <line x1="12" y1="6" x2="12" y2="2"></line>
            <line x1="12" y1="22" x2="12" y2="18"></line>
          </svg>
          <span>ปรับกึ่งกลาง</span>
        </button>
      </div>

      <!-- Floating Return to Booked Stalls Button (แสดงเมื่อคลิกดูโครงการอื่นใน Step 3) -->
      <transition name="fade">
        <button
          v-if="previewMode && isNotViewingBookedProject"
          type="button"
          class="map-floating-return-btn"
          @click="focusBookedStalls"
          title="คลิกเพื่อกลับไปยังตำแหน่งแผงที่คุณเลือกทันที"
        >
          <span class="pulse-indicator-dot"></span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span style="font-weight: 700;">กลับไปยังแผงที่คุณเลือก ({{ bookedProject?.name || 'โครงการที่เลือก' }})</span>
          <span class="floating-stall-codes-badge">{{ selectedStallCodes.join(', ') }}</span>
        </button>
      </transition>

      <!-- Overlay slot: ให้หน้าจองวาง drawer แผงที่เลือกทับบนแผนที่ -->
      <slot name="overlay" :activeProject="activeProject" />

      <!-- Drill-down Panel: แสดงเมื่อคลิกเข้าโครงการ (แผงย่อยวาดอยู่ในกรอบบนแผนที่) -->
      <transition name="smp-slide">
        <aside v-if="!previewMode && activeProject && activeLayout" class="stall-mode-panel" aria-label="รายละเอียดโครงการ">
          <button id="btn-back-overview" type="button" class="smp-back-btn" @click="exitProject">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span>กลับผังรวม 30 โครงการ</span>
          </button>

          <div class="smp-title-row">
            <span class="smp-dot" :style="{ backgroundColor: activeProject.color }"></span>
            <h3 class="smp-title">{{ activeProject.name }}</h3>
          </div>
          <div class="smp-category">{{ activeProject.category }}</div>

          <div class="smp-area-box">
            <div class="smp-area-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              <span>พื้นที่ในกรอบโครงการ</span>
            </div>
            <div class="smp-area-value">{{ activeProject.realAreaSqm.toLocaleString() }} <span>ตร.ม.</span></div>
          </div>

          <div class="smp-stats">
            <div class="smp-stat">
              <span class="smp-stat-label">แผงทั้งหมด</span>
              <strong>{{ activeLayout.total }}</strong>
            </div>
            <div class="smp-stat is-available">
              <span class="smp-stat-label">ว่าง</span>
              <strong>{{ activeLayout.available }}</strong>
            </div>
            <div class="smp-stat is-reserved">
              <span class="smp-stat-label">ติดจอง</span>
              <strong>{{ activeLayout.reserved }}</strong>
            </div>
            <div class="smp-stat is-occupied">
              <span class="smp-stat-label">มีผู้เช่า</span>
              <strong>{{ activeLayout.occupied }}</strong>
            </div>
          </div>

          <div class="smp-legend">
            <div><span class="smp-sw sw-available"></span>ว่าง</div>
            <div><span class="smp-sw sw-reserved"></span>ติดจอง (Waiting List)</div>
            <div><span class="smp-sw sw-occupied"></span>มีผู้เช่าแล้ว</div>
            <div><span class="smp-sw sw-selected"></span>แผงที่คุณเลือก</div>
          </div>

          <div class="smp-hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span>แผงละ 2.5 × 2 ม. (5 ตร.ม.) — คลิกแผงสีเขียวหรือสีเหลืองบนแผนที่เพื่อเลือก</span>
          </div>
        </aside>
      </transition>

      <!-- Quick Map Hint Overlay -->
      <div v-if="!activeProject" class="map-hint-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <span>คลิกในกรอบโครงการเพื่อดูแผงย่อยและเลือกจอง</span>
      </div>
    </div>

    <!-- Color Legend (read-only): สีไหนคือโครงการอะไร -->
    <section class="color-legend-panel" aria-label="คำอธิบายสีโครงการ">
      <div class="color-legend-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="13.5" cy="6.5" r="1.5"></circle><circle cx="17.5" cy="10.5" r="1.5"></circle><circle cx="8.5" cy="7.5" r="1.5"></circle><circle cx="6.5" cy="12.5" r="1.5"></circle>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.75 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"></path>
        </svg>
        <span class="color-legend-title">คำอธิบายสีโครงการ</span>
        <span class="color-legend-sub">ทั้งหมด {{ projects.length }} โครงการ</span>
      </div>

      <ul class="color-legend-grid">
        <li v-for="cat in categoryStats" :key="cat.name" class="color-legend-item">
          <span class="color-legend-swatch" :style="{ backgroundColor: cat.color, borderColor: cat.color }"></span>
          <div class="color-legend-text">
            <span class="color-legend-name">{{ cat.name }}</span>
            <span class="color-legend-projects">โครงการ {{ cat.projectNumbers.join(', ') }}</span>
          </div>
        </li>
        <li class="color-legend-item">
          <span class="color-legend-swatch" style="background-color:#94a3b8;border-color:#64748b"></span>
          <div class="color-legend-text">
            <span class="color-legend-name">โครงการที่แผงเต็มแล้ว</span>
            <span class="color-legend-projects">ไม่มีแผงว่างให้จอง</span>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { CHATUCHAK_PROJECTS, type ProjectZone } from './chatuchak_real_polygons'
import { getProjectStallLayout, type MapStall } from './chatuchak_stall_layout'

export type { ProjectZone }

const props = withDefaults(defineProps<{
  containerId?: string
  selectedProjectId?: string
  selectedStallCodes?: string[]
  onlyAvailable?: boolean
  categoryFilter?: string | null
  mapStyle?: 'standard' | 'dark' | 'satellite'
  previewMode?: boolean
}>(), {
  containerId: 'step1-projects-maplibre',
  selectedProjectId: undefined,
  selectedStallCodes: () => [],
  onlyAvailable: false,
  categoryFilter: null,
  mapStyle: 'standard',
  previewMode: false
})

const emit = defineEmits<{
  (e: 'selectProject', project: ProjectZone): void
  (e: 'selectStall', stall: Omit<MapStall, 'coordinates' | 'center'>): void
  (e: 'exitProject'): void
  (e: 'update:categoryFilter', cat: string | null): void
  (e: 'update:mapStyle', style: 'standard' | 'satellite'): void
  (e: 'update:onlyAvailable', val: boolean): void
}>()

// Active Map Style Mode ('standard' = Street, 'satellite' = Imagery)
const currentStyle = ref<'standard' | 'satellite'>(props.mapStyle === 'satellite' ? 'satellite' : 'standard')

const setMapStyle = (mode: 'standard' | 'satellite') => {
  if (currentStyle.value === mode) return
  currentStyle.value = mode
  emit('update:mapStyle', mode)
  if (!map) return

  map.setStyle(getStyleConfig(mode))

  map.once('styledata', () => {
    setupProjectLayers()
    refreshSources()
  })
}

// Live search state
const searchQuery = ref('')

// 9 Categories matching official layout
const categories = [
  { name: 'ของเก่าของสะสม เครื่องประดับ เครื่องดนตรีไทย หนังสือ', color: '#e06456' },
  { name: 'งานศิลปะและภาพวาด', color: '#f48fb1' },
  { name: 'โปสการ์ด ของชำร่วย อุปกรณ์สำหรับสัตว์', color: '#e87a4d' },
  { name: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7' },
  { name: 'เครื่องประดับและของแต่งบ้านโบราณ ผ้าไหม กรอบรูป', color: '#7e8ee8' },
  { name: 'เสื้อผ้า อุปกรณ์เดินป่า เครื่องหนัง', color: '#ab77c8' },
  { name: 'อุปกรณ์โต๊ะอาหาร เซรามิก เบญจรงค์ เครื่องเงิน ของตกแต่งบ้าน', color: '#52b788' },
  { name: 'เซรามิก ผ้าไหม', color: '#b5a839' },
  { name: 'งานแกะสลักไม้ สปา เครื่องหอม', color: '#f2c94c' }
]

// 30 Projects: real GIS polygon + sub-stall layout generated INSIDE each polygon.
// Stall counts (ทั้งหมด/ว่าง) derive from the generated layout so every number on screen is consistent.
const layouts = new Map(CHATUCHAK_PROJECTS.map(p => [p.id, getProjectStallLayout(p)]))
const projects: ProjectZone[] = CHATUCHAK_PROJECTS.map(p => {
  const l = layouts.get(p.id)!
  return { ...p, totalStalls: l.total, stallsAvailable: l.available }
})

// Category legend (read-only): สี → หมวดหมู่ → เลขโครงการ
const categoryStats = computed(() => {
  return categories
    .map(cat => {
      const projs = projects.filter(p => p.category === cat.name)
      return {
        ...cat,
        projectCount: projs.length,
        projectNumbers: projs.map(p => p.sectionNumber)
      }
    })
    .filter(cat => cat.projectCount > 0)
})

// ---------------- Project drill-down state ----------------
const hoveredProject = ref<ProjectZone | null>(null)
const activeProjectId = ref<string | null>(null)

// จำโครงการที่แผงถูกเลือกไว้ (สำหรับปุ่มกลับมาดูแผงตัวเองใน Step 3)
const initialBookedProjectId = ref<string | null>(props.selectedProjectId || null)
watch(() => props.selectedProjectId, (newId) => {
  if (newId) initialBookedProjectId.value = newId
}, { immediate: true })

const bookedProjectId = computed(() => initialBookedProjectId.value || props.selectedProjectId || null)
const bookedProject = computed(() => {
  const id = bookedProjectId.value
  return (id ? projects.find(p => p.id === id) : null) || activeProject.value
})

const isNotViewingBookedProject = computed(() => {
  if (!props.previewMode) return false
  const targetId = bookedProjectId.value
  if (!targetId) return false
  return activeProjectId.value !== targetId
})

const activeProject = computed(() => projects.find(p => p.id === activeProjectId.value) || null)
const activeLayout = computed(() => (activeProjectId.value ? layouts.get(activeProjectId.value) || null : null))

const currentProjectInfo = computed<ProjectZone | null>(() => {
  return activeProject.value || hoveredProject.value || projects.find(p => p.id === 'proj-01') || projects[0] || null
})

const currentProjectLayout = computed(() => (currentProjectInfo.value ? layouts.get(currentProjectInfo.value.id) || null : null))

// ================================================================
// MAPLIBRE GL JS ENGINE IMPLEMENTATION
// ================================================================
let maplibregl: any = null
let map: any = null
let projectMarkers: any[] = []
let hoverPopup: any = null

// Chatuchak Market Real Geo Center: Kamphaeng Phet 2 Rd, Chatuchak, Bangkok
const CHATUCHAK_LNG = 100.5501
const CHATUCHAK_LAT = 13.7998
const OVERVIEW_ZOOM = 16.5

// Interior label point (inside the polygon frame, not the vertex average)
const projectToLngLat = (p: ProjectZone): [number, number] => layouts.get(p.id)?.labelPoint || p.centroid

const getProjectBounds = (p: ProjectZone): [[number, number], [number, number]] => {
  const lngs = p.coordinates.map(c => c[0])
  const lats = p.coordinates.map(c => c[1])
  return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]]
}

const getStallsBounds = (stalls: MapStall[]): [[number, number], [number, number]] | null => {
  if (stalls.length === 0) return null
  const allCoords = stalls.flatMap(s => s.coordinates)
  const lngs = allCoords.map(c => c[0])
  const lats = allCoords.map(c => c[1])
  const minLng = Math.min(...lngs)
  const minLat = Math.min(...lats)
  const maxLng = Math.max(...lngs)
  const maxLat = Math.max(...lats)
  const pad = 0.00008
  return [[minLng - pad, minLat - pad], [maxLng + pad, maxLat + pad]]
}

// 3 Real Tile Styles (Watermark-free, zero API key required)
const standardStyle: any = {
  version: 8,
  sources: {
    'osm-street': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
      maxzoom: 19
    }
  },
  layers: [
    {
      id: 'osm-street-layer',
      type: 'raster',
      source: 'osm-street',
      minzoom: 0,
      maxzoom: 22
    }
  ]
}

const darkStyle: any = {
  version: 8,
  sources: {
    'esri-dark': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri',
      maxzoom: 16
    },
    'esri-dark-labels': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri',
      maxzoom: 16
    }
  },
  layers: [
    {
      id: 'esri-dark-layer',
      type: 'raster',
      source: 'esri-dark',
      minzoom: 0,
      maxzoom: 22
    },
    {
      id: 'esri-dark-labels-layer',
      type: 'raster',
      source: 'esri-dark-labels',
      minzoom: 0,
      maxzoom: 22
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
      attribution: 'Tiles &copy; Esri',
      maxzoom: 19
    },
    'esri-labels': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri',
      maxzoom: 19
    }
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 22
    },
    {
      id: 'esri-labels-layer',
      type: 'raster',
      source: 'esri-labels',
      minzoom: 0,
      maxzoom: 22
    }
  ]
}

const getStyleConfig = (styleName?: string) => {
  if (styleName === 'satellite') return satelliteStyle
  if (styleName === 'dark') return darkStyle
  return standardStyle
}

// ---------------- 3D Buildings (MapLibre "Display buildings in 3D") ----------------
// ใช้ vector tiles ของ OpenFreeMap (OpenMapTiles schema, ไม่ต้องใช้ API key)
const BUILDINGS_SOURCE_ID = 'openfreemap'
const BUILDINGS_LAYER_ID = '3d-buildings'
const DEFAULT_PITCH = 50
const DEFAULT_BEARING = -17
const DRILL_PITCH = 40
const BUILDINGS_OPACITY = 0.85
const BUILDINGS_OPACITY_DRILL = 0.25

const getBuildingColorExpr = (styleName?: string): any => {
  if (styleName === 'dark') {
    return ['interpolate', ['linear'], ['get', 'render_height'], 0, '#334155', 60, '#475569', 200, '#64748b']
  }
  if (styleName === 'satellite') {
    return ['interpolate', ['linear'], ['get', 'render_height'], 0, '#e2e8f0', 60, '#cbd5e1', 200, '#94a3b8']
  }
  return ['interpolate', ['linear'], ['get', 'render_height'], 0, '#d6dce5', 40, '#a5b4fc', 120, '#6366f1', 300, '#93c5fd']
}

const add3DBuildings = () => {
  if (!map) return
  try {
    if (map.getLayer(BUILDINGS_LAYER_ID)) map.removeLayer(BUILDINGS_LAYER_ID)
    if (currentStyle.value === 'satellite') return
    if (!map.getSource(BUILDINGS_SOURCE_ID)) {
      map.addSource(BUILDINGS_SOURCE_ID, {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
        attribution: '&copy; OpenFreeMap &copy; OpenMapTiles'
      })
    }
    // วางอาคาร 3D ไว้ใต้กรอบโครงการ
    const beforeId = map.getLayer('projects-fill') ? 'projects-fill' : undefined
    map.addLayer({
      id: BUILDINGS_LAYER_ID,
      source: BUILDINGS_SOURCE_ID,
      'source-layer': 'building',
      type: 'fill-extrusion',
      minzoom: 15,
      filter: ['!=', ['get', 'hide_3d'], true],
      paint: {
        'fill-extrusion-color': getBuildingColorExpr(props.mapStyle),
        'fill-extrusion-height': [
          'interpolate', ['linear'], ['zoom'],
          15, 0,
          16, ['coalesce', ['get', 'render_height'], 4]
        ],
        'fill-extrusion-base': [
          'interpolate', ['linear'], ['zoom'],
          15, 0,
          16, ['coalesce', ['get', 'render_min_height'], 0]
        ],
        'fill-extrusion-opacity': activeProjectId.value ? BUILDINGS_OPACITY_DRILL : BUILDINGS_OPACITY
      }
    }, beforeId)
  } catch (err) {
    console.warn('[map] 3D buildings layer failed:', err)
  }
}

const setBuildingsOpacity = (value: number) => {
  if (map?.getLayer(BUILDINGS_LAYER_ID)) {
    map.setPaintProperty(BUILDINGS_LAYER_ID, 'fill-extrusion-opacity', value)
  }
}

const initMap = () => {
  const container = document.getElementById(props.containerId)
  if (!container || map || !maplibregl) return

  map = new maplibregl.Map({
    container: props.containerId,
    style: getStyleConfig(currentStyle.value),
    center: [CHATUCHAK_LNG, CHATUCHAK_LAT],
    zoom: props.previewMode ? 18.5 : OVERVIEW_ZOOM,
    minZoom: 14.5,
    maxZoom: 21,
    maxPitch: 65,
    pitch: props.previewMode ? 35 : DEFAULT_PITCH,
    bearing: DEFAULT_BEARING,
    canvasContextAttributes: { antialias: true }
  })

  // Standard Navigation Controls (Zoom, Compass)
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right')

  hoverPopup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 8,
    maxWidth: '320px',
    className: 'mlp-popup'
  })

  map.on('load', () => {
    setupProjectLayers()
    bindMapEvents()
    if (props.selectedProjectId) {
      const found = projects.find(p => p.id === props.selectedProjectId)
      if (found) {
        enterProject(found)
      }
    }
    renderSelectedStallPins()
  })
}

// ---------------- GeoJSON builders ----------------
const isProjectDimmed = (p: ProjectZone) => {
  const isFull = p.stallsAvailable === 0
  const byFilter = (props.categoryFilter && p.category !== props.categoryFilter) ||
    (searchQuery.value.trim() && !matchesSearch(p))
  return Boolean(byFilter || (props.onlyAvailable && isFull))
}

const getProjectsGeoJson = () => {
  return {
    type: 'FeatureCollection',
    features: projects.map((p, index) => {
      const isFull = p.stallsAvailable === 0
      const isActive = activeProjectId.value === p.id
      const isOtherWhileActive = Boolean(activeProjectId.value) && !isActive

      let fillColor = p.color
      let strokeColor = p.color
      if (isFull) {
        fillColor = '#94a3b8'
        strokeColor = '#64748b'
      }

      return {
        type: 'Feature',
        id: index + 1,
        geometry: {
          type: 'Polygon',
          coordinates: [p.coordinates]
        },
        properties: {
          id: p.id,
          fillColor,
          strokeColor: isActive ? '#1d4ed8' : strokeColor,
          isActive,
          isDimmed: isProjectDimmed(p) || isOtherWhileActive
        }
      }
    })
  }
}

const getStallsGeoJson = () => {
  const layout = activeLayout.value
  const selected = new Set(props.selectedStallCodes || [])
  return {
    type: 'FeatureCollection',
    features: (layout?.stalls || []).map((s, idx) => {
      const isSelected = selected.has(s.code)
      return {
        type: 'Feature',
        id: idx + 1,
        geometry: { type: 'Polygon', coordinates: [s.coordinates] },
        properties: {
          code: s.code,
          status: s.status,
          isSelected,
          // จางเฉพาะเมื่อเปิดตัวกรองเฉพาะแผงว่าง (ไม่ทำให้แผงอื่นจางเมื่อมีการเลือกแผง)
          isDimmed: props.onlyAvailable && s.status !== 'available'
        }
      }
    })
  }
}

// ---------------- Layers ----------------
const setupProjectLayers = () => {
  if (!map) return

  ;['stalls-selected-stroke', 'stalls-line', 'stalls-casing', 'stalls-fill', 'projects-stroke', 'projects-casing', 'projects-fill'].forEach(id => {
    if (map.getLayer(id)) map.removeLayer(id)
  })
  ;['projects-polygons', 'project-stalls'].forEach(id => {
    if (map.getSource(id)) map.removeSource(id)
  })

  map.addSource('projects-polygons', { type: 'geojson', data: getProjectsGeoJson() })
  map.addSource('project-stalls', { type: 'geojson', data: getStallsGeoJson() })

  // กรอบพื้นที่โครงการ (Fill)
  map.addLayer({
    id: 'projects-fill',
    type: 'fill',
    source: 'projects-polygons',
    paint: {
      'fill-color': ['get', 'fillColor'],
      'fill-opacity': [
        'case',
        ['boolean', ['get', 'isActive'], false], 0.14,
        ['boolean', ['get', 'isDimmed'], false], 0.1,
        0.42
      ]
    }
  })

  // ขอบขาวรองใต้เส้นกรอบ ให้คมชัดบนแผนที่ถนน
  map.addLayer({
    id: 'projects-casing',
    type: 'line',
    source: 'projects-polygons',
    layout: { 'line-join': 'round' },
    paint: {
      'line-color': '#ffffff',
      'line-width': ['case', ['boolean', ['get', 'isActive'], false], 8, 5],
      'line-opacity': ['case', ['boolean', ['get', 'isDimmed'], false], 0.3, 0.95]
    }
  })

  // เส้นกรอบโครงการ
  map.addLayer({
    id: 'projects-stroke',
    type: 'line',
    source: 'projects-polygons',
    layout: { 'line-join': 'round' },
    paint: {
      'line-color': ['get', 'strokeColor'],
      'line-width': ['case', ['boolean', ['get', 'isActive'], false], 4.5, 2.5],
      'line-opacity': ['case', ['boolean', ['get', 'isDimmed'], false], 0.3, 1]
    }
  })

  // แผงย่อยภายในโครงการ (เน้นแผงที่เลือกให้เข้มเด่น แผงอื่นจางลง)
  map.addLayer({
    id: 'stalls-fill',
    type: 'fill',
    source: 'project-stalls',
    paint: {
      'fill-color': [
        'case',
        ['boolean', ['get', 'isSelected'], false], '#2563eb',
        ['boolean', ['get', 'isDimmed'], false], [
          'case',
          ['==', ['get', 'status'], 'available'], '#86efac',
          ['==', ['get', 'status'], 'reserved'], '#fed7aa',
          '#f1f5f9'
        ],
        ['==', ['get', 'status'], 'available'], '#10b981',
        ['==', ['get', 'status'], 'reserved'], '#f59e0b',
        '#cbd5e1'
      ],
      'fill-opacity': [
        'case',
        ['boolean', ['get', 'isSelected'], false], 1,
        ['boolean', ['get', 'isDimmed'], false], 0.22,
        ['==', ['get', 'status'], 'occupied'], 0.85,
        1
      ],
      'fill-outline-color': '#ffffff'
    }
  })

  // เส้นแบ่งล็อคแผงสถาปัตยกรรมสีขาวสะอาดตา คมชัดระดับพรีเมียม (Clean White Architectural Partitions)
  map.addLayer({
    id: 'stalls-line',
    type: 'line',
    source: 'project-stalls',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#ffffff',
      'line-width': [
        'interpolate', ['linear'], ['zoom'],
        14, 0.8,
        16, 1.4,
        18, 2.0,
        20, 2.8
      ],
      'line-opacity': [
        'case',
        ['boolean', ['get', 'isDimmed'], false], 0.45,
        1
      ]
    }
  })

  // เส้นขอบแผงที่ถูกเลือก (Selected Stall Stroke) - สีน้ำเงินสดเด่นชัด
  map.addLayer({
    id: 'stalls-selected-stroke',
    type: 'line',
    source: 'project-stalls',
    filter: ['boolean', ['get', 'isSelected'], false],
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#1d4ed8',
      'line-width': [
        'interpolate', ['linear'], ['zoom'],
        14, 2.2,
        16, 3.2,
        18, 4.4,
        20, 5.8
      ],
      'line-opacity': 1
    }
  })

  // อาคาร 3D (แทรกใต้ projects-fill)
  add3DBuildings()

  renderZoneLabels()
}

const refreshSources = () => {
  if (!map) return
  map.getSource('projects-polygons')?.setData(getProjectsGeoJson())
  map.getSource('project-stalls')?.setData(getStallsGeoJson())
  renderZoneLabels()
}

// ---------------- Popups ----------------
const statusMeta: Record<string, { label: string; bg: string; fg: string }> = {
  available: { label: 'ว่าง', bg: '#dcfce7', fg: '#15803d' },
  reserved: { label: 'ติดจอง', bg: '#fef3c7', fg: '#d97706' },
  occupied: { label: 'มีผู้เช่าแล้ว', bg: '#f1f5f9', fg: '#64748b' }
}

const ICONS = {
  area: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18M9 21V9"></path></svg>',
  grid: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
  ruler: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"></path><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"></path></svg>',
  tag: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.59-8.59a1 1 0 0 0 0-1.41Z"></path><circle cx="7" cy="7" r="1.5"></circle></svg>',
  wallet: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>',
  key: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"></circle><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"></path></svg>',
  arrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>',
  lock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
  clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
}

// Calculate deterministic waiting queue count (e.g. 1 or 2 queues in line)
const getStallQueueCount = (code: string): number => {
  let hash = 0
  for (let i = 0; i < code.length; i++) hash = ((hash << 5) - hash) + code.charCodeAt(i)
  return (Math.abs(hash) % 3 === 0 ? 2 : 1)
}

const showPopupForProject = (p: ProjectZone, lngLat: [number, number]) => {
  const layout = layouts.get(p.id)
  const total = layout?.total ?? 0
  const available = layout?.available ?? 0
  const reserved = layout?.reserved ?? 0
  const occupied = Math.max(total - available - reserved, 0)
  const pct = (n: number) => (total ? (n / total) * 100 : 0)
  const isFull = available === 0
  const accent = isFull ? '#94a3b8' : p.color

  hoverPopup.setLngLat(lngLat).setHTML(`
    <div class="mlp" style="--mlp-accent:${accent}">
      <div class="mlp-body">
        <div class="mlp-head">
          <div class="mlp-title">
            <span class="mlp-dot"></span>
            <strong>${p.name}</strong>
          </div>
          <span class="mlp-pill ${isFull ? 'is-full' : 'is-open'}">${isFull ? 'เต็มแล้ว' : `ว่าง ${available} แผง`}</span>
        </div>
        <div class="mlp-sub">${p.category}</div>

        <div class="mlp-tiles">
          <div class="mlp-tile">
            <span class="mlp-tile-label">${ICONS.area}พื้นที่โครงการ</span>
            <b class="mlp-tile-value is-primary">${p.realAreaSqm.toLocaleString()} <small>ตร.ม.</small></b>
          </div>
          <div class="mlp-tile">
            <span class="mlp-tile-label">${ICONS.grid}แผงย่อยทั้งหมด</span>
            <b class="mlp-tile-value">${total.toLocaleString()} <small>แผง</small></b>
          </div>
        </div>

        <div class="mlp-occ">
          <div class="mlp-occ-head">
            <span>สถานะแผงในโครงการ</span>
            <span class="mlp-occ-pct">เช่าแล้ว ${Math.round(pct(occupied))}%</span>
          </div>
          <div class="mlp-occ-bar">
            <i style="width:${pct(available)}%;background:#10b981"></i>
            <i style="width:${pct(reserved)}%;background:#f59e0b"></i>
            <i style="width:${pct(occupied)}%;background:#cbd5e1"></i>
          </div>
          <div class="mlp-occ-legend">
            <span><i style="background:#10b981"></i>ว่าง <b style="color:#059669">${available}</b></span>
            <span><i style="background:#f59e0b"></i>ติดจอง <b style="color:#d97706">${reserved}</b></span>
            <span><i style="background:#cbd5e1"></i>มีผู้เช่า <b>${occupied}</b></span>
          </div>
        </div>

        <div class="mlp-hint">${isFull ? 'คลิกที่กรอบโครงการเพื่อดูแผงย่อยและเข้าคิวสำรอง' : 'คลิกที่กรอบโครงการเพื่อดูแผงย่อยและเลือกจอง'}</div>
      </div>
    </div>
  `).addTo(map)
}

const stallPhotoSamples = [
  '/images/stall_3d_perspective.jpg',
  '/images/market_stall_sample.jpg',
  '/images/market_hall_front.jpg'
]

const getStallDisplayPhoto = (s: MapStall): string => {
  if (s.photo && s.photo !== '/images/stall_3d_perspective.jpg') return s.photo
  let hash = 0
  for (let i = 0; i < s.code.length; i++) hash = ((hash << 5) - hash) + s.code.charCodeAt(i)
  return stallPhotoSamples[Math.abs(hash) % stallPhotoSamples.length]
}

const showPopupForStall = (s: MapStall) => {
  const meta = statusMeta[s.status]
  const selected = (props.selectedStallCodes || []).includes(s.code)
  const isReserved = s.status === 'reserved'
  const queueCount = isReserved ? getStallQueueCount(s.code) : 0
  const nextQueue = queueCount + 1
  const photoUrl = getStallDisplayPhoto(s)

  const statusLabel = selected
    ? 'เลือกแล้ว'
    : isReserved
      ? (queueCount > 0 ? `ติดจอง ${queueCount} คิว` : 'ติดจอง')
      : meta.label

  const accent = selected
    ? '#2563eb'
    : s.status === 'available'
      ? '#10b981'
      : isReserved
        ? '#f59e0b'
        : '#cbd5e1'

  const ctaText = s.status === 'occupied'
    ? 'แผงนี้มีผู้เช่าแล้ว ไม่สามารถเลือกได้'
    : selected
      ? 'คลิกอีกครั้งเพื่อยกเลิกการเลือก'
      : isReserved
        ? `คลิกเพื่อเข้าคิวสำรองแผงนี้ (คุณจะได้เป็นคิวที่ ${nextQueue})`
        : 'คลิกเพื่อเลือกแผงนี้'

  hoverPopup.setLngLat(s.center).setHTML(`
    <div class="mlp" style="--mlp-accent:${accent}">
      <div class="mlp-photo-wrap">
        <img src="${photoUrl}" alt="แผง ${s.code}" class="mlp-photo-img" />
        <div class="mlp-photo-overlay">
          <span class="mlp-photo-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
            </svg>
            ภาพแผงจริง
          </span>
          <span class="mlp-photo-zone-tag">${s.zone || activeProject.value?.name || 'จตุจักร'}</span>
        </div>
      </div>
      <div class="mlp-body">
        <div class="mlp-head">
          <div class="mlp-title">
            <span class="mlp-dot"></span>
            <strong>แผง ${s.code}</strong>
          </div>
          <span class="mlp-pill ${isReserved ? 'is-reserved' : ''}" style="background:${selected ? '#eff6ff' : meta.bg};color:${selected ? '#2563eb' : meta.fg}">
            ${statusLabel}
          </span>
        </div>

        <div class="mlp-tiles">
          <div class="mlp-tile">
            <span class="mlp-tile-label">${ICONS.ruler}ขนาด</span>
            <b class="mlp-tile-value">${s.widthM} × ${s.depthM} <small>ม.</small></b>
            <small class="mlp-tile-note">${s.size} ตร.ม.</small>
          </div>
          <div class="mlp-tile">
            <span class="mlp-tile-label">${ICONS.tag}ประเภท</span>
            <b class="mlp-tile-value">${s.areaType}</b>
          </div>
          <div class="mlp-tile">
            <span class="mlp-tile-label">${ICONS.wallet}ค่าเช่า</span>
            <b class="mlp-tile-value is-money">฿${s.monthlyRent.toLocaleString()}</b>
            <small class="mlp-tile-note">ต่อเดือน</small>
          </div>
          <div class="mlp-tile">
            <span class="mlp-tile-label">${ICONS.key}ค่าแรกเข้า</span>
            <b class="mlp-tile-value">฿${s.entryFee.toLocaleString()}</b>
          </div>
        </div>

        ${isReserved ? `
          <div class="mlp-queue-box">
            <div class="mlp-queue-icon">${ICONS.clock}</div>
            <div class="mlp-queue-content">
              <div class="mlp-queue-title">ติดจองอยู่ <b>${queueCount} คิว</b></div>
              <div class="mlp-queue-desc">หากคุณจองแผงนี้ จะได้สิทธิ์เป็น <b>คิวสำรองที่ ${nextQueue}</b></div>
            </div>
          </div>
        ` : ''}

        <div class="mlp-hint ${isReserved ? 'is-reserved' : ''}">${ctaText}</div>
      </div>
    </div>
  `).addTo(map)
}

// ---------------- Drill-down actions ----------------
let selectedStallMarkers: any[] = []

const renderSelectedStallPins = () => {
  if (!map || !maplibregl) return
  selectedStallMarkers.forEach(m => m.remove())
  selectedStallMarkers = []

  // 1. หากอยู่ในโครงการที่เลือกจอง ให้แสดงหมุดเครื่องหมายถูกตรงกลางแผงแต่ละแผง
  if (activeProjectId.value && activeProjectId.value === bookedProjectId.value) {
    const layout = layouts.get(activeProjectId.value) || activeLayout.value
    const selectedStallsList = (layout?.stalls || []).filter(s => (props.selectedStallCodes || []).includes(s.code))

    selectedStallsList.forEach(s => {
      const el = document.createElement('div')
      el.className = 'selected-stall-pin-marker'
      const statusClass = s.status === 'reserved' ? 'is-reserved' : 'is-available'
      el.innerHTML = `
        <div class="stall-selected-check-icon ${statusClass}" title="แผง ${s.code} (แผงที่คุณเลือก)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      `
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(s.center)
        .addTo(map)
      selectedStallMarkers.push(marker)
    })
  } else if (props.previewMode && bookedProject.value) {
    // 2. หากอยู่ใน Step 3 แต่กำลังคลิกดูโครงการอื่น ให้ปักหมุด Beacon นำทางบนโครงการที่มีแผงที่เราจองไว้
    const bLayout = layouts.get(bookedProjectId.value || '')
    const bookedStallsList = (bLayout?.stalls || []).filter(s => (props.selectedStallCodes || []).includes(s.code))
    const pinLocation: [number, number] = bookedStallsList.length > 0
      ? bookedStallsList[0].center
      : bookedProject.value.center

    const el = document.createElement('div')
    el.className = 'booked-project-beacon-marker'
    el.innerHTML = `
      <div class="beacon-pin-bubble" title="คลิกเพื่อกลับไปยังแผงที่คุณเลือก (${bookedProject.value.name})">
        <span class="beacon-pulse-ring"></span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>แผงที่คุณจอง (${props.selectedStallCodes.join(', ')})</span>
      </div>
    `
    el.onclick = () => focusBookedStalls()

    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(pinLocation)
      .addTo(map)
    selectedStallMarkers.push(marker)
  }
}

const focusBookedStalls = () => {
  const targetProject = bookedProject.value
  if (!targetProject) return
  enterProject(targetProject)
}

const recenterMapView = () => {
  if (!map) return
  hoverPopup?.remove()
  if (activeProject.value) {
    const p = activeProject.value
    const pLayout = layouts.get(p.id) || activeLayout.value
    const selectedStallsList = (pLayout?.stalls || []).filter(s => (props.selectedStallCodes || []).includes(s.code))
    const stallBounds = props.previewMode && selectedStallsList.length > 0 ? getStallsBounds(selectedStallsList) : null

    map.fitBounds(stallBounds || getProjectBounds(p), {
      padding: props.previewMode
        ? { top: 60, bottom: 60, left: 60, right: 60 }
        : { top: 70, bottom: 50, left: 320, right: 380 },
      maxZoom: 20.6,
      pitch: props.previewMode ? 35 : DRILL_PITCH,
      bearing: DEFAULT_BEARING,
      duration: 800
    })
  } else {
    map.flyTo({
      center: [CHATUCHAK_LNG, CHATUCHAK_LAT],
      zoom: OVERVIEW_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      duration: 800
    })
  }
}

const enterProject = (p: ProjectZone) => {
  hoverPopup?.remove()
  activeProjectId.value = p.id
  hoveredProject.value = null
  refreshSources()
  setBuildingsOpacity(BUILDINGS_OPACITY_DRILL)

  const pLayout = layouts.get(p.id) || activeLayout.value
  const selectedStallsList = (pLayout?.stalls || []).filter(s => (props.selectedStallCodes || []).includes(s.code))
  const stallBounds = props.previewMode && selectedStallsList.length > 0 ? getStallsBounds(selectedStallsList) : null

  map?.fitBounds(stallBounds || getProjectBounds(p), {
    padding: props.previewMode
      ? { top: 60, bottom: 60, left: 60, right: 60 }
      : { top: 70, bottom: 50, left: 320, right: 380 },
    maxZoom: 20.6,
    pitch: props.previewMode ? 35 : DRILL_PITCH,
    bearing: map.getBearing(),
    duration: 800
  })
  renderSelectedStallPins()
  emit('selectProject', p)
}

const exitProject = () => {
  hoverPopup?.remove()
  activeProjectId.value = null
  refreshSources()
  setBuildingsOpacity(BUILDINGS_OPACITY)
  map?.flyTo({
    center: [CHATUCHAK_LNG, CHATUCHAK_LAT],
    zoom: OVERVIEW_ZOOM,
    pitch: DEFAULT_PITCH,
    bearing: DEFAULT_BEARING,
    duration: 700
  })
  emit('exitProject')
}

// Called from the info banner button
const selectProject = (p: ProjectZone) => enterProject(p)

const findStall = (code: string) => activeLayout.value?.stalls.find(s => s.code === code) || null

const bindMapEvents = () => {
  map.on('mousemove', (e: any) => {
    const stallHit = map.getLayer('stalls-fill')
      ? map.queryRenderedFeatures(e.point, { layers: ['stalls-fill'] })
      : []
    if (stallHit.length) {
      const s = findStall(stallHit[0].properties.code)
      map.getCanvas().style.cursor = s && s.status !== 'occupied' ? 'pointer' : 'not-allowed'
      if (s) showPopupForStall(s)
      return
    }

    const projHit = map.getLayer('projects-fill')
      ? map.queryRenderedFeatures(e.point, { layers: ['projects-fill'] })
      : []
    const p = projHit.length ? projects.find(item => item.id === projHit[0].properties.id) : null
    if (p && p.id !== activeProjectId.value) {
      map.getCanvas().style.cursor = 'pointer'
      hoveredProject.value = activeProjectId.value ? null : p
      showPopupForProject(p, [e.lngLat.lng, e.lngLat.lat])
    } else {
      map.getCanvas().style.cursor = ''
      hoveredProject.value = null
      hoverPopup.remove()
    }
  })

  map.on('mouseout', () => {
    hoveredProject.value = null
    hoverPopup?.remove()
  })

  map.on('click', (e: any) => {
    const stallHit = map.getLayer('stalls-fill')
      ? map.queryRenderedFeatures(e.point, { layers: ['stalls-fill'] })
      : []
    if (stallHit.length) {
      const s = findStall(stallHit[0].properties.code)
      if (props.previewMode) {
        if (s) showPopupForStall(s)
        return
      }
      if (s && s.status !== 'occupied') {
        const { coordinates, center, ...stallModel } = s
        emit('selectStall', stallModel)
      }
      return
    }

    const projHit = map.getLayer('projects-fill')
      ? map.queryRenderedFeatures(e.point, { layers: ['projects-fill'] })
      : []
    if (projHit.length) {
      const p = projects.find(item => item.id === projHit[0].properties.id)
      if (p && p.id !== activeProjectId.value) enterProject(p)
    }
  })
}

// ---------------- Area badges inside each frame ----------------
const renderZoneLabels = () => {
  if (!map || !maplibregl) return
  projectMarkers.forEach(m => m.remove())
  projectMarkers = []

  projects.forEach((p) => {
    // While drilled into a project, hide its own badge so stalls stay visible
    if (p.id === activeProjectId.value) return

    const el = document.createElement('div')
    el.className = 'maplibre-zone-number-badge'
    if (isProjectDimmed(p) || activeProjectId.value) el.classList.add('is-dimmed')

    el.innerHTML = `
      <div class="zone-badge-inner">
        <span class="badge-num">โครงการที่ ${p.sectionNumber}</span>
      </div>
    `
    el.addEventListener('click', (ev) => {
      ev.stopPropagation()
      enterProject(p)
    })

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat(projectToLngLat(p))
      .addTo(map)

    projectMarkers.push(marker)
  })
}

const matchesSearch = (p: ProjectZone): boolean => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return true
  if (p.name.toLowerCase().includes(query)) return true
  if (p.category.toLowerCase().includes(query)) return true
  const numInQuery = query.replace(/[^0-9]/g, '')
  const numInProject = p.name.replace(/[^0-9]/g, '')
  if (numInQuery && numInProject && numInProject.includes(numInQuery)) return true
  return false
}

const handleSearchInput = () => {
  refreshSources()
  if (searchQuery.value.trim() && map && !activeProjectId.value) {
    const found = projects.find(p => matchesSearch(p))
    if (found) {
      map.flyTo({ center: projectToLngLat(found), zoom: 17.5, duration: 800 })
    }
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  refreshSources()
  if (map && !activeProjectId.value) {
    map.flyTo({ center: [CHATUCHAK_LNG, CHATUCHAK_LAT], zoom: OVERVIEW_ZOOM, duration: 800 })
  }
}

const toggleCategoryFilter = (catName: string) => {
  if (props.categoryFilter === catName) {
    emit('update:categoryFilter', null)
  } else {
    emit('update:categoryFilter', catName)
  }
}

const totalAvailableStallsCount = computed(() => {
  return projects.reduce((sum, p) => sum + (p.stallsAvailable || 0), 0)
})

const toggleOnlyAvailable = () => {
  emit('update:onlyAvailable', !props.onlyAvailable)
}

const handleCategorySelect = (e: Event) => {
  const target = e.target as HTMLSelectElement
  emit('update:categoryFilter', target.value || null)
}

// Watchers for reactive updates
watch(() => props.mapStyle, (newStyle) => {
  const target = newStyle === 'satellite' ? 'satellite' : 'standard'
  if (target !== currentStyle.value) {
    setMapStyle(target)
  }
})

watch(() => [props.onlyAvailable, props.categoryFilter], () => refreshSources())

watch(() => props.selectedStallCodes, () => {
  map?.getSource('project-stalls')?.setData(getStallsGeoJson())
  renderSelectedStallPins()
}, { deep: true })

// Parent may switch project externally (e.g. deep-link); follow it if different
watch(() => props.selectedProjectId, (newId) => {
  if (!map || !newId || newId === activeProjectId.value) return
  const found = projects.find(p => p.id === newId)
  if (found) enterProject(found)
})

const resize = () => {
  map?.resize()
}

defineExpose({ enterProject, exitProject, resize })

const handleWindowResize = () => {
  map?.resize()
}

onMounted(async () => {
  if (process.client) {
    window.addEventListener('resize', handleWindowResize)
    const ml = await import('maplibre-gl')
    maplibregl = ml.default || ml
    initMap()
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', handleWindowResize)
  }
  selectedStallMarkers.forEach(m => m.remove())
  selectedStallMarkers = []
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.projects-master-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
}

/* Top bar with map mode switcher on the left and search on the right */
.master-map-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.master-map-tools-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* Filter Pill Button: เฉพาะแผงว่าง */
.map-filter-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 9999px;
  padding: 6px 14px;
  font-family: 'Bai Jamjuree', sans-serif;
  font-size: 0.84rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.map-filter-pill-btn:hover {
  border-color: #94a3b8;
  color: #1e293b;
  transform: translateY(-1px);
}

.map-filter-pill-btn.active {
  background: #ecfdf5;
  border-color: #10b981;
  color: #065f46;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.15);
}

.filter-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  transition: all 0.2s ease;
}

.filter-status-dot.is-active {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
}

.filter-count-badge {
  font-size: 0.76rem;
  font-weight: 700;
  color: inherit;
  opacity: 0.85;
}

/* Category Select Dropdown */
.map-category-select-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.map-category-select {
  appearance: none;
  -webkit-appearance: none;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 9999px;
  padding: 6px 32px 6px 14px;
  font-family: 'Bai Jamjuree', sans-serif;
  font-size: 0.84rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  outline: none;
  height: 35px;
}

.map-category-select:hover {
  border-color: #94a3b8;
  color: #0f172a;
}

.map-category-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.category-select-icon {
  position: absolute;
  right: 12px;
  pointer-events: none;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 2-Mode Segmented Control: แผนที่ vs ดาวเทียม */
.map-mode-segmented {
  display: inline-flex;
  align-items: center;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  padding: 3px;
  gap: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.map-mode-tab {
  border: none;
  background: transparent;
  color: #64748b;
  font-family: 'Bai Jamjuree', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 18px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.map-mode-tab:hover {
  color: #1e293b;
}

.map-mode-tab.active {
  background: #ffffff;
  color: #2563eb;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.search-input-group {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 320px;
  max-width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.map-search-input {
  width: 100%;
  height: 38px;
  padding: 8px 32px 8px 36px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 0.85rem;
  font-family: inherit;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.map-search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.map-search-input::placeholder {
  color: #94a3b8;
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.clear-search-btn:hover {
  color: #475569;
}

/* MapLibre Canvas Container */
.maplibre-overview-wrapper {
  position: relative;
  width: 100%;
  height: 620px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
}

.maplibre-overview-canvas {
  width: 100%;
  height: 100%;
}

.map-hint-pill {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(8px);
  color: #ffffff;
  font-size: 0.76rem;
  pointer-events: none;
}

/* Color Legend (read-only) */
.color-legend-panel {
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  padding: 16px 20px;
  margin-top: 14px;
}
.color-legend-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  margin-bottom: 12px;
}
.color-legend-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e293b;
}
.color-legend-sub {
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  border-radius: 6px;
  padding: 2px 8px;
}
.color-legend-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px 18px;
}
.color-legend-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 0;
}
.color-legend-swatch {
  flex-shrink: 0;
  width: 18px;
  height: 14px;
  margin-top: 2px;
  border-radius: 4px;
  border: 2px solid;
  opacity: 0.85;
}
.color-legend-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.color-legend-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: #334155;
  line-height: 1.35;
}
.color-legend-projects {
  font-size: 0.74rem;
  color: #64748b;
  margin-top: 1px;
}

/* Modern Category Filter Panel */
.projects-category-filter-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
  margin-top: 14px;
}

.filter-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.filter-header-left {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.filter-title svg {
  color: #2563eb;
}

.filter-subtitle-badge {
  font-size: 0.74rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.filter-subtitle-badge.is-filtering {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}

.btn-reset-filter {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #dc2626;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-reset-filter:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

/* Chips Flow Layout */
.category-chips-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
}

.category-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 13px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  font-family: inherit;
}

.category-filter-chip:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(15, 23, 42, 0.05);
}

.category-filter-chip.active-chip {
  background: #eff6ff;
  border-color: #2563eb;
  color: #1e40af;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.16);
  transform: translateY(-1px);
}

.category-filter-chip.is-dimmed {
  opacity: 0.65;
  background: #ffffff;
}

.category-filter-chip.is-dimmed:hover {
  opacity: 1;
}

.chip-status-icon {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chip-color-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
}

.chip-label {
  line-height: 1.3;
  text-align: left;
}

.chip-count-pill {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #64748b;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.category-filter-chip.active-chip .chip-count-pill {
  background: #dbeafe;
  color: #1e40af;
}
/* Project Area Details Banner */
.project-area-banner {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
  transition: all 0.25s ease;
}

.area-banner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.banner-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.banner-badge {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  flex-shrink: 0;
}

.banner-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.banner-category-tag {
  font-size: 0.78rem;
  font-weight: 500;
  color: #64748b;
  background: #ffffff;
  padding: 2px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.btn-select-project-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}

.btn-select-project-action:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.area-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.metric-label svg {
  color: #2563eb;
}

.metric-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
}

.metric-value.highlight {
  color: #2563eb;
}

.metric-value .unit {
  font-size: 0.78rem;
  font-weight: 500;
  color: #64748b;
}

.metric-value.text-danger {
  color: #dc2626;
}

/* ===== Drill-down Panel (inside map) ===== */
.stall-mode-panel {
  position: absolute;
  top: 14px;
  left: 14px;
  bottom: 14px;
  width: 280px;
  z-index: 12;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
}

.smp-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.smp-back-btn:hover {
  background: #dbeafe;
  transform: translateX(-2px);
}

.smp-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.smp-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  flex-shrink: 0;
}

.smp-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.smp-category {
  margin-top: -6px;
  font-size: 0.76rem;
  color: #64748b;
  line-height: 1.4;
}

.smp-area-box {
  padding: 12px 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  border: 1px solid #bfdbfe;
}

.smp-area-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.74rem;
  font-weight: 500;
  color: #1e40af;
}

.smp-area-value {
  margin-top: 2px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1d4ed8;
  letter-spacing: -0.01em;
}

.smp-area-value span {
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
}

.smp-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.smp-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #eef2f6;
}

.smp-stat-label {
  font-size: 0.7rem;
  color: #64748b;
}

.smp-stat strong {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
}

.smp-stat.is-available strong { color: #15803d; }
.smp-stat.is-reserved strong { color: #d97706; }
.smp-stat.is-occupied strong { color: #64748b; }

.smp-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #eef2f6;
  font-size: 0.76rem;
  color: #334155;
}

.smp-legend > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.smp-sw {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.sw-available { background: #10b981; }
.sw-reserved { background: #f59e0b; }
.sw-occupied { background: #cbd5e1; }
.sw-selected { background: #2563eb; }

.smp-hint {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  font-size: 0.72rem;
  color: #64748b;
  line-height: 1.45;
}

.smp-hint svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #2563eb;
}

.smp-slide-enter-active,
.smp-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.smp-slide-enter-from,
.smp-slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

@media (max-width: 768px) {
  .stall-mode-panel {
    top: auto;
    width: auto;
    right: 14px;
    max-height: 45%;
  }
}
</style>

<style>
/* Global MapLibre Marker Styling */
.maplibre-proj-node {
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
  user-select: none;
}

/* Embedded Zone Number Stamp inside Building Footprint */
.maplibre-zone-number-badge {
  pointer-events: auto !important;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.88);
  color: #ffffff;
  border: 1.5px solid rgba(255, 255, 255, 0.95);
  border-radius: 999px;
  padding: 3px 8px;
  font-family: 'Bai Jamjuree', sans-serif;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;
}

.zone-badge-inner {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.zone-badge-inner .badge-num {
  font-weight: 800;
  color: #ffffff;
}

.zone-badge-inner .badge-sep {
  opacity: 0.55;
  font-size: 9px;
  color: #94a3b8;
}

.zone-badge-inner .badge-area {
  font-size: 10px;
  font-weight: 600;
  color: #93c5fd;
}

.maplibre-zone-number-badge:hover {
  background: #2563eb;
  border-color: #ffffff;
  transform: scale(1.15);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.4), 0 4px 12px rgba(0, 0, 0, 0.4);
}

.maplibre-zone-number-badge:hover .badge-area {
  color: #ffffff;
}

.maplibre-zone-number-badge.is-selected {
  background: #2563eb;
  border-color: #ffffff;
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.45), 0 4px 14px rgba(0, 0, 0, 0.4);
}

.maplibre-zone-number-badge.is-selected .badge-area {
  color: #ffffff;
}

.maplibre-zone-number-badge.is-dimmed {
  opacity: 0.18;
}

/* Custom Popup Content (hover cards) */
.mlp-popup {
  pointer-events: none;
  filter: drop-shadow(0 0 1px rgba(15, 23, 42, 0.18))
          drop-shadow(0 14px 28px rgba(15, 23, 42, 0.22));
}
.mlp-popup .maplibregl-popup-content {
  border-radius: 14px !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  overflow: hidden;
  background: #ffffff !important;
}

/* Seamless Tip Connection - flush and fully unified with the card */
.mlp-popup .maplibregl-popup-tip {
  z-index: 2;
  position: relative;
}
.mlp-popup.maplibregl-popup-anchor-bottom .maplibregl-popup-tip,
.mlp-popup.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip,
.mlp-popup.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip {
  border-top-color: #ffffff !important;
  margin-top: -2px;
}
.mlp-popup.maplibregl-popup-anchor-top .maplibregl-popup-tip,
.mlp-popup.maplibregl-popup-anchor-top-left .maplibregl-popup-tip,
.mlp-popup.maplibregl-popup-anchor-top-right .maplibregl-popup-tip {
  border-bottom-color: #ffffff !important;
  margin-bottom: -2px;
}
.mlp-popup.maplibregl-popup-anchor-left .maplibregl-popup-tip {
  border-right-color: #ffffff !important;
  margin-right: -2px;
}
.mlp-popup.maplibregl-popup-anchor-right .maplibregl-popup-tip {
  border-left-color: #ffffff !important;
  margin-left: -2px;
}

.mlp {
  font-family: 'Bai Jamjuree', sans-serif;
  width: 310px;
  max-width: 100%;
}
.mlp-accent {
  height: 4px;
  background: linear-gradient(90deg, var(--mlp-accent), color-mix(in srgb, var(--mlp-accent) 40%, #ffffff));
}
.mlp-photo-wrap {
  position: relative;
  width: 100%;
  height: 124px;
  overflow: hidden;
  background: #f1f5f9;
}
.mlp-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.mlp:hover .mlp-photo-img {
  transform: scale(1.05);
}
.mlp-photo-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
}
.mlp-photo-badge {
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(6px);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.mlp-photo-badge svg {
  color: #93c5fd;
}
.mlp-photo-zone-tag {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  color: #1e293b;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.mlp-body { padding: 14px 16px 12px; }

.mlp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.mlp-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.mlp-title strong {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
}
.mlp-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: var(--mlp-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--mlp-accent) 22%, transparent);
  flex-shrink: 0;
}
.mlp-pill {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: auto;
}
.mlp-pill.is-open { background: #dcfce7; color: #15803d; }
.mlp-pill.is-full { background: #fee2e2; color: #dc2626; }

.mlp-sub {
  margin-top: 4px;
  font-size: 0.76rem;
  color: #64748b;
  line-height: 1.45;
}

.mlp-tiles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}
.mlp-tile {
  background: #f8fafc;
  border: 1px solid #eef2f6;
  border-radius: 10px;
  padding: 8px 10px;
  min-width: 0;
}
.mlp-tile-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 3px;
}
.mlp-tile-label svg { color: #94a3b8; flex-shrink: 0; }
.mlp-tile-value {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
}
.mlp-tile-value small { font-size: 0.7rem; font-weight: 500; color: #64748b; }
.mlp-tile-value.is-primary { color: #2563eb; }
.mlp-tile-value.is-money { color: #059669; }
.mlp-tile-note { display: block; font-size: 0.66rem; color: #94a3b8; margin-top: 1px; }

.mlp-occ { margin-top: 12px; }
.mlp-occ-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 6px;
}
.mlp-occ-pct { font-weight: 600; color: #334155; }
.mlp-occ-bar {
  display: flex;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: #f1f5f9;
}
.mlp-occ-bar i { display: block; height: 100%; }
.mlp-occ-legend {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  font-size: 0.7rem;
  color: #64748b;
}
.mlp-occ-legend span { display: inline-flex; align-items: center; gap: 4px; }
.mlp-occ-legend i { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
.mlp-occ-legend b { color: #334155; font-weight: 700; }

.mlp-hint {
  margin-top: 12px;
  padding-top: 9px;
  border-top: 1px dashed #e2e8f0;
  font-size: 0.72rem;
  color: #94a3b8;
  text-align: center;
}
.mlp-hint.is-reserved {
  color: #d97706;
  font-weight: 500;
}

/* Queue Info Box for Reserved Stalls */
.mlp-queue-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 8px 12px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
}
.mlp-queue-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #fef3c7;
  color: #d97706;
  border-radius: 8px;
}
.mlp-queue-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.mlp-queue-title {
  font-size: 0.76rem;
  font-weight: 700;
  color: #92400e;
}
.mlp-queue-title b {
  color: #d97706;
}
.mlp-queue-desc {
  font-size: 0.7rem;
  color: #a16207;
  line-height: 1.35;
}
.mlp-queue-desc b {
  color: #78350f;
  font-weight: 700;
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

.map-floating-recenter-btn:hover {
  background: #ffffff;
  color: #2563eb;
  border-color: #93c5fd;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.18);
}

.map-floating-recenter-btn:active {
  transform: translateY(0);
}

.map-floating-recenter-btn svg {
  color: #2563eb;
  flex-shrink: 0;
}

/* Preview Mode Styles */
.projects-master-container.is-preview-mode {
  padding: 12px;
  gap: 12px;
  background: #ffffff;
  border-radius: 14px;
}

.preview-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  background: #f8fafc;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.preview-project-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: #0f172a;
}

.preview-info-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.preview-badge-stalls {
  font-size: 0.76rem;
  font-weight: 700;
  color: #1d4ed8;
  background: #dbeafe;
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid #bfdbfe;
}

.preview-legend-row {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.78rem;
  color: #475569;
}

.preview-leg-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.leg-dot {
  width: 9px;
  height: 9px;
  border-radius: 2px;
  display: inline-block;
}

.leg-dot.is-selected {
  background: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.leg-dot.is-available {
  background: #10b981;
}

.leg-dot.is-reserved {
  background: #f59e0b;
}

/* Selected Stall Checkmark Icon (Matching user screenshot) */
:deep(.selected-stall-pin-marker) {
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 25;
  animation: checkPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

:deep(.stall-selected-check-icon) {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #10b981;
  border: 1.5px solid #d1fae5;
  outline: 2.5px solid #2563eb;
  outline-offset: 1.5px;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

:deep(.stall-selected-check-icon.is-reserved) {
  background: #f59e0b;
  border-color: #fde68a;
}

/* Return to Booked Stalls Pill Button (Top bar) */
.preview-booked-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1.5px solid #bfdbfe;
  border-radius: 10px;
  padding: 5px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.08);
}

.preview-booked-pill-btn:hover {
  border-color: #2563eb;
  background: #eff6ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.16);
}

.preview-booked-pill-btn.is-active {
  border-color: #93c5fd;
  background: #f8fafc;
}

.return-hint-tag {
  background: #2563eb;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}

/* Floating Return Button over Map */
.map-floating-return-btn {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 25;
  background: rgba(15, 23, 42, 0.92);
  color: #ffffff;
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  padding: 8px 18px;
  border-radius: 30px;
  font-size: 0.84rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
  white-space: nowrap;
}

.map-floating-return-btn:hover {
  background: #2563eb;
  border-color: #60a5fa;
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.4);
}

.pulse-indicator-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #60a5fa;
  box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.7);
  animation: pulseBlue 1.6s infinite;
}

@keyframes pulseBlue {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(96, 165, 250, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(96, 165, 250, 0);
  }
}

.floating-stall-codes-badge {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 0.76rem;
  font-weight: 700;
}

/* Beacon Pin for Booked Project when viewing other projects */
:deep(.booked-project-beacon-marker) {
  cursor: pointer;
  z-index: 28;
}

:deep(.beacon-pin-bubble) {
  position: relative;
  background: #2563eb;
  color: #ffffff;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.76rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.45);
  border: 1.5px solid #ffffff;
  white-space: nowrap;
  transition: transform 0.2s ease;
}

:deep(.beacon-pin-bubble:hover) {
  transform: scale(1.08);
  background: #1d4ed8;
}

:deep(.beacon-pulse-ring) {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translate(-50%, -50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #60a5fa;
  animation: beaconPulse 1.8s infinite;
  pointer-events: none;
}

@keyframes beaconPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.4);
    opacity: 0;
  }
}

@keyframes checkPop {
  0% { transform: scale(0.3); opacity: 0; }
  70% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

</style>
