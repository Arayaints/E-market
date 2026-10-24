<template>
  <div>
    <AppHeader />
    <main class="content-body market-edit-page">
      <AppBreadcrumb
        :market="originalMarket.name"
        :marketId="originalMarket.id || marketKey"
        current="แก้ไขข้อมูลตลาด"
        :backTo="detailLink"
      />

      <div class="edit-title-row">
        <div><span class="eyebrow">MARKET PROFILE</span><h1>แก้ไขข้อมูลตลาด</h1><p>ข้อมูลที่บันทึกจะนำไปแสดงในหน้ารายละเอียดตลาด</p></div>
        <span v-if="lastUpdated" class="saved-state">บันทึกล่าสุด {{ formatUpdatedAt(lastUpdated) }}</span>
      </div>

      <form v-if="!loading" class="edit-form" @submit.prevent="saveMarket">
        <section class="form-card">
          <div class="section-heading"><div class="section-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h2m2 0h2m-6 4h2m2 0h2m-6 4h2m2 0h2" /></svg></div><div><h2>ข้อมูลตลาด</h2><p>ชื่อ ที่ตั้ง เวลาเปิดทำการ และข้อมูลสรุปบนหน้า Detail</p></div></div>
          <div class="form-grid three-cols">
            <label><span>ชื่อตลาด <b>*</b></span><input v-model.trim="form.name" required placeholder="กรอกชื่อตลาด" /></label>
            <label><span>เขต <b>*</b></span><input v-model.trim="form.district" required placeholder="เช่น เขตจตุจักร" /></label>
            <label><span>วันที่เปิด–ปิด <b>*</b></span><AppSelect v-model="form.operating_days" :options="dayOptions" /></label>
            <label><span>เวลาเปิด <b>*</b></span><input v-model="form.open_time" required type="time" /></label>
            <label><span>เวลาปิด <b>*</b></span><input v-model="form.close_time" required type="time" /></label>
            <label class="span-2"><span>ที่อยู่ <b>*</b></span><input v-model.trim="form.address" required placeholder="กรอกที่อยู่ตลาด" /></label>
            <label class="span-3"><span>รายละเอียดตลาด <b>*</b></span><textarea v-model.trim="form.description" required rows="4" placeholder="กรอกรายละเอียดตลาด"></textarea></label>
            <label class="span-2"><span>จุดเด่นของตลาด</span><input v-model.trim="form.tags_text" placeholder="คั่นแต่ละรายการด้วยเครื่องหมายจุลภาค" /><small>เช่น ใกล้รถไฟฟ้า, มีที่จอดรถ, อาหารและเครื่องดื่ม</small></label>
            <label><span>การเดินทาง</span><input v-model.trim="form.travel_text" placeholder="คั่นแต่ละรายการด้วยเครื่องหมายจุลภาค" /></label>
            <label><span>ละติจูด <b>*</b></span><input v-model.number="form.lat" required step="any" type="number" /></label>
            <label><span>ลองจิจูด <b>*</b></span><input v-model.number="form.lng" required step="any" type="number" /></label>
          </div>
        </section>

        <section class="form-card">
          <div class="section-heading"><div class="section-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3zM3 9h18M9 21V9" /></svg></div><div><h2>พื้นที่และราคา</h2><p>ข้อมูลสถิติที่แสดงใต้ภาพผังตลาด</p></div></div>
          <div class="form-grid four-cols">
            <label><span>ค่าเช่าเริ่มต้น/เดือน <b>*</b></span><input v-model.number="form.starting_price_monthly" required min="0" type="number" /></label>
            <label><span>ค่าเช่าสูงสุด/เดือน</span><input v-model.number="form.max_price_monthly" min="0" type="number" /></label>
            <label><span>พื้นที่ต่ำสุด (ตร.ม.)</span><input v-model.number="form.min_area_sqm" min="0" step="0.1" type="number" /></label>
            <label><span>พื้นที่สูงสุด (ตร.ม.)</span><input v-model.number="form.max_area_sqm" min="0" step="0.1" type="number" /></label>
            <label><span>จำนวนแผงทั้งหมด</span><input v-model.number="form.total_stalls" min="0" type="number" /></label>
            <label><span>พื้นที่ว่าง</span><input :value="form.available_stalls" disabled type="number" /><small>คำนวณจากสถานะแผงในระบบ</small></label>
            <label><span>จำนวนที่จอดรถ (คัน)</span><input v-model.number="form.parking_spaces" min="0" type="number" /></label>
          </div>
        </section>

        <section class="form-card">
          <div class="section-heading"><div class="section-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div><div><h2>รูปภาพและวิดีโอของตลาด</h2><p>ใช้ URL รูปจากระบบหรืออัปโหลดไฟล์ใหม่</p></div></div>
          <div class="media-grid">
            <MediaField title="รูปภาพแผนผังตลาด" hint="JPG, JPEG, PNG" :preview="form.floorplan_image_url" @file="file => setImage('floorplan_image_url', file)" />
            <MediaField title="รูปภาพตลาด" hint="รูปหลักที่แสดงในหน้ารายละเอียด" :preview="form.image_url" @file="file => setImage('image_url', file)" />
          </div>
          <div class="form-grid two-cols media-links">
            <label><span>URL รูปภาพแผนผัง</span><input v-model.trim="form.floorplan_image_url" placeholder="/images/market-plan.jpg" /></label>
            <label><span>URL รูปภาพตลาด</span><input v-model.trim="form.image_url" placeholder="/images/market.jpg" /></label>
            <label class="span-2"><span>วิดีโอแนะนำตลาด</span><div class="input-with-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" /></svg><input v-model.trim="form.video_url" placeholder="กรอกลิงก์วิดีโอแนะนำตลาด" /></div></label>
          </div>
        </section>

        <div class="form-actions"><NuxtLink :to="detailLink" class="cancel-button">ยกเลิก</NuxtLink><button class="save-button" :disabled="saving" type="submit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>{{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}</button></div>
      </form>
      <div v-else class="loading-card">กำลังโหลดข้อมูลตลาด...</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSelect from '~/components/AppSelect.vue'
import MediaField from '~/components/market/MediaField.vue'
import { getMarketGisConfig } from '~/core/modules/stall/data/markets_registry'

const route = useRoute()
const router = useRouter()
const { get } = useApi()
const { showSuccess, showError } = useAppAlert()
const { applyMarketOverride, saveMarketOverride } = useMarketOverrides()
const loading = ref(true)
const saving = ref(false)
const marketKey = computed(() => String(route.params.id || route.query.market || '1'))
const buildInitialMarket = (key: string) => {
  const cfg = getMarketGisConfig(key)
  return applyMarketOverride({
    id: cfg.id,
    slug: cfg.slug,
    name: cfg.name,
    district: cfg.district,
    description: cfg.description,
    lat: cfg.center[1],
    lng: cfg.center[0]
  })
}
const originalMarket = ref<any>(buildInitialMarket(marketKey.value))
const lastUpdated = ref('')
const detailLink = computed(() => `/stalls?market=${originalMarket.value.id || marketKey.value}`)
const dayOptions = ['ทุกวัน', 'จันทร์ - ศุกร์', 'เสาร์ - อาทิตย์', 'อังคาร - อาทิตย์'].map(value => ({ value, label: value }))
const form = reactive<any>({})

const splitOperatingHours = (value = '') => {
  const match = value.match(/^(.*?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
  return { days: match?.[1]?.trim() || 'ทุกวัน', open: match?.[2] || '05:00', close: match?.[3] || '19:00' }
}
const assignForm = (market: any) => {
  const hours = splitOperatingHours(market.operating_hours)
  Object.assign(form, market, { operating_days: hours.days, open_time: hours.open, close_time: hours.close, tags_text: (market.tags || []).join(', '), travel_text: (market.travel_options || ['รถโดยสารประจำทาง', 'รถรับจ้างสาธารณะ', 'รถยนต์ส่วนบุคคล', 'รถไฟฟ้า BTS และ MRT']).join(', '), max_price_monthly: market.max_price_monthly || Math.round(Number(market.starting_price_monthly || 1800) * 2.5), min_area_sqm: market.min_area_sqm || 4, max_area_sqm: market.max_area_sqm || 25, parking_spaces: market.parking_spaces || 120, floorplan_image_url: market.floorplan_image_url || '/images/chatuchak_isometric_plan.jpg', video_url: market.video_url || '' })
  lastUpdated.value = market.updated_at || ''
}
const setImage = (field: 'image_url' | 'floorplan_image_url', file: File) => {
  if (!file.type.startsWith('image/')) return showError('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
  if (file.size > 1024 * 1024) return showError('ไฟล์รูปต้องมีขนาดไม่เกิน 1 MB')
  const reader = new FileReader()
  reader.onload = () => { form[field] = String(reader.result || '') }
  reader.readAsDataURL(file)
}
const saveMarket = async () => {
  saving.value = true
  try {
    const payload = { ...originalMarket.value, ...form, operating_hours: `${form.operating_days} ${form.open_time} - ${form.close_time} น.`, tags: String(form.tags_text || '').split(',').map((item: string) => item.trim()).filter(Boolean), travel_options: String(form.travel_text || '').split(',').map((item: string) => item.trim()).filter(Boolean) }
    delete payload.tags_text; delete payload.travel_text; delete payload.operating_days; delete payload.open_time; delete payload.close_time
    saveMarketOverride(payload)
    await showSuccess('ข้อมูลใหม่จะแสดงในหน้ารายละเอียดตลาดทันที', 'บันทึกข้อมูลตลาดสำเร็จ')
    await router.push(detailLink.value)
  } catch {
    showError('ไม่สามารถบันทึกข้อมูลตลาดได้ กรุณาลองใหม่อีกครั้ง')
  } finally { saving.value = false }
}
const formatUpdatedAt = (value: string) => new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
onMounted(async () => {
  try { const market = await get(`/markets/${marketKey.value}`); originalMarket.value = applyMarketOverride(market); assignForm(originalMarket.value) }
  catch { showError('ไม่สามารถโหลดข้อมูลตลาดได้') }
  finally { loading.value = false }
})
</script>

<style scoped>
.market-edit-page{padding-bottom:48px}.edit-breadcrumb{display:flex;align-items:center;gap:10px;color:#94a3b8;font-size:.82rem;margin-bottom:24px}.back-button{width:38px;height:38px;display:grid;place-items:center;border:1px solid #e2e8f0;border-radius:9px;color:#475569;margin-right:8px}.back-button svg{width:18px}.crumb-link{color:#64748b}.edit-breadcrumb strong{color:#334155}.edit-title-row{display:flex;justify-content:space-between;align-items:end;margin-bottom:20px}.eyebrow{font-size:.72rem;letter-spacing:.08em;color:#2563eb;font-weight:800}.edit-title-row h1{font-size:1.55rem;color:#1e293b;margin:4px 0}.edit-title-row p{color:#64748b;margin:0;font-size:.86rem}.saved-state{font-size:.78rem;color:#15803d;background:#ecfdf5;padding:7px 11px;border-radius:999px}.edit-form{display:grid;gap:20px}.form-card,.loading-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:26px 30px;box-shadow:0 1px 3px rgba(15,23,42,.03)}.section-heading{display:flex;align-items:center;gap:12px;padding-bottom:18px;margin-bottom:22px;border-bottom:1px solid #eef2f6}.section-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#eff6ff;color:#2563eb}.section-icon svg{width:19px}.section-heading h2{font-size:1.05rem;color:#1e293b;margin:0}.section-heading p{margin:3px 0 0;color:#64748b;font-size:.78rem}.form-grid{display:grid;gap:18px 22px}.three-cols{grid-template-columns:repeat(3,minmax(0,1fr))}.four-cols{grid-template-columns:repeat(4,minmax(0,1fr))}.two-cols{grid-template-columns:repeat(2,minmax(0,1fr))}.form-grid label{display:flex;flex-direction:column;gap:7px;color:#475569;font-size:.82rem;font-weight:600}.form-grid b{color:#ef4444}.form-grid input,.form-grid textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#1e293b;padding:11px 13px;font:inherit;font-weight:500;outline:none}.form-grid input:focus,.form-grid textarea:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(37,99,235,.1)}.form-grid input:disabled{background:#f1f5f9;color:#94a3b8}.form-grid small{font-weight:400;color:#94a3b8}.span-2{grid-column:span 2}.span-3{grid-column:span 3}.media-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.media-links{margin-top:22px}.input-with-icon{position:relative}.input-with-icon svg{position:absolute;right:13px;top:50%;transform:translateY(-50%);width:18px;color:#64748b}.input-with-icon input{padding-right:42px}.form-actions{display:flex;justify-content:flex-end;gap:12px}.cancel-button,.save-button{min-width:120px;padding:11px 20px;border-radius:9px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:8px}.cancel-button{border:1px solid #cbd5e1;color:#475569;background:#fff}.save-button{border:1px solid #2563eb;background:#2563eb;color:#fff;box-shadow:0 4px 12px rgba(37,99,235,.22);cursor:pointer}.save-button svg{width:17px}.loading-card{text-align:center;color:#64748b}@media(max-width:960px){.three-cols,.four-cols{grid-template-columns:repeat(2,minmax(0,1fr))}.span-3{grid-column:span 2}}@media(max-width:640px){.three-cols,.four-cols,.two-cols,.media-grid{grid-template-columns:1fr}.span-2,.span-3{grid-column:auto}.edit-title-row{align-items:flex-start;flex-direction:column;gap:12px}.form-card{padding:20px}.form-actions>*{flex:1}}
</style>
