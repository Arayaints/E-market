<template>
  <div>
    <AppHeader />
    <main class="content-body manage-page">
      <AppBreadcrumb
        v-if="!isStaff"
        :market="marketName"
        :marketId="marketId"
        :items="breadcrumbItems"
        :current="breadcrumbCurrent"
        :backTo="`/stalls?market=${marketId}`"
        :onBack="handleBreadcrumbBack"
      >
        <template v-if="!isInspectMode" #actions>
          <div class="header-actions">
            <template v-if="isManageDataLoading">
              <span class="header-status-skeleton" aria-label="กำลังโหลดสถานะผัง"></span>
              <span class="header-action-skeleton" aria-hidden="true"></span>
            </template>
            <template v-else>
              <span class="draft-status" :class="{ published: !hasUnsavedChanges && gisPublished, 'is-dirty': hasUnsavedChanges }">
                <i></i>
                {{ hasUnsavedChanges ? 'มีการแก้ไขที่ยังไม่บันทึก' : (gisPublished ? 'บันทึกและเผยแพร่แล้ว' : 'ไม่มีการแก้ไข') }}
              </span>
              <AppButton
                size="sm"
                :variant="hasUnsavedChanges || !gisPublished ? 'primary' : 'outline'"
                :disabled="gisPublished && !hasUnsavedChanges"
                :loading="savingGIS"
                @click="confirmAndSaveGIS"
              >
                {{ hasUnsavedChanges ? 'บันทึกการแก้ไข' : (gisPublished ? 'บันทึกการแก้ไข' : 'เผยแพร่ผัง') }}
              </AppButton>
            </template>
          </div>
        </template>
      </AppBreadcrumb>

      <section v-if="isInspectMode" class="staff-dashboard-intro" aria-labelledby="staff-dashboard-title">
        <div class="dashboard-intro-left">
          <h1 id="staff-dashboard-title">แดชบอร์ด</h1>
          <p class="dashboard-updated-sub">ข้อมูลอัปเดตล่าสุด ณ วันที่ {{ dashboardUpdatedDateText }}</p>
        </div>
        <div class="dashboard-intro-actions">
          <AppSegmentedControl
            :model-value="dashboardViewMode"
            :options="dashboardViewOptions"
            aria-label="สลับมุมมองแดชบอร์ด"
            @update:model-value="val => setDashboardViewMode(val as 'summary' | 'map')"
          />
        </div>
      </section>

      <!-- ================================================================ -->
      <!-- SUMMARY DASHBOARD VIEW (สรุปข้อมูลของจริงสำหรับเจ้าหน้าที่ตลาด)     -->
      <!-- ================================================================ -->
      <section v-if="isInspectMode && dashboardViewMode === 'summary'" class="officer-summary-dashboard" aria-label="สรุปข้อมูลแดชบอร์ดตลาด">
        <!-- 1. Operational KPI Strip (ตัวเลขสำคัญสำหรับเจ้าหน้าที่ คลิกไปจัดการได้ทันที) -->
        <div class="map-summary-grid dash-kpi-ribbon">
          <NuxtLink to="/bookings" class="map-summary-card summary-reserved" style="text-decoration: none;">
            <span class="map-summary-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>
            </span>
            <span class="map-summary-content">
              <small class="map-summary-title">รออนุมัติวันนัด</small>
              <span class="map-summary-value-row">
                <strong class="map-summary-count">{{ realActionCounts.pendingBookings.toLocaleString('th-TH') }}</strong>
                <em class="map-summary-unit-pill">รายการ</em>
              </span>
            </span>
          </NuxtLink>

          <NuxtLink to="/applications" class="map-summary-card summary-total" style="text-decoration: none;">
            <span class="map-summary-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </span>
            <span class="map-summary-content">
              <small class="map-summary-title">คำร้องรอตรวจ</small>
              <span class="map-summary-value-row">
                <strong class="map-summary-count">{{ realActionCounts.pendingOfficerApps.toLocaleString('th-TH') }}</strong>
                <em class="map-summary-unit-pill">รายการ</em>
              </span>
            </span>
          </NuxtLink>

          <NuxtLink to="/contracts" class="map-summary-card summary-available" style="text-decoration: none;">
            <span class="map-summary-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
            </span>
            <span class="map-summary-content">
              <small class="map-summary-title">สัญญาเช่าที่มีผล</small>
              <span class="map-summary-value-row">
                <strong class="map-summary-count">{{ marketContracts.length.toLocaleString('th-TH') }}</strong>
                <em class="map-summary-unit-pill">ฉบับ</em>
              </span>
            </span>
          </NuxtLink>

          <div class="map-summary-card summary-occupied" style="cursor: default;">
            <span class="map-summary-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </span>
            <span class="map-summary-content">
              <small class="map-summary-title">มูลค่าค่าเช่ารวม/เดือน</small>
              <span class="map-summary-value-row">
                <strong class="map-summary-count">฿{{ realMarketSummary.totalMonthlyRent.toLocaleString('th-TH') }}</strong>
              </span>
            </span>
          </div>
        </div>

        <!-- 2. Two Visual Chart Cards: Donut Chart (สัดส่วนสถานะพื้นที่) & Bar Chart (สัดส่วนตามหมวดสินค้า) -->
        <div class="dash-two-col-grid">
          <!-- Left Card: Donut Chart สัดส่วนสถานะแผงและมูลค่าค่าเช่า -->
          <article class="dash-system-card">
            <div class="dash-card-header">
              <div>
                <h2 class="dash-card-title">สัดส่วนสถานะพื้นที่</h2>
                <p class="dash-card-subtitle">{{ realMarketSummary.zonesCount }} โซน · เฉลี่ย ฿{{ realMarketSummary.avgRent.toLocaleString('th-TH') }}/แผง</p>
              </div>
              <AppButton size="sm" variant="outline" @click="setDashboardViewMode('map')">ดูผังแผนที่</AppButton>
            </div>

            <div class="dash-donut-layout">
              <div class="dash-donut-wrap">
                <svg viewBox="0 0 140 140" class="dash-donut-svg" aria-hidden="true">
                  <circle cx="70" cy="70" r="54" fill="none" stroke="#f1f5f9" stroke-width="16" />
                  <circle
                    v-for="seg in donutSegments"
                    :key="seg.key"
                    cx="70"
                    cy="70"
                    r="54"
                    fill="none"
                    :stroke="seg.color"
                    stroke-width="16"
                    :stroke-dasharray="`${seg.dash} ${donutCircumference}`"
                    :stroke-dashoffset="-seg.offset"
                    transform="rotate(-90 70 70)"
                  />
                </svg>
                <div class="dash-donut-center">
                  <strong>{{ realMarketSummary.total.toLocaleString('th-TH') }}</strong>
                  <span>แผงทั้งหมด</span>
                </div>
              </div>

              <div class="dash-donut-legend-list">
                <button type="button" class="dash-legend-row" @click="jumpToMapWithFilter('available')">
                  <span class="legend-left"><i class="dot-available"></i>ว่าง</span>
                  <div class="legend-right">
                    <strong>{{ realMarketSummary.available.toLocaleString('th-TH') }}</strong>
                    <span class="dash-status-badge badge-green">{{ realMarketSummary.availablePct }}%</span>
                  </div>
                </button>
                <button type="button" class="dash-legend-row" @click="jumpToMapWithFilter('reserved')">
                  <span class="legend-left"><i class="dot-reserved"></i>ติดจอง</span>
                  <div class="legend-right">
                    <strong>{{ realMarketSummary.reserved.toLocaleString('th-TH') }}</strong>
                    <span class="dash-status-badge badge-amber">{{ realMarketSummary.reservedPct }}%</span>
                  </div>
                </button>
                <button type="button" class="dash-legend-row" @click="jumpToMapWithFilter('occupied')">
                  <span class="legend-left"><i class="dot-occupied"></i>มีผู้เช่า</span>
                  <div class="legend-right">
                    <strong>{{ realMarketSummary.occupied.toLocaleString('th-TH') }}</strong>
                    <span class="dash-status-badge badge-gray">{{ realMarketSummary.occupancyPct }}%</span>
                  </div>
                </button>
              </div>
            </div>

            <div class="dash-mini-rev-row">
              <div class="dash-mini-rev-item">
                <span>ค่าเช่าปัจจุบัน</span>
                <strong class="is-blue">฿{{ realMarketSummary.occupiedMonthlyRent.toLocaleString('th-TH') }}</strong>
              </div>
              <div class="dash-mini-rev-item">
                <span>มูลค่าแผงว่าง</span>
                <strong class="is-green">฿{{ realMarketSummary.availableMonthlyRent.toLocaleString('th-TH') }}</strong>
              </div>
            </div>
          </article>

          <!-- Right Card: Horizontal Bar Chart สัดส่วนแผงแยกตามหมวดสินค้า -->
          <article class="dash-system-card">
            <div class="dash-card-header">
              <div>
                <h2 class="dash-card-title">สัดส่วนแผงตามหมวดสินค้า</h2>
                <p class="dash-card-subtitle">{{ categoryChartRows.length }} หมวดสินค้าในตลาด</p>
              </div>
            </div>

            <div class="dash-bar-chart-list">
              <div v-for="cat in categoryChartRows" :key="cat.name" class="dash-bar-row">
                <div class="dash-bar-top">
                  <span class="dash-bar-name">
                    <i :style="{ backgroundColor: cat.color }"></i>
                    {{ cat.name }}
                  </span>
                  <span class="dash-bar-meta">
                    <strong>{{ cat.total.toLocaleString('th-TH') }}</strong> แผง ({{ cat.pct }}%)
                  </span>
                </div>
                <div class="dash-bar-track">
                  <span class="dash-bar-fill" :style="{ width: `${cat.barPct}%`, backgroundColor: cat.color }"></span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- 3. Zone / Project Breakdown Table (มาตรฐาน Table Design Standards ของระบบ) -->
        <article class="dash-system-card dash-table-card">
          <div class="dash-table-header">
            <div class="dash-table-header-left">
              <h2 class="dash-card-title">ตารางสรุปรายโซน</h2>
              <p class="dash-card-subtitle">{{ filteredZoneRows.length }} โซน</p>
            </div>
            <div class="dash-table-header-actions">
              <div class="dash-category-select">
                <AppSelect
                  v-model="dashZoneCategoryFilter"
                  :options="dashCategoryFilterOptions"
                  placeholder="ทุกหมวดสินค้า"
                />
              </div>
              <div class="dash-search-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  v-model="dashZoneSearchQuery"
                  type="text"
                  placeholder="ค้นหาโซน..."
                />
              </div>
            </div>
          </div>

          <div class="dash-table-wrap">
            <table class="dash-std-table">
              <thead>
                <tr>
                  <th>โซน</th>
                  <th>หมวดสินค้า</th>
                  <th class="text-right">ทั้งหมด</th>
                  <th class="text-center">ว่าง</th>
                  <th class="text-center">ติดจอง</th>
                  <th class="text-center">มีผู้เช่า</th>
                  <th style="width: 150px;">อัตราเช่า</th>
                  <th class="text-right">ค่าเช่าเฉลี่ย</th>
                  <th class="text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="zone in paginatedZoneRows" :key="zone.id">
                  <td>
                    <div class="zone-name-cell">
                      <span class="zone-color-dot" :style="{ backgroundColor: zone.color }"></span>
                      <div>
                        <strong>{{ zone.name }}</strong>
                        <small v-if="zone.floorsCount > 1">{{ zone.floorsCount }} ชั้น</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ zone.category }}</td>
                  <td class="text-right"><strong>{{ zone.total.toLocaleString('th-TH') }}</strong></td>
                  <td class="text-center">
                    <span class="dash-status-badge badge-green">{{ zone.available.toLocaleString('th-TH') }}</span>
                  </td>
                  <td class="text-center">
                    <span class="dash-status-badge" :class="zone.reserved > 0 ? 'badge-amber' : 'badge-gray'">{{ zone.reserved.toLocaleString('th-TH') }}</span>
                  </td>
                  <td class="text-center">
                    <span class="dash-status-badge badge-gray">{{ zone.occupied.toLocaleString('th-TH') }}</span>
                  </td>
                  <td>
                    <div class="zone-occ-cell">
                      <div class="zone-occ-bar">
                        <span :style="{ width: `${zone.occupancyPct}%` }"></span>
                      </div>
                      <strong>{{ zone.occupancyPct }}%</strong>
                    </div>
                  </td>
                  <td class="text-right"><strong>฿{{ zone.avgMonthlyRent.toLocaleString('th-TH') }}</strong></td>
                  <td class="text-right">
                    <button type="button" class="dash-table-view-btn" @click="openZoneOnMap(zone.id)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      <span>ดูผัง</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredZoneRows.length === 0">
                  <td colspan="9" class="dash-empty-row">ไม่พบข้อมูลโซน</td>
                </tr>
              </tbody>
            </table>
          </div>

          <AppPagination
            v-if="filteredZoneRows.length > 0"
            v-model="dashZonePage"
            :total-items="filteredZoneRows.length"
            :items-per-page="dashZonePageSize"
            :page-size-options="[5, 10, 20, 50]"
            unit-label="โซน"
            @update:items-per-page="val => { dashZonePageSize = val; dashZonePage = 1 }"
          />
        </article>
      </section>

      <section v-if="!isInspectMode || dashboardViewMode === 'map'" class="workspace-grid">
        <article class="panel gis-panel">
          <div class="panel-heading gis-panel-heading">
            <div>
              <h2>{{ isInspectMode ? 'ผังแผงเช่า' : `จัดการแผงเช่า ${marketName}` }}</h2>
              <p v-if="isInspectMode">ทั้งหมด {{ totalMarketStalls.toLocaleString('th-TH') }} แผง</p>
            </div>
            <div class="gis-heading-right">
              <div v-if="isStaff && !isInspectMode" class="header-actions">
                <template v-if="isManageDataLoading">
                  <span class="header-status-skeleton" aria-label="กำลังโหลดสถานะผัง"></span>
                  <span class="header-action-skeleton" aria-hidden="true"></span>
                </template>
                <template v-else>
                  <span class="draft-status" :class="{ published: !hasUnsavedChanges && gisPublished, 'is-dirty': hasUnsavedChanges }">
                    <i></i>
                    {{ hasUnsavedChanges ? 'มีการแก้ไขที่ยังไม่บันทึก' : (gisPublished ? 'บันทึกและเผยแพร่แล้ว' : 'ไม่มีการแก้ไข') }}
                  </span>
                  <AppButton
                    size="sm"
                    :variant="hasUnsavedChanges || !gisPublished ? 'primary' : 'outline'"
                    :disabled="gisPublished && !hasUnsavedChanges"
                    :loading="savingGIS"
                    @click="confirmAndSaveGIS"
                  >
                    {{ hasUnsavedChanges ? 'บันทึกการแก้ไข' : (gisPublished ? 'บันทึกการแก้ไข' : 'เผยแพร่ผัง') }}
                  </AppButton>
                </template>
              </div>
              <div id="step1-map-toolbar" class="gis-map-toolbar"></div>
            </div>
          </div>
          <div v-if="isInspectMode" class="map-summary-grid" aria-label="สรุปสถานะแผงเช่า">
            <button type="button" class="map-summary-card summary-total" :class="{ active: dashboardStatusFilter === 'all' }" :aria-pressed="dashboardStatusFilter === 'all'" @click="setDashboardStatusFilter('all')">
              <span class="map-summary-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>
              </span>
              <span class="map-summary-content">
                <small class="map-summary-title">ทั้งหมด</small>
                <span class="map-summary-value-row">
                  <strong class="map-summary-count">{{ totalMarketStalls.toLocaleString('th-TH') }}</strong>
                  <em class="map-summary-unit-pill">แผง</em>
                </span>
              </span>
            </button>
            <button type="button" class="map-summary-card summary-available" :class="{ active: dashboardStatusFilter === 'available' }" :aria-pressed="dashboardStatusFilter === 'available'" @click="setDashboardStatusFilter('available')">
              <span class="map-summary-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="m8 12 2.5 2.5L16 9"></path></svg>
              </span>
              <span class="map-summary-content">
                <small class="map-summary-title">ว่าง</small>
                <span class="map-summary-value-row">
                  <strong class="map-summary-count">{{ stallStatusSummary.available.toLocaleString('th-TH') }}</strong>
                  <em class="map-summary-unit-pill">แผง</em>
                </span>
              </span>
            </button>
            <button type="button" class="map-summary-card summary-reserved" :class="{ active: dashboardStatusFilter === 'reserved' }" :aria-pressed="dashboardStatusFilter === 'reserved'" @click="setDashboardStatusFilter('reserved')">
              <span class="map-summary-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>
              </span>
              <span class="map-summary-content">
                <small class="map-summary-title">ติดจอง</small>
                <span class="map-summary-value-row">
                  <strong class="map-summary-count">{{ stallStatusSummary.reserved.toLocaleString('th-TH') }}</strong>
                  <em class="map-summary-unit-pill">แผง</em>
                </span>
              </span>
            </button>
            <button type="button" class="map-summary-card summary-occupied" :class="{ active: dashboardStatusFilter === 'occupied' }" :aria-pressed="dashboardStatusFilter === 'occupied'" @click="setDashboardStatusFilter('occupied')">
              <span class="map-summary-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </span>
              <span class="map-summary-content">
                <small class="map-summary-title">มีผู้เช่า</small>
                <span class="map-summary-value-row">
                  <strong class="map-summary-count">{{ stallStatusSummary.occupied.toLocaleString('th-TH') }}</strong>
                  <em class="map-summary-unit-pill">แผง</em>
                </span>
              </span>
            </button>
          </div>
          <MarketProjectsOverviewMap
            ref="mapRef"
            :marketId="marketId"
            :managedProjects="projects"
            :managedFacilities="facilities"
            :selectedProjectId="selectedProject?.id"
            :selectedStallCodes="activeHighlightedStallCodes"
            :stallStatusOverrides="stallStatusOverrides"
            :stallStatusFilter="dashboardStatusFilter"
            :onlyAvailable="false"
            :categoryFilter="null"
            mapStyle="standard"
            managementMode
            :inspectOnly="isInspectMode"
            @selectProject="selectProject"
            @requestExitProject="handleRequestExitProject"
            @exitProject="clearSelectedProject"
            @selectStall="selectStall"
            @updateProjectPolygon="updateProjectPolygon"
            @updateStallPolygon="updateStallPolygon"
            @requestAddProject="openZoneEditor"
            @requestAddStallLayout="openDrawnStall"
            @requestAddFacility="openFacilityEditor"
            @requestDeleteFacility="deleteFacility"
            @requestDeleteStall="deleteStall"
            @requestDeleteProject="deleteProject"
          >
            <template #overlay>
              <transition name="slide-fade">
                <div
                  v-if="showInspectStallOverlay && stallEdit.ident"
                  id="map-selected-stall-drawer"
                  class="inspect-selected-stall-drawer"
                >
                  <!-- 1. Stall Detail Header -->
                  <div class="issd-header">
                    <div class="issd-header-top">
                      <div class="issd-title-group">
                        <strong>แผง {{ stallEdit.ident }}</strong>
                        <span
                          class="issd-status-pill"
                          :class="`is-${stallEdit.stall_status || 'available'}`"
                        >
                          {{ stallEdit.stall_status === 'reserved' ? 'ติดจอง' : (stallEdit.stall_status === 'occupied' ? 'มีผู้เช่า' : 'ว่าง') }}
                        </span>
                      </div>
                      <button
                        type="button"
                        class="issd-close-btn"
                        title="ปิดหน้าต่างรายละเอียด"
                        aria-label="ปิด"
                        @click="closeStall"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                    <div class="issd-project-sub">
                      {{ cleanProjectName(selectedProject?.name || stallEdit.project_name || 'โซนแผงค้า') }}<template v-if="(selectedProject?.floors?.length || 0) > 1"> · {{ formatFloorDisplay(stallEdit.floor) }}</template>
                    </div>
                  </div>

                  <!-- 2. Stall Detail Body -->
                  <div class="issd-body">
                    <!-- Stall Photo Banner -->
                    <div
                      class="issd-photo-banner"
                      title="คลิกเพื่อดูภาพแผงเช่าทั้งหมด"
                      @click="openInspectPhotoPreview(0)"
                    >
                      <img :src="inspectStallPhotos[0]" :alt="`ภาพแผง ${stallEdit.ident}`" />
                      <div class="issd-photo-count-badge">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        <span>{{ inspectStallPhotos.length }} รูป</span>
                      </div>
                    </div>

                    <!-- Stall Specifications & Rates -->
                    <dl class="issd-detail-list">
                      <div class="issd-detail-row">
                        <dt>หมวดสินค้า</dt>
                        <dd>{{ stallEdit.category || selectedProject?.category || 'ทั่วไป' }}</dd>
                      </div>
                      <div class="issd-detail-row">
                        <dt>ขนาดพื้นที่</dt>
                        <dd>{{ stallEdit.width }} × {{ stallEdit.depth }} ม. ({{ inspectStallSizeSqm }} ตร.ม.)</dd>
                      </div>
                      <div class="issd-detail-row">
                        <dt>ค่าเช่ารายเดือน</dt>
                        <dd class="is-rent">{{ Number(stallEdit.monthly_rent || 1800).toLocaleString('th-TH') }} บาท</dd>
                      </div>
                      <div class="issd-detail-row">
                        <dt>ค่าเช่ารายวัน</dt>
                        <dd>{{ Number(stallEdit.daily_rent || 150).toLocaleString('th-TH') }} บาท</dd>
                      </div>
                      <div class="issd-detail-row">
                        <dt>ค่าธรรมเนียมแรกเข้า</dt>
                        <dd class="is-bold">{{ Number(inspectStallEntryFee).toLocaleString('th-TH') }} บาท</dd>
                      </div>
                    </dl>

                    <!-- Current Occupancy / Booking Summary -->
                    <div class="issd-occupancy-box" :class="`is-${stallEdit.stall_status || 'available'}`">
                      <div class="issd-occupancy-head">
                        <span>{{ inspectStallOccupancy.heading }}</span>
                        <small v-if="inspectStallOccupancy.refCode">{{ inspectStallOccupancy.refCode }}</small>
                      </div>
                      <strong>{{ inspectStallOccupancy.primaryText }}</strong>
                      <p v-if="inspectStallOccupancy.subText">{{ inspectStallOccupancy.subText }}</p>
                    </div>
                  </div>

                  <!-- 3. Sticky Footer CTA Button -->
                  <div class="issd-footer">
                    <NuxtLink :to="stallDetailUrl" class="issd-cta-btn">
                      <span>ดูรายละเอียด</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </NuxtLink>
                  </div>
                </div>
              </transition>
            </template>
          </MarketProjectsOverviewMap>
        </article>
      </section>
    </main>

    <Teleport to="body">
      <AppModal
        v-model="showZoneEditor"
        title="เพิ่มโซนบนผัง"
        :description="`พื้นที่ ${drawnZoneCoordinates.length} จุดที่วาดบนแผนที่จะถูกใช้เป็นขอบเขตโซน`"
      >
        <form class="zone-form" novalidate @submit.prevent="createZone">
          <label>
            <span>ชื่อโซน <b class="req-star">*</b></span>
            <AppInput v-model="zoneForm.name" placeholder="เช่น โซนร้านอาหารใหม่" :error="zoneErrors.name" @blur="validateZoneField('name')" />
          </label>
          <label>
            <span>รหัสโซน <b class="req-star">*</b></span>
            <AppInput v-model="zoneForm.sectionNumber" placeholder="เช่น E" :error="zoneErrors.sectionNumber" @blur="validateZoneField('sectionNumber')" />
          </label>
          <label>
            <span>จำนวนชั้น <b class="req-star">*</b></span>
            <AppInput v-model="zoneForm.floorCount" type="number" placeholder="1 - 20" :error="zoneErrors.floorCount" @blur="validateZoneField('floorCount')" />
          </label>
          <label>
            <span>หมวดสินค้า <b class="req-star">*</b></span>
            <AppSelect
              v-model="zoneForm.category"
              :options="marketCategoryOptions"
              placeholder="เลือกหมวดสินค้า"
              :error="zoneErrors.category"
              @change="validateZoneField('category')"
            />
          </label>
        </form>
        <template #footer>
          <AppButton variant="secondary" @click="dismissZoneEditor">ยกเลิก</AppButton>
          <AppButton @click="createZone">บันทึกโซน</AppButton>
        </template>
      </AppModal>

      <AppModal v-model="showFacilityEditor" title="เพิ่มจุดอำนวยความสะดวก" description="ตำแหน่งถูกกำหนดจากจุดที่เลือกบนผังแล้ว">
        <form class="facility-form" novalidate @submit.prevent="createFacility">
          <label>
            <span>ชื่อจุดบริการ <b class="req-star">*</b></span>
            <AppInput v-model="facilityForm.name" placeholder="เช่น ห้องน้ำอาคาร A" :error="facilityNameError" @blur="validateFacilityName" />
          </label>
          <label>
            <span>ประเภท <b class="req-star">*</b></span>
            <AppSelect v-model="facilityForm.type" :options="facilityTypeOptions" />
          </label>
        </form>
        <template #footer>
          <AppButton variant="secondary" @click="closeFacilityEditor">ยกเลิก</AppButton>
          <AppButton @click="createFacility">เพิ่มจุดบริการ</AppButton>
        </template>
      </AppModal>
      <div v-if="showStallEditor" class="drawer-backdrop" @click.self="closeStall"><aside class="stall-drawer">
        <header>
          <div>
            <span class="eyebrow">{{ stallDrawerMode === 'detail' ? 'STALL DETAIL' : (isCreatingNewStall ? 'NEW STALL' : 'EDIT STALL') }}</span>
            <h2>{{ stallDrawerMode === 'detail' ? (stallEdit.name || `แผง ${stallEdit.ident}`) : (isCreatingNewStall ? 'เพิ่มแผงเช่าใหม่' : `แก้ไขแผง ${stallEdit.ident}`) }}</h2>
            <p>{{ stallDrawerMode === 'detail' ? `รหัสแผง ${stallEdit.ident} · ดูข้อมูลการเช่า สัญญา และประวัติ` : (isCreatingNewStall ? 'ตั้งค่ารหัสแผง ขนาด และอัตราค่าเช่าสำหรับแผงที่เพิ่งวาดใหม่บนผัง' : `รหัสแผง ${stallEdit.ident} · แก้ไขข้อมูลขนาด สถานะ และอัตราค่าเช่าของแผงเดิม`) }}</p>
          </div>
          <button class="icon-button" type="button" @click="closeStall"><CloseIcon /></button>
        </header>
        <div class="drawer-body">
          <template v-if="stallDrawerMode === 'detail'">
            <section class="stall-detail-summary"><span class="soft-badge" :class="`status-${stallEdit.stall_status}`">{{ stallStatusLabel }}</span><strong>{{ stallEdit.project_name || 'ไม่ระบุโครงการ' }}</strong><span>โซน {{ stallEdit.zone_name || stallEdit.zone_id || '-' }} · ชั้น {{ stallEdit.floor || '-' }}</span></section>
            <AppSegmentedControl v-model="stallDetailTab" class="stall-detail-tabs" aria-label="เลือกข้อมูลแผง" :options="stallDetailTabOptions" />
            <dl v-if="stallDetailTab === 'info'" class="stall-detail-grid"><div><dt>ขนาดพื้นที่</dt><dd>{{ stallEdit.width || '-' }} × {{ stallEdit.depth || '-' }} ม.</dd></div><div><dt>ค่าเช่ารายเดือน</dt><dd>฿{{ Number(stallEdit.monthly_rent || 0).toLocaleString() }}</dd></div><div><dt>ค่าเช่ารายวัน</dt><dd>฿{{ Number(stallEdit.daily_rent || 0).toLocaleString() }}</dd></div><div><dt>หมวดสินค้า</dt><dd>{{ stallEdit.category || 'ยังไม่ระบุ' }}</dd></div><div class="full"><dt>รายละเอียด</dt><dd>{{ stallEdit.description || 'ยังไม่มีรายละเอียด' }}</dd></div></dl>
            <section v-else-if="stallDetailTab === 'contracts'" class="detail-section is-tab-content"><div class="detail-section-heading"><h3>สัญญาของแผงนี้</h3><AppButton size="sm" variant="outline" :to="`/contracts?stall=${encodeURIComponent(stallEdit.ident)}`">จัดการสัญญา</AppButton></div><div v-if="contracts.length" class="contract-list"><article v-for="contract in contracts" :key="contract.id"><div><strong>{{ contract.contract_number }}</strong><span>{{ contract.tenant_name }} · {{ contract.shop_name || 'ไม่ระบุชื่อร้าน' }}</span></div><span class="soft-badge">{{ contract.start_date }} – {{ contract.end_date }}</span></article></div><p v-else class="empty-state compact">ยังไม่มีสัญญาที่ผูกกับแผงนี้</p></section>
            <section v-else class="detail-section is-tab-content"><h3>ประวัติการแก้ไข</h3><div v-if="stallHistory.length" class="history-list"><div v-for="item in stallHistory" :key="item.id"><i></i><span><strong>{{ item.actor_name || 'ระบบ' }}</strong><small>{{ item.changes }} · {{ formatDate(item.created_at) }}</small></span></div></div><p v-else class="empty-state compact">ยังไม่มีประวัติการแก้ไข</p></section>
          </template>
          <form v-else class="form-grid" novalidate @submit.prevent="saveStall">
            <label>
              <span>รหัสแผง <b class="req-star">*</b></span>
              <AppInput v-model="stallEdit.ident" placeholder="เช่น A-001" :error="stallErrors.ident" @blur="validateStallField('ident')" />
            </label>
            <label>
              <span>ชื่อแผง</span>
              <AppInput v-model="stallEdit.name" placeholder="ระบุชื่อแผง (ถ้ามี)" />
            </label>
            <label>
              <span>โซน <b class="req-star">*</b></span>
              <AppSelect v-model="stallEdit.zone_id" :options="zoneOptions" />
            </label>
            <label>
              <span>โครงการ</span>
              <AppInput v-model="stallEdit.project_name" placeholder="ชื่อโครงการ" />
            </label>
            <label>
              <span>ชั้น <b class="req-star">*</b></span>
              <AppSelect v-model="stallEdit.floor" :options="floorOptions" />
            </label>
            <label>
              <span>สถานะ <b class="req-star">*</b></span>
              <AppSelect v-model="stallEdit.stall_status" :options="stallStatusOptions" />
            </label>
            <label>
              <span>กว้าง (เมตร) <b class="req-star">*</b></span>
              <AppInput v-model="stallEdit.width" type="number" placeholder="เช่น 2.0" :error="stallErrors.width" @blur="validateStallField('width')" />
            </label>
            <label>
              <span>ลึก (เมตร) <b class="req-star">*</b></span>
              <AppInput v-model="stallEdit.depth" type="number" placeholder="เช่น 2.0" :error="stallErrors.depth" @blur="validateStallField('depth')" />
            </label>
            <label>
              <span>ค่าเช่ารายวัน (บาท)</span>
              <AppInput v-model="stallEdit.daily_rent" type="number" placeholder="เช่น 150" />
            </label>
            <label>
              <span>ค่าเช่ารายเดือน (บาท) <b class="req-star">*</b></span>
              <AppInput v-model="stallEdit.monthly_rent" type="number" placeholder="เช่น 1800" :error="stallErrors.monthly_rent" @blur="validateStallField('monthly_rent')" />
            </label>
            <label class="full">
              <span>หมวดสินค้า</span>
              <AppSelect
                v-model="stallEdit.category"
                :options="stallCategoryOptions"
                placeholder="เลือกหมวดสินค้า"
              />
            </label>
            <label class="full">
              <span>รายละเอียด</span>
              <textarea v-model.trim="stallEdit.description" rows="3" placeholder="รายละเอียดเพิ่มเติมของแผง"></textarea>
            </label>
          </form>
        </div>
        <footer v-if="stallDrawerMode === 'detail'"><AppButton variant="secondary" @click="closeStall">ปิด</AppButton><AppButton variant="outline" :to="`/contracts?stall=${encodeURIComponent(stallEdit.ident)}`">จัดการสัญญา</AppButton><AppButton variant="primary" :to="stallDetailUrl">ดูรายละเอียดแผงฉบับเต็ม</AppButton></footer>
        <footer v-else :class="{ 'has-delete-btn': !isCreatingNewStall }">
          <AppButton v-if="!isCreatingNewStall" variant="danger-outline" @click="deleteStall()">
            <template #prefix><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/></svg></template>
            ลบแผง
          </AppButton>
          <div class="drawer-footer-right">
            <AppButton variant="secondary" @click="closeStall">ยกเลิก</AppButton>
            <AppButton :loading="savingStall" @click="saveStall">{{ isCreatingNewStall ? 'เพิ่มแผงเช่าใหม่' : 'บันทึกการแก้ไขแผง' }}</AppButton>
          </div>
        </footer>
      </aside></div>

      <transition name="modal-bounce">
        <div
          v-if="showUnsavedLeaveModal"
          class="unsaved-leave-backdrop"
          role="dialog"
          aria-modal="true"
          @click.self="resolveUnsavedLeave('cancel')"
        >
          <div class="unsaved-leave-card">
            <button
              type="button"
              class="unsaved-leave-close"
              aria-label="อยู่หน้านี้ต่อ"
              title="อยู่หน้านี้ต่อ"
              @click="resolveUnsavedLeave('cancel')"
            >
              <CloseIcon />
            </button>
            <div class="unsaved-leave-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="unsaved-leave-content">
              <h3>มีการแก้ไขที่ยังไม่ได้บันทึก</h3>
              <p>คุณมีการแก้ไขข้อมูลผังตลาดที่ยังไม่ได้บันทึก ต้องการบันทึกการแก้ไขก่อนออกจากหน้านี้หรือไม่?</p>
            </div>
            <div class="unsaved-leave-actions">
              <AppButton variant="outline" :disabled="savingGIS" @click="resolveUnsavedLeave('discard')">
                ไม่บันทึก
              </AppButton>
              <AppButton variant="primary" :loading="savingGIS" @click="resolveUnsavedLeave('save')">
                บันทึกการแก้ไข
              </AppButton>
            </div>
          </div>
        </div>
      </transition>

      <transition name="modal-bounce">
        <div
          v-if="showInspectPhotoModal"
          class="unsaved-leave-backdrop inspect-photo-backdrop"
          role="dialog"
          aria-modal="true"
          @click.self="showInspectPhotoModal = false"
        >
          <div class="inspect-photo-modal">
            <div class="ipm-head">
              <div>
                <strong>ภาพตัวอย่างแผง {{ stallEdit.ident }}</strong>
                <span>{{ selectedProject?.name || stallEdit.project_name }} · {{ formatFloorDisplay(stallEdit.floor) }}</span>
              </div>
              <button type="button" class="ipm-close" aria-label="ปิดตัวอย่างภาพ" @click="showInspectPhotoModal = false">
                <CloseIcon />
              </button>
            </div>
            <div class="ipm-stage">
              <img :src="inspectStallPhotos[inspectPhotoIndex]" :alt="`ภาพแผง ${stallEdit.ident}`" class="ipm-main-img" />
              <button type="button" class="ipm-nav is-prev" aria-label="ภาพก่อนหน้า" @click="stepInspectPhoto(-1)">‹</button>
              <button type="button" class="ipm-nav is-next" aria-label="ภาพถัดไป" @click="stepInspectPhoto(1)">›</button>
              <span class="ipm-counter">{{ inspectPhotoIndex + 1 }} / {{ inspectStallPhotos.length }}</span>
            </div>
            <div class="ipm-thumbs">
              <button
                v-for="(src, idx) in inspectStallPhotos"
                :key="idx"
                type="button"
                class="ipm-thumb"
                :class="{ active: inspectPhotoIndex === idx }"
                @click="inspectPhotoIndex = idx"
              >
                <img :src="src" :alt="`รูปที่ ${idx + 1}`" />
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import AppInput from '~/components/AppInput.vue'
import AppModal from '~/components/AppModal.vue'
import AppPagination from '~/components/AppPagination.vue'
import AppSegmentedControl from '~/components/AppSegmentedControl.vue'
import AppSelect from '~/components/AppSelect.vue'
import { getMarketGisConfig } from '../data/markets_registry'
import { loadMarketGisJson, mergeMarketProjects, clearMarketGisCache, cloneProjects } from '../data/market_loader'
import { getAllFloorLayoutsForProject, isOverviewBoundaryProject } from '../data/market_stall_layout'
import type { ProjectZone, MarketFacility } from '../data/market_gis_types'

const route = useRoute()
const router = useRouter()
const { get, post, put, del } = useApi()
const { showSuccess, showError, showConfirm } = useAppAlert()
const { role } = useAuth()
const { applyMarketOverride } = useMarketOverrides()
const isStaff = computed(() => role.value === 'staff')
const mapRef = ref<any>(null)
const marketId = computed(() => String(route.query.market || '1'))
const isInspectMode = computed(() => String(route.query.mode || '') === 'inspect')
const returnProjectId = computed(() => String(route.query.project || '').trim())
const returnStallCode = computed(() => String(route.query.stall || '').trim())
const resolvedMarketID = ref(0)
const apiMarketName = ref('')
const apiMarketRecord = ref<any>(null)
const marketBookings = ref<any[]>([])
const marketApplications = ref<any[]>([])
const marketContracts = ref<any[]>([])
const dashboardViewMode = ref<'summary' | 'map'>(
  (route.query.view === 'map' || route.query.project || route.query.stall) ? 'map' : 'summary'
)
const dashboardViewOptions: { value: string; label: string; icon: 'grid' | 'map' }[] = [
  { value: 'summary', label: 'สรุป', icon: 'grid' },
  { value: 'map', label: 'แผนที่', icon: 'map' }
]
const dashboardZoneFilter = ref<string>('all')
const setDashboardViewMode = (mode: 'summary' | 'map') => {
  dashboardViewMode.value = mode
  if (mode === 'map' && import.meta.client) {
    nextTick(() => {
      window.dispatchEvent(new Event('resize'))
    })
  }
}
const dashboardUpdatedDateText = computed(() => {
  try {
    return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  } catch {
    return '25 ตุลาคม 2569'
  }
})
const marketName = computed(() => applyMarketOverride({ id: resolvedMarketID.value, slug: marketId.value, name: apiMarketName.value || getMarketGisConfig(marketId.value).name })?.name || getMarketGisConfig(marketId.value).name)
const stalls = ref<any[]>([])
const projects = ref<ProjectZone[]>([])
const facilities = ref<MarketFacility[]>([])
const savedProjectsSnapshot = ref<ProjectZone[]>([])
const savedFacilitiesSnapshot = ref<MarketFacility[]>([])
const savedStallsSnapshot = ref<any[]>([])
const hasUnsavedChanges = ref(false)
const pendingStallUpserts = ref<any[]>([])
const pendingStallDeleteIds = ref<number[]>([])
const dashboardStatusFilter = ref<'all' | 'available' | 'reserved' | 'occupied'>('all')
const setDashboardStatusFilter = (status: typeof dashboardStatusFilter.value) => {
  dashboardStatusFilter.value = dashboardStatusFilter.value === status ? 'all' : status
}
const visibleProjects = computed(() => projects.value.filter(p => !isOverviewBoundaryProject(p, projects.value)))

const resolveRealStallStatus = (codeRaw: string, project?: ProjectZone | null, rawStall?: any): 'available' | 'reserved' | 'occupied' => {
  const code = String(codeRaw || '').trim()
  const upperCode = code.toUpperCase()
  const override = stallStatusOverrides.value[code] || stallStatusOverrides.value[upperCode]
  if (override) return override
  if (project?.layoutMode === 'manual') {
    const manualStatus = String(rawStall?.status || rawStall?.stall_status || '').toLowerCase()
    if (manualStatus === 'reserved' || manualStatus === 'occupied') return manualStatus
  }
  return 'available'
}

const totalMarketStalls = computed(() => visibleProjects.value.reduce((total, project) => {
  let count = 0
  getAllFloorLayoutsForProject(project).forEach((layout) => {
    count += layout.stalls.length
  })
  return total + (count || Number(project.totalStalls) || 0)
}, 0))

const stallStatusSummary = computed(() => {
  const summary = { available: 0, reserved: 0, occupied: 0 }

  visibleProjects.value.forEach((project) => {
    let layoutStallsCount = 0
    getAllFloorLayoutsForProject(project).forEach((layout) => {
      layout.stalls.forEach((stall: any) => {
        layoutStallsCount += 1
        const code = String(stall.code || stall.ident || stall.stall_ident || '').trim()
        const status = resolveRealStallStatus(code, project, stall)
        if (status === 'reserved') summary.reserved += 1
        else if (status === 'occupied') summary.occupied += 1
        else summary.available += 1
      })
    })

    const projectTotal = Number(project.totalStalls) || 0
    if (projectTotal > layoutStallsCount) {
      summary.available += projectTotal - layoutStallsCount
    }
  })

  return summary
})

const jumpToMapWithFilter = (status: 'all' | 'available' | 'reserved' | 'occupied') => {
  dashboardStatusFilter.value = status
  setDashboardViewMode('map')
}

const openZoneOnMap = (zoneId: string) => {
  const target = projects.value.find(p => p.id === zoneId) || null
  selectedProject.value = target
  setDashboardViewMode('map')
}

const realMarketSummary = computed(() => {
  let total = 0
  let available = 0
  let reserved = 0
  let occupied = 0
  let occupiedMonthlyRent = 0
  let availableMonthlyRent = 0
  let reservedMonthlyRent = 0
  let totalMonthlyRent = 0

  const dbRentByCode: Record<string, number> = {}
  stalls.value.forEach((s: any) => {
    const code = String(s.ident || s.stall_ident || s.stall_number || '').trim().toUpperCase()
    const rent = Number(s.monthly_rent || s.monthlyRent || 0)
    if (code && rent > 0) dbRentByCode[code] = rent
  })
  marketContracts.value.forEach((c: any) => {
    const st = String(c.contract_state || c.status || '').toLowerCase()
    if (st === 'terminated' || st === 'cancelled' || st === 'expired') return
    const code = String(c.stall_ident || c.stall_number || '').trim().toUpperCase()
    const rent = Number(c.monthly_rental || c.monthly_rent || 0)
    if (code && rent > 0) dbRentByCode[code] = rent
  })

  visibleProjects.value.forEach((project) => {
    let layoutStallsCount = 0
    getAllFloorLayoutsForProject(project).forEach((layout) => {
      layout.stalls.forEach((stall: any) => {
        layoutStallsCount += 1
        const rawCode = String(stall.code || stall.ident || stall.stall_ident || '').trim()
        const upperCode = rawCode.toUpperCase()
        const status = resolveRealStallStatus(rawCode, project, stall)
        const rent = Number(dbRentByCode[upperCode] || stall.monthlyRent || stall.monthly_rent || 1800)

        total += 1
        totalMonthlyRent += rent
        if (status === 'occupied') {
          occupied += 1
          occupiedMonthlyRent += rent
        } else if (status === 'reserved') {
          reserved += 1
          reservedMonthlyRent += rent
        } else {
          available += 1
          availableMonthlyRent += rent
        }
      })
    })

    const projectTotal = Number(project.totalStalls) || 0
    if (projectTotal > layoutStallsCount) {
      const diff = projectTotal - layoutStallsCount
      total += diff
      available += diff
      availableMonthlyRent += diff * 1800
      totalMonthlyRent += diff * 1800
    }
  })

  const safeDenom = Math.max(1, total)
  const occupancyPct = total > 0 ? Math.round((occupied / safeDenom) * 100) : 0
  const reservedPct = total > 0 ? Math.round((reserved / safeDenom) * 100) : 0
  const availablePct = total > 0 ? Math.max(0, 100 - occupancyPct - reservedPct) : 0
  const avgRent = total > 0 ? Math.round(totalMonthlyRent / safeDenom) : 0

  return {
    zonesCount: visibleProjects.value.length,
    total,
    available,
    reserved,
    occupied,
    occupancyPct,
    reservedPct,
    availablePct,
    occupiedMonthlyRent,
    availableMonthlyRent,
    reservedMonthlyRent,
    totalMonthlyRent,
    avgRent
  }
})

const realActionCounts = computed(() => {
  const pendingBookings = marketBookings.value.filter((b: any) => {
    const st = String(b.booking_status || b.status || '').toLowerCase()
    return st === 'pending' || st === 'pending_approval'
  }).length
  const activeVisits = marketBookings.value.filter((b: any) => {
    const st = String(b.booking_status || b.status || '').toLowerCase()
    return st === 'approved' || st === 'interested' || st === 'visited'
  }).length
  const pendingOfficerApps = marketApplications.value.filter((a: any) => {
    const st = String(a.application_state || a.status || '').toLowerCase()
    return st === 'pending' || st === 'pending_officer' || st === 'submitted'
  }).length
  const pendingDirectorApps = marketApplications.value.filter((a: any) => {
    const st = String(a.application_state || a.status || '').toLowerCase()
    return st === 'pending_director' || st === 'officer_approved'
  }).length
  const approvedAppsWaitingContract = marketApplications.value.filter((a: any) => {
    const st = String(a.application_state || a.status || '').toLowerCase()
    return st === 'approved' || st === 'director_approved'
  }).length

  return {
    pendingBookings,
    activeVisits,
    pendingOfficerApps,
    pendingDirectorApps,
    approvedAppsWaitingContract,
    totalUrgent: pendingBookings + pendingOfficerApps + approvedAppsWaitingContract
  }
})

const dashZoneCategoryFilter = ref('all')
const dashZoneSearchQuery = ref('')
const dashZonePage = ref(1)
const dashZonePageSize = ref(10)

const zoneRows = computed(() => {
  const dbRentByCode: Record<string, number> = {}
  stalls.value.forEach((s: any) => {
    const code = String(s.ident || s.stall_ident || s.stall_number || '').trim().toUpperCase()
    const rent = Number(s.monthly_rent || s.monthlyRent || 0)
    if (code && rent > 0) dbRentByCode[code] = rent
  })
  marketContracts.value.forEach((c: any) => {
    const st = String(c.contract_state || c.status || '').toLowerCase()
    if (st === 'terminated' || st === 'cancelled' || st === 'expired') return
    const code = String(c.stall_ident || c.stall_number || '').trim().toUpperCase()
    const rent = Number(c.monthly_rental || c.monthly_rent || 0)
    if (code && rent > 0) dbRentByCode[code] = rent
  })

  return visibleProjects.value.map((project, idx) => {
    let layoutStallsCount = 0
    let avail = 0
    let res = 0
    let occ = 0
    let rentSum = 0

    getAllFloorLayoutsForProject(project).forEach((layout) => {
      layout.stalls.forEach((stall: any) => {
        layoutStallsCount += 1
        const rawCode = String(stall.code || stall.ident || stall.stall_ident || '').trim()
        const upperCode = rawCode.toUpperCase()
        const status = resolveRealStallStatus(rawCode, project, stall)
        const rent = Number(dbRentByCode[upperCode] || stall.monthlyRent || stall.monthly_rent || 1800)
        rentSum += rent

        if (status === 'occupied') occ += 1
        else if (status === 'reserved') res += 1
        else avail += 1
      })
    })

    const projectTotal = Math.max(layoutStallsCount, Number(project.totalStalls) || 0)
    if (projectTotal > layoutStallsCount) {
      const diff = projectTotal - layoutStallsCount
      avail += diff
      rentSum += diff * 1800
    }

    const occupancyPct = projectTotal > 0 ? Math.round((occ / projectTotal) * 100) : 0
    const avgMonthlyRent = projectTotal > 0 ? Math.round(rentSum / projectTotal) : 1800
    const floorsCount = Array.isArray(project.floors) && project.floors.length > 0 ? project.floors.length : 1

    return {
      id: project.id,
      name: cleanProjectName(project.name) || `โซนที่ ${idx + 1}`,
      sectionNumber: project.sectionNumber || String(idx + 1).padStart(2, '0'),
      category: String(project.category || '').trim() || 'ทั่วไป',
      color: project.color || '#2563eb',
      floorsCount,
      total: projectTotal,
      available: avail,
      reserved: res,
      occupied: occ,
      occupancyPct,
      avgMonthlyRent
    }
  })
})

const donutCircumference = 2 * Math.PI * 54
const donutSegments = computed(() => {
  const total = Math.max(1, realMarketSummary.value.total)
  const items = [
    { key: 'available', count: realMarketSummary.value.available, color: '#10b981' },
    { key: 'reserved', count: realMarketSummary.value.reserved, color: '#f59e0b' },
    { key: 'occupied', count: realMarketSummary.value.occupied, color: '#2563eb' }
  ]
  let acc = 0
  return items
    .filter(item => item.count > 0)
    .map((item) => {
      const dash = (item.count / total) * donutCircumference
      const seg = { ...item, dash, offset: acc }
      acc += dash
      return seg
    })
})

const categoryChartRows = computed(() => {
  const map = new Map<string, { name: string; total: number; color: string }>()
  zoneRows.value.forEach((z) => {
    const key = z.category || 'ทั่วไป'
    const existing = map.get(key)
    if (existing) {
      existing.total += z.total
    } else {
      map.set(key, { name: key, total: z.total, color: z.color || '#2563eb' })
    }
  })
  const sorted = Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 5)
  const maxTotal = Math.max(1, sorted[0]?.total || 1)
  const marketTotal = Math.max(1, realMarketSummary.value.total)
  return sorted.map(item => ({
    ...item,
    pct: Math.round((item.total / marketTotal) * 100),
    barPct: Math.max(6, Math.round((item.total / maxTotal) * 100))
  }))
})

const dashCategoryFilterOptions = computed(() => {
  const uniqueCats = Array.from(new Set(zoneRows.value.map(z => z.category).filter(Boolean)))
  return [
    { value: 'all', label: 'ทุกหมวดสินค้า' },
    ...uniqueCats.map(cat => ({ value: cat, label: cat }))
  ]
})

const filteredZoneRows = computed(() => {
  const q = dashZoneSearchQuery.value.trim().toLowerCase()
  return zoneRows.value.filter((row) => {
    if (dashZoneCategoryFilter.value !== 'all' && row.category !== dashZoneCategoryFilter.value) {
      return false
    }
    if (!q) return true
    return (
      row.name.toLowerCase().includes(q) ||
      row.sectionNumber.toLowerCase().includes(q) ||
      row.category.toLowerCase().includes(q)
    )
  })
})

watch([dashZoneCategoryFilter, dashZoneSearchQuery], () => {
  dashZonePage.value = 1
})

const paginatedZoneRows = computed(() => {
  const start = (dashZonePage.value - 1) * dashZonePageSize.value
  return filteredZoneRows.value.slice(start, start + dashZonePageSize.value)
})

const dashActivityTab = ref<'all' | 'booking' | 'application'>('all')

const mapBookingStatusMeta = (rawStatus: string) => {
  const s = String(rawStatus || '').toLowerCase()
  if (s === 'pending' || s === 'pending_approval') return { label: 'รออนุมัติวันนัด', badgeClass: 'badge-amber' }
  if (s === 'approved') return { label: 'อนุมัติวันนัดแล้ว', badgeClass: 'badge-green' }
  if (s === 'interested' || s === 'visited') return { label: 'เข้าชมแล้ว / สนใจเช่า', badgeClass: 'badge-green' }
  if (s === 'waiting_queue') return { label: 'รอคิวสำรอง', badgeClass: 'badge-amber' }
  if (s === 'rejected' || s === 'expired' || s === 'no_show') return { label: 'ปฏิเสธ / หมดเวลา', badgeClass: 'badge-red' }
  if (s === 'cancelled' || s === 'canceled') return { label: 'ยกเลิกแล้ว', badgeClass: 'badge-gray' }
  return { label: rawStatus || 'รอดำเนินการ', badgeClass: 'badge-amber' }
}

const mapAppStatusMeta = (rawStatus: string) => {
  const s = String(rawStatus || '').toLowerCase()
  if (s === 'pending' || s === 'pending_officer' || s === 'submitted') return { label: 'รอ จนท. ตรวจสอบ', badgeClass: 'badge-amber' }
  if (s === 'pending_director' || s === 'officer_approved') return { label: 'รอผู้บริหารอนุมัติ', badgeClass: 'badge-amber' }
  if (s === 'approved' || s === 'director_approved' || s === 'completed') return { label: 'อนุมัติแล้ว', badgeClass: 'badge-green' }
  if (s === 'rejected' || s === 'revision_requested') return { label: 'แก้ไข / ปฏิเสธ', badgeClass: 'badge-red' }
  if (s === 'cancelled' || s === 'canceled') return { label: 'ยกเลิกแล้ว', badgeClass: 'badge-gray' }
  return { label: rawStatus || 'รอตรวจสอบ', badgeClass: 'badge-amber' }
}

const realRecentActivities = computed(() => {
  const bookingItems = marketBookings.value.map((b: any) => {
    const meta = mapBookingStatusMeta(b.status)
    const visitText = b.visit_date
      ? `${b.visit_date}${b.visit_time_slot ? ' (' + b.visit_time_slot + ')' : ''}`
      : (b.created_at ? String(b.created_at).slice(0, 10) : '-')
    return {
      key: `booking-${b.id || b.booking_number}`,
      kind: 'booking' as const,
      refNumber: b.booking_number || `#BK-${b.id}`,
      typeLabel: 'การจองนัดดูพื้นที่',
      stallCode: b.stall_number || b.stall_ident || b.stall_code || '-',
      personName: b.tenant_name || b.applicant_name || 'ผู้ขอจองพื้นที่',
      phone: b.tenant_phone || b.phone || '',
      dateText: visitText,
      statusLabel: meta.label,
      badgeClass: meta.badgeClass,
      actionUrl: '/bookings',
      sortTime: new Date(b.created_at || b.visit_date || 0).getTime() || Number(b.id || 0)
    }
  })

  const appItems = marketApplications.value.map((a: any) => {
    const meta = mapAppStatusMeta(a.status)
    const dateStr = a.submitted_at || a.created_at
      ? String(a.submitted_at || a.created_at).slice(0, 10)
      : '-'
    return {
      key: `app-${a.id || a.application_number}`,
      kind: 'application' as const,
      refNumber: a.application_number || `#APP-${a.id}`,
      typeLabel: 'คำร้องขอเช่าแผง',
      stallCode: a.stall_number || a.stall_ident || a.stall_code || '-',
      personName: a.applicant_name || a.tenant_name || 'ผู้ยื่นคำร้องขอเช่า',
      phone: a.phone || a.applicant_phone || '',
      dateText: dateStr,
      statusLabel: meta.label,
      badgeClass: meta.badgeClass,
      actionUrl: '/applications',
      sortTime: new Date(a.created_at || a.submitted_at || 0).getTime() || Number(a.id || 0)
    }
  })

  return [...bookingItems, ...appItems].sort((x, y) => y.sortTime - x.sortTime)
})

const filteredRecentActivities = computed(() => {
  if (dashActivityTab.value === 'all') return realRecentActivities.value
  return realRecentActivities.value.filter(item => item.kind === dashActivityTab.value)
})
const showUnsavedLeaveModal = ref(false)
let unsavedLeaveResolver: ((choice: 'save' | 'discard' | 'cancel') => void) | null = null
const selectedProject = ref<ProjectZone | null>(null)
const contracts = ref<any[]>([])
const stallHistory = ref<any[]>([])
const gisPublished = ref(false)
const isManageDataLoading = ref(true)
const savingGIS = ref(false)
const savingStall = ref(false)
const showStallEditor = ref(false)
const showInspectStallOverlay = ref(false)
const showInspectPhotoModal = ref(false)
const inspectPhotoIndex = ref(0)
const DEFAULT_INSPECT_STALL_PHOTOS = [
  '/images/stall_3d_perspective.jpg',
  '/images/market_stall_sample.jpg',
  '/images/market_hall_front.jpg'
]
const inspectStallPhotos = computed(() => {
  const customPhotos = (stallEdit.value as any)?.photos
  if (Array.isArray(customPhotos) && customPhotos.length > 0) return customPhotos
  return DEFAULT_INSPECT_STALL_PHOTOS
})
const inspectStallSizeSqm = computed(() => {
  const w = Number(stallEdit.value.width) || 2
  const d = Number(stallEdit.value.depth) || 2.5
  const area = Number((w * d).toFixed(1))
  return Number.isInteger(area) ? String(area) : area.toFixed(1)
})
const inspectStallEntryFee = computed(() => {
  const explicit = Number((stallEdit.value as any)?.entry_fee || (stallEdit.value as any)?.entryFee || 0)
  if (explicit > 0) return explicit
  const rent = Number(stallEdit.value.monthly_rent) || 1800
  return rent * 20
})
const formatFloorDisplay = (floorVal?: string | number) => {
  const raw = String(floorVal || '1').trim()
  if (!raw) return 'ชั้น 1'
  return raw.startsWith('ชั้น') ? raw : `ชั้น ${raw}`
}
const cleanProjectName = (rawVal?: string) => {
  return String(rawVal || '').replace(/\s*\([^)]*\)/g, '').trim() || 'โซนแผงค้า'
}
const openInspectPhotoPreview = (idx = 0) => {
  inspectPhotoIndex.value = idx
  showInspectPhotoModal.value = true
}
const stepInspectPhoto = (delta: number) => {
  const len = inspectStallPhotos.value.length
  if (len < 2) return
  inspectPhotoIndex.value = (inspectPhotoIndex.value + delta + len) % len
}
const inspectStallOccupancy = computed(() => {
  const code = String(stallEdit.value.ident || '').trim().toUpperCase()
  const status = String(stallEdit.value.stall_status || 'available').toLowerCase()

  const matchesStall = (item: any) => {
    const raw = String(item?.stall_number || item?.stall_ident || item?.stall_code || '')
    return raw.split(',').map(s => s.trim().toUpperCase()).includes(code)
  }

  const activeContract = contracts.value[0] || marketContracts.value.find(matchesStall)
  const matchingApp = marketApplications.value.find(matchesStall)
  const matchingBooking = marketBookings.value.find(matchesStall)

  if (status === 'occupied' || activeContract) {
    const tenantName = activeContract?.tenant_name || matchingApp?.applicant_name || 'มีผู้เช่าตามสัญญาปัจจุบัน'
    const refCode = activeContract?.contract_number || activeContract?.contract_no || ''
    const dateRange = (activeContract?.start_date || activeContract?.end_date)
      ? `ระยะสัญญา ${activeContract?.start_date || '-'} ถึง ${activeContract?.end_date || '-'}`
      : 'อยู่ระหว่างอายุสัญญาเช่า'
    return {
      heading: 'ผู้เช่าปัจจุบัน',
      refCode,
      primaryText: tenantName,
      subText: dateRange
    }
  }

  if (status === 'reserved' || matchingApp || matchingBooking) {
    if (matchingApp) {
      return {
        heading: 'คำร้องขอเช่าแผง',
        refCode: matchingApp.application_number || `#${matchingApp.id}`,
        primaryText: matchingApp.applicant_name || 'ผู้ยื่นคำร้องขอเช่า',
        subText: 'อยู่ระหว่างพิจารณาอนุมัติคำร้องขอเช่า'
      }
    }
    if (matchingBooking) {
      return {
        heading: 'การจองนัดเข้าชมพื้นที่',
        refCode: matchingBooking.booking_number || `#${matchingBooking.id}`,
        primaryText: matchingBooking.tenant_name || matchingBooking.applicant_name || 'ผู้จองเข้าชมพื้นที่',
        subText: matchingBooking.visit_date
          ? `วันนัดเข้าชม ${matchingBooking.visit_date}${matchingBooking.visit_time_slot ? ' · ' + matchingBooking.visit_time_slot : ''}`
          : 'อยู่ระหว่างดำเนินการนัดเข้าชมพื้นที่'
      }
    }
    return {
      heading: 'สถานะการจอง',
      refCode: '',
      primaryText: 'ติดจอง / รอดำเนินการทำสัญญา',
      subText: 'กดดูรายละเอียดเพื่อตรวจสอบรายการจองและคำร้อง'
    }
  }

  return {
    heading: 'สถานะการใช้งานแผง',
    refCode: '',
    primaryText: 'แผงว่าง พร้อมเปิดรับการจองและทำสัญญา',
    subText: stallEdit.value.description ? String(stallEdit.value.description) : ''
  }
})
const activeHighlightedStallCodes = computed(() => {
  if (showInspectStallOverlay.value && stallEdit.value.ident) {
    return [String(stallEdit.value.ident)]
  }
  return returnStallCode.value ? [returnStallCode.value] : []
})
const stallDrawerMode = ref<'detail' | 'edit'>('edit')
const stallDetailTab = ref<'info' | 'contracts' | 'history'>('info')
const showZoneEditor = ref(false)
const showFacilityEditor = ref(false)
const facilityNameError = ref('')
const mapVersion = ref(0)
const zoneOptions = [{ value: 1, label: 'โซน A' }, { value: 2, label: 'โซน B' }, { value: 3, label: 'โซน C' }, { value: 4, label: 'โซน D' }]
const floorOptions = computed(() => {
  const fls = selectedProject.value?.floors
  if (fls && fls.length > 0) return fls.map(f => ({ value: String(f.id), label: f.name || `ชั้น ${f.id}` }))
  return [{ value: '1', label: 'ชั้น 1' }, { value: '2', label: 'ชั้น 2' }, { value: '3', label: 'ชั้น 3' }]
})
const stallStatusOptions = [{ value: 'available', label: 'ว่าง' }, { value: 'reserved', label: 'ติดจอง' }, { value: 'occupied', label: 'มีผู้เช่า' }]
const stallStatusLabel = computed(() => stallStatusOptions.find(option => option.value === stallEdit.value.stall_status)?.label || 'ไม่ระบุสถานะ')
const stallDetailTabOptions: { value: string; label: string; icon: 'card' | 'table' | 'list' }[] = [
  { value: 'info', label: 'ข้อมูลแผง', icon: 'card' },
  { value: 'contracts', label: 'สัญญา', icon: 'table' },
  { value: 'history', label: 'ประวัติ', icon: 'list' }
]
const stallDetailUrl = computed(() => {
  const params = new URLSearchParams({ market: marketId.value, stall: String(stallEdit.value.ident || stallEdit.value.stall_ident || '') })
  if (selectedProject.value?.id) params.set('project', selectedProject.value.id)
  if (isInspectMode.value) {
    params.set('mode', 'inspect')
    params.set('view', 'map')
  }
  return `/stalls/detail?${params.toString()}`
})
const DEFAULT_MARKET_CATEGORIES = [
  'อาหารและเครื่องดื่ม',
  'อาหารสด ผักผลไม้ และเนื้อสัตว์',
  'เสื้อผ้าและเครื่องประดับ',
  'ของใช้เบ็ดเตล็ดและของใช้ในบ้าน',
  'ต้นไม้และอุปกรณ์จัดสวน',
  'สัตว์เลี้ยงและอุปกรณ์',
  'หัตถกรรมและของแต่งบ้าน',
  'ศิลปะและของสะสม',
  'สินค้าโอทอปและของฝาก'
]
const marketCategoryOptions = computed(() => {
  const cfg = getMarketGisConfig(marketId.value)
  const overridden = applyMarketOverride({ id: resolvedMarketID.value || cfg.id, slug: marketId.value || cfg.slug })
  const configuredCats: string[] = Array.isArray(overridden?.product_categories)
    ? overridden.product_categories
    : []
  const gisCats = [
    ...(cfg?.projects || []).map(p => String(p.category || '').trim()),
    ...projects.value.map(p => String(p.category || '').trim())
  ].filter(c => c && c !== 'ยังไม่ระบุหมวดสินค้า')
  const merged = Array.from(new Set([...configuredCats, ...gisCats])).filter(Boolean)
  const list = merged.length > 0 ? merged : DEFAULT_MARKET_CATEGORIES
  return list.map(cat => ({ value: cat, label: cat }))
})
const stallCategoryOptions = computed(() => {
  const base = marketCategoryOptions.value
  const current = String(stallEdit.value.category || '').trim()
  if (current && !base.some(opt => opt.value === current)) {
    return [{ value: current, label: current }, ...base]
  }
  return base
})
const facilityTypeOptions = [{ value: 'toilet', label: 'ห้องน้ำ' }, { value: 'parking', label: 'ที่จอดรถ' }, { value: 'exit', label: 'ทางเข้า–ออก' }, { value: 'service', label: 'จุดบริการ' }, { value: 'waste', label: 'จุดทิ้งขยะ' }]
const emptyStall = () => ({ id: 0, ident: '', name: '', description: '', category: '', zone_id: 1, zone_name: 'โซน A', project_name: selectedProject.value?.name || '', floor: '1', width: 2, depth: 2, daily_rent: 150, monthly_rent: 1800, stall_status: 'available', coordinates_geojson: '', published: false })
const stallEdit = ref(emptyStall())
const zoneForm = ref({ name: '', sectionNumber: '', category: '', floorCount: 1 })
const drawnZoneCoordinates = ref<[number, number][]>([])
const pendingStallLayout = ref<{ projectId: string; coordinates: [number, number][]; floorId: string } | null>(null)
const isCreatingNewStall = computed(() => Boolean(pendingStallLayout.value))
const facilityForm = ref<{ name: string; type: string; coordinates: [number, number]; projectId?: string }>({ name: '', type: 'toilet', coordinates: [100.5, 13.75] })
const unwrap = (value: any) => value?.data ?? value
const stallStatusOverrides = computed(() => {
  const overrides: Record<string, 'available' | 'reserved' | 'occupied'> = {}
  const setStatus = (rawCode: string, status: 'available' | 'reserved' | 'occupied') => {
    const clean = String(rawCode || '').trim()
    if (!clean) return
    overrides[clean] = status
    overrides[clean.toUpperCase()] = status
  }

  stalls.value.forEach((s: any) => {
    const code = String(s.ident || s.stall_ident || s.stall_number || '').trim()
    const rawStatus = String(s.stall_status || s.status || '').toLowerCase()
    if (!code) return
    if (rawStatus === 'reserved' || rawStatus === 'occupied') {
      setStatus(code, rawStatus)
    }
  })

  const inactiveBookingStatuses = new Set([
    'waiting_queue',
    'rejected',
    'not_interested',
    'cancelled',
    'no_show',
    'lease_applied',
    'completed',
    'terminated',
    'closed'
  ])
  marketBookings.value.forEach((b: any) => {
    const st = String(b.booking_status || b.status || '').toLowerCase()
    if (!st || inactiveBookingStatuses.has(st)) return
    const rawCodes = String(b.stall_ident || b.stall_number || b.stall_code || '')
    rawCodes.split(',').forEach((c) => {
      const clean = c.trim()
      if (clean && overrides[clean.toUpperCase()] !== 'occupied') {
        setStatus(clean, 'reserved')
      }
    })
  })

  const inactiveAppStatuses = new Set(['rejected', 'cancelled', 'terminated', 'closed', 'completed'])
  marketApplications.value.forEach((a: any) => {
    const st = String(a.application_state || a.status || '').toLowerCase()
    if (!st || inactiveAppStatuses.has(st)) return
    const rawCodes = String(a.stall_ident || a.stall_number || a.stall_code || '')
    rawCodes.split(',').forEach((c) => {
      const clean = c.trim()
      if (clean && overrides[clean.toUpperCase()] !== 'occupied') {
        setStatus(clean, 'reserved')
      }
    })
  })

  marketContracts.value.forEach((c: any) => {
    const st = String(c.contract_state || c.status || '').toLowerCase()
    if (st === 'terminated' || st === 'cancelled' || st === 'expired') return
    const rawCodes = String(c.stall_ident || c.stall_number || c.stall_code || '')
    rawCodes.split(',').forEach((code) => {
      const clean = code.trim()
      if (clean) setStatus(clean, 'occupied')
    })
  })

  return overrides
})

const pointInPolygonRing = ([lng, lat]: [number, number], ring: [number, number][] = []): boolean => {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] || [0, 0]
    const [xj, yj] = ring[j] || [0, 0]
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

const syncSnapshotsFromCurrent = () => {
  savedProjectsSnapshot.value = cloneProjects(projects.value)
  savedFacilitiesSnapshot.value = cloneProjects(facilities.value)
  savedStallsSnapshot.value = cloneProjects(stalls.value)
  pendingStallUpserts.value = []
  pendingStallDeleteIds.value = []
  hasUnsavedChanges.value = false
}

const revertUnsavedChanges = () => {
  mapRef.value?.finishActiveTools?.()
  projects.value = cloneProjects(savedProjectsSnapshot.value)
  facilities.value = cloneProjects(savedFacilitiesSnapshot.value)
  stalls.value = cloneProjects(savedStallsSnapshot.value)
  if (selectedProject.value) {
    selectedProject.value = projects.value.find(p => p.id === selectedProject.value?.id) || null
  }
  pendingStallUpserts.value = []
  pendingStallDeleteIds.value = []
  hasUnsavedChanges.value = false
}

const queueStallUpsert = (payload: any) => {
  const code = String(payload.ident || payload.stall_ident || '').trim().toUpperCase()
  if (!code) return
  const idx = pendingStallUpserts.value.findIndex(item => String(item.ident || item.stall_ident || '').trim().toUpperCase() === code)
  if (idx >= 0) pendingStallUpserts.value[idx] = { ...pendingStallUpserts.value[idx], ...payload }
  else pendingStallUpserts.value.push({ ...payload })
}

const persistGISChanges = async (publishState = true) => {
  mapRef.value?.finishActiveTools?.()
  const deleteIds = [...new Set(pendingStallDeleteIds.value.filter(id => Number(id) > 0))]
  const upserts = [...pendingStallUpserts.value]

  for (const id of deleteIds) {
    await del(`/stalls/${id}`).catch(() => {})
  }
  for (const item of upserts) {
    try {
      const response = item.id
        ? await put(`/stalls/${item.id}`, stallPayload(item))
        : await post('/stalls', stallPayload(item))
      const saved = unwrap(response)
      if (saved?.id) {
        const sIdx = stalls.value.findIndex(s => String(s.ident || s.stall_ident).toUpperCase() === String(saved.ident || item.ident).toUpperCase())
        if (sIdx >= 0) stalls.value[sIdx] = { ...stalls.value[sIdx], ...saved }
      }
    } catch {}
  }

  await put(`/markets/${encodeURIComponent(marketId.value)}/gis-config`, {
    projects: projects.value,
    facilities: facilities.value,
    published: publishState
  })
  clearMarketGisCache(marketId.value)
  gisPublished.value = publishState
  syncSnapshotsFromCurrent()
}

const askUnsavedLeaveDecision = (): Promise<'save' | 'discard' | 'cancel'> => {
  showUnsavedLeaveModal.value = true
  return new Promise((resolve) => {
    unsavedLeaveResolver = resolve
  })
}

const resolveUnsavedLeave = async (choice: 'save' | 'discard' | 'cancel') => {
  if (choice === 'save') {
    savingGIS.value = true
    try {
      await persistGISChanges(true)
      showUnsavedLeaveModal.value = false
      void showSuccess('บันทึกการแก้ไขและอัปเดตผังตลาดเรียบร้อยแล้ว', 'บันทึกสำเร็จ')
      if (unsavedLeaveResolver) {
        unsavedLeaveResolver('save')
        unsavedLeaveResolver = null
      }
    } catch {
      void showError('ไม่สามารถบันทึกผังได้ กรุณาตรวจสอบสิทธิ์และข้อมูลพิกัด', 'บันทึกไม่สำเร็จ')
    } finally {
      savingGIS.value = false
    }
    return
  }
  showUnsavedLeaveModal.value = false
  if (choice === 'discard') {
    revertUnsavedChanges()
  }
  if (unsavedLeaveResolver) {
    unsavedLeaveResolver(choice)
    unsavedLeaveResolver = null
  }
}

const ensureCanLeaveOrBack = async (): Promise<boolean> => {
  if (isInspectMode.value || !hasUnsavedChanges.value) return true
  const decision = await askUnsavedLeaveDecision()
  return decision !== 'cancel'
}

const selectProject = (project: ProjectZone) => { selectedProject.value = project }
const clearSelectedProject = () => {
  selectedProject.value = null
  closeStall()
  if (route.query.project || route.query.stall) {
    const nextQuery: Record<string, any> = { ...route.query }
    delete nextQuery.project
    delete nextQuery.stall
    void router.replace({ query: nextQuery })
  }
}
const handleRequestExitProject = () => {
  clearSelectedProject()
}
const handleBreadcrumbBack = async () => {
  if (selectedProject.value) {
    clearSelectedProject()
    return
  }
  await navigateTo(`/stalls?market=${encodeURIComponent(marketId.value)}`)
}
const modeLabel = computed(() => isInspectMode.value ? 'ดูข้อมูลแผงเช่า' : 'จัดการแผงเช่า')
const breadcrumbItems = computed(() => selectedProject.value
  ? [{ label: modeLabel.value, onClick: handleRequestExitProject }]
  : [])
const breadcrumbCurrent = computed(() => selectedProject.value
  ? selectedProject.value.name
  : modeLabel.value)
const recomputeDirtyState = () => {
  const projectsChanged = JSON.stringify(projects.value) !== JSON.stringify(savedProjectsSnapshot.value)
  const facilitiesChanged = JSON.stringify(facilities.value) !== JSON.stringify(savedFacilitiesSnapshot.value)
  const stallsChanged = JSON.stringify(stalls.value) !== JSON.stringify(savedStallsSnapshot.value)
  hasUnsavedChanges.value = Boolean(projectsChanged || facilitiesChanged || stallsChanged || pendingStallDeleteIds.value.length > 0)
}

const updateProjectPolygon = async (project: ProjectZone) => {
  const index = projects.value.findIndex(item => item.id === project.id)
  if (index >= 0) projects.value[index] = { ...projects.value[index], ...project }
  if (selectedProject.value?.id === project.id) {
    selectedProject.value = projects.value[index] || project
  }
  recomputeDirtyState()
}
const updateStallPolygon = async (project: ProjectZone, updatedStall: any) => {
  const index = projects.value.findIndex(item => item.id === project.id)
  if (index >= 0) {
    projects.value[index] = { ...projects.value[index], ...project }
    if (selectedProject.value?.id === project.id) {
      selectedProject.value = projects.value[index] || project
    }
  }
  const code = String(updatedStall?.code || updatedStall?.ident || '')
  const stored = stalls.value.find(s => String(s.ident || s.stall_ident).toUpperCase() === code.toUpperCase())
  if (stored && Array.isArray(updatedStall?.coordinates)) {
    const updatedRecord = {
      ...stored,
      width: updatedStall.widthM || stored.width || 2,
      depth: updatedStall.depthM || stored.depth || 2,
      coordinates_geojson: JSON.stringify({ type: 'Polygon', coordinates: [updatedStall.coordinates] })
    }
    const sIdx = stalls.value.findIndex(s => String(s.ident || s.stall_ident).toUpperCase() === code.toUpperCase())
    if (sIdx >= 0) stalls.value[sIdx] = updatedRecord
    queueStallUpsert(updatedRecord)
  }
  recomputeDirtyState()
}
const openZoneEditor = (coordinates: [number, number][]) => {
  drawnZoneCoordinates.value = coordinates
  zoneForm.value = { name: '', sectionNumber: '', category: marketCategoryOptions.value[0]?.value || '', floorCount: 1 }
  zoneErrors.name = ''
  zoneErrors.sectionNumber = ''
  zoneErrors.floorCount = ''
  zoneErrors.category = ''
  showZoneEditor.value = true
}
const dismissZoneEditor = () => {
  showZoneEditor.value = false
  drawnZoneCoordinates.value = []
  zoneErrors.name = ''
  zoneErrors.sectionNumber = ''
  zoneErrors.floorCount = ''
  zoneErrors.category = ''
}
const zoneErrors = reactive({ name: '', sectionNumber: '', floorCount: '', category: '' })
const validateZoneField = (field: 'name' | 'sectionNumber' | 'floorCount' | 'category') => {
  if (field === 'name') {
    zoneErrors.name = String(zoneForm.value.name || '').trim() ? '' : 'กรุณาระบุชื่อโซน'
  } else if (field === 'sectionNumber') {
    zoneErrors.sectionNumber = String(zoneForm.value.sectionNumber || '').trim() ? '' : 'กรุณาระบุรหัสโซน'
  } else if (field === 'floorCount') {
    const count = Number(zoneForm.value.floorCount)
    zoneErrors.floorCount = (!Number.isFinite(count) || count < 1 || count > 20) ? 'กรุณาระบุจำนวนชั้น 1 - 20' : ''
  } else if (field === 'category') {
    zoneErrors.category = String(zoneForm.value.category || '').trim() ? '' : 'กรุณาเลือกหมวดสินค้า'
  }
}
const validateZoneForm = () => {
  validateZoneField('name')
  validateZoneField('sectionNumber')
  validateZoneField('floorCount')
  validateZoneField('category')
  return !zoneErrors.name && !zoneErrors.sectionNumber && !zoneErrors.floorCount && !zoneErrors.category
}
const calcPolygonAreaSqm = (ring: [number, number][]) => {
  if (ring.length < 3) return 0
  const latRad = ((ring[0]?.[1] || 13.8) * Math.PI) / 180
  const mPerDegLng = 111320 * Math.cos(latRad)
  const mPerDegLat = 110540
  let twiceArea = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const x1 = (ring[i]?.[0] || 0) * mPerDegLng
    const y1 = (ring[i]?.[1] || 0) * mPerDegLat
    const x2 = (ring[i + 1]?.[0] || 0) * mPerDegLng
    const y2 = (ring[i + 1]?.[1] || 0) * mPerDegLat
    twiceArea += x1 * y2 - x2 * y1
  }
  return Math.max(1, Math.round(Math.abs(twiceArea) / 2))
}
const ZONE_COLOR_PALETTE = ['#3b82f6', '#e06456', '#4eb5b7', '#7e8ee8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
const resolveCategoryColor = (categoryName: string) => {
  const existing = projects.value.find(p => p.category === categoryName && p.color)
    || getMarketGisConfig(marketId.value).projects.find(p => p.category === categoryName && p.color)
  if (existing?.color) return existing.color
  return ZONE_COLOR_PALETTE[projects.value.length % ZONE_COLOR_PALETTE.length] || '#3b82f6'
}
const createZone = async () => {
  if (!validateZoneForm()) return
  const ring = drawnZoneCoordinates.value.map(point => [...point] as [number, number])
  if (ring.length < 3) return
  ring.push([...ring[0]!])
  const centroid: [number, number] = [ring.slice(0, -1).reduce((sum, point) => sum + point[0], 0) / (ring.length - 1), ring.slice(0, -1).reduce((sum, point) => sum + point[1], 0) / (ring.length - 1)]
  const id = `zone-${Date.now()}`
  const floorCount = Math.min(20, Math.max(1, Number(zoneForm.value.floorCount) || 1))
  const floors = Array.from({ length: floorCount }, (_, index) => ({ id: String(index + 1), name: `ชั้น ${index + 1}`, shortLabel: `${index + 1}F`, level: index + 1 }))
  const chosenCategory = String(zoneForm.value.category || '').trim() || marketCategoryOptions.value[0]?.value || 'ทั่วไป'
  const project: ProjectZone = { id, name: String(zoneForm.value.name).trim(), sectionNumber: String(zoneForm.value.sectionNumber).trim().toUpperCase(), category: chosenCategory, color: resolveCategoryColor(chosenCategory), stallsAvailable: 0, totalStalls: 0, realAreaSqm: calcPolygonAreaSqm(ring), centroid, coordinates: ring, floors, stalls: [], layoutMode: 'manual' }
  projects.value = [...projects.value, project]
  selectedProject.value = project
  hasUnsavedChanges.value = true
  dismissZoneEditor()
  void showSuccess('โซนถูกเพิ่มลงในผังแล้ว กดปุ่ม “บันทึกการแก้ไข” ด้านบนเพื่อบันทึกผัง', 'เพิ่มโซนในผังแล้ว')
}
const openFacilityEditor = (coordinates: [number, number], projectId?: string) => {
  const hostProject = projectId
    ? projects.value.find(p => p.id === projectId)
    : (selectedProject.value || projects.value.find(p => pointInPolygonRing(coordinates, p.coordinates)))
  facilityForm.value = { name: '', type: 'toilet', coordinates, projectId: hostProject?.id }
  facilityNameError.value = ''
  showFacilityEditor.value = true
}
const closeFacilityEditor = () => {
  showFacilityEditor.value = false
  facilityNameError.value = ''
}
const validateFacilityName = () => {
  facilityNameError.value = facilityForm.value.name.trim() ? '' : 'กรุณาระบุชื่อจุดบริการ'
  return !facilityNameError.value
}
const createFacility = async () => {
  if (!validateFacilityName()) return
  facilities.value = [
    ...facilities.value,
    {
      id: `facility-${Date.now()}`,
      name: facilityForm.value.name,
      type: facilityForm.value.type,
      coordinates: facilityForm.value.coordinates,
      projectId: facilityForm.value.projectId
    }
  ]
  hasUnsavedChanges.value = true
  closeFacilityEditor()
  void showSuccess('เพิ่มจุดบริการลงในผังแล้ว กดปุ่ม “บันทึกการแก้ไข” ด้านบนเพื่อบันทึกผัง', 'เพิ่มจุดบริการในผังแล้ว')
}
const deleteFacility = async (facility: MarketFacility) => {
  const confirmed = await showConfirm(`ต้องการลบจุดบริการ “${facility.name}” ออกจากผังตลาดใช่หรือไม่`, { title: 'ยืนยันการลบจุดบริการ', type: 'error', icon: 'trash', confirmText: 'ลบจุดบริการ' })
  if (!confirmed) return
  facilities.value = facilities.value.filter(item => item.id !== facility.id)
  hasUnsavedChanges.value = true
  void showSuccess(`ลบจุดบริการ “${facility.name}” ออกจากผังแล้ว กดปุ่ม “บันทึกการแก้ไข” ด้านบนเพื่อบันทึกผัง`, 'ลบจุดบริการในผังแล้ว')
}
const stallErrors = reactive({ ident: '', width: '', depth: '', monthly_rent: '' })
const resetStallErrors = () => { stallErrors.ident = ''; stallErrors.width = ''; stallErrors.depth = ''; stallErrors.monthly_rent = '' }
const validateStallField = (field: keyof typeof stallErrors) => {
  if (field === 'ident') {
    stallErrors.ident = String(stallEdit.value.ident || '').trim() ? '' : 'กรุณาระบุรหัสแผง'
  } else if (field === 'width') {
    const val = Number(stallEdit.value.width)
    stallErrors.width = !Number.isFinite(val) || val <= 0 ? 'กรุณาระบุความกว้างมากกว่า 0 เมตร' : ''
  } else if (field === 'depth') {
    const val = Number(stallEdit.value.depth)
    stallErrors.depth = !Number.isFinite(val) || val <= 0 ? 'กรุณาระบุความลึกมากกว่า 0 เมตร' : ''
  } else if (field === 'monthly_rent') {
    const val = Number(stallEdit.value.monthly_rent)
    stallErrors.monthly_rent = !Number.isFinite(val) || val < 0 || String(stallEdit.value.monthly_rent ?? '').trim() === '' ? 'กรุณาระบุค่าเช่ารายเดือน' : ''
  }
}
const validateStallForm = () => {
  validateStallField('ident')
  validateStallField('width')
  validateStallField('depth')
  validateStallField('monthly_rent')
  return !stallErrors.ident && !stallErrors.width && !stallErrors.depth && !stallErrors.monthly_rent
}
const openDrawnStall = (project: ProjectZone, coordinates: [number, number][], floorId: string, dimensions?: { widthM: number; depthM: number }) => { const closed = [...coordinates.map(point => [...point] as [number, number]), [...coordinates[0]!]]; const floor = project.floors?.find(item => item.id === floorId) || project.floors?.[0] || { id: '1', name: 'ชั้น 1', level: 1 }; const count = (project.stalls || []).filter((stall: any) => String(stall.floor || '1') === String(floor.id)).length + 1; pendingStallLayout.value = { projectId: project.id, coordinates: closed, floorId: String(floor.id) }; stallEdit.value = { ...emptyStall(), ident: `${project.sectionNumber}-${floor.id}-${String(count).padStart(3, '0')}`, project_name: project.name, category: project.category || marketCategoryOptions.value[0]?.value || '', floor: String(floor.id), coordinates_geojson: JSON.stringify({ type: 'Polygon', coordinates: [closed] }), width: dimensions?.widthM || 2, depth: dimensions?.depthM || 2 }; resetStallErrors(); stallDrawerMode.value = 'edit'; showStallEditor.value = true }
const deleteProject = async (project: ProjectZone, stats?: { total: number; available: number; reserved: number; occupied: number }) => {
  const gisStalls = Array.isArray(project.stalls) ? project.stalls : []
  const dbStallsInZone = stalls.value.filter(s => String(s.project_name || '').trim() === String(project.name || '').trim())
  const nonAvailableFromGis = gisStalls.filter((s: any) => {
    const code = String(s.code || s.ident || '')
    const effStatus = stallStatusOverrides.value[code] || s.status || 'available'
    return effStatus !== 'available'
  }).length
  const nonAvailableFromDb = dbStallsInZone.filter((s: any) => {
    const effStatus = s.stall_status || s.status || 'available'
    return effStatus !== 'available'
  }).length
  const nonAvailableFromStats = (stats?.reserved || 0) + (stats?.occupied || 0)
  const blockedStallCount = Math.max(nonAvailableFromGis, nonAvailableFromDb, nonAvailableFromStats)

  if (blockedStallCount > 0) {
    await showError(
      `ไม่สามารถลบโซน “${project.name}” ได้ เนื่องจากมีแผงที่ติดจองหรือมีผู้เช่าอยู่ ${blockedStallCount} แผง (ต้องไม่มีแผงในโซน หรือแผงทั้งหมดต้องเป็นสถานะว่างเท่านั้นจึงจะลบโซนได้)`,
      'ไม่สามารถลบโซนได้'
    )
    return
  }

  const totalStallsCount = Math.max(gisStalls.length, dbStallsInZone.length, stats?.total || 0)
  const confirmMessage = totalStallsCount > 0
    ? `โซน “${project.name}” มีแผงสถานะว่าง ${totalStallsCount} แผง (ไม่มีผู้เช่าหรือติดจอง) ต้องการลบโซนนี้พร้อมแผงและจุดบริการภายในโซนออกจากผังตลาดใช่หรือไม่`
    : `ต้องการลบโซน “${project.name}” และจุดบริการภายในโซนออกจากผังตลาดใช่หรือไม่`

  const confirmed = await showConfirm(confirmMessage, { title: 'ยืนยันการลบโซน', type: 'error', icon: 'trash', confirmText: 'ลบโซน' })
  if (!confirmed) return

  const dbStallsToDelete = [...dbStallsInZone]
  dbStallsToDelete.forEach(s => {
    if (s.id) pendingStallDeleteIds.value.push(Number(s.id))
  })
  projects.value = projects.value.filter(item => item.id !== project.id)
  facilities.value = facilities.value.filter(f => (
    f.projectId !== project.id && !pointInPolygonRing(f.coordinates, project.coordinates)
  ))
  stalls.value = stalls.value.filter(s => String(s.project_name || '').trim() !== String(project.name || '').trim())
  selectedProject.value = null
  hasUnsavedChanges.value = true
  void showSuccess(`ลบโซน “${project.name}” ออกจากผังแล้ว กดปุ่ม “บันทึกการแก้ไข” ด้านบนเพื่อบันทึกผัง`, 'ลบโซนในผังแล้ว')
}
const stallPayload = (form: any) => ({ ...form, market_id: resolvedMarketID.value, market_slug: marketId.value, market_name: marketName.value, zone_id: Number(form.zone_id), width: Number(form.width), depth: Number(form.depth), daily_rent: Number(form.daily_rent), monthly_rent: Number(form.monthly_rent) })
const closeStall = () => {
  showStallEditor.value = false
  showInspectStallOverlay.value = false
  showInspectPhotoModal.value = false
  resetStallErrors()
  stallDrawerMode.value = 'edit'
  stallDetailTab.value = 'info'
  pendingStallLayout.value = null
  contracts.value = []
  stallHistory.value = []
}
const selectStall = async (mapStall: any) => {
  pendingStallLayout.value = null
  resetStallErrors()
  const code = String(mapStall.code || mapStall.ident || '')
  const stored = stalls.value.find(s => String(s.ident || s.stall_ident).toUpperCase() === code.toUpperCase())
  const geometry = mapStall.coordinates?.length ? JSON.stringify({ type: 'Polygon', coordinates: [mapStall.coordinates] }) : ''
  contracts.value = []
  stallHistory.value = []
  stallDetailTab.value = 'info'
  const targetDrawerMode: 'detail' | 'edit' = isInspectMode.value ? 'detail' : 'edit'
  if (!stored?.id) {
    stallEdit.value = {
      ...emptyStall(),
      ident: code,
      name: mapStall.name || '',
      category: mapStall.areaType || selectedProject.value?.category || '',
      project_name: selectedProject.value?.name || mapStall.zone || '',
      floor: String(mapStall.floor || '1'),
      width: mapStall.widthM || 2,
      depth: mapStall.depthM || 2,
      monthly_rent: mapStall.monthlyRent || 1800,
      stall_status: resolveRealStallStatus(code, selectedProject.value, mapStall),
      coordinates_geojson: geometry
    }
    stallDrawerMode.value = targetDrawerMode
    if (targetDrawerMode === 'detail') {
      showInspectStallOverlay.value = true
      showStallEditor.value = false
    } else {
      showInspectStallOverlay.value = false
      showStallEditor.value = true
    }
    return
  }
  stallEdit.value = {
    ...emptyStall(),
    ...stored,
    coordinates_geojson: stored.coordinates_geojson || geometry,
    stall_status: resolveRealStallStatus(code, selectedProject.value, stored)
  }
  stallDrawerMode.value = targetDrawerMode
  if (targetDrawerMode === 'detail') {
    showInspectStallOverlay.value = true
    showStallEditor.value = false
    get(`/stalls/${stored.id}/contracts`)
      .then((res) => {
        contracts.value = Array.isArray(unwrap(res)) ? unwrap(res) : []
      })
      .catch(() => {})
  } else {
    showInspectStallOverlay.value = false
    showStallEditor.value = true
  }
}
const deleteStall = async (projectArg?: ProjectZone | null, mapStallArg?: any) => {
  const targetProject = projectArg || selectedProject.value || projects.value.find(p => String(p.name || '').trim() === String(stallEdit.value.project_name || '').trim())
  const code = String(mapStallArg?.code || mapStallArg?.ident || stallEdit.value.ident || '').trim()
  if (!code) return

  const stored = stalls.value.find(s => String(s.ident || s.stall_ident).toUpperCase() === code.toUpperCase())
  const gisStall = targetProject?.stalls?.find((s: any) => String(s.code || s.ident).toUpperCase() === code.toUpperCase())
  const effectiveStatus = stallStatusOverrides.value[code] || stallStatusOverrides.value[code.toUpperCase()] || stored?.stall_status || stored?.status || gisStall?.status || mapStallArg?.status || 'available'

  if (effectiveStatus !== 'available') {
    await showError(
      `ไม่สามารถลบแผง “${code}” ได้ เนื่องจากแผงนี้ติดจองหรือมีผู้เช่าอยู่ (ต้องเป็นสถานะว่างเท่านั้นจึงจะลบแผงได้)`,
      'ไม่สามารถลบแผงได้'
    )
    return
  }

  const confirmed = await showConfirm(
    `ต้องการลบแผง “${code}” ออกจากโซน “${targetProject?.name || stallEdit.value.project_name || '-'}” ใช่หรือไม่`,
    { title: 'ยืนยันการลบแผง', type: 'error', icon: 'trash', confirmText: 'ลบแผง' }
  )
  if (!confirmed) return

  if (targetProject) {
    const pIdx = projects.value.findIndex(p => p.id === targetProject.id)
    if (pIdx >= 0) {
      const sourceStalls = Array.isArray(projectArg?.stalls) && projectArg.stalls.length
        ? projectArg.stalls
        : (projects.value[pIdx]!.stalls || [])
      const nextStalls = sourceStalls.filter((s: any) => String(s.code || s.ident).toUpperCase() !== code.toUpperCase())
      projects.value[pIdx] = {
        ...projects.value[pIdx]!,
        layoutMode: 'manual',
        stalls: nextStalls,
        totalStalls: nextStalls.length,
        stallsAvailable: nextStalls.filter((s: any) => (s.status || 'available') === 'available').length
      }
      if (selectedProject.value?.id === targetProject.id) {
        selectedProject.value = projects.value[pIdx]!
      }
    }
  }

  const dbId = stored?.id || stallEdit.value?.id
  if (dbId) pendingStallDeleteIds.value.push(Number(dbId))
  pendingStallUpserts.value = pendingStallUpserts.value.filter(item => String(item.ident || item.stall_ident).toUpperCase() !== code.toUpperCase())
  stalls.value = stalls.value.filter(s => String(s.ident || s.stall_ident).toUpperCase() !== code.toUpperCase() && (!dbId || s.id !== dbId))
  hasUnsavedChanges.value = true
  if (showStallEditor.value) closeStall()

  void showSuccess(`ลบแผง “${code}” ออกจากผังแล้ว กดปุ่ม “บันทึกการแก้ไข” ด้านบนเพื่อบันทึกผัง`, 'ลบแผงในผังแล้ว')
}
const saveStall = async () => {
  if (!validateStallForm()) return
  savingStall.value = true
  try {
    const draftSaved = { ...stallEdit.value }
    const existingStallIdx = stalls.value.findIndex(s => (draftSaved.id && s.id === draftSaved.id) || String(s.ident || s.stall_ident).toUpperCase() === String(draftSaved.ident).toUpperCase())
    if (existingStallIdx >= 0) {
      const nextStalls = [...stalls.value]
      nextStalls[existingStallIdx] = { ...nextStalls[existingStallIdx], ...draftSaved }
      stalls.value = nextStalls
    } else {
      stalls.value = [...stalls.value, draftSaved]
    }
    queueStallUpsert(draftSaved)

    if (pendingStallLayout.value) {
      const pending = pendingStallLayout.value
      const projectIndex = projects.value.findIndex(project => project.id === pending.projectId)
      if (projectIndex >= 0) {
        const project = projects.value[projectIndex]!
        const chosenFloorId = String(stallEdit.value.floor || pending.floorId || '1')
        const floor = project.floors?.find(item => String(item.id) === chosenFloorId) || project.floors?.[0] || { id: chosenFloorId, name: `ชั้น ${chosenFloorId}`, level: Number(chosenFloorId) || 1 }
        const rent = Number(stallEdit.value.monthly_rent) || 1800
        const manualStall = {
          code: draftSaved.ident || stallEdit.value.ident,
          projectId: project.id,
          zone: project.name,
          status: stallEdit.value.stall_status || draftSaved.stall_status || 'available',
          areaType: stallEdit.value.category || 'ทั่วไป',
          size: Number((Number(stallEdit.value.width) * Number(stallEdit.value.depth)).toFixed(1)),
          widthM: Number(stallEdit.value.width),
          depthM: Number(stallEdit.value.depth),
          entryFee: 0,
          monthlyRent: rent,
          commonFee: 0,
          depositFee: rent,
          photo: '',
          coordinates: pending.coordinates,
          floor: String(floor.id),
          floorName: floor.name,
          floorLevel: floor.level
        }
        const allStalls = [...(project.stalls || []), manualStall]
        projects.value[projectIndex] = {
          ...project,
          layoutMode: 'manual',
          stalls: allStalls,
          totalStalls: allStalls.length,
          stallsAvailable: allStalls.filter((stall: any) => stall.status === 'available').length
        }
        selectedProject.value = projects.value[projectIndex]!
        pendingStallLayout.value = null
      }
    } else if (selectedProject.value) {
      const pIdx = projects.value.findIndex(p => p.id === selectedProject.value?.id)
      if (pIdx >= 0 && Array.isArray(projects.value[pIdx]?.stalls)) {
        const targetProj = projects.value[pIdx]!
        const targetCode = String(draftSaved.ident || stallEdit.value.ident)
        const updatedStalls = (targetProj.stalls || []).map((st: any) => {
          if (String(st.code).toUpperCase() !== targetCode.toUpperCase()) return st
          return {
            ...st,
            status: stallEdit.value.stall_status || draftSaved.stall_status || st.status,
            floor: String(stallEdit.value.floor || st.floor || '1'),
            widthM: Number(stallEdit.value.width) || st.widthM,
            depthM: Number(stallEdit.value.depth) || st.depthM,
            size: Number((Number(stallEdit.value.width || st.widthM) * Number(stallEdit.value.depth || st.depthM)).toFixed(1)),
            monthlyRent: Number(stallEdit.value.monthly_rent) || st.monthlyRent
          }
        })
        projects.value[pIdx] = {
          ...targetProj,
          stalls: updatedStalls,
          stallsAvailable: updatedStalls.filter((s: any) => s.status === 'available').length
        }
        selectedProject.value = projects.value[pIdx]!
      }
    }
    hasUnsavedChanges.value = true
    closeStall()
    void showSuccess('อัปเดตข้อมูลแผงบนผังแล้ว กดปุ่ม “บันทึกการแก้ไข” ด้านบนเพื่อบันทึกผัง', 'อัปเดตแผงในผังแล้ว')
  } finally {
    savingStall.value = false
  }
}
const saveGIS = async (publish: boolean) => {
  savingGIS.value = true
  try {
    await persistGISChanges(publish)
    void showSuccess(publish ? 'บันทึกการแก้ไขและอัปเดตผังตลาดเรียบร้อยแล้ว' : 'เก็บการแก้ไขเป็นฉบับร่างแล้ว', publish ? 'บันทึกสำเร็จ' : 'บันทึกฉบับร่างสำเร็จ')
  } catch {
    void showError('ไม่สามารถบันทึกผังได้ กรุณาตรวจสอบสิทธิ์และข้อมูลพิกัด', 'บันทึกไม่สำเร็จ')
  } finally {
    savingGIS.value = false
  }
}
const confirmAndSaveGIS = async () => {
  const confirmed = await showConfirm(
    hasUnsavedChanges.value
      ? 'คุณได้ทำการแก้ไขข้อมูลผังตลาด ต้องการบันทึกการแก้ไขและเผยแพร่ผังล่าสุดใช่หรือไม่?'
      : 'ต้องการบันทึกและเผยแพร่ผังตลาดใช่หรือไม่?',
    {
      title: 'ยืนยันการบันทึกการแก้ไข',
      type: 'info',
      confirmText: 'บันทึกการแก้ไข',
      cancelText: 'ยกเลิก'
    }
  )
  if (!confirmed) return
  await saveGIS(true)
}
const formatDate = (value: string) => new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const loadData = async () => {
  isManageDataLoading.value = true
  const cfg = await loadMarketGisJson(marketId.value)
  apiMarketName.value = cfg.name
  try {
    const [marketRes, stallRes, gisRes, bookingsRes, appsRes, contractsRes] = await Promise.all([
      get('/markets').catch(() => null),
      get(`/stalls?market=${encodeURIComponent(marketId.value)}`).catch(() => null),
      get(`/markets/${encodeURIComponent(marketId.value)}/gis-config/draft`).catch(() => null),
      get('/bookings').catch(() => null),
      get('/applications').catch(() => null),
      get('/contracts').catch(() => null)
    ])
    const markets = unwrap(marketRes)
    const market = (Array.isArray(markets) ? markets : []).find((item: any) => String(item.id) === marketId.value || item.slug === marketId.value || String(item.id) === String(cfg.id))
    apiMarketRecord.value = market || null
    resolvedMarketID.value = Number(market?.id || cfg.id)
    apiMarketName.value = market?.name || cfg.name
    const stallData = unwrap(stallRes)
    stalls.value = Array.isArray(stallData)
      ? stallData.filter((s: any) => !s.market_id || Number(s.market_id) === resolvedMarketID.value)
      : []
    const gis = unwrap(gisRes) || {}
    projects.value = mergeMarketProjects(cfg.projects, gis.projects)
    facilities.value = Array.isArray(gis.facilities) ? gis.facilities : []
    gisPublished.value = Boolean(gis.published)

    const allBookings = unwrap(bookingsRes)
    const allApps = unwrap(appsRes)
    const allContracts = unwrap(contractsRes)
    const targetMktName = String(apiMarketName.value || cfg.name || '').trim()
    const knownCodes = new Set<string>()
    projects.value.forEach((p) => {
      getAllFloorLayoutsForProject(p).forEach((layout) => {
        layout.stalls.forEach((st: any) => {
          const c = String(st.code || st.ident || '').trim().toUpperCase()
          if (c) knownCodes.add(c)
        })
      })
      ;(p.stalls || []).forEach((st: any) => {
        const c = String(st.code || st.ident || '').trim().toUpperCase()
        if (c) knownCodes.add(c)
      })
    })
    const matchesCurrentMarket = (item: any) => {
      if (!item) return false
      if (Number(item.market_id) > 0) {
        return Number(item.market_id) === resolvedMarketID.value
      }
      const itemMktName = String(item.market_name || '').trim()
      if (itemMktName && targetMktName) {
        return itemMktName.includes(targetMktName) || targetMktName.includes(itemMktName)
      }
      const rawStall = String(item.stall_number || item.stall_ident || item.stall_code || '').trim()
      if (rawStall && knownCodes.size > 0) {
        return rawStall.split(',').some(code => knownCodes.has(code.trim().toUpperCase()))
      }
      return false
    }
    marketBookings.value = Array.isArray(allBookings) ? allBookings.filter(matchesCurrentMarket) : []
    marketApplications.value = Array.isArray(allApps) ? allApps.filter(matchesCurrentMarket) : []
    marketContracts.value = Array.isArray(allContracts) ? allContracts.filter(matchesCurrentMarket) : []
  } catch {
    projects.value = cloneProjects(cfg.projects)
    facilities.value = []
  } finally {
    syncSnapshotsFromCurrent()
    isManageDataLoading.value = false
  }
  const targetProjectId = returnProjectId.value || selectedProject.value?.id
  if (targetProjectId) selectedProject.value = projects.value.find(p => p.id === targetProjectId) || null
}

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!isInspectMode.value && hasUnsavedChanges.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(() => {
  void loadData()
  if (import.meta.client) {
    window.addEventListener('beforeunload', handleBeforeUnload)
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
})

onBeforeRouteLeave(async () => {
  const canProceed = await ensureCanLeaveOrBack()
  return canProceed
})

onBeforeRouteUpdate(async (to, from) => {
  if (to.query.market !== from.query.market) {
    const canProceed = await ensureCanLeaveOrBack()
    return canProceed
  }
  return true
})

watch(marketId, () => { selectedProject.value = null; closeStall(); void loadData() })

const CloseIcon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'm6 6 12 12M18 6 6 18' })])
</script>

<style scoped>
.gis-panel{padding:26px 28px!important}.gis-panel-heading{align-items:center;margin-bottom:22px!important}.gis-panel-heading h2{font-size:1.25rem!important;font-weight:800;color:#0f172a;margin:0}.gis-panel-heading p{margin:6px 0 0!important}.gis-heading-right{display:flex;align-items:center;gap:12px;margin-left:auto;flex-wrap:wrap}.gis-map-toolbar{display:flex;flex:0 1 auto;min-width:0}.gis-map-toolbar :deep(.master-map-top-bar){width:auto;margin:0}.gis-map-toolbar :deep(.master-map-tools-right){margin-left:0;flex-wrap:nowrap}@media(max-width:700px){.gis-panel-heading{align-items:flex-start}.gis-heading-right,.gis-map-toolbar{width:100%;margin-left:0}.gis-map-toolbar :deep(.master-map-top-bar),.gis-map-toolbar :deep(.master-map-tools-right){width:100%;flex-wrap:wrap}.gis-map-toolbar :deep(.search-input-group){flex:1;width:auto}}
.staff-dashboard-intro{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:8px 0 22px}.dashboard-intro-left h1{margin:0;color:#0f172a;font-size:1.5rem;font-weight:700;letter-spacing:-.01em;line-height:1.3}.dashboard-updated-sub{margin:4px 0 0;color:#64748b;font-size:.875rem;font-weight:500}.dashboard-intro-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.officer-summary-dashboard{display:grid;gap:20px;margin-bottom:12px}.dash-kpi-ribbon{margin:0!important}.dash-two-col-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:stretch}
.dash-system-card{background:#fff;border:1px solid #eef2f6;border-radius:16px;box-shadow:0 1px 3px rgba(15,23,42,.03);padding:22px 24px;display:flex;flex-direction:column;gap:16px}
.dash-card-header{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}.dash-card-title{margin:0;color:#1e293b;font-size:1.05rem;font-weight:700;line-height:1.3}.dash-card-subtitle{margin:3px 0 0;color:#64748b;font-size:.8125rem;font-weight:500}
.dash-status-badge{display:inline-flex;align-items:center;justify-content:center;padding:3px 10px;border-radius:7px;font-size:.75rem;font-weight:600;white-space:nowrap}.dash-status-badge.badge-amber{background:#fef3c7;color:#d97706}.dash-status-badge.badge-green{background:#dcfce7;color:#15803d}.dash-status-badge.badge-red{background:#fee2e2;color:#dc2626}.dash-status-badge.badge-gray{background:#f1f5f9;color:#64748b}
.dash-donut-layout{display:grid;grid-template-columns:148px minmax(0,1fr);gap:22px;align-items:center;margin:auto 0}
.dash-donut-wrap{position:relative;width:148px;height:148px;display:flex;align-items:center;justify-content:center;margin:0 auto}.dash-donut-svg{width:148px;height:148px;display:block}.dash-donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none}.dash-donut-center strong{color:#0f172a;font-size:1.25rem;font-weight:800;line-height:1.1}.dash-donut-center span{color:#64748b;font-size:.75rem;font-weight:600;margin-top:3px}
.dash-donut-legend-list{display:grid;gap:8px}.dash-legend-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;border:1px solid #eef2f6;border-radius:10px;background:#f8fafc;cursor:pointer;font:inherit;transition:background .15s,border-color .15s}.dash-legend-row:hover{background:#fff;border-color:#cbd5e1}.legend-left{display:inline-flex;align-items:center;gap:8px;color:#334155;font-size:.875rem;font-weight:600}.legend-left i{width:10px;height:10px;border-radius:50%;display:inline-block}.dot-available{background:#10b981}.dot-reserved{background:#f59e0b}.dot-occupied{background:#2563eb}.legend-right{display:inline-flex;align-items:center;gap:8px}.legend-right strong{color:#0f172a;font-size:.9375rem;font-weight:700}
.dash-mini-rev-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:12px;border-top:1px solid #f1f5f9}.dash-mini-rev-item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;border-radius:10px;background:#f8fafc;border:1px solid #eef2f6}.dash-mini-rev-item span{color:#64748b;font-size:.8125rem;font-weight:500}.dash-mini-rev-item strong{font-size:1rem;font-weight:700;color:#0f172a}.dash-mini-rev-item strong.is-blue{color:#2563eb}.dash-mini-rev-item strong.is-green{color:#059669}
.dash-bar-chart-list{display:grid;gap:14px;margin:auto 0}.dash-bar-row{display:grid;gap:6px}.dash-bar-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.dash-bar-name{display:inline-flex;align-items:center;gap:8px;color:#1e293b;font-size:.875rem;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dash-bar-name i{width:10px;height:10px;border-radius:3px;flex-shrink:0}.dash-bar-meta{color:#64748b;font-size:.8125rem;font-weight:500;white-space:nowrap}.dash-bar-meta strong{color:#0f172a;font-weight:700}.dash-bar-track{height:10px;border-radius:999px;background:#f1f5f9;overflow:hidden}.dash-bar-fill{display:block;height:100%;border-radius:999px;transition:width .3s ease}
@media(max-width:640px){.dash-donut-layout{grid-template-columns:1fr}.dash-mini-rev-row{grid-template-columns:1fr}}
.dash-table-card{padding:24px 28px;gap:16px}.dash-table-header{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.dash-table-header-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.dash-category-select{min-width:210px}
.dash-search-box{position:relative;display:inline-flex;align-items:center;min-width:240px}.dash-search-box svg{position:absolute;left:12px;color:#94a3b8;pointer-events:none}.dash-search-box input{width:100%;height:40px;padding:0 12px 0 36px;border:1px solid #e2e8f0;border-radius:8px;font-size:.875rem;font-weight:500;color:#1e293b;background:#fff;transition:border-color .15s,box-shadow .15s}.dash-search-box input:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12)}
.dash-filter-tabs{display:flex;align-items:center;gap:24px;border-bottom:1px solid #f1f5f9;overflow-x:auto}.dash-filter-tab{position:relative;padding:10px 4px 12px;border:0;background:transparent;color:#64748b;font:inherit;font-size:.9375rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:color .15s}.dash-filter-tab:hover{color:#1e293b}.dash-filter-tab.active{color:#2563eb}.dash-filter-tab.active::after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:3px;border-radius:2px;background:#2563eb}
.dash-table-wrap{width:100%;overflow-x:auto}.dash-std-table{width:100%;border-collapse:collapse;text-align:left}.dash-std-table thead th{padding:14px 16px;color:#64748b;font-size:.8125rem;font-weight:500;border-bottom:1px solid #f1f5f9;white-space:nowrap;background:#fff}.dash-std-table tbody td{padding:16px;color:#334155;font-size:.875rem;font-weight:500;border-bottom:1px solid #f1f5f9;vertical-align:middle}.dash-std-table tbody tr:hover{background:#f8fafc}.dash-std-table .text-right{text-align:right}.dash-std-table .text-center{text-align:center}.dash-std-table strong{color:#1e293b;font-weight:700}.dash-std-table .code-primary{color:#2563eb}
.zone-name-cell{display:flex;align-items:center;gap:12px}.zone-color-dot{width:12px;height:12px;border-radius:4px;flex-shrink:0}.zone-name-cell strong{display:block;color:#1e293b;font-size:.875rem;font-weight:600}.zone-name-cell small,.applicant-cell small{display:block;margin-top:2px;color:#64748b;font-size:.75rem;font-weight:500}.applicant-cell strong{display:block;color:#1e293b;font-size:.875rem;font-weight:600}
.zone-occ-cell{display:flex;align-items:center;gap:10px}.zone-occ-bar{flex:1;height:8px;border-radius:999px;background:#e2e8f0;overflow:hidden;min-width:80px}.zone-occ-bar span{display:block;height:100%;border-radius:999px;background:#2563eb}.zone-occ-cell strong{font-size:.8125rem;min-width:36px;text-align:right}
.dash-table-view-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#334155;font:inherit;font-size:.825rem;font-weight:600;text-decoration:none;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s,color .15s}.dash-table-view-btn:hover{background:#eff6ff;border-color:#93c5fd;color:#2563eb}
.dash-empty-row{padding:32px 16px!important;text-align:center;color:#64748b!important;font-size:.875rem}
@media(max-width:1080px){.dash-two-col-grid{grid-template-columns:1fr}}@media(max-width:768px){.dash-revenue-grid{grid-template-columns:1fr}.dash-queue-item{flex-direction:column;align-items:flex-start}.dash-queue-right{width:100%;justify-content:space-between}}
.workspace-grid{display:grid;grid-template-columns:minmax(0,1fr)!important;margin-top:0}.workspace-grid[style*="display: none"]{display:none!important}.gis-panel-heading h2{font-size:1.15rem}.map-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin:4px 0 24px}.map-summary-card{background:#fff;border:1px solid #eef2f6;border-radius:14px;padding:16px 20px;display:flex;align-items:center;gap:16px;cursor:pointer;font-family:inherit;text-align:left;position:relative;transition:all .2s cubic-bezier(.4,0,.2,1);box-shadow:0 1px 3px rgba(15,23,42,.03)}.map-summary-card:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(15,23,42,.07)}.map-summary-card:focus-visible{outline:2px solid #2563eb;outline-offset:2px}.map-summary-icon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s ease}.map-summary-content{display:flex;flex-direction:column;min-width:0}.map-summary-title{font-size:.8125rem;color:#64748b;font-weight:500;line-height:1.25;margin-bottom:6px;white-space:nowrap}.map-summary-value-row{display:flex;align-items:baseline;gap:8px}.map-summary-count{font-size:1.45rem;font-weight:800;color:#0f172a;line-height:1.1}.map-summary-unit-pill{font-size:.78rem;font-weight:600;padding:2px 8px;border-radius:6px;line-height:1.2;font-style:normal}.summary-total .map-summary-icon{background:#eff6ff;color:#2563eb;border:1px solid #dbeafe}.summary-total .map-summary-unit-pill{background:#eff6ff;color:#1d4ed8}.summary-total.active{border-color:#2563eb;background:#f8faff;box-shadow:0 0 0 2px rgba(37,99,235,.18)}.summary-available .map-summary-icon{background:#ecfdf5;color:#059669;border:1px solid #d1fae5}.summary-available .map-summary-unit-pill{background:#dcfce7;color:#15803d}.summary-available.active{border-color:#10b981;background:#f0fdf4;box-shadow:0 0 0 2px rgba(16,185,129,.2)}.summary-reserved .map-summary-icon{background:#fffbeb;color:#d97706;border:1px solid #fef3c7}.summary-reserved .map-summary-unit-pill{background:#fef3c7;color:#b45309}.summary-reserved.active{border-color:#f59e0b;background:#fffdf7;box-shadow:0 0 0 2px rgba(245,158,11,.2)}.summary-occupied .map-summary-icon{background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0}.summary-occupied .map-summary-unit-pill{background:#f1f5f9;color:#64748b}.summary-occupied.active{border-color:#94a3b8;background:#f8fafc;box-shadow:0 0 0 2px rgba(100,116,139,.18)}@media(max-width:800px){.map-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:440px){.map-summary-grid{grid-template-columns:1fr}}.header-actions{display:inline-flex;align-items:center;gap:10px}.draft-status{display:inline-flex;align-items:center;gap:7px;height:34px;box-sizing:border-box;padding:0 12px;border-radius:999px;background:#f1f5f9;color:#475569;font-size:.8125rem;font-weight:600;transition:all .2s ease}.draft-status i{width:8px;height:8px;border-radius:50%;background:currentColor}.draft-status.published{background:#ecfdf5;color:#15803d;border:1px solid #bbf7d0}.draft-status.is-dirty{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}.draft-status.is-dirty i{background:#ea580c;box-shadow:0 0 0 3px rgba(234,88,12,.18)}.header-status-skeleton,.header-action-skeleton{display:block;border-radius:999px;background:linear-gradient(90deg,#eef2f7 25%,#f8fafc 50%,#eef2f7 75%);background-size:200% 100%;animation:headerSkeletonShimmer 1.35s ease-in-out infinite}.header-status-skeleton{width:102px;height:34px}.header-action-skeleton{width:128px;height:34px;border-radius:7px}@keyframes headerSkeletonShimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}@media(prefers-reduced-motion:reduce){.header-status-skeleton,.header-action-skeleton{animation:none}}
.unsaved-leave-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.65);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;z-index:99999}.unsaved-leave-card{background:#fff;border-radius:18px;width:100%;max-width:430px;padding:28px 24px 22px;text-align:center;box-shadow:0 24px 48px -12px rgba(15,23,42,.28),0 0 0 1px rgba(226,232,240,.8);position:relative}.unsaved-leave-close{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:8px;border:0;background:transparent;color:#64748b;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s,color .15s}.unsaved-leave-close:hover{background:#f1f5f9;color:#0f172a}.unsaved-leave-close svg{width:18px;height:18px}.unsaved-leave-icon{width:56px;height:56px;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;background:#fef3c7;color:#d97706;box-shadow:0 0 0 6px #fffbeb}.unsaved-leave-content h3{font-size:1.15rem;font-weight:700;color:#0f172a;margin:0 0 8px}.unsaved-leave-content p{font-size:.9375rem;color:#475569;line-height:1.55;margin:0 0 22px}.unsaved-leave-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.inspect-selected-stall-drawer{position:absolute;top:62px;right:14px;width:338px;max-height:calc(100% - 76px);display:flex;flex-direction:column;pointer-events:auto;z-index:25;background:rgba(255,255,255,.98);backdrop-filter:blur(14px);border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 16px 38px rgba(15,23,42,.16);overflow:hidden}
.issd-header{padding:14px 16px 11px;border-bottom:1px solid #f1f5f9;background:#fff;flex-shrink:0}.issd-header-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.issd-title-group{display:flex;align-items:center;gap:7px;flex-wrap:wrap;min-width:0}.issd-title-group strong{font-size:.9rem;font-weight:700;color:#0f172a}.issd-project-sub{margin-top:3px;font-size:.75rem;font-weight:500;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.issd-close-btn{width:28px;height:28px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background .15s,border-color .15s,color .15s}.issd-close-btn:hover{background:#fef2f2;border-color:#fca5a5;color:#ef4444}
.issd-body{flex:1 1 auto;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px}
.issd-status-pill{display:inline-flex;align-items:center;padding:2px 9px;border-radius:999px;font-size:.75rem;font-weight:600;border:1px solid transparent}.issd-status-pill.is-available{background:#dcfce7;color:#15803d;border-color:#bbf7d0}.issd-status-pill.is-reserved{background:#fef3c7;color:#d97706;border-color:#fde68a}.issd-status-pill.is-occupied{background:#f1f5f9;color:#475569;border-color:#cbd5e1}
.issd-photo-banner{position:relative;height:108px;flex-shrink:0;border-radius:11px;overflow:hidden;border:1px solid #e2e8f0;background:#0f172a;cursor:pointer}.issd-photo-banner img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .25s ease}.issd-photo-banner:hover img{transform:scale(1.05)}.issd-photo-count-badge{position:absolute;right:8px;bottom:8px;display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:7px;background:rgba(15,23,42,.82);backdrop-filter:blur(4px);color:#fff;font-size:.75rem;font-weight:600}
.issd-detail-list{margin:0;flex-shrink:0;border:1px solid #e2e8f0;border-radius:12px;background:#fff;overflow:hidden}.issd-detail-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 12px;font-size:.8125rem}.issd-detail-row+.issd-detail-row{border-top:1px solid #f1f5f9}.issd-detail-row dt{color:#64748b;font-size:.75rem;font-weight:500}.issd-detail-row dd{margin:0;color:#1e293b;font-size:.8125rem;font-weight:600;text-align:right}.issd-detail-row dd.is-rent{color:#15803d;font-weight:700}.issd-detail-row dd.is-bold{color:#0f172a;font-weight:700}
.issd-occupancy-box{padding:9px 12px;flex-shrink:0;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;display:grid;gap:2px}.issd-occupancy-box.is-available{background:#f0fdf4;border-color:#bbf7d0}.issd-occupancy-box.is-reserved{background:#fffbeb;border-color:#fde68a}.issd-occupancy-box.is-occupied{background:#f8fafc;border-color:#cbd5e1}.issd-occupancy-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.issd-occupancy-head span{font-size:.75rem;font-weight:600;color:#64748b}.issd-occupancy-head small{font-size:.75rem;font-weight:700;color:#2563eb}.issd-occupancy-box strong{font-size:.8125rem;font-weight:700;color:#0f172a;line-height:1.35}.issd-occupancy-box p{margin:0;font-size:.75rem;color:#475569;line-height:1.35}
.issd-footer{padding:10px 14px 14px;background:#fff;border-top:1px solid #f1f5f9;box-shadow:0 -4px 12px rgba(15,23,42,.04);flex-shrink:0}.issd-cta-btn{width:100%;box-sizing:border-box;padding:10px 16px;border-radius:11px;background:linear-gradient(180deg,#3b82f6 0%,#2563eb 100%);color:#fff;font-size:.875rem;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 14px rgba(37,99,235,.32);transition:transform .15s ease,box-shadow .15s ease}.issd-cta-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(37,99,235,.4)}
.inspect-photo-Modal,.inspect-photo-modal{width:min(820px,94vw);background:#0f172a;border-radius:18px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(0,0,0,.6);display:flex;flex-direction:column}.ipm-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;color:#fff}.ipm-head strong{display:block;font-size:1rem;font-weight:700}.ipm-head span{display:block;font-size:.8125rem;color:#94a3b8;margin-top:2px}.ipm-close{width:34px;height:34px;border-radius:10px;border:0;background:rgba(255,255,255,.12);color:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}.ipm-close svg{width:18px;height:18px}.ipm-stage{position:relative;height:min(480px,58vh);background:#000;display:flex;align-items:center;justify-content:center}.ipm-main-img{width:100%;height:100%;object-fit:contain}.ipm-nav{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.9);color:#0f172a;font-size:1.35rem;font-weight:700;cursor:pointer;display:grid;place-items:center}.ipm-nav.is-prev{left:14px}.ipm-nav.is-next{right:14px}.ipm-counter{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.78);color:#fff;font-size:.75rem;font-weight:600;padding:3px 12px;border-radius:999px}.ipm-thumbs{display:flex;justify-content:center;gap:8px;padding:12px 18px 16px}.ipm-thumb{width:76px;height:52px;border-radius:8px;overflow:hidden;border:2px solid transparent;padding:0;background:#1e293b;cursor:pointer;opacity:.6}.ipm-thumb.active{border-color:#60a5fa;opacity:1}.ipm-thumb img{width:100%;height:100%;object-fit:cover;display:block}
@media(max-width:768px){.inspect-selected-stall-drawer{position:fixed;left:0;right:0;bottom:0;top:auto;width:100%;max-height:78vh;border-radius:20px 20px 0 0;z-index:99}}
.map-edit-status{display:flex;gap:10px;align-items:flex-start;padding:13px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;color:#1e40af}.map-edit-status strong,.map-edit-status small{display:block}.map-edit-status strong{font-size:.875rem}.map-edit-status small{margin-top:3px;font-size:.75rem;color:#476587}.map-edit-dot{width:10px;height:10px;flex:0 0 10px;border-radius:50%;background:#3b5bff;margin-top:5px;box-shadow:0 0 0 4px #dbeafe}
.zone-form,.facility-form{display:grid;grid-template-columns:1fr 1fr;gap:13px}.zone-form label,.facility-form label{display:grid;align-content:start;gap:6px;color:#475569;font-size:.8125rem;font-weight:600}.zone-form .full,.facility-form .full{grid-column:1/-1}.req-star{color:#ef4444;font-weight:700}.stall-detail-summary{display:grid;gap:5px;padding:16px;margin:20px 0 14px;border:1px solid #dbeafe;border-radius:12px;background:#f8fbff}.stall-detail-summary strong{color:#1e293b;font-size:1rem}.stall-detail-summary>span:last-child{color:#64748b;font-size:.875rem}.stall-detail-summary .soft-badge{justify-self:start}.status-available{background:#dcfce7;color:#15803d!important}.status-reserved{background:#fef3c7;color:#d97706!important}.status-occupied{background:#f1f5f9;color:#64748b!important}.stall-detail-tabs{display:flex!important;width:100%;margin:0 0 14px}.stall-detail-tabs :deep(.app-segmented-option){flex:1}.stall-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0}.stall-detail-grid>div{padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff}.stall-detail-grid .full{grid-column:1/-1}.stall-detail-grid dt{color:#64748b;font-size:.8125rem;font-weight:500}.stall-detail-grid dd{margin:4px 0 0;color:#1e293b;font-size:.9375rem;font-weight:600;word-break:break-word}.detail-section.is-tab-content{margin-top:0}.detail-section-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.detail-section-heading h3{margin:0}
.manage-page{padding-bottom:48px}.manage-header,.panel,.stats-grid article,.workflow{background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 1px 3px rgba(15,23,42,.03)}.manage-header{margin:18px 0;padding:24px 26px;display:flex;justify-content:space-between;align-items:center;gap:20px}.eyebrow{color:#2563eb;font-size:.8125rem;font-weight:700}.manage-header h1{margin:4px 0;color:#0f172a;font-size:1.5rem}.manage-header p,.panel-heading p,.tool-title p{margin:0;color:#64748b;font-size:.875rem}.header-actions,.tool-actions{display:flex;gap:10px}.header-actions svg{width:17px;height:17px}.workflow{display:grid;grid-template-columns:repeat(4,1fr);padding:8px;margin-bottom:18px}.workflow button{border:0;background:transparent;text-align:left;padding:11px 12px;display:grid;grid-template-columns:28px 1fr;column-gap:8px;color:#64748b;border-radius:10px;cursor:pointer}.workflow button>span{grid-row:1/3;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#f1f5f9;font-size:.75rem;font-weight:700}.workflow strong{font-size:.875rem;color:#334155}.workflow small{font-size:.75rem}.workflow button.active{background:#eff6ff}.workflow button.active span{background:#2563eb;color:#fff}.workflow button.active strong{color:#1d4ed8}.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.stats-grid article{padding:14px 17px;display:flex;flex-direction:column;color:#64748b;font-size:.8125rem}.stats-grid strong{font-size:1.25rem;color:#1e293b}.stats-grid .green{color:#15803d}.status-text{font-size:1rem!important;color:#2563eb!important}.workspace-grid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:18px}.panel{padding:20px}.panel-heading,.tool-title{display:flex;justify-content:space-between;gap:12px;margin-bottom:16px}.panel h2{font-size:1rem;color:#1e293b;margin:0 0 4px}.selected-project{padding:12px 14px;background:#eff6ff;border-radius:10px;color:#1e40af;display:flex;justify-content:space-between;align-items:center;margin-top:12px}.selected-project div{display:grid}.selected-project span{font-size:.8125rem;color:#64748b}.tool-panel{align-self:start;position:sticky;top:86px}.vertex-list,.form-stack{display:grid;gap:10px}.vertex-row{display:grid;grid-template-columns:24px 1fr 1fr 30px;gap:6px;align-items:center}.vertex-row span{font-size:.75rem;color:#64748b;text-align:center}.vertex-row button,.facility-list button,.icon-button{border:0;background:transparent;color:#64748b;cursor:pointer;padding:5px}.vertex-row svg,.facility-list svg,.icon-button svg{width:18px;height:18px}.form-stack label,.form-grid label{display:grid;gap:6px;color:#475569;font-size:.8125rem;font-weight:600}.coordinate-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.facility-list{display:grid;gap:7px;margin-top:15px}.facility-list>div{display:flex;justify-content:space-between;padding:9px 10px;background:#f8fafc;border-radius:9px}.facility-list span{display:grid}.facility-list small{font-size:.75rem;color:#64748b}.check-list{display:grid;gap:8px}.check-list>div{display:flex;gap:10px;padding:12px;background:#f8fafc;border-radius:10px}.check-list svg{width:20px;color:#16a34a}.check-list span{display:grid}.check-list strong{font-size:.875rem}.check-list small{font-size:.75rem;color:#64748b}.stacked{display:grid;margin-top:16px}.empty-state{padding:20px;text-align:center;color:#64748b;background:#f8fafc;border-radius:10px;font-size:.875rem}.compact{padding:12px}.drawer-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:100;display:flex;justify-content:flex-end}.stall-drawer{width:min(640px,92vw);height:100%;background:#fff;display:flex;flex-direction:column;box-shadow:-12px 0 30px rgba(15,23,42,.18)}.stall-drawer>header,.stall-drawer>footer{padding:18px 22px;display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid #e2e8f0}.stall-drawer>footer{justify-content:flex-end;border-top:1px solid #e2e8f0;border-bottom:0}.stall-drawer>footer.has-delete-btn{justify-content:space-between}.drawer-footer-right{display:flex;align-items:center;gap:10px;margin-left:auto}.stall-drawer h2{margin:0;color:#1e293b;font-size:1.125rem}.stall-drawer p{margin:3px 0;color:#64748b;font-size:.8125rem}.drawer-body{padding:0 22px 24px;overflow:auto;flex:1}.form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:13px;margin:20px 0}.form-grid .full{grid-column:1/-1}input,textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:9px 10px;color:#1e293b;background:#fff;font:inherit}.detail-section{border-top:1px solid #e2e8f0;padding-top:17px;margin-top:17px}.detail-section h3{font-size:.9375rem;color:#1e293b}.contract-list{display:grid;gap:8px}.contract-list article{display:flex;justify-content:space-between;gap:10px;padding:11px;background:#f8fafc;border-radius:9px}.contract-list article div{display:grid}.contract-list span{font-size:.8125rem;color:#64748b}.soft-badge{background:#eff6ff;color:#2563eb!important;padding:4px 8px;border-radius:7px;height:max-content}.history-list{display:grid}.history-list>div{display:flex;gap:10px;padding:6px 0}.history-list i{width:9px;height:9px;border-radius:50%;background:#3b82f6;margin-top:5px}.history-list span{display:grid}.history-list small{font-size:.75rem;color:#64748b}@media(max-width:1000px){.workspace-grid{grid-template-columns:1fr}.tool-panel{position:static}.workflow{grid-template-columns:repeat(2,1fr)}}@media(max-width:700px){.manage-header,.panel-heading{align-items:flex-start;flex-direction:column}.stats-grid,.form-grid{grid-template-columns:1fr 1fr}.header-actions{width:100%;flex-wrap:wrap}.workflow{grid-template-columns:1fr}.form-grid .full{grid-column:auto}}@media(max-width:480px){.stats-grid,.form-grid{grid-template-columns:1fr}}
</style>
