<template>
  <div class="projects-master-container">
    <!-- Top Interactive Filter & Quick Search Bar -->
    <div class="master-map-top-bar">
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

    <!-- MapLibre GL JS Interactive Map Container -->
    <div class="maplibre-overview-wrapper">
      <div id="step1-projects-maplibre" class="maplibre-overview-canvas"></div>

      <!-- Quick Map Hint Overlay -->
      <div class="map-hint-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <span>คลิกที่โครงการเพื่อดูล็อคแผงค้าย่อย | หมุนเมาส์เพื่อซูมและเอียงมุมมอง 3 มิติ (MapLibre GIS)</span>
      </div>
    </div>

    <!-- Category Filter Bar (Modern Interactive Filter Chips) -->
    <div class="projects-category-filter-panel">
      <!-- Header Bar with Filter Title & Status/Reset -->
      <div class="filter-panel-header">
        <div class="filter-header-left">
          <span class="filter-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>กรองตามหมวดหมู่สินค้า</span>
          </span>
          <span class="filter-subtitle-badge" :class="{ 'is-filtering': categoryFilter }">
            <template v-if="categoryFilter">
              พบ {{ activeFilteredProjectsCount }} โครงการ
            </template>
            <template v-else>
              แสดงครบ 30 โครงการ
            </template>
          </span>
        </div>

        <button
          v-if="categoryFilter"
          type="button"
          class="btn-reset-filter"
          @click="emit('update:categoryFilter', null)"
          title="ล้างการกรองเพื่อแสดงทุกโครงการ"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span>ล้างตัวกรองหมวดหมู่</span>
        </button>
      </div>

      <!-- Filter Chips List -->
      <div class="category-chips-flow" role="tablist" aria-label="ตัวกรองหมวดหมู่สินค้า">
        <!-- Chip 1: แสดงทั้งหมด -->
        <button
          type="button"
          class="category-filter-chip chip-all"
          :class="{ 'active-chip': !categoryFilter }"
          @click="emit('update:categoryFilter', null)"
          role="tab"
          :aria-selected="!categoryFilter"
        >
          <span class="chip-status-icon" v-if="!categoryFilter">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
          <span class="chip-label">ทุกหมวดหมู่</span>
          <span class="chip-count-pill">30</span>
        </button>

        <!-- 9 Categorized Chips -->
        <button
          v-for="cat in categoryStats"
          :key="cat.name"
          type="button"
          class="category-filter-chip"
          :class="{
            'active-chip': categoryFilter === cat.name,
            'is-dimmed': categoryFilter && categoryFilter !== cat.name
          }"
          @click="toggleCategoryFilter(cat.name)"
          role="tab"
          :aria-selected="categoryFilter === cat.name"
        >
          <!-- Active Checkmark or Color Dot -->
          <span v-if="categoryFilter === cat.name" class="chip-status-icon">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
          <span v-else class="chip-color-dot" :style="{ backgroundColor: cat.color }"></span>

          <span class="chip-label">{{ cat.name }}</span>
          <span class="chip-count-pill">{{ cat.projectCount }} โครงการ</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export interface ProjectZone {
  id: string
  name: string
  category: string
  color: string
  x: number
  y: number
  w: number
  h: number
  rx?: number
  rotate?: number
  stallsAvailable: number
  totalStalls: number
}

const props = withDefaults(defineProps<{
  selectedProjectId?: string
  onlyAvailable?: boolean
  categoryFilter?: string | null
  mapStyle?: 'standard' | 'dark' | 'satellite'
}>(), {
  selectedProjectId: undefined,
  onlyAvailable: false,
  categoryFilter: null,
  mapStyle: 'standard'
})

const emit = defineEmits<{
  (e: 'selectProject', project: ProjectZone): void
  (e: 'update:categoryFilter', cat: string | null): void
}>()

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

// Accurate 30 Projects representation matching Chatuchak Market Layout
// มีการสมมติโครงการที่เต็ม (stallsAvailable: 0) เพื่อให้เห็นการแสดงผลสีเทาตามความต้องการ
const projects: ProjectZone[] = [
  // West Diagonal Cluster (Top-Left)
  { id: 'proj-29-2', name: 'โครงการที่ 29/2', category: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7', x: 135, y: 395, w: 75, h: 48, rx: 8, rotate: -35, stallsAvailable: 12, totalStalls: 40 },
  { id: 'proj-01-top', name: 'โครงการที่ 01', category: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7', x: 200, y: 345, w: 84, h: 58, rx: 8, rotate: -35, stallsAvailable: 24, totalStalls: 68 },
  { id: 'proj-26', name: 'โครงการที่ 26', category: 'ของเก่าของสะสม เครื่องประดับ เครื่องดนตรีไทย หนังสือ', color: '#e06456', x: 235, y: 415, w: 78, h: 54, rx: 8, rotate: -35, stallsAvailable: 0, totalStalls: 52 },
  { id: 'proj-25', name: 'โครงการที่ 25', category: 'เสื้อผ้า อุปกรณ์เดินป่า เครื่องหนัง', color: '#ab77c8', x: 295, y: 445, w: 58, h: 54, rx: 8, rotate: -35, stallsAvailable: 15, totalStalls: 48 },
  { id: 'proj-24', name: 'โครงการที่ 24', category: 'เครื่องประดับและของแต่งบ้านโบราณ ผ้าไหม กรอบรูป', color: '#7e8ee8', x: 195, y: 485, w: 75, h: 56, rx: 8, rotate: -35, stallsAvailable: 14, totalStalls: 60 },
  { id: 'proj-23', name: 'โครงการที่ 23', category: 'เครื่องประดับและของแต่งบ้านโบราณ ผ้าไหม กรอบรูป', color: '#7e8ee8', x: 225, y: 550, w: 82, h: 62, rx: 8, rotate: -35, stallsAvailable: 18, totalStalls: 96 },
  { id: 'proj-22', name: 'โครงการที่ 22', category: 'เครื่องประดับและของแต่งบ้านโบราณ ผ้าไหม กรอบรูป', color: '#7e8ee8', x: 275, y: 600, w: 70, h: 48, rx: 8, rotate: -35, stallsAvailable: 9, totalStalls: 54 },
  
  // West Outer Curved Strip (Project 03)
  { id: 'proj-03', name: 'โครงการที่ 03', category: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7', x: 160, y: 565, w: 70, h: 110, rx: 12, rotate: -38, stallsAvailable: 20, totalStalls: 80 },

  // Center-West Small Squares (20/1, 20/2, 21)
  { id: 'proj-20-1', name: 'โครงการที่ 20/1', category: 'เสื้อผ้า อุปกรณ์เดินป่า เครื่องหนัง', color: '#ab77c8', x: 350, y: 510, w: 36, h: 56, rx: 6, rotate: 0, stallsAvailable: 0, totalStalls: 32 },
  { id: 'proj-20-2', name: 'โครงการที่ 20/2', category: 'งานศิลปะและภาพวาด', color: '#f48fb1', x: 350, y: 585, w: 38, h: 56, rx: 6, rotate: 0, stallsAvailable: 7, totalStalls: 34 },
  { id: 'proj-21', name: 'โครงการที่ 21', category: 'ของเก่าของสะสม เครื่องประดับ เครื่องดนตรีไทย หนังสือ', color: '#e06456', x: 295, y: 585, w: 52, h: 56, rx: 8, rotate: 0, stallsAvailable: 11, totalStalls: 44 },

  // North Angled Blocks (Projects 29 & 27)
  { id: 'proj-29', name: 'โครงการที่ 29', category: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7', x: 345, y: 325, w: 78, h: 52, rx: 8, rotate: 30, stallsAvailable: 16, totalStalls: 64 },
  { id: 'proj-27', name: 'โครงการที่ 27', category: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7', x: 385, y: 385, w: 82, h: 60, rx: 8, rotate: 30, stallsAvailable: 22, totalStalls: 72 },

  // Long Middle Bar (Project 28)
  { id: 'proj-28', name: 'โครงการที่ 28', category: 'โปสการ์ด ของชำร่วย อุปกรณ์สำหรับสัตว์', color: '#e87a4d', x: 485, y: 462, w: 295, h: 18, rx: 8, rotate: 0, stallsAvailable: 28, totalStalls: 110 },

  // Central Grid - Upper Row (Projects 19, 17, 15, 13)
  { id: 'proj-19', name: 'โครงการที่ 19', category: 'อุปกรณ์โต๊ะอาหาร เซรามิก เบญจรงค์ เครื่องเงิน ของตกแต่งบ้าน', color: '#52b788', x: 400, y: 498, w: 68, h: 54, rx: 8, rotate: 0, stallsAvailable: 13, totalStalls: 56 },
  { id: 'proj-17', name: 'โครงการที่ 17', category: 'ของเก่าของสะสม เครื่องประดับ เครื่องดนตรีไทย หนังสือ', color: '#e06456', x: 476, y: 498, w: 88, h: 54, rx: 8, rotate: 0, stallsAvailable: 0, totalStalls: 64 },
  { id: 'proj-15', name: 'โครงการที่ 15', category: 'อุปกรณ์โต๊ะอาหาร เซรามิก เบญจรงค์ เครื่องเงิน ของตกแต่งบ้าน', color: '#52b788', x: 572, y: 498, w: 50, h: 54, rx: 8, rotate: 0, stallsAvailable: 0, totalStalls: 42 },
  { id: 'proj-13', name: 'โครงการที่ 13', category: 'โปสการ์ด ของชำร่วย อุปกรณ์สำหรับสัตว์', color: '#e87a4d', x: 630, y: 498, w: 50, h: 54, rx: 8, rotate: 0, stallsAvailable: 10, totalStalls: 46 },

  // Central Grid - Lower Row (Projects 18, 16, 14, 12)
  { id: 'proj-18', name: 'โครงการที่ 18', category: 'งานศิลปะและภาพวาด', color: '#f48fb1', x: 400, y: 585, w: 68, h: 56, rx: 8, rotate: 0, stallsAvailable: 14, totalStalls: 54 },
  { id: 'proj-16', name: 'โครงการที่ 16', category: 'งานศิลปะและภาพวาด', color: '#f48fb1', x: 476, y: 585, w: 88, h: 56, rx: 8, rotate: 0, stallsAvailable: 17, totalStalls: 66 },
  { id: 'proj-14', name: 'โครงการที่ 14', category: 'เสื้อผ้า อุปกรณ์เดินป่า เครื่องหนัง', color: '#ab77c8', x: 572, y: 585, w: 50, h: 56, rx: 8, rotate: 0, stallsAvailable: 9, totalStalls: 42 },
  { id: 'proj-12', name: 'โครงการที่ 12', category: 'เสื้อผ้า อุปกรณ์เดินป่า เครื่องหนัง', color: '#ab77c8', x: 630, y: 585, w: 50, h: 56, rx: 8, rotate: 0, stallsAvailable: 11, totalStalls: 44 },

  // East Group (Projects 11, 09, 10, 08, 07, 06)
  { id: 'proj-11', name: 'โครงการที่ 11', category: 'งานแกะสลักไม้ สปา เครื่องหอม', color: '#f2c94c', x: 688, y: 498, w: 45, h: 78, rx: 8, rotate: 0, stallsAvailable: 12, totalStalls: 50 },
  { id: 'proj-09', name: 'โครงการที่ 09', category: 'งานแกะสลักไม้ สปา เครื่องหอม', color: '#f2c94c', x: 741, y: 498, w: 45, h: 84, rx: 8, rotate: 0, stallsAvailable: 15, totalStalls: 52 },
  { id: 'proj-10', name: 'โครงการที่ 10', category: 'งานแกะสลักไม้ สปา เครื่องหอม', color: '#f2c94c', x: 695, y: 595, w: 58, h: 44, rx: 8, rotate: -15, stallsAvailable: 0, totalStalls: 38 },
  { id: 'proj-08', name: 'โครงการที่ 08', category: 'เซรามิก ผ้าไหม', color: '#b5a839', x: 796, y: 495, w: 135, h: 90, rx: 12, rotate: 0, stallsAvailable: 31, totalStalls: 120 },
  { id: 'proj-07', name: 'โครงการที่ 07', category: 'เซรามิก ผ้าไหม', color: '#b5a839', x: 938, y: 480, w: 105, h: 64, rx: 14, rotate: 10, stallsAvailable: 23, totalStalls: 84 },
  { id: 'proj-06', name: 'โครงการที่ 06', category: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7', x: 775, y: 602, w: 145, h: 56, rx: 14, rotate: -20, stallsAvailable: 27, totalStalls: 98 },

  // Bottom Horizontal Curved Bars (Projects 04 & 05)
  { id: 'proj-04', name: 'โครงการที่ 04', category: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7', x: 285, y: 675, w: 228, h: 28, rx: 10, rotate: 0, stallsAvailable: 35, totalStalls: 110 },
  { id: 'proj-05', name: 'โครงการที่ 05', category: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7', x: 565, y: 675, w: 215, h: 28, rx: 10, rotate: 0, stallsAvailable: 30, totalStalls: 105 }
]

// Computed stats
const totalAvailableCount = computed(() => {
  return projects.reduce((sum, p) => sum + p.stallsAvailable, 0)
})

// Computed category stats for filter chips
const categoryStats = computed(() => {
  return categories.map(cat => {
    const projs = projects.filter(p => p.category === cat.name)
    return {
      ...cat,
      projectCount: projs.length,
      availableStalls: projs.reduce((acc, p) => acc + p.stallsAvailable, 0)
    }
  })
})

const activeFilteredProjectsCount = computed(() => {
  if (!props.categoryFilter) return projects.length
  return projects.filter(p => p.category === props.categoryFilter).length
})

// ================================================================
// MAPLIBRE GL JS ENGINE IMPLEMENTATION
// ================================================================
let maplibregl: any = null
let map: any = null
let projectMarkers: any[] = []
let landmarkMarkers: any[] = []
let hoverPopup: any = null

// Chatuchak Market Real Geo Center: Kamphaeng Phet 2 Rd, Chatuchak, Bangkok
const CHATUCHAK_LNG = 100.5501
const CHATUCHAK_LAT = 13.7998

// Convert layout coordinates to realistic geo-coordinates across Chatuchak footprint
const projectToLngLat = (p: ProjectZone): [number, number] => {
  const dx = (p.x + p.w / 2 - 530) / 530
  const dy = (470 - (p.y + p.h / 2)) / 470
  const lng = CHATUCHAK_LNG + dx * 0.0036
  const lat = CHATUCHAK_LAT + dy * 0.0028
  return [lng, lat]
}

// Calculate rounded polygon vertices in [lng, lat] for realistic building footprints
const createProjectPolygonCoordinates = (p: ProjectZone): [number, number][] => {
  const cx = p.x + p.w / 2
  const cy = p.y + p.h / 2
  const rad = ((p.rotate || 0) * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  const halfW = p.w / 2
  const halfH = p.h / 2
  const radius = Math.min(p.rx || 8, halfW * 0.4, halfH * 0.4)

  const arcs = [
    { cx: halfW - radius, cy: -halfH + radius, start: -Math.PI / 2, end: 0 },
    { cx: halfW - radius, cy: halfH - radius, start: 0, end: Math.PI / 2 },
    { cx: -halfW + radius, cy: halfH - radius, start: Math.PI / 2, end: Math.PI },
    { cx: -halfW + radius, cy: -halfH + radius, start: Math.PI, end: (3 * Math.PI) / 2 }
  ]

  const points: [number, number][] = []
  const stepsPerArc = 3

  for (const arc of arcs) {
    for (let i = 0; i <= stepsPerArc; i++) {
      const angle = arc.start + (arc.end - arc.start) * (i / stepsPerArc)
      const lx = arc.cx + radius * Math.cos(angle)
      const ly = arc.cy + radius * Math.sin(angle)

      const rx = cx + (lx * cos - ly * sin)
      const ry = cy + (lx * sin + ly * cos)

      const dx = (rx - 530) / 530
      const dy = (470 - ry) / 470
      const lng = CHATUCHAK_LNG + dx * 0.0036
      const lat = CHATUCHAK_LAT + dy * 0.0028

      points.push([lng, lat])
    }
  }

  // RFC 7946 GeoJSON requirement: Exterior rings MUST be counter-clockwise (Right-hand rule)
  points.reverse()

  if (points.length > 0) {
    points.push(points[0])
  }

  return points
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
      maxzoom: 19
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
      attribution: 'Tiles &copy; Esri'
    },
    'esri-dark-labels': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri'
    }
  },
  layers: [
    {
      id: 'esri-dark-layer',
      type: 'raster',
      source: 'esri-dark',
      minzoom: 0,
      maxzoom: 20
    },
    {
      id: 'esri-dark-labels-layer',
      type: 'raster',
      source: 'esri-dark-labels',
      minzoom: 0,
      maxzoom: 20
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
      attribution: 'Tiles &copy; Esri'
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

const getStyleConfig = (styleName?: string) => {
  if (styleName === 'satellite') return satelliteStyle
  if (styleName === 'dark') return darkStyle
  return standardStyle
}

const initMap = () => {
  const container = document.getElementById('step1-projects-maplibre')
  if (!container || map || !maplibregl) return

  map = new maplibregl.Map({
    container: 'step1-projects-maplibre',
    style: getStyleConfig(props.mapStyle),
    center: [CHATUCHAK_LNG, CHATUCHAK_LAT],
    zoom: 16.5,
    minZoom: 14.5,
    maxZoom: 19.5,
    pitch: 28,
    bearing: -15
  })

  // Standard Navigation Controls (Zoom, 3D Pitch tilt, Compass)
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')

  hoverPopup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 15
  })

  map.on('load', () => {
    setupProjectLayers()
    renderLandmarks()
  })
}

// Generate GeoJSON FeatureCollection for all 30 building zones
const getProjectsGeoJson = () => {
  return {
    type: 'FeatureCollection',
    features: projects.map((p, index) => {
      const isFull = p.stallsAvailable === 0
      const isDimmedByFilter = (props.categoryFilter && p.category !== props.categoryFilter) ||
        (searchQuery.value.trim() && !matchesSearch(p))
      const isOnlyAvailableDimmed = props.onlyAvailable && isFull
      const isDimmed = isDimmedByFilter || isOnlyAvailableDimmed
      const isSelected = props.selectedProjectId === p.id

      let fillColor = p.color
      let strokeColor = p.color
      if (isFull) {
        fillColor = props.onlyAvailable ? '#cbd5e1' : '#94a3b8'
        strokeColor = '#64748b'
      }

      return {
        type: 'Feature',
        id: index + 1,
        geometry: {
          type: 'Polygon',
          coordinates: [createProjectPolygonCoordinates(p)]
        },
        properties: {
          id: p.id,
          name: p.name,
          category: p.category,
          fillColor: fillColor,
          strokeColor: strokeColor,
          stallsAvailable: p.stallsAvailable,
          totalStalls: p.totalStalls,
          isFull: isFull,
          isDimmed: isDimmed,
          isSelected: isSelected
        }
      }
    })
  }
}

let hoveredFeatureId: number | null = null

// Setup vector polygon overlay directly on MapLibre canvas (ตีกรอบพื้นที่จริง)
const setupProjectLayers = () => {
  if (!map) return

  if (map.getLayer('projects-stroke')) map.removeLayer('projects-stroke')
  if (map.getLayer('projects-casing')) map.removeLayer('projects-casing')
  if (map.getLayer('projects-fill')) map.removeLayer('projects-fill')
  if (map.getSource('projects-polygons')) map.removeSource('projects-polygons')

  map.addSource('projects-polygons', {
    type: 'geojson',
    data: getProjectsGeoJson()
  })

  // Semi-transparent polygon fill layer revealing real streets underneath
  map.addLayer({
    id: 'projects-fill',
    type: 'fill',
    source: 'projects-polygons',
    paint: {
      'fill-color': ['to-color', ['get', 'fillColor']],
      'fill-opacity': [
        'case',
        ['boolean', ['get', 'isSelected'], false], 0.85,
        ['boolean', ['get', 'isDimmed'], false], 0.08,
        ['boolean', ['feature-state', 'hover'], false], 0.75,
        0.50
      ]
    }
  })

  // Clean White Casing outline layer underneath stroke for crisp framing over street map
  map.addLayer({
    id: 'projects-casing',
    type: 'line',
    source: 'projects-polygons',
    paint: {
      'line-color': '#ffffff',
      'line-width': [
        'case',
        ['boolean', ['get', 'isSelected'], false], 6.0,
        ['boolean', ['feature-state', 'hover'], false], 5.0,
        3.5
      ],
      'line-opacity': [
        'case',
        ['boolean', ['get', 'isDimmed'], false], 0.3,
        0.95
      ]
    }
  })

  // Boundary stroke outline layer (ตีกรอบโครงการ)
  map.addLayer({
    id: 'projects-stroke',
    type: 'line',
    source: 'projects-polygons',
    paint: {
      'line-color': [
        'case',
        ['boolean', ['get', 'isSelected'], false], ['to-color', '#1d4ed8'],
        ['boolean', ['feature-state', 'hover'], false], ['to-color', '#0f172a'],
        ['to-color', ['get', 'strokeColor']]
      ],
      'line-width': [
        'case',
        ['boolean', ['get', 'isSelected'], false], 4.0,
        ['boolean', ['feature-state', 'hover'], false], 3.0,
        2.0
      ],
      'line-opacity': [
        'case',
        ['boolean', ['get', 'isDimmed'], false], 0.25,
        1.0
      ]
    }
  })

  const showPopupForProject = (p: ProjectZone, lngLat: [number, number]) => {
    const isFull = p.stallsAvailable === 0
    const pct = Math.round((Number(p.stallsAvailable) / Number(p.totalStalls)) * 100)
    const popupHtml = `
      <div style="font-family: 'Bai Jamjuree', sans-serif; padding: 4px; min-width: 200px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
          <strong style="color: #0f172a; font-size: 0.95rem;">${p.name}</strong>
          <span style="font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; ${isFull ? 'background: #fee2e2; color: #dc2626;' : 'background: #dcfce7; color: #15803d;'}">
            ${isFull ? 'เต็มแล้ว (0 แผง)' : `ว่าง ${p.stallsAvailable} แผง`}
          </span>
        </div>
        <div style="font-size: 0.78rem; color: #475569; margin-bottom: 8px; line-height: 1.35;">${p.category}</div>
        <div style="width: 100%; height: 5px; background: #f1f5f9; border-radius: 999px; overflow: hidden; margin-bottom: 8px;">
          <div style="width: ${pct}%; height: 100%; background: ${isFull ? '#94a3b8' : '#10b981'};"></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; font-weight: 700; color: #1e3a8a; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
          <span>฿1,800/ด.</span>
          <span style="color: #2563eb; display: inline-flex; align-items: center; gap: 2px;">คลิกเพื่อดูล็อคย่อย &rarr;</span>
        </div>
      </div>
    `
    hoverPopup.setLngLat(lngLat).setHTML(popupHtml).addTo(map)
  }

  // Mousemove: highlight polygon and show details tooltip
  map.on('mousemove', 'projects-fill', (e: any) => {
    if (e.features && e.features.length > 0) {
      map.getCanvas().style.cursor = 'pointer'
      const feat = e.features[0]
      const projId = feat.properties.id
      const p = projects.find(item => item.id === projId)

      if (hoveredFeatureId !== null) {
        map.setFeatureState(
          { source: 'projects-polygons', id: hoveredFeatureId },
          { hover: false }
        )
      }
      hoveredFeatureId = feat.id
      map.setFeatureState(
        { source: 'projects-polygons', id: hoveredFeatureId },
        { hover: true }
      )

      if (p) {
        showPopupForProject(p, [e.lngLat.lng, e.lngLat.lat])
      }
    }
  })

  map.on('mouseleave', 'projects-fill', () => {
    map.getCanvas().style.cursor = ''
    if (hoveredFeatureId !== null) {
      map.setFeatureState(
        { source: 'projects-polygons', id: hoveredFeatureId },
        { hover: false }
      )
      hoveredFeatureId = null
    }
    hoverPopup.remove()
  })

  const handlePolygonClick = (e: any) => {
    if (e.features && e.features.length > 0) {
      const feat = e.features[0]
      const projId = feat.properties.id
      const p = projects.find(item => item.id === projId)
      if (p) {
        hoverPopup.remove()
        const [lng, lat] = projectToLngLat(p)
        map.flyTo({ center: [lng, lat], zoom: 18, duration: 600 })
        emit('selectProject', p)
      }
    }
  }

  map.on('click', 'projects-fill', handlePolygonClick)
  map.on('click', 'projects-stroke', handlePolygonClick)

  renderZoneLabels()
}

// Render clean, unobtrusive zone number stamps embedded at centroid
const renderZoneLabels = () => {
  projectMarkers.forEach(m => m.remove())
  projectMarkers = []

  projects.forEach((p) => {
    const isFull = p.stallsAvailable === 0
    const isDimmedByFilter = (props.categoryFilter && p.category !== props.categoryFilter) ||
      (searchQuery.value.trim() && !matchesSearch(p))
    const isOnlyAvailableDimmed = props.onlyAvailable && isFull
    const isDimmed = isDimmedByFilter || isOnlyAvailableDimmed
    const isSelected = props.selectedProjectId === p.id

    const [lng, lat] = projectToLngLat(p)

    const el = document.createElement('div')
    el.className = 'maplibre-zone-number-badge'
    if (isDimmed) el.classList.add('is-dimmed')
    if (isSelected) el.classList.add('is-selected')

    const shortNum = p.name.replace('โครงการที่ ', '').replace('โครงการ ', '')
    el.innerHTML = `<span>${shortNum}</span>`

    // Allow direct clicking on the zone badge itself
    el.style.pointerEvents = 'auto'
    el.style.cursor = 'pointer'
    el.addEventListener('click', (ev) => {
      ev.stopPropagation()
      hoverPopup.remove()
      map.flyTo({ center: [lng, lat], zoom: 18, duration: 600 })
      emit('selectProject', p)
    })

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([lng, lat])
      .addTo(map)

    projectMarkers.push(marker)
  })
}

const updateProjectsGeoJson = () => {
  if (!map) return
  const source = map.getSource('projects-polygons')
  if (source) {
    source.setData(getProjectsGeoJson())
  }
  renderZoneLabels()
}

// Render Key Transit & Market Landmarks
const renderLandmarks = () => {
  if (!map || !maplibregl) return

  landmarkMarkers.forEach(m => m.remove())
  landmarkMarkers = []

  const landmarks = [
    { name: 'MRT กำแพงเพชร (ทางออก 2)', lng: 100.5480, lat: 13.7986, type: 'metro' },
    { name: 'BTS หมอชิต / MRT สวนจตุจักร', lng: 100.5534, lat: 13.8020, type: 'metro' },
    { name: 'หอนาฬิกาจตุจักร', lng: 100.5501, lat: 13.8000, type: 'clock' },
    { name: 'ประตู 1 (ถ.กำแพงเพชร 2)', lng: 100.5478, lat: 13.7998, type: 'gate' },
    { name: 'ที่จอดรถ P1', lng: 100.5476, lat: 13.7978, type: 'parking' }
  ]

  landmarks.forEach(item => {
    const el = document.createElement('div')
    el.className = 'maplibre-landmark-pill'
    el.innerHTML = `
      <span class="landmark-dot ${item.type}"></span>
      <span>${item.name}</span>
    `
    const m = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([item.lng, item.lat])
      .addTo(map)
    landmarkMarkers.push(m)
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
  updateProjectsGeoJson()
  if (searchQuery.value.trim() && map) {
    const found = projects.find(p => matchesSearch(p))
    if (found) {
      const [lng, lat] = projectToLngLat(found)
      map.flyTo({ center: [lng, lat], zoom: 17.5, duration: 800 })
    }
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  updateProjectsGeoJson()
  if (map) {
    map.flyTo({ center: [CHATUCHAK_LNG, CHATUCHAK_LAT], zoom: 16.5, duration: 800 })
  }
}

const toggleCategoryFilter = (catName: string) => {
  if (props.categoryFilter === catName) {
    emit('update:categoryFilter', null)
  } else {
    emit('update:categoryFilter', catName)
  }
}

// Watchers for reactive updates
watch(() => props.mapStyle, (newStyle) => {
  if (!map) return
  map.setStyle(getStyleConfig(newStyle))
  map.once('style.load', () => {
    setupProjectLayers()
    renderLandmarks()
  })
})

watch(() => props.onlyAvailable, () => {
  updateProjectsGeoJson()
})

watch(() => props.categoryFilter, () => {
  updateProjectsGeoJson()
})

watch(() => props.selectedProjectId, (newId) => {
  if (!map) return
  if (newId) {
    const found = projects.find(p => p.id === newId)
    if (found) {
      const [lng, lat] = projectToLngLat(found)
      map.flyTo({ center: [lng, lat], zoom: 18, duration: 700 })
    }
  }
  updateProjectsGeoJson()
})

onMounted(async () => {
  if (process.client) {
    const ml = await import('maplibre-gl')
    maplibregl = ml.default || ml
    initMap()
  }
})

onUnmounted(() => {
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

/* Top bar with search input positioned to the right (Matching system standards) */
.master-map-top-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
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
  background: rgba(15, 23, 42, 0.82);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 999px;
  padding: 1px 6px;
  font-family: 'Bai Jamjuree', sans-serif;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;
}

.maplibre-zone-number-badge:hover {
  background: #2563eb;
  border-color: #ffffff;
  transform: scale(1.18);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.4), 0 3px 8px rgba(0, 0, 0, 0.35);
}

.maplibre-zone-number-badge.is-selected {
  background: #2563eb;
  border-color: #ffffff;
  transform: scale(1.25);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.45), 0 3px 10px rgba(0, 0, 0, 0.35);
}

.maplibre-zone-number-badge.is-dimmed {
  opacity: 0.18;
}

/* Landmark Markers */
.maplibre-landmark-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: #ffffff;
  font-family: 'Bai Jamjuree', sans-serif;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  white-space: nowrap;
  pointer-events: none;
}

.maplibre-landmark-pill .landmark-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.maplibre-landmark-pill .landmark-dot.metro { background: #38bdf8; }
.maplibre-landmark-pill .landmark-dot.clock { background: #fbbf24; }
.maplibre-landmark-pill .landmark-dot.gate { background: #a3e635; }
.maplibre-landmark-pill .landmark-dot.parking { background: #818cf8; }

/* Custom Popup Content */
.maplibregl-popup-content {
  border-radius: 10px !important;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18) !important;
  border: 1px solid #bfdbfe !important;
  padding: 10px 14px !important;
}
</style>
