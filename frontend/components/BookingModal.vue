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
            <h3 style="font-size: 1.15rem; font-weight: 700;">จองนัดหมายดูแผงเช่า (Book Stall Visit)</h3>
            <div style="font-size: 0.8rem; color: var(--primary);">แผงเลขที่: {{ stall?.stall_number }} (โซน {{ stall?.zone_code || stall?.zone?.code }})</div>
          </div>
        </div>
        <button class="btn-logout" @click="$emit('close')">✕</button>
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
        <h4 style="font-size: 1.25rem; font-weight: 700; color: var(--status-avail-text); margin-bottom: 8px;">
          ส่งคำขอจองดูแผงเรียบร้อยแล้ว!
        </h4>
        <div style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; max-width: 440px; margin: 0 auto 24px;">
          เลขที่คำขอจอง: <strong style="color: #fff;">{{ successBookingNumber }}</strong><br/>
          ขั้นตอนถัดไป: <strong>เจ้าหน้าที่ตลาดจะตรวจสอบและอนุมัติวันเวลานัดหมายเข้าชม</strong> จากนั้นคุณสามารถเข้าดูแผงหน้างาน และกดยื่นคำร้องขอเช่าแผงในระบบได้ทันที
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
          <!-- Stall Summary Info Banner -->
          <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid var(--status-avail-border); padding: 14px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 1rem; color: #fff;">แผง {{ stall?.stall_number }} - {{ stall?.category }}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                ขนาด: {{ stall?.size_width }} × {{ stall?.size_length }} ม. ({{ stall?.area_sqm }} ตร.ม.)
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.15rem; font-weight: 800; color: #34d399;">฿{{ Number(stall?.monthly_rate).toLocaleString() }}</div>
              <div style="font-size: 0.72rem; color: var(--text-dim);">บาท / เดือน (รายวัน: ฿{{ stall?.daily_rate }})</div>
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
            2. ข้อมูลนัดหมายและสินค้าที่ต้องการขาย
          </h4>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="b_date">วันที่ต้องการเข้าชมแผง *</label>
              <input id="b_date" v-model="form.visit_date" type="date" :min="minDate" required class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label" for="b_time">ช่วงเวลาที่สะดวก *</label>
              <select id="b_time" v-model="form.visit_time_slot" class="form-select">
                <option value="09:00 - 12:00">ช่วงเช้า (09:00 - 12:00)</option>
                <option value="13:00 - 16:00">ช่วงบ่าย (13:00 - 16:00)</option>
                <option value="17:00 - 20:00">ช่วงเย็น (17:00 - 20:00)</option>
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
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span v-if="submitting">กำลังส่งคำขอจอง...</span>
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

const submitting = ref(false)
const isSuccess = ref(false)
const successBookingNumber = ref('')

const minDate = new Date().toISOString().slice(0, 10)

const form = ref({
  tenant_name: '',
  tenant_phone: '',
  tenant_email: '',
  tenant_id_card: '',
  visit_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // tomorrow
  visit_time_slot: '10:00 - 12:00',
  intended_business: ''
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    isSuccess.value = false
    form.value.tenant_name = user.value?.full_name || ''
    form.value.tenant_email = user.value?.email || ''
    form.value.intended_business = props.stall?.category || ''
  }
})

const handleSubmit = async () => {
  if (!props.stall) return
  submitting.value = true

  try {
    const res = await post('/bookings', {
      stall_id: props.stall.id,
      tenant_name: form.value.tenant_name,
      tenant_phone: form.value.tenant_phone,
      tenant_email: form.value.tenant_email,
      tenant_id_card: form.value.tenant_id_card,
      visit_date: form.value.visit_date,
      visit_time_slot: form.value.visit_time_slot,
      intended_business: form.value.intended_business
    })

    successBookingNumber.value = res.booking_number
    isSuccess.value = true
    emit('success')
  } catch (err: any) {
    alert(err?.data?.detail || 'เกิดข้อผิดพลาดในการส่งคำขอจอง')
  } finally {
    submitting.value = false
  }
}
</script>
