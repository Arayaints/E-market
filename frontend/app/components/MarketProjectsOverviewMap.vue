<template>
  <div class="projects-master-container">
    <!-- Top Interactive Filter & Quick Search Bar (UX/UI & Dev perspective) -->
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
          placeholder="ค้นหาโครงการหรือหมวดหมู่สินค้า... (เช่น 23, แฟชั่น, เซรามิก, ภาพวาด)"
          class="map-search-input"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="clear-search-btn"
          @click="searchQuery = ''"
          title="ล้างคำค้นหา"
        >
          ✕
        </button>
      </div>

      <!-- Quick KPI Chips -->
      <div class="quick-kpi-chips">
        <div class="kpi-chip">
          <span class="kpi-dot blue"></span>
          <span><strong>30</strong> โครงการ</span>
        </div>
        <div class="kpi-chip">
          <span class="kpi-dot green"></span>
          <span>ว่าง <strong>{{ totalAvailableCount }}</strong> แผง</span>
        </div>
        <div class="kpi-chip highlight">
          <span>เริ่มต้น <strong>฿1,800</strong>/เดือน</span>
        </div>
      </div>
    </div>

    <!-- SVG Master Plan Canvas with Interactive Pan & Zoom -->
    <div
      class="projects-svg-wrapper"
      :class="{ 'is-panning': isDragging }"
      @wheel.prevent="handleWheel"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Floating Map Zoom Controls (Top-Left) -->
      <div class="map-floating-zoom-ctrl">
        <button type="button" class="zoom-btn" @click.stop="zoomIn" title="ซูมเข้า">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <div class="zoom-level-pill" @click.stop="recenterMap" title="คลิกเพื่อรีเซ็ตขนาด 100%">
          {{ Math.round(zoomLevel * 100) }}%
        </div>
        <button type="button" class="zoom-btn" @click.stop="zoomOut" title="ซูมออก">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button type="button" class="zoom-btn reset-btn" @click.stop="recenterMap" title="กลับสู่จุดศูนย์กลาง">
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

      <!-- Quick Zoom Tip Overlay -->
      <div class="zoom-hint-pill">
        <span>หมุนลูกกลิ้งเมาส์ หรือคลิกปุ่มเพื่อซูม | ลากเพื่อเลื่อนผัง</span>
      </div>

      <svg
        viewBox="0 0 1060 740"
        class="master-map-svg"
        :class="`style-${mapStyle}`"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <!-- Shadow for buildings -->
          <filter id="building-shadow" x="-8%" y="-8%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.14" />
          </filter>
          <filter id="hover-glow" x="-15%" y="-15%" width="135%" height="135%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#2563eb" flood-opacity="0.65" />
          </filter>
          <filter id="highlight-pulse" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#10b981" flood-opacity="0.8" />
          </filter>
          
          <!-- Railway Pattern -->
          <pattern id="rail-ties" width="12" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
            <line x1="0" y1="7" x2="12" y2="7" stroke="#1e3a8a" stroke-width="2.5" />
            <line x1="6" y1="0" x2="6" y2="14" stroke="#475569" stroke-width="2" />
          </pattern>
        </defs>

        <!-- Static Canvas Base Fill -->
        <rect width="1060" height="740" fill="#f4f0e8" />

        <!-- Transform Viewport Group for all Spatial Objects -->
        <g
          :transform="`translate(${panX}, ${panY}) scale(${zoomLevel})`"
          :style="{
            transformOrigin: '530px 370px',
            transition: isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
          }"
        >
          <!-- Extended Scalable Base Land to prevent clipping on pan -->
          <rect x="-600" y="-400" width="2260" height="1540" fill="#f4f0e8" />

        <!-- Surrounding Green Park Area (Chatuchak Park Top & Right) -->
        <path
          d="M 580 0 L 1060 0 L 1060 520 Q 940 480 880 380 Q 820 280 720 200 Q 640 120 580 0 Z"
          fill="#d8f3dc"
        />
        <!-- Park Lake / Water Feature -->
        <path
          d="M 850 60 Q 960 70 940 160 Q 900 220 830 180 Q 780 140 850 60 Z"
          fill="#b7e4c7"
          opacity="0.75"
        />

        <!-- Park Trees Scatter -->
        <g fill="#74c69d" opacity="0.65">
          <circle cx="680" cy="80" r="14" />
          <circle cx="720" cy="65" r="10" />
          <circle cx="890" cy="240" r="18" />
          <circle cx="940" cy="280" r="15" />
          <circle cx="980" cy="230" r="12" />
          <circle cx="1020" cy="380" r="16" />
          <circle cx="970" cy="440" r="14" />
          <circle cx="820" cy="110" r="12" />
        </g>

        <!-- BTS / MRT Rail Track Line at Bottom Right -->
        <g>
          <!-- Rail bed -->
          <path d="M 280 740 Q 600 730 840 680 L 1060 560 L 1060 585 L 830 710 Q 590 755 280 760 Z" fill="#cbd5e1" opacity="0.7" />
          <!-- Rail Lines -->
          <path d="M 280 735 Q 600 725 840 675 L 1060 555" fill="none" stroke="#2563eb" stroke-width="5" stroke-linecap="round" />
          <path d="M 280 745 Q 600 735 840 685 L 1060 565" fill="none" stroke="#1d4ed8" stroke-width="2.5" />
          <!-- Railway ties decoration -->
          <path d="M 280 740 Q 600 730 840 680 L 1060 560" fill="none" stroke="#475569" stroke-width="12" stroke-dasharray="2 8" opacity="0.5" />
        </g>

        <!-- Main Road Networks (Asphalt Streets in White with subtle border) -->
        <!-- Outer Ring Highway -->
        <path
          d="M -10 320 L 160 210 Q 320 100 520 180 Q 720 260 1060 380 L 1060 440 Q 720 320 520 240 Q 320 160 140 260 L -10 370 Z"
          fill="#ffffff"
          stroke="#e2ded4"
          stroke-width="2"
        />

        <!-- Western Diagonal Road (Kamphaeng Phet 2 Rd) -->
        <path
          d="M 60 740 L 40 740 L -20 480 L 160 210 L 220 250 L 70 510 Z"
          fill="#ffffff"
          stroke="#e2ded4"
          stroke-width="2"
        />

        <!-- Inner Aisle Loop Roads (Surrounding the Project Stalls) -->
        <path
          d="M 120 450 Q 240 270 420 240 L 520 250 Q 760 320 950 430 L 930 490 Q 760 370 510 300 Q 280 320 170 490 Z"
          fill="#ffffff"
          stroke="#ded9ce"
          stroke-width="1.5"
        />

        <!-- Southern Perimeter Boulevard (along Projects 04 & 05) -->
        <path
          d="M 220 670 L 820 670 Q 940 660 1020 600 L 1040 635 Q 940 705 810 710 L 210 710 Z"
          fill="#ffffff"
          stroke="#ded9ce"
          stroke-width="1.5"
        />

        <!-- Center Cross Aisle between Upper & Lower Rows -->
        <path
          d="M 290 535 L 750 535 Q 810 535 840 550 L 830 575 Q 800 562 740 562 L 290 562 Z"
          fill="#ffffff"
          opacity="0.85"
        />

        <!-- ============================================================== -->
        <!-- SPATIAL LANDMARKS & ORIENTATION ANCHORS (UX/UI WOW ELEMENT)     -->
        <!-- ============================================================== -->
        
        <!-- 1. CHATUCHAK CLOCK TOWER (หอนาฬิกาจตุจักร - Central Iconic Anchor) -->
        <g transform="translate(530, 420)" class="clock-tower-landmark" pointer-events="all">
          <!-- Animated glowing ripple ring -->
          <circle cx="0" cy="0" r="32" fill="#f59e0b" opacity="0.15" class="clock-pulse" />
          <circle cx="0" cy="0" r="22" fill="#ffffff" stroke="#d97706" stroke-width="2.5" filter="url(#building-shadow)" />
          <circle cx="0" cy="0" r="15" fill="#fef3c7" stroke="#b45309" stroke-width="1.5" />
          
          <!-- Tower Square Base & Pillar -->
          <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#78350f" />
          <circle cx="0" cy="0" r="6" fill="#ffffff" stroke="#b45309" stroke-width="1.2" />
          <!-- Clock Hands -->
          <line x1="0" y1="0" x2="0" y2="-4" stroke="#0f172a" stroke-width="1.2" stroke-linecap="round" />
          <line x1="0" y1="0" x2="3" y2="0" stroke="#dc2626" stroke-width="1" stroke-linecap="round" />
          
          <!-- Landmark Banner Callout -->
          <g transform="translate(0, -28)">
            <rect x="-56" y="-12" width="112" height="22" rx="11" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" filter="url(#building-shadow)" />
            <text x="0" y="3.5" font-size="9.5" font-weight="800" text-anchor="middle" fill="#fef3c7">หอนาฬิกาจตุจักร</text>
          </g>
        </g>

        <!-- 2. TRANSIT HUBS (MRT Kamphaeng Phet & BTS Mo Chit) -->
        <!-- MRT Kamphaeng Phet Exit 2 (Direct entry to Chatuchak Market) -->
        <g transform="translate(135, 275)" class="transit-landmark" pointer-events="all">
          <rect x="-44" y="-13" width="88" height="26" rx="13" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5" filter="url(#building-shadow)" />
          <g transform="translate(-32, -8) scale(0.68)" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="15" rx="3"></rect>
            <line x1="3" y1="11" x2="21" y2="11"></line>
            <circle cx="8" cy="14" r="1.5" fill="#fff"></circle>
            <circle cx="16" cy="14" r="1.5" fill="#fff"></circle>
            <line x1="6" y1="18" x2="4" y2="21"></line>
            <line x1="18" y1="18" x2="20" y2="21"></line>
          </g>
          <text x="4" y="4" font-size="8.5" font-weight="700" fill="#ffffff">MRT ทางออก 2</text>
        </g>

        <!-- BTS Mo Chit / MRT Chatuchak Park (North-East Main Transit Gate) -->
        <g transform="translate(970, 310)" class="transit-landmark" pointer-events="all">
          <rect x="-60" y="-14" width="120" height="28" rx="14" fill="#047857" stroke="#6ee7b7" stroke-width="1.5" filter="url(#building-shadow)" />
          <g transform="translate(-48, -9) scale(0.72)" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="15" rx="3"></rect>
            <line x1="3" y1="11" x2="21" y2="11"></line>
            <circle cx="8" cy="14" r="1.5" fill="#fff"></circle>
            <circle cx="16" cy="14" r="1.5" fill="#fff"></circle>
            <line x1="6" y1="18" x2="4" y2="21"></line>
            <line x1="18" y1="18" x2="20" y2="21"></line>
          </g>
          <text x="4" y="4.5" font-size="8.5" font-weight="700" fill="#ffffff">BTS หมอชิต / MRT</text>
        </g>

        <!-- 3. MAIN ENTRANCE GATES (ประตู 1, 2, 3) -->
        <!-- Gate 1 (Kamphaeng Phet 2 Rd) -->
        <g transform="translate(75, 470)">
          <rect x="-34" y="-11" width="68" height="22" rx="11" fill="#1e293b" stroke="#ffffff" stroke-width="1.2" filter="url(#building-shadow)" />
          <text x="0" y="3.5" font-size="8.5" font-weight="700" text-anchor="middle" fill="#f8fafc">ประตู 1</text>
        </g>

        <!-- Gate 2 (Kamphaeng Phet 3 Rd) -->
        <g transform="translate(430, 195)">
          <rect x="-34" y="-11" width="68" height="22" rx="11" fill="#1e293b" stroke="#ffffff" stroke-width="1.2" filter="url(#building-shadow)" />
          <text x="0" y="3.5" font-size="8.5" font-weight="700" text-anchor="middle" fill="#f8fafc">ประตู 2</text>
        </g>

        <!-- Gate 3 (Phahonyothin Rd) -->
        <g transform="translate(1015, 510)">
          <rect x="-34" y="-11" width="68" height="22" rx="11" fill="#1e293b" stroke="#ffffff" stroke-width="1.2" filter="url(#building-shadow)" />
          <text x="0" y="3.5" font-size="8.5" font-weight="700" text-anchor="middle" fill="#f8fafc">ประตู 3</text>
        </g>

        <!-- 4. VISITOR PARKING ZONES (P1 & P2) -->
        <g transform="translate(70, 660)" title="ที่จอดรถนักท่องเที่ยว P1 (กำแพงเพชร 2)">
          <rect x="-13" y="-13" width="26" height="26" rx="7" fill="#0284c7" stroke="#ffffff" stroke-width="1.5" filter="url(#building-shadow)" />
          <text x="0" y="4.5" font-size="11" font-weight="800" text-anchor="middle" fill="#ffffff">P1</text>
        </g>
        <g transform="translate(630, 140)" title="ที่จอดรถนักท่องเที่ยว P2 (สวนจตุจักร)">
          <rect x="-13" y="-13" width="26" height="26" rx="7" fill="#0284c7" stroke="#ffffff" stroke-width="1.5" filter="url(#building-shadow)" />
          <text x="0" y="4.5" font-size="11" font-weight="800" text-anchor="middle" fill="#ffffff">P2</text>
        </g>

        <!-- 5. BUS STOP & RESTROOM ICONS -->
        <g transform="translate(205, 275)" class="map-feature-icon" title="ป้ายหยุดรถโดยสารประจำทาง (Bus Stop)">
          <rect x="-11" y="-11" width="22" height="22" rx="6" fill="#1e293b" />
          <text x="0" y="3.5" font-size="8" font-weight="800" text-anchor="middle" fill="#ffffff">BUS</text>
        </g>
        <g transform="translate(540, 680)" class="map-feature-icon" title="ห้องสุขาสาธารณะ (Restrooms)">
          <circle cx="0" cy="0" r="11" fill="#0284c7" />
          <text x="0" y="3.5" font-size="7.5" font-weight="800" text-anchor="middle" fill="#ffffff">WC</text>
        </g>
        <g transform="translate(340, 526)" class="map-feature-icon" title="จุดบริการไฟฟ้า / หม้อแปลงหลัก">
          <rect x="-8" y="-8" width="16" height="16" rx="4" fill="#dc2626" />
          <path d="M 0 -5 L -3 0 L 0 0 L -1 5 L 4 -1 L 1 -1 Z" fill="#ffffff" />
        </g>
        <g transform="translate(170, 442)" class="map-feature-icon" title="จุดประชาสัมพันธ์และเสียงตามสาย">
          <circle cx="0" cy="0" r="9" fill="#f59e0b" />
          <text x="0" y="3" font-size="7.5" font-weight="800" text-anchor="middle" fill="#ffffff">INFO</text>
        </g>
        <g transform="translate(850, 450)" class="map-feature-icon" title="จุดประชาสัมพันธ์และเสียงตามสาย">
          <circle cx="0" cy="0" r="9" fill="#f59e0b" />
          <text x="0" y="3" font-size="7.5" font-weight="800" text-anchor="middle" fill="#ffffff">INFO</text>
        </g>

        <!-- ============================================================== -->
        <!-- THE 30 CHATUCHAK MARKET PROJECTS (BLOCKS)                       -->
        <!-- ============================================================== -->
        <g class="projects-layer">
          <g
            v-for="p in projects"
            :key="p.id"
            class="project-node-group"
            :class="{
              'is-selected': selectedProjectId === p.id,
              'is-dimmed': isProjectDimmed(p),
              'is-highlighted': isProjectHighlighted(p),
              'is-hovered': hoveredProject?.id === p.id
            }"
            @click="handleProjectClick(p)"
            @mouseenter="handleMouseEnter(p, $event)"
            @mouseleave="handleMouseLeave"
          >
            <!-- Project Polygon / Rectangle Box -->
            <rect
              :x="p.x"
              :y="p.y"
              :width="p.w"
              :height="p.h"
              :rx="p.rx || 8"
              :transform="p.rotate ? `rotate(${p.rotate}, ${p.x + p.w / 2}, ${p.y + p.h / 2})` : undefined"
              :fill="p.color"
              class="project-box-rect"
              :filter="isProjectHighlighted(p) ? 'url(#highlight-pulse)' : 'url(#building-shadow)'"
            />

            <!-- Project Label Text -->
            <text
              :x="p.x + p.w / 2"
              :y="p.y + p.h / 2 + (p.h > 30 ? 4 : 3)"
              :transform="p.rotate ? `rotate(${p.rotate}, ${p.x + p.w / 2}, ${p.y + p.h / 2})` : undefined"
              class="project-box-label"
              :class="{ 'label-small': p.w < 50 || p.h < 26, 'label-vertical': p.h > p.w * 1.3 }"
              text-anchor="middle"
            >
              {{ p.name }}
            </text>

            <!-- Available Stalls Badge Dot -->
            <circle
              v-if="p.stallsAvailable > 0"
              :cx="p.x + p.w - 6"
              :cy="p.y + 6"
              :transform="p.rotate ? `rotate(${p.rotate}, ${p.x + p.w / 2}, ${p.y + p.h / 2})` : undefined"
              r="4"
              fill="#ffffff"
              stroke="#10b981"
              stroke-width="1.5"
              class="available-dot"
            />
          </g>
        </g>
        </g>
      </svg>

      <!-- Floating Hover Tooltip (Enhanced with Occupancy & Rent Range) -->
      <transition name="fade">
        <div
          v-if="hoveredProject"
          class="project-hover-tooltip card"
          :style="{ top: `${tooltipPos.y}px`, left: `${tooltipPos.x}px` }"
        >
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <strong style="font-size: 1rem; color: #0f172a;">{{ hoveredProject.name }}</strong>
            <span class="badge badge-available" style="font-size: 0.72rem; padding: 2px 8px;">
              ว่าง {{ hoveredProject.stallsAvailable }} แผง
            </span>
          </div>
          
          <div style="font-size: 0.82rem; color: #475569; margin-bottom: 8px; line-height: 1.4; display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; color: #64748b;">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            <span>{{ hoveredProject.category }}</span>
          </div>

          <!-- Stalls Progress Bar -->
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #64748b; margin-bottom: 3px;">
              <span>อัตราแผงว่าง</span>
              <span>{{ Math.round((hoveredProject.stallsAvailable / hoveredProject.totalStalls) * 100) }}% ({{ hoveredProject.stallsAvailable }}/{{ hoveredProject.totalStalls }})</span>
            </div>
            <div style="width: 100%; height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div
                :style="{
                  width: `${(hoveredProject.stallsAvailable / hoveredProject.totalStalls) * 100}%`,
                  height: '100%',
                  background: '#10b981',
                  borderRadius: '3px'
                }"
              ></div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #1e3a8a; font-weight: 700; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
            <span>ค่าเช่าเริ่มต้น ฿1,800/ด.</span>
            <span style="color: #2563eb;">คลิกเพื่อดูล็อคย่อย &rarr;</span>
          </div>
        </div>
      </transition>
    </div>

    <!-- Category Legend (9 Categories matching Official Master Plan) -->
    <div class="projects-category-legend">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
        <span style="font-size: 0.85rem; font-weight: 700; color: #334155; display: inline-flex; align-items: center; gap: 6px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>หมวดหมู่สินค้า 9 กลุ่มโซน (คลิกเพื่อกรองโครงการบนแผนที่)</span>
        </span>
        <button
          v-if="categoryFilter"
          type="button"
          class="btn btn-sm btn-outline"
          style="font-size: 0.75rem; padding: 2px 10px; border-color: #cbd5e1; color: #64748b;"
          @click="emit('update:categoryFilter', null)"
        >
          ล้างตัวกรองหมวดหมู่
        </button>
      </div>

      <div class="legend-grid">
        <div
          v-for="cat in categories"
          :key="cat.name"
          class="category-legend-item"
          :class="{
            'active-filter': categoryFilter === cat.name,
            'is-muted': categoryFilter && categoryFilter !== cat.name
          }"
          @click="toggleCategoryFilter(cat.name)"
        >
          <span class="cat-color-dot" :style="{ backgroundColor: cat.color }"></span>
          <span class="cat-label-text">{{ cat.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const props = defineProps<{
  selectedProjectId?: string
  onlyAvailable?: boolean
  categoryFilter?: string | null
  mapStyle?: 'standard' | 'dark' | 'satellite'
}>()

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
const projects: ProjectZone[] = [
  // West Diagonal Cluster (Top-Left)
  { id: 'proj-29-2', name: 'โครงการที่ 29/2', category: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7', x: 135, y: 395, w: 75, h: 48, rx: 8, rotate: -35, stallsAvailable: 12, totalStalls: 40 },
  { id: 'proj-01-top', name: 'โครงการที่ 01', category: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7', x: 200, y: 345, w: 84, h: 58, rx: 8, rotate: -35, stallsAvailable: 24, totalStalls: 68 },
  { id: 'proj-26', name: 'โครงการที่ 26', category: 'ของเก่าของสะสม เครื่องประดับ เครื่องดนตรีไทย หนังสือ', color: '#e06456', x: 235, y: 415, w: 78, h: 54, rx: 8, rotate: -35, stallsAvailable: 8, totalStalls: 52 },
  { id: 'proj-25', name: 'โครงการที่ 25', category: 'เสื้อผ้า อุปกรณ์เดินป่า เครื่องหนัง', color: '#ab77c8', x: 295, y: 445, w: 58, h: 54, rx: 8, rotate: -35, stallsAvailable: 15, totalStalls: 48 },
  { id: 'proj-24', name: 'โครงการที่ 24', category: 'เครื่องประดับและของแต่งบ้านโบราณ ผ้าไหม กรอบรูป', color: '#7e8ee8', x: 195, y: 485, w: 75, h: 56, rx: 8, rotate: -35, stallsAvailable: 14, totalStalls: 60 },
  { id: 'proj-23', name: 'โครงการที่ 23', category: 'เครื่องประดับและของแต่งบ้านโบราณ ผ้าไหม กรอบรูป', color: '#7e8ee8', x: 225, y: 550, w: 82, h: 62, rx: 8, rotate: -35, stallsAvailable: 18, totalStalls: 96 },
  { id: 'proj-22', name: 'โครงการที่ 22', category: 'เครื่องประดับและของแต่งบ้านโบราณ ผ้าไหม กรอบรูป', color: '#7e8ee8', x: 275, y: 600, w: 70, h: 48, rx: 8, rotate: -35, stallsAvailable: 9, totalStalls: 54 },
  
  // West Outer Curved Strip (Project 03)
  { id: 'proj-03', name: 'โครงการที่ 03', category: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7', x: 160, y: 565, w: 70, h: 110, rx: 12, rotate: -38, stallsAvailable: 20, totalStalls: 80 },

  // Center-West Small Squares (20/1, 20/2, 21)
  { id: 'proj-20-1', name: 'โครงการที่ 20/1', category: 'เสื้อผ้า อุปกรณ์เดินป่า เครื่องหนัง', color: '#ab77c8', x: 350, y: 510, w: 36, h: 56, rx: 6, rotate: 0, stallsAvailable: 6, totalStalls: 32 },
  { id: 'proj-20-2', name: 'โครงการที่ 20/2', category: 'งานศิลปะและภาพวาด', color: '#f48fb1', x: 350, y: 585, w: 38, h: 56, rx: 6, rotate: 0, stallsAvailable: 7, totalStalls: 34 },
  { id: 'proj-21', name: 'โครงการที่ 21', category: 'ของเก่าของสะสม เครื่องประดับ เครื่องดนตรีไทย หนังสือ', color: '#e06456', x: 295, y: 585, w: 52, h: 56, rx: 8, rotate: 0, stallsAvailable: 11, totalStalls: 44 },

  // North Angled Blocks (Projects 29 & 27)
  { id: 'proj-29', name: 'โครงการที่ 29', category: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7', x: 345, y: 325, w: 78, h: 52, rx: 8, rotate: 30, stallsAvailable: 16, totalStalls: 64 },
  { id: 'proj-27', name: 'โครงการที่ 27', category: 'เสื้อผ้าแฟชั่นและเครื่องประดับวัยรุ่น', color: '#4eb5b7', x: 385, y: 385, w: 82, h: 60, rx: 8, rotate: 30, stallsAvailable: 22, totalStalls: 72 },

  // Long Middle Bar (Project 28)
  { id: 'proj-28', name: 'โครงการที่ 28', category: 'โปสการ์ด ของชำร่วย อุปกรณ์สำหรับสัตว์', color: '#e87a4d', x: 485, y: 462, w: 295, h: 18, rx: 8, rotate: 0, stallsAvailable: 28, totalStalls: 110 },

  // Central Grid - Upper Row (Projects 19, 17, 15, 13)
  { id: 'proj-19', name: 'โครงการที่ 19', category: 'อุปกรณ์โต๊ะอาหาร เซรามิก เบญจรงค์ เครื่องเงิน ของตกแต่งบ้าน', color: '#52b788', x: 400, y: 498, w: 68, h: 54, rx: 8, rotate: 0, stallsAvailable: 13, totalStalls: 56 },
  { id: 'proj-17', name: 'โครงการที่ 17', category: 'ของเก่าของสะสม เครื่องประดับ เครื่องดนตรีไทย หนังสือ', color: '#e06456', x: 476, y: 498, w: 88, h: 54, rx: 8, rotate: 0, stallsAvailable: 19, totalStalls: 64 },
  { id: 'proj-15', name: 'โครงการที่ 15', category: 'อุปกรณ์โต๊ะอาหาร เซรามิก เบญจรงค์ เครื่องเงิน ของตกแต่งบ้าน', color: '#52b788', x: 572, y: 498, w: 50, h: 54, rx: 8, rotate: 0, stallsAvailable: 8, totalStalls: 42 },
  { id: 'proj-13', name: 'โครงการที่ 13', category: 'โปสการ์ด ของชำร่วย อุปกรณ์สำหรับสัตว์', color: '#e87a4d', x: 630, y: 498, w: 50, h: 54, rx: 8, rotate: 0, stallsAvailable: 10, totalStalls: 46 },

  // Central Grid - Lower Row (Projects 18, 16, 14, 12)
  { id: 'proj-18', name: 'โครงการที่ 18', category: 'งานศิลปะและภาพวาด', color: '#f48fb1', x: 400, y: 585, w: 68, h: 56, rx: 8, rotate: 0, stallsAvailable: 14, totalStalls: 54 },
  { id: 'proj-16', name: 'โครงการที่ 16', category: 'งานศิลปะและภาพวาด', color: '#f48fb1', x: 476, y: 585, w: 88, h: 56, rx: 8, rotate: 0, stallsAvailable: 17, totalStalls: 66 },
  { id: 'proj-14', name: 'โครงการที่ 14', category: 'เสื้อผ้า อุปกรณ์เดินป่า เครื่องหนัง', color: '#ab77c8', x: 572, y: 585, w: 50, h: 56, rx: 8, rotate: 0, stallsAvailable: 9, totalStalls: 42 },
  { id: 'proj-12', name: 'โครงการที่ 12', category: 'เสื้อผ้า อุปกรณ์เดินป่า เครื่องหนัง', color: '#ab77c8', x: 630, y: 585, w: 50, h: 56, rx: 8, rotate: 0, stallsAvailable: 11, totalStalls: 44 },

  // East Group (Projects 11, 09, 10, 08, 07, 06)
  { id: 'proj-11', name: 'โครงการที่ 11', category: 'งานแกะสลักไม้ สปา เครื่องหอม', color: '#f2c94c', x: 688, y: 498, w: 45, h: 78, rx: 8, rotate: 0, stallsAvailable: 12, totalStalls: 50 },
  { id: 'proj-09', name: 'โครงการที่ 09', category: 'งานแกะสลักไม้ สปา เครื่องหอม', color: '#f2c94c', x: 741, y: 498, w: 45, h: 84, rx: 8, rotate: 0, stallsAvailable: 15, totalStalls: 52 },
  { id: 'proj-10', name: 'โครงการที่ 10', category: 'งานแกะสลักไม้ สปา เครื่องหอม', color: '#f2c94c', x: 695, y: 595, w: 58, h: 44, rx: 8, rotate: -15, stallsAvailable: 7, totalStalls: 38 },
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

// Tooltip state
const hoveredProject = ref<ProjectZone | null>(null)
const tooltipPos = ref({ x: 0, y: 0 })

const handleMouseEnter = (p: ProjectZone, e: MouseEvent) => {
  hoveredProject.value = p
  const rect = (e.currentTarget as SVGElement).getBoundingClientRect()
  const parent = (e.currentTarget as SVGElement).closest('.projects-svg-wrapper')?.getBoundingClientRect()
  if (parent) {
    tooltipPos.value = {
      x: Math.min(Math.max(rect.left - parent.left - 40, 10), parent.width - 260),
      y: Math.max(rect.top - parent.top - 95, 10)
    }
  }
}

const handleMouseLeave = () => {
  hoveredProject.value = null
}

const handleProjectClick = (p: ProjectZone) => {
  if (hasDragged.value) {
    return
  }
  emit('selectProject', p)
}

const toggleCategoryFilter = (catName: string) => {
  if (props.categoryFilter === catName) {
    emit('update:categoryFilter', null)
  } else {
    emit('update:categoryFilter', catName)
  }
}

const matchesSearch = (p: ProjectZone): boolean => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return true

  // Check name (e.g. โครงการที่ 23)
  if (p.name.toLowerCase().includes(query)) return true
  // Check category
  if (p.category.toLowerCase().includes(query)) return true
  // Check raw number (e.g. typing "23")
  const numInQuery = query.replace(/[^0-9]/g, '')
  const numInProject = p.name.replace(/[^0-9]/g, '')
  if (numInQuery && numInProject && numInProject.includes(numInQuery)) return true

  return false
}

const isProjectHighlighted = (p: ProjectZone): boolean => {
  return Boolean(searchQuery.value.trim() && matchesSearch(p))
}

const isProjectDimmed = (p: ProjectZone): boolean => {
  if (searchQuery.value.trim() && !matchesSearch(p)) {
    return true
  }
  if (props.categoryFilter && p.category !== props.categoryFilter) {
    return true
  }
  if (props.onlyAvailable && p.stallsAvailable === 0) {
    return true
  }
  return false
}

// ================================================================
// PAN & ZOOM ENGINE (Mouse Wheel, Drag-to-Pan & Touch Pinch)
// ================================================================
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const hasDragged = ref(false)
let dragStart = { x: 0, y: 0 }
let initialPinchDistance = 0
let initialPinchZoom = 1

const zoomIn = () => {
  if (zoomLevel.value < 2.8) {
    zoomLevel.value = Math.min(2.8, +(zoomLevel.value + 0.25).toFixed(2))
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.6) {
    zoomLevel.value = Math.max(0.6, +(zoomLevel.value - 0.25).toFixed(2))
  }
}

const recenterMap = () => {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

const handleWheel = (e: WheelEvent) => {
  const factor = e.deltaY < 0 ? 1.15 : 0.88
  const newZoom = Math.min(2.8, Math.max(0.6, +(zoomLevel.value * factor).toFixed(2)))
  zoomLevel.value = newZoom
}

const onMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return
  isDragging.value = true
  hasDragged.value = false
  dragStart = { x: e.clientX - panX.value, y: e.clientY - panY.value }
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  const dx = e.clientX - dragStart.x
  const dy = e.clientY - dragStart.y
  if (Math.abs(dx - panX.value) > 4 || Math.abs(dy - panY.value) > 4) {
    hasDragged.value = true
  }
  panX.value = dx
  panY.value = dy
}

const onMouseUp = () => {
  isDragging.value = false
}

// Touch support for Mobile/Tablet
const onTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 1) {
    isDragging.value = true
    hasDragged.value = false
    dragStart = { x: e.touches[0].clientX - panX.value, y: e.touches[0].clientY - panY.value }
  } else if (e.touches.length === 2) {
    isDragging.value = false
    initialPinchDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    initialPinchZoom = zoomLevel.value
  }
}

const onTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 1 && isDragging.value) {
    const dx = e.touches[0].clientX - dragStart.x
    const dy = e.touches[0].clientY - dragStart.y
    if (Math.abs(dx - panX.value) > 4 || Math.abs(dy - panY.value) > 4) {
      hasDragged.value = true
    }
    panX.value = dx
    panY.value = dy
  } else if (e.touches.length === 2 && initialPinchDistance > 0) {
    const currentDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    const factor = currentDist / initialPinchDistance
    zoomLevel.value = Math.min(2.8, Math.max(0.6, +(initialPinchZoom * factor).toFixed(2)))
  }
}

const onTouchEnd = () => {
  isDragging.value = false
  initialPinchDistance = 0
}
</script>

<style scoped>
.projects-master-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Master Map Top Bar */
.master-map-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 12px 12px 0 0;
  flex-wrap: wrap;
  gap: 12px;
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 440px;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 0.9rem;
  color: #64748b;
  pointer-events: none;
}

.map-search-input {
  width: 100%;
  padding: 8px 32px 8px 34px;
  font-size: 0.85rem;
  font-family: inherit;
  border: 1.5px solid #cbd5e1;
  border-radius: 20px;
  background: #f8fafc;
  color: #0f172a;
  transition: all 0.2s ease;
  outline: none;
}

.map-search-input:focus {
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 50%;
}

.clear-search-btn:hover {
  color: #334155;
  background: #e2e8f0;
}

.quick-kpi-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.kpi-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 5px 12px;
  border-radius: 16px;
  font-size: 0.78rem;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.kpi-chip.highlight {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}

.kpi-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.kpi-dot.blue { background: #3b82f6; }
.kpi-dot.green { background: #10b981; }

.projects-svg-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #f4f0e8;
}

.master-map-svg {
  width: 100%;
  height: auto;
  min-height: 520px;
  display: block;
  user-select: none;
  cursor: grab;
}

.projects-svg-wrapper.is-panning {
  cursor: grabbing;
}

/* Floating Map Zoom Controls (Top-Left) */
.map-floating-zoom-ctrl {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 25;
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

.zoom-hint-pill {
  position: absolute;
  bottom: 14px;
  right: 16px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  pointer-events: none;
  z-index: 10;
}

/* Map Theme Styles */
.master-map-svg.style-dark rect:first-child {
  fill: #1e293b;
}
.master-map-svg.style-dark path {
  opacity: 0.85;
}
.master-map-svg.style-satellite rect:first-child {
  fill: #14281d;
}

/* Animated Clock Pulse */
@keyframes clockBeacon {
  0% {
    r: 20px;
    opacity: 0.4;
  }
  50% {
    r: 34px;
    opacity: 0.1;
  }
  100% {
    r: 20px;
    opacity: 0.4;
  }
}

.clock-pulse {
  animation: clockBeacon 2.5s infinite ease-in-out;
}

/* Project Node Group */
.project-node-group {
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  transform-origin: center;
}

.project-box-rect {
  transition: all 0.2s ease;
  stroke: rgba(255, 255, 255, 0.5);
  stroke-width: 1.5;
}

.project-node-group:hover .project-box-rect {
  filter: url(#hover-glow);
  stroke: #ffffff;
  stroke-width: 2.5;
  opacity: 0.98;
}

.project-node-group.is-selected .project-box-rect {
  stroke: #1e3a8a;
  stroke-width: 3.5;
  filter: drop-shadow(0 0 12px rgba(30, 58, 138, 0.85));
}

.project-node-group.is-highlighted .project-box-rect {
  stroke: #10b981;
  stroke-width: 3;
}

.project-node-group.is-dimmed {
  opacity: 0.18;
}

.project-box-label {
  fill: #ffffff;
  font-size: 10.5px;
  font-weight: 700;
  pointer-events: none;
  font-family: inherit;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.project-box-label.label-small {
  font-size: 8.5px;
}

.available-dot {
  pointer-events: none;
}

/* Floating Hover Tooltip */
.project-hover-tooltip {
  position: absolute;
  z-index: 50;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #bfdbfe;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.2);
  pointer-events: none;
  min-width: 250px;
  transition: top 0.1s ease, left 0.1s ease;
}

/* Category Legend Grid */
.projects-category-legend {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 16px 20px;
  border-radius: 0 0 12px 12px;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 20px;
}

@media (max-width: 900px) {
  .legend-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .legend-grid {
    grid-template-columns: 1fr;
  }
}

.category-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.15s ease;
  user-select: none;
}

.category-legend-item:hover {
  background: #f1f5f9;
}

.category-legend-item.active-filter {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.category-legend-item.is-muted {
  opacity: 0.32;
}

.cat-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.cat-label-text {
  font-size: 0.8rem;
  color: #334155;
  font-weight: 500;
  line-height: 1.35;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
