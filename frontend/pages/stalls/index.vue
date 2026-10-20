<template>
  <div>
    <!-- Top Header -->
    <AppHeader />

    <div class="content-body" style="max-width: 1200px; margin: 0 auto; padding-bottom: 60px;">
      <!-- Breadcrumb Navigation at top of section body -->
      <AppBreadcrumb :current="currentMarket.name" backTo="/" />

      <!-- 1. Modern Glassmorphic Market Hero Header Card -->
      <div class="market-hero-card card glass-card" style="margin-bottom: 24px; position: relative; overflow: hidden; padding: 28px; border-radius: 18px; border: 1px solid #bfdbfe; background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 60%, #eff6ff 100%); box-shadow: 0 8px 24px rgba(37, 99, 235, 0.07);">
        <!-- Top Status Pill & Back Link -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.76rem; font-weight: 700; color: #1e40af; background: #dbeafe; padding: 3px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span>สำนักงานตลาด กทม.</span>
            </span>
            <span style="font-size: 0.74rem; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 3px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
              <span>เปิดให้บริการ</span>
            </span>
          </div>

          <NuxtLink to="/" style="font-size: 0.8rem; color: #64748b; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
            <span>&larr; ดูตลาดอื่น (12 ตลาด กทม.)</span>
          </NuxtLink>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 300px;">
            <h1 style="font-size: 2.1rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.02em;">
              {{ currentMarket.name }}
            </h1>
            <div v-if="currentMarket.name_en" style="font-size: 0.95rem; color: #64748b; font-weight: 600; margin-bottom: 14px;">
              {{ currentMarket.name_en }}
            </div>

            <!-- Operating Hours & District Info Pills -->
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 16px;">
              <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; color: #334155; background: #ffffff; padding: 6px 12px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{{ currentMarket.operating_hours || 'ทุกวัน 05:00 - 19:00 น.' }}</span>
              </span>

              <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; color: #334155; background: #ffffff; padding: 6px 12px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{{ currentMarket.district || 'กรุงเทพมหานคร' }}</span>
              </span>
            </div>

            <!-- Feature Tags (Pills) -->
            <div class="pill-tags-list" style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span v-for="(t, idx) in currentMarket.tags" :key="idx" class="pill-tag" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 20px; padding: 4px 12px; font-size: 0.8rem; font-weight: 600; color: #475569;">
                {{ t }}
              </span>
            </div>
          </div>

          <!-- Hero Right: Market Photo & Direct CTA -->
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px;">
            <div style="width: 220px; height: 130px; border-radius: 14px; overflow: hidden; position: relative; border: 2px solid #ffffff; box-shadow: 0 8px 20px rgba(0,0,0,0.08);">
              <img
                :src="currentMarket.image_url || '/images/market_hall_front.jpg'"
                :alt="currentMarket.name"
                style="width: 100%; height: 100%; object-fit: cover;"
              />
              <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px); color: #ffffff; padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">
                ว่าง {{ currentMarket.available_stalls || availableCount }} แผง
              </div>
            </div>

            <NuxtLink
              :to="`/stalls/book?market=${currentMarket.id || 1}`"
              class="btn btn-primary"
              style="padding: 10px 24px; font-size: 0.92rem; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 14px rgba(67, 97, 238, 0.35); display: inline-flex; align-items: center; gap: 6px;"
            >
              <span>จองแผงเช่าตลาดนี้</span>
              <span>&rarr;</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 2. Four Metric Stat Cards (Minimal, High Contrast, Scannable) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 24px;">
        <!-- Card 1: ค่าเช่าเริ่มต้น -->
        <div class="card glass-card" style="padding: 18px 20px; border-radius: 14px; border: 1px solid #e2e8f0; background: #ffffff; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
          <div>
            <div style="font-size: 0.76rem; color: #64748b; font-weight: 600;">ค่าเช่าเริ่มต้น</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #059669; margin-top: 1px;">
              ฿{{ (currentMarket.starting_price_monthly || 1800).toLocaleString() }} <span style="font-size: 0.72rem; font-weight: normal; color: #64748b;">/ด.</span>
            </div>
          </div>
        </div>

        <!-- Card 2: แผงว่างพร้อมจอง -->
        <div class="card glass-card" style="padding: 18px 20px; border-radius: 14px; border: 1px solid #e2e8f0; background: #ffffff; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div>
            <div style="font-size: 0.76rem; color: #64748b; font-weight: 600;">แผงว่างพร้อมจอง</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #2563eb; margin-top: 1px;">
              {{ currentMarket.available_stalls || availableCount }} <span style="font-size: 0.72rem; font-weight: normal; color: #64748b;">แผง</span>
            </div>
          </div>
        </div>

        <!-- Card 3: ขนาดแผงมาตรฐาน -->
        <div class="card glass-card" style="padding: 18px 20px; border-radius: 14px; border: 1px solid #e2e8f0; background: #ffffff; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <path d="M9 3v18"></path>
            </svg>
          </div>
          <div>
            <div style="font-size: 0.76rem; color: #64748b; font-weight: 600;">ขนาดพื้นที่มาตรฐาน</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-top: 1px;">
              5 - 25 <span style="font-size: 0.72rem; font-weight: normal; color: #64748b;">ตร.ม.</span>
            </div>
          </div>
        </div>

        <!-- Card 4: ที่จอดรถ -->
        <div class="card glass-card" style="padding: 18px 20px; border-radius: 14px; border: 1px solid #e2e8f0; background: #ffffff; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: #f1f5f9; color: #475569; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <circle cx="7" cy="15" r="2"></circle>
              <circle cx="17" cy="15" r="2"></circle>
            </svg>
          </div>
          <div>
            <div style="font-size: 0.76rem; color: #64748b; font-weight: 600;">ที่จอดรถ</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-top: 1px;">
              120+ <span style="font-size: 0.72rem; font-weight: normal; color: #64748b;">คัน</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Interactive Floorplan Feature Showcase Card -->
      <div class="card" style="margin-bottom: 24px; padding: 28px; border-radius: 18px; border: 1px solid #e2e8f0; background: #ffffff;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
              ผังจำลองและตำแหน่งแผงค้า (Digital Floorplan)
            </h2>
            <div style="font-size: 0.84rem; color: #64748b;">
              คลิกเพื่อดูผังแผงค้าแบบโต้ตอบ เลือกล็อค ดูภาพจำลอง 3 มิติ และจองคิวออนไลน์ได้ทันที
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge" style="background: #ecfdf5; color: #059669; font-weight: 700; font-size: 0.75rem; padding: 4px 10px;">🟢 แผงว่าง</span>
            <span class="badge" style="background: #fffbeb; color: #d97706; font-weight: 700; font-size: 0.75rem; padding: 4px 10px;">🟡 ติดจอง</span>
            <span class="badge" style="background: #f1f5f9; color: #64748b; font-weight: 700; font-size: 0.75rem; padding: 4px 10px;">⚪ กำลังใช้งาน</span>
          </div>
        </div>

        <!-- Floorplan Preview Graphic Container with Interactive Link -->
        <NuxtLink
          :to="`/stalls/book?market=${currentMarket.id || 1}`"
          style="display: block; position: relative; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 18px rgba(0,0,0,0.04); text-decoration: none; max-height: 400px;"
          class="floorplan-showcase-link"
        >
          <img
            src="/images/chatuchak_isometric_plan.jpg"
            alt="ผังจำลองตลาด"
            style="width: 100%; height: 380px; object-fit: cover; object-position: center; display: block; filter: contrast(1.05);"
          />
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.25) 50%, rgba(15, 23, 42, 0.05) 100%); display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding: 32px 20px; text-align: center;">
            <div style="background: #ffffff; color: #1e40af; font-weight: 800; font-size: 1.05rem; padding: 12px 30px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s ease;">
              <span>เข้าสู่ผังดิจิทัลเพื่อคลิกเลือกแผงค้า</span>
              <span>&rarr;</span>
            </div>
            <div style="color: #f8fafc; font-size: 0.82rem; margin-top: 10px; font-weight: 500;">
              รองรับการซูม ขยาย ดูทราฟฟิกคนเดิน และตรวจสอบคิวสำรองแบบเรียลไทม์
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- 4. Two-Column Info & Location Section (Clean, Non-bloated) -->
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin-bottom: 24px;">
        <!-- Left: รายละเอียดและข้อมูลการเดินทาง -->
        <div class="card" style="padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; background: #ffffff;">
          <h3 style="font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
            เกี่ยวกับ{{ currentMarket.name }}
          </h3>
          <p style="font-size: 0.88rem; color: #475569; line-height: 1.65; margin-bottom: 18px;">
            {{ currentMarket.description || 'ตลาดมาตรฐานภายใต้การกำกับดูแลของสำนักงานตลาดกรุงเทพมหานคร ได้รับการรับรองด้านสุขอนามัย ความปลอดภัย และการจัดระเบียบแผงค้าที่เป็นธรรม' }}
          </p>

          <h3 style="font-size: 0.92rem; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
            ที่ตั้ง
          </h3>
          <p style="font-size: 0.84rem; color: #64748b; margin-bottom: 18px; display: flex; align-items: center; gap: 6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>{{ currentMarket.address || 'ถนนเทศบาลสงเคราะห์ แขวงลาดยาว เขตจตุจักร กรุงเทพฯ' }}</span>
          </p>

          <h3 style="font-size: 0.92rem; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
            สายการเดินทาง
          </h3>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span class="badge" style="background: #f1f5f9; color: #334155; padding: 5px 12px; font-size: 0.78rem; font-weight: 600;">รถเมล์ประจำทาง</span>
            <span class="badge" style="background: #f1f5f9; color: #334155; padding: 5px 12px; font-size: 0.78rem; font-weight: 600;">รถไฟฟ้า BTS/MRT</span>
            <span class="badge" style="background: #f1f5f9; color: #334155; padding: 5px 12px; font-size: 0.78rem; font-weight: 600;">รถยนต์ส่วนบุคคล</span>
          </div>
        </div>

        <!-- Right: แผนที่พิกัด GIS (Leaflet Map) -->
        <div class="card" style="padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; background: #ffffff; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 1rem; font-weight: 700; color: #0f172a;">
              แผนที่พิกัดตลาด (GIS Map)
            </h3>
            <a
              :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentMarket.name + ' ' + (currentMarket.district || 'กรุงเทพ'))}`"
              target="_blank"
              style="font-size: 0.78rem; color: #2563eb; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;"
            >
              <span>เปิด Google Maps</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>

          <div style="flex: 1; min-height: 220px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; position: relative;">
            <div id="market-overview-map" style="width: 100%; height: 100%; min-height: 220px;"></div>
          </div>
        </div>
      </div>
    </div>
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
let map: any = null

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

  // Initialize Leaflet Map for Market Location
  if (process.client) {
    const L = await import('leaflet')
    const targetCoord: [number, number] = [currentMarket.value.lat || 13.7998, currentMarket.value.lng || 100.5501]

    map = L.map('market-overview-map', {
      center: targetCoord,
      zoom: 14,
      zoomControl: true
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map)

    // Pin Marker with popup
    const marker = L.marker(targetCoord).addTo(map)
    marker.bindPopup(`
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        <strong style="color: #0f172a; font-size: 0.95rem;">${currentMarket.value.name}</strong>
      </div>
      <span style="font-size: 0.8rem; color: #64748b;">${currentMarket.value.address}</span><br/>
      <a href="/stalls/book?market=${currentMarket.value.id}" style="display: inline-block; margin-top: 6px; color: #4361ee; font-weight: 700; font-size: 0.82rem;">จองแผงเช่า &rarr;</a>
    `).openPopup()
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped>
.floorplan-showcase-link:hover img {
  transform: scale(1.02);
  transition: transform 0.3s ease;
}
</style>
