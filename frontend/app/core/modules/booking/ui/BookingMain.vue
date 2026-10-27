<template>
  <div class="booking-tracking-page">
    <AppHeader />

    <div class="tracking-container">
      <!-- ============================================================ -->
      <!-- SECTION 1: TENANT VIEW (มุมมองผู้เช่า - มีแบ่ง Accordion ตามตลาด) -->
      <!-- ============================================================ -->
      <div v-if="currentRole === 'tenant'" class="tenant-view-section">
        <!-- Page Main Title & Actions -->
        <div class="page-header-row">
          <h1 class="main-page-title">การจองของฉัน</h1>

          <div class="page-header-actions">
            <AppButton
              variant="danger-outline"
              size="sm"
              @click="handleClearAllData"
              title="ล้างข้อมูลการจองและคำร้องทั้งหมด เพื่อเริ่มทดสอบ Flow ใหม่จาก 0"
            >
              <template #prefix>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </template>
              <span>รีเซ็ตข้อมูลทดสอบ</span>
            </AppButton>
          </div>
        </div>

        <!-- Main Content Card -->
        <div class="main-white-card">
          <!-- Header Row: Title & Subtitle on Left, Search + Filter on Right -->
          <div class="card-header-row">
            <div class="header-left">
              <h2 class="section-title">รายการจองทั้งหมด</h2>
              <div class="item-count-subtitle">
                {{ countAll }} รายการ
              </div>
            </div>

            <div class="header-right">
              <!-- Search Input -->
              <div class="search-input-wrapper">
                <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  type="text"
                  v-model="tenantSearchQuery"
                  placeholder="ค้นหาหมายเลขการจอง หรือแผง"
                  class="search-input"
                />
                <button v-if="tenantSearchQuery" class="clear-search-btn" @click="tenantSearchQuery = ''" aria-label="ล้างการค้นหา">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <!-- Filter Button + Floating Dropdown Panel (แบบ Step 1) -->
              <!-- Toggle Sort Order Button (สลับจองล่าสุด <-> จองเก่าที่สุด) -->
              <button
                type="button"
                class="sort-toggle-btn"
                @click="toggleTenantSort"
                :title="tenantSortOrder === 'newest' ? 'คลิกเพื่อสลับเป็นเรียงจากจองเก่าที่สุด' : 'คลิกเพื่อสลับเป็นเรียงจากจองล่าสุด'"
                aria-label="สลับการเรียงลำดับรายการจอง"
              >
                <svg
                  v-if="tenantSortOrder === 'newest'"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="sort-toggle-icon"
                >
                  <path d="M4 6h7"></path>
                  <path d="M4 12h5"></path>
                  <path d="M4 18h3"></path>
                  <path d="M17 6v12"></path>
                  <path d="m13 14 4 4 4-4"></path>
                </svg>
                <svg
                  v-else
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="sort-toggle-icon"
                >
                  <path d="M4 6h7"></path>
                  <path d="M4 12h5"></path>
                  <path d="M4 18h3"></path>
                  <path d="M17 18V6"></path>
                  <path d="m13 10 4-4 4 4"></path>
                </svg>
                <span>{{ tenantSortOrder === 'newest' ? 'จองล่าสุด' : 'จองเก่าที่สุด' }}</span>
              </button>

              <!-- Filter Button + Floating Dropdown Panel -->
              <div class="map-advanced-filter-wrap">
                <button
                  type="button"
                  class="map-advanced-filter-btn"
                  :class="{ active: hasTenantAdvancedFilters || showTenantFilterPanel }"
                  @click="openTenantFilterPanel"
                  :aria-expanded="showTenantFilterPanel"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M7 12h10m-7 6h4"></path></svg>
                  <span>ตัวกรอง</span>
                  <span v-if="tenantAdvancedFilterCount" class="map-advanced-count">{{ tenantAdvancedFilterCount }}</span>
                </button>

                <!-- Invisible Backdrop to close on click outside -->
                <div v-if="showTenantFilterPanel" class="filter-backdrop" @click="closeTenantFilterPanel"></div>

                <!-- Floating Filter Panel -->
                <div v-if="showTenantFilterPanel" class="map-advanced-filter-panel" @click.stop>
                  <div class="map-filter-panel-head">
                    <strong>ตัวกรอง</strong>
                    <button type="button" @click="closeTenantFilterPanel" aria-label="ปิดตัวกรอง">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  <!-- 1. กรองตามตลาด -->
                  <div class="filter-field-group">
                    <span class="filter-field-label">ตลาด</span>
                    <AppSelect
                      v-model="tempTenantMarket"
                      :options="tenantMarketOptions"
                      placeholder="ทุกตลาด"
                    />
                  </div>


                  <!-- 3. กรองตามช่วงเวลานัดหมายเข้าชม -->
                  <div class="filter-field-group">
                    <span class="filter-field-label">ช่วงเวลานัดหมาย</span>
                    <AppSelect
                      v-model="tempTenantVisitTime"
                      :options="tenantVisitTimeOptions"
                      placeholder="ทุกช่วงเวลา"
                    />
                  </div>

                  <!-- Footer Summary & Actions -->
                  <div class="map-filter-panel-footer">
                    <div class="mfp-result-summary">
                      <span class="mfp-result-label">ผลลัพธ์:</span>
                      <span class="mfp-result-val"><strong>{{ previewFilteredTenantCount }}</strong> รายการ</span>
                    </div>
                    <div class="mfp-action-grid">
                      <button
                        type="button"
                        class="btn-filter-reset"
                        :disabled="!hasTempTenantAdvancedFilters && !hasTenantAdvancedFilters"
                        @click="clearTenantAdvancedFilters"
                        title="ล้างค่าตัวกรอง"
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
                        @click="applyTenantFilters"
                        title="ค้นหา"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <span>ค้นหา</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- View Mode Segmented Control (ออกมาข้างนอก) -->
              <AppSegmentedControl
                v-model="tenantViewMode"
                :options="tenantViewOptions"
                aria-label="เลือกรูปแบบการแสดงรายการจอง"
              />
            </div>
          </div>

          <!-- Tenant KPI Ribbon Cards (เหมือนของเจ้าหน้าที่) -->
          <div class="officer-kpi-ribbon tenant-kpi-ribbon" style="margin-top: 18px; margin-bottom: 24px;">
            <!-- 1. รายการทั้งหมด -->
            <div
              class="kpi-ribbon-card kpi-all"
              :class="{ active: tenantStatusTab === 'all' }"
              @click="tenantStatusTab = 'all'"
              role="button"
              tabindex="0"
            >
              <div class="kpi-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              </div>
              <div class="kpi-text-box">
                <div class="kpi-title">ทั้งหมด</div>
                <div class="kpi-value-row">
                  <span class="kpi-count">{{ countAll }}</span>
                  <span class="kpi-unit-pill">รายการ</span>
                </div>
              </div>
            </div>

            <!-- 2. รอดำเนินการ -->
            <div
              class="kpi-ribbon-card kpi-pending"
              :class="{ active: tenantStatusTab === 'pending' }"
              @click="tenantStatusTab = 'pending'"
              role="button"
              tabindex="0"
            >
              <div class="kpi-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="kpi-text-box">
                <div class="kpi-title">รอดำเนินการ</div>
                <div class="kpi-value-row">
                  <span class="kpi-count">{{ countPending }}</span>
                  <span class="kpi-unit-pill">รายการ</span>
                </div>
              </div>

              <!-- Info Tooltip Button (มุมบนขวาของการ์ด) -->
              <div
                class="kpi-info-wrapper"
                @mouseenter="showTenantPendingTooltip = true"
                @mouseleave="showTenantPendingTooltip = false"
                @click.stop="toggleTenantPendingTooltip"
              >
                <button
                  type="button"
                  class="kpi-info-btn"
                  aria-label="ดูรายละเอียดสถานะในกลุ่มรอดำเนินการ"
                  title="ดูรายละเอียดสถานะย่อย"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </button>

                <!-- Rich Tooltip Popover -->
                <transition name="fade-slide">
                  <div v-if="showTenantPendingTooltip" class="kpi-info-popover" @click.stop>
                    <div class="kpi-popover-header">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      <span>สถานะในกลุ่มรอดำเนินการ ({{ countPending }})</span>
                    </div>
                    <div class="kpi-popover-body">
                      <div class="kpi-popover-item" :class="{ 'is-selected': tenantSubFilter === 'pending_approval' }" @click="setTenantSubFilter('pending_approval')">
                        <span class="kpi-status-dot amber"></span>
                        <span class="kpi-status-name">รอเจ้าหน้าที่อนุมัติ</span>
                        <span class="kpi-status-val">{{ tenantCountPendingApproval }}</span>
                      </div>
                      <div class="kpi-popover-item" :class="{ 'is-selected': tenantSubFilter === 'approved' }" @click="setTenantSubFilter('approved')">
                        <span class="kpi-status-dot green"></span>
                        <span class="kpi-status-name">นัดหมายสำเร็จ</span>
                        <span class="kpi-status-val">{{ tenantCountApproved }}</span>
                      </div>
                      <div class="kpi-popover-item" :class="{ 'is-selected': tenantSubFilter === 'interested' }" @click="setTenantSubFilter('interested')">
                        <span class="kpi-status-dot blue"></span>
                        <span class="kpi-status-name">รอผู้เช่ายื่นคำร้อง</span>
                        <span class="kpi-status-val">{{ tenantCountInterested }}</span>
                      </div>
                    </div>
                    <div v-if="tenantSubFilter !== 'all'" class="kpi-popover-reset" @click="setTenantSubFilter('all')">
                      <span>แสดงทั้งหมดในรอดำเนินการ</span>
                    </div>
                  </div>
                </transition>
              </div>
            </div>

            <!-- 3. ยื่นคำร้องสำเร็จ (สีม่วง) -->
            <div
              class="kpi-ribbon-card kpi-applied"
              :class="{ active: tenantStatusTab === 'applied' }"
              @click="tenantStatusTab = 'applied'"
              role="button"
              tabindex="0"
            >
              <div class="kpi-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div class="kpi-text-box">
                <div class="kpi-title">ยื่นคำร้องสำเร็จ</div>
                <div class="kpi-value-row">
                  <span class="kpi-count">{{ countApplied }}</span>
                  <span class="kpi-unit-pill">รายการ</span>
                </div>
              </div>
            </div>

            <!-- 5. ยกเลิก -->
            <div
              class="kpi-ribbon-card kpi-cancelled"
              :class="{ active: tenantStatusTab === 'cancelled' }"
              @click="tenantStatusTab = 'cancelled'"
              role="button"
              tabindex="0"
            >
              <div class="kpi-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              </div>
              <div class="kpi-text-box">
                <div class="kpi-title">ยกเลิก</div>
                <div class="kpi-value-row">
                  <span class="kpi-count">{{ countCancelled }}</span>
                  <span class="kpi-unit-pill">รายการ</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tenant Sub-filters when "รอดำเนินการ" is Active -->
          <transition name="fade-slide">
            <div v-if="tenantStatusTab === 'pending'" class="tenant-subfilter-bar">
              <button
                type="button"
                class="subfilter-chip chip-all"
                :class="{ active: tenantSubFilter === 'all' }"
                @click="tenantSubFilter = 'all'"
              >
                <span>ทั้งหมด</span>
                <span class="subfilter-badge">{{ countPending }}</span>
              </button>
              <button
                type="button"
                class="subfilter-chip chip-amber"
                :class="{ active: tenantSubFilter === 'pending_approval' }"
                @click="tenantSubFilter = 'pending_approval'"
              >
                <span class="subfilter-dot"></span>
                <span>รอเจ้าหน้าที่อนุมัติ</span>
                <span class="subfilter-badge">{{ tenantCountPendingApproval }}</span>
              </button>
              <button
                type="button"
                class="subfilter-chip chip-green"
                :class="{ active: tenantSubFilter === 'approved' }"
                @click="tenantSubFilter = 'approved'"
              >
                <span class="subfilter-dot"></span>
                <span>นัดหมายสำเร็จ</span>
                <span class="subfilter-badge">{{ tenantCountApproved }}</span>
              </button>
              <button
                type="button"
                class="subfilter-chip chip-blue"
                :class="{ active: tenantSubFilter === 'interested' }"
                @click="tenantSubFilter = 'interested'"
              >
                <span class="subfilter-dot"></span>
                <span>รอผู้เช่ายื่นคำร้อง</span>
                <span class="subfilter-badge">{{ tenantCountInterested }}</span>
              </button>
            </div>
          </transition>


          <!-- Loading State -->
          <AppBookingListSkeleton v-if="loading" :count="2" />

          <!-- Empty State -->
          <div v-else-if="filteredTenantBookings.length === 0" class="empty-state-box">
            <div class="empty-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>

            <!-- Case A: Current tab has 0, but user has bookings in other tabs -->
            <template v-if="countAll > 0 && tenantStatusTab !== 'all'">
              <div class="empty-title">ไม่มีรายการในแท็บ "{{ getTenantTabName(tenantStatusTab) }}"</div>
              
            </template>

            <!-- Case B: Sub-filter in pending has 0 items -->
            <template v-else-if="tenantStatusTab === 'pending' && tenantSubFilter !== 'all'">
              <div class="empty-title">ไม่มีรายการในขั้นตอนนี้</div>
            </template>

            <!-- Case C: Filtered by search query -->
            <template v-else-if="tenantSearchQuery">
              <div class="empty-title">ไม่พบรายการที่ตรงกับ "{{ tenantSearchQuery }}"</div>
              <div class="empty-desc">ลองตรวจสอบคำค้นหา หรือล้างคำค้นหาเพื่อดูรายการทั้งหมด</div>
              <button
                type="button"
                class="btn btn-outline-primary btn-sm"
                @click="tenantSearchQuery = ''; currentPage = 1"
                style="margin-top: 14px;"
              >
                ล้างคำค้นหา
              </button>
            </template>

            <!-- Case D: Truly zero bookings in system -->
            <template v-else>
              <div class="empty-title">ยังไม่มีประวัติการจองแผงค้า</div>
              <div class="empty-desc">คุณยังไม่มีรายการจองแผงค้าในระบบ สามารถเลือกตลาดและยื่นขอนัดดูแผงได้ทันที</div>
              <NuxtLink to="/" class="btn btn-primary btn-sm" style="margin-top: 14px; display: inline-flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span>ไปยังหน้าเลือกตลาดเพื่อจองแผง</span>
              </NuxtLink>
            </template>
          </div>

          <!-- Market Accordion Groups List (เมื่อเลือกมุมมองตามตลาด) หรือ ลิสต์การ์ดทั้งหมด (เมื่อเลือกมุมมองรายการทั้งหมด) -->
          <div
            v-else
            :class="tenantViewMode === 'flat' ? 'tenant-bookings-list' : 'market-accordions-list'"
          >
            <div
              v-for="group in tenantDisplayGroups"
              :key="group.name"
              :class="{ 'market-accordion-card': !group.isFlat }"
            >
              <!-- Accordion Header Button (เฉพาะโหมดตามตลาด) -->
              <button
                v-if="!group.isFlat"
                class="market-accordion-header"
                :class="{ open: isMarketOpen(group.name) }"
                @click="toggleMarket(group.name)"
              >
                <div class="header-left-content">
                  <svg
                    class="chevron-indicator"
                    :class="{ rotated: isMarketOpen(group.name) }"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <span class="market-title">{{ group.name }}</span>
                  <span class="market-count-pill">{{ group.bookings.length }} รายการจอง</span>
                </div>
                <div v-if="group.hasLatest" class="header-right-content">
                  <span class="latest-ribbon-badge" title="ตลาดนี้มีรายการจองล่าสุดของคุณ">
                    <span class="pulse-dot-sm"></span>
                    <span>การจองล่าสุด</span>
                  </span>
                </div>
              </button>

              <!-- Accordion Body (Booking Cards) -->
              <div
                v-show="group.isFlat || isMarketOpen(group.name)"
                :class="{
                  'market-accordion-body': !group.isFlat,
                  'tenant-flat-cards-list': group.isFlat
                }"
              >
                <div
                  v-for="b in group.bookings"
                  :key="b.id"
                  :id="`tenant-booking-${b.id}`"
                  :data-booking-id="String(b.id)"
                  class="booking-item-card"
                  :class="[getCardBorderClass(b.status), { 'is-latest-card': isLatestBooking(b), 'collapsed-card': !isCardExpanded(b.id) }]"
                >
                  <!-- Card Top Row -->
                  <div class="card-top-row">
                    <!-- Top Line: Booking ID & Status Badge + Chevron -->
                    <div class="card-top-main">
                      <div class="top-row-left">
                        <!-- Circular Icon -->
                        <div class="circle-status-icon blue-circle">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>

                        <!-- Booking Number & Label -->
                        <div class="booking-number-block">
                          <div class="booking-label-row">
                            <span class="booking-label">หมายเลขการจอง</span>
                          </div>
                          <div class="booking-id-text">{{ formatBookingNumber(b.booking_number) }}</div>
                          <div class="tenant-booked-at" :title="`วันที่จอง: ${formatCreatedDate(b.created_at)}`">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>วันที่จอง {{ formatSubmissionTimestamp(b.created_at) }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="top-row-right">
                        <span v-if="isLatestBooking(b)" class="latest-ribbon-badge" title="นี่คือรายการจองล่าสุดของคุณ">
                          <span class="pulse-dot-sm"></span>
                          <span>การจองล่าสุด</span>
                        </span>
                        <span
                          v-if="b.holding_stall && !isQueueBooking(b) && !['rejected', 'cancelled', 'not_interested', 'no_show', 'lease_applied', 'completed'].includes(b.status)"
                          class="in-card-role-pill is-holder"
                          title="ผู้มีสิทธิ์จองหลัก (ตัวจริง)"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                          <span>ผู้จองหลัก (ตัวจริง)</span>
                        </span>
                        <span
                          v-else-if="isQueueBooking(b)"
                          class="in-card-role-pill is-queue"
                          title="ลำดับคิวสำรอง"
                        >
                          <span>คิวสำรองที่ {{ b.queue_position || b.queue_number || 1 }}</span>
                        </span>
                        <!-- Status Badge Pill -->
                        <span class="status-pill-badge" :class="getStatusPillClass(b.status)">
                          {{ getStatusBadgeLabel(b.status) }}
                        </span>

                        <!-- Card Collapse Toggle Chevron -->
                        <button class="card-collapse-btn" @click="toggleCardExpanded(b.id)" title="ย่อ/ขยายการ์ด">
                          <svg
                            class="card-chevron"
                            :class="{ rotated: isCardExpanded(b.id) }"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Compact context row: stall, project and market. -->
                    <div class="card-meta-tags-row compact-tenant-meta">
                      <div class="compact-meta-item compact-meta-stall" title="รหัสแผงค้า">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        <span>แผงค้า</span>
                        <strong>{{ b.stall_number }}</strong>
                        <span v-if="b.stall_count && b.stall_count > 1">({{ b.stall_count }} แผง)</span>
                      </div>

                      <div class="compact-meta-item" :title="`โครงการ ${getBookingProjectName(b)}`">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9"></path><path d="M9 22V12h6v10"></path></svg>
                        <span>{{ getBookingProjectName(b) }}</span>
                      </div>

                      <div class="compact-meta-item" :title="`ตลาด ${b.market_name || 'ตลาดนัดจตุจักร'}`">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"></path></svg>
                        <span>{{ b.market_name || 'ตลาดนัดจตุจักร' }}</span>
                      </div>

                      <div class="compact-meta-item compact-meta-person" :title="`ผู้ขอจอง: ${b.tenant_name} (${b.tenant_phone})`">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <strong>{{ b.tenant_name }}</strong>
                        <a :href="`tel:${b.tenant_phone}`" @click.stop>{{ b.tenant_phone }}</a>
                      </div>
                    </div>

                    <!-- Multi-Stall Appointment Sub-List (ช่วยให้เลือกยื่นคำร้องขอเช่า หรือสละสิทธิ์แยกรายแผงได้อิสระในนัดหมายเดียวกัน) -->
                    <div
                      v-if="b.sub_bookings && b.sub_bookings.length > 1"
                      class="multi-stall-appointment-box"
                    >
                      <div class="msa-header">
                        <span class="msa-title">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                          <span>รายการแผงค้าในรอบนัดหมายนี้ ({{ b.sub_bookings.length }} แผง)</span>
                        </span>
                        <span class="msa-hint">สามารถเลือกยื่นคำร้องขอเช่า หรือสละสิทธิ์แยกรายแผงได้</span>
                      </div>
                      <div class="msa-grid">
                        <div
                          v-for="sub in b.sub_bookings"
                          :key="sub.id"
                          class="msa-stall-item"
                        >
                          <div class="msa-stall-info">
                            <span class="msa-stall-code">แผง {{ sub.stall_number }}</span>
                            <span v-if="sub.stall_zone_name" class="msa-stall-zone">{{ sub.stall_zone_name }}</span>
                            <span v-if="sub.stall_monthly_rate" class="msa-stall-rate">฿{{ Number(sub.stall_monthly_rate).toLocaleString() }}/เดือน</span>
                          </div>
                          <div class="msa-stall-actions">
                            <button
                              v-if="sub.status === 'interested'"
                              type="button"
                              class="msa-btn msa-btn-primary"
                              @click.stop="openLeaseApplication(sub)"
                            >
                              <span>ยื่นคำร้องแผงนี้</span>
                            </button>
                            <button
                              v-if="['pending', 'pending_approval', 'approved', 'interested'].includes(sub.status)"
                              type="button"
                              class="msa-btn msa-btn-danger"
                              @click.stop="handleCancelSingleStallBooking(sub, 'ผู้เช่าขอสละสิทธิ์เฉพาะแผงนี้')"
                            >
                              <span>{{ sub.status === 'interested' ? 'สละสิทธิ์แผงนี้' : 'ยกเลิกแผงนี้' }}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Next Step Guidance & Actions Bar for Collapsed View -->
                  <div
                    v-if="!isCardExpanded(b.id)"
                    class="collapsed-next-step"
                    :class="getTenantNextStepTone(b.status)"
                  >
                    <div class="collapsed-next-step-content">
                      <span class="collapsed-next-step-label">{{ getTenantNextStepLabel(b.status) }}</span>
                      <strong>{{ getTenantNextStep(b) }}</strong>
                    </div>

                    <div class="collapsed-actions-group">
                      <!-- 1. ปุ่มยกเลิก / สละสิทธิ์ -->
                      <AppButton
                        v-if="isQueueBooking(b) && ['pending_approval', 'pending', 'approved', 'waiting_queue'].includes(b.status)"
                        variant="danger-outline"
                        size="base"
                        class="action-btn-secondary action-btn-cancel"
                        @click.stop="handleCancelBooking(b, 'ผู้เช่ายกเลิกการต่อคิว')"
                        title="สละสิทธิ์การต่อคิว"
                      >
                        <template #prefix>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </template>
                        <span>สละสิทธิ์</span>
                      </AppButton>

                      <AppButton
                        v-else-if="['pending_approval', 'pending', 'pending_slot', 'approved', 'interested'].includes(b.status)"
                        variant="danger-outline"
                        size="base"
                        class="action-btn-secondary action-btn-cancel"
                        @click.stop="handleCancelBooking(b, 'ผู้เช่าขอยกเลิกการจอง')"
                        title="ยกเลิกคำขอจอง"
                      >
                        <template #prefix>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </template>
                        <span>ยกเลิก</span>
                      </AppButton>

                      <!-- 2. ปุ่มดูรายละเอียด -->
                      <AppButton
                        variant="secondary"
                        size="base"
                        class="action-btn-secondary action-btn-details"
                        @click.stop="openBookingDetails(b)"
                        title="ดูรายละเอียดการจอง"
                      >
                        <template #prefix>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                        </template>
                        <span>รายละเอียด</span>
                      </AppButton>

                      <!-- 3. Primary Actions ตามสถานะ -->
                      <!-- สถานะ: pending_slot -> เลือกวันนัดชม (คิวสำรองเลื่อนขึ้นมาถือแผง) -->
                      <AppButton
                        v-if="b.status === 'pending_slot'"
                        variant="primary"
                        size="base"
                        class="action-btn-primary action-btn-apply"
                        @click.stop="openSelectSlotModal(b)"
                      >
                        <span>เลือกวันนัดชม</span>
                        <template #suffix>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </template>
                      </AppButton>

                      <!-- สถานะ: interested -> ยื่นคำร้องขอเช่าแผงนี้ (สีน้ำเงิน) -->
                      <AppButton
                        v-else-if="b.status === 'interested'"
                        variant="primary"
                        size="base"
                        class="action-btn-primary action-btn-apply"
                        @click.stop="openLeaseApplication(b)"
                      >
                        <span>ยื่นคำร้องขอเช่าแผงนี้</span>
                        <template #suffix>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </template>
                      </AppButton>

                      <!-- สถานะ: lease_applied หรือ completed -> ติดตามคำร้อง (สีม่วง) -->
                      <AppButton
                        v-else-if="b.status === 'lease_applied' || b.status === 'completed'"
                        to="/applications"
                        variant="purple"
                        size="base"
                        class="action-btn-primary action-btn-follow"
                        @click.stop
                      >
                        <span>ติดตามคำร้อง</span>
                        <template #suffix>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </template>
                      </AppButton>
                    </div>
                  </div>

                  <!-- Expanded Card Body (Only mounted when explicitly expanded) -->
                  <div v-if="isCardExpanded(b.id)" class="card-expandable-content">
                    <!-- 3-Phase Stepper (จองดูแผง -> นัดชมแผง -> ยื่นคำร้องขอเช่า) -->
                    <div class="booking-stepper-container">
                      <div class="stepper-track">
                        <!-- Step 1: จองดูแผง -->
                        <div class="stepper-step" :class="{ completed: isStepCompleted(b.status, 1), active: isStepActive(b.status, 1) }">
                          <div class="step-circle">
                            <svg v-if="isStepCompleted(b.status, 1)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span v-else>1</span>
                          </div>
                          <div class="step-label-text">จองดูแผง</div>
                        </div>

                        <!-- Line 1-2 -->
                        <div class="stepper-connector" :class="{ filled: isStepCompleted(b.status, 1) }"></div>

                        <!-- Step 2: นัดชมแผง -->
                        <div class="stepper-step" :class="{ completed: isStepCompleted(b.status, 2), active: isStepActive(b.status, 2) }">
                          <div class="step-circle">
                            <svg v-if="isStepCompleted(b.status, 2)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span v-else>2</span>
                          </div>
                          <div class="step-label-text">นัดชมแผง</div>
                        </div>

                        <!-- Line 2-3 -->
                        <div class="stepper-connector" :class="{ filled: isStepCompleted(b.status, 2) }"></div>

                        <!-- Step 3: ยื่นคำร้องขอเช่า -->
                        <div class="stepper-step" :class="{ completed: isStepCompleted(b.status, 3), active: isStepActive(b.status, 3) }">
                          <div class="step-circle">
                            <svg v-if="isStepCompleted(b.status, 3)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span v-else>3</span>
                          </div>
                          <div class="step-label-text">{{ isStepCompleted(b.status, 3) ? 'ยื่นคำร้องสำเร็จ' : 'ยื่นคำร้องขอเช่า' }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- 3-Column Info Row -->
                    <div class="info-columns-grid tenant-columns-grid">
                      <!-- Column 1: วันนัดชมแผง -->
                      <div class="info-column">
                        <div class="info-label">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          <span>วันนัดชมแผง</span>
                        </div>
                        <div class="info-value-row">
                          <span class="info-value-text">{{ formatThaiVisitDate(b.visit_date, b) }}</span>
                          <span v-if="getDaysRemainingBadge(b.visit_date)" class="days-remaining-pill">
                            {{ getDaysRemainingBadge(b.visit_date) }}
                          </span>
                        </div>
                      </div>

                      <!-- Column 2: เวลานัดชม -->
                      <div class="info-column">
                        <div class="info-label">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          <span>เวลานัดชม</span>
                        </div>
                        <div class="info-value-row">
                          <span class="info-value-text">{{ getVisitTimeSlot(b) }}</span>
                        </div>
                      </div>

                      <!-- Column 3: แผงค้า -->
                      <div class="info-column">
                        <div class="info-label">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                          <span>แผงค้า</span>
                        </div>
                        <div class="info-value-row">
                          <span class="stall-count-pill">
                            <span class="stall-code-strong">{{ b.stall_number }}</span>
                            <span v-if="b.stall_count && b.stall_count > 1" class="stall-count-badge">({{ b.stall_count }} แผง)</span>
                          </span>
                        </div>
                      </div>

                      <!-- Column 4: ผู้ขอจอง -->
                      <div class="info-column">
                        <div class="info-label">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                          <span>ผู้ขอจอง</span>
                        </div>
                        <div class="info-value-row">
                          <span class="info-value-text">{{ b.tenant_name }}</span>
                          <a :href="`tel:${b.tenant_phone}`" class="phone-call-btn" title="คลิกเพื่อโทรออกทันที">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            <span>{{ b.tenant_phone }}</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <!-- Card Footer Row with High-Impact Visual Hierarchy -->
                    <div class="card-footer-row">
                      <div class="footer-left-status" :class="getTenantNextStepTone(b.status)">
                        <!-- สไตล์ข้อความเหมือนตอน collapse เพื่อความกลมกลืนเป็นหนึ่งเดียวกัน -->
                        <div class="collapsed-next-step-content">
                          <span class="collapsed-next-step-label">{{ getTenantNextStepLabel(b.status) }}</span>
                          <strong>{{ getTenantNextStep(b) }}</strong>
                        </div>
                      </div>

                      <div class="footer-right-actions">
                        <!-- 1. ปุ่มยกเลิก / สละสิทธิ์ -->
                        <AppButton
                          v-if="isQueueBooking(b) && ['pending_approval', 'pending', 'approved', 'waiting_queue'].includes(b.status)"
                          variant="danger-outline"
                          size="base"
                          @click="handleCancelBooking(b, 'ผู้เช่ายกเลิกการต่อคิว')"
                          title="สละสิทธิ์การต่อคิว"
                        >
                          <template #prefix>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </template>
                          <span>สละสิทธิ์</span>
                        </AppButton>
                        <AppButton
                          v-else-if="['pending_approval', 'pending', 'pending_slot', 'approved', 'interested'].includes(b.status)"
                          variant="danger-outline"
                          size="base"
                          @click="handleCancelBooking(b, 'ผู้เช่าขอยกเลิกการจอง')"
                          title="ยกเลิกคำขอจอง"
                        >
                          <template #prefix>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </template>
                          <span>ยกเลิก</span>
                        </AppButton>

                        <!-- 2. ปุ่มดูรายละเอียด -->
                        <AppButton
                          variant="secondary"
                          size="base"
                          @click="openBookingDetails(b)"
                        >
                          <template #prefix>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                          </template>
                          <span>รายละเอียด</span>
                        </AppButton>

                        <!-- 3. Primary Actions ตามสถานะ -->
                        <!-- pending_slot -> เลือกวันนัดชม -->
                        <AppButton
                          v-if="b.status === 'pending_slot'"
                          variant="primary"
                          size="base"
                          @click="openSelectSlotModal(b)"
                        >
                          <span>เลือกวันนัดชม</span>
                          <template #suffix>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </template>
                        </AppButton>

                        <!-- interested -> ยื่นคำร้องขอเช่าแผงนี้ -->
                        <AppButton
                          v-else-if="b.status === 'interested'"
                          variant="primary"
                          size="base"
                          @click="openLeaseApplication(b)"
                        >
                          <span>ยื่นคำร้องขอเช่าแผงนี้</span>
                          <template #suffix>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </template>
                        </AppButton>

                        <!-- lease_applied หรือ completed -> ติดตามคำร้อง -->
                        <AppButton
                          v-else-if="b.status === 'lease_applied' || b.status === 'completed'"
                          to="/applications"
                          variant="purple"
                          size="base"
                        >
                          <span>ติดตามคำร้อง</span>
                          <template #suffix>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </template>
                        </AppButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Pagination Row -->
          <AppPagination
            v-if="filteredTenantBookings.length > 0"
            v-model="currentPage"
            v-model:items-per-page="itemsPerPage"
            :total-items="filteredTenantBookings.length"
          />
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 2: OFFICER VIEW (มุมมองเจ้าหน้าที่ - ดูเฉพาะตลาดของตนเอง) -->
      <!-- ============================================================ -->
      <div v-else class="officer-view-section">
        <!-- Page Main Title & Actions -->
        <div class="page-header-row">
          <h1 class="main-page-title">จัดการนัดชมแผง</h1>

          <div class="page-header-actions">
            <AppButton
              variant="danger-outline"
              size="sm"
              @click="handleClearAllData"
              title="ล้างข้อมูลการจองและคำร้องทั้งหมด เพื่อเริ่มทดสอบ Flow ใหม่จาก 0"
            >
              <template #prefix>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </template>
              <span>รีเซ็ตข้อมูลทดสอบ</span>
            </AppButton>
          </div>
        </div>

        <!-- Main Content Card (โครงเดียวกับผู้เช่า) -->
        <div class="main-white-card">
          <!-- Header Row: Title & Subtitle on Left, Search + Actions on Right (โครงเดียวกับผู้เช่า) -->
          <div class="card-header-row">
            <div class="header-left">
              <h2 class="section-title">รายการจองทั้งหมด</h2>
              <div class="item-count-subtitle">{{ getOfficerTabName(officerActiveTab) }} {{ filteredOfficerBookings.length }} รายการ</div>
            </div>

            <div class="header-right">

              <!-- Search Input -->
              <div class="search-input-wrapper">
                <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  type="text"
                  v-model="officerSearchQuery"
                  placeholder="ค้นหาหมายเลขการจอง หรือผู้จอง"
                  class="search-input"
                />
                <button v-if="officerSearchQuery" class="clear-search-btn" @click="officerSearchQuery = ''; officerCurrentPage = 1" aria-label="ล้างการค้นหา">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>



              <!-- View Mode Toggle: Cards vs Table -->
              <AppSegmentedControl
                v-model="officerViewMode"
                :options="officerViewOptions"
                aria-label="เลือกรูปแบบการแสดงรายการสำหรับเจ้าหน้าที่"
              />
            </div>
          </div>

          <!-- Status overview cards -->
          <div
            class="officer-kpi-ribbon officer-status-kpi-ribbon"
            :class="{ 'compact-card-gap': officerViewMode === 'project' }"
          >
            <button type="button" class="kpi-ribbon-card kpi-all" :class="{ active: officerActiveTab === 'all' }" @click="officerActiveTab = 'all'">
              <span class="kpi-icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1"></rect></svg></span>
              <span class="kpi-text-box"><span class="kpi-title">ทั้งหมด</span><span class="kpi-value-row"><strong class="kpi-count">{{ officerMarketBookings.length }}</strong><span class="kpi-unit-pill">รายการ</span></span></span>
            </button>
            <button type="button" class="kpi-ribbon-card kpi-pending" :class="{ active: officerActiveTab === 'pending' }" @click="officerActiveTab = 'pending'">
              <span class="kpi-icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></span>
              <span class="kpi-text-box"><span class="kpi-title">รออนุมัติ</span><span class="kpi-value-row"><strong class="kpi-count">{{ officerCountPending }}</strong><span class="kpi-unit-pill">รายการ</span></span></span>
            </button>
            <button type="button" class="kpi-ribbon-card kpi-waiting" :class="{ active: officerActiveTab === 'waiting' }" @click="officerActiveTab = 'waiting'">
              <span class="kpi-icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path><path d="M9 15h6"></path></svg></span>
              <span class="kpi-text-box"><span class="kpi-title">รอคิว</span><span class="kpi-value-row"><strong class="kpi-count">{{ officerCountWaiting }}</strong><span class="kpi-unit-pill">รายการ</span></span></span>
            </button>
            <button type="button" class="kpi-ribbon-card kpi-upcoming" :class="{ active: officerActiveTab === 'approved' }" @click="officerActiveTab = 'approved'">
              <span class="kpi-icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></span>
              <span class="kpi-text-box"><span class="kpi-title">นัดหมายแล้ว</span><span class="kpi-value-row"><strong class="kpi-count">{{ officerCountApproved }}</strong><span class="kpi-unit-pill">รายการ</span></span></span>
            </button>
            <button type="button" class="kpi-ribbon-card kpi-interested" :class="{ active: officerActiveTab === 'interested' }" @click="officerActiveTab = 'interested'">
              <span class="kpi-icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></span>
              <span class="kpi-text-box"><span class="kpi-title">รอยื่นคำร้อง</span><span class="kpi-value-row"><strong class="kpi-count">{{ officerCountInterested }}</strong><span class="kpi-unit-pill">รายการ</span></span></span>
            </button>
            <button type="button" class="kpi-ribbon-card kpi-applied" :class="{ active: officerActiveTab === 'applied' }" @click="officerActiveTab = 'applied'">
              <span class="kpi-icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="13" y2="17"></line></svg></span>
              <span class="kpi-text-box"><span class="kpi-title">ยื่นคำร้องสำเร็จ</span><span class="kpi-value-row"><strong class="kpi-count">{{ officerCountApplied }}</strong><span class="kpi-unit-pill">รายการ</span></span></span>
            </button>
            <button type="button" class="kpi-ribbon-card kpi-cancelled" :class="{ active: officerActiveTab === 'cancelled' }" @click="officerActiveTab = 'cancelled'">
              <span class="kpi-icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></span>
              <span class="kpi-text-box"><span class="kpi-title">ยกเลิก</span><span class="kpi-value-row"><strong class="kpi-count">{{ officerCountCancelled }}</strong><span class="kpi-unit-pill">รายการ</span></span></span>
            </button>
          </div>

          <AppBookingListSkeleton v-if="loading" :count="2" />

          <!-- Empty State in Officer View -->
          <div v-else-if="filteredOfficerBookings.length === 0" class="empty-state-box officer-empty-state">
            <div class="empty-state-panel">
            <div class="empty-icon" aria-hidden="true">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>

            <template v-if="officerMarketBookings.length > 0 && officerActiveTab !== 'all'">
              <div class="empty-eyebrow">สถานะที่เลือก</div>
              <div class="empty-title">ยังไม่มีรายการ{{ getOfficerTabName(officerActiveTab) }}</div>
            </template>
            <template v-else-if="officerSearchQuery">
              <div class="empty-title">ไม่พบรายการที่ตรงกับ "{{ officerSearchQuery }}"</div>
              <div class="empty-desc">ลองตรวจสอบคำค้นหา หรือล้างคำค้นหาเพื่อดูรายการทั้งหมด</div>
              <button
                type="button"
                class="btn btn-outline-primary btn-sm"
                @click="officerSearchQuery = ''; officerCurrentPage = 1"
                style="margin-top: 14px;"
              >
                ล้างคำค้นหา
              </button>
            </template>
            <template v-else>
              <div class="empty-title">ยังไม่มีรายการจองในตลาดนี้</div>
              <div class="empty-desc">ยังไม่มีผู้เช่ายื่นขอนัดหมายหรือจองแผงค้าในตลาดนี้</div>
            </template>
            </div>
          </div>

          <!-- OFFICER VIEW MODE 1: PROJECT → STALL → BOOKING, or single cards -->
          <div v-else-if="officerViewMode === 'project'" class="officer-groups-wrapper">
            <!-- Project Mode Summary -->
            <!-- Project → Stall Groups (or single flat list) -->
            <div
              v-for="group in officerDisplayGroups"
              :key="group.groupKey || group.stallNumber"
              class="project-stall-entry"
            >
              <button
                v-if="officerViewMode === 'project' && group.isProjectStart"
                type="button"
                class="officer-project-header"
                :class="{ open: isProjectGroupOpen(group.projectKey) }"
                @click="toggleProjectGroup(group.projectKey)"
              >
                <span class="officer-project-header-left">
                  <span class="officer-project-icon" aria-hidden="true">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M6 21V4h12v17"></path><path d="M9 8h2"></path><path d="M13 8h2"></path><path d="M9 12h2"></path><path d="M13 12h2"></path><path d="M9 16h2"></path><path d="M13 16h2"></path></svg>
                  </span>
                  <span class="officer-project-identity">
                    <span class="officer-project-title">{{ group.projectName }}</span>
                    <span v-if="group.marketName" class="officer-project-market">{{ group.marketName }}</span>
                  </span>
                </span>
                <span class="officer-project-header-right">
                  <span class="officer-project-summary">
                    <span><strong>{{ group.projectStallCount }}</strong> แผง</span>
                    <span><strong>{{ group.projectBookingCount }}</strong> การจอง</span>
                  </span>
                  <svg class="chevron-indicator" :class="{ rotated: isProjectGroupOpen(group.projectKey) }" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </button>

              <div
                v-show="officerViewMode !== 'project' || isProjectGroupOpen(group.projectKey)"
                :class="{ 'officer-stall-group-card': !group.isFlat, 'in-project': officerViewMode === 'project' }"
              >
              <!-- Stall Group Header (Accordion header for Stall) -->
              <div
                v-if="!group.isFlat"
                class="stall-group-header"
                :class="{ open: isStallGroupOpen(getOfficerStallGroupKey(group)) }"
                @click="toggleStallGroup(getOfficerStallGroupKey(group))"
              >
                <div class="stall-group-header-left">
                  <svg
                    class="chevron-indicator"
                    :class="{ rotated: isStallGroupOpen(getOfficerStallGroupKey(group)) }"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <span class="stall-group-simple-title">แผงค้า {{ group.stallNumber }}</span>
                  <span class="officer-booking-count-pill" :aria-label="`มีผู้จอง ${group.bookings.length} ราย`">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>จอง {{ group.bookings.length }} ราย</span>
                  </span>
                </div>
              </div>

              <!-- Cards container for this stall/group -->
              <div
                v-show="group.isFlat || isStallGroupOpen(getOfficerStallGroupKey(group))"
                :class="{
                  'stall-group-cards-body': !group.isFlat,
                  'officer-cards-list': group.isFlat
                }"
              >
                <div v-if="officerActiveTab === 'waiting'" class="queue-holder-context">
                  <template v-if="group.activeHolder">
                    <span>ผู้จองหลักของแผงนี้</span>
                    <strong>{{ group.activeHolder.tenant_name }}</strong>
                    <span class="queue-holder-context-status">{{ getStatusBadgeLabel(group.activeHolder.status) }}</span>
                  </template>
                  <template v-else>
                    <span>แผงนี้ยังไม่มีผู้จองหลัก ระบบจะเลื่อนคิวตามลำดับเมื่อพร้อม</span>
                  </template>
                </div>
                <div
                  v-for="b in group.bookings"
                  :key="b.id"
                  :data-booking-id="String(b.id)"
                  class="booking-item-card"
                  :class="[getCardBorderClass(b.status), { 'collapsed-card': !isCardExpanded(b.id) }]"
                >
              <!-- Card Top Row -->
              <div class="card-top-row">
                <!-- Top Line: Booking ID & Status Badge + Chevron -->
                <div class="card-top-main">
                  <div class="top-row-left">
                    <!-- Circular Icon -->
                    <div class="circle-status-icon blue-circle">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>

                    <!-- Booking Number & Label -->
                    <div class="booking-number-block">
                      <div class="booking-label-row">
                        <span class="booking-label">หมายเลขการจอง</span>
                      </div>
                      <div class="booking-id-text">{{ formatBookingNumber(b.booking_number) }}</div>
                      <div class="officer-booked-at" :title="`วันที่จอง: ${formatCreatedDate(b.created_at)}`">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>วันที่จอง {{ formatSubmissionTimestamp(b.created_at) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="top-row-right">
                    <span
                      v-if="b.holding_stall && !isQueueBooking(b) && !['rejected', 'cancelled', 'not_interested', 'no_show', 'lease_applied', 'completed'].includes(b.status)"
                      class="in-card-role-pill is-holder"
                      title="ผู้มีสิทธิ์จองหลัก (ตัวจริง)"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                      <span>ผู้จองหลัก (ตัวจริง)</span>
                    </span>
                    <span
                      v-else-if="isQueueBooking(b)"
                      class="in-card-role-pill is-queue"
                      title="ลำดับคิวสำรอง"
                    >
                      <span>คิวสำรองที่ {{ b.queue_position || b.queue_number || 1 }}</span>
                    </span>
                    <!-- Status Badge Pill -->
                    <span class="status-pill-badge" :class="getStatusPillClass(b.status)">
                      {{ getStatusBadgeLabel(b.status) }}
                    </span>

                    <!-- Card Collapse Toggle Chevron -->
                    <button class="card-collapse-btn" @click="toggleCardExpanded(b.id)" title="ย่อ/ขยายการ์ด">
                      <svg
                        class="card-chevron"
                        :class="{ rotated: isCardExpanded(b.id) }"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Flat view keeps full context; grouped view shows only decision-critical data. -->
                <div class="card-meta-tags-row" :class="{ 'compact-officer-meta': !group.isFlat }">
                  <template v-if="group.isFlat">
                  <!-- 1. Project Pill (เบสโครงการ มาก่อน แผงค้า) -->
                  <div class="in-card-project-pill" :title="'โครงการ ' + getBookingProjectName(b)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                    <strong>{{ getBookingProjectName(b) }}</strong>
                  </div>

                  <!-- 2. Stall Code Pill (แผงค้า) -->
                  <div class="in-card-stall-pill" title="รหัสแผงค้า">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    <span class="stall-label">แผงค้า</span>
                    <strong>{{ b.stall_number }}</strong>
                    <span v-if="b.stall_count && b.stall_count > 1" class="stall-count-badge">({{ b.stall_count }} แผง)</span>
                  </div>

                  <!-- 2.1 Stall Queue Count Pill (Officer View Only - แสดงว่าแผงนี้มีผู้จองกี่คน) -->
                  <div
                    v-if="isQueueBooking(b) && getStallQueueCount(b.stall_number) > 0"
                    class="in-card-queue-pill is-waiting-pill"
                    @click.stop="openStallQueueModal(b.stall_number, b.market_name)"
                    :title="'คลิกเพื่อดูผังคิวแผงนี้ (รวมผู้จอง ' + getStallTotalApplicants(b.stall_number) + ' ราย)'"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <span>คิวสำรองที่ {{ b.queue_position || b.queue_number || 1 }} (จาก {{ getStallQueueCount(b.stall_number) }} ราย)</span>
                  </div>

                  <!-- 3. Market Name Pill (ตลาด แยกต่างหาก) -->
                  <div class="in-card-market-pill" :title="'ตลาด ' + (b.market_name || 'ตลาดนัดจตุจักร')">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"></path></svg>
                    <strong>{{ b.market_name || 'ตลาดนัดจตุจักร' }}</strong>
                  </div>

                  <!-- 4. Tenant Name & Phone Pill -->
                  <div class="in-card-market-pill" :title="'ผู้ขอจอง: ' + b.tenant_name + ' (' + b.tenant_phone + ')'">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>{{ b.tenant_name }}</span>
                    <span style="color: #64748b; font-size: 0.78rem;">({{ b.tenant_phone }})</span>
                  </div>

                  </template>

                  <template v-else>
                    <div class="compact-meta-item compact-meta-stall" title="รหัสแผงค้า">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                      <span>แผงค้า</span>
                      <strong>{{ b.stall_number }}</strong>
                      <span v-if="b.stall_count && b.stall_count > 1">({{ b.stall_count }} แผง)</span>
                    </div>

                    <div class="compact-meta-item" :title="`โครงการ ${getBookingProjectName(b)}`">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9"></path><path d="M9 22V12h6v10"></path></svg>
                      <span>{{ getBookingProjectName(b) }}</span>
                    </div>

                    <div class="compact-meta-item" :title="`ตลาด ${b.market_name || 'ตลาดนัดจตุจักร'}`">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"></path></svg>
                      <span>{{ b.market_name || 'ตลาดนัดจตุจักร' }}</span>
                    </div>

                    <div class="compact-meta-item compact-meta-person" :title="`ผู้ขอจอง: ${b.tenant_name} (${b.tenant_phone})`">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <strong>{{ b.tenant_name }}</strong>
                      <a :href="`tel:${b.tenant_phone}`" @click.stop>{{ b.tenant_phone }}</a>
                    </div>

                  </template>
                </div>

                <!-- Multi-Stall Appointment Sub-List (Officer View: ดูและจัดการแยกรายแผงในรอบนัดหมายเดียวกันได้) -->
                <div
                  v-if="b.sub_bookings && b.sub_bookings.length > 1"
                  class="multi-stall-appointment-box"
                >
                  <div class="msa-header">
                    <span class="msa-title">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                      <span>รายการแผงค้าในรอบนัดหมายนี้ ({{ b.sub_bookings.length }} แผง)</span>
                    </span>
                    <span class="msa-hint">ปุ่มด้านล่างการ์ดมีผลทั้งนัดหมาย หรือกดยกเลิกเฉพาะบางแผงได้ที่นี่</span>
                  </div>
                  <div class="msa-grid">
                    <div
                      v-for="sub in b.sub_bookings"
                      :key="sub.id"
                      class="msa-stall-item"
                    >
                      <div class="msa-stall-info">
                        <span class="msa-stall-code">แผง {{ sub.stall_number }}</span>
                        <span v-if="sub.project_name" class="msa-stall-zone">{{ sub.project_name }}</span>
                        <span v-else-if="sub.stall_zone_name" class="msa-stall-zone">{{ sub.stall_zone_name }}</span>
                        <span v-if="sub.stall_monthly_rate" class="msa-stall-rate">฿{{ Number(sub.stall_monthly_rate).toLocaleString() }}/เดือน</span>
                        <button
                          v-if="getStallQueueCount(sub.stall_number) > 0"
                          type="button"
                          class="msa-btn"
                          style="background: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd;"
                          @click.stop="openStallQueueModal(sub.stall_number, sub.market_name)"
                        >
                          <span>คิวสำรอง {{ getStallQueueCount(sub.stall_number) }} ราย</span>
                        </button>
                      </div>
                      <div class="msa-stall-actions">
                        <button
                          v-if="['pending', 'pending_approval', 'approved', 'interested'].includes(sub.status)"
                          type="button"
                          class="msa-btn msa-btn-danger"
                          @click.stop="handleCancelSingleStallBooking(sub, 'เจ้าหน้าที่ยกเลิกเฉพาะแผงนี้')"
                        >
                          <span>ยกเลิกเฉพาะแผงนี้</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Next Step Guidance & Actions Bar for Collapsed View -->
              <div
                v-if="!isCardExpanded(b.id)"
                class="collapsed-next-step"
                :class="getTenantNextStepTone(b.status)"
              >
                <div class="collapsed-next-step-content">
                  <span class="collapsed-next-step-label">{{ getOfficerNextStepLabel(b) }}</span>
                  <strong>{{ getOfficerNextStepText(b) }}</strong>
                </div>

                <div class="collapsed-actions-group">
                  <template v-if="b.status === 'pending_approval' || b.status === 'pending'">
                    <AppButton
                      variant="primary"
                      size="base"
                      class="action-btn-primary"
                      @click.stop="openApproveModal(b)"
                      title="อนุมัติวันเวลานัดหมาย"
                    >
                      <template #prefix>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </template>
                      <span>อนุมัตินัด</span>
                    </AppButton>
                    <AppButton
                      variant="danger-outline"
                      size="base"
                      class="action-btn-secondary"
                      @click.stop="isQueueBooking(b) ? handleOfficerCancel(b) : openRejectModal(b)"
                      :title="isQueueBooking(b) ? 'ยกเลิกการต่อคิว' : 'ปฏิเสธ/ยกเลิกคำขอนัดหมาย'"
                    >
                      <template #prefix>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </template>
                      <span>{{ isQueueBooking(b) ? 'ยกเลิกคิว' : 'ยกเลิก' }}</span>
                    </AppButton>
                    <AppButton
                      variant="secondary"
                      size="base"
                      class="action-btn-secondary"
                      @click.stop="openBookingDetails(b)"
                      title="ดูรายละเอียดการจอง"
                    >
                      <template #prefix>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                      </template>
                      <span>รายละเอียด</span>
                    </AppButton>
                  </template>

                  <template v-else-if="b.status === 'approved'">
                    <AppButton
                      v-if="!isQueueBooking(b)"
                      variant="success"
                      size="base"
                      class="action-btn-primary"
                      @click.stop="handleMarkVisited(b)"
                      title="บันทึกผลว่าผู้เช่ามาชมแผงแล้ว และสนใจเช่า"
                    >
                      <template #prefix>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </template>
                      <span>ยืนยันการเช่า</span>
                    </AppButton>
                    <AppButton
                      variant="danger-outline"
                      size="base"
                      class="action-btn-secondary"
                      @click.stop="handleOfficerCancel(b)"
                      :title="isQueueBooking(b) ? 'ยกเลิกการต่อคิว' : 'ยกเลิกนัดหมายนี้'"
                    >
                      <template #prefix>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </template>
                      <span>{{ isQueueBooking(b) ? 'ยกเลิกคิว' : 'ยกเลิก' }}</span>
                    </AppButton>
                    <AppButton
                      variant="secondary"
                      size="base"
                      class="action-btn-secondary"
                      @click.stop="openBookingDetails(b)"
                      title="ดูรายละเอียดการจอง"
                    >
                      <template #prefix>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                      </template>
                      <span>รายละเอียด</span>
                    </AppButton>
                  </template>

                  <template v-else-if="b.status === 'interested' || b.status === 'pending_slot'">
                    <AppButton
                      variant="danger-outline"
                      size="base"
                      class="action-btn-secondary"
                      @click.stop="handleOfficerCancel(b)"
                      title="ยกเลิกการจอง / บันทึกการสละสิทธิ์"
                    >
                      <template #prefix>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </template>
                      <span>ยกเลิก</span>
                    </AppButton>
                    <AppButton
                      variant="secondary"
                      size="base"
                      class="action-btn-secondary"
                      @click.stop="openBookingDetails(b)"
                      title="ดูรายละเอียดการจอง"
                    >
                      <template #prefix>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                      </template>
                      <span>รายละเอียด</span>
                    </AppButton>
                  </template>

                  <template v-else-if="b.status === 'waiting_queue'">
                    <AppButton
                      variant="danger-outline"
                      size="base"
                      class="action-btn-secondary"
                      @click.stop="handleOfficerCancel(b)"
                      title="ยกเลิกการต่อคิว"
                    >
                      <template #prefix>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </template>
                      <span>ยกเลิกคิว</span>
                    </AppButton>
                    <AppButton
                      variant="secondary"
                      size="base"
                      class="action-btn-secondary"
                      @click.stop="openBookingDetails(b)"
                      title="ดูรายละเอียดการจอง"
                    >
                      <template #prefix>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                      </template>
                      <span>รายละเอียด</span>
                    </AppButton>
                  </template>

                  <template v-else>
                    <AppButton
                      variant="secondary"
                      size="base"
                      class="action-btn-secondary"
                      @click.stop="openBookingDetails(b)"
                      title="ดูรายละเอียดการจอง"
                    >
                      <template #prefix>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                      </template>
                      <span>รายละเอียด</span>
                    </AppButton>

                    <AppButton
                      v-if="b.status === 'lease_applied' || b.status === 'completed'"
                      to="/applications"
                      variant="primary"
                      size="base"
                      class="action-btn-primary"
                    >
                      <span>ดูคำร้อง</span>
                      <template #suffix>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </template>
                    </AppButton>
                  </template>
                </div>
              </div>

              <!-- Expanded Card Body (Only mounted when explicitly expanded) -->
              <div v-if="isCardExpanded(b.id)" class="card-expandable-content">
                <!-- 3-Phase Stepper (จองดูแผง -> นัดชมแผง -> ยื่นคำร้องขอเช่า) -->
                <div class="booking-stepper-container">
                  <div class="stepper-track">
                    <!-- Step 1: จองดูแผง -->
                    <div class="stepper-step" :class="{ completed: isStepCompleted(b.status, 1), active: isStepActive(b.status, 1) }">
                      <div class="step-circle">
                        <svg v-if="isStepCompleted(b.status, 1)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span v-else>1</span>
                      </div>
                      <div class="step-label-text">จองดูแผง</div>
                    </div>

                    <!-- Line 1-2 -->
                    <div class="stepper-connector" :class="{ filled: isStepCompleted(b.status, 1) }"></div>

                    <!-- Step 2: นัดชมแผง -->
                    <div class="stepper-step" :class="{ completed: isStepCompleted(b.status, 2), active: isStepActive(b.status, 2) }">
                      <div class="step-circle">
                        <svg v-if="isStepCompleted(b.status, 2)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span v-else>2</span>
                      </div>
                      <div class="step-label-text">นัดชมแผง</div>
                    </div>

                    <!-- Line 2-3 -->
                    <div class="stepper-connector" :class="{ filled: isStepCompleted(b.status, 2) }"></div>

                    <!-- Step 3: ยื่นคำร้องขอเช่า -->
                    <div class="stepper-step" :class="{ completed: isStepCompleted(b.status, 3), active: isStepActive(b.status, 3) }">
                      <div class="step-circle">
                        <svg v-if="isStepCompleted(b.status, 3)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span v-else>3</span>
                      </div>
                      <div class="step-label-text">ยื่นคำร้องขอเช่า</div>
                    </div>
                  </div>
                </div>

                <!-- 4-Column Info Row สำหรับเจ้าหน้าที่ -->
                <div class="info-columns-grid officer-columns-grid">
                  <!-- Column 1: วันนัดชมแผง -->
                  <div class="info-column">
                    <div class="info-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      <span>วันนัดชมแผง</span>
                    </div>
                    <div class="info-value-row">
                      <span class="info-value-text">{{ formatThaiVisitDate(b.visit_date, b) }}</span>
                      <span v-if="getDaysRemainingBadge(b.visit_date)" class="days-remaining-pill">
                        {{ getDaysRemainingBadge(b.visit_date) }}
                      </span>
                    </div>
                  </div>

                  <!-- Column 2: เวลานัดชม & จุดนัดพบ -->
                  <div class="info-column">
                    <div class="info-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      <span>เวลานัดชม</span>
                    </div>
                    <div class="info-value-row">
                      <span class="info-value-text">{{ getVisitTimeSlot(b) }}</span>
                    </div>
                    <div v-if="b.meeting_point" class="cell-sub-meeting-point">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span>จุดนัด: {{ b.meeting_point }}</span>
                    </div>
                  </div>

                  <!-- Column 3: แผงค้า -->
                  <div class="info-column">
                    <div class="info-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                      <span>แผงค้า</span>
                    </div>
                    <div class="info-value-row">
                      <span class="stall-count-pill">
                        <span class="stall-code-strong">แผง {{ b.stall_number }}</span>
                        <span v-if="b.stall_count && b.stall_count > 1" class="stall-count-badge">({{ b.stall_count }} แผง)</span>
                      </span>
                      <span v-if="b.stall_zone_name" class="stall-zone-pill">{{ b.stall_zone_name }}</span>
                    </div>
                    <div v-if="b.stall_monthly_rate" class="cell-sub-rate">
                      ฿{{ Number(b.stall_monthly_rate).toLocaleString() }}/ด.
                    </div>
                  </div>

                  <!-- Column 4: ผู้ขอจอง -->
                  <div class="info-column">
                    <div class="info-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <span>ผู้ขอจอง</span>
                    </div>
                    <div class="info-value-row">
                      <span class="info-value-text">{{ b.tenant_name }}</span>
                      <a :href="`tel:${b.tenant_phone}`" class="phone-call-btn" title="คลิกเพื่อโทรออกทันที">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <span>{{ b.tenant_phone }}</span>
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Card Footer Row With Unified Visual Hierarchy -->
                <div class="card-footer-row">
                  <div class="footer-left-status" :class="getTenantNextStepTone(b.status)">
                    <!-- สไตล์ข้อความเหมือนตอน collapse เพื่อความกลมกลืนเป็นหนึ่งเดียวกัน -->
                    <div class="collapsed-next-step-content">
                      <span class="collapsed-next-step-label">{{ getOfficerNextStepLabel(b) }}</span>
                      <strong>{{ getOfficerNextStepText(b) }}</strong>
                    </div>
                  </div>

                  <div class="footer-right-actions">
                    <!-- Case 1: pending -> Approve (primary solid CTA), Reject/Cancel Queue (danger outline), Details (secondary) -->
                    <template v-if="b.status === 'pending_approval' || b.status === 'pending'">
                      <AppButton
                        variant="primary"
                        size="base"
                        @click="openApproveModal(b)"
                        title="อนุมัติวันเวลานัดหมาย"
                      >
                        <template #prefix>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </template>
                        <span>อนุมัตินัด</span>
                      </AppButton>
                      <AppButton
                        variant="danger-outline"
                        size="base"
                        @click="isQueueBooking(b) ? handleOfficerCancel(b) : openRejectModal(b)"
                        :title="isQueueBooking(b) ? 'ยกเลิกการต่อคิว' : 'ปฏิเสธ/ยกเลิกคำขอนัดหมาย'"
                      >
                        <template #prefix>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </template>
                        <span>{{ isQueueBooking(b) ? 'ยกเลิกคิว' : 'ยกเลิก' }}</span>
                      </AppButton>
                      <AppButton
                        variant="secondary"
                        size="base"
                        @click="openBookingDetails(b)"
                        title="ดูรายละเอียดการจอง"
                      >
                        <template #prefix>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                        </template>
                        <span>รายละเอียด</span>
                      </AppButton>
                    </template>

                    <!-- Case 2: approved -> Confirm Rental (only for primary holder), Cancel/Cancel Queue (danger outline), Details (secondary) -->
                    <template v-else-if="b.status === 'approved'">
                      <AppButton
                        v-if="!isQueueBooking(b)"
                        variant="success"
                        size="base"
                        @click="handleMarkVisited(b)"
                        title="บันทึกผลว่าผู้เช่ามาชมแผงแล้ว และสนใจเช่า"
                      >
                        <template #prefix>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </template>
                        <span>ยืนยันการเช่า</span>
                      </AppButton>
                      <AppButton
                        variant="danger-outline"
                        size="base"
                        @click="handleOfficerCancel(b)"
                        :title="isQueueBooking(b) ? 'ยกเลิกการต่อคิว' : 'ยกเลิกนัดหมายนี้'"
                      >
                        <template #prefix>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </template>
                        <span>{{ isQueueBooking(b) ? 'ยกเลิกคิว' : 'ยกเลิก' }}</span>
                      </AppButton>
                      <AppButton
                        variant="secondary"
                        size="base"
                        @click="openBookingDetails(b)"
                        title="ดูรายละเอียดการจอง"
                      >
                        <template #prefix>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                        </template>
                        <span>รายละเอียด</span>
                      </AppButton>
                    </template>

                    <!-- Case 2.1: interested / pending_slot -> Cancel (danger outline), Details (secondary) -->
                    <template v-else-if="b.status === 'interested' || b.status === 'pending_slot'">
                      <AppButton
                        variant="danger-outline"
                        size="base"
                        @click="handleOfficerCancel(b)"
                        title="ยกเลิกการจอง / บันทึกการสละสิทธิ์"
                      >
                        <template #prefix>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </template>
                        <span>ยกเลิก</span>
                      </AppButton>
                      <AppButton
                        variant="secondary"
                        size="base"
                        @click="openBookingDetails(b)"
                        title="ดูรายละเอียดการจอง"
                      >
                        <template #prefix>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                        </template>
                        <span>รายละเอียด</span>
                      </AppButton>
                    </template>

                    <!-- Case 2.2: waiting_queue -> View Queue, Cancel Queue, Details -->
                    <template v-else-if="b.status === 'waiting_queue'">
                      <AppButton
                        variant="danger-outline"
                        size="base"
                        @click="handleOfficerCancel(b)"
                        title="ยกเลิกการต่อคิว"
                      >
                        <template #prefix>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </template>
                        <span>ยกเลิกคิว</span>
                      </AppButton>
                      <AppButton
                        variant="secondary"
                        size="base"
                        @click="openBookingDetails(b)"
                        title="ดูรายละเอียดการจอง"
                      >
                        <template #prefix>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                        </template>
                        <span>รายละเอียด</span>
                      </AppButton>
                    </template>

                    <!-- Case 3: lease_applied, or others -->
                    <template v-else>
                      <AppButton
                        variant="secondary"
                        size="base"
                        @click="openBookingDetails(b)"
                        title="ดูรายละเอียดการจอง"
                      >
                        <template #prefix>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                        </template>
                        <span>รายละเอียด</span>
                      </AppButton>

                      <AppButton
                        v-if="b.status === 'lease_applied' || b.status === 'completed'"
                        to="/applications"
                        variant="primary"
                        size="base"
                      >
                        <span>ดูคำร้อง</span>
                        <template #suffix>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </template>
                      </AppButton>
                    </template>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

          <!-- OFFICER VIEW MODE 2: TABLE VIEW (มุมมองตารางสรุปงาน) -->
          <div v-else class="officer-table-container">
            <table class="officer-custom-table">
              <thead>
                <tr>
                  <th style="width: 250px;">เลขที่จอง</th>
                  <th style="width: 220px;">กำหนดนัดหมาย</th>
                  <th style="width: 180px;">สิทธิ์ในคิว</th>
                  <th>ผู้ขอจอง & เบอร์ติดต่อ</th>
                  <th style="width: 150px; text-align: center;">สถานะ</th>
                  <th style="text-align: right; min-width: 260px; width: 260px;"></th>
                </tr>
              </thead>
              <tbody>
                <template v-for="project in paginatedOfficerProjectGroups" :key="project.key">
                  <tr
                    class="hierarchy-project-row"
                    :class="{ open: isProjectGroupOpen(project.key) }"
                    @click="toggleProjectGroup(project.key)"
                  >
                    <td colspan="6">
                      <div class="hierarchy-row-content hierarchy-level-project">
                        <div class="hierarchy-header-left">
                          <svg
                            class="chevron-indicator"
                            :class="{ rotated: isProjectGroupOpen(project.key) }"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>

                          <!-- Project Icon (Card style) -->
                          <div class="hierarchy-project-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M6 21V4h12v17"></path><path d="M9 8h2"></path><path d="M13 8h2"></path><path d="M9 12h2"></path><path d="M13 12h2"></path><path d="M9 16h2"></path><path d="M13 16h2"></path></svg>
                          </div>

                          <!-- Project Title & Market Pill -->
                          <div class="hierarchy-project-title-group">
                            <strong class="hierarchy-project-name">{{ project.projectName }}</strong>
                            <span v-if="project.marketName" class="hierarchy-market-pill">{{ project.marketName }}</span>
                          </div>
                        </div>

                        <!-- Right side: Card-style Summary counts (เส้นตรงแบบเดียวกับหน้าการ์ด) -->
                        <div class="hierarchy-header-right">
                          <span class="officer-project-summary">
                            <span><strong>{{ project.stalls.length }}</strong> แผง</span>
                            <span><strong>{{ project.bookingCount }}</strong> การจอง</span>
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <template v-if="isProjectGroupOpen(project.key)">
                    <template v-for="stall in project.stalls" :key="getOfficerStallGroupKey(stall)">
                      <tr
                        class="hierarchy-stall-row"
                        :class="{ open: isStallGroupOpen(getOfficerStallGroupKey(stall)) }"
                        @click="toggleStallGroup(getOfficerStallGroupKey(stall))"
                      >
                        <td colspan="6">
                          <div class="hierarchy-row-content hierarchy-level-stall">
                            <div class="hierarchy-stall-left">
                              <svg
                                class="chevron-indicator"
                                :class="{ rotated: isStallGroupOpen(getOfficerStallGroupKey(stall)) }"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                              >
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>

                              <!-- Stall Title without frame (Matching Card view style) -->
                              <span class="stall-group-simple-title">แผงค้า {{ stall.stallNumber }}</span>

                              <!-- Booking count badge (Matching Card view style) -->
                              <span
                                class="officer-booking-count-pill"
                                :class="{ 'has-queue': getStallQueueCount(stall.stallNumber) > 0 }"
                                :aria-label="`มีผู้จอง ${stall.bookings.length} ราย`"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="9" cy="7" r="4"></circle>
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <span>จอง {{ stall.bookings.length }} ราย</span>
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>

                      <template v-if="isStallGroupOpen(getOfficerStallGroupKey(stall))">
                        <tr
                          v-for="b in stall.bookings"
                          :key="b.id"
                          class="hierarchy-booking-row"
                          :data-booking-id="String(b.id)"
                        >
                  <td>
                    <div class="hierarchy-booking-id">
                      <span class="hierarchy-branch" aria-hidden="true"></span>
                      <strong class="clickable-id" @click="openBookingDetails(b)">{{ formatBookingNumber(b.booking_number) }}</strong>
                    </div>
                    <div class="cell-sub-date">{{ b.created_at?.slice(0, 10) }}</div>
                  </td>
                  <td>
                    <div class="table-visit-date">{{ formatThaiVisitDate(b.visit_date, b) }}</div>
                    <div class="table-visit-slot">{{ getVisitTimeSlot(b) }}</div>
                    <div v-if="b.meeting_point" class="table-meeting-point">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span>{{ b.meeting_point }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="stall-badge-row">
                      <span v-if="b.holding_stall && !isQueueBooking(b) && !['rejected', 'cancelled', 'not_interested', 'no_show', 'lease_applied', 'completed'].includes(b.status)" class="in-card-role-pill is-holder table-role-pill">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                        ผู้จองหลัก
                      </span>
                      <span v-else-if="isQueueBooking(b)" class="in-card-role-pill is-queue table-role-pill">
                        คิวสำรองที่ {{ b.queue_position || b.queue_number || 1 }}
                      </span>
                      <span v-else class="hierarchy-muted">—</span>
                    </div>
                  </td>
                  <td>
                    <div class="table-tenant-name">{{ b.tenant_name }}</div>
                    <a :href="`tel:${b.tenant_phone}`" class="table-phone-link">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 2px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      <span>{{ b.tenant_phone }}</span>
                    </a>
                  </td>
                  <td class="cell-status">
                    <span class="status-pill-badge" :class="getStatusPillClass(b.status)">
                      {{ getStatusBadgeLabel(b.status) }}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div class="table-actions-cell">
                      <!-- Case 1: pending -> Approve (primary solid CTA), Reject/Cancel Queue (danger outline), Details (secondary) -->
                      <template v-if="b.status === 'pending_approval' || b.status === 'pending'">
                        <AppButton
                          variant="primary"
                          size="sm"
                          @click="openApproveModal(b)"
                          title="อนุมัติวันเวลานัดหมาย"
                        >
                          <template #prefix>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </template>
                          <span>อนุมัตินัด</span>
                        </AppButton>
                        <AppButton
                          variant="danger-outline"
                          size="sm"
                          @click="isQueueBooking(b) ? handleOfficerCancel(b) : openRejectModal(b)"
                          :title="isQueueBooking(b) ? 'ยกเลิกการต่อคิว' : 'ปฏิเสธ/ยกเลิกคำขอนัดหมาย'"
                        >
                          <template #prefix>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </template>
                          <span>{{ isQueueBooking(b) ? 'ยกเลิกคิว' : 'ยกเลิก' }}</span>
                        </AppButton>
                        <AppButton
                          variant="secondary"
                          size="sm"
                          @click="openBookingDetails(b)"
                          title="ดูรายละเอียดการจอง"
                        >
                          <template #prefix>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                          </template>
                          <span>รายละเอียด</span>
                        </AppButton>
                      </template>

                      <!-- Case 2: approved -> Confirm Rental (only for primary holder), Cancel/Cancel Queue (danger outline), Details (secondary) -->
                      <template v-else-if="b.status === 'approved'">
                        <AppButton
                          v-if="!isQueueBooking(b)"
                          variant="success"
                          size="sm"
                          @click="handleMarkVisited(b)"
                          title="บันทึกผลว่าผู้เช่ามาชมแผงแล้ว และสนใจเช่า"
                        >
                          <template #prefix>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </template>
                          <span>ยืนยันการเช่า</span>
                        </AppButton>
                        <AppButton
                          variant="danger-outline"
                          size="sm"
                          @click="handleOfficerCancel(b)"
                          :title="isQueueBooking(b) ? 'ยกเลิกการต่อคิว' : 'ยกเลิกนัดหมายนี้'"
                        >
                          <template #prefix>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </template>
                          <span>{{ isQueueBooking(b) ? 'ยกเลิกคิว' : 'ยกเลิก' }}</span>
                        </AppButton>
                        <AppButton
                          variant="secondary"
                          size="sm"
                          @click="openBookingDetails(b)"
                          title="ดูรายละเอียดการจอง"
                        >
                          <template #prefix>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                          </template>
                          <span>รายละเอียด</span>
                        </AppButton>
                      </template>

                      <!-- Case 2.1: interested / pending_slot -> Cancel & Details -->
                      <template v-else-if="b.status === 'interested' || b.status === 'pending_slot'">
                        <AppButton
                          variant="danger-outline"
                          size="sm"
                          @click="handleOfficerCancel(b)"
                          title="ยกเลิกการจอง / บันทึกการสละสิทธิ์"
                        >
                          <template #prefix>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </template>
                          <span>ยกเลิก</span>
                        </AppButton>
                        <AppButton
                          variant="secondary"
                          size="sm"
                          @click="openBookingDetails(b)"
                          title="ดูรายละเอียดการจอง"
                        >
                          <template #prefix>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                          </template>
                          <span>รายละเอียด</span>
                        </AppButton>
                      </template>

                      <!-- Case 2.2: waiting_queue -> View Queue, Cancel, Details -->
                      <template v-else-if="b.status === 'waiting_queue'">
                        <AppButton
                          variant="danger-outline"
                          size="sm"
                          @click="handleOfficerCancel(b)"
                          title="ยกเลิกการต่อคิว"
                        >
                          <template #prefix>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </template>
                          <span>ยกเลิกคิว</span>
                        </AppButton>
                        <AppButton
                          variant="secondary"
                          size="sm"
                          @click="openBookingDetails(b)"
                          title="ดูรายละเอียดการจอง"
                        >
                          <template #prefix>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                          </template>
                          <span>รายละเอียด</span>
                        </AppButton>
                      </template>

                      <!-- Case 3: other statuses -->
                      <template v-else>
                        <AppButton
                          v-if="b.status === 'lease_applied' || b.status === 'completed'"
                          to="/applications"
                          variant="primary"
                          size="sm"
                        >
                          <span>ดูคำร้อง</span>
                          <template #suffix>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </template>
                        </AppButton>
                        <AppButton
                          variant="secondary"
                          size="sm"
                          @click="openBookingDetails(b)"
                          title="ดูรายละเอียดการจอง"
                        >
                          <template #prefix>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                          </template>
                          <span>รายละเอียด</span>
                        </AppButton>
                      </template>
                    </div>
                  </td>
                        </tr>
                      </template>
                    </template>
                  </template>
                </template>
              </tbody>
            </table>
          </div>

          <!-- Bottom Pagination Row (โครงเดียวกับผู้เช่า) -->
          <AppPagination
            v-if="filteredOfficerBookings.length > 0"
            v-model="officerCurrentPage"
            v-model:items-per-page="officerItemsPerPage"
            :total-items="officerProjectGroups.length"
            unit-label="โครงการ"
          />
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- MODALS SECTION                                               -->
    <!-- ============================================================ -->

    <!-- 1. Officer Approve Modal -->
    <div v-if="showApproveModal && targetBooking" class="modal-overlay" @click.self="showApproveModal = false">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; font-weight: 700;">อนุมัตินัดหมายเข้าดูแผง ({{ targetBooking.booking_number }})</h3>
          <button class="btn-logout" @click="showApproveModal = false" aria-label="ปิด">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.9rem; color: #475569; margin-bottom: 14px;">
            อนุมัตินัดหมายให้คุณ <strong>{{ targetBooking.tenant_name }}</strong> เข้าดูแผง
            <strong>{{ getAppointmentRoundStallSummary(targetBooking) }}</strong>
            ({{ targetBooking.market_name }}) วันที่ {{ targetBooking.visit_date }} ({{ targetBooking.visit_time_slot }})
          </p>
          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label">จุดนัดพบหน้างาน *</label>
            <input type="text" v-model="approveMeetingPoint" class="form-input" />
          </div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label">เจ้าหน้าที่ผู้พาชม *</label>
            <input type="text" v-model="approveEscortOfficer" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">คำแนะนำเพิ่มเติมสำหรับผู้เช่า</label>
            <textarea v-model="officerNotes" rows="2" class="form-textarea" placeholder="เช่น ให้ติดต่อเจ้าหน้าที่ดูแลตลาด ณ อาคารอำนวยการ ก่อนเข้าชม 15 นาที"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <AppButton variant="secondary" size="md" @click="showApproveModal = false">ยกเลิก</AppButton>
          <AppButton variant="primary" size="md" @click="confirmApprove">ยืนยันการอนุมัตินัดหมาย</AppButton>
        </div>
      </div>
    </div>

    <!-- 2. Officer Reject Modal -->
    <div v-if="showRejectModal && targetBooking" class="modal-overlay" @click.self="showRejectModal = false">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; color: #e11d48; font-weight: 700;">ยกเลิกนัดหมายดูแผง ({{ targetBooking.booking_number }})</h3>
          <button class="btn-logout" @click="showRejectModal = false" aria-label="ปิด">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px 14px; font-size: 0.85rem; color: #9f1239; margin-bottom: 14px; display: flex; align-items: flex-start; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>ตามกฎของระบบ เมื่อเจ้าหน้าที่ยกเลิกการจอง สิทธิ์การถือแผงจะถูกปล่อย และเลื่อนคิวที่ 1 ขึ้นมาทันที</span>
          </div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label">ระบุเหตุผลในการยกเลิก (บังคับเลือก) *</label>
            <AppSelect
              v-model="rejectReasonDropdown"
              :options="rejectReasonOptions"
              placeholder="เลือกเหตุผลในการยกเลิก"
            />
          </div>
          <div class="form-group">
            <label class="form-label">ข้อความคำชี้แจงเพิ่มเติมถึงผู้เช่า</label>
            <textarea v-model="rejectionReasonText" rows="2" class="form-textarea" placeholder="คำอธิบายเพิ่มเติมเพื่อแจ้งให้ผู้เช่าทราบ..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <AppButton variant="secondary" size="md" @click="showRejectModal = false">ปิด</AppButton>
          <AppButton variant="danger" size="md" @click="confirmReject">ยืนยันยกเลิกและปล่อยคิว</AppButton>
        </div>
      </div>
    </div>

    <!-- 3. Select Slot Modal -->
    <div v-if="showSelectSlotModal && targetBooking" class="modal-overlay" @click.self="showSelectSlotModal = false">
      <div class="modal-content" style="max-width: 480px;">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>เลือกวันและเวลานัดชมแผง {{ targetBooking.stall_number }}</span>
          </h3>
          <button class="btn-logout" @click="showSelectSlotModal = false" aria-label="ปิด">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">เลือกวันที่เปิดให้เข้าชมแผง *</label>
            <AppSelect
              v-model="slotDate"
              :options="slotDateOptions"
              placeholder="เลือกวันที่เปิดให้เข้าชมแผง"
            />
          </div>
          <div class="form-group">
            <label class="form-label">เลือกช่วงเวลานัดชม (เฉพาะรอบที่ยังว่าง) *</label>
            <AppSelect
              v-model="slotTime"
              :options="slotTimeOptions"
              placeholder="เลือกช่วงเวลานัดชม"
            />
          </div>
        </div>
        <div class="modal-footer">
          <AppButton variant="secondary" size="md" @click="showSelectSlotModal = false">ยกเลิก</AppButton>
          <AppButton variant="primary" size="md" @click="confirmSelectSlot">บันทึกวันนัดหมาย</AppButton>
        </div>
      </div>
    </div>

    <!-- 4. Details Modal (3-Phase Lifecycle & Timeline) -->
    <BookingDetailsModal
      :show="showDetailsModal"
      :booking="targetBooking"
      :role="currentRole"
      :active-holder="targetBooking?.stall_number ? getStallActiveHolder(targetBooking.stall_number) : null"
      :preceding-queues="targetBooking?.stall_number ? getStallWaitingQueues(targetBooking.stall_number).filter(q => (q.queue_position || q.queue_number || 0) < (targetBooking.queue_position || targetBooking.queue_number || 1)) : []"
      @close="showDetailsModal = false"
      @approve="onDetailsApprove"
      @reject="onDetailsReject"
      @markVisited="handleMarkVisited"
      @cancel="onDetailsCancel"
      @applyLease="openLeaseApplication"
    />

    <!-- 5. Lease Application Modal -->
    <LeaseApplicationModal
      :show="showLeaseModal"
      :booking="targetBooking"
      :stall="null"
      @close="handleCloseLeaseModal"
      @success="onApplicationSubmitted"
    />

    <!-- 6. Stall Queue Chain Modal (Officer View Only - ผังคิวการจองแผงค้า) -->
    <div v-if="showStallQueueModal" class="modal-backdrop" @click="showStallQueueModal = false">
      <div class="modal-card modal-queue-chain" @click.stop>
        <div class="modal-header">
          <div class="modal-header-info">
            <div class="modal-title-with-badge">
              <div class="modal-title-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </div>
              <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: #1e293b;">ผังคิวการจอง แผงค้า {{ selectedStallNumber }}</h3>
              <span class="badge-stall-chain">รวมผู้จอง {{ getStallTotalApplicants(selectedStallNumber) }} ราย</span>
            </div>
            <p class="modal-subtitle" style="margin: 4px 0 0 0; color: #64748b; font-size: 0.85rem;">{{ selectedStallMarketName }}</p>
          </div>
          <button class="modal-close-btn" @click="showStallQueueModal = false" aria-label="ปิด">✕</button>
        </div>

        <div class="modal-body queue-chain-body">
          <!-- 1. Active Holder Section -->
          <div class="queue-section-block">
            <div class="queue-section-header">
              <span class="queue-section-badge badge-primary-holder" style="display: inline-flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span>ผู้จองหลัก (ถือสิทธิ์แผงค้าปัจจุบัน)</span>
              </span>
            </div>
            <div v-if="getStallActiveHolder(selectedStallNumber)" class="queue-holder-card is-active-holder">
              <div class="queue-card-top-row">
                <div class="queue-user-main">
                  <strong class="queue-user-name">{{ getStallActiveHolder(selectedStallNumber).tenant_name }}</strong>
                  <span class="queue-user-phone">({{ getStallActiveHolder(selectedStallNumber).tenant_phone }})</span>
                </div>
                <span class="status-pill" :class="getStatusPillClass(getStallActiveHolder(selectedStallNumber).status)">
                  {{ getStatusBadgeLabel(getStallActiveHolder(selectedStallNumber).status) }}
                </span>
              </div>
              <div class="queue-card-meta-row">
                <span>หมายเลขการจอง: <strong>{{ formatBookingNumber(getStallActiveHolder(selectedStallNumber).booking_number) }}</strong></span>
                <span v-if="getStallActiveHolder(selectedStallNumber).visit_date" style="margin-left: 8px;">
                  • นัดชม: {{ formatThaiVisitDate(getStallActiveHolder(selectedStallNumber).visit_date, getStallActiveHolder(selectedStallNumber)) }}
                </span>
              </div>
              <div class="queue-card-actions-row">
                <AppButton
                  variant="secondary"
                  size="sm"
                  @click="openBookingDetails(getStallActiveHolder(selectedStallNumber)); showStallQueueModal = false;"
                >
                  <template #prefix>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
                  </template>
                  <span>ดูรายละเอียดผู้จองหลัก</span>
                </AppButton>
              </div>
            </div>
            <div v-else class="queue-empty-box">
              <span>ไม่มีผู้จองหลักในขณะนี้ (แผงค้าว่างพร้อมให้คิวสำรองลำดับถัดไปรับสิทธิ์)</span>
            </div>
          </div>

          <!-- 2. Waiting Queue Section -->
          <div class="queue-section-block">
            <div class="queue-section-header">
              <span class="queue-section-badge badge-waiting-queue" style="display: inline-flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>ลำดับคิวสำรอง ({{ getStallWaitingQueues(selectedStallNumber).length }} ราย)</span>
              </span>
            </div>
            <div v-if="getStallWaitingQueues(selectedStallNumber).length > 0" class="queue-list-container">
              <div
                v-for="q in getStallWaitingQueues(selectedStallNumber)"
                :key="q.id"
                class="queue-item-row"
              >
                <div class="queue-item-left">
                  <div class="queue-num-badge">
                    #{{ q.queue_position || q.queue_number || 1 }}
                  </div>
                  <div class="queue-item-info">
                    <div class="queue-item-name-row">
                      <strong>{{ q.tenant_name }}</strong>
                      <span class="queue-user-phone">({{ q.tenant_phone }})</span>
                      <span class="status-pill-badge" :class="getStatusPillClass(q.status)" style="font-size: 0.75rem; padding: 2px 8px;">
                        {{ getStatusBadgeLabel(q.status) }}
                      </span>
                    </div>
                    <div class="queue-item-sub">
                      <span>เลขที่จอง: {{ formatBookingNumber(q.booking_number) }}</span>
                      <span style="margin: 0 4px; color: #cbd5e1;">•</span>
                      <span>นัดชม: {{ formatThaiVisitDate(q.visit_date, q) }} ({{ getVisitTimeSlot(q) }})</span>
                    </div>
                  </div>
                </div>
                <div class="queue-item-actions">
                  <AppButton
                    v-if="q.status === 'pending_approval' || q.status === 'pending'"
                    variant="primary"
                    size="sm"
                    @click="showStallQueueModal = false; openApproveModal(q)"
                    title="อนุมัติวันเวลานัดหมาย"
                  >
                    อนุมัตินัด
                  </AppButton>
                  <AppButton
                    variant="danger-outline"
                    size="sm"
                    @click="handleOfficerCancel(q)"
                    title="ยกเลิกการต่อคิวนี้"
                  >
                    ยกเลิกคิว
                  </AppButton>
                  <AppButton
                    variant="secondary"
                    size="sm"
                    @click="openBookingDetails(q); showStallQueueModal = false;"
                    title="ดูรายละเอียด"
                  >
                    รายละเอียด
                  </AppButton>
                </div>
              </div>
            </div>
            <div v-else class="queue-empty-box">
              <span>ไม่มีผู้รอคิวสำรองสำหรับแผงค้านี้</span>
            </div>
          </div>

          <!-- 3. Explanatory System Notice -->
          <div class="queue-system-notice">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span>ระบบจะทำการเลื่อนคิวสำรองลำดับที่ 1 ขึ้นเป็นผู้จองหลักโดยอัตโนมัติทันทีที่ผู้จองหลักสละสิทธิ์ หรือเจ้าหน้าที่ยกเลิกคำขอ</span>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: flex-end; padding: 14px 24px; border-top: 1px solid #f1f5f9;">
          <AppButton variant="secondary" size="md" @click="showStallQueueModal = false">ปิด</AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getBookingVisitDates,
  setCachedScheduleBookings,
  normalizeVisitDateToIso,
  getAppointmentRoundKey
} from '../../stall/composables/useMarketVisitSchedule'
import { getMarketGisConfig } from '../../stall/data/markets_registry'
import { useNotifications } from '~/composables/useNotifications'

const route = useRoute()
const router = useRouter()
const { get, post } = useApi()
const { user, role: authRole } = useAuth()
const { showAlert, showConfirm, showSuccess, showError, showWarning } = useAppAlert()
const { fetchNotifications } = useNotifications()

const loading = ref(true)
const bookings = ref<any[]>([])
const bookingReturnStorageKey = 'booking-list-return-context'

// Role state ('tenant' | 'officer')
const currentRole = ref<'tenant' | 'officer'>('officer')

// Officer Specific State
const resolveInitialMarketFilter = (raw?: any) => {
  const val = String(raw || 'all').trim()
  if (!val || val === 'all') return 'all'
  const cfg = getMarketGisConfig(val)
  if (String(cfg.id) === val || cfg.slug === val.toLowerCase()) {
    return cfg.name
  }
  return val
}
const officerSelectedMarket = ref(resolveInitialMarketFilter(route.query.market))
const officerActiveTab = ref<'all' | 'pending' | 'waiting' | 'approved' | 'interested' | 'applied' | 'cancelled'>('all')
const officerOnlyToday = ref(false)
const officerViewMode = ref<'project' | 'table'>('project')
const officerSearchQuery = ref('')

// Officer Stall Queue Modal State & Chain Helpers (ผังคิวแผงค้าสำหรับเจ้าหน้าที่)
const showStallQueueModal = ref(false)
const selectedStallNumber = ref('')
const selectedStallMarketName = ref('')

const openStallQueueModal = (stallNumber: string, marketName: string) => {
  selectedStallNumber.value = stallNumber
  selectedStallMarketName.value = marketName || 'ตลาดนัดจตุจักร'
  showStallQueueModal.value = true
}

const isQueueBooking = (b: any): boolean => {
  if (!b) return false
  if (['rejected', 'cancelled', 'not_interested', 'no_show', 'lease_applied', 'completed', 'terminated'].includes(b.status)) {
    return false
  }
  return b.status === 'waiting_queue' || (!b.holding_stall && Number(b.queue_position || b.queue_number) > 0)
}

const getStallBookings = (stallNumber: string) => {
  if (!stallNumber) return []
  return bookings.value.filter(b => b.stall_number === stallNumber && !['rejected', 'cancelled', 'not_interested', 'no_show'].includes(b.status))
}

const getStallActiveHolder = (stallNumber: string) => {
  if (!stallNumber) return null
  return bookings.value.find(b => b.stall_number === stallNumber && b.holding_stall && !isQueueBooking(b) && !['rejected', 'cancelled', 'not_interested', 'no_show'].includes(b.status))
}

const getStallWaitingQueues = (stallNumber: string) => {
  if (!stallNumber) return []
  return bookings.value
    .filter(b => b.stall_number === stallNumber && isQueueBooking(b))
    .sort((a, b) => (a.queue_position || a.queue_number || 99) - (b.queue_position || b.queue_number || 99))
}

const getStallQueueCount = (stallNumber: string) => {
  return getStallWaitingQueues(stallNumber).length
}

const getStallTotalApplicants = (stallNumber: string) => {
  const holder = getStallActiveHolder(stallNumber)
  const queues = getStallWaitingQueues(stallNumber)
  return (holder ? 1 : 0) + queues.length
}

// Tenant Specific State
const tenantStatusTab = ref<'all' | 'pending' | 'waiting' | 'applied' | 'completed' | 'cancelled'>('all')
const tenantSubFilter = ref<'all' | 'pending_approval' | 'approved' | 'interested'>('all')
const tenantViewMode = ref<'market' | 'flat'>('market')
const tenantSortOrder = ref<'newest' | 'oldest' | 'visit_soon'>('newest')
const toggleTenantSort = () => {
  tenantSortOrder.value = tenantSortOrder.value === 'newest' ? 'oldest' : 'newest'
}
const showTenantPendingTooltip = ref(false)
const tenantSearchQuery = ref('')
const showTenantFilterPanel = ref(false)

// Tenant Advanced Filters (Market, Action Focus, Visit Timeline)
const tenantSelectedMarket = ref('all')
const tenantActionFilter = ref('all')
const tenantVisitTimeFilter = ref('all')

const tempTenantMarket = ref('all')
const tempTenantAction = ref('all')
const tempTenantVisitTime = ref('all')

const tenantSortOptions = [
  { value: 'newest', label: 'จองล่าสุดก่อน' },
  { value: 'visit_soon', label: 'วันนัดใกล้สุด' },
  { value: 'oldest', label: 'จองเก่าสุดก่อน' }
]

const tenantMarketOptions = computed(() => {
  const set = new Set<string>()
  bookings.value.forEach(b => {
    if (b.market_name) set.add(b.market_name)
  })
  return [
    { value: 'all', label: 'ทุกตลาด' },
    ...Array.from(set).map(m => ({ value: m, label: m }))
  ]
})

const tenantActionOptions = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'has_visit', label: 'นัดหมายดูแผงแล้ว' },
  { value: 'need_apply', label: 'พร้อมยื่นคำร้องขอเช่า' },
  { value: 'waiting_approval', label: 'รออนุมัตินัดหมาย' },
  { value: 'in_queue', label: 'กำลังรอคิวสำรอง' },
  { value: 'applied', label: 'ยื่นคำร้องแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก / สละสิทธิ์' }
]

const tenantVisitTimeOptions = [
  { value: 'all', label: 'ทุกช่วงเวลา' },
  { value: 'next_7_days', label: 'นัดหมายภายใน 7 วันนี้' },
  { value: 'this_month', label: 'นัดหมายภายในเดือนนี้' },
  { value: 'has_visit', label: 'มีวันนัดหมายแล้ว' },
  { value: 'no_visit', label: 'ยังไม่มีวันนัดหมาย' }
]

const tenantViewOptions = [
  { value: 'market', label: 'ตลาด', title: 'มุมมองแยกกลุ่มตามตลาด', icon: 'market' },
  { value: 'flat', label: 'รายการ', title: 'มุมมองรายการ', icon: 'list' }
]

const officerViewOptions = [
  { value: 'project', label: 'การ์ด', title: 'มุมมองการ์ดแยกตามโครงการและแผงค้า', icon: 'card' },
  { value: 'table', label: 'ตาราง', title: 'มุมมองตารางแบบโครงการ แผงค้า และรายการจอง', icon: 'table' }
]

const toggleTenantPendingTooltip = () => {
  showTenantPendingTooltip.value = !showTenantPendingTooltip.value
}

const setTenantSubFilter = (val: 'all' | 'pending_approval' | 'approved' | 'interested') => {
  tenantSubFilter.value = val
  if (tenantStatusTab.value !== 'pending') {
    tenantStatusTab.value = 'pending'
  }
}

watch(tenantStatusTab, () => {
  tenantSubFilter.value = 'all'
  currentPage.value = 1
})

watch(tenantViewMode, () => {
  currentPage.value = 1
})

watch(tenantSortOrder, () => {
  currentPage.value = 1
})

watch(tenantSearchQuery, () => {
  currentPage.value = 1
})

// Accordion open/collapse states for Tenant view
const openMarkets = ref<Record<string, boolean>>({})

// Track expanded cards explicitly (defaults to empty, so no card is expanded by default)
const expandedCardIds = ref<Record<number, boolean>>({})

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Modals
const showDetailsModal = ref(false)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showSelectSlotModal = ref(false)
const showLeaseModal = ref(false)

const targetBooking = ref<any>(null)

// Form fields for actions
const approveMeetingPoint = ref('หน้ากองอำนวยการตลาด เสาธง 1')
const approveEscortOfficer = ref('นายธนากร สมบูรณ์ (เจ้าหน้าที่เวรนำชมแผง)')
const officerNotes = ref('อนุมัตินัดหมาย ให้เตรียมบัตรประชาชนมาแสดงก่อนเข้าชม')

const rejectReasonDropdown = ref('แผงปิดปรับปรุงระบบสาธารณูปโภค')
const rejectionReasonText = ref('')
const rejectReasonOptions = [
  { value: 'แผงปิดปรับปรุงระบบสาธารณูปโภค', label: 'แผงปิดปรับปรุงระบบสาธารณูปโภค' },
  { value: 'แผงมีผู้เช่าแล้ว / มีสัญญาเดิมผูกพัน', label: 'แผงมีผู้เช่าแล้ว / มีสัญญาเดิมผูกพัน' },
  { value: 'ประเภทสินค้าไม่ตรงกับผังการจัดโซนของตลาด', label: 'ประเภทสินค้าไม่ตรงกับผังการจัดโซนของตลาด' },
  { value: 'ผู้ขอจองมีประวัติค้างชำระหรือผิดเงื่อนไข', label: 'ผู้ขอจองมีประวัติค้างชำระหรือผิดเงื่อนไข' },
  { value: 'อื่นๆ (ระบุในหมายเหตุ)', label: 'อื่นๆ (ระบุในหมายเหตุ)' }
]

const slotDate = ref(new Date(Date.now() + 86400000).toISOString().slice(0, 10))
const slotTime = ref('09.30 - 10.30 น.')

const modalAvailableDates = computed(() => {
  const mName = targetBooking.value?.market_name || 'ตลาดนัดจตุจักร'
  const otherBookings = bookings.value.filter(b => b.id !== targetBooking.value?.id)
  return getBookingVisitDates(mName, 14, otherBookings, mName)
})

const slotDateOptions = computed(() => {
  return modalAvailableDates.value
    .filter(d => !d.isClosed && !d.isAllFull)
    .map(d => ({
      value: d.date,
      label: `${d.dayName} ${d.dayNum} ${d.monthShort} (${d.slotsText})`
    }))
})

const slotTimeOptions = computed(() => {
  const selectedDay = modalAvailableDates.value.find(d => d.date === slotDate.value)
  if (selectedDay && selectedDay.slots?.length) {
    return selectedDay.slots
      .filter(s => !s.isFull && s.enabled !== false)
      .map(s => ({
        value: s.time,
        label: `${s.time} (${s.capacityText})`
      }))
  }
  return [
    { value: '09.30 - 10.30 น.', label: '09.30 - 10.30 น. (ช่วงเช้า)' },
    { value: '11.00 - 12.00 น.', label: '11.00 - 12.00 น. (ช่วงสาย)' },
    { value: '13.00 - 14.00 น.', label: '13.00 - 14.00 น. (ช่วงบ่าย)' },
    { value: '15.30 - 16.30 น.', label: '15.30 - 16.30 น. (ช่วงเย็น)' }
  ]
})

watch(slotDate, () => {
  const opts = slotTimeOptions.value
  if (opts.length > 0 && !opts.some(o => o.value === slotTime.value)) {
    slotTime.value = opts[0].value
  }
})

// Load Bookings from API
const loadBookings = async () => {
  loading.value = true
  try {
    const res: any = await get('/bookings', { _t: Date.now() })
    // Nitro returns an array directly while the persistent Go API uses the
    // standard { status, code, data } envelope.
    bookings.value = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : [])
    setCachedScheduleBookings(bookings.value)
    await fetchNotifications()
  } catch (err) {
    console.error('Failed to load bookings:', err)
  } finally {
    loading.value = false
  }
}

// ============================================================
// TENANT COMPUTEDS (1 การจอง = 1 แผง = 1 การ์ด)
// ============================================================
const normalizeBookingOwnerName = (value: unknown) => String(value || '')
  .replace(/^(คุณ|นาย|นางสาว|นาง|น\.ส\.)\s*/g, '')
  .replace(/\([^)]*\)/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase()

const isBookingOwnedByCurrentTenant = (booking: any) => {
  if (currentRole.value !== 'tenant') return true
  const currentUser = user.value as any
  const userId = currentUser?.id
  if (userId !== undefined && userId !== null && booking?.tenant_user_id !== undefined && booking?.tenant_user_id !== null) {
    return String(booking.tenant_user_id) === String(userId)
  }

  const bookingName = normalizeBookingOwnerName(booking?.tenant_name || booking?.applicant_name)
  const currentName = normalizeBookingOwnerName(currentUser?.full_name)
  if (bookingName && currentName && bookingName === currentName) return true

  // Compatibility with the seeded demo profiles created before tenant_user_id existed.
  const demoOwnerNames: Record<string, string> = {
    tenant: 'สมชาย ใจดี',
    tenant2: 'นภาพร รัตนศิลป์'
  }
  const demoName = normalizeBookingOwnerName(demoOwnerNames[String(currentUser?.username || '')])
  return Boolean(bookingName && demoName && bookingName === demoName)
}

const tenantGroupedBookings = computed(() => {
  if (currentRole.value !== 'tenant') return bookings.value
  return bookings.value.filter(isBookingOwnedByCurrentTenant)
})

const countAll = computed(() => tenantGroupedBookings.value.length)

// 2. รอดำเนินการ (pending, pending_approval, approved, pending_slot, interested, waiting_queue)
const countPending = computed(() => {
  return tenantGroupedBookings.value.filter(b =>
    ['pending', 'pending_approval', 'approved', 'pending_slot', 'interested', 'waiting_queue'].includes(b.status)
  ).length
})

// 3. รอคิว (Waiting List แยกออกมาต่างหาก)
const countWaiting = computed(() => {
  return tenantGroupedBookings.value.filter(b => isQueueBooking(b)).length
})

const tenantCountPendingApproval = computed(() => {
  return tenantGroupedBookings.value.filter(b =>
    ['pending', 'pending_approval', 'pending_slot', 'waiting_queue'].includes(b.status)
  ).length
})

const tenantCountApproved = computed(() => {
  return tenantGroupedBookings.value.filter(b => b.status === 'approved').length
})

const tenantCountInterested = computed(() => {
  return tenantGroupedBookings.value.filter(b => b.status === 'interested').length
})

// 4. ยื่นคำร้องสำเร็จ (สีม่วง)
const countApplied = computed(() => {
  return tenantGroupedBookings.value.filter(b =>
    ['completed', 'lease_applied'].includes(b.status)
  ).length
})
const countCompleted = countApplied

// 5. ยกเลิก
const countCancelled = computed(() => {
  return tenantGroupedBookings.value.filter(b =>
    ['cancelled', 'rejected', 'not_interested', 'no_show', 'terminated'].includes(b.status)
  ).length
})

const getTenantTabName = (tab: string) => {
  switch (tab) {
    case 'pending': return 'รอดำเนินการ'
    case 'waiting': return 'รอคิว'
    case 'applied':
    case 'completed': return 'ยื่นคำร้องสำเร็จ'
    case 'cancelled': return 'ยกเลิก'
    default: return 'ทั้งหมด'
  }
}

const getBookingTimestamp = (b: any): number => {
  if (!b) return 0
  if (b.created_at) {
    const t = new Date(b.created_at).getTime()
    if (!isNaN(t)) return t
  }
  if (typeof b.id === 'number') {
    return b.id
  }
  return 0
}

const getUpcomingVisitTimestamp = (b: any): number => {
  if (!b?.visit_date || !['pending', 'pending_approval', 'approved', 'waiting_queue', 'pending_slot'].includes(b.status)) {
    return Number.MAX_SAFE_INTEGER
  }

  const iso = normalizeVisitDateToIso(b.visit_date) || b.visit_date
  const timestamp = new Date(iso).getTime()
  if (isNaN(timestamp)) return Number.MAX_SAFE_INTEGER

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return timestamp >= today.getTime() ? timestamp : Number.MAX_SAFE_INTEGER
}

const openTenantFilterPanel = () => {
  tempTenantMarket.value = tenantSelectedMarket.value
  tempTenantAction.value = tenantActionFilter.value
  tempTenantVisitTime.value = tenantVisitTimeFilter.value
  showTenantFilterPanel.value = !showTenantFilterPanel.value
}

const closeTenantFilterPanel = () => {
  showTenantFilterPanel.value = false
}

const applyTenantFilters = () => {
  tenantSelectedMarket.value = tempTenantMarket.value
  tenantActionFilter.value = tempTenantAction.value
  tenantVisitTimeFilter.value = tempTenantVisitTime.value
  showTenantFilterPanel.value = false
  currentPage.value = 1
}

const clearTenantAdvancedFilters = () => {
  tempTenantMarket.value = 'all'
  tempTenantAction.value = 'all'
  tempTenantVisitTime.value = 'all'
  tenantSelectedMarket.value = 'all'
  tenantActionFilter.value = 'all'
  tenantVisitTimeFilter.value = 'all'
  currentPage.value = 1
}

const tenantAdvancedFilterCount = computed(() => {
  let count = 0
  if (tenantSelectedMarket.value !== 'all') count++
  if (tenantVisitTimeFilter.value !== 'all') count++
  return count
})

const hasTenantAdvancedFilters = computed(() => tenantAdvancedFilterCount.value > 0)

const hasTempTenantAdvancedFilters = computed(() => {
  return tempTenantMarket.value !== 'all' ||
    tempTenantVisitTime.value !== 'all'
})

const tenantHasActiveFilters = computed(() => {
  return tenantStatusTab.value !== 'all' ||
    tenantSubFilter.value !== 'all' ||
    tenantSelectedMarket.value !== 'all' ||
    tenantVisitTimeFilter.value !== 'all' ||
    tenantSearchQuery.value.trim().length > 0
})

const clearTenantFilters = () => {
  tenantStatusTab.value = 'all'
  tenantSubFilter.value = 'all'
  tenantSelectedMarket.value = 'all'
  tenantActionFilter.value = 'all'
  tenantVisitTimeFilter.value = 'all'
  tempTenantMarket.value = 'all'
  tempTenantAction.value = 'all'
  tempTenantVisitTime.value = 'all'
  tenantSearchQuery.value = ''
  tenantSortOrder.value = 'newest'
  currentPage.value = 1
}

const computeFilteredTenantBookings = (
  marketFilter: string,
  actionFilter: string,
  visitFilter: string
) => {
  let list = tenantGroupedBookings.value

  if (tenantStatusTab.value === 'pending') {
    if (tenantSubFilter.value === 'pending_approval') {
      list = list.filter(b =>
        ['pending', 'pending_approval', 'pending_slot', 'waiting_queue'].includes(b.status)
      )
    } else if (tenantSubFilter.value === 'approved') {
      list = list.filter(b => b.status === 'approved')
    } else if (tenantSubFilter.value === 'interested') {
      list = list.filter(b => b.status === 'interested')
    } else {
      list = list.filter(b =>
        ['pending', 'pending_approval', 'approved', 'pending_slot', 'interested', 'waiting_queue'].includes(b.status)
      )
    }
  } else if (tenantStatusTab.value === 'waiting') {
    list = list.filter(b => isQueueBooking(b))
  } else if (tenantStatusTab.value === 'applied' || tenantStatusTab.value === 'completed') {
    list = list.filter(b =>
      ['completed', 'lease_applied'].includes(b.status)
    )
  } else if (tenantStatusTab.value === 'cancelled') {
    list = list.filter(b =>
      ['cancelled', 'rejected', 'not_interested', 'no_show', 'terminated'].includes(b.status)
    )
  }

  // Filter by Market
  if (marketFilter !== 'all') {
    list = list.filter(b => (b.market_name || '') === marketFilter)
  }

  // Filter by Action Focus
  if (actionFilter === 'has_visit') {
    list = list.filter(b => b.status === 'approved')
  } else if (actionFilter === 'need_apply') {
    list = list.filter(b => b.status === 'interested')
  } else if (actionFilter === 'waiting_approval') {
    list = list.filter(b => ['pending', 'pending_approval', 'pending_slot'].includes(b.status))
  } else if (actionFilter === 'in_queue') {
    list = list.filter(b => isQueueBooking(b))
  } else if (actionFilter === 'applied') {
    list = list.filter(b => ['lease_applied', 'completed'].includes(b.status))
  } else if (actionFilter === 'cancelled') {
    list = list.filter(b => ['cancelled', 'rejected', 'not_interested', 'no_show', 'terminated'].includes(b.status))
  }

  // Filter by Visit Schedule
  if (visitFilter !== 'all') {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const nowMs = now.getTime()

    if (visitFilter === 'next_7_days') {
      const in7Days = nowMs + (7 * 24 * 60 * 60 * 1000)
      list = list.filter(b => {
        if (!b.visit_date) return false
        const iso = normalizeVisitDateToIso(b.visit_date) || b.visit_date
        const t = new Date(iso).getTime()
        return t >= nowMs && t <= in7Days
      })
    } else if (visitFilter === 'this_month') {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime()
      list = list.filter(b => {
        if (!b.visit_date) return false
        const iso = normalizeVisitDateToIso(b.visit_date) || b.visit_date
        const t = new Date(iso).getTime()
        return t >= nowMs && t <= endOfMonth
      })
    } else if (visitFilter === 'has_visit') {
      list = list.filter(b => Boolean(b.visit_date))
    } else if (visitFilter === 'no_visit') {
      list = list.filter(b => !b.visit_date)
    }
  }

  // Filter by Search Query
  if (tenantSearchQuery.value.trim()) {
    const q = tenantSearchQuery.value.trim().toLowerCase().replace('#', '')
    list = list.filter(b => {
      const bNum = (b.booking_number || '').toLowerCase().replace('#', '')
      const stall = (b.stall_number || '').toLowerCase()
      const mkt = (b.market_name || '').toLowerCase()
      const tenant = (b.tenant_name || '').toLowerCase()
      return bNum.includes(q) || stall.includes(q) || mkt.includes(q) || tenant.includes(q)
    })
  }

  return [...list].sort((a, b) => {
    if (tenantSortOrder.value === 'visit_soon') {
      const visitDifference = getUpcomingVisitTimestamp(a) - getUpcomingVisitTimestamp(b)
      if (visitDifference !== 0) return visitDifference
      return getBookingTimestamp(b) - getBookingTimestamp(a)
    }

    const direction = tenantSortOrder.value === 'oldest' ? 1 : -1
    return (getBookingTimestamp(a) - getBookingTimestamp(b)) * direction
  })
}

const filteredTenantBookings = computed(() => {
  return computeFilteredTenantBookings(
    tenantSelectedMarket.value,
    tenantActionFilter.value,
    tenantVisitTimeFilter.value
  )
})

const previewFilteredTenantCount = computed(() => {
  if (!showTenantFilterPanel.value) return filteredTenantBookings.value.length
  return computeFilteredTenantBookings(
    tempTenantMarket.value,
    tempTenantAction.value,
    tempTenantVisitTime.value
  ).length
})

const paginatedTenantBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredTenantBookings.value.slice(start, start + itemsPerPage.value)
})


const overallLatestTenantBooking = computed(() => {
  const ownedBookings = tenantGroupedBookings.value
  if (!ownedBookings || ownedBookings.length === 0) return null
  const sorted = [...ownedBookings].sort((a, b) => getBookingTimestamp(b) - getBookingTimestamp(a))
  return sorted[0] || null
})

const isLatestBooking = (b: any): boolean => {
  if (!b) return false
  const latest = overallLatestTenantBooking.value
  if (!latest) return false
  if (b === latest) return true
  if (b.id != null && latest.id != null && String(b.id) === String(latest.id)) return true
  if (b.booking_number && latest.booking_number &&
      String(b.booking_number).replace(/[^0-9a-zA-Z]/g, '') === String(latest.booking_number).replace(/[^0-9a-zA-Z]/g, '')) {
    return true
  }
  return false
}

const tenantMarketGroups = computed(() => {
  const groups: Record<string, any[]> = {}

  paginatedTenantBookings.value.forEach(b => {
    const mkt = b.market_name || 'ตลาดนัดจตุจักร'
    if (!groups[mkt]) {
      groups[mkt] = []
    }
    groups[mkt].push(b)
  })

  const result = Object.keys(groups).map(name => {
    const bList = groups[name]
    const hasLatest = bList.some(b => isLatestBooking(b))
    return {
      name,
      bookings: bList,
      hasLatest,
      isTimeline: false
    }
  })

  // Object insertion order follows the selected booking sort order.
  return result
})

const tenantDisplayGroups = computed(() => {
  if (tenantViewMode.value === 'flat') {
    return [
      {
        name: 'all',
        isFlat: true,
        bookings: paginatedTenantBookings.value,
        hasLatest: true
      }
    ]
  }
  return tenantMarketGroups.value.map(g => ({ ...g, isFlat: false }))
})

watch(
  () => overallLatestTenantBooking.value?.market_name,
  (mkt) => {
    if (mkt && openMarkets.value[mkt] === undefined) {
      openMarkets.value[mkt] = true
    }
  },
  { immediate: true }
)


// ============================================================
// OFFICER COMPUTEDS (เฉพาะตลาดที่สังกัด หรือ ดูทุกตลาด)
// ============================================================
const uniqueOfficerMarkets = computed(() => {
  const set = new Set<string>()
  bookings.value.forEach(b => {
    if (b.market_name) set.add(b.market_name)
  })
  set.add('ตลาดนัดจตุจักร')
  set.add('ตลาดบางแคภิรมย์')
  set.add('ตลาดสิงหา')
  set.add('ตลาดมีนบุรี')
  set.add('ตลาดธนบุรี (สนามหลวง 2)')
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'))
})

const officerMarketOptions = computed(() => [
  { value: 'all', label: 'ตลาดทั้งหมด' },
  ...uniqueOfficerMarkets.value.map(m => ({ value: m, label: m }))
])

const officerMarketBookings = computed(() => {
  // Officer view must always use the complete booking feed. Tenant ownership
  // filtering should never hide another tenant's booking from staff.
  const grouped = bookings.value
  if (!officerSelectedMarket.value || officerSelectedMarket.value === 'all') {
    return grouped
  }
  return grouped.filter(b =>
    !b.market_name ||
    b.market_name.includes(officerSelectedMarket.value) ||
    officerSelectedMarket.value.includes(b.market_name)
  )
})

const officerCountToday = computed(() => {
  return officerMarketBookings.value.filter(b =>
    !isQueueBooking(b) && b.status === 'approved' && (b.visit_date?.includes('19 ตุลาคม') || b.visit_date?.includes('วันนี้') || !b.visit_date)
  ).length
})

const officerCountPending = computed(() => {
  return officerMarketBookings.value.filter(b =>
    !isQueueBooking(b) && (b.status === 'pending_approval' || b.status === 'pending' || b.status === 'pending_slot')
  ).length
})

const officerCountWaiting = computed(() => {
  return officerMarketBookings.value.filter(b => isQueueBooking(b)).length
})

const officerCountApproved = computed(() => {
  return officerMarketBookings.value.filter(b => !isQueueBooking(b) && b.status === 'approved').length
})

const officerCountInterested = computed(() => {
  return officerMarketBookings.value.filter(b => !isQueueBooking(b) && b.status === 'interested').length
})

const officerCountActionable = computed(() => {
  return officerMarketBookings.value.filter(b =>
    ['pending', 'pending_approval', 'pending_slot', 'approved', 'interested', 'waiting_queue'].includes(b.status)
  ).length
})

const officerCountApplied = computed(() => {
  return officerMarketBookings.value.filter(b => b.status === 'lease_applied' || b.status === 'completed').length
})

const officerCountCancelled = computed(() => {
  return officerMarketBookings.value.filter(b =>
    ['cancelled', 'rejected', 'not_interested', 'no_show', 'terminated'].includes(b.status)
  ).length
})

const filteredOfficerBookings = computed(() => {
  const searchQuery = officerSearchQuery.value.trim().toLowerCase().replace('#', '')
  // A direct booking-number search should be global. Otherwise a stale market
  // filter from the previous page can hide the exact booking being searched.
  let list = searchQuery ? bookings.value : officerMarketBookings.value
  const matchesSearch = (b: any) => {
    if (!searchQuery) return true
    const bNum = (b.booking_number || '').toLowerCase().replace('#', '')
    const stall = (b.stall_number || '').toLowerCase()
    const tenant = (b.tenant_name || '').toLowerCase()
    const phone = (b.tenant_phone || '').toLowerCase()
    return bNum.includes(searchQuery) || stall.includes(searchQuery) || tenant.includes(searchQuery) || phone.includes(searchQuery)
  }

  if (officerActiveTab.value === 'pending') {
    list = list.filter(b => !isQueueBooking(b) && (b.status === 'pending_approval' || b.status === 'pending' || b.status === 'pending_slot'))
  } else if (officerActiveTab.value === 'waiting') {
    list = list.filter(b => isQueueBooking(b))
  } else if (officerActiveTab.value === 'approved') {
    list = list.filter(b => !isQueueBooking(b) && b.status === 'approved')
    if (officerOnlyToday.value) {
      list = list.filter(b => b.visit_date?.includes('19 ตุลาคม') || b.visit_date?.includes('วันนี้') || !b.visit_date)
    }
  } else if (officerActiveTab.value === 'interested') {
    list = list.filter(b => !isQueueBooking(b) && b.status === 'interested')
  } else if (officerActiveTab.value === 'applied') {
    list = list.filter(b => b.status === 'lease_applied' || b.status === 'completed')
  } else if (officerActiveTab.value === 'cancelled') {
    list = list.filter(b => ['cancelled', 'rejected', 'not_interested', 'no_show', 'terminated'].includes(b.status))
  }

  if (searchQuery) {
    list = list.filter(matchesSearch)
  }

  // Sort newest first so officers see the latest submissions at the top
  return [...list].sort((a, b) => getBookingTimestamp(b) - getBookingTimestamp(a))
})

const getOfficerTabName = (tab: string) => {
  switch (tab) {
    case 'pending': return 'รอเจ้าหน้าที่อนุมัติ'
    case 'waiting': return 'รอคิว'
    case 'approved': return 'นัดหมายสำเร็จ'
    case 'interested': return 'รอผู้เช่ายื่นคำร้อง'
    case 'applied': return 'ยื่นคำร้องสำเร็จ'
    case 'cancelled': return 'ยกเลิก'
    default: return 'ทั้งหมด'
  }
}

// Officer Stall Grouping & Accordion State (แยกตามแผงค้า)
const openStallGroups = ref<Record<string, boolean>>({})

const actionableBookingStatuses = ['pending', 'pending_approval', 'pending_slot', 'approved', 'interested']

const getActionableBookingCount = (stallBookings: any[]) =>
  stallBookings.filter(booking => actionableBookingStatuses.includes(booking.status)).length

const getOfficerStallGroupKey = (group: { groupKey?: string; marketName?: string; projectName?: string; stallNumber: string }) =>
  group.groupKey || `${group.marketName || ''}::${group.projectName || ''}::${group.stallNumber}`

const isStallGroupOpen = (stallKey: string) => {
  if (openStallGroups.value[stallKey] !== undefined) {
    return !!openStallGroups.value[stallKey]
  }
  return true
}

const toggleStallGroup = (stallKey: string) => {
  openStallGroups.value[stallKey] = !isStallGroupOpen(stallKey)
}

const areAllStallGroupsOpen = computed(() => {
  if (officerStallGroups.value.length === 0) return true
  return officerStallGroups.value.every(g => isStallGroupOpen(getOfficerStallGroupKey(g)))
})

const toggleAllStallGroups = () => {
  const nextState = !areAllStallGroupsOpen.value
  officerStallGroups.value.forEach(g => {
    openStallGroups.value[getOfficerStallGroupKey(g)] = nextState
  })
}

interface OfficerStallGroup {
  stallNumber: string
  marketName: string
  projectName?: string
  stallZone?: string
  totalApplicants: number
  activeHolder?: any
  waitingQueues: any[]
  bookings: any[]
  isFlat?: boolean
}

interface OfficerProjectGroup {
  key: string
  projectName: string
  marketName: string
  stalls: OfficerStallGroup[]
  bookingCount: number
  actionableCount: number
}

const openProjectGroups = ref<Record<string, boolean>>({})

const isProjectGroupOpen = (projectKey: string) => {
  if (openProjectGroups.value[projectKey] !== undefined) {
    return !!openProjectGroups.value[projectKey]
  }
  return true
}

const toggleProjectGroup = (projectKey: string) => {
  openProjectGroups.value[projectKey] = !isProjectGroupOpen(projectKey)
}

const officerStallGroups = computed<OfficerStallGroup[]>(() => {
  const map = new Map<string, OfficerStallGroup>()

  for (const b of filteredOfficerBookings.value) {
    const stallNumber = (b.stall_number || 'ไม่ระบุแผง').trim()
    const marketName = b.market_name || (officerSelectedMarket.value === 'all' ? 'ทุกตลาด' : officerSelectedMarket.value) || 'ตลาดนัดจตุจักร'
    const projectName = b.project_name || ''
    const stallKey = `${marketName}::${projectName}::${stallNumber}`
    if (!map.has(stallKey)) {
      map.set(stallKey, {
        stallNumber,
        marketName,
        projectName,
        stallZone: b.stall_zone_name || '',
        totalApplicants: getStallTotalApplicants(stallNumber),
        activeHolder: getStallActiveHolder(stallNumber),
        waitingQueues: getStallWaitingQueues(stallNumber),
        bookings: [],
        isFlat: false
      })
    }
    map.get(stallKey)!.bookings.push(b)
  }

  const groups = Array.from(map.values()).map(g => {
    g.bookings.sort((a, b) => {
      // 1. Active holder first
      const aHolder = a.holding_stall && !isQueueBooking(a) && !['rejected', 'not_interested', 'cancelled', 'no_show'].includes(a.status) ? 1 : 0
      const bHolder = b.holding_stall && !isQueueBooking(b) && !['rejected', 'not_interested', 'cancelled', 'no_show'].includes(b.status) ? 1 : 0
      if (aHolder !== bHolder) return bHolder - aHolder

      // 2. Waiting queue by queue position
      const aQueue = isQueueBooking(a)
      const bQueue = isQueueBooking(b)
      if (aQueue && bQueue) {
        return (a.queue_position || a.queue_number || 999) - (b.queue_position || b.queue_number || 999)
      }
      if (aQueue) return -1
      if (bQueue) return 1

      // 3. Fallback newest first
      return getBookingTimestamp(b) - getBookingTimestamp(a)
    })
    return g
  })

  // Stalls with multiple applicants float to the top!
  groups.sort((a, b) => {
    if (b.bookings.length !== a.bookings.length) {
      return b.bookings.length - a.bookings.length
    }
    return a.stallNumber.localeCompare(b.stallNumber, undefined, { numeric: true })
  })

  return groups
})

// เปิดเฉพาะแผงที่มีรายการรอดำเนินการเมื่อเข้าหน้าครั้งแรก
// ลดการไล่เปิดทีละแผง แต่ยังคงให้เจ้าหน้าที่เปิดแผงอื่นได้เอง
watch(officerStallGroups, (stalls) => {
  stalls.forEach(stall => {
    const key = getOfficerStallGroupKey(stall)
    if (openStallGroups.value[key] === undefined) {
      openStallGroups.value[key] = getActionableBookingCount(stall.bookings) > 0
    }
  })
}, { immediate: true })

const officerProjectGroups = computed<OfficerProjectGroup[]>(() => {
  const map = new Map<string, OfficerProjectGroup>()

  officerStallGroups.value.forEach(stall => {
    const projectName = stall.projectName?.trim() || 'ไม่ระบุโครงการ'
    const projectKey = `${stall.marketName}::${projectName}`
    if (!map.has(projectKey)) {
      map.set(projectKey, {
        key: projectKey,
        projectName,
        marketName: stall.marketName,
        stalls: [],
        bookingCount: 0,
        actionableCount: 0
      })
    }

    const project = map.get(projectKey)!
    project.stalls.push(stall)
    project.bookingCount += stall.bookings.length
    project.actionableCount += stall.bookings.filter(b =>
      ['pending', 'pending_approval', 'pending_slot', 'approved', 'interested'].includes(b.status)
    ).length
  })

  return Array.from(map.values())
    .map(project => ({
      ...project,
      stalls: [...project.stalls].sort((a, b) => {
        if (b.bookings.length !== a.bookings.length) return b.bookings.length - a.bookings.length
        return a.stallNumber.localeCompare(b.stallNumber, undefined, { numeric: true })
      })
    }))
    .sort((a, b) => {
      if (b.actionableCount !== a.actionableCount) return b.actionableCount - a.actionableCount
      return a.projectName.localeCompare(b.projectName, 'th')
    })
})

const areAllProjectGroupsOpen = computed(() => {
  if (officerProjectGroups.value.length === 0) return true
  return officerProjectGroups.value.every(project => isProjectGroupOpen(project.key))
})

const toggleAllProjectGroups = () => {
  const nextState = !areAllProjectGroupsOpen.value
  officerProjectGroups.value.forEach(project => {
    openProjectGroups.value[project.key] = nextState
  })
}

watch(officerProjectGroups, (projects) => {
  projects.forEach(project => {
    if (openProjectGroups.value[project.key] === undefined) {
      openProjectGroups.value[project.key] = project.actionableCount > 0
    }
  })
}, { immediate: true })

// Pagination for Officer
const officerCurrentPage = ref(1)
const officerItemsPerPage = ref(10)

const officerTotalPages = computed(() => {
  const total = officerProjectGroups.value.length
  return Math.max(1, Math.ceil(total / officerItemsPerPage.value) || 1)
})

const paginatedOfficerProjectGroups = computed(() => {
  const start = (officerCurrentPage.value - 1) * officerItemsPerPage.value
  return officerProjectGroups.value.slice(start, start + officerItemsPerPage.value)
})

const officerDisplayGroups = computed(() => {
  // Project mode: paginate projects, then keep every stall within each visible project together.
  return paginatedOfficerProjectGroups.value
    .flatMap(project => project.stalls.map((stall, index) => ({
      ...stall,
      groupKey: `${project.key}::${stall.stallNumber}`,
      projectKey: project.key,
      projectName: project.projectName,
      isProjectStart: index === 0,
      projectStallCount: project.stalls.length,
      projectBookingCount: project.bookingCount,
      projectActionableCount: project.actionableCount
    })))
})

watch(officerViewMode, () => {
  officerCurrentPage.value = 1
})

const officerVisiblePageNumbers = computed(() => {
  const total = officerTotalPages.value
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const current = officerCurrentPage.value
  if (current <= 3) {
    return [1, 2, 3, '...', total]
  }
  if (current >= total - 2) {
    return [1, '...', total - 2, total - 1, total]
  }
  return [1, '...', current, '...', total]
})

// Accordion toggle helpers for Tenant
const isMarketOpen = (marketName: string) => {
  if (openMarkets.value[marketName] !== undefined) {
    return !!openMarkets.value[marketName]
  }
  // กางเปิดกลุ่มตลาดทุกกลุ่มเป็นค่าเริ่มต้น เพื่อความสะดวก ไม่ต้องคลิกเปิดเอง
  return true
}

const toggleMarket = (marketName: string) => {
  openMarkets.value[marketName] = !isMarketOpen(marketName)
}

const isCardExpanded = (bookingId: number) => {
  return expandedCardIds.value[bookingId] === true
}

const toggleCardExpanded = (bookingId: number) => {
  expandedCardIds.value[bookingId] = !isCardExpanded(bookingId)
}

const allVisibleTenantCardsExpanded = computed(() => {
  return paginatedTenantBookings.value.length > 0 &&
    paginatedTenantBookings.value.every(b => isCardExpanded(b.id))
})

const toggleAllVisibleTenantCards = () => {
  const shouldExpand = !allVisibleTenantCardsExpanded.value
  paginatedTenantBookings.value.forEach(b => {
    expandedCardIds.value[b.id] = shouldExpand
  })

  if (shouldExpand && tenantViewMode.value === 'market') {
    tenantMarketGroups.value.forEach(group => {
      openMarkets.value[group.name] = true
    })
  }
}

// Pagination for Tenant
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredTenantBookings.value.length / itemsPerPage.value))
})

const visiblePageNumbers = computed(() => {
  const total = totalPages.value
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const current = currentPage.value
  if (current <= 3) {
    return [1, 2, 3, '...', total]
  }
  if (current >= total - 2) {
    return [1, '...', total - 2, total - 1, total]
  }
  return [1, '...', current, '...', total]
})

// Format Helpers
const getBookingProjectName = (b: any): string => {
  if (b?.project_name) return b.project_name
  if (b?.stall_project_name) return b.stall_project_name
  if (b?.stall_number) {
    const num = String(b.stall_number).toUpperCase()
    if (num.startsWith('A-')) return 'โครงการ 04 (A)'
    if (num.startsWith('B-')) return 'โครงการ 03 (C)'
    if (num.startsWith('C-')) return 'โครงการ 03 (C)'
    if (num.startsWith('BK-01') || num.startsWith('BK-05')) return 'โครงการ 01 (โซนหลัก)'
    if (num.startsWith('BK-12') || num.startsWith('BK-13') || num.startsWith('BK-15') || num.startsWith('BK-20')) return 'โครงการ 02 (แผงค้าเบ็ดเตล็ด)'
    if (num.startsWith('PK-')) return 'โครงการ 01 (ฉ)'
  }
  if (b?.stall_zone_name && b.stall_zone_name.includes('โครงการ')) {
    return b.stall_zone_name
  }
  return 'โครงการ 01'
}

const formatBookingNumber = (bNum: string | number) => {
  if (!bNum) return '#3001'
  const str = String(bNum)
  return str.startsWith('#') ? str : `#${str}`
}

const formatSubmissionTimestamp = (dateStr: string) => {
  if (!dateStr) return 'ไม่พบเวลาทำรายการ'
  if (dateStr.includes('เวลา') || dateStr.includes('ตุลาคม') || dateStr.includes('พ.ศ.')) {
    return dateStr
  }
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr

    const thaiFullMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    const day = d.getDate()
    const month = thaiFullMonths[d.getMonth()]
    const year = d.getFullYear() + 543
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${day} ${month} ${year} เวลา ${hh}.${mm} น.`
  } catch {
    return dateStr
  }
}

const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return 'ไม่พบวันที่กดจอง'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr

    const now = new Date()
    const diffMs = now.getTime() - d.getTime()

    if (diffMs < 60 * 1000) {
      return 'เมื่อสักครู่'
    }

    const diffMins = Math.floor(diffMs / (60 * 1000))
    if (diffMins < 60) {
      return `เมื่อ ${diffMins} นาทีที่แล้ว`
    }

    const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
    if (diffHours < 24 && now.getDate() === d.getDate()) {
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      return `วันนี้ เวลา ${hh}.${mm} น.`
    }

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (yesterday.getDate() === d.getDate() && yesterday.getMonth() === d.getMonth() && yesterday.getFullYear() === d.getFullYear()) {
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      return `เมื่อวานนี้ เวลา ${hh}.${mm} น.`
    }

    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    const day = d.getDate()
    const month = thaiMonths[d.getMonth()]
    const year = (d.getFullYear() + 543) % 100
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${day} ${month} ${year} (${hh}.${mm} น.)`
  } catch {
    return dateStr
  }
}

const formatCreatedDate = (dateStr: string) => {
  if (!dateStr) return 'ไม่พบวันที่กดจอง'
  if (dateStr.includes('เวลา') || dateStr.includes('ตุลาคม') || dateStr.includes('พ.ศ.')) {
    return dateStr
  }
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    const day = d.getDate()
    const month = thaiMonths[d.getMonth()]
    const year = d.getFullYear() + 543
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    return `${day} ${month} ${year} เวลา ${hours}.${mins} น.`
  } catch {
    return dateStr
  }
}

const getVisitTimeSlot = (booking: any) => {
  if (booking?.visit_time_slot && booking.visit_time_slot !== 'รอยืนยันเวลา') {
    return booking.visit_time_slot
  }
  const slots = ['10.00 - 11.30 น.', '13.00 - 14.30 น.', '14.00 - 15.30 น.', '15.00 - 16.00 น.']
  const idx = Math.abs((Number(booking?.id) || 1)) % slots.length
  return slots[idx]
}

const formatThaiVisitDate = (dateStr?: string, booking?: any) => {
  let target = dateStr
  if (!target && booking?.visit_date) {
    target = booking.visit_date
  }
  if (!target && booking?.created_at) {
    try {
      const cd = new Date(booking.created_at)
      if (!isNaN(cd.getTime())) {
        cd.setDate(cd.getDate() + 5)
        target = cd.toISOString()
      }
    } catch {}
  }
  if (!target) {
    target = '2026-10-18T10:00:00'
  }
  if (target.includes('จันทร์') || target.includes('อังคาร') || target.includes('พุธ') || target.includes('พฤหัสบดี') || target.includes('ศุกร์') || target.includes('เสาร์') || target.includes('อาทิตย์')) {
    return target
  }
  try {
    const d = new Date(target)
    if (isNaN(d.getTime())) return target
    const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    const dayName = thaiDays[d.getDay()]
    const day = d.getDate()
    const month = thaiMonths[d.getMonth()]
    const year = d.getFullYear() + 543
    return `${dayName} ${day} ${month} ${year}`
  } catch {
    return target
  }
}

const getDaysRemainingBadge = (dateStr: string) => {
  if (!dateStr) return null
  if (dateStr.includes('อีก')) {
    const match = dateStr.match(/อีก\s*\d+\s*วัน/)
    return match ? match[0] : null
  }
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    if (!isNaN(target.getTime())) {
      target.setHours(0, 0, 0, 0)
      const diffMs = target.getTime() - today.getTime()
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays > 0) return `อีก ${diffDays} วัน`
      if (diffDays === 0) return 'วันนี้'
      return null
    }
  } catch {}
  return null
}

// 3-Phase Stepper Checkers
const isStepCompleted = (status: string, step: number) => {
  if (step === 1) return ['approved', 'interested', 'lease_applied', 'completed', 'waiting_queue'].includes(status)
  if (step === 2) return ['interested', 'lease_applied', 'completed'].includes(status)
  if (step === 3) return ['lease_applied', 'completed'].includes(status)
  return false
}

const isStepActive = (status: string, step: number) => {
  if (step === 1) return ['pending', 'pending_approval', 'pending_slot'].includes(status)
  if (step === 2) return ['approved', 'waiting_queue'].includes(status)
  if (step === 3) return status === 'interested'
  return false
}

// PDPA Name Masking Helper (ปกป้องข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล)
// แสดงชื่อจริง และย่อนามสกุล (เช่น "คุณนภาพร ร.***") เพื่อให้ผู้เช่ามั่นใจว่ามีผู้จองจริงโดยไม่ละเมิดความเป็นส่วนตัว
const maskPdpaName = (fullName: string): string => {
  if (!fullName || typeof fullName !== 'string') return 'ผู้เช่าท่านอื่น'
  let clean = fullName.trim()
  // ตัดคำนำหน้าชื่อมาตรฐาน
  clean = clean.replace(/^(นาย|นางสาว|นาง|น\.ส\.|คุณ)\s*/, '')
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ผู้เช่าท่านอื่น'

  const firstName = parts[0]
  if (parts.length > 1) {
    const lastName = parts.slice(1).join(' ')
    const initial = lastName.charAt(0)
    return `คุณ${firstName} ${initial}.***`
  }
  if (firstName.length > 3) {
    return `คุณ${firstName.slice(0, 3)}***`
  }
  return `คุณ${firstName}***`
}

const getTenantNextStep = (booking: any) => {
  if (isQueueBooking(booking)) {
    const qPos = booking.queue_position || booking.queue_number || 1
    if (booking.status === 'approved') {
      return 'เข้าชมแผงตามนัด • หากเข้าชมแล้ว กรุณารอผลจากผู้จองคิวหลัก (หากคิวหลักสละสิทธิ์ เจ้าหน้าที่จะติดต่อคุณทันที)'
    }
    return `คิวสำรองที่ ${qPos} • รอเจ้าหน้าที่อนุมัติวันและเวลานัดชมแผง`
  }

  switch (booking?.status) {
    case 'pending':
    case 'pending_approval':
      return 'รอเจ้าหน้าที่ตรวจสอบวันและเวลา — ยังไม่ต้องดำเนินการ'
    case 'pending_slot':
      return 'ถึงคิวของคุณแล้ว! กรุณาเลือกวันและเวลานัดชมแผงภายใน 3 วัน'
    case 'approved':
      return `เตรียมไปชมแผง ${formatThaiVisitDate(booking.visit_date)} เวลา ${booking.visit_time_slot || 'ตามเวลาที่นัดหมาย'}`
    case 'interested':
      return 'ยื่นคำร้องขอเช่าแผงนี้'
    case 'lease_applied':
    case 'completed':
      return booking.application_number
        ? `ติดตามผลคำร้อง ${booking.application_number}`
        : 'รอเจ้าหน้าที่พิจารณาคำร้อง'
    case 'rejected':
      return booking.rejection_reason
        ? `เจ้าหน้าที่ยกเลิก — เหตุผล: ${booking.rejection_reason}`
        : 'เจ้าหน้าที่ยกเลิกนัดหมาย — สิทธิ์การจองถูกปล่อยคืนสู่ระบบ'
    case 'cancelled':
      return booking.not_interested_reason || booking.rejection_reason
        ? `ยกเลิกการจองแล้ว (${booking.not_interested_reason || booking.rejection_reason})`
        : 'ผู้เช่ายกเลิกการจอง — สิทธิ์การจองถูกปล่อยคืนสู่ระบบแล้ว'
    case 'not_interested':
      return 'ผู้เช่าสละสิทธิ์ไม่ยื่นคำร้อง — สิทธิ์ถูกปล่อยให้รายอื่น'
    case 'no_show':
      return 'ไม่มาตามเวลานัดหมาย — ระบบยกเลิกสิทธิ์แล้ว'
    case 'terminated':
      return 'สัญญาเช่าสิ้นสุดแล้ว — แผงค้าถูกปล่อยคืนสู่ระบบ'
    default:
      return getStatusDescription(booking?.status)
  }
}

const getCancellationLead = (b: any) => {
  if (b?.status === 'rejected') return 'เจ้าหน้าที่ยกเลิก'
  if (b?.status === 'not_interested') return 'สละสิทธิ์'
  if (b?.status === 'no_show') return 'ไม่มาตามนัด'
  if (b?.status === 'terminated') return 'สิ้นสุดสัญญาเช่า'
  return 'ยกเลิกการจองแล้ว'
}

const getCancellationExplanation = (b: any) => {
  if (b?.rejection_reason) return `เหตุผล: ${b.rejection_reason}`
  if (b?.not_interested_reason) return `เหตุผล: ${b.not_interested_reason}`
  if (b?.status === 'rejected') return 'เจ้าหน้าที่ยกเลิกนัดหมายดูแผง สิทธิ์การจองถูกปล่อยคืนสู่ระบบแล้ว'
  if (b?.status === 'not_interested') return 'ผู้เช่าสละสิทธิ์ไม่ยื่นคำร้อง สิทธิ์การจองถูกปล่อยให้ผู้ค้ารายอื่น'
  if (b?.status === 'no_show') return 'ไม่พบผู้เช่าในวันและเวลาที่นัดหมาย ระบบปล่อยสิทธิ์คืนสู่ระบบ'
  if (b?.status === 'terminated') return 'สัญญาเช่าแผงค้านี้สิ้นสุดแล้ว แผงค้าถูกปล่อยคืนสู่ระบบ'
  return 'ผู้เช่ายกเลิกการจองแผงนี้แล้ว สิทธิ์การจองถูกปล่อยคืนสู่ระบบ'
}

const getTenantNextStepLabel = (status: string) => {
  if (['approved', 'interested', 'pending_slot'].includes(status)) return 'สิ่งที่ต้องทำ'
  if (['cancelled', 'rejected', 'not_interested', 'no_show', 'terminated'].includes(status)) return 'สถานะรายการ'
  if (['pending', 'pending_approval', 'waiting_queue'].includes(status)) return 'สถานะตอนนี้'
  return 'ขั้นตอนถัดไป'
}

const getTenantNextStepTone = (status: string) => {
  if (['interested', 'pending_slot'].includes(status)) return 'tone-action'
  if (['approved'].includes(status)) return 'tone-success'
  if (['cancelled', 'rejected', 'not_interested', 'no_show', 'terminated'].includes(status)) return 'tone-muted'
  return 'tone-waiting'
}

const getOfficerNextStepLabel = (bookingOrStatus: any) => {
  const isObj = bookingOrStatus && typeof bookingOrStatus === 'object'
  const status = isObj ? bookingOrStatus.status : bookingOrStatus
  if (isObj && isQueueBooking(bookingOrStatus)) {
    if (status === 'approved') return 'สถานะคิวสำรอง'
    if (['pending_approval', 'pending'].includes(status)) return 'การดำเนินการ (คิวสำรอง)'
  }
  if (['pending_approval', 'pending', 'pending_slot'].includes(status)) return 'การดำเนินการ'
  if (['approved'].includes(status)) return 'กำหนดนัดหมาย'
  if (['interested'].includes(status)) return 'สถานะผู้เช่า'
  if (['waiting_queue'].includes(status)) return 'สถานะคิว'
  if (['lease_applied', 'completed'].includes(status)) return 'ความคืบหน้า'
  return 'สถานะรายการ'
}

const getOfficerNextStepText = (b: any) => {
  if (isQueueBooking(b)) {
    const qPos = b.queue_position || b.queue_number || 1
    if (b.status === 'approved') {
      return `คิวสำรองที่ ${qPos} • รอผลจากผู้จองหลัก (ปุ่มยืนยันการเช่าจะเปิดให้กดเมื่อผู้จองหลักสละสิทธิ์)`
    }
    return `คิวสำรองที่ ${qPos} • รอเจ้าหน้าที่กดอนุมัติวันเวลานัดชมแผง`
  }

  switch (b?.status) {
    case 'pending':
    case 'pending_approval':
      return 'รอเจ้าหน้าที่พิจารณาอนุมัติวันเวลานัดชมแผง'
    case 'pending_slot':
      return 'เลื่อนจากคิวสำรองที่ 1 — รอผู้เช่าเลือกวันและเวลานัดชมแผง'
    case 'approved':
      return `นัดชมแผง: ${formatThaiVisitDate(b.visit_date, b)} (${getVisitTimeSlot(b)})`
    case 'interested':
      return 'พาชมแผงเรียบร้อย — รอผู้เช่ายื่นคำร้องขอเช่าแผง'
    case 'lease_applied':
    case 'completed':
      return b.application_number ? `ผู้เช่ายื่นคำร้องแล้ว (เลขที่ ${b.application_number})` : 'ผู้เช่ายื่นคำร้องขอเช่าแล้ว'
    case 'rejected':
      return b.rejection_reason ? `เจ้าหน้าที่ยกเลิก — เหตุผล: ${b.rejection_reason}` : 'เจ้าหน้าที่ยกเลิกนัดหมาย'
    case 'cancelled':
      return b.not_interested_reason || b.rejection_reason
        ? `ยกเลิกแล้ว (${b.not_interested_reason || b.rejection_reason})`
        : 'ผู้เช่ายกเลิกการจอง — สิทธิ์ปล่อยคืนสู่ระบบ'
    case 'not_interested':
      return 'ผู้เช่าสละสิทธิ์ไม่ยื่นคำร้อง'
    case 'no_show':
      return 'ผู้เช่าไม่มาตามเวลานัดหมาย'
    case 'terminated':
      return 'สิ้นสุดสัญญาเช่า — แผงค้าถูกปล่อยคืนสู่ระบบ'
    default:
      return getStatusDescription(b?.status)
  }
}

const getTenantCuePillClass = (status: string) => {
  switch (status) {
    case 'approved':
      return 'cue-approved'
    case 'interested':
    case 'pending_slot':
      return 'cue-ready'
    case 'lease_applied':
    case 'completed':
      return 'cue-applied'
    case 'pending':
    case 'pending_approval':
    case 'waiting_queue':
      return 'cue-pending'
    case 'cancelled':
    case 'rejected':
    case 'not_interested':
    case 'no_show':
    case 'terminated':
    default:
      return 'cue-muted'
  }
}

// Status Badges & Descriptions
const getStatusBadgeLabel = (status: string) => {
  switch (status) {
    case 'pending_approval':
    case 'pending': return 'รอเจ้าหน้าที่อนุมัติ'
    case 'pending_slot': return 'รอเลือกวันนัดชม'
    case 'approved': return 'นัดหมายสำเร็จ'
    case 'interested': return 'รอผู้เช่ายื่นคำร้อง'
    case 'waiting_queue': return 'รอคิว'
    case 'lease_applied':
    case 'completed': return 'ยื่นคำร้องสำเร็จ'
    case 'rejected':
    case 'cancelled': return 'ยกเลิก'
    case 'not_interested': return 'สละสิทธิ์'
    case 'no_show': return 'ไม่มาตามนัด (ยกเลิก)'
    case 'terminated': return 'สิ้นสุดสัญญาเช่า'
    default: return 'นัดหมายสำเร็จ'
  }
}

const getStatusPillClass = (status: string) => {
  switch (status) {
    case 'lease_applied':
    case 'completed': return 'pill-purple'
    case 'approved': return 'pill-green'
    case 'interested': return 'pill-blue'
    case 'pending_approval':
    case 'pending':
    case 'pending_slot': return 'pill-amber'
    case 'waiting_queue': return 'pill-sky'
    case 'cancelled':
    case 'rejected':
    case 'no_show':
    case 'not_interested':
    case 'terminated': return 'pill-gray'
    default: return 'pill-purple'
  }
}

const getCardBorderClass = (status: string) => {
  switch (status) {
    case 'pending_approval':
    case 'pending':
    case 'pending_slot':
      return 'border-status-pending'
    case 'waiting_queue':
      return 'border-status-waiting'
    case 'approved':
      return 'border-status-approved'
    case 'interested':
      return 'border-status-ready'
    case 'lease_applied':
    case 'completed':
      return 'border-status-applied'
    case 'rejected':
    case 'cancelled':
    case 'no_show':
    case 'not_interested':
    case 'terminated':
      return 'border-status-muted'
    default:
      return ''
  }
}

const getStatusDescription = (status: string) => {
  switch (status) {
    case 'rejected':
    case 'cancelled': return 'รายการจองถูกยกเลิกแล้ว'
    case 'not_interested': return 'ผู้ขอจองสละสิทธิ์ไม่สนใจเช่า'
    case 'no_show': return 'ผู้ขอจองไม่มาตามนัดหมาย ระบบสละสิทธิ์ให้คิวถัดไป'
    case 'terminated': return 'สัญญาเช่าสิ้นสุดแล้ว แผงค้าถูกปล่อยคืนสู่ระบบ'
    case 'completed': return 'กระบวนการจองและทำสัญญาเสร็จสมบูรณ์'
    default: return 'ติดตามสถานะการจองได้จากระบบ'
  }
}

// Single-Stall per Booking Rule (1 การจอง = 1 แผง = 1 การ์ด)
const getAppointmentRoundSiblings = (b: any): any[] => {
  if (!b) return []
  return [b]
}

const getAppointmentRoundStallSummary = (b: any): string => {
  return b?.stall_number || '-'
}

// Action Handlers
const openApproveModal = (b: any) => {
  targetBooking.value = b
  approveMeetingPoint.value = b.meeting_point || 'หน้ากองอำนวยการตลาด เสาธง 1'
  approveEscortOfficer.value = 'นายธนากร สมบูรณ์ (เจ้าหน้าที่เวรนำชมแผง)'
  officerNotes.value = 'อนุมัตินัดหมาย ให้เตรียมบัตรประชาชนมาแสดงก่อนเข้าชม'
  showApproveModal.value = true
}

const confirmApprove = async () => {
  if (!targetBooking.value) return
  const subList = Array.isArray(targetBooking.value.sub_bookings) && targetBooking.value.sub_bookings.length > 0
    ? targetBooking.value.sub_bookings
    : [targetBooking.value]
  try {
    for (const item of subList) {
      await post(`/bookings/${item.id}/approve`, {
        meeting_point: approveMeetingPoint.value,
        escort_officer: approveEscortOfficer.value,
        officer_notes: officerNotes.value
      })
    }
    showApproveModal.value = false
    await loadBookings()
    await showSuccess('อนุมัตินัดหมายการเข้าชมเรียบร้อยแล้ว', 'อนุมัติสำเร็จ')
  } catch (err: any) {
    await showError(err?.data?.detail || 'เกิดข้อผิดพลาดในการอนุมัติ', 'ข้อผิดพลาด')
  }
}

const openRejectModal = (b: any) => {
  targetBooking.value = b
  rejectionReasonText.value = ''
  showRejectModal.value = true
}

const confirmReject = async () => {
  if (!targetBooking.value) return
  const subList = Array.isArray(targetBooking.value.sub_bookings) && targetBooking.value.sub_bookings.length > 0
    ? targetBooking.value.sub_bookings
    : [targetBooking.value]
  try {
    for (const item of subList) {
      await post(`/bookings/${item.id}/reject`, {
        rejection_reason: rejectReasonDropdown.value,
        officer_notes: rejectionReasonText.value
      })
    }
    showRejectModal.value = false
    await loadBookings()
    await showSuccess('ปฏิเสธการนัดหมายและเลื่อนลำดับคิวเรียบร้อย', 'สำเร็จ')
  } catch (err: any) {
    await showError(err?.data?.detail || 'เกิดข้อผิดพลาด', 'ข้อผิดพลาด')
  }
}

const handleMarkVisited = async (b: any) => {
  const subList = Array.isArray(b.sub_bookings) && b.sub_bookings.length > 0 ? b.sub_bookings : [b]
  const confirmed = await showConfirm(
    `ยืนยันว่าคุณ ${b.tenant_name} เข้าชมแผง ${b.stall_number} เรียบร้อยแล้วใช่หรือไม่?\n(ระบบจะเปลี่ยนสถานะเป็น "รอผู้เช่ายื่นคำร้อง" เพื่อให้ผู้เช่ายื่นคำร้องขอเช่าแผงนี้ได้ทันที)`,
    {
      title: 'ยืนยันการเช่า',
      type: 'info',
      confirmText: 'ยืนยันการเช่า',
      cancelText: 'ยกเลิก'
    }
  )
  if (confirmed) {
    try {
      for (const item of subList) {
        await post(`/bookings/${item.id}/mark-visited`, {
          officer_notes: 'เจ้าหน้าที่ยืนยันการเช่าเรียบร้อย รอผู้เช่ายื่นคำร้อง'
        })
      }
      if (showDetailsModal.value) {
        showDetailsModal.value = false
      }
      await loadBookings()
      await showSuccess('ยืนยันการเช่าเรียบร้อยแล้ว สถานะเปลี่ยนเป็น "รอผู้เช่ายื่นคำร้อง"', 'สำเร็จ')
    } catch (err: any) {
      await showError(err?.data?.detail || 'เกิดข้อผิดพลาด', 'ข้อผิดพลาด')
    }
  }
}

const handleOfficerCancel = async (b: any) => {
  const isQueue = isQueueBooking(b)
  const isInterested = b.status === 'interested'
  const subList = Array.isArray(b.sub_bookings) && b.sub_bookings.length > 0 ? b.sub_bookings : [b]
  const title = isQueue ? 'ยืนยันยกเลิกการต่อคิว' : isInterested ? 'ยืนยันยกเลิกการจอง' : 'ยืนยันยกเลิกนัดหมาย'
  const message = isQueue
    ? `คุณต้องการ "ยกเลิกการต่อคิว" ของคุณ ${b.tenant_name} (แผง ${b.stall_number} คิวสำรองที่ ${b.queue_position || b.queue_number || 1}) ใช่หรือไม่?\n(ระบบจะนำชื่อออกจากคิวและปรับลำดับคิวข้างหลังขึ้นมาแทน)`
    : isInterested
      ? `คุณต้องการยกเลิกการจอง / บันทึกการสละสิทธิ์ของคุณ ${b.tenant_name} (แผง ${b.stall_number}) ใช่หรือไม่?\n(ระบบจะปล่อยสิทธิ์แผงค้าและปรับลำดับคิวให้คิวถัดไปทันที)`
      : `คุณต้องการ "ยกเลิกนัดหมาย" ของคุณ ${b.tenant_name} (แผง ${b.stall_number}) ใช่หรือไม่?\n(ระบบจะบันทึกยกเลิกและปล่อยสิทธิ์ให้คิวถัดไป)`

  const confirmed = await showConfirm(message, {
    title,
    type: 'warning',
    confirmText: 'ยืนยันยกเลิก',
    cancelText: 'ย้อนกลับ'
  })
  if (confirmed) {
    try {
      for (const item of subList) {
        await post(`/bookings/${item.id}/cancel`, {
          reason: isQueue
            ? 'เจ้าหน้าที่ยกเลิกการต่อคิวตามคำขอของผู้เช่า'
            : isInterested
              ? 'เจ้าหน้าที่บันทึกยกเลิกสิทธิ์ / ผู้เช่าแจ้งสละสิทธิ์ไม่ยื่นคำร้อง'
              : 'เจ้าหน้าที่ยกเลิกการนัดหมาย / ผู้เช่าไม่มาตามนัด',
          by_officer: true
        })
      }
      if (showDetailsModal.value) {
        showDetailsModal.value = false
      }
      if (showStallQueueModal.value) {
        const remaining = getStallBookings(selectedStallNumber.value)
        if (remaining.length === 0) {
          showStallQueueModal.value = false
        }
      }
      await loadBookings()
      await showSuccess(
        isQueue
          ? 'ยกเลิกการต่อคิวและปรับลำดับคิวเรียบร้อยแล้ว'
          : isInterested
            ? 'ยกเลิกสิทธิ์และปล่อยแผงค้าคืนสู่ระบบเรียบร้อยแล้ว'
            : 'ยกเลิกนัดหมายและปรับลำดับคิวเรียบร้อยแล้ว',
        'สำเร็จ'
      )
    } catch (err: any) {
      await showError(err?.data?.detail || 'เกิดข้อผิดพลาดในการยกเลิก', 'ข้อผิดพลาด')
    }
  }
}

const handleCancelSingleStallBooking = async (subBooking: any, reason: string) => {
  const confirmed = await showConfirm(
    `คุณต้องการยกเลิก/สละสิทธิ์เฉพาะแผง ${subBooking.stall_number} ใช่หรือไม่?\n(ระบบจะปล่อยสิทธิ์เฉพาะแผง ${subBooking.stall_number} ให้คิวถัดไป ส่วนแผงอื่นในนัดหมายนี้ยังคงอยู่ตามปกติ)`,
    {
      title: `ยืนยันสละสิทธิ์แผง ${subBooking.stall_number}`,
      type: 'warning',
      confirmText: 'ยืนยันเฉพาะแผงนี้',
      cancelText: 'ย้อนกลับ'
    }
  )
  if (confirmed) {
    try {
      await post(`/bookings/${subBooking.id}/cancel`, {
        reason,
        by_officer: currentRole.value === 'officer'
      })
      await loadBookings()
      await showSuccess(`สละสิทธิ์เฉพาะแผง ${subBooking.stall_number} เรียบร้อยแล้ว`, 'สำเร็จ')
    } catch (err: any) {
      await showError(err?.data?.detail || 'เกิดข้อผิดพลาด', 'ข้อผิดพลาด')
    }
  }
}

const handleCancelBooking = async (b: any, reason: string) => {
  const isQueue = isQueueBooking(b)
  const subList = Array.isArray(b.sub_bookings) && b.sub_bookings.length > 0 ? b.sub_bookings : [b]
  const isMultiStall = subList.length > 1
  const confirmed = await showConfirm(
    isQueue
      ? `คุณต้องการสละสิทธิ์การต่อคิวแผง ${b.stall_number} (คิวสำรองที่ ${b.queue_position || b.queue_number || 1}) หรือไม่?\n(หากสละสิทธิ์ คิวจะถูกปล่อยและไม่สามารถกู้คืนได้)`
      : isMultiStall
        ? `คุณต้องการยกเลิกนัดหมายรหัส ${formatBookingNumber(b.booking_number)} ทั้งหมด ${subList.length} แผง (${b.stall_number}) หรือไม่?\n(หากต้องการสละสิทธิ์เฉพาะบางแผง สามารถกดปุ่มสละสิทธิ์แยกรายแผงในการ์ดได้)`
        : `คุณต้องการยกเลิกรายการนี้หรือไม่? ${b.holding_stall ? '(หากยกเลิก แผงจะถูกส่งต่อให้คิวถัดไปทันที)' : ''}`,
    {
      title: isQueue ? 'ยืนยันสละสิทธิ์คิวสำรอง' : isMultiStall ? `ยืนยันยกเลิกนัดหมาย (${subList.length} แผง)` : 'ยืนยันยกเลิกการจอง',
      type: 'warning',
      confirmText: isQueue ? 'ยืนยันสละสิทธิ์' : 'ยืนยันยกเลิก',
      cancelText: 'ย้อนกลับ'
    }
  )
  if (confirmed) {
    try {
      for (const item of subList) {
        await post(`/bookings/${item.id}/cancel`, {
          reason,
          by_officer: currentRole.value === 'officer'
        })
      }
      await loadBookings()
      await showSuccess('ยกเลิกรายการเรียบร้อยแล้ว', 'สำเร็จ')
    } catch (err: any) {
      await showError(err?.data?.detail || 'เกิดข้อผิดพลาด', 'ข้อผิดพลาด')
    }
  }
}

const onDetailsCancel = (b: any) => {
  showDetailsModal.value = false
  if (currentRole.value === 'officer') {
    handleOfficerCancel(b)
  } else {
    handleCancelBooking(b, 'ผู้เช่าขอยกเลิกการจอง')
  }
}

const openBookingDetails = (b: any) => {
  if (!b?.id) return
  saveBookingReturnContext(b)
  router.push({
    path: `/bookings/${encodeURIComponent(String(b.id))}`,
    query: { role: currentRole.value }
  })
}

const onDetailsApprove = (b: any) => {
  showDetailsModal.value = false
  openApproveModal(b)
}

const onDetailsReject = (b: any) => {
  showDetailsModal.value = false
  openRejectModal(b)
}

const openLeaseApplication = (b: any) => {
  targetBooking.value = b
  showLeaseModal.value = true
}

const onApplicationSubmitted = async () => {
  await loadBookings()
  if (targetBooking.value) {
    targetBooking.value = bookings.value.find(b => b.id === targetBooking.value?.id) || targetBooking.value
  }
}

const handleCloseLeaseModal = async () => {
  showLeaseModal.value = false
  await loadBookings()
}

const openSelectSlotModal = (b: any) => {
  targetBooking.value = b
  const existingIso = normalizeVisitDateToIso(b?.visit_date)
  const openDates = modalAvailableDates.value.filter(d => !d.isClosed && !d.isAllFull)
  if (existingIso && openDates.some(d => d.date === existingIso)) {
    slotDate.value = existingIso
  } else if (openDates.length > 0) {
    slotDate.value = openDates[0].date
  }
  const availableSlotsForDate = slotTimeOptions.value
  if (b?.visit_time_slot && availableSlotsForDate.some(o => o.value === b.visit_time_slot)) {
    slotTime.value = b.visit_time_slot
  } else if (availableSlotsForDate.length > 0) {
    slotTime.value = availableSlotsForDate[0].value
  }
  showSelectSlotModal.value = true
}

const confirmSelectSlot = async () => {
  if (!targetBooking.value) return
  const subList = Array.isArray(targetBooking.value.sub_bookings) && targetBooking.value.sub_bookings.length > 0
    ? targetBooking.value.sub_bookings
    : [targetBooking.value]
  try {
    for (const item of subList) {
      await post(`/bookings/${item.id}/select-slot`, {
        visit_date: slotDate.value,
        visit_time_slot: slotTime.value
      })
    }
    showSelectSlotModal.value = false
    await loadBookings()
    await showSuccess('บันทึกวันนัดหมายใหม่เรียบร้อยแล้ว', 'สำเร็จ')
  } catch (err: any) {
    await showError(err?.data?.detail || 'เกิดข้อผิดพลาด', 'ข้อผิดพลาด')
  }
}

const { resetTestData } = useResetTestData()

const handleClearAllData = async () => {
  await resetTestData(async () => {
    await loadBookings()
  })
}

watch(
  () => (authRole && (authRole as any).value !== undefined ? (authRole as any).value : authRole),
  (newRole) => {
    if (newRole === 'admin' || newRole === 'staff') {
      currentRole.value = 'officer'
    } else {
      currentRole.value = 'tenant'
    }
  },
  { immediate: true }
)

const saveBookingReturnContext = (b: any) => {
  if (!process.client) return

  const sourceCard = document.querySelector<HTMLElement>(`[data-booking-id="${CSS.escape(String(b.id))}"]`)

  sessionStorage.setItem(bookingReturnStorageKey, JSON.stringify({
    bookingId: String(b.id),
    savedAt: Date.now(),
    scrollY: window.scrollY,
    cardViewportTop: sourceCard?.getBoundingClientRect().top ?? null,
    role: currentRole.value,
    tenant: {
      statusTab: tenantStatusTab.value,
      subFilter: tenantSubFilter.value,
      viewMode: tenantViewMode.value,
      sortOrder: tenantSortOrder.value,
      search: tenantSearchQuery.value,
      selectedMarket: tenantSelectedMarket.value,
      actionFilter: tenantActionFilter.value,
      visitTimeFilter: tenantVisitTimeFilter.value,
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value,
      openMarkets: openMarkets.value,
      expandedCards: expandedCardIds.value
    },
    officer: {
      selectedMarket: officerSelectedMarket.value,
      activeTab: officerActiveTab.value,
      onlyToday: officerOnlyToday.value,
      viewMode: officerViewMode.value,
      search: officerSearchQuery.value,
      page: officerCurrentPage.value,
      itemsPerPage: officerItemsPerPage.value,
      openProjects: openProjectGroups.value,
      openStalls: openStallGroups.value,
      expandedCards: expandedCardIds.value
    }
  }))
}

const restoreBookingReturnContext = async () => {
  if (!process.client) return

  const rawContext = sessionStorage.getItem(bookingReturnStorageKey)
  if (!rawContext) return
  sessionStorage.removeItem(bookingReturnStorageKey)

  try {
    const context = JSON.parse(rawContext)
    if (!context?.bookingId || Date.now() - Number(context.savedAt || 0) > 30 * 60 * 1000) return
    const expectedRole = (authRole.value === 'admin' || authRole.value === 'staff') ? 'officer' : 'tenant'
    if (context.role && context.role !== expectedRole) return
    const savedTenantPage = Number(context.tenant?.page) || 1
    const savedOfficerPage = Number(context.officer?.page) || 1

    currentRole.value = expectedRole

    if (context.tenant) {
      // Waiting List is represented by the queue-position badge on each card;
      // keep old saved contexts from opening a removed tenant tab.
      tenantStatusTab.value = context.tenant.statusTab === 'waiting' ? 'all' : (context.tenant.statusTab || 'all')
      tenantSubFilter.value = context.tenant.subFilter || 'all'
      tenantViewMode.value = context.tenant.viewMode || 'market'
      tenantSortOrder.value = context.tenant.sortOrder || 'newest'
      tenantSearchQuery.value = context.tenant.search || ''
      tenantSelectedMarket.value = context.tenant.selectedMarket || 'all'
      tenantActionFilter.value = context.tenant.actionFilter || 'all'
      tenantVisitTimeFilter.value = context.tenant.visitTimeFilter || 'all'
      itemsPerPage.value = Number(context.tenant.itemsPerPage) || 10
      currentPage.value = savedTenantPage
      openMarkets.value = { ...(context.tenant.openMarkets || {}) }
      expandedCardIds.value = { ...(context.tenant.expandedCards || {}) }
    }

    if (context.officer) {
      officerSelectedMarket.value = context.officer.selectedMarket || 'all'
      officerActiveTab.value = context.officer.activeTab || 'all'
      officerOnlyToday.value = !!context.officer.onlyToday
      officerViewMode.value = context.officer.viewMode || 'project'
      officerSearchQuery.value = context.officer.search || ''
      officerItemsPerPage.value = Number(context.officer.itemsPerPage) || 10
      officerCurrentPage.value = savedOfficerPage
      openProjectGroups.value = { ...(context.officer.openProjects || {}) }
      openStallGroups.value = { ...(context.officer.openStalls || {}) }
      expandedCardIds.value = { ...expandedCardIds.value, ...(context.officer.expandedCards || {}) }
    }

    // Filter/view watchers reset pagination to page 1. Restore the saved pages
    // after those watchers have settled, then wait for the target card to render.
    await nextTick()
    currentPage.value = savedTenantPage
    officerCurrentPage.value = savedOfficerPage
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

    const target = document.querySelector<HTMLElement>(`[data-booking-id="${CSS.escape(String(context.bookingId))}"]`)
    if (!target) {
      window.scrollTo({ top: Number(context.scrollY) || 0, behavior: 'auto' })
      return
    }

    const hasSavedViewportTop = context.cardViewportTop !== null && context.cardViewportTop !== undefined
    const savedViewportTop = Number(context.cardViewportTop)
    const targetTop = hasSavedViewportTop && Number.isFinite(savedViewportTop)
      ? window.scrollY + target.getBoundingClientRect().top - savedViewportTop
      : Number(context.scrollY) || 0
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'auto' })
  } catch (error) {
    console.warn('Unable to restore booking list position:', error)
  }
}

onMounted(async () => {
  await loadBookings()
  await restoreBookingReturnContext()
  const selectSlotId = String(route.query?.selectSlot || '').trim()
  if (selectSlotId) {
    const target = bookings.value.find(b => String(b.id) === selectSlotId)
    if (target) {
      openSelectSlotModal(target)
    }
  }
})
</script>

<style scoped>
.booking-tracking-page {
  background-color: #f8fafc;
  min-height: 100vh;
  padding-bottom: 60px;
}

.tracking-container {
  padding: 24px 32px 48px;
  flex: 1;
}

/* Page Top Bar & Role Pill */
.page-top-bar {
  margin-bottom: 12px;
}

.top-action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}


/* Page Header Row & Main Title */
.page-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 20px 0;
  gap: 16px;
  flex-wrap: wrap;
}

.page-header-row .main-page-title {
  margin: 0;
}

.main-page-title {
  font-size: 1.55rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.page-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Main White Card Container */
.main-white-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px 28px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

/* Header Row */
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left .section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.header-left .item-count-subtitle {
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 280px;
  height: 38px;
  padding: 0 12px 0 36px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #1e293b;
  background: #ffffff;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.75rem;
  cursor: pointer;
}

.sort-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.sort-toggle-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.sort-toggle-btn:active {
  transform: translateY(1px);
}

.sort-toggle-icon {
  color: #475569;
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.sort-toggle-btn:hover .sort-toggle-icon {
  color: #2563eb;
}

/* Filter Button & Popup Panel (เหมือนหน้าจอง step 1) */
.map-advanced-filter-wrap {
  position: relative;
}

.map-advanced-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 6px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #475569;
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.map-advanced-filter-btn:hover,
.map-advanced-filter-btn.active {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}

.map-advanced-count {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 2px;
}

.filter-backdrop {
  position: fixed;
  inset: 0;
  z-index: 49;
  background: transparent;
}

.map-advanced-filter-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  left: auto;
  z-index: 50;
  width: min(340px, calc(100vw - 48px));
  padding: 18px;
  border: 1px solid #dbe5f2;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.05);
}

.map-filter-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
  color: #0f172a;
  font-size: 0.9rem;
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
  margin-top: 12px;
}

.filter-field-label {
  display: block;
  margin-bottom: 6px;
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

.filter-subfilter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-subchip {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-subchip:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #1e293b;
}

.filter-subchip.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 700;
}



.map-filter-panel-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
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
  height: 36px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-filter-reset:hover:not(:disabled) {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

.btn-filter-reset:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-filter-apply {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid #2563eb;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
}

.btn-filter-apply:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.filter-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-toggle-btn:hover {
  background: #f8fafc;
  color: #2563eb;
  border-color: #cbd5e1;
}

/* Status Tabs Row */
.status-tabs-row {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 24px;
  overflow-x: auto;
}

.tab-item {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 10px 4px 12px 4px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  transition: all 0.2s ease;
  margin-bottom: -1px;
}

.tab-item:hover {
  color: #0f172a;
}

.tab-item.active {
  color: #2563eb;
  font-weight: 700;
  border-bottom-color: #2563eb;
}

.tab-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #64748b;
}

.tab-item.active .tab-badge {
  background: #2563eb;
  color: #ffffff;
}

/* Empty States */
.empty-state-box {
  text-align: center;
  padding: 32px 20px;
  color: #64748b;
}

.empty-state-panel {
  max-width: 620px;
  margin: 0 auto;
}

.officer-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 270px;
  padding: 28px;
}

.officer-empty-state .empty-state-panel {
  padding: 6px 20px;
}

.empty-icon {
  width: 56px;
  height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  color: #2563eb;
  background: #eff6ff;
}

.empty-eyebrow {
  margin-bottom: 6px;
  color: #64748b;
  font-size: 0.8125rem;
  font-weight: 600;
}

.empty-title {
  font-weight: 700;
  color: #0f172a;
  font-size: 1.125rem;
}

.empty-desc {
  font-size: 0.9375rem;
  color: #64748b;
  margin-top: 6px;
  line-height: 1.6;
}

.empty-state-actions {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.empty-state-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 640px) {
  .officer-empty-state {
    min-height: 230px;
    padding: 20px 14px;
  }
}

/* Market Accordions List */
.market-accordions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.market-accordion-card {
  border: 1px solid #eef2f6;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
}

.market-accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #ffffff;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease;
}

.market-accordion-header:hover {
  background: #f8fafc;
}

.header-left-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chevron-indicator {
  color: #64748b;
  transition: transform 0.25s ease;
}

.chevron-indicator.rotated {
  transform: rotate(180deg);
}

.market-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.market-count-pill {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 10px;
  border-radius: 12px;
}

.header-right-content {
  display: flex;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
}

.pulse-dot-sm {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2563eb;
  display: inline-block;
  animation: pulseGlow 1.8s infinite;
}

@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.45);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(37, 99, 235, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
  }
}

/* Accordion Body */
.market-accordion-body {
  padding: 14px 18px 18px 18px;
  background: #f8fafc;
  border-top: 1px solid #eef2f6;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tenant-flat-cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Booking Item Card */
.booking-item-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #cbd5e1;
  border-radius: 12px;
  padding: 20px 22px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.booking-item-card:hover {
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.booking-item-card.border-status-pending {
  border-left: 4px solid #f59e0b;
}

.booking-item-card.border-status-waiting {
  border-left: 4px solid #0284c7;
}

.booking-item-card.border-status-approved {
  border-left: 4px solid #10b981;
}

.booking-item-card.border-status-ready {
  border-left: 4px solid #2563eb;
}

.booking-item-card.border-status-applied {
  border-left: 4px solid #8b5cf6;
}

.booking-item-card.border-status-muted {
  border-left: 4px solid #94a3b8;
}

@keyframes cardFlashGlow {
  0% {
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.4);
    transform: translateY(-2px);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
  }
  100% {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    transform: translateY(0);
  }
}

.booking-item-card.flash-highlight {
  animation: cardFlashGlow 1.8s ease-out;
}

.booking-item-card.is-latest-card {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.in-card-stall-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.04);
}

.in-card-stall-pill svg {
  color: #3b82f6;
  flex-shrink: 0;
}

.in-card-stall-pill .stall-label {
  color: #2563eb;
  font-weight: 500;
  font-size: 0.76rem;
}

.in-card-stall-pill strong {
  color: #1e3a8a;
  font-weight: 800;
}

.in-card-project-pill,
.in-card-market-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  background: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.in-card-project-pill svg,
.in-card-market-pill svg {
  color: #64748b;
  flex-shrink: 0;
}

.in-card-project-pill .project-label,
.in-card-market-pill .market-label {
  color: #64748b;
  font-weight: 500;
  font-size: 0.76rem;
}

.in-card-project-pill strong,
.in-card-market-pill strong {
  color: #1e293b;
  font-weight: 700;
}

.latest-ribbon-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  box-sizing: border-box;
  height: 24px;
  padding: 0 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  border-radius: 9999px;
  letter-spacing: -0.01em;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.06);
  user-select: none;
}

.latest-ribbon-badge .pulse-dot-sm {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #2563eb;
  animation: pulseGlow 1.8s infinite;
  flex-shrink: 0;
}

/* Card Top Row */
.card-top-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-top-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.card-meta-tags-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.compact-officer-meta,
.compact-tenant-meta {
  gap: 12px;
  color: #64748b;
}

.compact-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 0.8rem;
  line-height: 1.35;
  white-space: nowrap;
}

.compact-meta-item + .compact-meta-item {
  padding-left: 12px;
  border-left: 1px solid #e2e8f0;
}

.compact-meta-item svg {
  flex-shrink: 0;
  color: #94a3b8;
}

.compact-meta-item strong {
  color: #334155;
  font-weight: 650;
}

.compact-meta-stall strong {
  color: #1d4ed8;
}

.compact-meta-item a {
  color: #64748b;
  text-decoration: none;
}

.compact-meta-item a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.collapsed-next-step {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  padding-top: 11px;
  border-top: 1px solid #f1f5f9;
  color: #475569;
  font-size: 0.8125rem;
  line-height: 1.45;
}

.collapsed-next-step-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.8125rem;
  line-height: 1.45;
}

.btn-collapsed-details {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-collapsed-details:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.collapsed-actions-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-collapsed-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: #2563eb;
  border: 1px solid #2563eb;
  border-radius: 8px;
  font-size: 0.83rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
}

.btn-collapsed-primary:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: #ffffff;
}

.btn-collapsed-danger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: #ffffff;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-collapsed-danger:hover {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #b91c1c;
}

.btn-collapsed-purple {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: #8b5cf6;
  border: 1px solid #8b5cf6;
  border-radius: 8px;
  font-size: 0.83rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(139, 92, 246, 0.2);
}

.btn-collapsed-purple:hover {
  background: #7c3aed;
  border-color: #7c3aed;
  color: #ffffff;
}

.btn-collapsed-success {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: #10b981;
  border: 1px solid #10b981;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(16, 185, 129, 0.2);
}

.btn-collapsed-success:hover {
  background: #059669;
  border-color: #059669;
  color: #ffffff;
}

.btn-collapsed-ghost-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #2563eb;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-collapsed-ghost-action:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.btn-purple-prominent {
  background: #8b5cf6;
  color: #ffffff;
  border: 1px solid #8b5cf6;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 0.83rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 6px rgba(139, 92, 246, 0.28);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-purple-prominent:hover {
  background: #7c3aed;
  border-color: #7c3aed;
  box-shadow: 0 4px 10px rgba(139, 92, 246, 0.35);
  transform: translateY(-1px);
}

.collapsed-next-step-content::before {
  content: '';
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}

.collapsed-next-step-label {
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
}

.collapsed-next-step strong,
.collapsed-next-step-content strong,
.footer-left-status strong {
  color: inherit;
  font-weight: 600;
}

.collapsed-next-step.tone-waiting,
.footer-left-status.tone-waiting { color: #d97706; }
.collapsed-next-step.tone-success,
.footer-left-status.tone-success { color: #15803d; }
.collapsed-next-step.tone-action,
.footer-left-status.tone-action { color: #2563eb; }
.collapsed-next-step.tone-muted,
.footer-left-status.tone-muted { color: #64748b; }

.top-row-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.circle-status-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.circle-status-icon.blue-circle {
  background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
  color: #2563eb;
  border: 1px solid #bfdbfe;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.08);
}

.booking-number-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.booking-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;
}

.booking-number-block .booking-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.2;
}

.booking-number-block .booking-id-text {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.tenant-booked-at,
.officer-booked-at {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  color: #94a3b8;
  font-size: 0.76rem;
  font-weight: 500;
  line-height: 1.3;
}

.tenant-booked-at svg,
.officer-booked-at svg {
  flex-shrink: 0;
}


.collapsed-visit-cue {
  margin-left: 8px;
  font-weight: 500;
  color: #475569;
  font-size: 0.8rem;
}

.top-row-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}

.status-pill-badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border: none;
}

.pill-green {
  background: #dcfce7;
  color: #15803d;
  border: none;
}

.pill-amber {
  background: #fef3c7;
  color: #d97706;
  border: none;
}

.pill-blue {
  background: #eff6ff;
  color: #2563eb;
  border: none;
}

.pill-purple {
  background: #f5f3ff;
  color: #7c3aed;
  border: none;
}

.pill-sky {
  background: #f0f9ff;
  color: #0284c7;
  border: none;
}

.pill-gray {
  background: #f1f5f9;
  color: #64748b;
  border: none;
}

.card-collapse-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-chevron {
  transition: transform 0.2s ease;
}

.card-chevron.rotated {
  transform: rotate(180deg);
}

/* 3-Phase Stepper Container */
.booking-stepper-container {
  margin: 18px 0 16px 0;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}

.stepper-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  max-width: 680px;
  margin: 0 auto;
}

.stepper-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 2;
  position: relative;
}

.step-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.step-label-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.stepper-step.completed .step-circle {
  background: #10b981;
  color: #ffffff;
}

.stepper-step.completed .step-label-text {
  color: #0f172a;
}

.stepper-step.active .step-circle {
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.stepper-step.active .step-label-text {
  color: #2563eb;
  font-weight: 700;
}

.stepper-connector {
  flex: 1;
  height: 3px;
  background: #e2e8f0;
  margin: -18px 8px 0 8px;
  z-index: 1;
  transition: background 0.25s ease;
}

.stepper-connector.filled {
  background: #10b981;
}

/* Info Columns & Tiles */
.info-columns-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr;
  gap: 16px;
  padding: 14px 0 8px 0;
  border-top: 1px solid #f1f5f9;
}

.tenant-columns-grid {
  grid-template-columns: 1.25fr 1.15fr 1fr 1.35fr;
  gap: 16px;
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.officer-columns-grid {
  grid-template-columns: 1.25fr 1.15fr 1fr 1.35fr;
}

@media (max-width: 900px) {
  .info-columns-grid,
  .officer-columns-grid,
  .tenant-columns-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 580px) {
  .info-columns-grid,
  .officer-columns-grid,
  .tenant-columns-grid {
    grid-template-columns: 1fr;
  }
}

.info-tile {
  background: #f8fafc;
  border: 1px solid #eef2f6;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.15s ease;
}

.info-tile:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.74rem;
  color: #64748b;
  font-weight: 500;
}

.info-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.info-value-text {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
}

.days-remaining-pill {
  font-size: 0.78rem;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #dbeafe;
}

.stall-count-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e293b;
  background: #f8fafc;
  padding: 3px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stall-count-badge {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1d4ed8;
  background: #dbeafe;
  padding: 1px 7px;
  border-radius: 6px;
  white-space: nowrap;
}

.tile-sub-text {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 2px;
}

.tile-sub-price {
  font-size: 0.82rem;
  font-weight: 700;
  color: #059669;
  margin-top: 2px;
}

/* Card Footer Row */
.card-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  margin-top: 10px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-left-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  line-height: 1.45;
}

/* Action Cue Pill (กะทัดรัด สื่อสถานะชัด ไม่ใช้ตัวหนังสือยาว) */
.action-cue-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  line-height: 1.3;
}

.cue-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cue-lead {
  font-weight: 700;
}

.cue-separator {
  opacity: 0.45;
}

.cue-text {
  font-weight: 500;
}

.cue-pending {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fef3c7;
}
.cue-pending .cue-dot {
  background: #f59e0b;
}

.cue-approved {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #dcfce7;
}
.cue-approved .cue-dot {
  background: #10b981;
}

.cue-ready {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #dbeafe;
}
.cue-ready .cue-dot {
  background: #2563eb;
}

.cue-applied {
  background: #f5f3ff;
  color: #6d28d9;
  border: 1px solid #ede9fe;
}
.cue-applied .cue-dot {
  background: #8b5cf6;
}

.cue-muted {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.cue-muted .cue-dot {
  background: #94a3b8;
}

.status-hint-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
  line-height: 1.4;
}

.status-hint-chip.hint-pending {
  background: #fef3c7;
  color: #b45309;
}

.status-hint-chip.hint-approved {
  background: #eff6ff;
  color: #1d4ed8;
}

.status-hint-chip.hint-ready {
  background: #ecfdf5;
  color: #047857;
  font-weight: 600;
}

.status-hint-chip.hint-info {
  background: #f0fdf4;
  color: #15803d;
}

.status-hint-chip.hint-warning {
  background: #fffbeb;
  color: #d97706;
}

.status-hint-chip.hint-muted {
  background: #f1f5f9;
  color: #64748b;
}

.status-hint-chip.hint-default {
  background: #f8fafc;
  color: #475569;
}

/* Footer Right Actions with High Visual Hierarchy */
.footer-right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-primary-prominent {
  background: #2563eb;
  color: #ffffff;
  border: 1px solid #2563eb;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 0.83rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.28);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary-prominent:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
  transform: translateY(-1px);
}

.btn-success-prominent {
  background: #059669;
  color: #ffffff;
  border: 1px solid #059669;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 0.83rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.28);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-success-prominent:hover {
  background: #047857;
  border-color: #047857;
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.35);
  transform: translateY(-1px);
}

.btn-action-ghost {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}

.btn-action-ghost:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #94a3b8;
}

.btn-action-danger-ghost {
  background: #ffffff;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-action-danger-ghost:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

.btn-pulse-blue {
  animation: pulseBlue 2.2s infinite;
}

@keyframes pulseBlue {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(37, 99, 235, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
  }
}

.btn-details-arrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-details-arrow:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #94a3b8;
}

/* Pagination Footer Row */
.pagination-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 22px;
  margin-top: 24px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #64748b;
}

.page-select-dropdown {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.85rem;
  font-weight: 600;
  outline: none;
}

.pagination-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-nav-btn,
.page-num-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-nav-btn:hover:not(:disabled),
.page-num-btn:hover:not(.active):not(:disabled) {
  background: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
}

.page-num-btn.active {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  font-weight: 700;
}

.page-nav-btn:disabled,
.page-num-btn.ellipsis {
  opacity: 0.5;
  cursor: default;
  background: transparent;
  border-color: transparent;
}

/* ============================================================ */
/* OFFICER VIEW SPECIFIC STYLES                                 */
/* ============================================================ */
.officer-market-header-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #ffffff;
  border-radius: 16px;
  padding: 22px 28px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.12);
}

.market-scope-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.74rem;
  color: #38bdf8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.pulsing-live-dot {
  width: 8px;
  height: 8px;
  background: #34d399;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.3);
}

.officer-market-name {
  font-size: 1.65rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.01em;
}

.officer-sub-info {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 6px;
}

.market-quick-select {
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 14px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mq-label {
  font-size: 0.72rem;
  color: #cbd5e1;
}

.mq-select {
  background: #0f172a;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  outline: none;
}

/* Officer KPI Ribbon */
.officer-work-filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 12px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.officer-work-filter-label {
  padding: 0 4px;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
}

.officer-work-filter {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid #dbe3ee;
  border-radius: 8px;
  background: #ffffff;
  color: #475569;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.officer-work-filter strong {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
}

.officer-work-filter:hover {
  border-color: #93c5fd;
  color: #1d4ed8;
}

.officer-work-filter.active {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}

.officer-work-filter.active strong {
  background: #2563eb;
  color: #ffffff;
}

.officer-work-filter.is-muted {
  color: #64748b;
}

.officer-work-filter-divider {
  width: 1px;
  height: 22px;
  margin: 0 2px;
  background: #dbe3ee;
}

.officer-kpi-ribbon {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
  margin-bottom: 34px;
}

/* เจ้าหน้าที่มี 7 สถานะ: จอกว้างต้องอยู่แถวเดียว ไม่เหลือการ์ดโดด */
.officer-status-kpi-ribbon {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.officer-status-kpi-ribbon.compact-card-gap {
  margin-bottom: 16px;
}

@media (max-width: 1500px) {
  .officer-status-kpi-ribbon {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1040px) {
  .officer-status-kpi-ribbon {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .officer-status-kpi-ribbon {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.kpi-ribbon-card {
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
}

.kpi-ribbon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.07);
}

.kpi-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.kpi-text-box {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.kpi-title {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 4px;
  white-space: nowrap;
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.kpi-count {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.kpi-unit-pill {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  line-height: 1.2;
}

/* 1. รายการทั้งหมด (Blue Theme) */
.kpi-all .kpi-icon-box {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
}
.kpi-all .kpi-unit-pill {
  background: #eff6ff;
  color: #1d4ed8;
}
.kpi-all.active {
  border-color: #2563eb;
  background: #f8faff;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.18);
}

/* 2. รออนุมัติ (Amber / Orange Theme) */
.kpi-pending .kpi-icon-box {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fef3c7;
}
.kpi-pending .kpi-unit-pill {
  background: #fef3c7;
  color: #b45309;
}
.kpi-pending.active {
  border-color: #f59e0b;
  background: #fffdf7;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
}

/* 3. นัดหมายสำเร็จ (Emerald Green Theme) */
.kpi-upcoming .kpi-icon-box {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #d1fae5;
}
.kpi-upcoming .kpi-unit-pill {
  background: #dcfce7;
  color: #15803d;
}
.kpi-upcoming.active {
  border-color: #10b981;
  background: #f0fdf4;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

/* 4. รอผู้เช่ายื่นคำร้อง (Blue Theme) */
.kpi-interested .kpi-icon-box {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
}
.kpi-interested .kpi-unit-pill {
  background: #dbeafe;
  color: #1d4ed8;
}
.kpi-interested.active {
  border-color: #2563eb;
  background: #f8faff;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

/* 3. รอคิว (Waiting List Theme - Sky Blue) */
.kpi-waiting .kpi-icon-box {
  background: #f0f9ff;
  color: #0284c7;
  border: 1px solid #e0f2fe;
}
.kpi-waiting .kpi-unit-pill {
  background: #e0f2fe;
  color: #0369a1;
}
.kpi-waiting.active {
  border-color: #0284c7;
  background: #f8fcff;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
}

/* 4. ยื่นคำร้องสำเร็จ (Purple Theme) */
.kpi-applied .kpi-icon-box {
  background: #f5f3ff;
  color: #7c3aed;
  border: 1px solid #ede9fe;
}
.kpi-applied .kpi-unit-pill {
  background: #ede9fe;
  color: #6d28d9;
}
.kpi-applied.active {
  border-color: #8b5cf6;
  background: #faf5ff;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
}

/* 5. ยกเลิก (Soft Gray Theme) */
.kpi-cancelled .kpi-icon-box {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.kpi-cancelled .kpi-unit-pill {
  background: #f1f5f9;
  color: #64748b;
}
.kpi-cancelled.active {
  border-color: #94a3b8;
  background: #f8fafc;
  box-shadow: 0 0 0 2px rgba(100, 116, 139, 0.18);
}

.kpi-urgent-pill {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #ef4444;
  color: #ffffff;
  padding: 2px 7px;
  border-radius: 10px;
}

/* KPI Info Tooltip & Popover */
.kpi-info-wrapper {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.kpi-info-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.kpi-info-btn:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #2563eb;
  transform: scale(1.08);
}

.kpi-info-popover {
  position: absolute;
  top: calc(100% + 6px);
  right: -4px;
  width: 250px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
  padding: 12px;
  z-index: 50;
  cursor: default;
  text-align: left;
}

.kpi-popover-header {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 8px;
}

.kpi-popover-body {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.kpi-popover-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #334155;
  cursor: pointer;
  transition: background 0.15s ease;
}

.kpi-popover-item:hover {
  background: #f8fafc;
}

.kpi-popover-item.is-selected {
  background: #eff6ff;
  font-weight: 600;
  color: #2563eb;
}

.kpi-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 6px;
  display: inline-block;
  flex-shrink: 0;
}

.kpi-status-dot.amber { background: #f59e0b; }
.kpi-status-dot.green { background: #10b981; }
.kpi-status-dot.blue { background: #2563eb; }

.kpi-status-name {
  flex: 1;
}

.kpi-status-val {
  font-weight: 700;
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 0.75rem;
}

.kpi-popover-reset {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid #f1f5f9;
  text-align: center;
  font-size: 0.74rem;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
}

.kpi-popover-reset:hover {
  text-decoration: underline;
}

/* Sub-filter soft badges below ribbon */
.tenant-subfilter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 6px 10px;
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
  margin-top: -12px;
  margin-bottom: 22px;
}

.subfilter-chip {
  appearance: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

/* Badge number pill */
.subfilter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 19px;
  height: 19px;
  padding: 0 6px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  transition: all 0.18s ease;
}

/* Dot indicators */
.subfilter-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

/* 1. All chip (Slate / Neutral) */
.subfilter-chip.chip-all {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
}
.subfilter-chip.chip-all .subfilter-badge {
  background: #e2e8f0;
  color: #475569;
}
.subfilter-chip.chip-all:hover:not(.active) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #1e293b;
}
.subfilter-chip.chip-all.active {
  background: #eff6ff;
  border: 1.5px solid #3b82f6;
  color: #1d4ed8;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.12);
}
.subfilter-chip.chip-all.active .subfilter-badge {
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
}

/* 2. Amber chip (รอเจ้าหน้าที่อนุมัติ) */
.subfilter-chip.chip-amber {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #92400e;
}
.subfilter-chip.chip-amber .subfilter-dot {
  background: #f59e0b;
}
.subfilter-chip.chip-amber .subfilter-badge {
  background: #fef3c7;
  color: #b45309;
}
.subfilter-chip.chip-amber:hover:not(.active) {
  background: #fef3c7;
  border-color: #fde68a;
  color: #78350f;
}
.subfilter-chip.chip-amber.active {
  background: #fef3c7;
  border: 1.5px solid #f59e0b;
  color: #78350f;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(245, 158, 11, 0.15);
}
.subfilter-chip.chip-amber.active .subfilter-badge {
  background: #fde68a;
  color: #78350f;
  font-weight: 700;
}

/* 3. Green chip (นัดหมายสำเร็จ) */
.subfilter-chip.chip-green {
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  color: #166534;
}
.subfilter-chip.chip-green .subfilter-dot {
  background: #10b981;
}
.subfilter-chip.chip-green .subfilter-badge {
  background: #dcfce7;
  color: #15803d;
}
.subfilter-chip.chip-green:hover:not(.active) {
  background: #dcfce7;
  border-color: #bbf7d0;
  color: #14532d;
}
.subfilter-chip.chip-green.active {
  background: #dcfce7;
  border: 1.5px solid #10b981;
  color: #14532d;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(16, 185, 129, 0.15);
}
.subfilter-chip.chip-green.active .subfilter-badge {
  background: #bbf7d0;
  color: #14532d;
  font-weight: 700;
}

/* 4. Blue chip (รอผู้เช่ายื่นคำร้อง) */
.subfilter-chip.chip-blue {
  background: #eff6ff;
  border: 1px solid #dbeafe;
  color: #1e40af;
}
.subfilter-chip.chip-blue .subfilter-dot {
  background: #3b82f6;
}
.subfilter-chip.chip-blue .subfilter-badge {
  background: #dbeafe;
  color: #1d4ed8;
}
.subfilter-chip.chip-blue:hover:not(.active) {
  background: #dbeafe;
  border-color: #bfdbfe;
  color: #1e3a8a;
}
.subfilter-chip.chip-blue.active {
  background: #dbeafe;
  border: 1.5px solid #3b82f6;
  color: #1e3a8a;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.15);
}
.subfilter-chip.chip-blue.active .subfilter-badge {
  background: #bfdbfe;
  color: #1e3a8a;
  font-weight: 700;
}

/* Fade Slide Transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Officer Toolbar */
.officer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 14px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.officer-search {
  width: 320px;
}

.current-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.today-toggle-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #ffffff;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.today-toggle-pill-btn:hover {
  background: #fef2f2;
}

.today-toggle-pill-btn.active {
  background: #ef4444;
  border-color: #ef4444;
  color: #ffffff;
}

.today-toggle-pill-btn.active .pulse-red-dot {
  background: #ffffff;
}

.pulse-red-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
}

.chip-label { color: #64748b; }
.chip-value { font-weight: 700; color: #0f172a; }
.chip-count { color: #2563eb; font-weight: 700; }

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Officer Cards List (เหมือนของผู้เช่า เรียงแนวนอนลงมา ไม่แบ่ง Accordion) */
.officer-cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.officer-columns-grid {
  grid-template-columns: 1.2fr 1fr 1fr 1.3fr;
}

.cell-sub-meeting-point {
  font-size: 0.74rem;
  color: #64748b;
  margin-top: 3px;
}

.cell-sub-rate {
  font-size: 0.74rem;
  color: #059669;
  font-weight: 600;
  margin-top: 3px;
}

.stall-zone-pill {
  font-size: 0.74rem;
  color: #475569;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 500;
}

.cell-sub-business {
  font-size: 0.74rem;
  color: #64748b;
  margin-top: 3px;
}

/* Officer Work Cards Grid */
.officer-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 18px;
}

.officer-work-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
  transition: all 0.2s ease;
}

.officer-work-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
}

.owc-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.owc-stall-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.stall-num {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 8px;
}

.stall-zone {
  font-size: 0.78rem;
  color: #475569;
  font-weight: 500;
}

.stall-rate {
  font-size: 0.78rem;
  color: #059669;
  font-weight: 700;
}

.owc-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.owc-info-row {
  background: #f8fafc;
  padding: 10px 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.owc-info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
}

.owc-lbl { color: #64748b; }
.owc-val { color: #1e293b; font-weight: 600; }
.highlight-time { color: #2563eb; }

.owc-tenant-box {
  border-left: 3px solid #3b82f6;
  padding-left: 10px;
}

.tenant-primary {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tenant-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.phone-call-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #eff6ff;
  color: #2563eb;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.phone-call-btn:hover {
  background: #2563eb;
  color: #ffffff;
}

.tenant-business {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 3px;
}

/* Mini Stepper */
.owc-mini-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 6px;
}

.mini-step {
  display: flex;
  align-items: center;
  gap: 5px;
}

.mini-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-text {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.mini-step.completed .mini-circle {
  background: #10b981;
  color: #ffffff;
}

.mini-step.active .mini-circle {
  background: #2563eb;
  color: #ffffff;
}

.mini-step.active .mini-text {
  color: #2563eb;
  font-weight: 700;
}

.mini-line {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin: 0 6px;
}

.mini-line.filled {
  background: #10b981;
}

/* Work Card Footer */
.owc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 10px;
}

.owc-booking-num {
  font-size: 0.8rem;
  color: #64748b;
}

.owc-actions-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-action-big {
  padding: 6px 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.officer-waiting-tag {
  font-size: 0.78rem;
  font-weight: 600;
  color: #059669;
  background: #ecfdf5;
  padding: 4px 10px;
  border-radius: 8px;
}

/* Officer Table View */
.officer-table-container {
  overflow-x: auto;
  border-radius: 12px;
  margin-top: 6px;
}

.officer-custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.86rem;
  min-width: 1100px;
}

.officer-custom-table thead tr {
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.officer-custom-table th {
  background: transparent !important;
  color: #64748b;
  font-weight: 500;
  font-size: 0.825rem;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  white-space: nowrap;
}

.officer-custom-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  color: #334155;
}

.officer-custom-table tr:hover td {
  background: #f8fafc;
}

.officer-custom-table .hierarchy-project-row td {
  padding: 15px 20px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
  cursor: pointer;
  transition: background 0.15s ease;
}

.officer-custom-table .hierarchy-project-row:hover td {
  background: #f8fafc;
}

.officer-custom-table .hierarchy-project-row.open td {
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

.hierarchy-row-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 14px;
}

.hierarchy-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.hierarchy-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.hierarchy-project-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.hierarchy-project-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
}

.hierarchy-project-name {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.hierarchy-market-pill {
  color: #64748b;
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.hierarchy-summary-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.825rem;
  font-weight: 500;
}

.hierarchy-summary-pill strong {
  color: #1e293b;
  font-weight: 600;
}

.summary-separator {
  color: #cbd5e1;
}

/* Stall Row (Clean Neutral Style in Table) */
.officer-custom-table .hierarchy-stall-row td {
  padding: 16px 20px 16px 36px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
  overflow: visible;
  cursor: pointer;
  transition: background 0.15s ease;
}

.officer-custom-table .hierarchy-stall-row:hover td {
  background: #f8fafc;
}

.officer-custom-table .hierarchy-stall-row.open td {
  background: #ffffff;
}

.officer-custom-table .hierarchy-stall-row td::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: -1px;
  left: 0;
  width: 2px;
  background: #2563eb;
  z-index: 10;
  pointer-events: none;
}

.hierarchy-level-stall {
  padding-left: 14px;
}

.hierarchy-stall-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.hierarchy-stall-left .stall-group-simple-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: 0.01em;
}

.hierarchy-stall-left .officer-booking-count-pill {
  padding: 4px 12px;
  font-size: 0.8125rem;
  color: #64748b;
  gap: 6px;
}

.hierarchy-stall-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.hierarchy-stall-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #1e293b;
  font-size: 0.85rem;
}

.hierarchy-stall-badge svg {
  color: #64748b;
}

.hierarchy-stall-badge .stall-badge-label {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 500;
}

.hierarchy-stall-badge strong {
  color: #0f172a;
  font-weight: 700;
}

.hierarchy-stall-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.8125rem;
  font-weight: 500;
}

.hierarchy-stall-count-badge svg {
  color: #64748b;
}

.hierarchy-queue-chain-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 0.775rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.hierarchy-queue-chain-btn:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #94a3b8;
}

.hierarchy-booking-row td:first-child {
  padding-left: 38px;
  position: relative;
  overflow: visible;
}

.hierarchy-booking-row td:first-child::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: -1px;
  left: 0;
  width: 2px;
  background: #2563eb;
  z-index: 10;
  pointer-events: none;
}

.hierarchy-booking-id {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.hierarchy-branch {
  width: 12px;
  height: 12px;
  border-left: 1px solid #cbd5e1;
  border-bottom: 1px solid #cbd5e1;
  border-bottom-left-radius: 4px;
  flex-shrink: 0;
}

.hierarchy-booking-row .cell-sub-date {
  margin-left: 20px;
}

.table-role-pill {
  margin-left: 0;
}

.clickable-id {
  color: #2563eb !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  cursor: pointer;
  text-decoration: none !important;
  display: inline-block;
  white-space: nowrap;
  transition: opacity 0.15s ease;
}

.clickable-id:hover {
  opacity: 0.85;
}

.cell-sub-date {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
}

.table-visit-date {
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
}

.table-visit-slot {
  font-size: 0.78rem;
  color: #2563eb;
  font-weight: 600;
  margin-top: 1px;
  white-space: nowrap;
}

.table-meeting-point {
  font-size: 0.74rem;
  color: #64748b;
  margin-top: 3px;
  line-height: 1.35;
}

.stall-badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 3px;
}

.cell-zone-text {
  font-size: 0.76rem;
  color: #64748b;
  margin-top: 2px;
}

.cell-rate-text {
  font-size: 0.82rem;
  color: #059669;
  font-weight: 700;
  margin-top: 2px;
}

.table-tenant-name {
  font-weight: 700;
  color: #0f172a;
}

.table-phone-link {
  font-size: 0.78rem;
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.cell-business-text {
  font-size: 0.74rem;
  color: #64748b;
  margin-top: 3px;
}

.cell-status {
  text-align: center;
  white-space: nowrap !important;
}

.cell-status .status-pill-badge {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  white-space: nowrap !important;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 8px;
  line-height: 1.2;
}

.table-actions-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.table-actions-cell :deep(.app-btn) {
  padding: 0 10px;
  font-size: 0.8125rem;
}

.btn-table-act {
  padding: 6px 12px !important;
  font-size: 0.8rem !important;
  border-radius: 8px !important;
  white-space: nowrap !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
}

@media (max-width: 992px) {
  .tracking-container {
    padding: 16px 12px !important;
  }

  .main-white-card {
    padding: 16px;
  }

  .info-columns-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .search-input {
    width: 100%;
  }


  .header-right {
    width: 100%;
    justify-content: flex-start;
  }

  .tenant-sort-control {
    flex: 1 1 180px;
  }

  .officer-cards-grid {
    grid-template-columns: 1fr;
  }

  .officer-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }

  .officer-search {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .booking-item-card {
    padding: 14px 14px;
    border-radius: 12px;
  }

  .card-top-main {
    align-items: center;
  }

  .booking-number-block .booking-id-text {
    font-size: 1.05rem;
  }

  .status-pill-badge {
    padding: 3px 10px;
    font-size: 0.76rem;
  }

  .card-top-row {
    gap: 12px;
  }

  .card-meta-tags-row {
    gap: 6px;
  }

  .compact-officer-meta,
  .compact-tenant-meta {
    row-gap: 8px;
  }

  .compact-meta-item + .compact-meta-item {
    padding-left: 0;
    border-left: 0;
  }

  .in-card-stall-pill,
  .in-card-project-pill,
  .in-card-market-pill {
    font-size: 0.76rem;
    padding: 3px 8px;
  }

  .latest-shortcut-copy {
    align-items: flex-start;
    flex-direction: column;
    gap: 1px;
    white-space: normal;
  }

  .tenant-sort-control,
  .tenant-expand-all-btn,
  .tenant-clear-filters-btn {
    width: 100%;
  }

  .tenant-clear-filters-btn {
    justify-content: center;
  }

  .collapsed-next-step {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    margin-top: 10px;
    padding-top: 10px;
  }

  .collapsed-next-step-content,
  .footer-left-status {
    width: 100%;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  .collapsed-actions-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
  }

  /* Make outline secondary actions share width side by side on mobile */
  .collapsed-actions-group .action-btn-secondary {
    flex: 1 1 calc(50% - 4px);
    min-width: 90px;
    justify-content: center;
  }

  /* Make primary prominent action take full width below secondary actions */
  .collapsed-actions-group .action-btn-primary {
    flex: 1 1 100%;
    width: 100%;
    justify-content: center;
  }
}

/* --- Stall Queue Pills & Modal (Officer View Only) --- */
.in-card-queue-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 7px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  user-select: none;
}

.in-card-queue-pill.has-queue-pill {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}
.in-card-queue-pill.has-queue-pill:hover {
  background: #dbeafe;
  border-color: #93c5fd;
  transform: translateY(-1px);
}

.in-card-queue-pill.is-waiting-pill {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.in-card-queue-pill.is-waiting-pill:hover {
  background: #dcfce7;
  border-color: #86efac;
  transform: translateY(-1px);
}

.table-queue-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.table-queue-pill.has-queue {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}
.table-queue-pill.has-queue:hover {
  background: #dbeafe;
}
.table-queue-pill.is-waiting {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.table-queue-pill.is-waiting:hover {
  background: #dcfce7;
}

/* Modal Queue Chain */
.modal-queue-chain {
  max-width: 620px;
  width: 92%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.modal-title-with-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.modal-title-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.badge-stall-chain {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
}

.queue-chain-body {
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.queue-section-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.queue-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.queue-section-badge {
  font-size: 0.8125rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
}
.queue-section-badge.badge-primary-holder {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.queue-section-badge.badge-waiting-queue {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.queue-holder-card {
  background: #ffffff;
  border: 1.5px solid #86efac;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f0fdf4;
}

.queue-card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.queue-user-main {
  display: flex;
  align-items: center;
  gap: 8px;
}
.queue-user-name {
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 700;
}
.queue-user-phone {
  font-size: 0.825rem;
  color: #64748b;
}

.queue-card-meta-row {
  font-size: 0.825rem;
  color: #475569;
}

.queue-card-actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.queue-empty-box {
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  color: #64748b;
  font-size: 0.825rem;
  text-align: center;
}

.queue-list-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.queue-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  gap: 12px;
  transition: all 0.15s ease;
}
.queue-item-row:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.queue-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.queue-num-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 800;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #bfdbfe;
}

.queue-item-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #1e293b;
}

.queue-item-sub {
  font-size: 0.775rem;
  color: #64748b;
  margin-top: 2px;
}

.queue-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.queue-system-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.775rem;
  color: #64748b;
  line-height: 1.4;
}
.queue-system-notice svg {
  flex-shrink: 0;
  color: #3b82f6;
}

/* ============================================================ */
/* OFFICER STALL GROUPING STYLES (แยกตามแผงค้า)                     */
/* ============================================================ */
.officer-groups-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-stall-entry {
  display: contents;
}

.officer-project-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  margin-top: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  color: #0f172a;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.officer-project-header:hover {
  background: #f8fafc;
  border-color: #bfdbfe;
}

.officer-project-header.open {
  background: #ffffff;
  border-color: #bfdbfe;
  box-shadow: inset 3px 0 0 #3b82f6;
}

.officer-project-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.officer-project-icon {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  color: #2563eb;
}

.officer-project-identity {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.officer-project-title {
  min-width: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 750;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.officer-project-summary {
  display: inline-flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
}

.officer-project-summary > span {
  padding: 0 10px;
}

.officer-project-summary > span + span {
  border-left: 1px solid #e2e8f0;
}

.officer-project-summary strong {
  color: #334155;
  font-weight: 750;
}

.officer-project-market {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
}

.officer-project-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.officer-project-header-right .chevron-indicator {
  color: #64748b;
}

.officer-stall-summary-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.summary-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #475569;
}

.summary-bar-left svg {
  color: #2563eb;
  flex-shrink: 0;
}

.summary-bar-left strong {
  color: #0f172a;
}

.btn-toggle-all-stalls {
  height: 32px;
  padding: 4px 14px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn-toggle-all-stalls:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.officer-stall-group-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  margin-bottom: 18px;
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.officer-stall-group-card.in-project {
  position: relative;
  margin: 0 12px 10px 44px;
  border-radius: 12px;
  overflow: visible;
}

.officer-project-header + .officer-stall-group-card.in-project {
  margin-top: 20px;
}

.officer-project-header + .officer-stall-group-card.in-project::before {
  top: -20px;
  height: 47px;
}

.officer-stall-group-card.in-project::before {
  content: '';
  position: absolute;
  top: 0;
  left: -22px;
  width: 16px;
  height: 27px;
  border-left: 1px solid #cbd5e1;
  border-bottom: 1px solid #cbd5e1;
  border-bottom-left-radius: 7px;
  pointer-events: none;
}

.officer-stall-group-card.in-project > .stall-group-header {
  border-radius: 12px 12px 0 0;
}

.officer-stall-group-card.in-project > .stall-group-header:not(.open) {
  border-radius: 12px;
}

.officer-stall-group-card.in-project > .stall-group-cards-body {
  border-radius: 0 0 12px 12px;
}

.officer-stall-group-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.stall-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid transparent;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
  user-select: none;
}

.stall-group-header:hover {
  background: #f8fafc;
}

.stall-group-header.open {
  border-bottom-color: #e2e8f0;
  background: #ffffff;
}

.stall-group-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.stall-group-simple-title {
  min-width: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.officer-booking-count-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  padding: 5px 11px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #f8fafc;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1;
}

.stall-group-cards-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #f8fafc;
}

.queue-holder-context {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #eff6ff;
  color: #475569;
  font-size: 0.8125rem;
}

.queue-holder-context strong {
  color: #1e293b;
  font-weight: 700;
}

.queue-holder-context-status {
  color: #2563eb;
  font-weight: 600;
}

.in-card-role-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
  margin-left: 6px;
  vertical-align: middle;
}

.in-card-role-pill.is-holder {
  background: #ecfdf5;
  color: #15803d;
  border: 1px solid #a7f3d0;
}

.in-card-role-pill.is-queue {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

@media (max-width: 768px) {
  .officer-project-header {
    align-items: flex-start;
  }

  .officer-project-header-right {
    gap: 6px;
  }

  .officer-project-summary {
    display: none;
  }

  .officer-stall-group-card.in-project {
    margin-left: 24px;
    margin-right: 0;
  }

  .officer-stall-group-card.in-project::before {
    left: -14px;
    width: 10px;
  }
}

/* Multi-Stall Appointment Sub-List inside Tenant Appointment Card */
.multi-stall-appointment-box {
  margin-top: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.msa-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e2e8f0;
}

.msa-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #1e293b;
}

.msa-hint {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
}

.msa-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 8px;
}

.msa-stall-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.msa-stall-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.msa-stall-code {
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
}

.msa-stall-zone {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 5px;
}

.msa-stall-rate {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #2563eb;
}

.msa-stall-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.msa-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.msa-btn-primary {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #93c5fd;
}

.msa-btn-primary:hover {
  background: #dbeafe;
  border-color: #60a5fa;
}

.msa-btn-danger {
  background: #ffffff;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.msa-btn-danger:hover {
  background: #fef2f2;
  border-color: #f87171;
}
</style>
