<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content" style="max-width: 600px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700;">
              {{ isQueueMode ? 'ต่อคิวแผงติดจอง (Queue Waiting List)' : 'จองนัดหมายดูแผงเช่า (Book Stall Visit)' }}
            </h3>
            <div style="font-size: 0.8rem; color: var(--primary);">แผงเลขที่: {{ stall?.stall_number }} (โซน {{ stall?.zone_code || stall?.zone?.code || 'ทั่วไป' }})</div>
          </div>
        </div>
        <button class="btn-logout" @click="$emit('close')" aria-label="ปิด">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Success State -->
      <div v-if="isSuccess" class="modal-body" style="text-align: center; padding: 40px 20px;">
        <div style="margin-bottom: 16px; color: var(--status-avail-text); display: flex; justify-content: center;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        <h4 style="font-size: 1.25rem; font-weight: 700; color: #059669; margin-bottom: 8px;">
          {{ isQueueMode ? 'คุณเข้าสู่ลำดับคิวเรียบร้อยแล้ว!' : 'ส่งคำขอจองดูแผงเรียบร้อยแล้ว!' }}
        </h4>
        <div style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; max-width: 440px; margin: 0 auto 24px;">
          เลขที่คำขอจอง: <strong style="color: #0f172a;">{{ successBookingNumber }}</strong><br/>
          <template v-if="isQueueMode">
            สถานะของคุณ: <strong style="color: #d97706;">รอคิว (Waiting List)</strong><br/>
            เมื่อผู้ถือแผงคนก่อนหน้าสละสิทธิ์หรือหมดเวลา ระบบจะเลื่อนคิวของคุณขึ้นมาถือแผงและส่งการแจ้งเตือนให้เลือกวันนัดชมทันที
          </template>
          <template v-else>
            ขั้นตอนถัดไป: <strong>เจ้าหน้าที่ตลาดจะตรวจสอบและอนุมัติวันเวลานัดหมายเข้าชม</strong> จากนั้นคุณสามารถเข้าดูแผงหน้างาน และกดยืนยันความสนใจในระบบได้ทันที
          </template>
        </div>
        <div style="display: flex; justify-content: center; gap: 12px;">
          <NuxtLink to="/bookings" class="btn btn-primary" @click="$emit('close')">
            ดูรายการการจองของฉัน
          </NuxtLink>
          <button class="btn btn-secondary" @click="$emit('close')">ปิดหน้าต่าง</button>
        </div>
      </div>

      <!-- Form State -->
      <form v-else @submit.prevent="handleSubmit">
        <div class="modal-body">
          <!-- Queue Mode Notice -->
          <div v-if="isQueueMode" style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
            <div style="color: #d97706; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>
            </div>
            <div style="font-size: 0.85rem; color: #92400e;">
              <strong>แผงนี้มีผู้จองถือสิทธิ์อยู่:</strong> ท่านกำลังทำรายการ <strong>"ต่อคิว"</strong> (จะได้คิวถัดไปอัตโนมัติ โดยไม่ต้องเลือกวันนัดหมายในขั้นตอนนี้)
            </div>
          </div>

          <!-- Stall Summary Info Banner -->
          <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid #a7f3d0; padding: 14px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="font-weight: 700; font-size: 1rem; color: #0f172a;">แผง {{ stall?.stall_number }} - {{ stall?.category || stall?.category_name || 'ทั่วไป' }}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                ขนาด: {{ stall?.size_width || 2 }} × {{ stall?.size_length || 2 }} ม. ({{ stall?.area_sqm || 4 }} ตร.ม.)
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.15rem; font-weight: 800; color: #059669;">฿{{ Number(stall?.monthly_rate || 2500).toLocaleString() }}</div>
              <div style="font-size: 0.72rem; color: var(--text-dim);">บาท / เดือน (รายวัน: ฿{{ stall?.daily_rate || 100 }})</div>
            </div>
          </div>

          <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
            1. ข้อมูลผู้ประสงค์เข้าดูแผง
          </h4>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="b_name">ชื่อ-นามสกุล *</label>
              <input id="b_name" v-model="form.tenant_name" type="text" required placeholder="เช่น นายสมเกียรติ มั่นคง" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label" for="b_phone">เบอร์โทรศัพท์ติดต่อ *</label>
              <input id="b_phone" v-model="form.tenant_phone" type="tel" required placeholder="08x-xxx-xxxx" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="b_email">อีเมล</label>
              <input id="b_email" v-model="form.tenant_email" type="email" placeholder="name@example.com" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label" for="b_id_card">เลขประจำตัวประชาชน (ถ้ามี)</label>
              <input id="b_id_card" v-model="form.tenant_id_card" type="text" placeholder="13 หลัก" class="form-input" />
            </div>
          </div>

          <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin: 16px 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">
            {{ isQueueMode ? '2. สินค้าที่ต้องการขาย' : '2. ข้อมูลนัดหมายและสินค้าที่ต้องการขาย' }}
          </h4>

          <!-- Only show date/time selection if NOT queue mode (Page 2 Rule) -->
          <div v-if="!isQueueMode" class="form-row">
            <div class="form-group">
              <label class="form-label" for="b_date">วันที่ต้องการเข้าชมแผง *</label>
              <input id="b_date" v-model="form.visit_date" type="date" :min="minDate" required class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label" for="b_time">ช่วงเวลาที่สะดวก *</label>
              <select id="b_time" v-model="form.visit_time_slot" class="form-select">
                <option value="09:00 - 10:30">ช่วงเช้า (09:00 - 10:30 น.)</option>
                <option value="10:30 - 12:00">ช่วงสาย (10:30 - 12:00 น.)</option>
                <option value="13:30 - 15:00">ช่วงบ่าย (13:30 - 15:00 น.)</option>
                <option value="15:00 - 16:30">ช่วงบ่ายแก่ (15:00 - 16:30 น.)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="b_business">ประเภทสินค้า / ร้านค้าที่ตั้งใจจะขาย</label>
            <input id="b_business" v-model="form.intended_business" type="text" placeholder="เช่น ร้านก๋วยเตี๋ยวเรือ, เสื้อผ้าแฟชั่นเกาหลี" class="form-input" />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">ยกเลิก</button>
          <button type="submit" class="btn" :class="isQueueMode ? 'btn-primary' : 'btn-success'" :disabled="submitting">
            <span v-if="submitting">กำลังส่งคำขอ...</span>
            <span v-else-if="isQueueMode">ยืนยันการต่อคิวแผงนี้</span>
            <span v-else>ยืนยันการจองดูแผง</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  stall: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const { post } = useApi()
const { user } = useAuth()
const { showError, showWarning } = useAppAlert()

const submitting = ref(false)
const isSuccess = ref(false)
const successBookingNumber = ref('')

const isQueueMode = computed(() => {
  return props.stall?.status === 'reserved' || props.stall?.status === 'occupied' || Boolean(props.stall?.is_queue)
})

const minDate = new Date().toISOString().slice(0, 10)

const form = ref({
  tenant_name: 'คุณสมศักดิ์ ค้าขายดี',
  tenant_phone: '081-999-8877',
  tenant_email: 'somsak@example.com',
  tenant_id_card: '1-1004-88991-23-4',
  visit_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // tomorrow
  visit_time_slot: '10:30 - 12:00',
  intended_business: ''
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    isSuccess.value = false
    const cleanedName = String(user.value?.full_name || 'คุณสมชาย ใจดี').replace(/\([^)]*\)/g, '').trim()
    form.value.tenant_name = cleanedName || 'คุณสมชาย ใจดี'
    form.value.tenant_email = user.value?.email || 'somchai@example.com'
    form.value.intended_business = props.stall?.category || props.stall?.category_name || ''
  }
})

const handleSubmit = async () => {
  if (!props.stall) return
  submitting.value = true

  try {
    const res = await post('/bookings', {
      stall_id: props.stall.id,
      stall_number: props.stall.stall_number,
      market_name: props.stall.market_name,
      tenant_name: form.value.tenant_name,
      tenant_phone: form.value.tenant_phone,
      tenant_email: form.value.tenant_email,
      tenant_id_card: form.value.tenant_id_card,
      visit_date: isQueueMode.value ? undefined : form.value.visit_date,
      visit_time_slot: isQueueMode.value ? undefined : form.value.visit_time_slot,
      intended_business: form.value.intended_business,
      is_queue: isQueueMode.value
    })

    successBookingNumber.value = res.booking_number
    isSuccess.value = true
    emit('success')
  } catch (err: any) {
    if (err?.status === 409 || err?.statusCode === 409 || err?.data?.code === 409) {
      await showWarning(err?.data?.detail || 'คุณได้ทำการจองแผงนี้ไว้แล้ว ไม่สามารถจองซ้ำได้', 'ไม่สามารถจองแผงซ้ำได้')
    } else {
      await showError(err?.data?.detail || 'เกิดข้อผิดพลาดในการส่งคำขอจอง', 'ส่งคำขอไม่สำเร็จ')
    }
  } finally {
    submitting.value = false
  }
}
</script>
