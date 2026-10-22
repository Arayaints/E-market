<template>
  <div>
    <AppHeader />
    <main class="content-body manage-page">
      <AppBreadcrumb :market="marketName" :marketId="marketId" current="จัดการแผงเช่า" :backTo="'/'" />

      <section class="manage-header">
        <div>
          <span class="eyebrow">พื้นที่เจ้าหน้าที่</span>
          <h1>จัดการแผงเช่า {{ marketName }}</h1>
          <p>ดูผัง GIS, เพิ่มแผงเช่า และกำหนดรอบเวลาที่ผู้เช่าสามารถนัดเข้าชมได้</p>
        </div>
        <button class="primary-action" type="button" @click="showAddStall = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          เพิ่มแผงเช่า
        </button>
      </section>

      <section class="stats-grid" aria-label="สรุปการจัดการตลาด">
        <article><span>แผงทั้งหมด</span><strong>{{ stalls.length }}</strong></article>
        <article><span>แผงว่าง</span><strong class="green">{{ availableStalls }}</strong></article>
      </section>

      <section class="panel gis-panel">
        <div class="panel-heading">
          <div><h2>ผังแผงเช่า GIS</h2><p>เลือกโครงการบนแผนที่เพื่อตรวจสอบตำแหน่งและจำนวนแผงว่าง</p></div>
          <NuxtLink :to="`/bookings?market=${marketId}`" class="outline-action">จัดการนัดหมายผู้เช่า</NuxtLink>
        </div>
        <MarketProjectsOverviewMap
          :marketId="marketId"
          :selectedProjectId="selectedProject?.id"
          :selectedStallCodes="[]"
          :onlyAvailable="false"
          :categoryFilter="null"
          mapStyle="standard"
          @selectProject="selectProject"
        />
        <div v-if="selectedProject" class="selected-project">
          <strong>{{ selectedProject.name }}</strong><span>ว่าง {{ selectedProject.stallsAvailable }} / {{ selectedProject.totalStalls }} แผง</span>
        </div>
      </section>

    </main>

    <Teleport to="body"><div v-if="showAddStall" class="modal-backdrop" @click.self="showAddStall = false"><form class="add-stall-modal" @submit.prevent="createStall">
      <header><div><h2>เพิ่มแผงเช่าใหม่</h2><p>ระบุข้อมูลเพื่อเพิ่มลงในระบบแผงของตลาด</p></div><button type="button" class="icon-button" @click="showAddStall = false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18" /></svg></button></header>
      <div class="form-grid"><label>รหัสแผง<input v-model.trim="stallForm.ident" required placeholder="เช่น A-101" /></label><label>ชื่อแผง<input v-model.trim="stallForm.name" placeholder="ชื่อเรียกแผง" /></label><label>โซน<AppSelect v-model="stallForm.zone_id" :options="zoneOptions" /></label><label>ชั้น<input v-model.trim="stallForm.floor" placeholder="เช่น ชั้น 1" /></label><label>กว้าง (เมตร)<input v-model.number="stallForm.width" required min="0.1" type="number" step="0.1" /></label><label>ลึก (เมตร)<input v-model.number="stallForm.depth" required min="0.1" type="number" step="0.1" /></label><label>ค่าเช่ารายวัน<input v-model.number="stallForm.daily_rent" min="0" type="number" /></label><label>ค่าเช่ารายเดือน<input v-model.number="stallForm.monthly_rent" min="0" type="number" /></label></div>
      <footer><button type="button" class="cancel-button" @click="showAddStall = false">ยกเลิก</button><button class="primary-action" :disabled="saving" type="submit">{{ saving ? 'กำลังบันทึก...' : 'บันทึกแผงเช่า' }}</button></footer>
    </form></div></Teleport>
  </div>
</template>

<script setup lang="ts">
import AppSelect from '~/components/AppSelect.vue'

const route = useRoute()
const { get, post } = useApi()
const { showSuccess, showError } = useAppAlert()
const marketId = computed(() => String(route.query.market || '1'))
const marketName = ref('ตลาดนัดจตุจักร')
const stalls = ref<any[]>([])
const selectedProject = ref<any>(null)
const showAddStall = ref(false)
const saving = ref(false)
const zoneOptions = [{ value: 1, label: 'โซน A' }, { value: 2, label: 'โซน B' }, { value: 3, label: 'โซน C' }, { value: 4, label: 'โซน D' }]
const emptyForm = () => ({ ident: '', name: '', zone_id: 1, floor: 'ชั้น 1', width: 2, depth: 2, daily_rent: 0, monthly_rent: 0 })
const stallForm = ref(emptyForm())
const availableStalls = computed(() => stalls.value.filter(stall => stall.status === 'available').length)
const selectProject = (project: any) => { selectedProject.value = project }
const createStall = async () => { saving.value = true; try { await post('/stalls', stallForm.value); await loadData(); showAddStall.value = false; stallForm.value = emptyForm(); showSuccess('แผงใหม่ถูกเพิ่มเข้าสู่ระบบแล้ว', 'เพิ่มแผงเช่าสำเร็จ') } catch (error) { showError('กรุณาตรวจสอบข้อมูลและสิทธิ์ของบัญชีเจ้าหน้าที่', 'ไม่สามารถเพิ่มแผงเช่าได้') } finally { saving.value = false } }
const loadData = async () => { try { const [markets, stallData] = await Promise.all([get('/markets'), get('/stalls')]); const market = (markets || []).find((item: any) => String(item.id) === marketId.value || item.slug === marketId.value); if (market) marketName.value = market.name; stalls.value = (stallData || []).filter((stall: any) => !stall.market_id || String(stall.market_id) === String(market?.id)) } catch { stalls.value = [] } }
onMounted(loadData)
</script>

<style scoped>
.manage-page{padding-bottom:48px}.manage-header,.panel,.stats-grid article{background:#fff;border:1px solid #e8eef5;border-radius:16px;box-shadow:0 1px 3px rgba(15,23,42,.03)}.manage-header{margin:18px 0 20px;padding:26px 28px;display:flex;justify-content:space-between;align-items:center;gap:20px;background:linear-gradient(135deg,#eff6ff,#fff)}.eyebrow{color:#2563eb;font-size:.78rem;font-weight:800}.manage-header h1{margin:4px 0;color:#0f172a;font-size:1.55rem}.manage-header p,.panel-heading p{margin:0;color:#64748b;font-size:.88rem}.primary-action,.outline-action,.cancel-button{border-radius:9px;padding:10px 15px;font-weight:700;font-size:.88rem;cursor:pointer;display:inline-flex;gap:7px;align-items:center;justify-content:center}.primary-action{background:#2563eb;color:#fff;border:1px solid #2563eb;box-shadow:0 3px 8px rgba(37,99,235,.2)}.primary-action svg{width:17px;height:17px}.outline-action,.cancel-button{background:#fff;border:1px solid #cbd5e1;color:#334155}.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px}.stats-grid article{padding:18px 20px;display:flex;flex-direction:column;gap:5px;color:#64748b;font-size:.84rem}.stats-grid strong{font-size:1.55rem;color:#1e293b}.green{color:#15803d!important}.blue{color:#2563eb!important}.panel{padding:24px;margin-bottom:20px}.panel-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:15px;margin-bottom:18px}.panel-heading h2{font-size:1.08rem;color:#1e293b;margin:0 0 4px}.selected-project{padding:12px 15px;background:#eff6ff;border-radius:10px;color:#1e40af;display:flex;justify-content:space-between;margin-top:14px}.slot-list{display:grid;gap:9px}.slot-row{display:grid;grid-template-columns:20px 180px 1fr 34px;align-items:center;gap:12px;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;color:#475569;font-size:.88rem}.time-input,input{border:1px solid #cbd5e1;border-radius:8px;padding:9px 10px;color:#1e293b;background:#fff}.icon-button{border:0;background:transparent;color:#64748b;padding:6px;cursor:pointer}.icon-button svg{width:18px;height:18px}.save-button{margin-top:16px}.modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.48);z-index:90;display:grid;place-items:center;padding:20px}.add-stall-modal{width:min(650px,100%);background:#fff;border-radius:16px;padding:24px;box-shadow:0 20px 45px rgba(15,23,42,.25)}.add-stall-modal header,.add-stall-modal footer{display:flex;justify-content:space-between;align-items:center;gap:12px}.add-stall-modal h2{margin:0;color:#1e293b;font-size:1.2rem}.add-stall-modal p{margin:4px 0 0;color:#64748b;font-size:.84rem}.form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:22px 0}.form-grid label{display:grid;gap:6px;color:#475569;font-size:.82rem;font-weight:700}.add-stall-modal footer{justify-content:flex-end}@media(max-width:700px){.manage-header,.panel-heading{align-items:flex-start;flex-direction:column}.stats-grid,.form-grid{grid-template-columns:1fr}.slot-row{grid-template-columns:20px 1fr 34px}.slot-row span{display:none}}
</style>
