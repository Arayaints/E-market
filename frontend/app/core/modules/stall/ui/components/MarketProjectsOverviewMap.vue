<template>
  <div class="projects-master-container" :class="{ 'is-preview-mode': previewMode }">
    <!-- Top Interactive Filter & Quick Search Bar -->
    <Teleport to="#step1-map-toolbar">
    <div v-if="!previewMode" class="master-map-top-bar">
      <div class="master-map-tools-right">
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

        <div class="map-advanced-filter-wrap">
          <button type="button" class="map-advanced-filter-btn" :class="{ active: hasAdvancedFilters }" @click="showAdvancedFilters = !showAdvancedFilters" :aria-expanded="showAdvancedFilters">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M7 12h10m-7 6h4"></path></svg>
            ตัวกรอง
            <span v-if="advancedFilterCount" class="map-advanced-count">{{ advancedFilterCount }}</span>
          </button>
          <div v-if="showAdvancedFilters" class="map-advanced-filter-panel">
            <div class="map-filter-panel-head">
              <strong>ตัวกรองเพิ่มเติม</strong>
              <button type="button" @click="showAdvancedFilters = false" aria-label="ปิดตัวกรอง">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="filter-field-group">
              <span class="filter-field-label">หมวดหมู่</span>
              <AppSelect
                :model-value="categoryFilter || ''"
                :options="categoryOptions"
                placeholder="เลือกหมวดหมู่"
                @update:model-value="handleCategoryChange"
              />
            </div>

            <div class="filter-field-group">
              <span class="filter-field-label">งบค่าเช่าต่อเดือน</span>
              <AppSelect
                v-model="rentFilter"
                :options="rentOptions"
                placeholder="งบค่าเช่าต่อเดือน"
              />
            </div>

            <div class="filter-field-group">
              <span class="filter-field-label">สถานะแผง</span>
              <AppSelect
                v-model="availabilityFilter"
                :options="availabilityOptions"
                placeholder="สถานะแผง"
              />
            </div>

            <div class="map-filter-panel-footer">
              <div class="mfp-result-summary">
                <span class="mfp-result-label">ผลลัพธ์:</span>
                <span class="mfp-result-val"><strong>{{ filteredProjectCount }}</strong> โครงการ</span>
                <span class="mfp-result-dot">·</span>
                <span class="mfp-result-stalls"><strong>{{ filteredStallCount.toLocaleString() }}</strong> แผง</span>
              </div>
              <div class="mfp-action-grid">
                <button
                  type="button"
                  class="btn-filter-reset"
                  @click="clearAllFilters"
                  title="รีเซ็ตตัวกรองทั้งหมด"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                  <span>ล้างค่า</span>
                </button>
                <button
                  type="button"
                  class="btn-filter-apply"
                  @click="applyFilters"
                  title="ดูโครงการที่ตรงตามเงื่อนไข"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>ค้นหา ({{ filteredProjectCount }})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Preview Mode Top Bar (สำหรับขั้นตอนตรวจสอบยืนยันข้อมูล) -->
    <div v-if="previewMode" class="preview-top-bar">
      <!-- ด้านซ้าย: หัวข้อแผนที่ + ไอคอน + รายละเอียดโครงการที่จอง -->
      <div class="preview-head-left">
        <div class="preview-head-icon-box">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
        </div>
        <div class="preview-head-text-col">
          <div class="preview-head-title-row">
            <strong class="preview-head-title">ตำแหน่งแผงค้าบนแผนที่จริง</strong>
            <span v-if="bookedProject" class="preview-head-cat-badge">
              {{ bookedProject.name }}
            </span>
          </div>
          <div class="preview-head-subtitle">
            {{ bookedProject?.category || 'ตรวจสอบตำแหน่งแผงค้าที่คุณเลือกจองในผังตลาด' }}
          </div>
        </div>
      </div>

      <!-- ด้านขวา: ปุ่มโฟกัสแผงที่จอง + แถบอธิบายสีแผง (Legend) -->
      <div class="preview-head-right">
        <!-- Clickable Booked Stalls Button / Pill -->
        <button
          type="button"
          class="preview-booked-pill-btn"
          :class="{ 'is-active': activeProjectId === bookedProjectId }"
          @click="focusBookedStalls"
          title="คลิกเพื่อซูมกลับไปยังแผงที่คุณเลือกจองทันที"
        >
          <span class="preview-info-dot" :style="{ backgroundColor: bookedProject?.color || '#2563eb' }"></span>
          <span class="preview-badge-stalls">
            แผงที่คุณเลือก {{ selectedStallCodes.length }} แผง ({{ selectedStallCodes.join(', ') }})
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

        <div class="preview-legend-row">
          <div class="preview-leg-item"><span class="leg-dot is-selected"></span><span>แผงที่คุณเลือก ({{ selectedStallCodes.length }})</span></div>
          <div class="preview-leg-item"><span class="leg-dot is-available"></span><span>แผงว่าง</span></div>
          <div class="preview-leg-item"><span class="leg-dot is-reserved"></span><span>ติดจอง</span></div>
        </div>
      </div>
    </div>

    <!-- MapLibre GL JS Interactive Map Container -->
    <div class="maplibre-overview-wrapper">
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
            <circle cx="12" cy="10" r="10"></circle>
            <line x1="22" y1="12" x2="18" y2="12"></line>
            <line x1="6" y1="12" x2="2" y2="12"></line>
            <line x1="12" y1="6" x2="12" y2="2"></line>
            <line x1="12" y1="22" x2="12" y2="18"></line>
          </svg>
          <span>ปรับกึ่งกลาง</span>
        </button>
      </div>

      <!-- Floating Floor Preview Pill in Step 3 Preview Mode -->
      <transition name="fade">
        <div
          v-if="previewMode && activeProject && activeProjectFloors.length > 1"
          class="map-floating-floor-preview-pill"
        >
          <span class="floor-preview-label">ชั้น:</span>
          <div class="floor-preview-tabs">
            <button
              v-for="fl in activeProjectFloors"
              :key="fl.id"
              type="button"
              class="floor-preview-tab"
              :class="{ active: currentFloorId === fl.id }"
              @click="switchFloor(fl.id)"
            >
              {{ fl.shortLabel }}
            </button>
          </div>
        </div>
      </transition>

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

      <!-- Multi-floor projects require an explicit floor choice before showing stalls. -->
      <transition name="fsc-fade">
        <div
          v-if="floorSelectorProject"
          class="floor-selector-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="floor-selector-title"
          @click.self="closeFloorSelector"
        >
          <section class="floor-selector-panel">
            <div class="fsc-top-bar">
              <div class="fsc-top-left">
                <div class="fsc-badge-row">
                  <span class="fsc-building-tag" :style="{ color: floorSelectorProject.color, borderColor: floorSelectorProject.color, backgroundColor: `${floorSelectorProject.color}14` }">
                    อาคาร {{ floorSelectorProject.floors?.length }} ชั้น
                  </span>
                  <span class="fsc-proj-code">โครงการที่ {{ floorSelectorProject.sectionNumber }}</span>
                </div>
                <h3 id="floor-selector-title" class="fsc-title">เลือกชั้นที่ต้องการดู</h3>
                <p class="fsc-desc">{{ floorSelectorProject.name }} · {{ floorSelectorProject.category }}</p>
              </div>
              <button type="button" class="fsc-close-btn" @click="closeFloorSelector" aria-label="ปิดตัวเลือกชั้น">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div class="fsc-floors-stack" aria-label="รายการชั้น">
              <button
                v-for="floor in floorSelectorProject.floors"
                :key="floor.id"
                type="button"
                class="fsc-floor-item"
                :class="{
                  'is-floor-full': getFloorLayout(floorSelectorProject, floor.id).available === 0 && getFloorLayout(floorSelectorProject, floor.id).reserved === 0,
                  'is-floor-queue': getFloorLayout(floorSelectorProject, floor.id).available === 0 && getFloorLayout(floorSelectorProject, floor.id).reserved > 0
                }"
                @click="selectFloorFromDialog(floor.id)"
              >
                <span class="fsc-pillar" :class="{ 'is-full': getFloorLayout(floorSelectorProject, floor.id).available === 0 && getFloorLayout(floorSelectorProject, floor.id).reserved === 0 }">
                  <span class="fsc-pillar-level">{{ floor.shortLabel }}</span>
                  <span class="fsc-pillar-badge">ชั้น {{ floor.level }}</span>
                </span>
                <span class="fsc-floor-details">
                  <span class="fsc-floor-headline">
                    <span class="fsc-floor-title-text">{{ floor.name }}</span>
                    <span v-if="getFloorLayout(floorSelectorProject, floor.id).available > 0" class="fsc-avail-chip">
                      <i class="fsc-chip-dot"></i>ว่าง {{ getFloorLayout(floorSelectorProject, floor.id).available }}
                    </span>
                    <span v-else-if="getFloorLayout(floorSelectorProject, floor.id).reserved > 0" class="fsc-avail-chip is-queue">
                      <i class="fsc-chip-dot"></i>คิวสำรอง {{ getFloorLayout(floorSelectorProject, floor.id).reserved }}
                    </span>
                    <span v-else class="fsc-avail-chip is-full">
                      <i class="fsc-chip-dot"></i>เต็มแล้ว
                    </span>
                  </span>
                  <span class="fsc-floor-meta-row">
                    <span class="fsc-meta-pill">ทั้งหมด {{ getFloorLayout(floorSelectorProject, floor.id).total }} แผง</span>
                    <span v-if="getFloorLayout(floorSelectorProject, floor.id).reserved > 0" class="fsc-meta-pill">ติดจอง (ยังไม่ทำสัญญา) {{ getFloorLayout(floorSelectorProject, floor.id).reserved }} แผง</span>
                    <span v-if="getFloorLayout(floorSelectorProject, floor.id).available === 0 && getFloorLayout(floorSelectorProject, floor.id).reserved === 0" class="fsc-meta-pill is-full-tag">มีผู้เช่าครบ 100%</span>
                  </span>
                </span>
                <span class="fsc-action-col">
                  <span v-if="getFloorLayout(floorSelectorProject, floor.id).available > 0" class="fsc-select-action-btn">
                    ดูผังแผง <span>→</span>
                  </span>
                  <span v-else-if="getFloorLayout(floorSelectorProject, floor.id).reserved > 0" class="fsc-select-action-btn is-queue-action">
                    จองคิวสำรอง <span>→</span>
                  </span>
                  <span v-else class="fsc-select-action-btn is-full-action">
                    ดูผัง (เต็ม) <span>→</span>
                  </span>
                </span>
              </button>
            </div>
          </section>
        </div>
      </transition>

      <!-- Drill-down Panel: แสดงเมื่อคลิกเข้าโครงการ (แผงย่อยวาดอยู่ในกรอบบนแผนที่) -->
      <transition name="smp-slide">
        <aside v-if="!previewMode && activeProject && activeLayout" class="stall-mode-panel" aria-label="รายละเอียดโครงการ">
          <div class="smp-back-section">
            <button id="btn-back-overview" type="button" class="smp-back-btn" @click="exitProject">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              <span>ดูผังรวมตลาด</span>
            </button>
          </div>

          <div class="smp-title-row">
            <span class="smp-dot" :style="{ backgroundColor: activeProject.color }"></span>
            <h3 class="smp-title">{{ activeProject.name }}</h3>
          </div>
          <div class="smp-category">{{ activeProject.category }}</div>

          <!-- Multi-floor Selector: เรียบง่าย กดสลับชั้นได้ทันทีในแถบด้านข้าง ไม่บังหน้าจอ -->
          <div v-if="activeProjectFloors.length > 1" class="smp-floor-section">
            <div class="smp-floor-header">
              <div class="smp-floor-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 20h20"></path>
                  <path d="M5 20V4h14v16"></path>
                  <path d="M9 8h2M9 12h2M9 16h2M13 8h2M13 12h2M13 16h2"></path>
                </svg>
                <span>ระดับชั้นอาคาร</span>
              </div>
              <span class="smp-floor-count">{{ activeProjectFloors.length }} ชั้น</span>
            </div>
            <div
              class="smp-floor-segmented-row"
              :class="{
                'has-many-floors': activeProjectFloors.length >= 3,
                'has-five-or-more-floors': activeProjectFloors.length >= 5
              }"
            >
              <button
                v-for="fl in activeProjectFloors"
                :key="fl.id"
                type="button"
                class="smp-floor-segmented-btn"
                :class="{
                  active: currentFloorId === fl.id,
                  'is-floor-full': getFloorAvailCount(fl.id) === 0 && getFloorReservedCount(fl.id) === 0,
                  'is-floor-queue': getFloorAvailCount(fl.id) === 0 && getFloorReservedCount(fl.id) > 0
                }"
                @click="switchFloor(fl.id)"
              >
                <span class="smp-seg-badge">{{ fl.shortLabel }}</span>
                <div class="smp-seg-info">
                  <span class="smp-seg-name">{{ fl.shortLabel === '1F' ? 'ชั้น 1' : fl.shortLabel === '2F' ? 'ชั้น 2' : fl.shortLabel === '3F' ? 'ชั้น 3' : fl.name }}</span>
                  <span v-if="getFloorAvailCount(fl.id) > 0" class="smp-seg-avail">ว่าง {{ getFloorAvailCount(fl.id) }}</span>
                  <span v-else-if="getFloorReservedCount(fl.id) > 0" class="smp-seg-avail is-queue">คิวสำรอง {{ getFloorReservedCount(fl.id) }}</span>
                  <span v-else class="smp-seg-avail is-full">เต็ม</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Full Floor Alert Banner with Quick Switch to Available Floor -->
          <div v-if="activeProjectFloors.length > 1 && activeLayout?.available === 0 && activeLayout?.reserved === 0" class="smp-floor-full-banner">
            <div class="sffb-head">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>{{ currentFloorObject?.name || 'ชั้นนี้' }} มีผู้เช่าครบแล้ว</span>
            </div>
            <p class="sffb-desc">ชั้นนี้มีผู้เช่าทำสัญญาครบทุกแผงแล้ว ท่านสามารถดูผังหรือกดสลับไปชั้นที่มีแผงว่างได้ทันที</p>
            <button
              v-if="suggestedAvailableFloor"
              type="button"
              class="sffb-switch-btn"
              @click="switchFloor(suggestedAvailableFloor.id)"
            >
              <span>สลับไป {{ suggestedAvailableFloor.shortLabel }} (ว่าง {{ getFloorAvailCount(suggestedAvailableFloor.id) }} แผง)</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <!-- Queue / Reserved Floor Banner (เมื่อไม่มีแผงว่างพร้อมทำสัญญา แต่มีแผงติดจองที่ยังไม่ทำสัญญา เปิดรับคิวสำรอง) -->
          <div v-else-if="activeProjectFloors.length > 1 && activeLayout?.available === 0 && (activeLayout?.reserved || 0) > 0" class="smp-floor-queue-banner">
            <div class="sfqb-head">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 14 14"></polyline>
              </svg>
              <span>{{ currentFloorObject?.name || 'ชั้นนี้' }} ติดจอง (เปิดรับคิวสำรอง)</span>
            </div>
            <p class="sfqb-desc">มีแผงติดจองที่ยังไม่ทำสัญญาจำนวน {{ activeLayout?.reserved }} แผง ท่านสามารถคลิกเลือกแผงสีส้มเพื่อลงทะเบียนคิวสำรอง (Waiting List) ได้ทันที</p>
            <button
              v-if="suggestedAvailableFloor"
              type="button"
              class="sfqb-switch-btn"
              @click="switchFloor(suggestedAvailableFloor.id)"
            >
              <span>หรือเลือกดูแผงว่างที่ {{ suggestedAvailableFloor.shortLabel }} (ว่าง {{ getFloorAvailCount(suggestedAvailableFloor.id) }} แผง)</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <div class="smp-area-box">
            <div class="smp-area-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18M9 21V9"></path></svg>
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
            <div><span class="smp-sw sw-reserved"></span>ติดจอง (ยังไม่ทำสัญญา / คิวสำรอง)</div>
            <div><span class="smp-sw sw-occupied"></span>มีผู้เช่าแล้ว</div>
            <div><span class="smp-sw sw-selected"></span>แผงที่คุณเลือก</div>
          </div>

          <div class="smp-hint">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span>แผงละ 2.5 × 2 ม. (5 ตร.ม.) — คลิกแผงสีเขียวหรือสีเหลืองบนผังแผนที่เพื่อเลือก</span>
          </div>
        </aside>
      </transition>

      <!-- First-visit guidance: disappears as soon as a project is selected. -->
      <transition name="fade">
        <div v-if="!previewMode && !activeProject" class="map-project-guidance" aria-live="polite">
          <span class="map-project-guidance-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M5 21V5l7-3 7 3v16"></path><path d="M9 9h1M14 9h1M9 13h1M14 13h1"></path></svg>
          </span>
          <span>
            <strong>เลือกโครงการที่ต้องการจอง</strong>
            <small>คลิกพื้นที่กรอบสีบนแผนที่เพื่อดูแผงว่าง</small>
          </span>
          <svg class="map-project-guidance-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>
        </div>
      </transition>

      <!-- Floating Layer Legend Control inside map (มุมซ้ายล่าง - สีโดดเด่นสะดุดตา) -->
      <div v-if="!previewMode && !activeProject" class="map-floating-legend-container">
        <!-- Floating Capsule Button -->
        <button
          type="button"
          class="map-floating-legend-btn"
          :class="{ active: showColorLegend }"
          @click="showColorLegend = !showColorLegend"
          title="คำอธิบายสีโครงการ (Layer Legend)"
        >
          <span class="legend-btn-icon-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </span>
          <span class="legend-btn-label">คำอธิบายสีโครงการ</span>
          <svg class="legend-chevron" :class="{ 'is-open': showColorLegend }" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>

        <!-- Floating Popover Card -->
        <transition name="legend-popover-fade">
          <div v-if="showColorLegend" class="map-floating-legend-card">
            <div class="mflc-header">
              <div class="mflc-title-group">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
                <strong>คำอธิบายสีโครงการ</strong>
                <span class="mflc-sub">ทั้งหมด {{ projects.length }} โครงการ</span>
              </div>
              <button type="button" class="mflc-close-btn" @click="showColorLegend = false" title="ปิดหน้าต่าง">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="mflc-body">
              <ul class="mflc-grid">
                <li v-for="cat in categoryStats" :key="cat.name" class="mflc-item">
                  <span class="mflc-swatch" :style="{ backgroundColor: cat.color, borderColor: cat.color }"></span>
                  <div class="mflc-text">
                    <span class="mflc-name">{{ cat.name }}</span>
                    <span class="mflc-projects">โครงการ {{ cat.projectNumbers.join(', ') }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </transition>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import AppSelect, { type SelectOption } from '~/components/AppSelect.vue'
import { CHATUCHAK_PROJECTS, type ProjectZone, type ProjectFloor } from '../../data/chatuchak_real_polygons'
import { getProjectStallLayout, getAllFloorLayoutsForProject, type MapStall } from '../../data/chatuchak_stall_layout'
import { getMarketGisConfig, type MarketGisConfig } from '../../data/markets_registry'
import { loadMarketGisJson } from '../../data/market_loader'

export type { ProjectZone, ProjectFloor }

const props = withDefaults(defineProps<{
  containerId?: string
  marketId?: string | number
  selectedProjectId?: string
  selectedStallCodes?: string[]
  onlyAvailable?: boolean
  categoryFilter?: string | null
  mapStyle?: 'standard' | 'dark' | 'satellite'
  previewMode?: boolean
}>(), {
  containerId: 'step1-projects-maplibre',
  marketId: '1',
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

const searchQuery = ref('')
const rentFilter = ref<'all' | 'under-2000' | '2000-3000' | 'over-3000'>('all')
const availabilityFilter = ref<'available' | 'reserved' | 'all'>('all')
const showAdvancedFilters = ref(false)
const showColorLegend = ref(false)

const currentMarket = ref<MarketGisConfig>(getMarketGisConfig(props.marketId))
const currentMarketCenter = computed<[number, number]>(() => currentMarket.value.center)
const currentMarketZoom = computed<number>(() => currentMarket.value.overviewZoom)
const currentMarketBearing = computed<number>(() => currentMarket.value.bearing ?? DEFAULT_BEARING)
const currentMarketPitch = computed<number>(() => currentMarket.value.pitch ?? DEFAULT_PITCH)

type LngLat = [number, number]

// A few imported surveys also contain a coarse boundary around several real
// projects. Keep it in the data, but do not expose it as a selectable project.
const pointInProject = ([lng, lat]: LngLat, project: ProjectZone): boolean => {
  const ring = project.coordinates
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!
    const [xj, yj] = ring[j]!
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// This is used only to compare polygons from the same market, so a local
// planar area is both sufficient and more robust than their survey metadata.
const projectFootprintArea = (project: ProjectZone): number => {
  const ring = project.coordinates
  let twiceArea = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i]!
    const [x2, y2] = ring[i + 1]!
    twiceArea += x1 * y2 - x2 * y1
  }
  return Math.abs(twiceArea) / 2
}

const isOverviewBoundary = (candidate: ProjectZone, source: ProjectZone[]): boolean => {
  const candidateArea = projectFootprintArea(candidate)
  const containedProjects = source.filter(project => (
    project.id !== candidate.id &&
    candidateArea > projectFootprintArea(project) * 3 &&
    pointInProject(project.centroid, candidate)
  ))
  return containedProjects.length >= 2
}

const syncMarketJson = async (idOrSlug?: string | number) => {
  const data = await loadMarketGisJson(idOrSlug)
  if (data) currentMarket.value = data
}

// Extract categories dynamically from the current market's projects
const categories = computed(() => {
  const uniqueCats = new Map<string, string>()
  currentMarket.value.projects.forEach(p => {
    if (p.category && !uniqueCats.has(p.category)) {
      uniqueCats.set(p.category, p.color)
    }
  })
  return Array.from(uniqueCats.entries()).map(([name, color]) => ({ name, color }))
})

// Sub-stall layouts generated for each project/zone in the active market
const layouts = computed(() => {
  return new Map(currentMarket.value.projects.map(p => [p.id, getProjectStallLayout(p)]))
})

const projects = computed<ProjectZone[]>(() => {
  const sourceProjects = currentMarket.value.projects
  return sourceProjects.filter(p => !isOverviewBoundary(p, sourceProjects)).map(p => {
    const l = layouts.value.get(p.id)
    return { ...p, totalStalls: l ? l.total : p.totalStalls, stallsAvailable: l ? l.available : p.stallsAvailable }
  })
})

const matchesStallFilters = (stall: MapStall) => {
  if (availabilityFilter.value !== 'all' && stall.status !== availabilityFilter.value) return false
  if (rentFilter.value === 'under-2000' && stall.monthlyRent >= 2000) return false
  if (rentFilter.value === '2000-3000' && (stall.monthlyRent < 2000 || stall.monthlyRent > 3000)) return false
  if (rentFilter.value === 'over-3000' && stall.monthlyRent <= 3000) return false
  return true
}

const projectHasMatchingStall = (project: ProjectZone) => {
  return Array.from(getAllFloorLayoutsForProject(project).values())
    .some(layout => layout.stalls.some(matchesStallFilters))
}

const projectMatchesAllFilters = (project: ProjectZone) => {
  const matchesCategory = !props.categoryFilter || project.category === props.categoryFilter
  return matchesCategory && matchesSearch(project) && projectHasMatchingStall(project)
}

const filteredProjectCount = computed(() => projects.value.filter(projectMatchesAllFilters).length)
const filteredStallCount = computed(() => projects.value.reduce((count, project) => {
  if (!(!props.categoryFilter || project.category === props.categoryFilter) || !matchesSearch(project)) return count
  return count + Array.from(getAllFloorLayoutsForProject(project).values())
    .reduce((floorCount, layout) => floorCount + layout.stalls.filter(matchesStallFilters).length, 0)
}, 0))

const hasActiveFilters = computed(() => Boolean(
  props.categoryFilter || searchQuery.value.trim() || rentFilter.value !== 'all' || availabilityFilter.value !== 'all'
))
const advancedFilterCount = computed(() => [props.categoryFilter, rentFilter.value !== 'all', availabilityFilter.value !== 'all'].filter(Boolean).length)
const hasAdvancedFilters = computed(() => advancedFilterCount.value > 0)

// Category legend (read-only): สี → หมวดหมู่ → เลขโครงการ
const categoryStats = computed(() => {
  return categories.value
    .map(cat => {
      const projs = projects.value.filter(p => p.category === cat.name)
      return {
        ...cat,
        projectCount: projs.length,
        projectNumbers: projs.map(p => p.sectionNumber)
      }
    })
    .filter(cat => cat.projectCount > 0)
})

const categoryOptions = computed<SelectOption[]>(() => [
  { value: '', label: `ทุกหมวดหมู่ (${projects.value.length} โครงการ)` },
  ...categoryStats.value.map(cat => ({
    value: cat.name,
    label: `${cat.name} (${cat.projectCount})`
  }))
])

const rentOptions: SelectOption[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'under-2000', label: 'ต่ำกว่า ฿2,000' },
  { value: '2000-3000', label: '฿2,000–3,000' },
  { value: 'over-3000', label: 'มากกว่า ฿3,000' },
]

const availabilityOptions: SelectOption[] = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'available', label: 'แผงว่าง (จองได้)' },
  { value: 'reserved', label: 'ติดจอง (คิวสำรอง)' },
]

const handleCategoryChange = (val: string | number) => {
  emit('update:categoryFilter', val ? String(val) : null)
}

// ---------------- Project drill-down state ----------------
const hoveredProject = ref<ProjectZone | null>(null)
const activeProjectId = ref<string | null>(null)
const currentFloorId = ref<string>('1')
const floorSelectorProject = ref<ProjectZone | null>(null)

// จำโครงการที่แผงถูกเลือกไว้ (สำหรับปุ่มกลับมาดูแผงตัวเองใน Step 3)
const initialBookedProjectId = ref<string | null>(props.selectedProjectId || null)
watch(() => props.selectedProjectId, (newId) => {
  if (newId) initialBookedProjectId.value = newId
}, { immediate: true })

const bookedProjectId = computed(() => initialBookedProjectId.value || props.selectedProjectId || null)
const bookedProject = computed(() => {
  const id = bookedProjectId.value
  return (id ? projects.value.find(p => p.id === id) : null) || activeProject.value
})

const isNotViewingBookedProject = computed(() => {
  if (!props.previewMode) return false
  const targetId = bookedProjectId.value
  if (!targetId) return false
  return activeProjectId.value !== targetId
})

const activeProject = computed(() => projects.value.find(p => p.id === activeProjectId.value) || null)

// Multi-floor management for active project
const activeProjectFloors = computed<ProjectFloor[]>(() => {
  if (!activeProject.value?.floors || activeProject.value.floors.length <= 1) return []
  return activeProject.value.floors
})

const activeProjectFloorsReversed = computed<ProjectFloor[]>(() => {
  // Physical building stack: highest floor on top (3F, 2F, 1F)
  return [...activeProjectFloors.value].sort((a, b) => b.level - a.level)
})

const currentFloorObject = computed<ProjectFloor | null>(() => {
  if (!activeProject.value?.floors || activeProject.value.floors.length === 0) return null
  return activeProject.value.floors.find(f => f.id === currentFloorId.value) || activeProject.value.floors[0] || null
})

const activeLayout = computed(() => {
  if (!activeProjectId.value || !activeProject.value) return null
  return getProjectStallLayout(activeProject.value, currentFloorId.value)
})

const getFloorAvailCount = (floorId: string): number => {
  if (!activeProject.value) return 0
  const layout = getProjectStallLayout(activeProject.value, floorId)
  return layout.available
}

const getFloorReservedCount = (floorId: string): number => {
  if (!activeProject.value) return 0
  const layout = getProjectStallLayout(activeProject.value, floorId)
  return layout.reserved
}

const suggestedAvailableFloor = computed<ProjectFloor | null>(() => {
  if (!activeProject.value?.floors || activeProject.value.floors.length <= 1) return null
  return activeProject.value.floors.find(f => f.id !== currentFloorId.value && getFloorAvailCount(f.id) > 0) || null
})

const getFloorLayout = (project: ProjectZone, floorId: string) => {
  return getProjectStallLayout(project, floorId)
}

const switchFloor = (floorId: string) => {
  if (currentFloorId.value === floorId) return
  currentFloorId.value = floorId
  hoverPopup?.remove()
  refreshSources()
  renderSelectedStallPins()
}

const currentProjectInfo = computed<ProjectZone | null>(() => {
  return activeProject.value || hoveredProject.value || projects.value[0] || null
})

const currentProjectLayout = computed(() => (currentProjectInfo.value ? layouts.value.get(currentProjectInfo.value.id) || null : null))

// Stall search and filter states in side panel
const stallSearchQuery = ref('')
const stallFilterTab = ref<'all' | 'available' | 'reserved'>('all')

const filteredStalls = computed(() => {
  if (!activeLayout.value?.stalls) return []
  let list = activeLayout.value.stalls
  if (stallFilterTab.value === 'available') {
    list = list.filter(s => s.status === 'available')
  } else if (stallFilterTab.value === 'reserved') {
    list = list.filter(s => s.status === 'reserved')
  }
  if (stallSearchQuery.value.trim()) {
    const q = stallSearchQuery.value.trim().toLowerCase()
    list = list.filter(s => s.code.toLowerCase().includes(q))
  }
  return list
})

const isStallSelected = (code: string) => {
  return (props.selectedStallCodes || []).includes(code)
}

const handleStallCardHover = (stall: MapStall) => {
  if (!map || !hoverPopup) return
  map.getCanvas().style.cursor = stall.status === 'occupied' ? 'not-allowed' : 'pointer'
  showPopupForStall(stall)
}

const handleStallCardLeave = () => {
  if (!map) return
  map.getCanvas().style.cursor = ''
  hoverPopup?.remove()
}

const handleStallCardClick = (stall: MapStall) => {
  if (stall.status === 'occupied') return
  const { coordinates, center, ...stallModel } = stall
  emit('selectStall', stallModel)
}

watch([stallSearchQuery, stallFilterTab], () => {
  refreshSources()
})

// ================================================================
// MAPLIBRE GL JS ENGINE IMPLEMENTATION
// ================================================================
let maplibregl: any = null
let map: any = null
let projectMarkers: any[] = []
let hoverPopup: any = null

// Interior label point (inside the polygon frame, not the vertex average)
const projectToLngLat = (p: ProjectZone): [number, number] => layouts.value.get(p.id)?.labelPoint || p.centroid

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
    center: currentMarketCenter.value,
    zoom: props.previewMode ? (currentMarketZoom.value + 1.2) : currentMarketZoom.value,
    minZoom: 13.0,
    maxZoom: 21,
    maxPitch: 65,
    pitch: props.previewMode ? 35 : currentMarketPitch.value,
    bearing: currentMarketBearing.value,
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
      const found = projects.value.find(p => p.id === props.selectedProjectId)
      if (found) {
        enterProject(found)
      }
    }
    renderSelectedStallPins()
  })
}

// ---------------- GeoJSON builders ----------------
const isProjectDimmed = (p: ProjectZone) => {
  const matchesCategory = !props.categoryFilter || p.category === props.categoryFilter
  return !(matchesCategory && matchesSearch(p))
}

const getProjectsGeoJson = () => {
  return {
    type: 'FeatureCollection',
    features: projects.value.map((p, index) => {
      const isActive = activeProjectId.value === p.id
      const isOtherWhileActive = Boolean(activeProjectId.value) && !isActive

      const fillColor = p.color
      const strokeColor = p.color

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
          strokeColor: isActive || hoveredProject.value?.id === p.id ? '#2563eb' : strokeColor,
          isActive,
          isHovered: hoveredProject.value?.id === p.id,
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
          // Survey exports can reuse a human-readable stall code. Keep the
          // layout index so map hit-testing always resolves the exact polygon.
          stallIndex: idx,
          code: s.code,
          status: s.status,
          isSelected,
          floor: s.floor,
          floorName: s.floorName,
          isDimmed: !matchesStallFilters(s)
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
        ['boolean', ['get', 'isHovered'], false], 0.24,
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
      'line-width': ['case', ['boolean', ['get', 'isActive'], false], 8, ['boolean', ['get', 'isHovered'], false], 8, 5],
      'line-opacity': ['case', ['boolean', ['get', 'isHovered'], false], 1, ['boolean', ['get', 'isDimmed'], false], 0.3, 0.95]
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
      'line-width': ['case', ['boolean', ['get', 'isActive'], false], 4.5, ['boolean', ['get', 'isHovered'], false], 4.5, 2.5],
      'line-opacity': ['case', ['boolean', ['get', 'isHovered'], false], 1, ['boolean', ['get', 'isDimmed'], false], 0.3, 1]
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
  const layout = layouts.value.get(p.id)
  const total = layout?.total ?? 0
  const available = layout?.available ?? 0
  const reserved = layout?.reserved ?? 0
  const occupied = Math.max(total - available - reserved, 0)
  const pct = (n: number) => (total ? (n / total) * 100 : 0)
  const isFull = available === 0
  const accent = p.color

  const hasFloors = p.floors && p.floors.length > 1
  const floorBadge = hasFloors
    ? `<div class="mlp-building-row"><span class="mlp-building-badge">อาคาร ${p.floors.length} ชั้น</span></div>`
    : ''
  const hintText = hasFloors
    ? 'อาคารนี้มี ' + p.floors.length + ' ชั้น: คลิกเพื่อเลือกระดับชั้นก่อนเลือกแผงค้า'
    : (isFull ? 'คลิกที่กรอบโครงการเพื่อดูแผงย่อยและเข้าคิวสำรอง' : 'คลิกที่กรอบโครงการเพื่อดูแผงย่อยและเลือกจอง')

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
        ${floorBadge}
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

        <div class="mlp-hint">${hintText}</div>
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
        </div>
      </div>
      <div class="mlp-body">
        <div class="mlp-project-context">
          <span>${activeProject.value?.name || s.zone || 'โครงการ'}</span>
          ${s.floorName ? `<i>•</i><span>${s.floorName}</span>` : ''}
        </div>
        <div class="mlp-head">
          <div class="mlp-title">
            <span class="mlp-stall-heading">
              <span class="mlp-dot"></span>
              <strong>แผง ${s.code}</strong>
            </span>
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

  // The selected-stall fill/stroke is sufficient; do not cover its location
  // with a floating check marker. Keep a beacon only when viewing another project.
  if (props.previewMode && bookedProject.value && activeProjectId.value !== bookedProjectId.value) {
    // หากอยู่ใน Step 3 แต่กำลังคลิกดูโครงการอื่น ให้ปักหมุด Beacon นำทางบนโครงการที่มีแผงที่จองไว้
    const bLayout = layouts.value.get(bookedProjectId.value || '')
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
  if (targetProject.floors && targetProject.floors.length > 0 && props.selectedStallCodes?.length) {
    for (const fl of targetProject.floors) {
      const flLayout = getProjectStallLayout(targetProject, fl.id)
      if (flLayout.stalls.some(s => props.selectedStallCodes.includes(s.code))) {
        currentFloorId.value = fl.id
        break
      }
    }
  }
  enterProject(targetProject)
}

const recenterMapView = () => {
  if (!map) return
  hoverPopup?.remove()
  if (activeProject.value) {
    const p = activeProject.value
    const pLayout = layouts.value.get(p.id) || activeLayout.value
    const selectedStallsList = (pLayout?.stalls || []).filter(s => (props.selectedStallCodes || []).includes(s.code))
    const stallBounds = props.previewMode && selectedStallsList.length > 0 ? getStallsBounds(selectedStallsList) : null

    map.fitBounds(stallBounds || getProjectBounds(p), {
      padding: props.previewMode
        ? { top: 60, bottom: 60, left: 60, right: 60 }
        : { top: 70, bottom: 50, left: 320, right: 380 },
      maxZoom: 20.6,
      pitch: props.previewMode ? 35 : DRILL_PITCH,
      bearing: currentMarketBearing.value,
      duration: 800
    })
  } else {
    map.flyTo({
      center: currentMarketCenter.value,
      zoom: currentMarketZoom.value,
      pitch: currentMarketPitch.value,
      bearing: currentMarketBearing.value,
      duration: 800
    })
  }
}

const openProject = (p: ProjectZone) => {
  if (!props.previewMode && (p.floors?.length || 0) > 1) {
    hoverPopup?.remove()
    floorSelectorProject.value = p
    return
  }
  enterProject(p)
}

const closeFloorSelector = () => {
  floorSelectorProject.value = null
}

const selectFloorFromDialog = (floorId: string) => {
  const project = floorSelectorProject.value
  if (!project) return
  floorSelectorProject.value = null
  enterProject(project, floorId)
}

const enterProject = (p: ProjectZone, directToFloor?: string) => {
  floorSelectorProject.value = null
  hoverPopup?.remove()
  activeProjectId.value = p.id
  hoveredProject.value = null

  if (directToFloor) {
    currentFloorId.value = directToFloor
  } else if (!currentFloorId.value || !p.floors?.some(f => f.id === currentFloorId.value)) {
    // Smart auto-select: เลือกชั้นแรกที่มีแผงว่างให้อัตโนมัติ (ไม่เลือกชั้นที่เต็ม 0 แผงเป็นชั้นแรก)
    const firstAvailFloor = p.floors?.find(f => getFloorLayout(p, f.id).available > 0)
    currentFloorId.value = firstAvailFloor?.id || p.floors?.[0]?.id || '1'
  }

  refreshSources()
  setBuildingsOpacity(BUILDINGS_OPACITY_DRILL)

  const pLayout = layouts.value.get(p.id) || activeLayout.value
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
  floorSelectorProject.value = null
  hoverPopup?.remove()
  activeProjectId.value = null
  currentFloorId.value = '1'
  refreshSources()
  setBuildingsOpacity(BUILDINGS_OPACITY)
  map?.flyTo({
    center: currentMarketCenter.value,
    zoom: currentMarketZoom.value,
    pitch: currentMarketPitch.value,
    bearing: currentMarketBearing.value,
    duration: 700
  })
  emit('exitProject')
}

// Called from the info banner button
const selectProject = (p: ProjectZone) => openProject(p)

const findStall = (code: string): MapStall | null => {
  if (!activeProject.value) return null
  const inCurrent = activeLayout.value?.stalls.find(s => s.code === code)
  if (inCurrent) return inCurrent
  if (activeProject.value.floors && activeProject.value.floors.length > 1) {
    for (const fl of activeProject.value.floors) {
      const flLayout = getProjectStallLayout(activeProject.value, fl.id)
      const found = flLayout.stalls.find(s => s.code === code)
      if (found) return found
    }
  }
  return null
}

const getStallFromFeature = (feature: any): MapStall | null => {
  const layout = activeLayout.value
  const stallIndex = Number(feature?.properties?.stallIndex)

  // `code` is not a reliable map key: imported GIS data can contain repeated
  // labels. `stallIndex` is generated from this exact GeoJSON feature.
  if (layout && Number.isInteger(stallIndex) && stallIndex >= 0) {
    const stall = layout.stalls[stallIndex]
    if (stall) return stall
  }

  const code = feature?.properties?.code
  return typeof code === 'string' ? findStall(code) : null
}

const setHoveredProject = (project: ProjectZone | null) => {
  if (hoveredProject.value?.id === project?.id) return
  hoveredProject.value = project
  // Update just the project source so the polygon outline follows the cursor.
  map?.getSource('projects-polygons')?.setData(getProjectsGeoJson())
}

const getMostSpecificProjectHit = (hits: any[]): ProjectZone | null => {
  const matchingProjects = hits
    .map(hit => projects.value.find(project => project.id === hit.properties.id))
    .filter((project): project is ProjectZone => Boolean(project))

  if (!matchingProjects.length) return null
  // MapLibre returns features in paint order. The smallest footprint is the
  // most specific zone when surveyed polygons overlap.
  return matchingProjects.reduce((smallest, project) => (
    projectFootprintArea(project) < projectFootprintArea(smallest) ? project : smallest
  ))
}

const bindMapEvents = () => {
  map.on('zoomend', () => {
    // Labels are adaptive: redraw only when the map settles after zooming.
    renderZoneLabels()
  })

  map.on('mousemove', (e: any) => {
    const stallHit = map.getLayer('stalls-fill')
      ? map.queryRenderedFeatures(e.point, { layers: ['stalls-fill'] })
      : []
    if (stallHit.length) {
      setHoveredProject(null)
      const s = getStallFromFeature(stallHit[0])
      map.getCanvas().style.cursor = s && s.status !== 'occupied' ? 'pointer' : 'not-allowed'
      if (s) showPopupForStall(s)
      return
    }

    const projHit = map.getLayer('projects-fill')
      ? map.queryRenderedFeatures(e.point, { layers: ['projects-fill'] })
      : []
    const p = getMostSpecificProjectHit(projHit)
    if (p && p.id !== activeProjectId.value) {
      map.getCanvas().style.cursor = 'pointer'
      setHoveredProject(p)
      showPopupForProject(p, [e.lngLat.lng, e.lngLat.lat])
    } else {
      map.getCanvas().style.cursor = ''
      setHoveredProject(null)
      hoverPopup.remove()
    }
  })

  map.on('mouseout', () => {
    setHoveredProject(null)
    hoverPopup?.remove()
  })

  map.on('click', (e: any) => {

    const stallHit = map.getLayer('stalls-fill')
      ? map.queryRenderedFeatures(e.point, { layers: ['stalls-fill'] })
      : []
    if (stallHit.length) {
      const s = getStallFromFeature(stallHit[0])
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
      const p = getMostSpecificProjectHit(projHit)
      if (p && p.id !== activeProjectId.value) openProject(p)
    }
  })
}

// ---------------- Area badges inside each frame ----------------
const renderZoneLabels = () => {
  if (!map || !maplibregl) return
  projectMarkers.forEach(m => m.remove())
  projectMarkers = []

  const zoom = map.getZoom()
  const visibleProjects = projects.value.filter(p => p.id !== activeProjectId.value && !isProjectDimmed(p))
  const useCompactLabels = zoom < 18.2

  // At broad zoom, use only small project numbers. They preserve the map context
  // while making it explicit that each coloured frame is a selectable project.
  if (zoom < 15.5) return

  visibleProjects.forEach((p) => {

    const el = document.createElement('div')
    el.className = 'maplibre-zone-number-badge'
    if (useCompactLabels) el.classList.add('is-compact')

    el.innerHTML = `
      <div class="zone-badge-inner">
        <span class="badge-num">${useCompactLabels ? p.sectionNumber : `โครงการที่ ${p.sectionNumber}`}</span>
      </div>
    `
    el.addEventListener('click', (ev) => {
      ev.stopPropagation()
      openProject(p)
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
    const found = projects.value.find(p => matchesSearch(p))
    if (found) {
      map.flyTo({ center: projectToLngLat(found), zoom: 17.5, duration: 800 })
    }
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  refreshSources()
  if (map && !activeProjectId.value) {
    map.flyTo({ center: currentMarketCenter.value, zoom: currentMarketZoom.value, duration: 800 })
  }
}

const clearAllFilters = () => {
  searchQuery.value = ''
  rentFilter.value = 'all'
  availabilityFilter.value = 'all'
  emit('update:categoryFilter', null)
  refreshSources()
}

const applyFilters = () => {
  showAdvancedFilters.value = false
  refreshSources()
}

const toggleCategoryFilter = (catName: string) => {
  if (props.categoryFilter === catName || !catName) {
    emit('update:categoryFilter', null)
  } else {
    emit('update:categoryFilter', catName)
  }
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

watch(() => [props.categoryFilter, rentFilter.value, availabilityFilter.value], () => refreshSources())

watch(availabilityFilter, (status) => {
  // Keep the parent state compatible with the existing map/stall UI.
  emit('update:onlyAvailable', status === 'available')
})

watch(() => props.onlyAvailable, (onlyAvailable) => {
  // The quick checkbox beside the Step 1 heading controls the default view.
  if (onlyAvailable) availabilityFilter.value = 'available'
  else if (availabilityFilter.value === 'available') availabilityFilter.value = 'all'
})

watch(() => props.selectedStallCodes, () => {
  map?.getSource('project-stalls')?.setData(getStallsGeoJson())
  renderSelectedStallPins()
}, { deep: true })

// Parent may switch project externally (e.g. deep-link); follow it if different
watch(() => props.selectedProjectId, (newId) => {
  if (!map || !newId || newId === activeProjectId.value) return
  const found = projects.value.find(p => p.id === newId)
  if (found) enterProject(found)
})

// Dynamic market switcher watcher: loads dedicated JSON file on demand and flies to market location
watch(() => props.marketId, async (newMarketId) => {
  activeProjectId.value = null
  hoveredProject.value = null
  currentFloorId.value = '1'
  await syncMarketJson(newMarketId)
  if (map) {
    refreshSources()
    renderSelectedStallPins()
    map.flyTo({
      center: currentMarketCenter.value,
      zoom: currentMarketZoom.value,
      pitch: currentMarketPitch.value,
      bearing: currentMarketBearing.value,
      duration: 900
    })
  }
}, { immediate: true })

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
  background: transparent;
  border-radius: 0;
  padding: 0;
}

/* Top bar with map mode switcher on the left and search on the right */
.master-map-top-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-bottom: 0;
  width: 100%;
  flex-wrap: wrap;
}

.master-map-tools-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.master-map-tools-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  margin-left: auto;
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

.map-advanced-filter-wrap { position: relative; }
.map-advanced-filter-btn { display: inline-flex; align-items: center; gap: 6px; height: 35px; padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #475569; font-family: inherit; font-size: .82rem; font-weight: 700; cursor: pointer; }
.map-advanced-filter-btn:hover, .map-advanced-filter-btn.active { border-color: #93c5fd; background: #eff6ff; color: #1d4ed8; }
.map-advanced-count { display: grid; width: 17px; height: 17px; place-items: center; border-radius: 50%; background: #2563eb; color: #fff; font-size: .65rem; }
.map-advanced-filter-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  left: auto;
  z-index: 45;
  width: min(320px, calc(100vw - 64px));
  padding: 16px;
  border: 1px solid #dbe5f2;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.05);
}
.map-filter-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  color: #0f172a;
  font-size: 0.88rem;
  font-weight: 700;
}
.map-filter-panel-head button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}
.map-filter-panel-head button:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.filter-field-group {
  margin-top: 10px;
}
.filter-field-label {
  display: block;
  margin-bottom: 5px;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
}
.map-advanced-filter-panel :deep(.app-select-trigger) {
  min-height: 38px;
  height: 38px;
  padding: 0 12px;
  font-size: 0.84rem;
  border-radius: 8px;
}
.map-advanced-filter-panel :deep(.app-select-menu) {
  z-index: 100;
  max-height: 220px;
}
.map-advanced-filter-panel :deep(.app-select-option) {
  padding: 8px 10px;
  font-size: 0.82rem;
}
.map-filter-panel-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.mfp-result-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #64748b;
  background: #f8fafc;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #eef2f6;
}

.mfp-result-label {
  color: #94a3b8;
  font-size: 0.74rem;
}

.mfp-result-val strong {
  color: #2563eb;
  font-weight: 700;
}

.mfp-result-dot {
  color: #cbd5e1;
}

.mfp-result-stalls strong {
  color: #0f172a;
  font-weight: 600;
}

.mfp-action-grid {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 8px;
  width: 100%;
}

.btn-filter-reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s ease;
}

.btn-filter-reset:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-filter-apply {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
  transition: all 0.16s ease;
}

.btn-filter-apply:hover {
  background: #1d4ed8;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
  transform: translateY(-1px);
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

.map-filter-select {
  height: 35px;
  max-width: 175px;
  padding: 6px 9px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  background: #ffffff;
  color: #475569;
  font-family: 'Bai Jamjuree', sans-serif;
  font-size: .78rem;
  font-weight: 600;
  cursor: pointer;
}
.map-filter-select:hover { border-color: #94a3b8; color: #1e293b; }
.map-filter-select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, .1); }
.map-filter-result { color: #64748b; font-size: .76rem; white-space: nowrap; }
.map-filter-result strong { color: #1e40af; font-weight: 800; }
.map-clear-filters-btn { border: 0; padding: 4px 2px; background: transparent; color: #2563eb; font-family: inherit; font-size: .76rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
.map-clear-filters-btn:hover { color: #1d4ed8; text-decoration: underline; }

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

@media (max-width: 680px) {
  .master-map-tools-right { width: 100%; margin-left: 0; }
  .search-input-group { flex: 1; width: auto; }
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

.map-project-guidance {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(360px, calc(100% - 160px));
  padding: 11px 14px;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.12);
  color: #1e3a8a;
  pointer-events: none;
}

.map-project-guidance-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 9px;
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
}

.map-project-guidance > span:nth-child(2) {
  display: grid;
  gap: 1px;
}

.map-project-guidance strong {
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f172a;
}

.map-project-guidance small {
  font-size: 0.74rem;
  color: #64748b;
  line-height: 1.35;
}

.map-project-guidance-arrow {
  flex: 0 0 auto;
  margin-left: auto;
  color: #2563eb;
}

@media (max-width: 680px) {
  .map-project-guidance {
    top: 12px;
    left: 12px;
    max-width: calc(100% - 24px);
  }
}

/* Floating Map Layer Legend (inside map - Bottom Left) */
.map-floating-legend-container {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Floating Capsule Button - สีน้ำเงิน Royal Blue ตัดขอบขาว โดดเด่นสะดุดตาบนแผนที่ */
.map-floating-legend-btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: #2563eb;
  color: #ffffff;
  padding: 7px 16px 7px 12px;
  border-radius: 9999px;
  border: 2px solid #ffffff;
  box-shadow: 0 4px 18px rgba(37, 99, 235, 0.45), 0 2px 6px rgba(15, 23, 42, 0.2);
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.map-floating-legend-btn:hover {
  transform: translateY(-2px) scale(1.02);
  background: #1d4ed8;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.55), 0 4px 10px rgba(15, 23, 42, 0.25);
}

.map-floating-legend-btn.active {
  background: #1e40af;
  border-color: #93c5fd;
  box-shadow: 0 6px 20px rgba(30, 64, 175, 0.6);
}

.legend-btn-icon-wrap {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.map-floating-legend-btn:hover .legend-btn-icon-wrap {
  background: rgba(255, 255, 255, 0.32);
}

.legend-btn-label {
  letter-spacing: -0.01em;
  color: #ffffff;
}

.legend-count-pill {
  background: #ffffff;
  color: #2563eb;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 1.5px 7.5px;
  border-radius: 9999px;
  min-width: 22px;
  text-align: center;
  line-height: 1.2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.legend-chevron {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  color: #ffffff;
}

.legend-chevron.is-open {
  transform: rotate(180deg);
}

/* Floating Popover Card */
.map-floating-legend-card {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 0;
  width: 440px;
  max-width: calc(100vw - 32px);
  max-height: 380px;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 16px;
  box-shadow: 0 20px 42px rgba(15, 23, 42, 0.22);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 25;
}

.mflc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
}

.mflc-title-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
  font-size: 0.88rem;
}

.mflc-title-group svg {
  color: #2563eb;
}

.mflc-sub {
  font-size: 0.72rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 6px;
  font-weight: 500;
}

.mflc-close-btn {
  background: transparent;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mflc-close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.mflc-body {
  padding: 12px 16px;
  overflow-y: auto;
  max-height: 300px;
}

.mflc-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 14px;
}

.mflc-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.78rem;
  padding: 4px;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.mflc-item:hover {
  background: #f8fafc;
}

.mflc-swatch {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-top: 2px;
  border-radius: 4px;
  border: 1.5px solid;
  opacity: 0.9;
}

.mflc-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mflc-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.35;
}

.mflc-projects {
  font-size: 0.7rem;
  color: #64748b;
  margin-top: 2px;
  line-height: 1.3;
}

/* Transitions */
.legend-popover-fade-enter-active,
.legend-popover-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.legend-popover-fade-enter-from,
.legend-popover-fade-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.97);
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

.smp-back-section {
  width: 100%;
  padding-bottom: 13px;
  border-bottom: 1px solid #e8eef6;
}

.smp-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.22);
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.smp-back-btn:hover {
  background: #1d4ed8;
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.3);
  transform: translateX(-2px);
}

.smp-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
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

/* Multi-floor Selector inside Stall Mode Panel */
.smp-floor-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 12px;
}

.smp-floor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.smp-floor-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  color: #334155;
}

.smp-floor-count {
  font-size: 0.68rem;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 1px 7px;
  border-radius: 9999px;
}

.smp-floor-segmented-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 6px;
  margin-top: 4px;
}

.smp-floor-segmented-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 9px;
  border-radius: 9px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.smp-floor-segmented-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.smp-floor-segmented-btn.active {
  background: #eff6ff;
  border-color: #2563eb;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.12);
}

.smp-seg-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 22px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 800;
  flex-shrink: 0;
  transition: all 0.18s ease;
}

.smp-floor-segmented-btn.active .smp-seg-badge {
  background: #2563eb;
  color: #ffffff;
}

.smp-seg-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.smp-seg-name {
  font-size: 0.74rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
}

.smp-floor-segmented-btn.active .smp-seg-name {
  color: #1d4ed8;
}

.smp-seg-avail {
  font-size: 0.67rem;
  font-weight: 600;
  color: #16a34a;
  white-space: nowrap;
}

.smp-floor-segmented-btn.active .smp-seg-avail {
  color: #15803d;
  font-weight: 700;
}

/* Three or more floors share the narrow side panel: stack each tab's content
   so its label never competes horizontally with the floor badge. */
.smp-floor-segmented-row.has-many-floors {
  gap: 4px;
}

.has-many-floors .smp-floor-segmented-btn {
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  min-width: 0;
  padding: 7px 3px 6px;
  text-align: center;
}

.has-many-floors .smp-seg-info {
  align-items: center;
}

.has-many-floors .smp-seg-name {
  display: none;
}

.has-many-floors .smp-seg-avail {
  font-size: 0.62rem;
}

/* Large buildings keep floor selection usable without making the panel taller
   than the map: two readable columns with an internal scroll area. */
.smp-floor-segmented-row.has-five-or-more-floors {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  max-height: 178px;
  overflow-y: auto;
  padding-right: 3px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.has-five-or-more-floors .smp-floor-segmented-btn {
  flex-direction: row;
  justify-content: flex-start;
  padding: 7px 9px;
  text-align: left;
}

.has-five-or-more-floors .smp-seg-info {
  align-items: flex-start;
}

.has-five-or-more-floors .smp-seg-avail {
  font-size: 0.67rem;
}

.smp-floor-segmented-btn.is-floor-full .smp-seg-avail.is-full {
  color: #dc2626;
  font-weight: 700;
}

.smp-floor-segmented-btn.is-floor-queue .smp-seg-avail.is-queue {
  color: #d97706;
  font-weight: 700;
}

.smp-floor-segmented-btn.is-floor-full:not(.active) {
  opacity: 0.8;
  background: #fafbfc;
}

.smp-floor-segmented-btn.is-floor-queue:not(.active) {
  background: #fffdf5;
}

.smp-floor-segmented-btn.is-floor-full.active {
  border-color: #fca5a5;
  background: #fef2f2;
}

.smp-floor-segmented-btn.is-floor-full.active .smp-seg-badge {
  background: #dc2626;
  color: #ffffff;
}

.smp-floor-segmented-btn.is-floor-full.active .smp-seg-name {
  color: #b91c1c;
}

.smp-floor-segmented-btn.is-floor-queue.active {
  border-color: #fcd34d;
  background: #fffbeb;
}

.smp-floor-segmented-btn.is-floor-queue.active .smp-seg-badge {
  background: #f59e0b;
  color: #ffffff;
}

.smp-floor-segmented-btn.is-floor-queue.active .smp-seg-name {
  color: #b45309;
}

.smp-floor-full-banner {
  background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%);
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 11px 13px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.06);
}

.sffb-head {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #b91c1c;
  font-size: 0.84rem;
  font-weight: 700;
}

.sffb-head svg {
  flex-shrink: 0;
  color: #dc2626;
}

.sffb-desc {
  margin: 0;
  font-size: 0.74rem;
  color: #7f1d1d;
  line-height: 1.45;
}

.sffb-switch-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 7px 12px;
  margin-top: 2px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
}

.sffb-switch-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.smp-floor-queue-banner {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 11px 13px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.08);
}

.sfqb-head {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #b45309;
  font-size: 0.84rem;
  font-weight: 700;
}

.sfqb-head svg {
  flex-shrink: 0;
  color: #d97706;
}

.sfqb-desc {
  margin: 0;
  font-size: 0.74rem;
  color: #92400e;
  line-height: 1.45;
}

.sfqb-switch-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 7px 12px;
  margin-top: 2px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
}

.sfqb-switch-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

/* Compact project status and searchable stall list */
.smp-stats-compact {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.smp-sc-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  color: #64748b;
  font-size: 0.67rem;
  white-space: nowrap;
}

.smp-sc-item strong {
  color: #1e293b;
  font-size: 0.72rem;
}

.smp-sc-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  border-radius: 9999px;
}

.smp-search-section {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.smp-search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.smp-search-icon {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  pointer-events: none;
}

.smp-search-input {
  width: 100%;
  min-width: 0;
  height: 34px;
  padding: 0 31px 0 31px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  background: #ffffff;
  color: #1e293b;
  font: inherit;
  font-size: 0.78rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.smp-search-input::placeholder { color: #94a3b8; }

.smp-search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.13);
}

.smp-search-clear {
  position: absolute;
  right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
}

.smp-search-clear:hover { background: #f1f5f9; color: #475569; }

.smp-filter-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
}

.smp-filter-tab {
  min-width: 0;
  padding: 5px 3px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  color: #64748b;
  font: inherit;
  font-size: 0.66rem;
  font-weight: 600;
  line-height: 1.15;
  white-space: nowrap;
  cursor: pointer;
}

.smp-filter-tab:hover { border-color: #93c5fd; color: #2563eb; }
.smp-filter-tab.active { border-color: #2563eb; background: #eff6ff; color: #1d4ed8; }
.smp-filter-tab.is-avail.active { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.smp-filter-tab.is-res.active { border-color: #f59e0b; background: #fffbeb; color: #b45309; }

.smp-stall-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-height: 0;
  max-height: 290px;
  overflow-y: auto;
  padding: 2px 3px 2px 0;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.smp-stall-card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 9px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.smp-stall-card:hover { border-color: #93c5fd; box-shadow: 0 3px 9px rgba(37, 99, 235, 0.1); transform: translateY(-1px); }
.smp-stall-card.is-selected { border-color: #2563eb; background: #eff6ff; box-shadow: 0 3px 10px rgba(37, 99, 235, 0.16); }
.smp-stall-card.is-occupied { background: #f8fafc; cursor: not-allowed; opacity: 0.76; }

.smp-card-top, .smp-card-bottom, .smp-card-code-grp, .smp-card-specs, .smp-card-action {
  display: flex;
  align-items: center;
}

.smp-card-top, .smp-card-bottom { justify-content: space-between; gap: 8px; }
.smp-card-code-grp { min-width: 0; gap: 5px; }
.smp-card-code { color: #0f172a; font-size: 0.82rem; white-space: nowrap; }
.smp-card-floor-badge { padding: 2px 5px; border-radius: 4px; background: #f1f5f9; color: #475569; font-size: 0.62rem; font-weight: 700; white-space: nowrap; }

.smp-card-status-badge, .smp-action-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 6px;
  border-radius: 9999px;
  font-size: 0.62rem;
  font-weight: 700;
  white-space: nowrap;
}

.badge-available { background: #dcfce7; color: #15803d; }
.badge-reserved { background: #fef3c7; color: #b45309; }
.badge-occupied { background: #e2e8f0; color: #475569; }
.badge-selected { background: #2563eb; color: #ffffff; }

.smp-card-specs { min-width: 0; gap: 5px; color: #64748b; font-size: 0.67rem; }
.smp-spec-sep { color: #cbd5e1; }
.smp-spec-rent { color: #1e293b; font-weight: 700; white-space: nowrap; }
.smp-spec-rent small { color: #64748b; font-size: 0.6rem; font-weight: 500; }
.smp-card-action { margin-left: auto; }
.smp-action-pill.is-selected { background: #dbeafe; color: #1d4ed8; }
.smp-action-pill.is-avail { background: #dcfce7; color: #15803d; }
.smp-action-pill.is-wait { background: #fef3c7; color: #b45309; }
.smp-action-pill.is-occ { background: #e2e8f0; color: #64748b; }

.smp-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 22px 10px;
  color: #64748b;
  font-size: 0.72rem;
  text-align: center;
}

.smp-reopen-floor-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.16s ease;
  font-family: inherit;
}

.smp-reopen-floor-btn:hover {
  background: #dbeafe;
  color: #1d4ed8;
  transform: translateY(-1px);
}

/* ========================================================== */
/* FLOATING ACTIVE FLOOR BADGE ON MAP CANVAS                 */
/* ========================================================== */
.map-floating-active-floor-badge {
  position: absolute;
  top: 14px;
  left: 170px;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border: 1px solid #bfdbfe;
  border-radius: 9999px;
  padding: 5px 8px 5px 12px;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.12);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.map-floating-active-floor-badge:hover {
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.2);
  transform: translateY(-1px);
}

.mf-floor-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #1e293b;
}

.mf-floor-tag svg {
  color: #2563eb;
  flex-shrink: 0;
}

.mf-floor-tag strong {
  color: #2563eb;
  font-weight: 800;
}

.mf-change-floor-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 3px 9px;
  border-radius: 9999px;
  cursor: pointer;
  pointer-events: none; /* Whole capsule is clickable */
}

/* ========================================================== */
/* FLOOR SELECTION PERSPECTIVE (MODAL / OVERLAY)             */
/* ========================================================== */
.floor-selector-modal-overlay {
  position: absolute;
  inset: 0;
  z-index: 45;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.floor-selector-panel {
  width: 100%;
  max-width: 620px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fscScaleUp 0.26s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fscScaleUp {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fsc-top-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.fsc-top-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fsc-badge-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.fsc-building-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  border: 1px solid;
}

.fsc-proj-code {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 3px 9px;
  border-radius: 9999px;
}

.fsc-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0 0;
  line-height: 1.3;
}

.fsc-desc {
  font-size: 0.84rem;
  color: #64748b;
  margin: 0;
}

.fsc-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.16s ease;
  flex-shrink: 0;
}

.fsc-close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
  transform: rotate(90deg);
}

/* Guidance Card */
.fsc-guidance-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
  border: 1px solid #bfdbfe;
  border-radius: 14px;
  padding: 12px 16px;
}

.fsc-guidance-icon-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
}

.fsc-guidance-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fsc-step-label {
  font-size: 0.78rem;
  font-weight: 800;
  color: #1d4ed8;
  letter-spacing: 0.02em;
}

.fsc-step-hint {
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.4;
}

/* Floor Stack */
.fsc-floors-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 360px;
  overflow-y: auto;
  padding: 3px 7px 5px 3px;
  box-sizing: border-box;
}

.fsc-floor-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.fsc-floor-item:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.1);
  transform: translateY(-2px);
}

.fsc-floor-item.is-active-preview {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.14);
}

.fsc-pillar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  border-radius: 12px;
  background: #f1f5f9;
  border: 1.5px solid #e2e8f0;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.fsc-pillar-level {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.fsc-pillar-badge {
  font-size: 0.64rem;
  font-weight: 700;
  color: #64748b;
  margin-top: 3px;
}

.fsc-floor-item.is-active-preview .fsc-pillar,
.fsc-floor-item:hover .fsc-pillar {
  background: #2563eb;
  border-color: #1d4ed8;
}

.fsc-floor-item.is-active-preview .fsc-pillar .fsc-pillar-level,
.fsc-floor-item.is-active-preview .fsc-pillar .fsc-pillar-badge,
.fsc-floor-item:hover .fsc-pillar .fsc-pillar-level,
.fsc-floor-item:hover .fsc-pillar .fsc-pillar-badge {
  color: #ffffff;
}

.fsc-floor-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.fsc-floor-headline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.fsc-floor-title-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.fsc-avail-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 9999px;
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
  flex-shrink: 0;
}

.fsc-avail-chip.is-none {
  background: #f1f5f9;
  color: #94a3b8;
  border-color: #e2e8f0;
}

.fsc-avail-chip.is-full {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.fsc-avail-chip.is-queue {
  background: #fef3c7;
  color: #d97706;
  border-color: #fde68a;
}

.fsc-floor-item.is-floor-full {
  background: #fafbfc;
  opacity: 0.88;
}

.fsc-floor-item.is-floor-queue {
  background: #ffffff;
}

.fsc-floor-item.is-floor-full:hover {
  opacity: 1;
  background: #fffafa;
  border-color: #fecaca;
  box-shadow: 0 6px 18px rgba(220, 38, 38, 0.08);
}

.fsc-pillar.is-full {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.fsc-pillar.is-full .fsc-pillar-level,
.fsc-pillar.is-full .fsc-pillar-badge {
  color: #64748b;
}

/* Do not apply the blue "available/select" hover treatment to a full floor. */
.fsc-floor-item.is-floor-full:hover .fsc-pillar {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.fsc-floor-item.is-floor-full:hover .fsc-pillar .fsc-pillar-level,
.fsc-floor-item.is-floor-full:hover .fsc-pillar .fsc-pillar-badge {
  color: #64748b;
}

.fsc-meta-pill.is-full-tag {
  background: #fee2e2;
  color: #b91c1c;
  font-weight: 700;
  border-color: #fecaca;
}

.fsc-select-action-btn.is-full-action {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #cbd5e1;
  box-shadow: none;
}

.fsc-select-action-btn.is-queue-action {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
  box-shadow: none;
}

.fsc-floor-item:hover .fsc-select-action-btn.is-queue-action {
  background: #fef3c7;
  color: #b45309;
  border-color: #fcd34d;
  box-shadow: 0 2px 6px rgba(217, 119, 6, 0.2);
}

.fsc-floor-item:hover .fsc-select-action-btn.is-full-action {
  background: #f1f5f9;
  color: #475569;
  border-color: #94a3b8;
  box-shadow: 0 2px 6px rgba(71, 85, 105, 0.12);
}

.fsc-chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.fsc-floor-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.fsc-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #64748b;
  background: #f8fafc;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid #f1f5f9;
}

.fsc-meta-pill svg {
  color: #94a3b8;
}

.fsc-action-col {
  flex-shrink: 0;
}

.fsc-select-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s ease;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
  font-family: inherit;
}

.fsc-floor-item:hover .fsc-select-action-btn {
  background: #1d4ed8;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
  transform: translateX(2px);
}

/* Actions Bar */
.fsc-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.fsc-back-to-overview-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s ease;
  font-family: inherit;
}

.fsc-back-to-overview-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
  border-color: #94a3b8;
}

.fsc-footer-tip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: #64748b;
}

.fsc-footer-tip svg {
  color: #2563eb;
  flex-shrink: 0;
}

/* Fade Transition */
.fsc-fade-enter-active,
.fsc-fade-leave-active {
  transition: opacity 0.22s ease;
}

.fsc-fade-enter-from,
.fsc-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .floor-selector-panel {
    padding: 18px 16px;
  }
  .fsc-floor-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .fsc-action-col {
    display: flex;
    justify-content: flex-end;
  }
  .map-floating-active-floor-badge {
    left: 14px;
    top: 54px;
  }
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
  .maplibre-overview-wrapper {
    height: 520px;
  }

  .stall-mode-panel {
    top: auto;
    bottom: 12px;
    left: 12px;
    right: 12px;
    width: auto;
    max-height: 220px;
    padding: 12px 14px;
    gap: 8px;
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
    z-index: 15;
  }

  .smp-back-section {
    padding-bottom: 6px;
    border-bottom: 1px solid #f1f5f9;
  }

  .smp-back-btn {
    padding: 5px 10px;
    font-size: 0.76rem;
  }

  .smp-title {
    font-size: 0.95rem;
  }

  .smp-category {
    font-size: 0.72rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: -4px;
  }

  /* Compact multi-floor row on mobile */
  .smp-floor-section {
    padding: 6px 8px;
    gap: 6px;
  }

  .smp-floor-header {
    font-size: 0.75rem;
  }

  .smp-floor-segmented-row {
    display: flex;
    overflow-x: auto;
    flex-wrap: nowrap;
    gap: 6px;
    padding-bottom: 2px;
    -webkit-overflow-scrolling: touch;
  }

  .smp-floor-segmented-btn {
    flex: 0 0 auto;
    padding: 4px 8px;
  }

  /* Hide bulky area box, legend and hint on mobile to prioritize map stalls visibility */
  .smp-area-box {
    display: none;
  }

  .smp-legend {
    display: none;
  }

  .smp-hint {
    display: none;
  }

  /* Compact 4-column stats on mobile */
  .smp-stats {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }

  .smp-stat {
    padding: 5px 4px;
    text-align: center;
  }

  .smp-stat-label {
    font-size: 0.65rem;
  }

  .smp-stat strong {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .map-floating-top-controls {
    top: 10px;
    right: 10px;
    gap: 6px;
  }

  .map-floating-style-switcher .map-mode-tab {
    padding: 5px 10px;
    font-size: 0.78rem;
  }

  .map-floating-recenter-btn {
    padding: 5px 10px;
    font-size: 0.78rem;
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

/* At mid zoom, a small project number keeps the map readable without hiding polygons. */
.maplibre-zone-number-badge.is-compact {
  min-width: 22px;
  height: 22px;
  padding: 0 4px;
  border-radius: 50%;
  font-size: 9px;
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
  justify-content: flex-start;
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
.mlp-body { padding: 14px 16px 12px; }
.mlp-project-context { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; overflow: hidden; color: #64748b; font-size: .68rem; font-weight: 700; white-space: nowrap; }
.mlp-project-context span { overflow: hidden; text-overflow: ellipsis; }
.mlp-project-context i { flex: 0 0 auto; color: #94a3b8; font-style: normal; }

.mlp-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 8px;
}
.mlp-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.mlp-stall-heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.mlp-title strong {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  overflow-wrap: anywhere;
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
}
.mlp-pill.is-open { background: #dcfce7; color: #15803d; }
.mlp-pill.is-full { background: #fee2e2; color: #dc2626; }

.mlp-building-row {
  margin: 5px 0 0 18px;
}

.mlp-building-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  padding: 2px 7px;
  border-radius: 4px;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 700;
  border: 1px solid #bfdbfe;
}

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

.map-floating-floor-preview-pill {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 4px 10px 4px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
}

.floor-preview-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
}

.floor-preview-tabs {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.floor-preview-tab {
  padding: 4px 12px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  color: #475569;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.floor-preview-tab:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.floor-preview-tab.active {
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
}

/* Preview Mode Styles */
.projects-master-container.is-preview-mode {
  padding: 12px;
  gap: 12px;
  background: #ffffff;
  border-radius: 14px;
}

.projects-master-container.is-preview-mode .maplibre-overview-wrapper {
  height: 540px;
}

@media (max-width: 768px) {
  .projects-master-container.is-preview-mode .maplibre-overview-wrapper {
    height: 440px;
  }
}

.preview-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  background: #ffffff;
  padding: 14px 18px;
  border-bottom: 1px solid #eef2f6;
  border-radius: 16px 16px 0 0;
  width: 100%;
}

.preview-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.preview-head-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.preview-head-text-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.preview-head-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-head-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.preview-head-cat-badge {
  font-size: 0.74rem;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 1px 8px;
  border-radius: 6px;
  white-space: nowrap;
}

.preview-head-subtitle {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 460px;
}

.preview-head-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-left: auto;
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

/* Selected Stall Checkmark Icon */
:deep(.selected-stall-pin-marker) {
  pointer-events: none;
  z-index: 25;
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
