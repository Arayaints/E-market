<template>
  <div>
    <!-- Top Header -->
    <AppHeader />

    <div class="content-body" style="max-width: 1200px; margin: 0 auto;">
      <!-- Breadcrumb Navigation at top of section body -->
      <AppBreadcrumb
        :market="currentMarketName"
        :marketId="route.query.market || '1'"
        :current="currentBreadcrumbText"
        :backTo="`/stalls?market=${route.query.market || '1'}`"
      />

      <!-- Market Info Header Banner -->
      <div class="market-select-banner card glass-card" style="display: flex; justify-content: space-between; align-items: center; border-radius: 16px; padding: 14px 22px; margin-bottom: 24px; flex-wrap: wrap; gap: 14px; border: 1px solid #bfdbfe; background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%); box-shadow: 0 4px 16px rgba(37, 99, 235, 0.06);">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div>
            <div style="font-size: 0.74rem; color: #2563eb; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;">ตลาดที่ท่านกำลังทำการจองแผงเช่า</div>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 2px;">
              <strong style="font-size: 1.25rem; color: #0f172a; font-weight: 800;">{{ currentMarketName }}</strong>
              <span style="font-size: 0.8rem; color: #475569; background: #ffffff; padding: 3px 10px; border-radius: 20px; border: 1px solid #dbeafe; display: inline-flex; align-items: center; gap: 5px; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{{ currentMarketDistrict }}</span>
              </span>
            </div>
          </div>
        </div>
        <NuxtLink to="/" class="btn btn-sm btn-outline" style="border-color: #cbd5e1; color: #1e40af; background: #ffffff; font-weight: 700; display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <span>เปลี่ยนตลาด (12 ตลาด กทม.)</span>
        </NuxtLink>
      </div>

      <!-- Stepper Component (3 Steps) -->
      <BookingStepper :currentStep="currentStep" @changeStep="setStep" />

      <!-- ============================================================ -->
      <!-- STEP 1: เลือกแผงเช่าที่สนใจ (Projects Overview & Sub-Stalls)  -->
      <!-- ============================================================ -->
      <div v-if="currentStep === 1">
        <!-- Title & Filter Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
              เลือกแผงเช่าที่สนใจ
            </h2>
            <div style="font-size: 0.82rem; color: #64748b;">
              {{ mapViewMode === 'projects' ? 'คลิกเลือกโครงการบนแผนที่เพื่อดูล็อคแผงค้าย่อยภายในโครงการ' : `กำลังดูล็อคแผงค้าใน: ${selectedProject?.name || 'โครงการที่ 23'}` }}
            </div>
            <div style="height: 3px; width: 48px; background: var(--primary); border-radius: var(--radius-full); margin-top: 6px;"></div>
          </div>

          <!-- View Mode Tabs & Checkbox -->
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <!-- Segmented View Mode Toggle -->
            <div class="view-mode-tabs-container">
              <button
                type="button"
                class="view-mode-tab-btn"
                :class="{ active: mapViewMode === 'projects' }"
                @click="mapViewMode = 'projects'"
                style="display: inline-flex; align-items: center; gap: 6px;"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                  <line x1="8" y1="2" x2="8" y2="18"></line>
                  <line x1="16" y1="6" x2="16" y2="22"></line>
                </svg>
                <span>ผังรวม 29 โครงการ</span>
              </button>
              <button
                type="button"
                class="view-mode-tab-btn"
                :class="{ active: mapViewMode === 'stalls' }"
                @click="mapViewMode = 'stalls'"
                style="display: inline-flex; align-items: center; gap: 6px;"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>ผังล็อคย่อย ({{ selectedProject?.name || 'โครงการที่ 23' }})</span>
              </button>
            </div>

            <!-- Heatmap Toggle (UX/UI & BA WOW ELEMENT) -->
            <button
              v-if="mapViewMode === 'stalls'"
              type="button"
              class="btn btn-sm"
              :class="showTrafficHeatmap ? 'btn-primary' : 'btn-outline'"
              style="padding: 6px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;"
              @click="showTrafficHeatmap = !showTrafficHeatmap"
              title="เปิด/ปิด การแสดงผลความหนาแน่นของผู้คนเดินผ่าน (Traffic Heatmap)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
              <span>{{ showTrafficHeatmap ? 'ปิดฮีตแมป' : 'แสดงทราฟฟิกคนเดิน' }}</span>
            </button>

            <!-- Checkbox: แผงเช่าที่ว่าง -->
            <label style="display: inline-flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; color: #334155; cursor: pointer; background: #ffffff; padding: 6px 14px; border-radius: 20px; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <input type="checkbox" v-model="onlyAvailable" style="width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer;" />
              <span>แผงเช่าที่ว่าง</span>
            </label>
          </div>
        </div>

        <!-- ========================================================== -->
        <!-- VIEW 1: PROJECTS MASTER PLAN MAP (MATCHING SCREENSHOT)      -->
        <!-- ========================================================== -->
        <div v-if="mapViewMode === 'projects'" class="card" style="padding: 0; position: relative; overflow: hidden; background: #faf8f5; border: 1px solid #e2e8f0; margin-bottom: 24px;">

          <!-- Bottom Left: Map Style Switcher (Thumbnails) -->
          <div class="map-style-switcher">
            <div class="style-thumb" :class="{ active: mapStyle === 'standard' }" @click="mapStyle = 'standard'">
              <div class="thumb-preview standard"></div>
              <span>Standard</span>
            </div>
            <div class="style-thumb" :class="{ active: mapStyle === 'dark' }" @click="mapStyle = 'dark'">
              <div class="thumb-preview dark"></div>
              <span>Dark</span>
            </div>
            <div class="style-thumb" :class="{ active: mapStyle === 'satellite' }" @click="mapStyle = 'satellite'">
              <div class="thumb-preview satellite"></div>
              <span>Satellite</span>
            </div>
          </div>

          <!-- The SVG Master Map of Projects Component -->
          <MarketProjectsOverviewMap
            :selectedProjectId="selectedProject?.id"
            :onlyAvailable="onlyAvailable"
            :categoryFilter="selectedCategoryFilter"
            :mapStyle="mapStyle"
            @selectProject="handleSelectProject"
            @update:categoryFilter="val => selectedCategoryFilter = val"
          />
        </div>

        <!-- ========================================================== -->
        <!-- VIEW 2: DETAILED SUB-STALLS FLOORPLAN (INDIVIDUAL LOCKS)   -->
        <!-- ========================================================== -->
        <div v-else class="map-layout-canvas card" style="padding: 0; position: relative; overflow: hidden; min-height: 600px; background: #faf8f5; border: 1px solid #e2e8f0; margin-bottom: 24px;">
          <!-- Top Sub-Bar: Back to Projects Overview & Current Project Pill -->
          <div class="stall-view-top-bar" style="position: absolute; top: 16px; left: 16px; right: 360px; display: flex; align-items: center; justify-content: space-between; z-index: 15; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              <button
                type="button"
                class="btn btn-sm"
                style="background: #ffffff; border: 1.5px solid #bfdbfe; color: #1e40af; font-weight: 700; padding: 6px 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); display: inline-flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap;"
                @click="mapViewMode = 'projects'"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <span>ผัง 29 โครงการ</span>
              </button>
              
              <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(6px); border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 8px; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; white-space: nowrap;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <strong style="color: #0f172a;">{{ selectedProject?.name || 'โครงการที่ 23' }}</strong>
                <span class="badge badge-available" style="font-size: 0.72rem; padding: 2px 8px;">ว่าง {{ selectedProject?.stallsAvailable || 18 }}</span>
              </div>
            </div>

            <!-- Zone Filter Pills inside stall view -->
            <div class="zone-filter-bar">
              <button
                type="button"
                class="zone-pill-btn"
                :class="{ active: zoneFilter === 'all' }"
                @click="zoneFilter = 'all'"
                style="display: inline-flex; align-items: center; gap: 5px;"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>ทั้งหมด</span>
              </button>
              <button
                type="button"
                class="zone-pill-btn"
                :class="{ active: zoneFilter === 'hotspot' }"
                @click="zoneFilter = 'hotspot'"
                style="display: inline-flex; align-items: center; gap: 5px;"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>หัวมุม</span>
              </button>
              <button
                type="button"
                class="zone-pill-btn"
                :class="{ active: zoneFilter === 'stage' }"
                @click="zoneFilter = 'stage'"
                style="display: inline-flex; align-items: center; gap: 5px;"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
                <span>ติดเวที</span>
              </button>
            </div>
          </div>



          <!-- Controls Top-Left with Zoom Percentage -->
          <div class="map-floating-zoom-ctrl" style="position: absolute; top: 68px; left: 16px; display: flex; flex-direction: column; gap: 5px; z-index: 15;">
            <button type="button" class="zoom-btn" @click.stop="zoomIn" title="ซูมเข้า">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <div class="zoom-level-pill" @click.stop="recenterMap" title="คลิกเพื่อรีเซ็ต 100%">
              {{ Math.round(zoomLevel * 100) }}%
            </div>
            <button type="button" class="zoom-btn" @click.stop="zoomOut" title="ซูมออก">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button type="button" class="zoom-btn reset-btn" @click.stop="recenterMap" title="กลับสู่ศูนย์กลาง">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <line x1="12" y1="2" x2="12" y2="5"></line>
                <line x1="12" y1="19" x2="12" y2="22"></line>
                <line x1="2" y1="12" x2="5" y2="12"></line>
                <line x1="19" y1="12" x2="22" y2="12"></line>
                <circle cx="12" cy="12" r="2.5" fill="currentColor"></circle>
              </svg>
            </button>
          </div>

          <!-- Floorplan Grid (Interactive Pan & Zoom Canvas) -->
          <div
            class="stalls-interactive-canvas"
            :class="{ 'is-panning': isStallsDragging }"
            style="padding: 70px 30px 40px; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 600px; cursor: grab; user-select: none; width: 100%; overflow: hidden;"
            @wheel.prevent="handleStallsWheel"
            @mousedown="onStallsMouseDown"
            @mousemove="onStallsMouseMove"
            @mouseup="onStallsMouseUp"
            @mouseleave="onStallsMouseUp"
          >
            <!-- Top Floorplan Landmark Banner -->
            <div class="floorplan-landmark-tag entrance" style="margin-bottom: 10px; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span>➔ ทางเข้า MRT ทางออก 2</span>
            </div>

            <div
              class="building-layout-wrapper"
              :style="{
                transform: `translate(${stallsPanX}px, ${stallsPanY}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isStallsDragging ? 'none' : 'transform 0.18s ease'
              }"
            >
              <div class="building-polygon-border" :class="{ 'with-heatmap-glow': showTrafficHeatmap }">
                <!-- Zone 1 (Upper Hall) -->
                <div class="stalls-grid-section upper-hall">
                  <div
                    v-for="s in upperHallStalls"
                    :key="s.code"
                    class="stall-box-item"
                    :class="getStallClass(s)"
                    @click="selectStall(s)"
                    @mouseenter="s.status === 'reserved' && fetchWaitingQueueForStall(s.code)"
                    :title="s.status === 'reserved' ? `แผง ${s.code} (ติดจอง)` : `แผง ${s.code} (${getStatusText(s.status)})`"
                  >
                    <span v-if="isStallSelected(s.code)" class="selected-check">✓</span>
                    <span v-else-if="s.status === 'reserved'" class="stall-queue-pill">คิว 1</span>
                    <span class="stall-mini-code">{{ s.code }}</span>
                  </div>
                </div>

                <!-- Division Aisle / Corridor (With Foot Traffic Heatmap) -->
                <div class="market-aisle-divider" :class="{ 'traffic-hot': showTrafficHeatmap }">
                  <span v-if="showTrafficHeatmap">ทางเดินหลัก (คนเดินหนาแน่น)</span>
                  <span v-else>ทางเดินหลัก</span>
                </div>

                <!-- Zone 2 (Lower Hall) -->
                <div class="stalls-grid-section lower-hall">
                  <div
                    v-for="s in lowerHallStalls"
                    :key="s.code"
                    class="stall-box-item"
                    :class="getStallClass(s)"
                    @click="selectStall(s)"
                    @mouseenter="s.status === 'reserved' && fetchWaitingQueueForStall(s.code)"
                    :title="s.status === 'reserved' ? `แผง ${s.code} (ติดจอง)` : `แผง ${s.code} (${getStatusText(s.status)})`"
                  >
                    <span v-if="isStallSelected(s.code)" class="selected-check">✓</span>
                    <span v-else-if="s.status === 'reserved'" class="stall-queue-pill">คิว 1</span>
                    <span class="stall-mini-code">{{ s.code }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bottom Floorplan Landmark Banner -->
            <div class="floorplan-landmark-tag stage" style="margin-top: 14px; display: inline-flex; align-items: center; gap: 8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
              <span>เวทีกลาง • สุขา (WC)</span>
            </div>
          </div>

          <!-- Floating Selected Stall Drawer (Right Side - Glassmorphic) -->
          <transition name="slide-fade" mode="out-in">
            <!-- State 1: When 1 or more stalls are selected -->
            <div v-if="selectedStalls.length > 0" key="selected" class="selected-stall-drawer card" style="position: absolute; top: 16px; right: 16px; width: 330px; max-height: calc(100% - 32px); overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; pointer-events: auto; z-index: 25; padding: 16px; box-shadow: var(--shadow-popup); backdrop-filter: blur(12px); background: rgba(255, 255, 255, 0.97); border-radius: 14px;">
              <!-- Drawer Header -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="font-size: 0.92rem; color: #0f172a;">แผงที่เลือก ({{ selectedStalls.length }})</strong>
                <button class="btn-icon-square" style="width: 26px; height: 26px; font-size: 0.72rem;" @click="clearAllSelectedStalls" title="ล้างการเลือกทั้งหมด">✕</button>
              </div>

              <!-- Status Badge of Current Selection -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span :class="currentSelectionStatus === 'available' ? 'badge badge-available' : 'badge badge-reserved'">
                  {{ currentSelectionStatus === 'available' ? 'แผงว่าง' : 'ติดจอง (Waiting List)' }}
                </span>
                <span style="font-size: 0.76rem; color: #64748b; font-weight: 600;">{{ selectedProject?.name || selectedStall?.zone }}</span>
              </div>

              <!-- Selected Stall Chips -->
              <div class="selected-stalls-chips" style="margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 6px;">
                <div
                  v-for="s in selectedStalls"
                  :key="s.code"
                  class="stall-chip"
                  :class="s.status === 'available' ? 'chip-available' : 'chip-reserved'"
                >
                  <span>แผง {{ s.code }}</span>
                  <button type="button" class="stall-chip-remove" @click.stop="removeStall(s.code)" title="นำแผงนี้ออก">✕</button>
                </div>
              </div>

              <!-- Stall Photo Thumbnail with 3D Preview Quick Badge -->
              <div style="position: relative; border-radius: 10px; overflow: hidden; height: 100px; margin-bottom: 10px; border: 1px solid #e2e8f0; cursor: pointer;" @click="showVirtualModal = true" title="คลิกเพื่อชมภาพ 3D">
                <img :src="selectedStall?.photo || '/images/stall_3d_perspective.jpg'" alt="Stall Photo" style="width: 100%; height: 100%; object-fit: cover;" />
                <div style="position: absolute; bottom: 6px; right: 6px; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(4px); color: #ffffff; padding: 2px 7px; border-radius: 6px; font-size: 0.7rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  <span>3D</span>
                </div>
              </div>

              <!-- Key Metrics Grid (Minimal 3-Box: High Scannability) -->
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 8px; margin-bottom: 12px; text-align: center;">
                <div>
                  <div style="font-size: 0.72rem; color: #64748b; font-weight: 600; margin-bottom: 2px;">ขนาด</div>
                  <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">{{ totalSize }} <span style="font-size: 0.7rem; font-weight: normal; color: #64748b;">ตร.ม.</span></div>
                </div>
                <div style="border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                  <div style="font-size: 0.72rem; color: #64748b; font-weight: 600; margin-bottom: 2px;">ค่าเช่า</div>
                  <div style="font-size: 0.95rem; font-weight: 800; color: #10b981;">฿{{ totalMonthlyRent.toLocaleString() }}<div style="font-size: 0.65rem; font-weight: 500; color: #64748b;">/เดือน</div></div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #64748b; font-weight: 600; margin-bottom: 2px;">แรกเข้า</div>
                  <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">฿{{ totalEntryFee.toLocaleString() }}</div>
                </div>
              </div>

              <!-- Waiting List Queue Status (Clean & Minimal) -->
              <div v-if="currentSelectionStatus === 'reserved'" style="margin-bottom: 12px;">
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 10px 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 0.78rem; font-weight: 800; color: #92400e;">
                      คิวของคุณ
                    </span>
                    <span class="badge" style="background: #d97706; color: #ffffff; font-weight: 800; font-size: 0.74rem; padding: 2px 8px;">
                      คิวที่ {{ currentWaitingInfo?.next_queue_number || 1 }}
                    </span>
                  </div>
                  <div style="font-size: 0.75rem; color: #78350f; display: flex; justify-content: space-between; border-top: 1px dashed #fcd34d; padding-top: 6px; margin-top: 4px;">
                    <span>ผู้จองเดิม:</span>
                    <strong>{{ currentWaitingInfo?.current_booker?.masked_name || 'คุณ รัต***' }} (เหลือ {{ currentWaitingInfo?.current_booker?.days_left_estimate || 2 }} วัน)</strong>
                  </div>
                </div>
              </div>

              <!-- Action Buttons: 3D Tour & Compare -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                <button
                  type="button"
                  class="btn btn-sm btn-outline"
                  style="border-color: #bfdbfe; color: #1d4ed8; background: #eff6ff; font-weight: 700; font-size: 0.74rem; padding: 6px 4px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"
                  @click="showVirtualModal = true"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                  <span>ชม 3D</span>
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-outline"
                  style="border-color: #cbd5e1; color: #475569; font-weight: 600; font-size: 0.74rem; padding: 6px 4px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"
                  @click="showCompareModal = true"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                  <span>เปรียบเทียบ</span>
                </button>
              </div>

              <!-- Primary CTA: ดำเนินการต่อ -->
              <button
                class="btn btn-primary"
                style="width: 100%; padding: 11px; font-size: 0.92rem; border-radius: 10px; font-weight: 700; box-shadow: 0 4px 12px rgba(67, 97, 238, 0.35);"
                @click="goToStep(2)"
              >
                <span>{{ currentSelectionStatus === 'reserved' ? 'จองคิวสำรอง' : 'จองแผงนี้' }} ({{ selectedStalls.length }})</span>
                <span>&rarr;</span>
              </button>
            </div>

            <!-- State 2: When no stall is selected yet (Clean & Concise) -->
            <div v-else key="empty" class="selected-stall-drawer card empty-stall-guide" style="position: absolute; top: 16px; right: 16px; width: 330px; max-height: calc(100% - 32px); overflow-y: auto; overflow-x: hidden; z-index: 25; padding: 22px 16px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08); background: rgba(255, 255, 255, 0.97); text-align: center; border: 1.5px dashed #bfdbfe; border-radius: 14px;">
              <div style="margin: 0 auto 10px; display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; background: #eff6ff; color: #2563eb;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </div>
              
              <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
                คลิกเลือกแผงบนผัง
              </h4>
              
              <p style="font-size: 0.78rem; color: #64748b; line-height: 1.4; margin-bottom: 12px;">
                คลิกแผงค้าเพื่อดูขนาด ราคา และภาพจำลอง 3D
              </p>

              <!-- Color Status Legend Guide (Clean & Compact) -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; font-size: 0.76rem; text-align: left; display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="width: 10px; height: 10px; border-radius: 3px; background: #34d399; display: inline-block;"></span>
                  <span style="color: #065f46; font-weight: 700;">สีเขียว : แผงว่างพร้อมจอง</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="width: 10px; height: 10px; border-radius: 3px; background: #fbbf24; display: inline-block;"></span>
                  <span style="color: #92400e;">สีเหลือง : ติดจอง (Waiting List)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="width: 10px; height: 10px; border-radius: 3px; background: #cbd5e1; display: inline-block;"></span>
                  <span style="color: #64748b;">สีเทา : ไม่ว่าง</span>
                </div>
              </div>
            </div>
          </transition>

          <!-- Conflict Alert Modal (เมื่อพยายามเลือกแผงว่างปนกับแผงติดจอง) -->
          <transition name="modal-fade">
            <div v-if="showConflictModal" class="modal-overlay" style="z-index: 1000;" @click.self="cancelConflictModal">
              <div class="modal-card card" style="max-width: 520px; width: 92%; padding: 28px; border-radius: 16px; box-shadow: var(--shadow-popup);">
                <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 18px;">
                  <div style="width: 48px; height: 48px; border-radius: 12px; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
                      ไม่สามารถเลือกแผงว่างร่วมกับแผงติดจองได้
                    </h3>
                    <p style="font-size: 0.88rem; color: #475569; line-height: 1.55; margin-bottom: 0;">
                      <span v-if="pendingConflictingStall?.status === 'reserved'">
                        คุณกำลังคลิกเลือก <strong>แผง {{ pendingConflictingStall?.code }} (สถานะ: ติดจอง — คิวสำรองลำดับที่ {{ stallWaitingQueueCache[pendingConflictingStall?.code]?.next_queue_number || 2 }})</strong> ต่อจาก <strong>{{ stallWaitingQueueCache[pendingConflictingStall?.code]?.current_booker?.masked_name || 'คุณ รัต*** มี***' }}</strong> แต่รายการที่คุณเลือกไว้ก่อนหน้าเป็น <strong>กลุ่มแผงว่าง</strong>
                      </span>
                      <span v-else>
                        คุณกำลังคลิกเลือก <strong>แผง {{ pendingConflictingStall?.code }} (สถานะ: ว่างพร้อมจอง)</strong> แต่รายการที่คุณเลือกไว้ก่อนหน้าเป็น <strong>กลุ่มแผงติดจอง (Waiting List)</strong>
                      </span>
                    </p>
                  </div>
                </div>

                <!-- Business Rule Explanation Box -->
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; font-size: 0.84rem; color: #92400e; margin-bottom: 22px; line-height: 1.5;">
                  <div style="font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    <span>เหตุผลทางขั้นตอนการเช่า (Business Rule):</span>
                  </div>
                  แผงที่ <strong>ว่าง</strong> สามารถนัดหมายเข้าดูและทำสัญญาเช่าได้ทันที ส่วนแผงที่ <strong>ติดจอง</strong> จะเป็นการลงทะเบียนคิวสำรอง (Waiting List) หากรวมในรายการจองเดียวกันจะทำให้สถานะการจองค้าง และไม่สามารถแยกยื่นคำร้องขอเช่าแผงที่พร้อมได้
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
                  <button
                    type="button"
                    class="btn btn-outline"
                    style="border-color: #cbd5e1; color: #475569; font-weight: 600;"
                    @click="cancelConflictModal"
                  >
                    ยกเลิก (คงรายการเดิมไว้)
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary"
                    style="background: #d97706; border-color: #d97706; color: #ffffff; font-weight: 700;"
                    @click="resolveConflictAndSelect"
                  >
                    ล้างรายการเดิม แล้วเลือกแผง {{ pendingConflictingStall?.code }}
                  </button>
                </div>
              </div>
            </div>
          </transition>

          <!-- Bottom Left: Map Style Switcher (Thumbnails) -->
          <div class="map-style-switcher">
            <div class="style-thumb" :class="{ active: mapStyle === 'standard' }" @click="mapStyle = 'standard'">
              <div class="thumb-preview standard"></div>
              <span>Standard</span>
            </div>
            <div class="style-thumb" :class="{ active: mapStyle === 'dark' }" @click="mapStyle = 'dark'">
              <div class="thumb-preview dark"></div>
              <span>Dark</span>
            </div>
            <div class="style-thumb" :class="{ active: mapStyle === 'satellite' }" @click="mapStyle = 'satellite'">
              <div class="thumb-preview satellite"></div>
              <span>Satellite</span>
            </div>
          </div>

          <!-- Bottom Center: Map Legend -->
          <div class="map-bottom-legend">
            <div class="legend-chip">
              <span class="legend-box occupied"></span>
              <span>กำลังใช้งาน</span>
            </div>
            <div class="legend-chip">
              <span class="legend-box reserved"></span>
              <span>ติดจอง</span>
            </div>
            <div class="legend-chip">
              <span class="legend-box available"></span>
              <span>ว่าง</span>
            </div>
          </div>
        </div>

        <!-- Step 1 Bottom Action Row (Matching Next Button) -->
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 16px;">
          <button
            type="button"
            class="btn btn-primary"
            style="padding: 12px 32px; font-size: 1rem; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 14px rgba(67, 97, 238, 0.35); display: inline-flex; align-items: center; gap: 8px;"
            @click="handleNextFromStep1"
          >
            <span>ถัดไป</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- STEP 2: กรอกข้อมูลเพื่อเยี่ยมชมแผง (Enhanced with AI Smart ID)-->
      <!-- ============================================================ -->
      <div v-else-if="currentStep === 2">
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
            กรอกข้อมูลเพื่อเยี่ยมชมแผง
          </h2>
          <div style="height: 3px; width: 48px; background: var(--primary); border-radius: var(--radius-full);"></div>
        </div>

        <!-- Selected Stalls Overview Banner -->
        <div class="card" style="margin-bottom: 16px; padding: 16px 20px; background: #ffffff; border: 1.5px solid #dbeafe; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-size: 0.8rem; color: #64748b; font-weight: 600; margin-bottom: 6px;">แผงเช่าที่คุณเลือกทำรายการ ({{ selectedStalls.length }} แผง):</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              <span
                v-for="s in selectedStalls"
                :key="s.code"
                class="badge"
                :class="s.status === 'available' ? 'badge-available' : 'badge-reserved'"
                style="font-size: 0.85rem; padding: 4px 10px; font-weight: 700;"
              >
                แผง {{ s.code }}
                <span v-if="s.status === 'reserved'" style="font-size: 0.72rem; opacity: 0.9;">(คิวที่ {{ stallWaitingQueueCache[s.code]?.next_queue_number || 2 }})</span>
                <span v-else style="font-size: 0.72rem; opacity: 0.8;">({{ s.size }} ตร.ม.)</span>
              </span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.78rem; color: #64748b;">ค่าเช่ารวมโดยประมาณ</div>
            <strong style="font-size: 1.15rem; color: #10b981;">฿{{ totalMonthlyRent.toLocaleString() }} <span style="font-size: 0.76rem; color: #64748b;">/เดือน</span></strong>
          </div>
        </div>

        <!-- Waiting List Context Alert Banner for Step 2 -->
        <div v-if="currentSelectionStatus === 'reserved'" style="margin-bottom: 22px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1.5px solid #fcd34d; border-radius: 12px; padding: 14px 18px; color: #92400e; font-size: 0.85rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color: #d97706; flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <div>
              <strong>คำขอนี้เป็นการลงทะเบียนรับสิทธิ์คิวสำรอง (Waiting List คิวที่ {{ currentWaitingInfo?.next_queue_number || 2 }})</strong>
              <div style="font-size: 0.78rem; color: #b45309; margin-top: 2px;">
                ต่อจากผู้จองสิทธิ์ก่อนหน้า: <strong>{{ currentWaitingInfo?.current_booker?.masked_name || 'คุณ รัต*** มี***' }}</strong> (ปิดข้อมูลบางส่วนตามหลัก PDPA)
              </div>
            </div>
          </div>
          <span class="badge" style="background: #d97706; color: #ffffff; padding: 5px 12px; font-weight: 700; border-radius: 20px;">
            คิวที่ {{ currentWaitingInfo?.next_queue_number || 2 }}
          </span>
        </div>

        <!-- AI Smart ID Scan Card -->
        <div class="card smart-id-scan-card" style="margin-bottom: 24px; padding: 18px 24px; border: 1.5px solid #bfdbfe; background: linear-gradient(135deg, #f8faff 0%, #eff6ff 100%);">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div class="id-card-thumb-wrap">
                <img src="/images/thai_id_smartcard.jpg" alt="Thai ID Card" style="width: 100%; height: 100%; object-fit: cover;" />
                <div v-if="scanningId" class="laser-scanner-line"></div>
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <strong style="font-size: 0.95rem; color: #1e3a8a;">ระบบสแกนข้อมูลบัตรประชาชนอัตโนมัติ (AI Smart ID OCR)</strong>
                  <span v-if="idVerified" class="badge badge-green" style="font-size: 0.72rem; padding: 2px 8px;">✓ ยืนยันตัวตนสำเร็จ</span>
                </div>
                <div style="font-size: 0.82rem; color: #64748b; margin-top: 2px;">
                  {{ idVerified ? 'ดึงข้อมูลคุณสมชาย ใจดี และเลขบัตร ปชช. จากฐานข้อมูลทะเบียนราษฎร์เรียบร้อยแล้ว' : 'ไม่ต้องพิมพ์เอง! กดปุ่มเดียวเพื่อสแกนและกรอกข้อมูลจากบัตรประชาชนอัตโนมัติ' }}
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                class="btn btn-sm"
                :class="idVerified ? 'btn-outline' : 'btn-primary'"
                style="padding: 9px 18px; font-weight: 700; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);"
                :disabled="scanningId"
                @click="triggerIdScan"
              >
                <span v-if="scanningId">กำลังประมวลผล OCR...</span>
                <span v-else-if="idVerified" style="display: inline-flex; align-items: center; gap: 5px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  <span>สแกนใหม่อีกครั้ง</span>
                </span>
                <span v-else style="display: inline-flex; align-items: center; gap: 5px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                  <span>สแกนบัตร ปชช. (Auto-Fill)</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <form @submit.prevent="goToStep(3)">
          <!-- Section 1: ข้อมูลผู้เช่า -->
          <div class="card" style="margin-bottom: 24px; padding: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: 0.95rem; font-weight: 700; color: #334155;">
                ข้อมูลผู้เช่า
              </h3>
              <span v-if="idVerified" style="font-size: 0.78rem; color: #059669; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
                <span>ยืนยันข้อมูลผ่านบัตรประจำตัวประชาชนแล้ว</span>
              </span>
            </div>

            <!-- Row 1: ชื่อ นามสกุล และ เลขบัตรประชาชน 13 หลัก (QA/BA) -->
            <div class="form-row-3" style="margin-bottom: 16px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="form_first_name">ชื่อ *</label>
                <input
                  id="form_first_name"
                  v-model="bookingForm.firstName"
                  type="text"
                  required
                  placeholder="เช่น สมชาย"
                  class="form-input"
                  :class="{ 'input-verified-glow': idVerified }"
                />
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="form_last_name">นามสกุล *</label>
                <input
                  id="form_last_name"
                  v-model="bookingForm.lastName"
                  type="text"
                  required
                  placeholder="เช่น ใจดี"
                  class="form-input"
                  :class="{ 'input-verified-glow': idVerified }"
                />
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="form_id_card">เลขประจำตัวประชาชน 13 หลัก *</label>
                <input
                  id="form_id_card"
                  v-model="bookingForm.idCard"
                  type="text"
                  required
                  maxlength="17"
                  placeholder="1-XXXX-XXXXX-XX-X"
                  class="form-input"
                  :class="{ 'input-verified-glow': idVerified }"
                  @input="handleIdCardInput"
                />
              </div>
            </div>

            <!-- Row 2: เบอร์ติดต่อ อีเมล และ สินค้าที่จะขาย -->
            <div class="form-row-3">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="form_phone">เบอร์ติดต่อ *</label>
                <input
                  id="form_phone"
                  v-model="bookingForm.phone"
                  type="tel"
                  required
                  placeholder="087-567-4497"
                  class="form-input"
                  @input="handlePhoneInput"
                />
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="form_email">อีเมล</label>
                <input
                  id="form_email"
                  v-model="bookingForm.email"
                  type="email"
                  placeholder="dfsed@gmail.com"
                  class="form-input"
                />
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="form_business">สินค้าที่ต้องการขาย *</label>
                <select id="form_business" v-model="bookingForm.business" required class="form-select">
                  <option value="" disabled>เลือกสินค้าที่ต้องการขาย</option>
                  <option value="เสื้อผ้าแฟชั่น">เสื้อผ้าแฟชั่นและเครื่องประดับ</option>
                  <option value="อาหารปรุงสุก">อาหารปรุงสุกและเครื่องดื่ม</option>
                  <option value="งานศิลปะและของสะสม">งานศิลปะและของสะสม</option>
                  <option value="ของตกแต่งบ้านและงานคราฟต์">ของตกแต่งบ้านและงานคราฟต์</option>
                  <option value="เซรามิกและเบญจรงค์">เซรามิกและเบญจรงค์</option>
                  <option value="ของใช้เบ็ดเตล็ด">ของใช้เบ็ดเตล็ด</option>
                </select>
              </div>
            </div>

            <!-- Additional notes -->
            <div class="form-group" style="margin-top: 16px; margin-bottom: 0;">
              <label class="form-label" for="form_notes">หมายเหตุหรือข้อสอบถามเพิ่มเติม</label>
              <input
                id="form_notes"
                v-model="bookingForm.notes"
                type="text"
                placeholder="ระบุข้อสอบถาม เช่น สนใจทำเลใกล้ทางเข้า หรือต้องการไฟฟ้ากำลังสูง"
                class="form-input"
              />
            </div>
          </div>

          <!-- BA Official Escort Guarantee Banner -->
          <div class="card" style="margin-bottom: 24px; padding: 18px 24px; border: 1.5px solid #86efac; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: #dcfce7; color: #166534; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
              </div>
              <div>
                <strong style="color: #065f46; font-size: 0.95rem;">การันตีการดูแลโดยเจ้าหน้าที่สำนักงานตลาด กทม. (ไม่มีค่าใช้จ่าย)</strong>
                <div style="font-size: 0.82rem; color: #047857; margin-top: 2px;">
                  ในวันนัดหมาย เจ้าหน้าที่ฝ่ายบริหารตลาดจะพาตรวจวัดขนาดแผงจริง ตรวจสอบมิเตอร์น้ำ-ไฟ และแนะนำเอกสารทำสัญญาโดยตรง ไม่ผ่านนายหน้า
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: ข้อมูลการเยี่ยมชมแผง (Interactive Time Slot Cards) -->
          <div class="card" style="margin-bottom: 28px; padding: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
              <h3 style="font-size: 0.95rem; font-weight: 700; color: #334155;">
                ข้อมูลการเยี่ยมชมแผง
              </h3>
              <span style="font-size: 0.78rem; color: #64748b;">
                * เจ้าหน้าที่สำนักงานตลาดจะพาเดินชมสถานที่จริงตามรอบเวลา
              </span>
            </div>

            <!-- Date Input with Friendly Market Advice -->
            <div style="margin-bottom: 20px;">
              <label class="form-label" for="form_date">วันที่ต้องการเข้าชมแผง *</label>
              <input
                id="form_date"
                v-model="bookingForm.visitDate"
                type="date"
                :min="minDate"
                required
                class="form-input"
                style="max-width: 320px;"
              />
              <div style="font-size: 0.76rem; color: #2563eb; margin-top: 6px; display: inline-flex; align-items: center; gap: 5px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>คำแนะนำ: ตลาดนัดจตุจักรเปิดบริการเต็มรูปแบบในวันเสาร์และอาทิตย์ (09:00 - 18:00 น.) ชมบรรยากาศจริงได้ดีที่สุด</span>
              </div>
            </div>

            <!-- Visual Slot Cards Grid -->
            <div>
              <label class="form-label" style="margin-bottom: 10px; display: block;">
                ช่วงเวลาที่ต้องการเข้าชมแผง (คลิกเลือกรอบเวลาที่สะดวก) *
              </label>
              <div class="time-slot-cards-grid">
                <div
                  v-for="s in timeSlots"
                  :key="s.time"
                  class="time-slot-card"
                  :class="{ selected: bookingForm.visitSlot === s.time }"
                  @click="bookingForm.visitSlot = s.time"
                >
                  <div class="slot-card-top">
                    <span class="slot-card-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </span>
                    <strong class="slot-card-time">{{ s.time }}</strong>
                  </div>
                  <div class="slot-card-capacity" :class="s.capacityClass">
                    {{ s.capacityText }}
                  </div>
                  <div class="slot-card-note">{{ s.note }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step Navigation Buttons -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button type="button" class="btn btn-outline" @click="goToStep(1)">
              <span>ย้อนกลับ</span>
            </button>
            <button type="submit" class="btn btn-primary" style="padding: 10px 24px; font-weight: 700;">
              <span>ถัดไป</span>
              <span>&rarr;</span>
            </button>
          </div>
        </form>
      </div>

      <!-- ============================================================ -->
      <!-- STEP 3: ตรวจสอบและยืนยัน (Enhanced with BA/QA/UX)            -->
      <!-- ============================================================ -->
      <div v-else-if="currentStep === 3">
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
            ตรวจสอบและยืนยัน
          </h2>
          <div style="height: 3px; width: 48px; background: var(--primary); border-radius: var(--radius-full);"></div>
        </div>

        <!-- Top Map Preview Showing Selected Stall -->
        <div class="map-layout-canvas card" style="padding: 0; position: relative; overflow: hidden; height: 320px; min-height: unset; background: #faf8f5; border: 1px solid #e2e8f0; margin-bottom: 24px;">
          <!-- Controls -->
          <div style="position: absolute; top: 12px; left: 12px; display: flex; flex-direction: column; gap: 4px; z-index: 10;">
            <button class="map-ctrl-btn" style="width: 28px; height: 28px; font-size: 0.85rem;" @click="zoomIn">+</button>
            <button class="map-ctrl-btn" style="width: 28px; height: 28px; font-size: 0.85rem;" @click="zoomOut">-</button>
          </div>

          <div style="padding: 20px; display: flex; justify-content: center; align-items: center; height: 100%;">
            <div class="building-layout-wrapper" style="transform: scale(0.68);">
              <div class="building-polygon-border">
                <div class="stalls-grid-section upper-hall">
                  <div
                    v-for="s in upperHallStalls.slice(0, 48)"
                    :key="s.code"
                    class="stall-box-item"
                    :class="getStallClass(s)"
                  >
                    <span v-if="isStallSelected(s.code)" class="selected-check">✓</span>
                  </div>
                </div>
                <div class="market-aisle-divider">
                  <span>ทางเดินหลัก</span>
                </div>
                <div class="stalls-grid-section lower-hall">
                  <div
                    v-for="s in lowerHallStalls.slice(0, 40)"
                    :key="s.code"
                    class="stall-box-item"
                    :class="getStallClass(s)"
                  >
                    <span v-if="isStallSelected(s.code)" class="selected-check">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Left: Styles -->
          <div class="map-style-switcher" style="bottom: 10px; left: 10px;">
            <div class="style-thumb active">
              <div class="thumb-preview standard"></div>
              <span>Standard</span>
            </div>
            <div class="style-thumb">
              <div class="thumb-preview dark"></div>
              <span>Dark</span>
            </div>
            <div class="style-thumb">
              <div class="thumb-preview satellite"></div>
              <span>Satellite</span>
            </div>
          </div>

          <!-- Bottom Center: Legend -->
          <div class="map-bottom-legend" style="bottom: 10px;">
            <div class="legend-chip">
              <span class="legend-box occupied"></span>
              <span>กำลังใช้งาน</span>
            </div>
            <div class="legend-chip">
              <span class="legend-box reserved"></span>
              <span>ติดจอง</span>
            </div>
            <div class="legend-chip">
              <span class="legend-box available"></span>
              <span>ว่าง</span>
            </div>
          </div>
        </div>

        <!-- Card 1: แผงเช่าที่คุณเลือก (List of selected stalls) -->
        <div class="card" style="margin-bottom: 24px; padding: 24px;">
          <!-- Card Header with Badges -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <span style="font-size: 1.05rem; font-weight: 700; color: #0f172a;">แผงเช่าที่คุณเลือก (รวม {{ selectedStalls.length }} แผง)</span>
            </div>
            <span :class="currentSelectionStatus === 'available' ? 'badge badge-available' : 'badge badge-reserved'">
              {{ currentSelectionStatus === 'available' ? 'กลุ่มแผงว่างพร้อมจอง' : 'กลุ่มแผงติดจอง (Waiting List)' }}
            </span>
          </div>

          <!-- Stalls Cards Loop -->
          <div v-for="(stallItem, idx) in selectedStalls" :key="stallItem.code" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge" style="background: #eff6ff; color: var(--primary); font-weight: 700; padding: 4px 12px;">
                  แผงที่ {{ idx + 1 }}
                </span>
                <strong style="font-size: 1.15rem; color: #0f172a;">แผง {{ stallItem.code }}</strong>
                <span :class="stallItem.status === 'available' ? 'badge badge-available' : 'badge badge-reserved'">
                  {{ stallItem.status === 'available' ? 'ว่างพร้อมจอง' : 'ติดจอง' }}
                </span>
              </div>
              <span style="font-size: 0.82rem; color: #64748b;">โซน: {{ selectedProject?.name || stallItem.zone }}</span>
            </div>

            <!-- 4x2 Grid for stallItem -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px 16px; font-size: 0.85rem;">
              <div>
                <div style="color: #64748b; font-size: 0.78rem; margin-bottom: 2px;">ประเภทพื้นที่</div>
                <div style="font-weight: 700; color: #0f172a;">{{ stallItem.areaType }}</div>
              </div>
              <div>
                <div style="color: #64748b; font-size: 0.78rem; margin-bottom: 2px;">ขนาดพื้นที่(ตร.ม.)</div>
                <div style="font-weight: 700; color: #0f172a;">{{ stallItem.size }} ตร.ม.</div>
              </div>
              <div>
                <div style="color: #64748b; font-size: 0.78rem; margin-bottom: 2px;">ค่าธรรมเนียมแรกเข้า (บาท)</div>
                <div style="font-weight: 700; color: #0f172a;">฿{{ (stallItem.entryFee || 75000).toLocaleString() }}</div>
              </div>
              <div>
                <div style="color: #64748b; font-size: 0.78rem; margin-bottom: 2px;">ค่าเช่าต่อเดือน (บาท)</div>
                <div style="font-weight: 700; color: #10b981;">฿{{ (stallItem.monthlyRent || 1800).toLocaleString() }}</div>
              </div>
            </div>

            <!-- Waiting List Details with PDPA Masking -->
            <div v-if="stallItem.status === 'reserved'" style="margin-top: 14px; background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: 10px; padding: 12px 16px; font-size: 0.82rem; color: #92400e; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color: #d97706; flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>
                  <strong>สถานะคิวสำรอง:</strong> คุณจะได้รับสิทธิ์ <strong>คิวที่ {{ stallWaitingQueueCache[stallItem.code]?.next_queue_number || 2 }}</strong> (ต่อจาก: <strong>{{ stallWaitingQueueCache[stallItem.code]?.current_booker?.masked_name || 'คุณ รัต*** มี***' }}</strong>)
                </span>
              </div>
              <span style="font-size: 0.72rem; background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; font-weight: 700; padding: 3px 10px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>PDPA Masked</span>
              </span>
            </div>
          </div>

          <!-- Stall Photos (Thumbnails) -->
          <div style="margin-top: 10px;">
            <div style="font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 10px;">รูปภาพแผงค้าตัวอย่าง</div>
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
              <div v-for="i in 3" :key="i" style="width: 140px; height: 95px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
                <img :src="selectedStalls[0]?.photo || '/images/market_stall_sample.jpg'" alt="Stall Photo" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            </div>
          </div>
        </div>

        <!-- 2-Column Review Section (ข้อมูลผู้จอง & การเยี่ยมชมแผง) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
          <!-- Card 2: ข้อมูลผู้จอง -->
          <div class="card" style="padding: 24px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span style="font-size: 1rem; font-weight: 700; color: #0f172a;">ข้อมูลผู้จอง</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.88rem;">
              <div>
                <div style="color: #64748b; font-size: 0.8rem; margin-bottom: 2px;">ชื่อ - สกุล</div>
                <div style="font-weight: 700; color: #0f172a;">{{ bookingForm.firstName }} {{ bookingForm.lastName }}</div>
              </div>
              <div>
                <div style="color: #64748b; font-size: 0.8rem; margin-bottom: 2px;">เลขบัตรประชาชน</div>
                <div style="font-weight: 700; color: #0f172a;">{{ bookingForm.idCard || '1-1004-98721-34-5' }}</div>
              </div>
              <div>
                <div style="color: #64748b; font-size: 0.8rem; margin-bottom: 2px;">เบอร์ติดต่อ</div>
                <div style="font-weight: 700; color: #0f172a;">{{ bookingForm.phone }}</div>
              </div>
              <div>
                <div style="color: #64748b; font-size: 0.8rem; margin-bottom: 2px;">สินค้าที่จะจำหน่าย</div>
                <div style="font-weight: 700; color: #0f172a;">{{ bookingForm.business }}</div>
              </div>
            </div>
          </div>

          <!-- Card 3: การเยี่ยมชมแผง -->
          <div class="card" style="padding: 24px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span style="font-size: 1rem; font-weight: 700; color: #0f172a;">การเยี่ยมชมแผง</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.88rem;">
              <div>
                <div style="color: #64748b; font-size: 0.8rem; margin-bottom: 2px;">วันนัดเยี่ยมชมแผง</div>
                <div style="font-weight: 700; color: #0f172a;">{{ formatThaiDate(bookingForm.visitDate) }}</div>
              </div>
              <div>
                <div style="color: #64748b; font-size: 0.8rem; margin-bottom: 2px;">ช่วงเวลาที่นัดเยี่ยมชมแผง</div>
                <div style="font-weight: 700; color: #0f172a;">{{ bookingForm.visitSlot }}</div>
              </div>
              <div style="grid-column: 1 / -1;">
                <div style="color: #64748b; font-size: 0.8rem; margin-bottom: 2px;">หมายเหตุ</div>
                <div style="color: #475569;">{{ bookingForm.notes || '-' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- BA FEATURE: Flexible Payment Schedule Options -->
        <div class="card" style="margin-bottom: 24px; padding: 24px; border: 1.5px solid #dbeafe;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div>
              <strong style="font-size: 1rem; color: #0f172a;">เลือกรูปแบบงวดการชำระค่าเช่า (Payment Schedule)</strong>
              <div style="font-size: 0.8rem; color: #64748b;">เลือกชำระล่วงหน้าระยะยาวเพื่อรับส่วนลดพิเศษจากสำนักงานตลาด กทม.</div>
            </div>
            <span class="badge" style="background: #eff6ff; color: #1e40af; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <span>สิทธิประโยชน์ผู้ประกอบการ</span>
            </span>
          </div>

          <div class="payment-schedule-grid">
            <!-- Option 1: Monthly -->
            <div
              class="schedule-card"
              :class="{ active: paymentSchedule === 'monthly' }"
              @click="paymentSchedule = 'monthly'"
            >
              <div class="schedule-top">
                <input type="radio" :checked="paymentSchedule === 'monthly'" />
                <strong>รายเดือน (มาตรฐาน)</strong>
              </div>
              <div class="schedule-price">฿{{ totalMonthlyRent.toLocaleString() }} <span class="unit">/เดือน</span></div>
              <div class="schedule-desc">ชำระค่าเช่าทุกวันที่ 1-5 ของเดือน</div>
            </div>

            <!-- Option 2: Quarterly -->
            <div
              class="schedule-card highlight"
              :class="{ active: paymentSchedule === 'quarterly' }"
              @click="paymentSchedule = 'quarterly'"
            >
              <div class="schedule-badge">ลด 5%</div>
              <div class="schedule-top">
                <input type="radio" :checked="paymentSchedule === 'quarterly'" />
                <strong>ราย 3 เดือน (ไตรมาส)</strong>
              </div>
              <div class="schedule-price">฿{{ quarterlyRent.toLocaleString() }} <span class="unit">/3 เดือน</span></div>
              <div class="schedule-desc">ประหยัด ฿{{ quarterlySavings.toLocaleString() }} (เฉลี่ย ฿{{ Math.round(totalMonthlyRent * 0.95).toLocaleString() }}/ด.)</div>
            </div>

            <!-- Option 3: Annual -->
            <div
              class="schedule-card super"
              :class="{ active: paymentSchedule === 'annual' }"
              @click="paymentSchedule = 'annual'"
            >
              <div class="schedule-badge gold">ลด 10% + ฟรี 1 ด.</div>
              <div class="schedule-top">
                <input type="radio" :checked="paymentSchedule === 'annual'" />
                <strong>ราย 1 ปี (คุ้มค่าที่สุด)</strong>
              </div>
              <div class="schedule-price">฿{{ annualRent.toLocaleString() }} <span class="unit">/ปี</span></div>
              <div class="schedule-desc">ประหยัดรวม ฿{{ annualSavings.toLocaleString() }} + ฟรีค่าส่วนกลาง 1 เดือน</div>
            </div>
          </div>
        </div>

        <!-- WOW FEATURE 3: Transparent Financial Fee Schedule -->
        <div class="card" style="margin-bottom: 24px; padding: 24px; border: 1.5px solid #dbeafe; background: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #059669;">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="10" y1="2" x2="10" y2="22"></line>
              </svg>
              <span style="font-size: 1rem; font-weight: 700; color: #0f172a;">ตารางประมาณการค่าใช้จ่ายแบบโปร่งใส (ประมาณการวันทำสัญญา รวม {{ selectedStalls.length }} แผง)</span>
            </div>
            <span class="badge" style="background: #ecfdf5; color: #059669; font-weight: 600;">ไม่มีค่าใช้จ่ายแอบแฝง</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.88rem;">
            <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0;">
              <span style="color: #475569;">1. ค่าธรรมเนียมสิทธิแรกเข้า (รวม {{ selectedStalls.length }} แผง - ชำระครั้งแรกครั้งเดียว)</span>
              <strong style="color: #0f172a;">฿{{ totalEntryFee.toLocaleString() }}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0;">
              <span style="color: #475569;">
                2. ค่าเช่าแผงล่วงหน้า ({{ paymentSchedule === 'annual' ? '12 เดือน (ลด 10%)' : (paymentSchedule === 'quarterly' ? '3 เดือน (ลด 5%)' : 'เดือนแรก') }})
              </span>
              <strong style="color: #0f172a;">
                ฿{{ paymentSchedule === 'annual' ? annualRent.toLocaleString() : (paymentSchedule === 'quarterly' ? quarterlyRent.toLocaleString() : totalMonthlyRent.toLocaleString()) }}
              </strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #475569;">3. เงินประกันความเสียหายการเช่า (รวม {{ selectedStalls.length }} แผง)</span>
                <span class="badge" style="background: #eff6ff; color: #2563eb; font-size: 0.72rem; padding: 1px 6px;">* คืนเงิน 100% เมื่อสิ้นสุดสัญญา</span>
              </div>
              <strong style="color: #0f172a;">฿{{ totalDepositFee.toLocaleString() }}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0;">
              <span style="color: #475569;">
                4. ค่าบริการรักษาความสะอาดและส่วนกลาง {{ paymentSchedule === 'annual' ? '(11 เดือน - ฟรี 1 เดือน)' : '' }}
              </span>
              <strong style="color: #0f172a;">
                ฿{{ paymentSchedule === 'annual' ? (totalCommonFee * 11).toLocaleString() : (paymentSchedule === 'quarterly' ? (totalCommonFee * 3).toLocaleString() : totalCommonFee.toLocaleString()) }}
              </strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 6px; font-size: 1.05rem;">
              <strong style="color: #1e3a8a;">ยอดรวมที่ต้องเตรียมชำระในวันทำสัญญา (โดยประมาณ):</strong>
              <strong style="color: #2563eb; font-size: 1.25rem;">฿{{ contractTotal.toLocaleString() }}</strong>
            </div>
          </div>
        </div>

        <!-- 100% Refundable Security Deposit Guarantee Card (BA) -->
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 14px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #15803d; flex-shrink: 0;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <div>
              <strong style="color: #166534; font-size: 0.95rem;">การรับประกันเงินประกันการเช่า 100% (Refundable Deposit Guarantee)</strong>
              <div style="font-size: 0.8rem; color: #15803d;">
                เงินประกันสัญญา ฿{{ totalDepositFee.toLocaleString() }} ได้รับคืนเต็มจำนวน 100% ภายใน 15 วันทำการหลังส่งมอบพื้นที่คืนตามระเบียบ กทม.
              </div>
            </div>
          </div>
          <span class="badge" style="background: #15803d; color: #ffffff; padding: 4px 10px; font-weight: 700;">✓ คุ้มครองตามกฎหมาย กทม.</span>
        </div>

        <!-- BMA Municipal Regulations Accordion (BA) -->
        <div class="card" style="margin-bottom: 24px; padding: 20px;">
          <div
            style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
            @click="bmaRulesOpen = !bmaRulesOpen"
          >
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #1e40af;">
                <line x1="2" y1="22" x2="22" y2="22"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
                <line x1="6" y1="18" x2="6" y2="8"></line>
                <line x1="10" y1="18" x2="10" y2="8"></line>
                <line x1="14" y1="18" x2="14" y2="8"></line>
                <line x1="18" y1="18" x2="18" y2="8"></line>
                <polygon points="12 2 20 8 4 8"></polygon>
              </svg>
              <strong style="color: #0f172a; font-size: 0.95rem;">สิทธิประโยชน์และข้อบังคับตามระเบียบสำนักงานตลาด กทม. 2568</strong>
            </div>
            <span style="color: #64748b; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 4px;">
              <svg v-if="!bmaRulesOpen" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
              <span>{{ bmaRulesOpen ? 'ซ่อน' : 'แสดง' }}</span>
            </span>
          </div>

          <div v-if="bmaRulesOpen" style="margin-top: 14px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 0.82rem; color: #475569; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; gap: 10px;">
              <span>1.</span>
              <span><strong>สิทธิการเช่าตรงกับ กทม.:</strong> ปลอดภัยจากการเช่าช่วงหรือเซ้งต่อผิดกฎหมาย คุ้มครองสิทธิ์ตลอดอายุสัญญา</span>
            </div>
            <div style="display: flex; gap: 10px;">
              <span>2.</span>
              <span><strong>โครงการสินเชื่อ SME ดอกเบี้ยพิเศษ:</strong> ผู้เช่าแผง กทม. สามารถใช้สัญญาเช่าเป็นหลักฐานยื่นขอ Soft Loan ดอกเบี้ย 3.5% กับ ธ.กรุงไทย หรือ ธ.ออมสิน</span>
            </div>
            <div style="display: flex; gap: 10px;">
              <span>3.</span>
              <span><strong>Smart Vendor Card &amp; สิทธิการจอดรถ:</strong> ได้รับสิทธิ์ลงทะเบียนจอดรถฟรี 1 คันในโซนผู้ค้า พร้อมช่องทางโปรโมตสินค้าในแอปพลิเคชัน กทม. มาร์เก็ต</span>
            </div>
          </div>
        </div>

        <!-- Digital Signature Pad -->
        <div class="card" style="margin-bottom: 28px; padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              <strong style="font-size: 0.95rem; color: #0f172a;">ลงลายมือชื่อดิจิทัลเพื่อยืนยันคำขอจอง (Digital Signature)</strong>
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-sm btn-outline" style="font-size: 0.78rem; padding: 4px 10px;" @click="clearSignature">
                ล้างลายเซ็น
              </button>
              <button type="button" class="btn btn-sm btn-outline" style="font-size: 0.78rem; padding: 4px 10px; color: #2563eb; border-color: #93c5fd; display: inline-flex; align-items: center; gap: 5px;" @click="autoSign">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                <span>ใช้ลายเซ็นที่บันทึกไว้</span>
              </button>
            </div>
          </div>

          <div style="border: 2px dashed #cbd5e1; border-radius: 10px; background: #fafafa; padding: 10px; text-align: center; position: relative;">
            <canvas
              ref="signatureCanvas"
              width="500"
              height="110"
              style="width: 100%; max-width: 500px; height: 110px; display: block; margin: 0 auto; cursor: crosshair; touch-action: none;"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              @touchstart.passive="handleTouchStart"
              @touchmove.passive="handleTouchMove"
              @touchend="stopDrawing"
            ></canvas>
            <div v-if="!signatureDrawn" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; color: #94a3b8; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              <span>ใช้เมาส์หรือนิ้วลงลายมือชื่อที่นี่ หรือกด "ใช้ลายเซ็นที่บันทึกไว้"</span>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 0.76rem; color: #64748b;">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #059669;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>ได้รับการคุ้มครองตาม พ.ร.บ. ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์</span>
            </span>
            <span v-if="signatureDrawn" style="color: #059669; font-weight: 700;">✓ มีการลงลายมือชื่อแล้ว</span>
          </div>
        </div>

        <!-- Step Navigation Buttons -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button type="button" class="btn btn-outline" @click="goToStep(2)">
            <span>ย้อนกลับ</span>
          </button>
          <button type="button" class="btn btn-primary" :disabled="submitting" @click="submitBooking" style="padding: 12px 32px; font-size: 1.05rem; font-weight: 700; box-shadow: 0 4px 16px rgba(67, 97, 238, 0.35);">
            <span v-if="submitting">กำลังบันทึกการจอง...</span>
            <span v-else style="display: inline-flex; align-items: center; gap: 8px;">
              <span>ยืนยันการจอง</span>
              <span>&rarr;</span>
            </span>
          </button>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SUCCESS MODAL: VIP DIGITAL BOOKING PASS (WOW FEATURE 5)      -->
      <!-- ============================================================ -->
      <div v-if="showSuccessModal" class="modal-overlay" @click.self="showSuccessModal = false">
        <canvas ref="confettiCanvas" class="confetti-canvas-overlay"></canvas>
        <div class="modal-content vip-booking-pass-card" style="max-width: 560px; padding: 0; text-align: center; position: relative; overflow: hidden; border-radius: 20px; border: 1px solid #bfdbfe; box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);">
          <!-- Top Metallic Gradient Banner -->
          <div class="vip-pass-header" style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%); color: #ffffff; padding: 24px 28px; position: relative; text-align: left;">
            <button
              class="btn-icon-square"
              style="position: absolute; top: 18px; right: 18px; width: 32px; height: 32px; background: rgba(255,255,255,0.2); border: none; font-size: 1.1rem; color: #ffffff; backdrop-filter: blur(4px);"
              @click="showSuccessModal = false"
            >
              ✕
            </button>

            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #bfdbfe; flex-shrink: 0;">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <div>
                <div style="font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: #bfdbfe; font-weight: 700;">สำนักงานตลาดกรุงเทพมหานคร (BMA)</div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0;">
                  บัตรนัดหมายเข้าชมแผงเช่า (Digital Pass)
                </h3>
              </div>
            </div>

            <!-- Booking Reference ID Pill with Copy button (QA/UX) -->
            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; margin-top: 6px;">
              <span>รหัสอ้างอิง:</span>
              <strong style="color: #fef08a; letter-spacing: 0.05em;">{{ bookingRefCode }}</strong>
              <button
                type="button"
                style="background: none; border: none; color: #ffffff; cursor: pointer; font-size: 0.75rem; margin-left: 4px; display: inline-flex; align-items: center; gap: 4px; text-decoration: underline;"
                @click="copyRefCode"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>{{ copiedRef ? 'คัดลอกแล้ว' : 'คัดลอก' }}</span>
              </button>
            </div>
          </div>

          <!-- Body Content -->
          <div style="padding: 24px 28px; background: #ffffff;">
            <!-- Countdown Banner -->
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 10px 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.85rem; color: #166534; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #15803d;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>ส่งคำขอนัดหมายสำเร็จ เจ้าหน้าที่พร้อมต้อนรับ</span>
              </span>
              <span class="badge" style="background: #15803d; color: #ffffff; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 5px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>อีก 24 ชั่วโมง</span>
              </span>
            </div>

            <!-- Ticket Details Grid -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 18px; text-align: left; margin-bottom: 20px;">
              <!-- Left: Specs -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 0.82rem; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">ตลาด:</span>
                  <strong style="color: #0f172a;">{{ currentMarketName }}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">หมายเลขแผง:</span>
                  <strong style="color: #2563eb; font-size: 1rem;">
                    แผง {{ selectedStalls.length > 0 ? selectedStalls.map(s => s.code).join(', ') : (selectedStall?.code || '20A') }}
                    <span v-if="selectedStalls.length > 1" style="font-size: 0.8rem; font-weight: 600; color: #64748b;">({{ selectedStalls.length }} แผง)</span>
                  </strong>
                </div>
                <div v-if="currentSelectionStatus === 'reserved'" style="display: flex; justify-content: space-between; background: #fffbeb; padding: 6px 10px; border-radius: 6px; border: 1px solid #fde68a;">
                  <span style="color: #92400e; font-weight: 600;">สถานะคิวสำรอง:</span>
                  <strong style="color: #d97706;">คิวที่ {{ currentWaitingInfo?.next_queue_number || 2 }} (ต่อจาก {{ currentWaitingInfo?.current_booker?.masked_name || 'คุณ รัต*** มี***' }})</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">วันนัดหมาย:</span>
                  <strong style="color: #0f172a;">{{ formatThaiDate(bookingForm.visitDate) }}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">ช่วงเวลา:</span>
                  <strong style="color: #0f172a;">{{ bookingForm.visitSlot }}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">ชื่อผู้จอง:</span>
                  <strong style="color: #0f172a;">{{ bookingForm.firstName }} {{ bookingForm.lastName }}</strong>
                </div>
              </div>

              <!-- Right: QR Code for Gate Check-in -->
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px;">
                <!-- Simulated Dynamic QR Code -->
                <div style="width: 80px; height: 80px; background: #ffffff; padding: 6px; border-radius: 8px; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; margin-bottom: 6px;">
                  <svg width="68" height="68" viewBox="0 0 24 24" fill="currentColor" style="color: #1e3a8a;">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm-2 10h8v8H2v-8zm2 2v4h4v-4H4zm10-14h8v8h-8V2zm2 2v4h4V4h-4zm2 12h-2v2h2v-2zm-2 2h-2v2h2v-2zm4 0h-2v2h2v-2zm2-2h-2v2h2v-2zm0 4h-2v2h2v-2zm-6-2h-2v2h2v-2zm4-6h-2v2h2v-2zm2 0h-2v2h2v-2zm-4 2h-2v2h2v-2z"></path>
                  </svg>
                </div>
                <span style="font-size: 0.68rem; color: #1e40af; font-weight: 700; text-align: center;">สแกนเพื่อเช็คอินหน้างาน</span>
              </div>
            </div>

            <!-- Pass Action Buttons -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
              <button type="button" class="btn btn-outline btn-sm" style="font-size: 0.82rem; font-weight: 700; border-color: #cbd5e1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" @click="printPass">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                <span>พิมพ์ / บันทึก PDF</span>
              </button>
              <button type="button" class="btn btn-outline btn-sm" style="font-size: 0.82rem; font-weight: 700; border-color: #3b82f6; color: #2563eb; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" @click="addToCalendar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>เพิ่มลงปฏิทินมือถือ</span>
              </button>
            </div>

            <!-- Bottom Navigation -->
            <div style="display: flex; gap: 10px;">
              <NuxtLink to="/bookings" class="btn btn-primary" style="flex: 1; padding: 12px; font-weight: 700;">
                ไปที่รายการการจองของฉัน &rarr;
              </NuxtLink>
              <NuxtLink to="/" class="btn btn-outline" style="padding: 12px; font-weight: 600;">
                กลับหน้าหลัก
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- MODAL 1: 3D VIRTUAL STALL TOUR (WOW FEATURE 6)               -->
      <!-- ============================================================ -->
      <div v-if="showVirtualModal" class="modal-overlay" @click.self="showVirtualModal = false">
        <div class="modal-content" style="max-width: 720px; padding: 0; overflow: hidden; border-radius: 18px; border: 1px solid #bfdbfe; box-shadow: var(--shadow-popup);">
          <!-- Modal Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; background: #0f172a; color: #ffffff;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #60a5fa;">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff; margin: 0;">
                  ภาพจำลองแผงค้า 3 มิติ (3D Virtual Stall Experience)
                </h3>
                <div style="font-size: 0.78rem; color: #94a3b8;">
                  แผง {{ selectedStall?.code || '20A' }} โครงการ 23 ตลาดนัดจตุจักร
                </div>
              </div>
            </div>
            <button class="btn-icon-square" style="width: 32px; height: 32px; background: rgba(255,255,255,0.15); border: none; color: #fff;" @click="showVirtualModal = false">
              ✕
            </button>
          </div>

          <!-- 3D Render Image with Interactive Hotspot Pins -->
          <div style="position: relative; height: 380px; background: #000; overflow: hidden;">
            <img src="/images/stall_3d_perspective.jpg" alt="3D Stall Perspective" style="width: 100%; height: 100%; object-fit: cover;" />
            
            <!-- Hotspot Pin 1: Dimension -->
            <div class="virtual-pin pin-dimension" style="top: 82%; left: 32%;" title="ขนาดพื้นที่ 2.5 x 2.3 ม. (5.75 ตร.ม.)">
              <span class="pin-dot"></span>
              <span class="pin-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px;"><path d="M21.3 8.7 8.7 21.3c-.4.4-1 .4-1.4 0l-4.6-4.6c-.4-.4-.4-1 0-1.4L15.3 2.7c.4-.4 1-.4 1.4 0l4.6 4.6c.4.4.4 1 0 1.4z"></path></svg>
                กว้าง 2.5 ม. x ลึก 2.3 ม. (5.75 ตร.ม.)
              </span>
            </div>

            <!-- Hotspot Pin 2: Power -->
            <div class="virtual-pin pin-power" style="top: 56%; right: 24%;" title="ปลั๊กไฟ 15A 2 จุด">
              <span class="pin-dot"></span>
              <span class="pin-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                ปลั๊กไฟคู่ 15A + มิเตอร์แยก
              </span>
            </div>

            <!-- Hotspot Pin 3: Track Lighting -->
            <div class="virtual-pin pin-light" style="top: 18%; left: 36%;" title="ไฟ Track Light LED ปรับองศาได้">
              <span class="pin-dot"></span>
              <span class="pin-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px;"><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>
                Track Light LED 2 ดวง
              </span>
            </div>
          </div>

          <!-- Bottom Feature Bar -->
          <div style="padding: 18px 24px; background: #ffffff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; gap: 16px; font-size: 0.82rem; color: #475569;">
              <span style="display: inline-flex; align-items: center; gap: 5px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #059669;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ผนังกันไฟลาม Class A
              </span>
              <span style="display: inline-flex; align-items: center; gap: 5px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #059669;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ก๊อกน้ำและรางระบายน้ำ
              </span>
              <span style="display: inline-flex; align-items: center; gap: 5px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #059669;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                มิเตอร์ไฟส่วนตัว
              </span>
            </div>
            <button class="btn btn-primary btn-sm" style="padding: 10px 20px; font-weight: 700;" @click="showVirtualModal = false">
              เลือกแผงนี้แล้วดำเนินการต่อ &rarr;
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- MODAL 2: STALL COMPARISON (WOW FEATURE 7)                    -->
      <!-- ============================================================ -->
      <div v-if="showCompareModal" class="modal-overlay" @click.self="showCompareModal = false">
        <div class="modal-content" style="max-width: 640px; padding: 24px; border-radius: 18px; border: 1px solid #bfdbfe;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #2563eb;">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 0;">เปรียบเทียบแผงค้า (Stall Comparison)</h3>
            </div>
            <button class="btn-icon-square" style="width: 32px; height: 32px;" @click="showCompareModal = false">✕</button>
          </div>

          <!-- Comparison Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 10px; text-align: left; color: #475569;">คุณลักษณะ</th>
                <th style="padding: 10px; text-align: center; color: #2563eb; background: #eff6ff;">แผง 20A (ที่เลือกไว้)</th>
                <th style="padding: 10px; text-align: center; color: #475569;">แผง 20B (แผงข้างเคียง)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; color: #64748b;">ค่าเช่ารายเดือน</td>
                <td style="padding: 10px; text-align: center; font-weight: 800; color: #059669; background: #f0fdf4;">฿1,800</td>
                <td style="padding: 10px; text-align: center; font-weight: 700; color: #0f172a;">฿2,000</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; color: #64748b;">ขนาดพื้นที่</td>
                <td style="padding: 10px; text-align: center; font-weight: 700; color: #0f172a; background: #eff6ff;">5.0 ตร.ม.</td>
                <td style="padding: 10px; text-align: center; font-weight: 700; color: #0f172a;">5.5 ตร.ม.</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; color: #64748b;">ตำแหน่งทางสัญจร</td>
                <td style="padding: 10px; text-align: center; font-weight: 700; color: #2563eb; background: #eff6ff;">ติดเวทีหลัก &amp; ทางเดินใหญ่ (ทำเลทอง)</td>
                <td style="padding: 10px; text-align: center; color: #475569;">แผงถัดไป</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; color: #64748b;">ปริมาณคนเดินผ่าน</td>
                <td style="padding: 10px; text-align: center; font-weight: 700; color: #059669; background: #eff6ff;">สูงมาก (High Traffic)</td>
                <td style="padding: 10px; text-align: center; color: #475569;">ปานกลาง (Medium)</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #64748b;">ทิศแดด/ลม</td>
                <td style="padding: 10px; text-align: center; font-weight: 700; color: #059669; background: #eff6ff;">ร่มตลอดวัน มีลมพัด</td>
                <td style="padding: 10px; text-align: center; color: #475569;">แดดบ่ายเล็กน้อย</td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: right;">
            <button class="btn btn-primary" style="padding: 10px 24px; font-weight: 700;" @click="showCompareModal = false">
              คงการเลือกแผง 20A &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { get, post } = useApi()
const { user } = useAuth()
const { showAlert, showWarning, showError, showSuccess } = useAppAlert()

const currentMarketName = ref('ตลาดนัดจตุจักร')
const currentMarketDistrict = ref('เขตจตุจักร')

const currentStep = ref<number>(1)
const mapViewMode = ref<'projects' | 'stalls'>('projects')
const selectedCategoryFilter = ref<string | null>(null)
const selectedProject = ref<{
  id: string
  name: string
  category: string
  color: string
  stallsAvailable: number
  totalStalls: number
}>({
  id: 'proj-23',
  name: 'โครงการที่ 23',
  category: 'เครื่องประดับและของแต่งบ้านโบราณ ผ้าไหม กรอบรูป',
  color: '#7e8ee8',
  stallsAvailable: 18,
  totalStalls: 96
})

const onlyAvailable = ref(false)
const showTrafficHeatmap = ref(false)
const zoneFilter = ref<'all' | 'hotspot' | 'stage'>('all')
const detailsOpen = ref(true)
const zoomLevel = ref(1)
const mapStyle = ref<'standard' | 'dark' | 'satellite'>('standard')
const submitting = ref(false)
const showSuccessModal = ref(false)
const showVirtualModal = ref(false)
const showCompareModal = ref(false)

// BA commercial choices
const paymentSchedule = ref<'monthly' | 'quarterly' | 'annual'>('monthly')
const bmaRulesOpen = ref(false)
const copiedRef = ref(false)

// AI Smart ID Scan State
const scanningId = ref(false)
const idVerified = ref(false)

// Time Slots
const timeSlots = ref([
  {
    time: '09.30 - 10.30 น.',
    capacityText: 'เหลือ 2 คิวสุดท้าย',
    capacityClass: 'cap-low',
    note: 'ช่วงเช้า อากาศสบาย เหมาะดูโครงสร้าง'
  },
  {
    time: '11.00 - 12.00 น.',
    capacityText: 'ว่าง 5 คิว',
    capacityClass: 'cap-high',
    note: 'ช่วงสาย บรรยากาศเริ่มคึกคัก'
  },
  {
    time: '13.00 - 14.00 น.',
    capacityText: 'รอบยอดนิยม (เหลือ 1 คิว)',
    capacityClass: 'cap-med',
    note: 'ช่วงบ่าย มีเจ้าหน้าที่เทคนิคพาชม'
  },
  {
    time: '15.30 - 16.30 น.',
    capacityText: 'ว่าง 4 คิว',
    capacityClass: 'cap-high',
    note: 'ช่วงเย็น ชมทราฟฟิกคนเดินจริง'
  }
])

// Form state
const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const bookingForm = ref({
  firstName: 'สมชาย',
  lastName: 'ใจดี',
  idCard: '1-1004-98721-34-5',
  phone: '087-567-4497',
  email: 'somchai.jai@thaigov.or.th',
  business: 'เสื้อผ้าแฟชั่น',
  notes: '',
  visitDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  visitSlot: '13.00 - 14.00 น.'
})

const bookingRefCode = ref('BMA-JJ-2026-08942')

// Signature Pad State & Handlers
const signatureCanvas = ref<HTMLCanvasElement | null>(null)
const signatureDrawn = ref(false)
let isDrawing = false
let sigCtx: CanvasRenderingContext2D | null = null

// Representative stalls array matching screenshot
interface StallModel {
  code: string
  zone: string
  status: 'available' | 'occupied' | 'reserved'
  areaType: string
  size: number
  entryFee: number
  monthlyRent: number
  commonFee: number
  depositFee: number
  photo: string
  backendId?: number
}

// Upper hall stalls grid
const upperHallStalls = ref<StallModel[]>([])
// Lower hall stalls grid
const lowerHallStalls = ref<StallModel[]>([])

// Multi-Stall Selection & Status Handling (BA & QA Requirement)
const selectedStalls = ref<StallModel[]>([])
const selectedStall = computed(() => selectedStalls.value[0] || null)

// Current Selection Status ('available' or 'reserved')
const currentSelectionStatus = computed<'available' | 'reserved' | null>(() => {
  if (selectedStalls.value.length === 0) return null
  return selectedStalls.value[0].status === 'reserved' ? 'reserved' : 'available'
})

// Status Conflict Warning Modal State
const showConflictModal = ref(false)
const pendingConflictingStall = ref<StallModel | null>(null)

// Waiting List Queue & PDPA Masked Booker Interface
interface WaitingQueueBooker {
  queue_number: number
  booking_number: string
  masked_name: string
  masked_phone: string
  visit_date?: string
  visit_time_slot?: string
  status: string
  status_label: string
  created_at?: string
  days_left_estimate: number
}

interface WaitingQueueData {
  stall_id?: number | null
  stall_number: string
  total_waiting_count: number
  next_queue_number: number
  has_waiting_list: boolean
  current_booker?: WaitingQueueBooker | null
  queues: WaitingQueueBooker[]
}

const stallWaitingQueueCache = ref<Record<string, WaitingQueueData>>({})
const loadingWaitingQueue = ref(false)
const activeWaitingStallCode = ref<string>('')

const currentWaitingInfo = computed<WaitingQueueData | null>(() => {
  const code = activeWaitingStallCode.value || selectedStalls.value[0]?.code
  if (!code) return null
  return stallWaitingQueueCache.value[code] || null
})

const fetchWaitingQueueForStall = async (stallCode: string) => {
  if (!stallCode) return
  if (stallWaitingQueueCache.value[stallCode]) return
  loadingWaitingQueue.value = true
  try {
    const data = await get<WaitingQueueData>(`/bookings/waiting-queue/${encodeURIComponent(stallCode)}`)
    if (data) {
      stallWaitingQueueCache.value[stallCode] = data
    }
  } catch (err) {
    // Graceful fallback simulation with PDPA masking
    stallWaitingQueueCache.value[stallCode] = {
      stall_number: stallCode,
      total_waiting_count: 1,
      next_queue_number: 2,
      has_waiting_list: true,
      current_booker: {
        queue_number: 1,
        booking_number: 'BK-2026-0002',
        masked_name: 'คุณ รัต*** มี***',
        masked_phone: '081-XXX-5566',
        visit_date: '2026-10-19',
        visit_time_slot: '14:00 - 16:00',
        status: 'approved',
        status_label: 'นัดหมายสำเร็จ (รอเข้าชมแผง)',
        days_left_estimate: 2
      },
      queues: [{
        queue_number: 1,
        booking_number: 'BK-2026-0002',
        masked_name: 'คุณ รัต*** มี***',
        masked_phone: '081-XXX-5566',
        visit_date: '2026-10-19',
        visit_time_slot: '14:00 - 16:00',
        status: 'approved',
        status_label: 'นัดหมายสำเร็จ (รอเข้าชมแผง)',
        days_left_estimate: 2
      }]
    }
  } finally {
    loadingWaitingQueue.value = false
  }
}

// Check if a stall is selected
const isStallSelected = (code: string) => {
  return selectedStalls.value.some(s => s.code === code)
}

// Multi-stall aggregate totals
const totalMonthlyRent = computed(() => {
  if (selectedStalls.value.length === 0) return 1800
  return selectedStalls.value.reduce((sum, s) => sum + (s.monthlyRent || 1800), 0)
})

const totalEntryFee = computed(() => {
  if (selectedStalls.value.length === 0) return 75000
  return selectedStalls.value.reduce((sum, s) => sum + (s.entryFee || 75000), 0)
})

const totalDepositFee = computed(() => {
  if (selectedStalls.value.length === 0) return 1800
  return selectedStalls.value.reduce((sum, s) => sum + (s.depositFee || 1800), 0)
})

const totalCommonFee = computed(() => {
  if (selectedStalls.value.length === 0) return 500
  return selectedStalls.value.reduce((sum, s) => sum + (s.commonFee || 500), 0)
})

const totalSize = computed(() => {
  if (selectedStalls.value.length === 0) return 5
  return selectedStalls.value.reduce((sum, s) => sum + (s.size || 5), 0)
})

// Commercial financial calculations (BA & Dev perspective)
const quarterlyRent = computed(() => {
  return Math.round(totalMonthlyRent.value * 3 * 0.95) // 5% discount
})

const quarterlySavings = computed(() => {
  return (totalMonthlyRent.value * 3) - quarterlyRent.value
})

const annualRent = computed(() => {
  return Math.round(totalMonthlyRent.value * 12 * 0.9) // 10% discount
})

const annualSavings = computed(() => {
  return ((totalMonthlyRent.value * 12) - annualRent.value) + totalCommonFee.value // 10% discount + 1 month common fee waived
})

const contractTotal = computed(() => {
  const entry = totalEntryFee.value
  const deposit = totalDepositFee.value
  const common = totalCommonFee.value

  if (paymentSchedule.value === 'annual') {
    return entry + annualRent.value + deposit + (common * 11)
  }
  if (paymentSchedule.value === 'quarterly') {
    return entry + quarterlyRent.value + deposit + (common * 3)
  }
  return entry + totalMonthlyRent.value + deposit + common
})

// Dynamic Breadcrumb based on View Mode
const currentBreadcrumbText = computed(() => {
  if (currentStep.value === 1) {
    return mapViewMode.value === 'projects'
      ? 'จองแผงเช่า (ผังโครงการรวม)'
      : `จองแผงเช่า (${selectedProject.value?.name || 'โครงการที่ 23'})`
  }
  if (currentStep.value === 2) return 'กรอกข้อมูลเพื่อเยี่ยมชมแผง'
  return 'ตรวจสอบและยืนยัน'
})

// Input Formatters (QA & UX)
const formatThaiId = (val: string) => {
  const raw = val.replace(/[^0-9]/g, '').slice(0, 13)
  if (raw.length <= 1) return raw
  if (raw.length <= 5) return `${raw.slice(0, 1)}-${raw.slice(1)}`
  if (raw.length <= 10) return `${raw.slice(0, 1)}-${raw.slice(1, 5)}-${raw.slice(5)}`
  if (raw.length <= 12) return `${raw.slice(0, 1)}-${raw.slice(1, 5)}-${raw.slice(5, 10)}-${raw.slice(10)}`
  return `${raw.slice(0, 1)}-${raw.slice(1, 5)}-${raw.slice(5, 10)}-${raw.slice(10, 12)}-${raw.slice(12, 13)}`
}

const handleIdCardInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  bookingForm.value.idCard = formatThaiId(target.value)
}

const handlePhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const raw = target.value.replace(/[^0-9]/g, '').slice(0, 10)
  if (raw.length <= 3) {
    bookingForm.value.phone = raw
  } else if (raw.length <= 6) {
    bookingForm.value.phone = `${raw.slice(0, 3)}-${raw.slice(3)}`
  } else {
    bookingForm.value.phone = `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`
  }
}

const generateStallsForProject = (project: any, realStall20a?: any) => {
  const upper: StallModel[] = []
  const lower: StallModel[] = []

  const isProj23 = project.id === 'proj-23' || project.name.includes('23')
  const numOnly = project.name.replace(/[^0-9]/g, '') || '1'
  const prefix = isProj23 ? '' : `P${numOnly}-`

  const specialStalls: Record<string, 'available' | 'reserved' | 'occupied'> = isProj23
    ? {
        '20A': 'available',
        '20B': 'available',
        'A-03': 'reserved',
        'A-05': 'available',
        'B-04': 'reserved',
        'C-02': 'available',
        'D-01': 'available'
      }
    : {
        [`${prefix}01`]: 'available',
        [`${prefix}05`]: 'available',
        [`${prefix}12`]: 'available',
        [`${prefix}03`]: 'reserved',
        [`${prefix}08`]: 'reserved'
      }

  for (let r = 1; r <= 5; r++) {
    for (let c = 1; c <= 14; c++) {
      let code = ''
      if (isProj23) {
        code = r === 2 && c === 12 ? '20A' : `U-${r}${String.fromCharCode(64 + c)}`
      } else {
        code = r === 2 && c === 12 ? `${prefix}20A` : `${prefix}U${r}${String.fromCharCode(64 + c)}`
      }

      let status: 'available' | 'reserved' | 'occupied' = 'occupied'
      if (specialStalls[code]) {
        status = specialStalls[code]
      } else if ((r === 1 && c === 4) || (r === 2 && c === 6) || (r === 3 && c === 11) || (r === 4 && c === 2)) {
        status = 'available'
      } else if ((r === 2 && c === 10) || (r === 4 && c === 5)) {
        status = 'reserved'
      }

      upper.push({
        code,
        zone: project.name,
        status,
        areaType: code.includes('20A') || code.includes('01') ? 'ติดเวที' : 'ทั่วไป',
        size: 5,
        entryFee: 75000,
        monthlyRent: 1800,
        commonFee: 500,
        depositFee: 1800,
        photo: '/images/stall_3d_perspective.jpg',
        backendId: isProj23 && code === '20A' && realStall20a ? realStall20a.id : undefined
      })
    }
  }

  for (let r = 1; r <= 4; r++) {
    for (let c = 1; c <= 14; c++) {
      let code = ''
      if (isProj23) {
        code = `L-${r}${String.fromCharCode(64 + c)}`
      } else {
        code = `${prefix}L${r}${String.fromCharCode(64 + c)}`
      }

      let status: 'available' | 'reserved' | 'occupied' = 'occupied'
      if ((r === 1 && c === 1) || (r === 2 && c === 5) || (r === 3 && c === 8) || (r === 4 && c === 13)) {
        status = 'available'
      } else if (r === 2 && c === 11) {
        status = 'reserved'
      }

      lower.push({
        code,
        zone: project.name,
        status,
        areaType: 'ทั่วไป',
        size: 5,
        entryFee: 75000,
        monthlyRent: 1800,
        commonFee: 500,
        depositFee: 1800,
        photo: '/images/stall_3d_perspective.jpg'
      })
    }
  }

  upperHallStalls.value = upper
  lowerHallStalls.value = lower

  // Do NOT auto-select stall! Let the tenant choose themselves.
}

const handleSelectProject = (project: any) => {
  selectedProject.value = project
  selectedStalls.value = [] // Reset selected stalls so tenant chooses freely!
  generateStallsForProject(project)
  mapViewMode.value = 'stalls'
  window.scrollTo({ top: 120, behavior: 'smooth' })
}

const handleNextFromStep1 = () => {
  if (mapViewMode.value === 'projects') {
    mapViewMode.value = 'stalls'
    window.scrollTo({ top: 120, behavior: 'smooth' })
  } else {
    if (selectedStalls.value.length === 0) {
      showWarning('กรุณาคลิกเลือกแผงเช่าที่ต้องการอย่างน้อย 1 แผงก่อนดำเนินการต่อ', 'แจ้งเตือนการเลือกแผง')
      return
    }
    goToStep(2)
  }
}

// Drawing logic
const getCanvasPos = (clientX: number, clientY: number) => {
  if (!signatureCanvas.value) return { x: 0, y: 0 }
  const rect = signatureCanvas.value.getBoundingClientRect()
  const scaleX = signatureCanvas.value.width / rect.width
  const scaleY = signatureCanvas.value.height / rect.height
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  }
}

const startDrawing = (e: MouseEvent) => {
  if (!signatureCanvas.value) return
  sigCtx = signatureCanvas.value.getContext('2d')
  if (!sigCtx) return
  isDrawing = true
  const pos = getCanvasPos(e.clientX, e.clientY)
  sigCtx.beginPath()
  sigCtx.moveTo(pos.x, pos.y)
  sigCtx.strokeStyle = '#1e3a8a'
  sigCtx.lineWidth = 2.5
  sigCtx.lineCap = 'round'
  sigCtx.lineJoin = 'round'
}

const draw = (e: MouseEvent) => {
  if (!isDrawing || !sigCtx) return
  const pos = getCanvasPos(e.clientX, e.clientY)
  sigCtx.lineTo(pos.x, pos.y)
  sigCtx.stroke()
  signatureDrawn.value = true
}

const stopDrawing = () => {
  isDrawing = false
}

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length > 0) {
    const t = e.touches[0]
    if (!signatureCanvas.value) return
    sigCtx = signatureCanvas.value.getContext('2d')
    if (!sigCtx) return
    isDrawing = true
    const pos = getCanvasPos(t.clientX, t.clientY)
    sigCtx.beginPath()
    sigCtx.moveTo(pos.x, pos.y)
    sigCtx.strokeStyle = '#1e3a8a'
    sigCtx.lineWidth = 2.5
    sigCtx.lineCap = 'round'
    sigCtx.lineJoin = 'round'
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length > 0 && isDrawing && sigCtx) {
    const t = e.touches[0]
    const pos = getCanvasPos(t.clientX, t.clientY)
    sigCtx.lineTo(pos.x, pos.y)
    sigCtx.stroke()
    signatureDrawn.value = true
  }
}

const clearSignature = () => {
  if (!signatureCanvas.value) return
  const ctx = signatureCanvas.value.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height)
  }
  signatureDrawn.value = false
}

const autoSign = () => {
  if (!signatureCanvas.value) return
  const ctx = signatureCanvas.value.getContext('2d')
  if (!ctx) return
  clearSignature()
  ctx.strokeStyle = '#1e3a8a'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Draw cursive signature
  ctx.beginPath()
  ctx.moveTo(80, 70)
  ctx.bezierCurveTo(95, 30, 110, 30, 125, 65)
  ctx.bezierCurveTo(140, 90, 155, 35, 175, 55)
  ctx.bezierCurveTo(195, 75, 210, 45, 230, 60)
  ctx.bezierCurveTo(250, 75, 270, 35, 290, 50)
  ctx.bezierCurveTo(310, 65, 340, 40, 370, 60)
  ctx.moveTo(90, 85)
  ctx.bezierCurveTo(180, 80, 270, 95, 380, 78)
  ctx.stroke()

  signatureDrawn.value = true
}

// Confetti Engine
const confettiCanvas = ref<HTMLCanvasElement | null>(null)
const launchConfetti = () => {
  nextTick(() => {
    if (!confettiCanvas.value) return
    const canvas = confettiCanvas.value
    canvas.width = canvas.parentElement?.clientWidth || 560
    canvas.height = canvas.parentElement?.clientHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      rotation: number
      vRot: number
    }> = []

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 60,
        y: canvas.height / 3 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -10 - 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10
      })
    }

    let frames = 0
    const render = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.35
        p.vx *= 0.98
        p.rotation += p.vRot

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      })
      frames++
      if (frames < 120) {
        requestAnimationFrame(render)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    render()
  })
}

// AI Smart ID Scan Trigger
const triggerIdScan = () => {
  scanningId.value = true
  setTimeout(() => {
    scanningId.value = false
    idVerified.value = true
    bookingForm.value.firstName = 'สมชาย'
    bookingForm.value.lastName = 'ใจดี'
    bookingForm.value.idCard = '1-1004-98721-34-5'
    bookingForm.value.phone = '087-567-4497'
    bookingForm.value.email = 'somchai.jai@thaigov.or.th'
  }, 1100)
}

// Pass Actions (QA & UX)
const copyRefCode = async () => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(bookingRefCode.value)
    }
    copiedRef.value = true
    setTimeout(() => { copiedRef.value = false }, 2500)
  } catch {}
}

const printPass = () => {
  window.print()
}

const addToCalendar = () => {
  const stallCodes = selectedStalls.value.map(s => s.code).join(', ') || '20A'
  const title = `นัดหมายเยี่ยมชมแผง ${stallCodes} - ${currentMarketName.value}`
  const details = `นัดหมายเข้าชมพื้นที่แผงเช่ากับเจ้าหน้าที่ รหัสอ้างอิง: ${bookingRefCode.value}`
  const dateStr = (bookingForm.value.visitDate || '').replace(/-/g, '')
  const icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:${details}\nDTSTART:${dateStr}T130000\nDTEND:${dateStr}T140000\nEND:VEVENT\nEND:VCALENDAR`
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `visit-stall-${bookingRefCode.value}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const selectStall = (s: StallModel) => {
  if (s.status === 'occupied') {
    return
  }

  // Toggle off if clicking an already selected stall
  const existingIdx = selectedStalls.value.findIndex(item => item.code === s.code)
  if (existingIdx !== -1) {
    selectedStalls.value.splice(existingIdx, 1)
    if (activeWaitingStallCode.value === s.code) {
      activeWaitingStallCode.value = selectedStalls.value[0]?.code || ''
    }
    return
  }

  // Conflict Prevention Rule (BA & UX Requirement):
  // Cannot select stalls with status 'available' and 'reserved' together in the same booking!
  if (selectedStalls.value.length > 0) {
    const activeStatus = currentSelectionStatus.value
    if (s.status !== activeStatus) {
      pendingConflictingStall.value = s
      if (s.status === 'reserved') {
        fetchWaitingQueueForStall(s.code)
      }
      showConflictModal.value = true
      return
    }
  }

  // Same status (or first stall) -> add to selection!
  selectedStalls.value.push(s)
  if (s.status === 'reserved') {
    activeWaitingStallCode.value = s.code
    fetchWaitingQueueForStall(s.code)
  }
}

const removeStall = (code: string) => {
  selectedStalls.value = selectedStalls.value.filter(item => item.code !== code)
  if (activeWaitingStallCode.value === code) {
    activeWaitingStallCode.value = selectedStalls.value[0]?.code || ''
  }
}

const clearAllSelectedStalls = () => {
  selectedStalls.value = []
  activeWaitingStallCode.value = ''
}

const resolveConflictAndSelect = () => {
  if (pendingConflictingStall.value) {
    const stall = pendingConflictingStall.value
    selectedStalls.value = [stall]
    if (stall.status === 'reserved') {
      activeWaitingStallCode.value = stall.code
      fetchWaitingQueueForStall(stall.code)
    }
    pendingConflictingStall.value = null
  }
  showConflictModal.value = false
}

const cancelConflictModal = () => {
  pendingConflictingStall.value = null
  showConflictModal.value = false
}

const getStallClass = (s: StallModel) => {
  const isSelected = isStallSelected(s.code)
  const isConflict = currentSelectionStatus.value && s.status !== currentSelectionStatus.value && s.status !== 'occupied'
  let isDimmed = onlyAvailable.value && s.status !== 'available'
  if (zoneFilter.value === 'hotspot') {
    const isHotspot = s.code === '20A' || s.code === '20B' || s.code.endsWith('A') || s.code.endsWith('N')
    if (!isHotspot) isDimmed = true
  } else if (zoneFilter.value === 'stage') {
    const isStage = s.code === '20A' || s.code === '20B' || s.code.startsWith('U-2')
    if (!isStage) isDimmed = true
  }
  return {
    'is-available': s.status === 'available',
    'is-reserved': s.status === 'reserved',
    'is-occupied': s.status === 'occupied',
    'is-selected': isSelected,
    'is-dimmed': isDimmed,
    'is-conflict-mode': isConflict,
    'traffic-hotspot': showTrafficHeatmap.value && (s.code === '20A' || s.code === '20B' || s.areaType === 'ติดเวที')
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'available': return 'ว่าง'
    case 'reserved': return 'ติดจอง'
    default: return 'กำลังใช้งาน'
  }
}

// Pan & Zoom Engine for Stalls Floorplan
const stallsPanX = ref(0)
const stallsPanY = ref(0)
const isStallsDragging = ref(false)
const hasStallsDragged = ref(false)
let stallsDragStart = { x: 0, y: 0 }

const zoomIn = () => {
  if (zoomLevel.value < 2.4) {
    zoomLevel.value = Math.min(2.4, +(zoomLevel.value + 0.2).toFixed(2))
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.6) {
    zoomLevel.value = Math.max(0.6, +(zoomLevel.value - 0.2).toFixed(2))
  }
}

const recenterMap = () => {
  zoomLevel.value = 1
  stallsPanX.value = 0
  stallsPanY.value = 0
}

const handleStallsWheel = (e: WheelEvent) => {
  const factor = e.deltaY < 0 ? 1.15 : 0.88
  zoomLevel.value = Math.min(2.4, Math.max(0.6, +(zoomLevel.value * factor).toFixed(2)))
}

const onStallsMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return
  isStallsDragging.value = true
  hasStallsDragged.value = false
  stallsDragStart = { x: e.clientX - stallsPanX.value, y: e.clientY - stallsPanY.value }
}

const onStallsMouseMove = (e: MouseEvent) => {
  if (!isStallsDragging.value) return
  const dx = e.clientX - stallsDragStart.x
  const dy = e.clientY - stallsDragStart.y
  if (Math.abs(dx - stallsPanX.value) > 4 || Math.abs(dy - stallsPanY.value) > 4) {
    hasStallsDragged.value = true
  }
  stallsPanX.value = dx
  stallsPanY.value = dy
}

const onStallsMouseUp = () => {
  isStallsDragging.value = false
}

const goToStep = (step: number) => {
  if (step === 2 && selectedStalls.value.length === 0) {
    showWarning('กรุณาคลิกเลือกแผงเช่าที่ต้องการก่อนดำเนินการต่อ', 'แจ้งเตือนการเลือกแผง')
    return
  }
  currentStep.value = step
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const setStep = (step: number) => {
  goToStep(step)
}

const formatThaiDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear() + 543}`
}

const submitBooking = async () => {
  if (selectedStalls.value.length === 0) {
    showWarning('ไม่พบรายการแผงที่เลือก กรุณาเลือกแผงเช่าก่อนดำเนินการ', 'แจ้งเตือนการเลือกแผง')
    return
  }
  submitting.value = true
  try {
    const list = await get('/stalls')
    const createdBookingNumbers: string[] = []

    // Independent booking record per stall (Prevents stuck/blocked workflow!)
    for (const stallItem of selectedStalls.value) {
      let stallId = stallItem.backendId
      if (!stallId) {
        const target = list.find((s: any) => s.stall_number === stallItem.code) || list[0]
        stallId = target.id
      }

      const res = await post('/bookings', {
        stall_id: stallId,
        tenant_name: `${bookingForm.value.firstName} ${bookingForm.value.lastName}`.trim(),
        tenant_phone: bookingForm.value.phone.trim(),
        tenant_email: bookingForm.value.email?.trim() || null,
        intended_business: bookingForm.value.business,
        visit_date: bookingForm.value.visitDate,
        visit_time_slot: bookingForm.value.visitSlot
      })

      if (res?.booking_number) {
        createdBookingNumbers.push(res.booking_number)
      }
    }

    const randomDigits = Math.floor(10000 + Math.random() * 90000)
    bookingRefCode.value = createdBookingNumbers.length > 0
      ? createdBookingNumbers.join(', ')
      : `BMA-JJ-2026-${randomDigits}`
    showSuccessModal.value = true
    launchConfetti()
  } catch (err: any) {
    showError(err?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกคำขอจอง กรุณาลองใหม่อีกครั้ง')
  } finally {
    submitting.value = false
  }
}

// Keyboard shortcuts (QA & Dev)
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    showSuccessModal.value = false
    showVirtualModal.value = false
    showCompareModal.value = false
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown)

  const marketQuery = route.query.market
  if (marketQuery) {
    try {
      const markets = await get('/markets')
      const found = markets.find((m: any) => String(m.id) === String(marketQuery) || m.slug === marketQuery)
      if (found) {
        currentMarketName.value = found.name
        currentMarketDistrict.value = found.district
      }
    } catch (e) {
      console.warn('Could not fetch market:', e)
    }
  }

  let realStall20a: any = null
  try {
    const list = await get('/stalls')
    realStall20a = list.find((s: any) => s.stall_number === '20A')
  } catch {}

  // Initialize stalls for selected project without auto-selecting
  generateStallsForProject(selectedProject.value, realStall20a)
  selectedStall.value = null

  // If a specific stall was requested via URL query (?stall=20A), select it
  if (route.query.stall) {
    const targetCode = String(route.query.stall).trim()
    const found = upperHallStalls.value.find(s => s.code === targetCode) || lowerHallStalls.value.find(s => s.code === targetCode)
    if (found && found.status === 'available') {
      selectedStall.value = found
    }
  }

  if (user.value) {
    if (user.value.full_name) {
      const parts = user.value.full_name.split(' ')
      bookingForm.value.firstName = parts[0] || 'สมชาย'
      bookingForm.value.lastName = parts.slice(1).join(' ') || 'ใจดี'
    }
    if (user.value.email) {
      bookingForm.value.email = user.value.email
    }
  }

  // Prefetch demo waiting list queues
  fetchWaitingQueueForStall('A-03')
  fetchWaitingQueueForStall('B-04')
  fetchWaitingQueueForStall('02A')
  fetchWaitingQueueForStall('U-2J')
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* Map Canvas Controls */
.map-ctrl-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: all 0.15s ease;
}

.map-ctrl-btn:hover {
  background: #f8fafc;
  color: var(--primary);
  border-color: #cbd5e1;
}

/* View Mode Segmented Tab Switcher */
.view-mode-tabs-container {
  display: flex;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 4px;
  border-radius: 20px;
  gap: 4px;
}

.view-mode-tab-btn {
  border: none;
  background: transparent;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.view-mode-tab-btn:hover {
  color: var(--primary);
}

.view-mode-tab-btn.active {
  background: #ffffff;
  color: var(--primary);
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Zone Filter Pills Bar */
.zone-filter-bar {
  display: flex;
  gap: 6px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 20px;
  border: 1px solid #cbd5e1;
}

.zone-pill-btn {
  border: none;
  background: transparent;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.zone-pill-btn.active {
  background: #ffffff;
  color: var(--primary);
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* Floorplan Landmark Banners */
.floorplan-landmark-tag {
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(4px);
  color: #ffffff;
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.floorplan-landmark-tag.entrance {
  background: #1e3a8a;
  border: 1px solid #60a5fa;
}

.floorplan-landmark-tag.stage {
  background: #0f172a;
  border: 1px solid #f59e0b;
  color: #fef3c7;
}

/* Building Layout Perimeter Shape */
.building-polygon-border {
  border: 2px solid #cbd5e1;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  position: relative;
  transition: all 0.3s ease;
}

.building-polygon-border.with-heatmap-glow {
  box-shadow: 0 0 24px rgba(245, 158, 11, 0.25);
  border-color: #f59e0b;
}

/* Stalls Grid Sections */
.stalls-grid-section {
  display: grid;
  grid-template-columns: repeat(14, 28px);
  gap: 8px;
  justify-content: center;
}

.market-aisle-divider {
  margin: 14px 0;
  padding: 6px;
  background: #f1f5f9;
  border-radius: 6px;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
}

.market-aisle-divider.traffic-hot {
  background: linear-gradient(90deg, #fee2e2 0%, #fef3c7 50%, #fee2e2 100%);
  color: #b45309;
  font-weight: 800;
  border: 1px dashed #f59e0b;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
}

/* Individual Stall Box */
.stall-box-item {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.65rem;
  font-weight: 700;
  position: relative;
  transition: all 0.15s ease;
  user-select: none;
}

.stall-mini-code {
  display: none;
}

.stall-box-item.is-occupied {
  background-color: #cbd5e1;
  border: 1px solid #94a3b8;
  cursor: not-allowed;
}

.stall-box-item.is-reserved {
  background-color: #fbbf24;
  border: 1px solid #d97706;
}

.stall-box-item.is-available {
  background-color: #34d399;
  border: 1px solid #059669;
}

.stall-box-item.is-available:hover {
  transform: scale(1.15);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

.stall-box-item.is-selected {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
  transform: scale(1.2);
  z-index: 5;
}

.stall-box-item.traffic-hotspot {
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
  border-color: #ef4444;
}

.stall-box-item.is-dimmed {
  opacity: 0.2;
}

.selected-check {
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 800;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* AI Smart ID Card Scanner */
.smart-id-scan-card {
  border-radius: 14px;
}

.id-card-thumb-wrap {
  width: 78px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  border: 1px solid #93c5fd;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
  flex-shrink: 0;
}

.laser-scanner-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #ef4444, #f87171, #ef4444, transparent);
  box-shadow: 0 0 8px #ef4444;
  animation: laserSweep 1.2s infinite ease-in-out;
}

@keyframes laserSweep {
  0% { top: 0%; opacity: 0.2; }
  50% { top: 90%; opacity: 1; }
  100% { top: 0%; opacity: 0.2; }
}

.input-verified-glow {
  border-color: #10b981 !important;
  background-color: #f0fdf4 !important;
}

/* Interactive Time Slot Cards */
.time-slot-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.time-slot-card {
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-slot-card:hover {
  border-color: #93c5fd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
}

.time-slot-card.selected {
  border-color: var(--primary);
  background: #eff6ff;
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

.slot-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.slot-card-icon {
  font-size: 1.2rem;
}

.slot-card-time {
  font-size: 0.92rem;
  color: #0f172a;
}

.slot-card-capacity {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 6px;
}

.cap-low {
  background: #fee2e2;
  color: #dc2626;
}

.cap-med {
  background: #fef3c7;
  color: #d97706;
}

.cap-high {
  background: #dcfce7;
  color: #15803d;
}

.slot-card-note {
  font-size: 0.74rem;
  color: #64748b;
  line-height: 1.3;
}

/* Payment Schedule Grid (BA Perspective) */
.payment-schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.schedule-card {
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  position: relative;
  background: #ffffff;
  transition: all 0.2s ease;
}

.schedule-card:hover {
  border-color: #93c5fd;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.08);
}

.schedule-card.active {
  border-color: var(--primary);
  background: #f8faff;
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.25);
}

.schedule-badge {
  position: absolute;
  top: -10px;
  right: 12px;
  background: #10b981;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}

.schedule-badge.gold {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}

.schedule-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.92rem;
  color: #0f172a;
}

.schedule-price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e40af;
  margin-bottom: 4px;
}

.schedule-price .unit {
  font-size: 0.78rem;
  font-weight: 500;
  color: #64748b;
}

.schedule-desc {
  font-size: 0.76rem;
  color: #64748b;
  line-height: 1.35;
}

/* 3D Virtual Tour Hotspot Pins */
.virtual-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  z-index: 10;
}

.pin-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ef4444;
  border: 3px solid #ffffff;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
  animation: pulsePin 1.5s infinite;
}

@keyframes pulsePin {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
}

.pin-label {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(4px);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Confetti Overlay */
.confetti-canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20;
}

/* Bottom Map Style Switcher */
.map-style-switcher {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  padding: 6px 10px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.style-thumb {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.style-thumb.active {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.thumb-preview {
  width: 44px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
}

.thumb-preview.standard {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
}

.thumb-preview.dark {
  background: #1e293b;
}

.thumb-preview.satellite {
  background: linear-gradient(135deg, #334155 0%, #15803d 100%);
}

.style-thumb span {
  font-size: 0.68rem;
  font-weight: 600;
  color: #475569;
}

/* Bottom Legend */
.map-bottom-legend {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.legend-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #475569;
  font-weight: 500;
}

.legend-box {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-box.occupied {
  background: #cbd5e1;
}

.legend-box.reserved {
  background: #fbbf24;
}

.legend-box.available {
  background: #34d399;
}

/* Transitions & Animations */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

@keyframes bounceLeft {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-7px);
  }
}

.stalls-interactive-canvas.is-panning {
  cursor: grabbing !important;
}

/* Floating Zoom Controls */
.map-floating-zoom-ctrl {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 6px;
  border-radius: 12px;
  border: 1px solid #bfdbfe;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
}

.zoom-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #1e3a8a;
  font-size: 1.15rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}

.zoom-btn:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #2563eb;
  transform: scale(1.06);
}

.zoom-btn.reset-btn {
  font-size: 0.85rem;
}

.zoom-level-pill {
  font-size: 0.68rem;
  font-weight: 800;
  color: #475569;
  text-align: center;
  padding: 3px 2px;
  cursor: pointer;
  background: #f1f5f9;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  user-select: none;
  transition: all 0.15s ease;
}

.zoom-level-pill:hover {
  background: #e2e8f0;
  color: #1e3a8a;
}

.hand-pointing-icon {
  animation: bounceLeft 1.5s infinite ease-in-out;
}

/* Multi-Stall Selection Status Bar */
.selection-status-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  border-radius: 12px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  line-height: 1.4;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  position: relative;
  z-index: 10;
}

.status-available-mode {
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  border: 1.5px solid #6ee7b7;
  color: #065f46;
}

.status-reserved-mode {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1.5px solid #fcd34d;
  color: #92400e;
}

.selection-status-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selection-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.status-available-mode .selection-status-dot {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
  animation: pulse 1.8s infinite;
}

.status-reserved-mode .selection-status-dot {
  background: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25);
  animation: pulse 1.8s infinite;
}

.selection-status-right {
  flex-shrink: 0;
}

.btn-clear-selection {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  color: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-clear-selection:hover {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Selected Stall Chips */
.selected-stalls-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stall-chip {
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.18s ease;
}

.stall-chip.chip-available {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.stall-chip.chip-reserved {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.stall-chip-remove {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  font-size: 9px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  padding: 0;
  transition: all 0.15s ease;
}

.stall-chip-remove:hover {
  background: rgba(0, 0, 0, 0.25);
  color: #ffffff;
  transform: scale(1.1);
}

/* Conflict Mode Styling for Floorplan Stalls */
.stall-box-item.is-conflict-mode {
  opacity: 0.38 !important;
  filter: grayscale(0.65) !important;
  position: relative;
  cursor: not-allowed;
}

.stall-box-item.is-conflict-mode:hover {
  opacity: 0.7 !important;
  filter: grayscale(0) !important;
  outline: 2px dashed #f59e0b;
  outline-offset: 2px;
  cursor: pointer;
}

/* Floorplan Stall Queue Pill */
.stall-queue-pill {
  position: absolute;
  top: 1px;
  right: 1px;
  background: #d97706;
  color: #ffffff;
  font-size: 0.52rem;
  font-weight: 800;
  line-height: 1;
  padding: 1.5px 3px;
  border-radius: 3px;
  letter-spacing: -0.02em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  z-index: 2;
}

/* Custom Smooth Scrollbar for Selected Stall Drawer */
.selected-stall-drawer {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.selected-stall-drawer::-webkit-scrollbar {
  width: 6px;
}

.selected-stall-drawer::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 8px;
  margin: 6px 0;
}

.selected-stall-drawer::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 8px;
}

.selected-stall-drawer::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
