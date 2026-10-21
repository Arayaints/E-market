<template>
  <div>
    <!-- Top Header -->
    <AppHeader />

    <div class="content-body market-detail-page">
      <!-- Breadcrumb -->
      <div class="md-breadcrumb-row">
        <AppBreadcrumb :current="currentMarket.name" backTo="/" />
      </div>

      <!-- 1. Header Card: ชื่อตลาด + ข้อมูลสำคัญ + แท็กหมวดหมู่ + Showcase กทม. -->
      <section class="md-card md-header-card">
        <!-- Background Ambient Glow & Light Mesh -->
        <div class="md-header-bg-glow" aria-hidden="true"></div>
        <div class="md-header-mesh" aria-hidden="true"></div>

        <div class="md-header-left">
          <!-- Official Subtitle / Eyebrow Pill -->
          <div class="md-header-eyebrow">
            <span class="md-eyebrow-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>สำนักงานตลาดกรุงเทพมหานคร</span>
            </span>
          </div>

          <!-- Market Name -->
          <div class="md-title-wrap">
            <h1 class="md-title">{{ currentMarket.name }}</h1>
          </div>

          <!-- Meta Information Row: วัน, เวลา, พิกัด -->
          <div class="md-meta-row">
            <div class="md-meta-item">
              <span class="md-meta-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </span>
              <div class="md-meta-content">
                <span class="md-meta-label">วันเปิดทำการ</span>
                <strong class="md-meta-val">{{ operatingDays }}</strong>
              </div>
            </div>

            <span class="md-meta-divider" aria-hidden="true"></span>

            <div class="md-meta-item">
              <span class="md-meta-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
              <div class="md-meta-content">
                <span class="md-meta-label">เวลาเปิด-ปิด</span>
                <strong class="md-meta-val">{{ operatingTime }}</strong>
              </div>
            </div>

            <span v-if="currentMarket.district" class="md-meta-divider" aria-hidden="true"></span>

            <div v-if="currentMarket.district" class="md-meta-item">
              <span class="md-meta-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </span>
              <div class="md-meta-content">
                <span class="md-meta-label">ทำเล / เขต</span>
                <strong class="md-meta-val">{{ currentMarket.district }}</strong>
              </div>
            </div>
          </div>

          <!-- Feature & Category Tags (Soft pills with semantic icons) -->
          <ul v-if="marketHighlights.length" class="md-tags" aria-label="จุดเด่นของตลาด">
            <li v-for="(tag, i) in marketHighlights" :key="i" class="md-tag">
              <!-- Utensils / อาหาร -->
              <svg v-if="tag.icon === 'utensils'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"></path><path d="M15 2v10"></path><line x1="15" y1="15" x2="15" y2="22"></line><line x1="8" y1="2" x2="8" y2="22"></line><path d="M8 2c2 0 3 2 3 5s-1 5-3 5"></path></svg>
              <!-- Leaf / ผักผลไม้ -->
              <svg v-else-if="tag.icon === 'leaf'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
              <!-- Train / รถไฟฟ้า -->
              <svg v-else-if="tag.icon === 'train'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="14" rx="3"></rect><line x1="4" y1="11" x2="20" y2="11"></line><line x1="12" y1="3" x2="12" y2="11"></line><line x1="8" y1="21" x2="10" y2="17"></line><line x1="16" y1="21" x2="14" y2="17"></line></svg>
              <!-- Car / ที่จอดรถ -->
              <svg v-else-if="tag.icon === 'car'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3v-5l2-5h14l2 5v5h-2"></path><line x1="3" y1="12" x2="21" y2="12"></line><circle cx="7.5" cy="17" r="2"></circle><circle cx="16.5" cy="17" r="2"></circle></svg>
              <!-- Anchor / ท่าเรือ -->
              <svg v-else-if="tag.icon === 'anchor'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"></circle><line x1="12" y1="22" x2="12" y2="8"></line><path d="M5 12H2a10 10 0 0 0 20 0h-3"></path></svg>
              <!-- Bus / รถเมล์ -->
              <svg v-else-if="tag.icon === 'bus'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="15" rx="2"></rect><line x1="4" y1="10" x2="20" y2="10"></line><line x1="7" y1="21" x2="7" y2="18"></line><line x1="17" y1="21" x2="17" y2="18"></line><circle cx="8" cy="14" r="0.5"></circle><circle cx="16" cy="14" r="0.5"></circle></svg>
              <!-- Shopping Bag -->
              <svg v-else-if="tag.icon === 'shopping-bag'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <!-- Clock / 24 ชม -->
              <svg v-else-if="tag.icon === 'clock'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <!-- Default Tag -->
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              <span class="md-tag-label">{{ tag.label }}</span>
            </li>
          </ul>
        </div>

        <!-- Right Side: Quick Stall Status & Booking Action Card -->
        <div class="md-header-right">
          <div class="md-booking-quick-card">
            <!-- Status Badge Header -->
            <div class="md-bqc-status-row">
              <span class="md-bqc-badge" :class="availNow > 0 ? 'badge-available' : 'badge-full'">
                <span class="md-bqc-dot" :class="{ 'pulsing': availNow > 0 }"></span>
                <span>{{ availNow > 0 ? 'เปิดรับจองแผง' : 'แผงเต็มชั่วคราว' }}</span>
              </span>
              <span class="md-bqc-tag">ตลาด กทม.</span>
            </div>

            <!-- Stalls Availability Metric -->
            <div class="md-bqc-metric-block">
              <div class="md-bqc-metric-header">
                <span class="md-bqc-label">แผงว่างพร้อมจอง</span>
                <span class="md-bqc-count">
                  <strong>{{ availNow }}</strong>
                  <span class="md-bqc-total">/ {{ totalStalls }} แผง</span>
                </span>
              </div>
              <div class="md-bqc-progress-track">
                <div
                  class="md-bqc-progress-fill"
                  :class="`tone-${availLevel}`"
                  :style="{ width: availBarWidth }"
                ></div>
              </div>
            </div>

            <!-- Price & Action Button -->
            <div class="md-bqc-footer">
              <div class="md-bqc-price-box">
                <span class="md-bqc-price-label">ค่าเช่าเริ่มต้น</span>
                <span class="md-bqc-price-value">฿{{ Number(currentMarket.starting_price_monthly || 1800).toLocaleString() }}<small>/ด.</small></span>
              </div>
              <NuxtLink
                :to="bookLink"
                class="md-bqc-btn"
                :class="availNow > 0 ? 'btn-book-active' : 'btn-book-full'"
              >
                <span>{{ availNow > 0 ? 'จองแผงเช่า' : 'ดูผังแผง' }}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Floorplan Section -->
      <section id="md-floorplan" class="md-card md-floorplan-section">
        <h2 class="md-section-title">ภาพแผนผังตลาด</h2>
        <span class="md-section-accent"></span>
        <p class="md-section-sub">ดูภาพรวมการจัดโซนแผงค้า แล้วเข้าสู่ผังแผงดิจิทัลเพื่อเลือกแผงที่ต้องการ</p>

        <!-- แจ้งเตือนเมื่อตลาดเต็ม -->
        <div v-if="availNow <= 0" class="md-full-market-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div class="md-full-alert-content">
            <strong>ตลาดนี้มีผู้เช่าเต็มแล้ว (ยังไม่สามารถทำการจองได้)</strong>
            <span>ขณะนี้แผงค้าทุกแผงมีผู้เช่าครบแล้ว ท่านยังสามารถเข้าชมผังแผงดิจิทัลเพื่อดูตำแหน่งและโซนแผงค้าได้</span>
          </div>
        </div>

        <div
          class="md-floorplan-img-link"
          role="button"
          tabindex="0"
          @click="isFloorplanLightboxOpen = true"
          @keydown.enter="isFloorplanLightboxOpen = true"
          title="คลิกเพื่อดูรูปผังตลาดขนาดใหญ่"
          style="cursor: zoom-in;"
        >
          <img src="/images/chatuchak_isometric_plan.jpg" :alt="`ภาพแผนผัง${currentMarket.name}`" class="md-floorplan-img" />
          <span class="md-floorplan-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            <span>คลิกเพื่อดูรูปผังตลาดขนาดเต็ม</span>
          </span>
        </div>

        <NuxtLink id="md-btn-enter-floorplan" :to="bookLink" class="md-btn-primary md-btn-lg" :class="{ 'md-btn-full': availNow <= 0 }">
          <span>{{ availNow <= 0 ? 'เข้าชมผังแผงดิจิทัล (ตลาดเต็มแล้ว)' : 'เข้าสู่ผังแผงดิจิทัลเพื่อเลือกแผงค้า' }}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </NuxtLink>
      </section>

      <!-- 3. Main Grid: Stats + Detail (ซ้าย) / Photos + Video (ขวา) -->
      <div class="md-main-grid">
        <div class="md-main-left">
          <!-- 2x2 Stat Cards -->
          <div class="md-stats-grid">
            <div class="md-card md-stat-card tone-green">
              <div class="md-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2.5"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
              </div>
              <div class="md-stat-body">
                <div class="md-stat-label">ราคาเช่า</div>
                <div class="md-stat-value">{{ priceRange }} <span class="md-stat-unit">บาท/เดือน</span></div>
              </div>
            </div>

            <div class="md-card md-stat-card tone-blue">
              <div class="md-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3H3v18h18V3z"></path><path d="M3 9h18M9 21V9"></path></svg>
              </div>
              <div class="md-stat-body">
                <div class="md-stat-label">ขนาดพื้นที่</div>
                <div class="md-stat-value">4 - 25 <span class="md-stat-unit">ตร.ม.</span></div>
              </div>
            </div>

            <div :class="['md-card', 'md-stat-card', `tone-${availLevel}`]">
              <div class="md-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <div class="md-stat-body">
                <div class="md-stat-label">แผงว่างพร้อมให้เช่า</div>
                <div class="md-stat-value">
                  <template v-if="availNow > 0">
                    <span class="md-avail-num">{{ availNow.toLocaleString() }}</span>
                    <span class="md-stat-unit">/ {{ totalStalls.toLocaleString() }} แผง</span>
                  </template>
                  <span v-else class="md-avail-num">เต็ม</span>
                </div>
                <div class="md-avail-track">
                  <span class="md-avail-bar" :style="{ width: availBarWidth }"></span>
                </div>
              </div>
            </div>

            <div class="md-card md-stat-card tone-slate">
              <div class="md-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0"></path><path d="M3 17V11l2-5h14l2 5v6"></path><line x1="3" y1="11" x2="21" y2="11"></line></svg>
              </div>
              <div class="md-stat-body">
                <div class="md-stat-label">ที่จอดรถ</div>
                <div class="md-stat-value">{{ parkingCount }} <span class="md-stat-unit">คัน</span></div>
              </div>
            </div>
          </div>

          <!-- Market Detail Card -->
          <div id="md-detail" class="md-card md-detail-card">
            <h3 class="md-card-title">รายละเอียดตลาด</h3>
            <p class="md-detail-text md-detail-lead">
              {{ currentMarket.description || 'ตลาดมาตรฐานภายใต้การกำกับดูแลของสำนักงานตลาดกรุงเทพมหานคร ได้รับการรับรองด้านสุขอนามัย ความปลอดภัย และการจัดระเบียบแผงค้าที่เป็นธรรม' }}
            </p>

            <div class="md-detail-body">
              <div class="md-detail-row">
                <span class="md-detail-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </span>
                <div class="md-detail-content">
                  <h4 class="md-sub-title">ที่อยู่</h4>
                  <p class="md-detail-text">{{ currentMarket.address }}</p>
                </div>
              </div>

              <div class="md-detail-row">
                <span class="md-detail-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </span>
                <div class="md-detail-content">
                  <h4 class="md-sub-title">วันและเวลาเปิดทำการ</h4>
                  <p class="md-detail-text">{{ operatingDays }} {{ operatingTime }}</p>
                </div>
              </div>

              <div class="md-detail-row">
                <span class="md-detail-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                </span>
                <div class="md-detail-content">
                  <h4 class="md-sub-title">การเดินทาง</h4>
                  <div class="md-travel-list">
                    <span class="md-travel-chip">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="15" rx="2"></rect><line x1="4" y1="10" x2="20" y2="10"></line><line x1="7" y1="21" x2="7" y2="18"></line><line x1="17" y1="21" x2="17" y2="18"></line></svg>
                      รถโดยสารประจำทาง
                    </span>
                    <span class="md-travel-chip">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3v-5l2-5h14l2 5v5h-2"></path><circle cx="7.5" cy="17" r="2"></circle><circle cx="16.5" cy="17" r="2"></circle><line x1="10" y1="4" x2="14" y2="4"></line></svg>
                      รถรับจ้างสาธารณะ
                    </span>
                    <span class="md-travel-chip">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3v-5l2-5h14l2 5v5h-2"></path><line x1="3" y1="12" x2="21" y2="12"></line><circle cx="7.5" cy="17" r="2"></circle><circle cx="16.5" cy="17" r="2"></circle></svg>
                      รถยนต์ส่วนบุคคล
                    </span>
                    <span class="md-travel-chip">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="14" rx="3"></rect><line x1="4" y1="11" x2="20" y2="11"></line><line x1="8" y1="21" x2="10" y2="17"></line><line x1="16" y1="21" x2="14" y2="17"></line></svg>
                      รถไฟฟ้า BTS / MRT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="md-main-right">
          <!-- More Photos -->
          <div class="md-card md-media-card">
            <h3 class="md-card-title">รูปภาพเพิ่มเติม</h3>
            <div class="md-media-frame">
              <img :src="currentMarket.image_url || '/images/market_hall_front.jpg'" :alt="currentMarket.name" />
            </div>
          </div>

          <!-- Intro Video -->
          <div class="md-card md-media-card">
            <h3 class="md-card-title">วิดีโอแนะนำตลาด</h3>
            <a
              id="md-video-link"
              class="md-media-frame md-video-frame"
              :href="`https://www.youtube.com/results?search_query=${encodeURIComponent(currentMarket.name)}`"
              target="_blank"
              rel="noopener"
              title="ดูวิดีโอแนะนำตลาดบน YouTube"
            >
              <img :src="currentMarket.image_url || '/images/market_hall_front.jpg'" :alt="`วิดีโอแนะนำ${currentMarket.name}`" />
              <span class="md-video-overlay"></span>
              <span class="md-play-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="8 5 19 12 8 19 8 5"></polygon></svg>
              </span>
              <span class="md-video-caption">{{ currentMarket.name }}</span>
            </a>
          </div>
        </aside>
      </div>

      <!-- 4. Map Card (เต็มความกว้าง) -->
      <section id="md-map" class="md-card md-map-card">
        <div class="md-map-header">
          <h3 class="md-card-title" style="margin-bottom: 0;">แผนที่ตลาด</h3>

          <div class="md-map-tools">
            <div class="gis-mini-mode">
              <button
                type="button"
                :class="['gis-mini-tab', { active: currentMapMode === 'street' }]"
                @click="setMapMode('street')"
                title="มุมมองแผนที่ถนน"
              >
                <span>แผนที่</span>
              </button>
              <button
                type="button"
                :class="['gis-mini-tab', { active: currentMapMode === 'satellite' }]"
                @click="setMapMode('satellite')"
                title="มุมมองภาพถ่ายดาวเทียม"
              >
                <span>ดาวเทียม</span>
              </button>
            </div>

            <a
              id="md-google-maps-link"
              :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentMarket.name + ' ' + (currentMarket.district || 'กรุงเทพ'))}`"
              target="_blank"
              rel="noopener"
              class="md-map-external"
            >
              <span>เปิด Google Maps</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>
        </div>

        <div class="md-map-frame">
          <div id="market-overview-map" style="width: 100%; height: 100%;"></div>
        </div>
      </section>
    </div>

    <!-- Floorplan Image Lightbox Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="isFloorplanLightboxOpen"
          class="md-lightbox-backdrop"
          @click="isFloorplanLightboxOpen = false"
        >
          <div class="md-lightbox-dialog" @click.stop>
            <div class="md-lightbox-header">
              <div class="md-lightbox-title-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                  <line x1="8" y1="2" x2="8" y2="18"></line>
                  <line x1="16" y1="6" x2="16" y2="22"></line>
                </svg>
                <strong>ภาพแผนผัง{{ currentMarket.name }} (ภาพรวม)</strong>
              </div>
              <button
                type="button"
                class="md-lightbox-close"
                @click="isFloorplanLightboxOpen = false"
                title="ปิดหน้าต่าง"
                aria-label="ปิด"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="md-lightbox-body">
              <img
                src="/images/chatuchak_isometric_plan.jpg"
                :alt="`ภาพแผนผัง${currentMarket.name}`"
                class="md-lightbox-img"
              />
            </div>

            <div class="md-lightbox-footer">
              <span class="md-lightbox-tip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>คลิกหรือเลื่อนดูผังโซนและทางเข้า-ออกต่างๆ</span>
              </span>
              <div class="md-lightbox-actions">
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  @click="isFloorplanLightboxOpen = false"
                >
                  ปิด
                </button>
                <NuxtLink
                  :to="bookLink"
                  class="btn btn-primary btn-sm"
                  style="display: inline-flex; align-items: center; gap: 6px;"
                >
                  <span>{{ availNow <= 0 ? 'เข้าชมผังแผงดิจิทัล' : 'เข้าสู่การจองแผง' }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { get } = useApi()

const currentMarket = ref<any>({
  id: 1,
  slug: 'chatuchak',
  name: 'ตลาดนัดจตุจักร',
  name_en: 'Chatuchak Weekend Market',
  district: 'เขตจตุจักร',
  address: '587/10 ถ.กำแพงเพชร 2 แขวงจตุจักร เขตจตุจักร กรุงเทพมหานคร 10900',
  operating_hours: 'เสาร์ - อาทิตย์ 09:00 - 18:00 น.',
  tags: ['ตลาดนัดสุดสัปดาห์', 'BTS หมอชิต / MRT สวนจตุจักร', 'มีที่จอดรถ 800+ คัน', 'แฟชั่นและเสื้อผ้า'],
  lat: 13.7998,
  lng: 100.5501
})

const availableCount = ref(54)
const isFloorplanLightboxOpen = ref(false)
const currentMapMode = ref<'street' | 'satellite'>('street')
let maplibregl: any = null
let map: any = null
let marker: any = null

const streetStyle: any = {
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

const setMapMode = (mode: 'street' | 'satellite') => {
  if (currentMapMode.value === mode || !map) return
  currentMapMode.value = mode
  map.setStyle(mode === 'street' ? streetStyle : satelliteStyle)
}

const initMap = () => {
  if (!maplibregl || !document.getElementById('market-overview-map')) return

  const lng = currentMarket.value.lng || 100.5501
  const lat = currentMarket.value.lat || 13.7998

  map = new maplibregl.Map({
    container: 'market-overview-map',
    style: currentMapMode.value === 'street' ? streetStyle : satelliteStyle,
    center: [lng, lat],
    zoom: 15
  })

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')

  // Create custom marker pin
  const el = document.createElement('div')
  el.className = 'market-overview-pin'
  el.innerHTML = `
    <div style="background: #2563eb; color: #fff; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 11px; box-shadow: 0 4px 12px rgba(37,99,235,0.4); border: 2px solid #ffffff; display: flex; align-items: center; gap: 5px; cursor: pointer;">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      <span>${currentMarket.value.name}</span>
    </div>
  `

  const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
    <div style="padding: 4px; font-family: 'Bai Jamjuree', sans-serif;">
      <strong style="color: #0f172a; font-size: 0.9rem; display: block; margin-bottom: 2px;">${currentMarket.value.name}</strong>
      <span style="font-size: 0.78rem; color: #64748b;">${currentMarket.value.address}</span>
      <div style="margin-top: 6px;">
        <button type="button" onclick="window.$navigateToMarket('${currentMarket.value.id}', 'book')" style="background: none; border: none; padding: 0; color: #2563eb; font-weight: 700; font-size: 0.8rem; cursor: pointer; font-family: 'Bai Jamjuree', sans-serif;">จองแผงเช่าตลาดนี้ &rarr;</button>
      </div>
    </div>
  `)

  marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
    .setLngLat([lng, lat])
    .setPopup(popup)
    .addTo(map)

  // Open popup by default
  popup.addTo(map)
}

// ---------- Display helpers (หน้ารายละเอียดตลาด) ----------
const bookLink = computed(() => `/stalls/book?market=${currentMarket.value.id || 1}`)

// แยก "เสาร์ - อาทิตย์ 09:00 - 18:00 น." เป็นวัน / เวลา
const operatingDays = computed(() => {
  const h = currentMarket.value.operating_hours || 'ทุกวัน 05:00 - 19:00 น.'
  const idx = h.search(/\d/)
  return idx > 0 ? h.slice(0, idx).trim() : 'ทุกวัน'
})

const operatingTime = computed(() => {
  const h = currentMarket.value.operating_hours || 'ทุกวัน 05:00 - 19:00 น.'
  const idx = h.search(/\d/)
  return idx >= 0 ? h.slice(idx).trim() : h
})

const priceRange = computed(() => {
  const min = Number(currentMarket.value.starting_price_monthly || 1800)
  const max = Number(currentMarket.value.max_price_monthly || Math.round((min * 2.5) / 100) * 100)
  return `${min.toLocaleString()} - ${max.toLocaleString()}`
})

// ดึงจำนวนที่จอดรถจาก tag เช่น "มีที่จอดรถ 800+ คัน"
const parkingCount = computed(() => {
  const tag = (currentMarket.value.tags || []).find((t: string) => t.includes('ที่จอดรถ'))
  const m = tag && tag.match(/([\d,]+\+?)/)
  return m ? m[1] : '120+'
})

// แท็กจุดเด่นของตลาด: ตัด emoji และกรองแท็กสถานะ (เช่น "ติดจองเต็ม") ออก
const getTagIcon = (label: string) => {
  if (/BTS|MRT|ARL|รถไฟฟ้า|รถไฟ/i.test(label)) return 'train'
  if (/จอดรถ/.test(label)) return 'car'
  if (/ท่าเรือ|เรือ/.test(label)) return 'anchor'
  if (/รถเมล์|ขสมก|สาย\s?\d/.test(label)) return 'bus'
  if (/24\s?ชม|กลางคืน|ทุกวัน|เปิด/.test(label)) return 'clock'
  if (/อาหาร|ปรุงสำเร็จ|ของกิน|สตรีทฟู้ด|เครื่องดื่ม|ร้านอาหาร|ของอร่อย/.test(label)) return 'utensils'
  if (/ผัก|ผลไม้|สด|เกษตร|เนื้อสัตว์|อาหารทะเล|ของสด/.test(label)) return 'leaf'
  if (/เสื้อผ้า|แฟชั่น|ของใช้|วินเทจ|ต้นไม้/.test(label)) return 'shopping-bag'
  return 'tag'
}

// แผงว่าง: ใช้เกณฑ์สีเดียวกับการ์ดตลาดหน้าแรก (ok ≥50%, mid 20-49%, low 1-19%, full)
const availNow = computed<number>(() => Number(currentMarket.value.available_stalls ?? availableCount.value) || 0)
const totalStalls = computed<number>(() => Math.max(Number(currentMarket.value.total_stalls) || 180, availNow.value))
const availLevel = computed(() => {
  if (availNow.value <= 0) return 'full'
  const pct = (availNow.value / totalStalls.value) * 100
  if (pct >= 50) return 'ok'
  if (pct >= 20) return 'mid'
  return 'low'
})
const availBarWidth = computed(() => {
  if (availNow.value <= 0) return '100%'
  return `${Math.max(2, Math.round((availNow.value / totalStalls.value) * 100))}%`
})

const marketHighlights = computed(() => {
  const tags: string[] = currentMarket.value.tags || []
  return tags
    .map((t) => String(t)
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu, '')
      .trim())
    .filter((t) => t && !/ติดจองเต็ม|เต็มแล้ว|ปิดรับ/.test(t))
    .map((label) => ({ label, icon: getTagIcon(label) }))
})

onMounted(async () => {
  // If market query parameter is provided, load its details from /api/v1/markets
  const marketQuery = route.query.market
  if (marketQuery) {
    try {
      const markets = await get('/markets')
      const found = markets.find((m: any) => String(m.id) === String(marketQuery) || m.slug === marketQuery)
      if (found) {
        currentMarket.value = found
      }
    } catch (e) {
      console.warn('Could not fetch market details:', e)
    }
  }

  // Load actual available count from backend
  try {
    const stalls = await get('/stalls')
    if (stalls && stalls.length) {
      const avail = stalls.filter((s: any) => s.status === 'available').length
      if (avail > 0) availableCount.value = avail
    }
  } catch (err) {
    console.error('Error fetching stalls:', err)
  }

  // Initialize MapLibre GL
  if (process.client) {
    (window as any).$navigateToMarket = (marketId: number | string, action: 'book' | 'stalls') => {
      if (action === 'book') {
        navigateTo(`/stalls/book?market=${marketId}`)
      } else {
        navigateTo(`/stalls?market=${marketId}`)
      }
    }
    maplibregl = await import('maplibre-gl')
    initMap()
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
/* ============================================================== */
/* MARKET DETAIL PAGE                                             */
/* ============================================================== */
.market-detail-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.md-breadcrumb-row {
  margin-bottom: -16px;
}

.md-breadcrumb-row :deep(.body-breadcrumb-wrapper) {
  margin-bottom: 0;
}

.md-card {
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.md-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 14px;
}

/* ---------- Header Card (Premium Modern BMA Design) ---------- */
.md-header-card {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  padding: 30px 36px;
  background: linear-gradient(135deg, #ffffff 0%, #fbfdff 50%, #f0f7ff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.02);
  overflow: hidden;
}

.md-header-bg-glow {
  position: absolute;
  top: -60px;
  right: -50px;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(219, 234, 254, 0.65) 0%, rgba(239, 246, 255, 0.2) 50%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.md-header-mesh {
  position: absolute;
  bottom: -40px;
  left: -40px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(224, 242, 254, 0.45) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.md-header-left {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}


.md-header-eyebrow {
  margin-bottom: 8px;
}

.md-eyebrow-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 11px;
  border-radius: 999px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  color: #2563eb;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.md-eyebrow-pill svg {
  color: #2563eb;
}

.md-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.md-title {
  font-size: 2.15rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0;
}

.md-title-accent,
.md-section-accent {
  display: block;
  width: 44px;
  height: 4px;
  border-radius: 999px;
  background: #2563eb;
  margin-top: 8px;
}

/* Metadata Bar - Modern Minimalist Style */
.md-meta-row {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  margin: 0 0 16px 0;
  transition: all 0.2s ease;
}

.md-meta-row:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.md-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.md-meta-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #2563eb;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.md-meta-item:hover .md-meta-icon {
  transform: scale(1.05);
  border-color: #93c5fd;
}

.md-meta-content {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.md-meta-label {
  font-size: 0.68rem;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.md-meta-val {
  font-size: 0.88rem;
  color: #0f172a;
  font-weight: 700;
}

.md-meta-divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
}

/* Feature & Category Tags - Modern Harmonious Soft Pills */
.md-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.md-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  font-size: 0.82rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.04);
  transition: all 0.2s ease;
  cursor: default;
  user-select: none;
}

.md-tag:hover {
  transform: translateY(-1px);
  border-color: #93c5fd;
  background: #dbeafe;
  color: #1d4ed8;
  box-shadow: 0 3px 8px rgba(37, 99, 235, 0.12);
}

.md-tag svg {
  flex-shrink: 0;
  color: #2563eb;
  transition: color 0.2s ease;
}

.md-tag:hover svg {
  color: #1d4ed8;
}

.md-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.86rem;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.md-btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(29, 78, 216, 0.28);
}

.md-btn-lg {
  padding: 12px 24px;
  font-size: 0.92rem;
}

/* Right Side: Quick Stall Status & Booking Card */
.md-header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.md-booking-quick-card {
  width: 270px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.25s ease;
}

.md-header-card:hover .md-booking-quick-card {
  border-color: #cbd5e1;
  box-shadow: 0 10px 25px -4px rgba(37, 99, 235, 0.1), 0 2px 6px rgba(15, 23, 42, 0.04);
}

.md-bqc-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.md-bqc-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
}

.md-bqc-badge.badge-available {
  background: #dcfce7;
  color: #15803d;
}

.md-bqc-badge.badge-full {
  background: #fee2e2;
  color: #dc2626;
}

.md-bqc-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.md-bqc-dot.pulsing {
  box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7);
  animation: bqc-pulse 2s infinite;
}

@keyframes bqc-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(22, 163, 74, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
  }
}

.md-bqc-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
}

.md-bqc-metric-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.md-bqc-metric-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 0.8rem;
}

.md-bqc-label {
  color: #64748b;
  font-weight: 500;
}

.md-bqc-count strong {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.md-bqc-total {
  color: #94a3b8;
  font-size: 0.76rem;
  margin-left: 2px;
}

.md-bqc-progress-track {
  width: 100%;
  height: 6px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.md-bqc-progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.md-bqc-progress-fill.tone-ok {
  background: #10b981;
}

.md-bqc-progress-fill.tone-mid {
  background: #2563eb;
}

.md-bqc-progress-fill.tone-low {
  background: #f59e0b;
}

.md-bqc-progress-fill.tone-full {
  background: #94a3b8;
}

.md-bqc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  gap: 12px;
}

.md-bqc-price-box {
  display: flex;
  flex-direction: column;
}

.md-bqc-price-label {
  font-size: 0.7rem;
  color: #64748b;
}

.md-bqc-price-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.md-bqc-price-value small {
  font-size: 0.72rem;
  font-weight: 500;
  color: #64748b;
}

.md-bqc-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.md-bqc-btn.btn-book-active {
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
}

.md-bqc-btn.btn-book-active:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.md-bqc-btn.btn-book-full {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.md-bqc-btn.btn-book-full:hover {
  background: #e2e8f0;
}

/* ---------- Floorplan ---------- */
.md-floorplan-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 28px 30px;
  scroll-margin-top: 80px;
}

.md-section-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  text-align: center;
}

.md-section-accent {
  margin: 8px auto 0;
}

.md-section-sub {
  margin-top: 14px;
  font-size: 0.88rem;
  color: #64748b;
  text-align: center;
}

.md-floorplan-img-link {
  position: relative;
  display: block;
  width: 100%;
  max-width: 760px;
  margin: 18px auto 22px;
  border-radius: 14px;
  overflow: hidden;
}

.md-floorplan-img {
  width: 100%;
  display: block;
  mix-blend-mode: multiply;
  transition: transform 0.4s ease;
}

.md-floorplan-img-link:hover .md-floorplan-img {
  transform: scale(1.02);
}

.md-floorplan-hint {
  position: absolute;
  right: 14px;
  bottom: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.md-floorplan-img-link:hover .md-floorplan-hint {
  opacity: 1;
  transform: translateY(0);
}

/* ---------- Main Grid ---------- */
.md-main-grid {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.md-main-left {
  flex: 1.85;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.md-main-right {
  flex: 1;
  min-width: 320px;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.md-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.md-stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.md-stat-card:hover {
  border-color: #dbeafe;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
  transform: translateY(-2px);
}

.md-stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--tone-bg, #eff6ff);
  color: var(--tone-fg, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* โทนสีไอคอนแต่ละการ์ด + สีระดับแผงว่าง */
.tone-green { --tone-bg: #ecfdf5; --tone-fg: #059669; }
.tone-blue  { --tone-bg: #eff6ff; --tone-fg: #2563eb; }
.tone-slate { --tone-bg: #f1f5f9; --tone-fg: #475569; }
.tone-ok    { --tone-bg: #dcfce7; --tone-fg: #15803d; --bar: #22c55e; }
.tone-mid   { --tone-bg: #fef9c3; --tone-fg: #a16207; --bar: #eab308; }
.tone-low   { --tone-bg: #ffedd5; --tone-fg: #c2410c; --bar: #f97316; }
.tone-full  { --tone-bg: #fee2e2; --tone-fg: #dc2626; --bar: #ef4444; }

.md-stat-body {
  flex: 1;
  min-width: 0;
}

.md-stat-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.md-stat-value {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 1.45rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.25;
  margin-top: 2px;
}

.md-stat-unit {
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
}

.md-avail-num {
  color: var(--tone-fg, #1e293b);
}

.md-avail-track {
  height: 6px;
  margin-top: 8px;
  border-radius: 999px;
  background: #f1f5f9;
  overflow: hidden;
}

.md-avail-bar {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--bar, #2563eb);
  transition: width 0.6s ease;
}

.md-detail-card {
  padding: 24px 28px;
  scroll-margin-top: 80px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.md-detail-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.md-detail-text {
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.7;
}

.md-detail-lead {
  margin-bottom: 8px;
}

.md-detail-row {
  display: flex;
  gap: 14px;
  padding: 16px 0;
  border-top: 1px solid #f1f5f9;
}

.md-detail-row:first-of-type {
  margin-top: 12px;
}

.md-detail-row:last-child {
  padding-bottom: 0;
}

.md-detail-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.md-detail-content {
  flex: 1;
  min-width: 0;
}

.md-sub-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.md-travel-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.md-travel-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #334155;
  background: #f8fafc;
  font-size: 0.82rem;
  font-weight: 500;
}

.md-travel-chip svg {
  color: #2563eb;
}

/* ---------- Media Cards ---------- */
.md-media-card {
  padding: 20px;
}

.md-media-frame {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 12px;
  overflow: hidden;
  background: #f1f5f9;
}

.md-media-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.md-media-frame:hover img {
  transform: scale(1.04);
}

.md-video-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.05) 30%, rgba(15, 23, 42, 0.6) 100%);
}

.md-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 56px;
  height: 40px;
  transform: translate(-50%, -50%);
  border-radius: 12px;
  background: #ef4444;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(239, 68, 68, 0.45);
  transition: transform 0.2s ease;
}

.md-video-frame:hover .md-play-btn {
  transform: translate(-50%, -50%) scale(1.08);
}

.md-video-caption {
  position: absolute;
  left: 14px;
  bottom: 12px;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

/* ---------- Map Card ---------- */
.md-map-card {
  padding: 24px;
  scroll-margin-top: 80px;
}

.md-map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
}

.md-map-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.md-map-external {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid #93c5fd;
  background: #ffffff;
  font-size: 0.825rem;
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
  transition: background 0.2s ease;
}

.md-map-external:hover {
  background: #eff6ff;
}

.md-map-frame {
  height: 380px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.gis-mini-mode {
  display: inline-flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 2px;
  border: 1px solid #e2e8f0;
}

.gis-mini-tab {
  padding: 4px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gis-mini-tab:hover {
  color: #0f172a;
}

.gis-mini-tab.active {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-weight: 700;
}

/* แจ้งเตือนเมื่อตลาดเต็ม */
.md-full-market-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px 18px;
  border-radius: 12px;
  margin: 16px 0 10px;
  max-width: 760px;
  width: 100%;
}

.md-full-market-alert svg {
  flex-shrink: 0;
  color: #dc2626;
}

.md-full-alert-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.84rem;
  line-height: 1.5;
}

.md-full-alert-content strong {
  font-weight: 700;
  color: #b91c1c;
}

.md-btn-full {
  background: #475569 !important;
  box-shadow: 0 2px 8px rgba(71, 85, 105, 0.25) !important;
}

.md-btn-full:hover {
  background: #334155 !important;
}

/* ---------- Responsive ---------- */
@media (max-width: 960px) {
  .md-main-grid {
    flex-direction: column;
  }
  .md-main-right {
    max-width: 100%;
    min-width: 0;
  }
  .md-detail-card {
    flex: none;
  }
}

@media (max-width: 768px) {
  .md-header-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 22px;
    gap: 20px;
  }
  .md-header-right {
    width: 100%;
    justify-content: center;
  }
  .md-booking-quick-card {
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
  }
  .md-meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding: 12px 14px;
  }
  .md-meta-divider {
    display: none;
  }
  .md-title {
    font-size: 1.65rem;
  }
  .md-stats-grid {
    grid-template-columns: 1fr;
  }
  .md-map-frame {
    height: 300px;
  }
}

/* ---------- Floorplan Lightbox Modal ---------- */
.md-lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.md-lightbox-dialog {
  background: #ffffff;
  border-radius: 18px;
  max-width: 1100px;
  width: 100%;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.md-lightbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
}

.md-lightbox-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #0f172a;
  font-size: 1.05rem;
}

.md-lightbox-title-wrap svg {
  color: #2563eb;
}

.md-lightbox-close {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.md-lightbox-close:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.md-lightbox-body {
  padding: 16px;
  overflow: auto;
  background: #faf8f5;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 380px;
}

.md-lightbox-img {
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.md-lightbox-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
  flex-wrap: wrap;
  gap: 12px;
}

.md-lightbox-tip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #64748b;
}

.md-lightbox-tip svg {
  color: #3b82f6;
}

.md-lightbox-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
