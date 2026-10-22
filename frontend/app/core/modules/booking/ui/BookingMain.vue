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

          <button
            class="btn btn-outline-danger btn-sm"
            @click="handleClearAllData"
            title="ล้างข้อมูลการจองและคำร้องทั้งหมด เพื่อเริ่มทดสอบ Flow ใหม่จาก 0"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>รีเซ็ตข้อมูลทดสอบ</span>
          </button>
        </div>

        <!-- Main Content Card -->
        <div class="main-white-card">
          <!-- Header Row: Title & Subtitle on Left, Search + Filter on Right -->
          <div class="card-header-row">
            <div class="header-left">
              <h2 class="section-title">รายการจอง</h2>
              <div class="item-count-subtitle">{{ filteredTenantBookings.length }} รายการ</div>
            </div>

            <div class="header-right">
              <div class="search-input-wrapper">
                <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  type="text"
                  v-model="tenantSearchQuery"
                  placeholder="ค้นหาหมายเลขการจอง"
                  class="search-input"
                />
                <button v-if="tenantSearchQuery" class="clear-search-btn" @click="tenantSearchQuery = ''" aria-label="ล้างการค้นหา">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
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
                <div class="kpi-title">รายการทั้งหมด</div>
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

            <!-- 3. เสร็จสิ้น -->
            <div
              class="kpi-ribbon-card kpi-upcoming"
              :class="{ active: tenantStatusTab === 'completed' }"
              @click="tenantStatusTab = 'completed'"
              role="button"
              tabindex="0"
            >
              <div class="kpi-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div class="kpi-text-box">
                <div class="kpi-title">เสร็จสิ้น</div>
                <div class="kpi-value-row">
                  <span class="kpi-count">{{ countCompleted }}</span>
                  <span class="kpi-unit-pill">รายการ</span>
                </div>
              </div>
            </div>

            <!-- 4. ยกเลิก -->
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
                class="subfilter-chip"
                :class="{ active: tenantSubFilter === 'all' }"
                @click="tenantSubFilter = 'all'"
              >
                ทั้งหมด ({{ countPending }})
              </button>
              <button
                type="button"
                class="subfilter-chip chip-amber"
                :class="{ active: tenantSubFilter === 'pending_approval' }"
                @click="tenantSubFilter = 'pending_approval'"
              >
                <span class="dot-amber"></span>
                รอเจ้าหน้าที่อนุมัติ ({{ tenantCountPendingApproval }})
              </button>
              <button
                type="button"
                class="subfilter-chip chip-green"
                :class="{ active: tenantSubFilter === 'approved' }"
                @click="tenantSubFilter = 'approved'"
              >
                <span class="dot-green"></span>
                นัดหมายสำเร็จ ({{ tenantCountApproved }})
              </button>
              <button
                type="button"
                class="subfilter-chip chip-blue"
                :class="{ active: tenantSubFilter === 'interested' }"
                @click="tenantSubFilter = 'interested'"
              >
                <span class="dot-blue"></span>
                รอผู้เช่ายื่นคำร้อง ({{ tenantCountInterested }})
              </button>
            </div>
          </transition>

          <!-- Loading State -->
          <div v-if="loading" class="loading-state-box">
            <svg class="spin-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>กำลังโหลดข้อมูลรายการจอง...</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="tenantMarketGroups.length === 0" class="empty-state-box">
            <div class="empty-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>

            <!-- Case A: Current tab has 0, but user has bookings in other tabs -->
            <template v-if="countAll > 0 && tenantStatusTab !== 'all'">
              <div class="empty-title">ไม่มีรายการในแท็บ "{{ getTenantTabName(tenantStatusTab) }}"</div>
              <div class="empty-desc">
                คุณไม่มีรายการในกลุ่มนี้ แต่มีรายการจองในแท็บอื่นทั้งหมด <strong>{{ countAll }}</strong> รายการ
                <span v-if="countCompleted > 0"> (เสร็จสิ้น {{ countCompleted }} รายการ)</span>
                <span v-if="countCancelled > 0"> (ยกเลิก {{ countCancelled }} รายการ)</span>
              </div>
              <div style="display: flex; gap: 10px; justify-content: center; margin-top: 14px; flex-wrap: wrap;">
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  @click="tenantStatusTab = 'all'; tenantSubFilter = 'all'"
                  style="display: inline-flex; align-items: center; gap: 6px;"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                  <span>ดูรายการทั้งหมด ({{ countAll }} รายการ)</span>
                </button>
                <NuxtLink to="/" class="btn btn-outline-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
                  <span>จองแผงเพิ่ม</span>
                </NuxtLink>
              </div>
            </template>

            <!-- Case B: Sub-filter in pending has 0 items -->
            <template v-else-if="tenantStatusTab === 'pending' && tenantSubFilter !== 'all'">
              <div class="empty-title">ไม่มีรายการในขั้นตอนนี้</div>
              <div class="empty-desc">ในกลุ่มรอดำเนินการยังมีรายการในขั้นตอนอื่น {{ countPending }} รายการ</div>
              <button
                type="button"
                class="btn btn-primary btn-sm"
                @click="tenantSubFilter = 'all'"
                style="margin-top: 14px; display: inline-flex; align-items: center; gap: 6px;"
              >
                <span>แสดงทุกขั้นตอนในรอดำเนินการ ({{ countPending }} รายการ)</span>
              </button>
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

          <!-- Market Accordion Groups List (ผู้เช่าเห็นหลายตลาดตามจองจริง) -->
          <div v-else class="market-accordions-list">
            <div
              v-for="group in tenantMarketGroups"
              :key="group.name"
              class="market-accordion-card"
            >
              <!-- Accordion Header Button -->
              <button
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
              </button>

              <!-- Accordion Body (Booking Cards) -->
              <div v-show="isMarketOpen(group.name)" class="market-accordion-body">
                <div
                  v-for="b in group.bookings"
                  :key="b.id"
                  class="booking-item-card"
                  :class="[getCardBorderClass(b.status), { 'collapsed-card': !isCardExpanded(b.id) }]"
                >
                  <!-- Card Top Row -->
                  <div class="card-top-row">
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
                        <div class="booking-label">หมายเลขการจอง</div>
                        <div class="booking-id-text">{{ formatBookingNumber(b.booking_number) }}</div>
                      </div>

                      <!-- Booked Timestamp -->
                      <div class="booked-time-meta">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>จองเมื่อ {{ formatCreatedDate(b.created_at) }}</span>
                      </div>
                    </div>

                    <div class="top-row-right">
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

                  <!-- Expanded Card Body -->
                  <div v-show="isCardExpanded(b.id)" class="card-expandable-content">
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
                          <span class="info-value-text">{{ formatThaiVisitDate(b.visit_date) }}</span>
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
                          <span class="info-value-text">{{ b.visit_time_slot || '13.00 - 14.00 น.' }}</span>
                        </div>
                      </div>

                      <!-- Column 3: แผงค้า -->
                      <div class="info-column">
                        <div class="info-label">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                          <span>แผงค้า</span>
                        </div>
                        <div class="info-value-row">
                          <span class="stall-count-pill">{{ b.stall_count ? b.stall_count + ' แผง' : (b.stall_number ? 'แผง ' + b.stall_number : '1 แผง') }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Card Footer Row with High-Impact Visual Hierarchy -->
                    <div class="card-footer-row">
                      <div class="footer-left-status">
                        <!-- Action Cue Pill (กระชับ ชัดเจน ไม่ใช้ตัวหนังสือเยอะ) -->
                        <div v-if="b.status === 'pending_approval' || b.status === 'pending'" class="action-cue-pill cue-pending">
                          <span class="cue-dot"></span>
                          <span class="cue-lead">รอเจ้าหน้าที่อนุมัติ</span>
                          <span class="cue-separator">•</span>
                          <span class="cue-text">ยื่นขอนัดดูแผงแล้ว รอเจ้าหน้าที่ตรวจสอบวันเวลา</span>
                        </div>

                        <div v-else-if="b.status === 'approved'" class="action-cue-pill cue-approved">
                          <span class="cue-dot"></span>
                          <span class="cue-lead">นัดหมายสำเร็จ</span>
                          <span class="cue-separator">•</span>
                          <span class="cue-text">เตรียมพบเจ้าหน้าที่ตามวันเวลา</span>
                        </div>

                        <div v-else-if="b.status === 'interested'" class="action-cue-pill cue-ready">
                          <span class="cue-dot"></span>
                          <span class="cue-lead">รอผู้เช่ายื่นคำร้อง</span>
                          <span class="cue-separator">•</span>
                          <span class="cue-text">ชมแผงแล้ว พร้อมยื่นคำร้องขอเช่าแผงนี้</span>
                        </div>

                        <div v-else-if="b.status === 'lease_applied' || b.status === 'completed'" class="action-cue-pill cue-applied">
                          <span class="cue-dot blue"></span>
                          <span class="cue-lead">ยื่นคำร้องสำเร็จ</span>
                          <span class="cue-separator">•</span>
                          <span class="cue-text">ผู้เช่ายื่นคำร้องแล้ว รอเจ้าหน้าที่ตลาดพิจารณา (เลขคำร้อง: {{ b.application_number || 'กำลังตรวจสอบ' }})</span>
                        </div>

                        <div v-else-if="b.status === 'cancelled' || b.status === 'rejected'" class="action-cue-pill cue-muted">
                          <span class="cue-text">ยกเลิกการจองแล้ว</span>
                        </div>

                        <div v-else class="action-cue-pill cue-muted">
                          <span class="cue-text">{{ getStatusDescription(b.status) }}</span>
                        </div>
                      </div>

                      <div class="footer-right-actions">
                        <!-- ปุ่มยกเลิก / สละสิทธิ์ (Secondary Ghost Danger) -->
                        <button
                          v-if="['approved', 'pending_approval', 'pending', 'waiting_queue', 'pending_slot'].includes(b.status)"
                          class="btn-action-danger-ghost"
                          @click="handleCancelBooking(b, b.status === 'waiting_queue' ? 'ผู้เช่ายกเลิกการต่อคิว' : 'ผู้เช่าขอยกเลิกการจอง')"
                          title="ยกเลิกรายการนี้"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          <span>ยกเลิก</span>
                        </button>
                        <button
                          v-else-if="b.status === 'interested'"
                          class="btn-action-danger-ghost"
                          @click="handleCancelBooking(b, 'ผู้เช่าสละสิทธิ์ไม่ยื่นคำร้อง')"
                          title="สละสิทธิ์ไม่ยื่นคำร้อง"
                        >
                          <span>สละสิทธิ์</span>
                        </button>

                        <!-- ปุ่มดูรายละเอียด (Neutral Outline Ghost) -->
                        <button class="btn-action-ghost" @click="openBookingDetails(b)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          <span>รายละเอียด</span>
                        </button>

                        <!-- High-Impact Primary CTA (เด่นชัด สื่อว่าควรกดปุ่มนี้ทันที) -->
                        <button
                          v-if="b.status === 'interested'"
                          class="btn-primary-prominent btn-pulse-blue"
                          @click="openLeaseApplication(b)"
                        >
                          <span>ยื่นคำร้องขอเช่าแผงนี้</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>


                        <!-- Primary Call to Action: ติดตามคำร้อง -->
                        <NuxtLink
                          v-else-if="b.status === 'lease_applied'"
                          to="/applications"
                          class="btn-primary-prominent"
                        >
                          <span>ติดตามคำร้อง</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Pagination Row -->
          <div class="pagination-footer-row">
            <div class="pagination-left">
              <span>หน้า</span>
              <select v-model="currentPage" class="page-select-dropdown">
                <option v-for="page in totalPages" :key="page" :value="page">
                  {{ page }}
                </option>
              </select>
              <span>จาก {{ totalPages }}</span>
            </div>

            <div class="pagination-right">
              <button class="page-nav-btn" :disabled="currentPage <= 1" @click="currentPage = 1">«</button>
              <button class="page-nav-btn" :disabled="currentPage <= 1" @click="currentPage--">‹</button>
              <button
                v-for="p in visiblePageNumbers"
                :key="p"
                class="page-num-btn"
                :class="{ active: p === currentPage, ellipsis: p === '...' }"
                :disabled="p === '...'"
                @click="p !== '...' && (currentPage = Number(p))"
              >
                {{ p }}
              </button>
              <button class="page-nav-btn" :disabled="currentPage >= totalPages" @click="currentPage++">›</button>
              <button class="page-nav-btn" :disabled="currentPage >= totalPages" @click="currentPage = totalPages">»</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 2: OFFICER VIEW (มุมมองเจ้าหน้าที่ - ดูเฉพาะตลาดของตนเอง) -->
      <!-- ============================================================ -->
      <div v-else class="officer-view-section">
        <!-- Page Main Title & Actions -->
        <div class="page-header-row">
          <h1 class="main-page-title">จัดการนัดชมแผง</h1>

          <button
            class="btn btn-outline-danger btn-sm"
            @click="handleClearAllData"
            title="ล้างข้อมูลการจองและคำร้องทั้งหมด เพื่อเริ่มทดสอบ Flow ใหม่จาก 0"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>รีเซ็ตข้อมูลทดสอบ</span>
          </button>
        </div>

        <!-- Main Content Card (โครงเดียวกับผู้เช่า) -->
        <div class="main-white-card">
          <!-- Header Row: Title & Subtitle on Left, Search + Actions on Right (โครงเดียวกับผู้เช่า) -->
          <div class="card-header-row">
            <div class="header-left">
              <h2 class="section-title">รายการจองทั้งหมด</h2>
              <div class="item-count-subtitle">{{ filteredOfficerBookings.length }} รายการ</div>
            </div>

            <div class="header-right">
              <!-- Officer Market Filter Dropdown -->
              <div class="officer-market-filter-box" style="display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #64748b;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <select
                  v-model="officerSelectedMarket"
                  class="form-select-sm"
                  style="font-size: 0.825rem; font-family: inherit; padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #1e293b; font-weight: 600; outline: none; cursor: pointer;"
                  title="เลือกตลาดเพื่อกรองรายการจอง"
                >
                  <option value="all">ทุกตลาด (ทั้งหมด)</option>
                  <option v-for="m in uniqueOfficerMarkets" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>

              <div class="table-search-funnel-box">
                <span class="search-icon-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
                <input
                  type="text"
                  v-model="officerSearchQuery"
                  placeholder="ค้นหาหมายเลขการจอง / ผู้จอง"
                />
                <button v-if="officerSearchQuery" class="clear-search-btn" @click="officerSearchQuery = ''; officerCurrentPage = 1" aria-label="ล้างการค้นหา" style="border: none; background: transparent; cursor: pointer; padding: 2px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <span class="filter-icon-right" title="ตัวกรอง">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                </span>
              </div>

              <!-- View Mode Toggle: Cards vs Table -->
              <div class="view-mode-toggle">
                <button
                  class="vm-btn"
                  :class="{ active: officerViewMode === 'card' }"
                  @click="officerViewMode = 'card'"
                  title="มุมมองการ์ดงาน"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  <span>การ์ดงาน</span>
                </button>
                <button
                  class="vm-btn"
                  :class="{ active: officerViewMode === 'table' }"
                  @click="officerViewMode = 'table'"
                  title="มุมมองตาราง"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                  <span>ตารางสรุป</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Officer Quick KPI Tabs (เรียงตาม Lifecycle: ทั้งหมด -> รอเจ้าหน้าที่อนุมัติ -> นัดหมายสำเร็จ -> รอผู้เช่ายื่นคำร้อง -> ยื่นคำร้องสำเร็จ -> ยกเลิก) -->
          <div class="officer-kpi-ribbon">
            <!-- 1. รายการทั้งหมด -->
            <div
              class="kpi-ribbon-card kpi-all"
              :class="{ active: officerActiveTab === 'all' }"
              @click="officerActiveTab = 'all'"
              role="button"
              tabindex="0"
            >
              <div class="kpi-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              </div>
              <div class="kpi-text-box">
                <div class="kpi-title">รายการทั้งหมด</div>
                <div class="kpi-value-row">
                  <span class="kpi-count">{{ officerMarketBookings.length }}</span>
                  <span class="kpi-unit-pill">รายการ</span>
                </div>
              </div>
            </div>

            <!-- 2. รอเจ้าหน้าที่อนุมัติ -->
            <div
              class="kpi-ribbon-card kpi-pending"
              :class="{ active: officerActiveTab === 'pending' }"
              @click="officerActiveTab = 'pending'"
              role="button"
              tabindex="0"
            >
              <div class="kpi-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="kpi-text-box">
                <div class="kpi-title">รอเจ้าหน้าที่อนุมัติ</div>
                <div class="kpi-value-row">
                  <span class="kpi-count">{{ officerCountPending }}</span>
                  <span class="kpi-unit-pill">รายการ</span>
                </div>
              </div>
            </div>

            <!-- 3. นัดหมายสำเร็จ -->
            <div
              class="kpi-ribbon-card kpi-upcoming"
              :class="{ active: officerActiveTab === 'approved' }"
              @click="officerActiveTab = 'approved'"
              role="button"
              tabindex="0"
            >
              <div class="kpi-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div class="kpi-text-box">
                <div class="kpi-title">นัดหมายสำเร็จ</div>
                <div class="kpi-value-row">
                  <span class="kpi-count">{{ officerCountApproved }}</span>
                  <span class="kpi-unit-pill">รายการ</span>
                </div>
              </div>
            </div>

            <!-- 4. รอผู้เช่ายื่นคำร้อง -->
            <div
              class="kpi-ribbon-card kpi-interested"
              :class="{ active: officerActiveTab === 'interested' }"
              @click="officerActiveTab = 'interested'"
              role="button"
              tabindex="0"
            >
              <div class="kpi-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
              <div class="kpi-text-box">
                <div class="kpi-title">รอผู้เช่ายื่นคำร้อง</div>
                <div class="kpi-value-row">
                  <span class="kpi-count">{{ officerCountInterested }}</span>
                  <span class="kpi-unit-pill">รายการ</span>
                </div>
              </div>
            </div>

            <!-- 5. ยื่นคำร้องสำเร็จ -->
            <div
              class="kpi-ribbon-card kpi-applied"
              :class="{ active: officerActiveTab === 'applied' }"
              @click="officerActiveTab = 'applied'"
              role="button"
              tabindex="0"
            >
              <div class="kpi-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div class="kpi-text-box">
                <div class="kpi-title">ยื่นคำร้องสำเร็จ</div>
                <div class="kpi-value-row">
                  <span class="kpi-count">{{ officerCountApplied }}</span>
                  <span class="kpi-unit-pill">รายการ</span>
                </div>
              </div>
            </div>

            <!-- 6. ยกเลิก -->
            <div
              class="kpi-ribbon-card kpi-cancelled"
              :class="{ active: officerActiveTab === 'cancelled' }"
              @click="officerActiveTab = 'cancelled'"
              role="button"
              tabindex="0"
            >
              <div class="kpi-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              </div>
              <div class="kpi-text-box">
                <div class="kpi-title">ยกเลิก</div>
                <div class="kpi-value-row">
                  <span class="kpi-count">{{ officerCountCancelled }}</span>
                  <span class="kpi-unit-pill">รายการ</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State in Officer View -->
          <div v-if="filteredOfficerBookings.length === 0" class="empty-state-box">
            <div class="empty-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>

            <template v-if="officerMarketBookings.length > 0 && officerActiveTab !== 'all'">
              <div class="empty-title">ไม่มีรายการในแท็บ "{{ getOfficerTabName(officerActiveTab) }}"</div>
              <div class="empty-desc">
                ไม่มีรายการในสถานะนี้สำหรับตลาดที่เลือก แต่มีรายการในสถานะอื่นทั้งหมด <strong>{{ officerMarketBookings.length }}</strong> รายการ
              </div>
              <div style="display: flex; gap: 10px; justify-content: center; margin-top: 14px; flex-wrap: wrap;">
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  @click="officerActiveTab = 'all'"
                  style="display: inline-flex; align-items: center; gap: 6px;"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                  <span>ดูรายการทั้งหมดในตลาดนี้ ({{ officerMarketBookings.length }} รายการ)</span>
                </button>
              </div>
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

          <!-- OFFICER VIEW MODE 1: CARDS VIEW (การ์ดแบบเดียวกับผู้เช่า เรียงลงมาโดยไม่แบ่ง Accordion) -->
          <div v-else-if="officerViewMode === 'card'" class="officer-cards-list">
            <div
              v-for="b in paginatedOfficerBookings"
              :key="b.id"
              class="booking-item-card"
              :class="[getCardBorderClass(b.status), { 'collapsed-card': !isCardExpanded(b.id) }]"
            >
              <!-- Card Top Row -->
              <div class="card-top-row">
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
                    <div class="booking-label">หมายเลขการจอง</div>
                    <div class="booking-id-text">{{ formatBookingNumber(b.booking_number) }}</div>
                  </div>

                  <!-- Booked Timestamp -->
                  <div class="booked-time-meta">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>จองเมื่อ {{ formatCreatedDate(b.created_at) }}</span>
                  </div>
                </div>

                <div class="top-row-right">
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

              <!-- Expanded Card Body -->
              <div v-show="isCardExpanded(b.id)" class="card-expandable-content">
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
                      <span class="info-value-text">{{ formatThaiVisitDate(b.visit_date) }}</span>
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
                      <span class="info-value-text">{{ b.visit_time_slot || '13.00 - 14.00 น.' }}</span>
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
                      <span class="stall-count-pill">{{ b.stall_number ? 'แผง ' + b.stall_number : '1 แผง' }}</span>
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
                    <div v-if="b.intended_business" class="cell-sub-business">
                      สินค้า: {{ b.intended_business }}
                    </div>
                  </div>
                </div>

                <!-- Card Footer Row With High-Impact Visual Hierarchy -->
                <div class="card-footer-row">
                  <div class="footer-left-status">
                    <!-- Action Cue Pill (กระชับ ชัดเจน ไม่ใช้ตัวหนังสือเยอะ) -->
                    <div v-if="b.status === 'pending_approval' || b.status === 'pending'" class="action-cue-pill cue-pending">
                      <span class="cue-dot"></span>
                      <span class="cue-lead">รอเจ้าหน้าที่อนุมัติ</span>
                      <span class="cue-separator">•</span>
                      <span class="cue-text">ผู้เช่ายื่นขอนัดดูแผง รอเจ้าหน้าที่พิจารณาอนุมัติ</span>
                    </div>

                    <div v-else-if="b.status === 'approved'" class="action-cue-pill cue-approved">
                      <span class="cue-dot"></span>
                      <span class="cue-lead">อนุมัตินัดแล้ว</span>
                      <span class="cue-separator">•</span>
                      <span class="cue-text">เตรียมนัดพบผู้เช่าตามกำหนด</span>
                    </div>

                    <div v-else-if="b.status === 'interested'" class="action-cue-pill cue-ready">
                      <span class="cue-dot"></span>
                      <span class="cue-lead">รอผู้เช่ายื่นคำร้อง</span>
                      <span class="cue-separator">•</span>
                      <span class="cue-text">พาชมแผงแล้ว รอผู้เช่ายื่นคำร้องขอเช่าแผง</span>
                    </div>

                    <div v-else-if="b.status === 'lease_applied' || b.status === 'completed'" class="action-cue-pill cue-applied">
                      <span class="cue-dot"></span>
                      <span class="cue-lead">ยื่นคำร้องสำเร็จ</span>
                      <span class="cue-separator">•</span>
                      <span class="cue-text">ผู้เช่ายื่นคำร้องแล้ว (เลขที่ {{ b.application_number || 'กำลังพิจารณา' }})</span>
                    </div>

                    <div v-else-if="b.status === 'cancelled' || b.status === 'rejected'" class="action-cue-pill cue-muted">
                      <span class="cue-text">ยกเลิกคำขอแล้ว</span>
                    </div>

                    <div v-else class="action-cue-pill cue-muted">
                      <span class="cue-text">{{ getStatusDescription(b.status) }}</span>
                    </div>
                  </div>

                  <div class="footer-right-actions">
                    <!-- Case 1: pending -> Approve (primary solid CTA), Reject (danger outline), Details (neutral ghost) -->
                    <template v-if="b.status === 'pending_approval' || b.status === 'pending'">
                      <button class="btn-primary-prominent" @click="openApproveModal(b)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>อนุมัตินัด</span>
                      </button>
                      <button class="btn-action-danger-ghost" @click="openRejectModal(b)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        <span>ไม่อนุมัติ</span>
                      </button>
                      <button class="btn-action-ghost" @click="openBookingDetails(b)">
                        <span>ดูรายละเอียด</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </button>
                    </template>

                    <!-- Case 2: approved -> Confirm Rental (success solid CTA), Cancel (danger outline), Details (neutral ghost) -->
                    <template v-else-if="b.status === 'approved'">
                      <button class="btn-success-prominent" @click="handleMarkVisited(b)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>ยืนยันการเช่า</span>
                      </button>
                      <button class="btn-action-danger-ghost" @click="handleOfficerCancel(b)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        <span>ยกเลิก</span>
                      </button>
                      <button class="btn-action-ghost" @click="openBookingDetails(b)">
                        <span>ดูรายละเอียด</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </button>
                    </template>

                    <!-- Case 3: interested, lease_applied, or others -->
                    <template v-else>
                      <button class="btn-action-ghost" @click="openBookingDetails(b)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        <span>ดูรายละเอียด</span>
                      </button>

                      <NuxtLink
                        v-if="b.status === 'lease_applied'"
                        to="/applications"
                        class="btn-primary-prominent"
                      >
                        <span>ดูคำร้อง</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </NuxtLink>
                    </template>
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
                  <th style="width: 110px;">เลขที่จอง</th>
                  <th style="width: 220px;">กำหนดนัดหมาย</th>
                  <th style="width: 200px;">แผงค้า & โซน</th>
                  <th>ผู้ขอจอง & เบอร์ติดต่อ</th>
                  <th style="width: 150px; text-align: center;">สถานะ</th>
                  <th style="text-align: right; width: 330px;">การดำเนินการของเจ้าหน้าที่</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in paginatedOfficerBookings" :key="b.id">
                  <td>
                    <strong class="clickable-id" @click="openBookingDetails(b)">{{ formatBookingNumber(b.booking_number) }}</strong>
                    <div class="cell-sub-date">{{ b.created_at?.slice(0, 10) }}</div>
                  </td>
                  <td>
                    <div class="table-visit-date">{{ formatThaiVisitDate(b.visit_date) }}</div>
                    <div class="table-visit-slot">{{ b.visit_time_slot || '13.00 - 14.00 น.' }}</div>
                    <div v-if="b.meeting_point" class="table-meeting-point">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span>{{ b.meeting_point }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="stall-badge-row">
                      <span class="badge badge-available">แผง {{ b.stall_number }}</span>
                      <span v-if="b.stall_zone_name" class="stall-zone-pill">{{ b.stall_zone_name }}</span>
                    </div>
                    <div class="cell-rate-text">฿{{ Number(b.stall_monthly_rate || 2500).toLocaleString() }}/ด.</div>
                  </td>
                  <td>
                    <div class="table-tenant-name">{{ b.tenant_name }}</div>
                    <a :href="`tel:${b.tenant_phone}`" class="table-phone-link">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 2px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      <span>{{ b.tenant_phone }}</span>
                    </a>
                    <div v-if="b.intended_business" class="cell-business-text">ขาย: {{ b.intended_business }}</div>
                  </td>
                  <td class="cell-status">
                    <span class="status-pill-badge" :class="getStatusPillClass(b.status)">
                      {{ getStatusBadgeLabel(b.status) }}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div class="table-actions-cell">
                      <!-- Case 1: pending -> Approve (primary solid CTA), Reject (danger outline), Details (neutral ghost) -->
                      <template v-if="b.status === 'pending_approval' || b.status === 'pending'">
                        <button class="btn-primary-prominent btn-table-act" @click="openApproveModal(b)">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>อนุมัตินัด</span>
                        </button>
                        <button class="btn-action-danger-ghost btn-table-act" @click="openRejectModal(b)">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          <span>ไม่อนุมัติ</span>
                        </button>
                        <button class="btn-action-ghost btn-table-act" @click="openBookingDetails(b)">
                          <span>รายละเอียด</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                      </template>

                      <!-- Case 2: approved -> Confirm Rental (success solid CTA), Cancel (danger outline), Details (neutral ghost) -->
                      <template v-else-if="b.status === 'approved'">
                        <button class="btn-success-prominent btn-table-act" @click="handleMarkVisited(b)">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>ยืนยันการเช่า</span>
                        </button>
                        <button class="btn-action-danger-ghost btn-table-act" @click="handleOfficerCancel(b)">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          <span>ยกเลิก</span>
                        </button>
                        <button class="btn-action-ghost btn-table-act" @click="openBookingDetails(b)">
                          <span>รายละเอียด</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                      </template>

                      <!-- Case 3: other statuses -->
                      <template v-else>
                        <NuxtLink
                          v-if="b.status === 'lease_applied'"
                          to="/applications"
                          class="btn-primary-prominent btn-table-act"
                        >
                          <span>ดูคำร้อง</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </NuxtLink>
                        <button class="btn-action-ghost btn-table-act" @click="openBookingDetails(b)">
                          <span>รายละเอียด</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bottom Pagination Row (โครงเดียวกับผู้เช่า) -->
          <div class="pagination-footer-row">
            <div class="pagination-left">
              <span>หน้า</span>
              <select v-model="officerCurrentPage" class="page-select-dropdown">
                <option v-for="page in officerTotalPages" :key="page" :value="page">
                  {{ page }}
                </option>
              </select>
              <span>จาก {{ officerTotalPages }}</span>
            </div>

            <div class="pagination-right">
              <button class="page-nav-btn" :disabled="officerCurrentPage <= 1" @click="officerCurrentPage = 1">«</button>
              <button class="page-nav-btn" :disabled="officerCurrentPage <= 1" @click="officerCurrentPage--">‹</button>
              <button
                v-for="p in officerVisiblePageNumbers"
                :key="p"
                class="page-num-btn"
                :class="{ active: p === officerCurrentPage, ellipsis: p === '...' }"
                :disabled="p === '...'"
                @click="p !== '...' && (officerCurrentPage = Number(p))"
              >
                {{ p }}
              </button>
              <button class="page-nav-btn" :disabled="officerCurrentPage >= officerTotalPages" @click="officerCurrentPage++">›</button>
              <button class="page-nav-btn" :disabled="officerCurrentPage >= officerTotalPages" @click="officerCurrentPage = officerTotalPages">»</button>
            </div>
          </div>
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
            อนุมัตินัดหมายให้คุณ <strong>{{ targetBooking.tenant_name }}</strong> เข้าดูแผง <strong>{{ targetBooking.stall_number }}</strong> ({{ targetBooking.market_name }}) วันที่ {{ targetBooking.visit_date }} ({{ targetBooking.visit_time_slot }})
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
          <button class="btn btn-secondary" @click="showApproveModal = false">ยกเลิก</button>
          <button class="btn btn-primary" @click="confirmApprove">ยืนยันการอนุมัตินัดหมาย</button>
        </div>
      </div>
    </div>

    <!-- 2. Officer Reject Modal -->
    <div v-if="showRejectModal && targetBooking" class="modal-overlay" @click.self="showRejectModal = false">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; color: #e11d48; font-weight: 700;">ไม่อนุมัตินัดหมายดูแผง ({{ targetBooking.booking_number }})</h3>
          <button class="btn-logout" @click="showRejectModal = false" aria-label="ปิด">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px 14px; font-size: 0.85rem; color: #9f1239; margin-bottom: 14px; display: flex; align-items: flex-start; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>ตามกฎของระบบ เมื่อเจ้าหน้าที่ไม่อนุมัติ สิทธิ์การถือแผงจะถูกปล่อย และเลื่อนคิวที่ 1 ขึ้นมาทันที</span>
          </div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label">ระบุเหตุผลในการไม่อนุมัติ (บังคับเลือก) *</label>
            <select v-model="rejectReasonDropdown" class="form-select">
              <option value="แผงปิดปรับปรุงระบบสาธารณูปโภค">แผงปิดปรับปรุงระบบสาธารณูปโภค</option>
              <option value="แผงมีผู้เช่าแล้ว / มีสัญญาเดิมผูกพัน">แผงมีผู้เช่าแล้ว / มีสัญญาเดิมผูกพัน</option>
              <option value="ประเภทสินค้าไม่ตรงกับผังการจัดโซนของตลาด">ประเภทสินค้าไม่ตรงกับผังการจัดโซนของตลาด</option>
              <option value="ผู้ขอจองมีประวัติค้างชำระหรือผิดเงื่อนไข">ผู้ขอจองมีประวัติค้างชำระหรือผิดเงื่อนไข</option>
              <option value="อื่นๆ (ระบุในหมายเหตุ)">อื่นๆ (ระบุในหมายเหตุ)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">ข้อความคำชี้แจงเพิ่มเติมถึงผู้เช่า</label>
            <textarea v-model="rejectionReasonText" rows="2" class="form-textarea" placeholder="คำอธิบายเพิ่มเติมเพื่อแจ้งให้ผู้เช่าทราบ..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showRejectModal = false">ยกเลิก</button>
          <button class="btn btn-danger" @click="confirmReject">ยืนยันไม่อนุมัติและปล่อยคิว</button>
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
            <label class="form-label">เลือกวันที่นัดชม *</label>
            <input type="date" v-model="slotDate" class="form-input" :min="new Date().toISOString().slice(0, 10)" />
          </div>
          <div class="form-group">
            <label class="form-label">เลือกช่วงเวลานัดชม *</label>
            <select v-model="slotTime" class="form-select">
              <option value="09:00 - 10:30">09:00 - 10:30 น. (ช่วงเช้า)</option>
              <option value="10:30 - 12:00">10:30 - 12:00 น. (ช่วงสาย)</option>
              <option value="13:00 - 14:00">13:00 - 14:00 น. (ช่วงบ่าย)</option>
              <option value="14:00 - 15:30">14:00 - 15:30 น. (ช่วงบ่ายแก่)</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showSelectSlotModal = false">ยกเลิก</button>
          <button class="btn btn-primary" @click="confirmSelectSlot">บันทึกวันนัดหมาย</button>
        </div>
      </div>
    </div>

    <!-- 4. Details Modal (3-Phase Lifecycle & Timeline) -->
    <BookingDetailsModal
      :show="showDetailsModal"
      :booking="targetBooking"
      :role="currentRole"
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
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { get, post } = useApi()
const { user, role: authRole, switchRole: authSwitchRole } = useAuth()
const { showAlert, showConfirm, showSuccess, showError, showWarning } = useAppAlert()

const loading = ref(true)
const bookings = ref<any[]>([])

// Role state ('tenant' | 'officer')
const currentRole = ref<'tenant' | 'officer'>('officer')

// Officer Specific State
const officerSelectedMarket = ref(String(route.query.market || 'all'))
const officerActiveTab = ref<'all' | 'pending' | 'approved' | 'interested' | 'applied' | 'cancelled'>('all')
const officerOnlyToday = ref(false)
const officerViewMode = ref<'card' | 'table'>('card')
const officerSearchQuery = ref('')

// Tenant Specific State
const tenantStatusTab = ref<'all' | 'pending' | 'completed' | 'cancelled'>('all')
const tenantSubFilter = ref<'all' | 'pending_approval' | 'approved' | 'interested'>('all')
const showTenantPendingTooltip = ref(false)
const tenantSearchQuery = ref('')

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

// Accordion open/collapse states for Tenant view
const openMarkets = ref<Record<string, boolean>>({
  'ตลาดนัดจตุจักร': true,
  'ตลาดบางแคภิรมย์': false,
  'ตลาดพระเครื่อง': false
})

const collapsedCards = ref<Record<number, boolean>>({})

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 10

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

const slotDate = ref(new Date(Date.now() + 86400000).toISOString().slice(0, 10))
const slotTime = ref('13:00 - 14:00')

// Load Bookings from API
const loadBookings = async () => {
  loading.value = true
  try {
    const res = await get('/bookings', { _t: Date.now() })
    bookings.value = Array.isArray(res) ? res : []
  } catch (err) {
    console.error('Failed to load bookings:', err)
  } finally {
    loading.value = false
  }
}

// Switch Role
const switchRole = (newRole: 'tenant' | 'officer') => {
  currentRole.value = newRole
  if (authSwitchRole) {
    authSwitchRole(newRole === 'tenant' ? 'tenant' : 'admin')
  }
}

// ============================================================
// TENANT COMPUTEDS
// ============================================================
const countAll = computed(() => bookings.value.length)

const countPending = computed(() => {
  return bookings.value.filter(b =>
    ['pending', 'pending_approval', 'approved', 'waiting_queue', 'pending_slot', 'interested'].includes(b.status)
  ).length
})

const tenantCountPendingApproval = computed(() => {
  return bookings.value.filter(b =>
    ['pending', 'pending_approval', 'waiting_queue', 'pending_slot'].includes(b.status)
  ).length
})

const tenantCountApproved = computed(() => {
  return bookings.value.filter(b => b.status === 'approved').length
})

const tenantCountInterested = computed(() => {
  return bookings.value.filter(b => b.status === 'interested').length
})

const countCompleted = computed(() => {
  return bookings.value.filter(b =>
    ['completed', 'lease_applied'].includes(b.status)
  ).length
})

const countCancelled = computed(() => {
  return bookings.value.filter(b =>
    ['cancelled', 'rejected', 'not_interested', 'no_show'].includes(b.status)
  ).length
})

const getTenantTabName = (tab: string) => {
  switch (tab) {
    case 'pending': return 'รอดำเนินการ'
    case 'completed': return 'เสร็จสิ้น'
    case 'cancelled': return 'ยกเลิก'
    default: return 'รายการทั้งหมด'
  }
}

const filteredTenantBookings = computed(() => {
  let list = bookings.value

  if (tenantStatusTab.value === 'pending') {
    if (tenantSubFilter.value === 'pending_approval') {
      list = list.filter(b =>
        ['pending', 'pending_approval', 'waiting_queue', 'pending_slot'].includes(b.status)
      )
    } else if (tenantSubFilter.value === 'approved') {
      list = list.filter(b => b.status === 'approved')
    } else if (tenantSubFilter.value === 'interested') {
      list = list.filter(b => b.status === 'interested')
    } else {
      list = list.filter(b =>
        ['pending', 'pending_approval', 'approved', 'waiting_queue', 'pending_slot', 'interested'].includes(b.status)
      )
    }
  } else if (tenantStatusTab.value === 'completed') {
    list = list.filter(b =>
      ['completed', 'lease_applied'].includes(b.status)
    )
  } else if (tenantStatusTab.value === 'cancelled') {
    list = list.filter(b =>
      ['cancelled', 'rejected', 'not_interested', 'no_show'].includes(b.status)
    )
  }

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

  return list
})

const tenantMarketGroups = computed(() => {
  const groups: Record<string, any[]> = {}

  filteredTenantBookings.value.forEach(b => {
    const mkt = b.market_name || 'ตลาดนัดจตุจักร'
    if (!groups[mkt]) {
      groups[mkt] = []
    }
    groups[mkt].push(b)
  })

  const result = Object.keys(groups).map(name => ({
    name,
    bookings: groups[name]
  }))

  result.sort((a, b) => {
    if (a.name.includes('จตุจักร')) return -1
    if (b.name.includes('จตุจักร')) return 1
    return a.name.localeCompare(b.name, 'th')
  })

  return result
})

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
  set.add('ตลาดสิงหนาท')
  set.add('ตลาดมีนบุรี')
  set.add('ตลาดธนบุรี (สนามหลวง 2)')
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'))
})

const officerMarketBookings = computed(() => {
  if (!officerSelectedMarket.value || officerSelectedMarket.value === 'all') {
    return bookings.value
  }
  return bookings.value.filter(b =>
    !b.market_name ||
    b.market_name.includes(officerSelectedMarket.value) ||
    officerSelectedMarket.value.includes(b.market_name)
  )
})

const officerCountToday = computed(() => {
  return officerMarketBookings.value.filter(b =>
    b.status === 'approved' && (b.visit_date?.includes('19 ตุลาคม') || b.visit_date?.includes('วันนี้') || !b.visit_date)
  ).length
})

const officerCountPending = computed(() => {
  return officerMarketBookings.value.filter(b =>
    b.status === 'pending_approval' || b.status === 'pending'
  ).length
})

const officerCountApproved = computed(() => {
  return officerMarketBookings.value.filter(b => b.status === 'approved').length
})

const officerCountInterested = computed(() => {
  return officerMarketBookings.value.filter(b => b.status === 'interested').length
})

const officerCountApplied = computed(() => {
  return officerMarketBookings.value.filter(b => b.status === 'lease_applied' || b.status === 'completed').length
})

const officerCountCancelled = computed(() => {
  return officerMarketBookings.value.filter(b =>
    ['cancelled', 'rejected', 'not_interested', 'no_show'].includes(b.status)
  ).length
})

const filteredOfficerBookings = computed(() => {
  let list = officerMarketBookings.value

  // Filter by Tab (ทั้งหมด | รอเจ้าหน้าที่อนุมัติ | นัดหมายสำเร็จ | รอผู้เช่ายื่นคำร้อง | ยื่นคำร้องสำเร็จ | ยกเลิก)
  if (officerActiveTab.value === 'pending') {
    list = list.filter(b => b.status === 'pending_approval' || b.status === 'pending')
  } else if (officerActiveTab.value === 'approved') {
    list = list.filter(b => b.status === 'approved')
    if (officerOnlyToday.value) {
      list = list.filter(b => b.visit_date?.includes('19 ตุลาคม') || b.visit_date?.includes('วันนี้') || !b.visit_date)
    }
  } else if (officerActiveTab.value === 'interested') {
    list = list.filter(b => b.status === 'interested')
  } else if (officerActiveTab.value === 'applied') {
    list = list.filter(b => b.status === 'lease_applied' || b.status === 'completed')
  } else if (officerActiveTab.value === 'cancelled') {
    list = list.filter(b => ['cancelled', 'rejected', 'not_interested', 'no_show'].includes(b.status))
  }

  // Filter by Search Query
  if (officerSearchQuery.value.trim()) {
    const q = officerSearchQuery.value.trim().toLowerCase().replace('#', '')
    list = list.filter(b => {
      const bNum = (b.booking_number || '').toLowerCase().replace('#', '')
      const stall = (b.stall_number || '').toLowerCase()
      const tenant = (b.tenant_name || '').toLowerCase()
      const phone = (b.tenant_phone || '').toLowerCase()
      return bNum.includes(q) || stall.includes(q) || tenant.includes(q) || phone.includes(q)
    })
  }

  return list
})

const getOfficerTabName = (tab: string) => {
  switch (tab) {
    case 'pending': return 'รอเจ้าหน้าที่อนุมัติ'
    case 'approved': return 'นัดหมายสำเร็จ'
    case 'interested': return 'รอผู้เช่ายื่นคำร้อง'
    case 'applied': return 'ยื่นคำร้องสำเร็จ'
    case 'cancelled': return 'ยกเลิก'
    default: return 'รายการทั้งหมด'
  }
}

// Pagination for Officer
const officerCurrentPage = ref(1)
const officerItemsPerPage = 10

const officerTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredOfficerBookings.value.length / officerItemsPerPage) || 1)
})

const paginatedOfficerBookings = computed(() => {
  const start = (officerCurrentPage.value - 1) * officerItemsPerPage
  return filteredOfficerBookings.value.slice(start, start + officerItemsPerPage)
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
  if (openMarkets.value[marketName] === undefined) {
    return marketName === 'ตลาดนัดจตุจักร'
  }
  return !!openMarkets.value[marketName]
}

const toggleMarket = (marketName: string) => {
  openMarkets.value[marketName] = !isMarketOpen(marketName)
}

const isCardExpanded = (bookingId: number) => {
  return collapsedCards.value[bookingId] !== true
}

const toggleCardExpanded = (bookingId: number) => {
  collapsedCards.value[bookingId] = !collapsedCards.value[bookingId]
}

// Pagination for Tenant
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredTenantBookings.value.length / itemsPerPage) || 10)
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
const formatBookingNumber = (bNum: string | number) => {
  if (!bNum) return '#3001'
  const str = String(bNum)
  return str.startsWith('#') ? str : `#${str}`
}

const formatCreatedDate = (dateStr: string) => {
  if (!dateStr) return '7 ตุลาคม 2569 เวลา 10.30 น.'
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

const formatThaiVisitDate = (dateStr: string) => {
  if (!dateStr) return 'จันทร์ 19 ตุลาคม 2569'
  if (dateStr.includes('จันทร์') || dateStr.includes('อังคาร') || dateStr.includes('พุธ') || dateStr.includes('พฤหัสบดี') || dateStr.includes('ศุกร์') || dateStr.includes('เสาร์') || dateStr.includes('อาทิตย์')) {
    return dateStr
  }
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
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
    return dateStr
  }
}

const getDaysRemainingBadge = (dateStr: string) => {
  if (!dateStr) return 'อีก 4 วัน'
  if (dateStr.includes('อีก')) {
    const match = dateStr.match(/อีก\s*\d+\s*วัน/)
    return match ? match[0] : 'อีก 4 วัน'
  }
  try {
    const today = new Date('2026-10-15')
    const target = new Date(dateStr)
    if (!isNaN(target.getTime())) {
      const diffMs = target.getTime() - today.getTime()
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays > 0) return `อีก ${diffDays} วัน`
      if (diffDays === 0) return 'วันนี้'
      return null
    }
  } catch {}
  return 'อีก 4 วัน'
}

// 3-Phase Stepper Checkers
const isStepCompleted = (status: string, step: number) => {
  if (step === 1) return ['approved', 'interested', 'lease_applied', 'completed'].includes(status)
  if (step === 2) return ['interested', 'lease_applied', 'completed'].includes(status)
  if (step === 3) return ['lease_applied', 'completed'].includes(status)
  return false
}

const isStepActive = (status: string, step: number) => {
  if (step === 1) return ['pending', 'pending_approval', 'waiting_queue', 'pending_slot'].includes(status)
  if (step === 2) return status === 'approved'
  if (step === 3) return status === 'interested'
  return false
}

// Status Badges & Descriptions
const getStatusBadgeLabel = (status: string) => {
  switch (status) {
    case 'pending_approval':
    case 'pending': return 'รอเจ้าหน้าที่อนุมัติ'
    case 'approved': return 'นัดหมายสำเร็จ'
    case 'interested': return 'รอผู้เช่ายื่นคำร้อง'
    case 'waiting_queue': return 'รอคิว'
    case 'lease_applied':
    case 'completed': return 'ยื่นคำร้องสำเร็จ'
    case 'rejected': return 'ไม่อนุมัติ'
    case 'not_interested': return 'สละสิทธิ์'
    case 'cancelled': return 'ยกเลิก'
    case 'no_show': return 'ไม่มาตามนัด (ยกเลิก)'
    default: return 'นัดหมายสำเร็จ'
  }
}

const getStatusPillClass = (status: string) => {
  switch (status) {
    case 'approved':
    case 'lease_applied':
    case 'completed': return 'pill-green'
    case 'interested': return 'pill-blue'
    case 'pending_approval':
    case 'pending':
    case 'waiting_queue': return 'pill-amber'
    case 'rejected':
    case 'cancelled':
    case 'no_show':
    case 'not_interested': return 'pill-gray'
    default: return 'pill-green'
  }
}

const getCardBorderClass = (status: string) => {
  switch (status) {
    case 'pending_approval':
    case 'pending':
    case 'waiting_queue':
      return 'border-status-pending'
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
      return 'border-status-muted'
    default:
      return ''
  }
}

const getStatusDescription = (status: string) => {
  switch (status) {
    case 'rejected': return 'รายการนี้ไม่ได้รับการอนุมัติ และปล่อยสิทธิ์แผงแล้ว'
    case 'cancelled': return 'รายการจองถูกยกเลิกแล้ว'
    case 'not_interested': return 'ผู้ขอจองสละสิทธิ์ไม่สนใจเช่า'
    case 'no_show': return 'ผู้ขอจองไม่มาตามนัดหมาย ระบบสละสิทธิ์ให้คิวถัดไป'
    case 'completed': return 'กระบวนการจองและทำสัญญาเสร็จสมบูรณ์'
    default: return 'ติดตามสถานะการจองได้จากระบบ'
  }
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
  try {
    await post(`/bookings/${targetBooking.value.id}/approve`, {
      meeting_point: approveMeetingPoint.value,
      escort_officer: approveEscortOfficer.value,
      officer_notes: officerNotes.value
    })
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
  try {
    await post(`/bookings/${targetBooking.value.id}/reject`, {
      rejection_reason: rejectReasonDropdown.value,
      officer_notes: rejectionReasonText.value
    })
    showRejectModal.value = false
    await loadBookings()
    await showSuccess('ปฏิเสธการนัดหมายและเลื่อนลำดับคิวเรียบร้อย', 'สำเร็จ')
  } catch (err: any) {
    await showError(err?.data?.detail || 'เกิดข้อผิดพลาด', 'ข้อผิดพลาด')
  }
}

const handleMarkVisited = async (b: any) => {
  const confirmed = await showConfirm(
    `ยืนยันว่าคุณ ${b.tenant_name} ต้องการเช่าแผง ${b.stall_number} ใช่หรือไม่?\n(ระบบจะเปลี่ยนสถานะเป็น "รอผู้เช่ายื่นคำร้อง" เพื่อให้ผู้เช่ายื่นคำร้องขอเช่าได้ทันที)`,
    {
      title: 'ยืนยันการเช่า',
      type: 'info',
      confirmText: 'ยืนยันการเช่า',
      cancelText: 'ยกเลิก'
    }
  )
  if (confirmed) {
    try {
      await post(`/bookings/${b.id}/mark-visited`, {
        officer_notes: 'เจ้าหน้าที่ยืนยันการเช่าเรียบร้อย รอผู้เช่ายื่นคำร้อง'
      })
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
  const confirmed = await showConfirm(
    `คุณต้องการ "ยกเลิกนัดหมาย" ของคุณ ${b.tenant_name} (แผง ${b.stall_number}) ใช่หรือไม่?\n(ระบบจะบันทึกยกเลิกและปล่อยสิทธิ์ให้คิวถัดไป)`,
    {
      title: 'ยืนยันยกเลิกนัดหมาย',
      type: 'warning',
      confirmText: 'ยืนยันยกเลิก',
      cancelText: 'ย้อนกลับ'
    }
  )
  if (confirmed) {
    try {
      await post(`/bookings/${b.id}/cancel`, {
        reason: 'เจ้าหน้าที่ยกเลิกการนัดหมาย / ผู้เช่าไม่มาตามนัด',
        by_officer: true
      })
      if (showDetailsModal.value) {
        showDetailsModal.value = false
      }
      await loadBookings()
      await showSuccess('ยกเลิกนัดหมายและปรับลำดับคิวเรียบร้อยแล้ว', 'สำเร็จ')
    } catch (err: any) {
      await showError(err?.data?.detail || 'เกิดข้อผิดพลาดในการยกเลิก', 'ข้อผิดพลาด')
    }
  }
}

const handleCancelBooking = async (b: any, reason: string) => {
  const isQueue = b.status === 'waiting_queue'
  const confirmed = await showConfirm(
    isQueue
      ? `คุณต้องการยกเลิกการต่อคิวแผง ${b.stall_number} (คิวที่ ${b.queue_position || 1}) หรือไม่?\n(หากยกเลิก คิวจะถูกปล่อยและไม่สามารถกู้คืนได้)`
      : `คุณต้องการยกเลิกรายการนี้หรือไม่? ${b.holding_stall ? '(หากยกเลิก แผงจะถูกส่งต่อให้คิวถัดไปทันที)' : ''}`,
    {
      title: 'ยืนยันยกเลิกการจอง',
      type: 'warning',
      confirmText: 'ยืนยันยกเลิก',
      cancelText: 'ย้อนกลับ'
    }
  )
  if (confirmed) {
    try {
      await post(`/bookings/${b.id}/cancel`, {
        reason,
        by_officer: currentRole.value === 'officer'
      })
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
  targetBooking.value = b
  showDetailsModal.value = true
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
  showSelectSlotModal.value = true
}

const confirmSelectSlot = async () => {
  if (!targetBooking.value) return
  try {
    await post(`/bookings/${targetBooking.value.id}/select-slot`, {
      visit_date: slotDate.value,
      visit_time_slot: slotTime.value
    })
    showSelectSlotModal.value = false
    await loadBookings()
    await showSuccess('บันทึกวันนัดหมายใหม่เรียบร้อยแล้ว', 'สำเร็จ')
  } catch (err: any) {
    await showError(err?.data?.detail || 'เกิดข้อผิดพลาด', 'ข้อผิดพลาด')
  }
}

const handleClearAllData = async () => {
  const confirmed = await showConfirm(
    'คุณต้องการล้างข้อมูลการจองและคำร้องทั้งหมด เพื่อเริ่มทดสอบจากศูนย์ ใช่หรือไม่?',
    {
      title: 'ยืนยันล้างข้อมูลทดสอบ',
      type: 'error',
      icon: 'trash',
      confirmText: 'ล้างข้อมูลทั้งหมด',
      cancelText: 'ยกเลิก'
    }
  )
  if (confirmed) {
    try {
      await post('/bookings/clear')
      await post('/applications/clear')
      await loadBookings()
      await showSuccess('ล้างข้อมูลการจองและคำร้องทั้งหมดเรียบร้อยแล้ว ทุกแผงกลับเป็นสถานะว่างพร้อมทดสอบ!', 'ล้างข้อมูลสำเร็จ')
    } catch (err: any) {
      await showError(err?.data?.detail || 'เกิดข้อผิดพลาดในการล้างข้อมูล', 'ล้างข้อมูลไม่สำเร็จ')
    }
  }
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

onMounted(async () => {
  await loadBookings()
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
  width: 260px;
  padding: 8px 12px 8px 36px;
  border: 1px solid #e2e8f0;
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

/* Loading & Empty States */
.loading-state-box,
.empty-state-box {
  text-align: center;
  padding: 48px 20px;
  color: #64748b;
}

.spin-icon {
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
  color: #3b82f6;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.empty-title {
  font-weight: 700;
  color: #0f172a;
  font-size: 1.05rem;
}

.empty-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 4px;
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
  font-size: 0.76rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 10px;
  border-radius: 12px;
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

/* Card Top Row */
.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.top-row-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.circle-status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.circle-status-icon.blue-circle {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
}

.booking-number-block .booking-label {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
  line-height: 1.1;
}

.booking-number-block .booking-id-text {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.booked-time-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #64748b;
  margin-left: 8px;
}

.top-row-right {
  display: flex;
  align-items: center;
  gap: 10px;
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
  grid-template-columns: 1.3fr 1fr 1fr;
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
  .officer-columns-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 580px) {
  .info-columns-grid,
  .officer-columns-grid {
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
  font-size: 0.72rem;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #dbeafe;
}

.stall-count-pill {
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  background: #f1f5f9;
  padding: 3px 12px;
  border-radius: 14px;
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
.officer-kpi-ribbon {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
  margin-bottom: 22px;
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
  font-size: 0.7rem;
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

/* 5. ยื่นคำร้องสำเร็จ (Emerald/Teal Theme) */
.kpi-applied .kpi-icon-box {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #d1fae5;
}
.kpi-applied .kpi-unit-pill {
  background: #dcfce7;
  color: #15803d;
}
.kpi-applied.active {
  border-color: #10b981;
  background: #f0fdf4;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

/* 5. ยกเลิก (Rose / Red Theme) */
.kpi-cancelled .kpi-icon-box {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}
.kpi-cancelled .kpi-unit-pill {
  background: #fee2e2;
  color: #be123c;
}
.kpi-cancelled.active {
  border-color: #ef4444;
  background: #fff5f5;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.kpi-urgent-pill {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.68rem;
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

/* Sub-filter chips below ribbon */
.tenant-subfilter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #eef2f6;
  border-radius: 12px;
  margin-top: -12px;
  margin-bottom: 22px;
}

.subfilter-label {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 600;
  margin-right: 4px;
}

.subfilter-chip {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 500;
  padding: 4px 11px;
  border-radius: 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.subfilter-chip:hover {
  border-color: #94a3b8;
  background: #f1f5f9;
}

.subfilter-chip.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
  font-weight: 600;
}

.subfilter-chip.active .dot-amber,
.subfilter-chip.active .dot-green,
.subfilter-chip.active .dot-blue {
  background: #ffffff;
}

.dot-amber { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; display: inline-block; }
.dot-green { width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block; }
.dot-blue { width: 6px; height: 6px; border-radius: 50%; background: #2563eb; display: inline-block; }

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

.view-mode-toggle {
  display: inline-flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.vm-btn {
  background: transparent;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.vm-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-text {
  font-size: 0.72rem;
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
}

.officer-custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
  min-width: 1100px;
}

.officer-custom-table th {
  background: transparent !important;
  color: #64748b;
  font-weight: 500;
  font-size: 0.825rem;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
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

.clickable-id {
  color: #2563eb !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  cursor: pointer;
  text-decoration: none !important;
  display: inline-block;
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
  gap: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;
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
</style>
