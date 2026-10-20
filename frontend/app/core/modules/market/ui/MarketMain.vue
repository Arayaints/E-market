<template>
  <div class="homepage-container">
    <!-- Top Header Navigation Bar (Clean & Streamlined) -->
    <AppHeader subtitle="ระบบบริการจองแผงเช่า 12 ตลาด สำนักงานตลาดกรุงเทพมหานคร" />

    <div class="content-body" style="max-width: 1260px; margin: 0 auto; padding: 28px 24px 80px;">
      <!-- ============================================================== -->
      <!-- 1. TOP HERO PROMOTIONAL BANNER (Modern High-Impact Banner)     -->
      <!-- ============================================================== -->
      <div class="hero-banner-wrapper">
        <div class="hero-banner-card card">
          <!-- Left Side: Market Photo with Diagonal Red Discount Ribbon -->
          <div class="hero-left-media">
            <img
              src="/images/market_promo_hero.jpg"
              alt="Bangkok Market Promotion"
              class="hero-media-img"
            />
            <div class="hero-media-overlay"></div>
            <!-- Diagonal Cut 50% OFF Badge -->
            <div class="hero-discount-ribbon">
              <div class="ribbon-text-top">รับส่วนลดทันที</div>
              <div class="ribbon-text-main">50% <span class="ribbon-off">OFF</span></div>
            </div>
          </div>

          <!-- Right Side: Clean Callout Content -->
          <div class="hero-right-content">
            <div class="campaign-tag-pill">
              <span class="campaign-dot"></span>
              <span>โครงการสิทธิประโยชน์ผู้ค้า กทม. 2568 - 2569</span>
            </div>
            <div class="hero-subheading">หากคุณกำลังมองหา</div>
            <h1 class="hero-main-heading">
              ทำเลพื้นที่เช่า <span class="heading-gradient">12 ตลาด กทม.</span>
            </h1>
            <p class="hero-description">
              เปิดรับพ่อค้าแม่ค้า ประชาชนทั่วไป และผู้ประกอบการรายย่อย สำหรับประกอบการค้าปลีก สินค้าแฟชั่น อาหารสด อาหารสำเร็จรูป และสินค้าชุมชน ทำเลทองใจกลางเมือง
            </p>

            <!-- Value Proposition Bullets -->
            <div class="hero-features-list">
              <div class="hero-feature-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>ค่าเช่าเริ่มต้น 500 บ./วัน</span>
              </div>
              <div class="hero-feature-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>ติดรถไฟฟ้า & ขนส่งมวลชน</span>
              </div>
              <div class="hero-feature-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>จองออนไลน์ รู้ผลอนุมัติทันที</span>
              </div>
            </div>

            <!-- CTA Buttons Row -->
            <div class="hero-cta-row">
              <button class="btn btn-primary btn-hero-cta" @click="scrollToMarkets">
                <span>สำรวจแผงเช่าว่าง 12 ตลาด</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
              <div class="hero-note">
                * เงื่อนไขเป็นไปตามที่สำนักงานตลาดกรุงเทพมหานครกำหนด
              </div>
            </div>

            <!-- Decorative Navy Accent Shape at bottom-right -->
            <div class="hero-accent-shape"></div>
          </div>
        </div>

        <!-- Carousel Slide Indicators (Blue pill + 3 Gray dots) -->
        <div class="hero-carousel-dots">
          <span
            v-for="i in 4"
            :key="i"
            class="carousel-dot"
            :class="{ active: currentHeroSlide === i }"
            @click="currentHeroSlide = i"
          ></span>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- 2. SECTION: อีเวนต์ตลาด (Market Events)                         -->
      <!-- ============================================================== -->
      <div class="events-card-wrapper card">
        <div class="events-grid-layout">
          <!-- Left Column: Title, Subtitle, and "ดูทั้งหมด >" Button -->
          <div class="events-left-col">
            <div class="events-title-box">
              <div class="events-badge-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>อีเวนต์พิเศษประจำสัปดาห์</span>
              </div>
              <h2 class="events-main-title">อีเวนต์ตลาด</h2>
              <div class="title-blue-bar"></div>
            </div>
            <p class="events-desc-text">
              เปิดรับสมัครผู้ค้าสำหรับงานเทศกาล ป๊อปอัพมาร์เก็ต และพื้นที่อีเวนต์พิเศษใจกลางเมือง โอกาสสร้างยอดขายในทำเลทอง
            </p>
            <div>
              <button class="btn btn-primary btn-sm btn-events-all" @click="scrollToMarkets">
                <span>ดูตลาดทั้งหมด &gt;</span>
              </button>
            </div>
          </div>

          <!-- Middle Column: 3D Megaphone Loudspeaker Illustration -->
          <div class="events-center-col">
            <img
              src="/images/megaphone_3d.jpg"
              alt="3D Announcement Megaphone"
              class="megaphone-img floating-animation"
            />
          </div>

          <!-- Right Column: 3 Event Cards Stack with Pagination -->
          <div class="events-right-col">
            <!-- Event Card 1: ช้อป ชิม ชิลล์ สัญจร 2026 -->
            <div class="event-row-card">
              <div class="event-thumb-box">
                <img src="/images/chatuchak_entrance.jpg" alt="Weekend Craft Market" class="event-thumb-img" />
              </div>
              <div class="event-details-box">
                <h4 class="event-name">ช้อป ชิม ชิลล์ สัญจร 2026</h4>
                <div class="event-meta-line">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>25 - 26 ต.ค. 2568</span>
                </div>
                <div class="event-meta-line">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>ตลาดนัดจตุจักร โครงการ 23</span>
                </div>
              </div>
              <div class="event-action-box">
                <div class="event-stall-stat stat-zero">
                  <span class="stat-number">0</span>
                  <span class="stat-unit">แผง</span>
                </div>
                <NuxtLink to="/stalls/book?market=1" class="btn btn-primary btn-sm btn-event-act">
                  จองพื้นที่ &gt;
                </NuxtLink>
              </div>
            </div>

            <!-- Event Card 2: เทศกาลอาหาร & ดนตรี -->
            <div class="event-row-card">
              <div class="event-thumb-box">
                <img src="/images/market_hall_front.jpg" alt="Food Festival" class="event-thumb-img" />
              </div>
              <div class="event-details-box">
                <h4 class="event-name">เทศกาลอาหาร &amp; ดนตรี</h4>
                <div class="event-meta-line">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>1 - 3 พ.ย. 2568</span>
                </div>
                <div class="event-meta-line">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>ตลาดธนบุรี (สนามหลวง 2)</span>
                </div>
              </div>
              <div class="event-action-box">
                <div class="event-stall-stat stat-green">
                  <span class="stat-number">18</span>
                  <span class="stat-unit">แผง</span>
                </div>
                <NuxtLink to="/stalls/book?market=11" class="btn btn-primary btn-sm btn-event-act">
                  จองพื้นที่ &gt;
                </NuxtLink>
              </div>
            </div>

            <!-- Event Card 3: NEIGHBORHOOD MARKET -->
            <div class="event-row-card">
              <div class="event-thumb-box">
                <img src="/images/market_promo_hero.jpg" alt="Neighborhood Market" class="event-thumb-img" />
              </div>
              <div class="event-details-box">
                <h4 class="event-name">NEIGHBORHOOD MARKET</h4>
                <div class="event-meta-line">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>8 - 10 พ.ย. 2568</span>
                </div>
                <div class="event-meta-line">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>ตลาดเทวราช ดุสิต</span>
                </div>
              </div>
              <div class="event-action-box">
                <div class="event-stall-stat stat-orange">
                  <span class="stat-number">3</span>
                  <span class="stat-unit">แผง</span>
                </div>
                <NuxtLink to="/stalls/book?market=5" class="btn btn-primary btn-sm btn-event-act">
                  จองพื้นที่ &gt;
                </NuxtLink>
              </div>
            </div>

            <!-- Pagination Below Event Cards -->
            <div class="events-page-nav">
              <button class="page-btn" :disabled="currentEventsPage === 1" @click="currentEventsPage = Math.max(1, currentEventsPage - 1)">&lt;</button>
              <button v-for="p in 5" :key="p" class="page-btn" :class="{ active: currentEventsPage === p }" @click="currentEventsPage = p">{{ p }}</button>
              <button class="page-btn" :disabled="currentEventsPage === 5" @click="currentEventsPage = Math.min(5, currentEventsPage + 1)">&gt;</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- 3. SECTION: 12 ตลาด (The 12 Markets Directory)                 -->
      <!-- ============================================================== -->
      <div id="markets-12-directory" class="markets-directory-wrap">
        <!-- Center Header: Title & Subtitle -->
        <div class="directory-title-header">
          <div class="directory-header-pill">
            <span>สำนักงานตลาดกรุงเทพมหานคร</span>
          </div>
          <h2 class="directory-big-heading">
            12 <span class="heading-underline">ตลาดในสังกัด กทม.</span>
          </h2>
          <p class="directory-sub-caption">
            ค้นหาข้อมูล ทำเล และยื่นขอจองแผงค้าออนไลน์ได้ทันที พร้อมระบบผังแผงดิจิทัล 3 มิติ และสัญญามาตรฐาน
          </p>
        </div>

        <!-- Search Bar Centered -->
        <div class="search-bar-centered">
          <div class="search-input-pill-wrap">
            <span class="search-icon-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input-field"
              placeholder="ค้นหาตลาดที่ต้องการจอง, ชื่อเขต, หรือทำเล (เช่น จตุจักร, มีนบุรี, ธนบุรี)..."
              @input="filterMarkets"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="search-clear-btn"
              @click="clearSearch"
              title="ล้างคำค้นหา"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- 5 Category Filter Buttons -->
        <div class="category-icon-buttons-row">
          <!-- Button 0: ทั้งหมด -->
          <div
            class="cat-icon-item"
            :class="{ active: selectedCategory === 'all' }"
            @click="toggleCategory('all')"
          >
            <div class="cat-icon-circle cat-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </div>
            <div class="cat-label">ทั้งหมด (12 ตลาด)</div>
          </div>

          <!-- Button 1: % โปรโมชั่น -->
          <div
            class="cat-icon-item"
            :class="{ active: selectedCategory === 'promo' }"
            @click="toggleCategory('promo')"
          >
            <div class="cat-icon-circle cat-promo">
              <span class="cat-symbol">%</span>
            </div>
            <div class="cat-label">โปรโมชั่น</div>
          </div>

          <!-- Button 2: ตลาดเปิดใหม่ -->
          <div
            class="cat-icon-item"
            :class="{ active: selectedCategory === 'new' }"
            @click="toggleCategory('new')"
          >
            <div class="cat-icon-circle cat-new">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <div class="cat-label">แผงว่างเยอะ</div>
          </div>

          <!-- Button 3: ใกล้รถไฟฟ้า -->
          <div
            class="cat-icon-item"
            :class="{ active: selectedCategory === 'metro' }"
            @click="toggleCategory('metro')"
          >
            <div class="cat-icon-circle cat-metro">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"></rect><path d="M4 11h16"></path><path d="M12 3v8"></path><path d="m8 19-2 3"></path><path d="m16 19 2 3"></path><circle cx="8" cy="15" r="1"></circle><circle cx="16" cy="15" r="1"></circle></svg>
            </div>
            <div class="cat-label">ใกล้รถไฟฟ้า</div>
          </div>

          <!-- Button 4: เดินทางสะดวก -->
          <div
            class="cat-icon-item"
            :class="{ active: selectedCategory === 'parking' }"
            @click="toggleCategory('parking')"
          >
            <div class="cat-icon-circle cat-transit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle><path d="M5 11h14"></path></svg>
            </div>
            <div class="cat-label">เดินทางสะดวก</div>
          </div>
        </div>

        <!-- Interactive GIS Map Toggle Button -->
        <div class="map-view-toggle-bar">
          <button
            class="btn btn-sm"
            :class="showGisMap ? 'btn-primary' : 'btn-outline'"
            @click="showGisMap = !showGisMap"
          >
            <span style="display: inline-flex; align-items: center; gap: 7px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
              <span>{{ showGisMap ? 'ซ่อนแผนที่ GIS กทม.' : 'เปิดดูแผนที่ GIS กทม. (ปักหมุดทั้ง 12 ตลาด)' }}</span>
            </span>
          </button>
        </div>

        <!-- GIS Map Section (When Opened) -->
        <div v-if="showGisMap" style="margin-bottom: 36px;">
          <BangkokMarketsGisMap
            :markets="filteredMarkets"
            @selectMarket="onSelectMarketOnMap"
          />
        </div>

        <!-- ============================================================ -->
        <!-- 12 MARKET CARDS GRID (3 Columns x 4 Rows)                    -->
        <!-- ============================================================ -->
        <div v-if="loadingMarkets" style="text-align: center; padding: 60px;">
          <div style="font-size: 1rem; color: #64748b; display: inline-flex; align-items: center; gap: 8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>กำลังโหลดข้อมูลตลาด กทม. ...</span>
          </div>
        </div>

        <div v-else class="market-cards-3col-grid">
          <div
            v-for="m in filteredMarkets"
            :key="m.id"
            class="market-box-card card"
          >
            <!-- Card Top Image with Rounded Corners & Green "เปิดจอง" Badge -->
            <NuxtLink :to="`/stalls?market=${m.id}`" class="market-img-container" title="คลิกเพื่อดูภาพแผนผังและข้อมูลตลาด">
              <img :src="m.image_url" :alt="m.name" class="market-box-img" />
              <div class="market-img-gradient"></div>
              <!-- Status Badge (Top-Right Pill) -->
              <div class="market-avail-badge" :class="m.status === 'open' && m.available_stalls > 0 ? 'badge-green' : 'badge-red'">
                <span class="badge-dot-live"></span>
                <span>{{ m.status === 'open' && m.available_stalls > 0 ? 'เปิดจอง' : 'เต็มแล้ว' }}</span>
              </div>
              <!-- Top Left Market Code Pill -->
              <div class="market-code-pill">
                <span>{{ m.slug ? m.slug.toUpperCase() : `MKT-${m.id}` }}</span>
              </div>
            </NuxtLink>

            <!-- Card Body Content -->
            <div class="market-box-body">
              <!-- Name & Tag Pill -->
              <div class="market-header-row">
                <NuxtLink :to="`/stalls?market=${m.id}`" style="text-decoration: none;">
                  <h3 class="market-card-name">{{ m.name }}</h3>
                </NuxtLink>
                <span class="market-tag-pill-blue">
                  {{ m.tags?.[0] || 'ตลาดมาตรฐาน กทม.' }}
                </span>
              </div>

              <!-- Address with Pin Icon -->
              <div class="market-card-address">
                <span class="pin-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </span>
                <span>{{ m.address }}</span>
              </div>

              <!-- Occupancy Rate Progress Bar -->
              <div class="market-occupancy-row">
                <div class="occupancy-info">
                  <span class="occupancy-label">แผงว่างคงเหลือ:</span>
                  <strong class="occupancy-val" :class="m.available_stalls > 0 ? 'text-emerald' : 'text-slate'">
                    {{ m.available_stalls || 0 }} แผง
                  </strong>
                </div>
                <div class="occupancy-progress-bar">
                  <div
                    class="occupancy-progress-fill"
                    :style="{ width: `${Math.min(100, Math.round(((m.total_stalls - (m.available_stalls || 0)) / (m.total_stalls || 100)) * 100))}%` }"
                  ></div>
                </div>
              </div>

              <!-- Starting Price -->
              <div class="market-price-tag">
                <span class="price-prefix">เริ่มต้น ฿</span>
                <span class="price-number">{{ m.starting_price_daily || 500 }}</span>
                <span class="price-suffix">/ วัน</span>
              </div>

              <!-- Action Button: Full-Width Primary "จองแผงเช่า" -->
              <div class="market-card-actions">
                <NuxtLink
                  :to="m.slug === 'chatuchak' ? '/stalls/book?market=chatuchak' : `/stalls/book?market=${m.id}`"
                  class="btn btn-primary btn-book-stall"
                  title="เข้าสู่ขั้นตอนการจองแผงเช่าทันที"
                >
                  <span>จองแผงเช่า &amp; ดูผังแผงค้า</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="btn-arrow-icon"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Results Message -->
        <div v-if="filteredMarkets.length === 0 && !loadingMarkets" class="card empty-search-card">
          <div style="margin-bottom: 12px; color: #94a3b8; display: flex; justify-content: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
            ไม่พบตลาดตามเงื่อนไขที่ระบุ
          </h3>
          <p style="font-size: 0.88rem; color: #64748b; margin-bottom: 18px;">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกดูตลาดทั้งหมด 12 แห่งในสังกัด กทม.
          </p>
          <button class="btn btn-primary btn-sm" @click="resetFilters">
            แสดงตลาดทั้งหมด 12 แห่ง
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { get } = useApi()

// Search & Filter State
const searchQuery = ref('')
const selectedCategory = ref<string>('all')
const showGisMap = ref(false)
const currentHeroSlide = ref(1)
const currentEventsPage = ref(2)

// Data State
const loadingMarkets = ref(true)
const marketsList = ref<any[]>([])
const filteredMarkets = ref<any[]>([])

const loadData = async () => {
  loadingMarkets.value = true
  try {
    const marketsRes = await get('/markets')
    marketsList.value = marketsRes || []
    filteredMarkets.value = marketsList.value
  } catch (err) {
    console.error('Failed to load markets:', err)
  } finally {
    loadingMarkets.value = false
  }
}

const filterMarkets = () => {
  let list = [...marketsList.value]

  // Filter by text search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(m =>
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.name_en && m.name_en.toLowerCase().includes(q)) ||
      (m.district && m.district.toLowerCase().includes(q)) ||
      (m.address && m.address.toLowerCase().includes(q)) ||
      (m.tags && m.tags.some((t: string) => t.toLowerCase().includes(q)))
    )
  }

  // Filter by category icon
  if (selectedCategory.value === 'promo') {
    list = list.filter(m => m.starting_price_daily <= 120 || m.has_event)
  } else if (selectedCategory.value === 'new') {
    list = list.filter(m => m.available_stalls > 5)
  } else if (selectedCategory.value === 'metro') {
    list = list.filter(m => m.tags && m.tags.some((t: string) => t.includes('BTS') || t.includes('MRT') || t.includes('รถไฟฟ้า')))
  } else if (selectedCategory.value === 'parking') {
    list = list.filter(m => m.tags && m.tags.some((t: string) => t.includes('จอดรถ') || t.includes('รถเมล์')))
  }

  filteredMarkets.value = list
}

const toggleCategory = (cat: string) => {
  selectedCategory.value = cat
  filterMarkets()
}

const clearSearch = () => {
  searchQuery.value = ''
  filterMarkets()
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  filterMarkets()
}

const scrollToMarkets = () => {
  const el = document.getElementById('markets-12-directory')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const onSelectMarketOnMap = (market: any) => {
  // Option to focus market
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Main Container */
.homepage-container {
  background-color: var(--bg-main);
  min-height: 100vh;
}

/* ============================================================== */
/* 1. HERO PROMOTIONAL BANNER                                     */
/* ============================================================== */
.hero-banner-wrapper {
  margin-bottom: 38px;
}

.hero-banner-card {
  display: flex;
  padding: 0;
  overflow: hidden;
  border-radius: var(--radius-2xl);
  min-height: 250px;
  background: #ffffff;
  border: 1px solid var(--border-card);
  box-shadow: 0 10px 30px -5px rgba(37, 99, 235, 0.08), 0 4px 12px rgba(15, 23, 42, 0.04);
  position: relative;
}

.hero-left-media {
  position: relative;
  flex: 1.25;
  min-height: 250px;
  overflow: hidden;
}

.hero-media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-banner-card:hover .hero-media-img {
  transform: scale(1.03);
}

.hero-media-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
}

/* Diagonal Cut Red 50% OFF Badge */
.hero-discount-ribbon {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
  color: #ffffff;
  padding: 12px 30px 12px 22px;
  clip-path: polygon(0 0, 100% 0, 85% 100%, 0% 100%);
  box-shadow: 0 8px 24px rgba(225, 29, 72, 0.45);
  z-index: 5;
}

.ribbon-text-top {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  opacity: 0.95;
}

.ribbon-text-main {
  font-size: 1.85rem;
  font-weight: 900;
  line-height: 1.05;
  font-family: var(--font-display);
}

.ribbon-off {
  font-size: 0.92rem;
  font-weight: 800;
}

.hero-right-content {
  flex: 1;
  padding: 34px 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  background: #ffffff;
}

.campaign-tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  width: fit-content;
  margin-bottom: 8px;
}

.campaign-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse-dot 2s infinite;
}

.hero-subheading {
  font-size: 1.02rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 2px;
}

.hero-main-heading {
  font-size: 2.25rem;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.22;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.heading-gradient {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.6;
  max-width: 480px;
  margin-bottom: 16px;
}

.hero-features-list {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.hero-feature-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.hero-cta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-hero-cta {
  padding: 11px 22px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.92rem;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
}

.hero-note {
  font-size: 0.72rem;
  color: #94a3b8;
}

.hero-accent-shape {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 140px;
  height: 8px;
  background: linear-gradient(90deg, transparent, #1d4ed8);
  border-top-left-radius: 8px;
}

.hero-carousel-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: all 0.25s ease;
  cursor: pointer;
}

.carousel-dot.active {
  width: 26px;
  border-radius: 8px;
  background: var(--primary);
}

/* ============================================================== */
/* 2. SECTION: อีเวนต์ตลาด                                        */
/* ============================================================== */
.events-card-wrapper {
  margin-bottom: 46px;
  padding: 30px;
  background: #ffffff;
  border-radius: var(--radius-2xl);
  border: 1px solid var(--border-card);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.events-grid-layout {
  display: grid;
  grid-template-columns: 280px 200px 1fr;
  gap: 28px;
  align-items: center;
}

.events-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 8px;
}

.events-main-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.title-blue-bar {
  width: 44px;
  height: 4px;
  background: var(--primary);
  border-radius: var(--radius-full);
  margin: 6px 0 14px;
}

.events-desc-text {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 18px;
}

.btn-events-all {
  border-radius: 10px;
  font-weight: 700;
}

.events-center-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.megaphone-img {
  width: 170px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 14px 20px rgba(0, 0, 0, 0.12));
}

.floating-animation {
  animation: float 4s ease-in-out infinite;
}

.events-right-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-row-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.event-row-card:hover {
  background: #ffffff;
  border-color: #bfdbfe;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.08);
  transform: translateY(-2px);
}

.event-thumb-box {
  width: 76px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.event-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.event-row-card:hover .event-thumb-img {
  transform: scale(1.08);
}

.event-details-box {
  flex: 1;
  min-width: 0;
}

.event-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meta-line {
  font-size: 0.78rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.event-action-box {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.event-stall-stat {
  padding: 4px 10px;
  border-radius: 8px;
  display: flex;
  align-items: baseline;
  gap: 3px;
  font-weight: 700;
}

.stat-zero {
  background: #f1f5f9;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
}

.stat-green {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.stat-orange {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.stat-number {
  font-size: 1.15rem;
  font-family: var(--font-display);
}

.stat-unit {
  font-size: 0.72rem;
}

.btn-event-act {
  border-radius: 9px;
  padding: 6px 14px;
  font-weight: 700;
}

.events-page-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.page-btn:hover:not(:disabled) {
  background: #f1f5f9;
  color: var(--primary);
  border-color: #cbd5e1;
}

.page-btn.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
  font-weight: 700;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ============================================================== */
/* 3. SECTION: 12 ตลาด DIRECTORY                                   */
/* ============================================================== */
.directory-title-header {
  text-align: center;
  margin-bottom: 24px;
}

.directory-header-pill {
  display: inline-block;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  color: #1d4ed8;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.directory-big-heading {
  font-size: 2.25rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.heading-underline {
  position: relative;
  display: inline-block;
}

.heading-underline::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
  border-radius: var(--radius-full);
}

.directory-sub-caption {
  font-size: 0.95rem;
  color: #64748b;
  margin-top: 6px;
  max-width: 620px;
  margin-left: auto;
  margin-right: auto;
}

.search-bar-centered {
  max-width: 580px;
  margin: 0 auto 28px;
}

.search-input-pill-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 30px;
  padding: 4px 16px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
  transition: all 0.22s ease;
}

.search-input-pill-wrap:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15), 0 4px 16px rgba(15, 23, 42, 0.08);
}

.search-icon-left {
  display: flex;
  align-items: center;
  color: #64748b;
  margin-right: 10px;
}

.search-input-field {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 0;
  font-size: 0.92rem;
  color: #0f172a;
  outline: none;
}

.search-input-field::placeholder {
  color: #94a3b8;
}

.search-clear-btn {
  border: none;
  background: #e2e8f0;
  color: #475569;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.search-clear-btn:hover {
  background: #cbd5e1;
}

/* Category Filter Buttons Row */
.category-icon-buttons-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.cat-icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cat-icon-item:hover {
  transform: translateY(-3px);
}

.cat-icon-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  border: 2px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  transition: all 0.22s ease;
}

.cat-icon-circle.cat-all {
  color: #475569;
}

.cat-icon-circle.cat-promo {
  color: #e11d48;
}

.cat-icon-circle.cat-new {
  color: #059669;
}

.cat-icon-circle.cat-metro {
  color: #2563eb;
}

.cat-icon-circle.cat-transit {
  color: #d97706;
}

.cat-icon-item:hover .cat-icon-circle {
  border-color: #cbd5e1;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.1);
}

.cat-icon-item.active .cat-icon-circle {
  background: var(--primary-gradient);
  border-color: var(--primary);
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
  transform: scale(1.05);
}

.cat-symbol {
  font-weight: 900;
  font-family: var(--font-display);
}

.cat-label {
  font-size: 0.84rem;
  font-weight: 600;
  color: #475569;
  transition: color 0.15s ease;
}

.cat-icon-item.active .cat-label {
  color: var(--primary);
  font-weight: 800;
}

.map-view-toggle-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

/* ============================================================== */
/* 12 MARKET CARDS GRID                                           */
/* ============================================================== */
.market-cards-3col-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.market-box-card {
  padding: 0;
  overflow: hidden;
  border-radius: var(--radius-2xl);
  border: 1px solid var(--border-card);
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.market-box-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 32px -4px rgba(15, 23, 42, 0.1), 0 4px 12px rgba(15, 23, 42, 0.04);
  border-color: #cbd5e1;
}

.market-img-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #f1f5f9;
}

.market-box-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.market-box-card:hover .market-box-img {
  transform: scale(1.06);
}

.market-img-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, transparent 40%, rgba(0, 0, 0, 0.4) 100%);
}

.market-avail-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.74rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
}

.badge-green {
  background: rgba(16, 185, 129, 0.92);
  color: #ffffff;
}

.badge-red {
  background: rgba(239, 68, 68, 0.92);
  color: #ffffff;
}

.badge-dot-live {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffffff;
  animation: pulse-dot 1.8s infinite;
}

.market-code-pill {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.68rem;
  font-weight: 800;
  color: #ffffff;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  letter-spacing: 0.05em;
}

.market-box-body {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.market-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.market-card-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
  line-height: 1.3;
  transition: color 0.15s ease;
}

.market-card-name:hover {
  color: var(--primary);
}

.market-tag-pill-blue {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
  white-space: nowrap;
}

.market-card-address {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #64748b;
  margin-bottom: 14px;
}

.pin-icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.market-occupancy-row {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 14px;
}

.occupancy-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  margin-bottom: 6px;
}

.occupancy-label {
  color: #64748b;
  font-weight: 600;
}

.occupancy-val {
  font-weight: 800;
}

.text-emerald {
  color: #059669;
}

.text-slate {
  color: #94a3b8;
}

.occupancy-progress-bar {
  width: 100%;
  height: 5px;
  background: #e2e8f0;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.occupancy-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

.market-price-tag {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 16px;
}

.price-prefix {
  font-size: 0.86rem;
  font-weight: 700;
  color: #64748b;
}

.price-number {
  font-size: 1.55rem;
  font-weight: 900;
  color: #1e3a8a;
  font-family: var(--font-display);
}

.price-suffix {
  font-size: 0.82rem;
  color: #94a3b8;
  font-weight: 600;
}

.market-card-actions {
  margin-top: auto;
}

.btn-book-stall {
  width: 100%;
  padding: 11px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.92rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-arrow-icon {
  transition: transform 0.2s ease;
}

.btn-book-stall:hover .btn-arrow-icon {
  transform: translateX(4px);
}

.empty-search-card {
  text-align: center;
  padding: 48px 24px;
  max-width: 500px;
  margin: 32px auto;
}

/* Responsive adjustments */
@media (max-width: 1100px) {
  .market-cards-3col-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .events-grid-layout {
    grid-template-columns: 1fr 1fr;
  }
  .events-center-col {
    display: none;
  }
}

@media (max-width: 768px) {
  .hero-banner-card {
    flex-direction: column;
  }
  .hero-left-media {
    min-height: 180px;
  }
  .hero-right-content {
    padding: 24px 20px;
  }
  .hero-main-heading {
    font-size: 1.75rem;
  }
  .events-grid-layout {
    grid-template-columns: 1fr;
  }
  .market-cards-3col-grid {
    grid-template-columns: 1fr;
  }
}
</style>
