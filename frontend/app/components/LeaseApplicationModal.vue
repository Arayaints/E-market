<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content" style="max-width: 660px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700;">ยื่นคำร้องขอเช่าแผงค้า (Lease Application)</h3>
            <div style="font-size: 0.8rem; color: var(--primary);">
              แผงเลขที่: {{ targetStallNumber }} (อ้างอิงการจอง: {{ booking?.booking_number || '-' }})
            </div>
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
        <h4 style="font-size: 1.25rem; font-weight: 700; color: var(--status-avail-text); margin-bottom: 8px;">
          ยื่นคำร้องขอเช่าแผงเรียบร้อยแล้ว!
        </h4>
        <div style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; max-width: 460px; margin: 0 auto 24px;">
          เลขที่คำร้อง: <strong style="color: var(--primary); font-size: 1.05rem;">{{ successAppNumber }}</strong><br/>
          ขั้นตอนถัดไป: คำร้องจะถูกส่งให้ <strong>เจ้าหน้าที่ตรวจสอบ</strong> &rarr; <strong>ผอ.ตลาด อนุมัติ</strong> &rarr; <strong>ผอ.สำนักตลาด อนุมัติ</strong> เพื่อจัดทำสัญญาเช่าฉบับสมบูรณ์
        </div>
        <div style="display: flex; justify-content: center; gap: 12px;">
          <NuxtLink to="/applications" class="btn btn-primary" @click="$emit('close')">
            ติดตามสถานะคำร้องของฉัน
          </NuxtLink>
          <button class="btn btn-secondary" @click="$emit('close')">ปิดหน้าต่าง</button>
        </div>
      </div>

      <!-- Form State -->
      <form v-else @submit.prevent="handleSubmit">
        <div class="modal-body">
          <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--primary); margin-bottom: 12px;">
            1. ข้อมูลผู้ยื่นคำร้อง (Applicant Details)
          </h4>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="app_name">ชื่อ-นามสกุล *</label>
              <input id="app_name" v-model="form.applicant_name" type="text" required class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label" for="app_id">เลขประจำตัวประชาชน (13 หลัก) *</label>
              <input id="app_id" v-model="form.applicant_id_card" type="text" required placeholder="x-xxxx-xxxxx-xx-x" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="app_phone">เบอร์โทรศัพท์ติดต่อ *</label>
              <input id="app_phone" v-model="form.applicant_phone" type="tel" required class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label" for="app_email">อีเมล</label>
              <input id="app_email" v-model="form.applicant_email" type="email" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="app_address">ที่อยู่ตามบัตรประชาชน / ที่อยู่ติดต่อ</label>
            <textarea id="app_address" v-model="form.applicant_address" rows="2" class="form-textarea" placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด"></textarea>
          </div>

          <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--primary); margin: 16px 0 12px;">
            2. ข้อมูลร้านค้าและสินค้าที่ขอจำหน่าย
          </h4>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="app_shop">ชื่อร้านค้า (Shop Name) *</label>
              <input id="app_shop" v-model="form.shop_name" type="text" required placeholder="เช่น ชานมไข่มุก เฮงเฮง" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label" for="app_prod">ประเภทสินค้าที่จะจำหน่าย *</label>
              <input id="app_prod" v-model="form.product_type" type="text" required placeholder="เช่น เครื่องดื่ม, ของทอด, เสื้อผ้า" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="app_start">วันที่ประสงค์เริ่มเช่า *</label>
              <input id="app_start" v-model="form.requested_start_date" type="date" required class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label" for="app_period">ระยะเวลาขอเช่า (เดือน)</label>
              <select id="app_period" v-model.number="form.requested_period_months" class="form-select">
                <option :value="3">3 เดือน (ทดลองขาย)</option>
                <option :value="6">6 เดือน</option>
                <option :value="12">1 ปี (มาตรฐาน)</option>
                <option :value="24">2 ปี</option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">ยกเลิก</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span v-if="submitting">กำลังส่งคำร้อง...</span>
            <span v-else>ยื่นคำร้องขอเช่าแผง</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  booking: any
  stall: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const { post } = useApi()
const { showError } = useAppAlert()

const submitting = ref(false)
const isSuccess = ref(false)
const successAppNumber = ref('')

const targetStallNumber = computed(() => {
  return props.booking?.stall_number || props.stall?.stall_number || ''
})

const targetStallId = computed(() => {
  return props.booking?.stall_id || props.stall?.id || 1
})

const form = ref({
  applicant_name: '',
  applicant_id_card: '',
  applicant_phone: '',
  applicant_email: '',
  applicant_address: '',
  shop_name: '',
  product_type: '',
  requested_start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  requested_period_months: 12,
  proposed_rent_type: 'monthly'
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    isSuccess.value = false
    if (props.booking) {
      form.value.applicant_name = props.booking.tenant_name || ''
      form.value.applicant_phone = props.booking.tenant_phone || ''
      form.value.applicant_email = props.booking.tenant_email || ''
      form.value.applicant_id_card = props.booking.tenant_id_card || ''
      form.value.product_type = props.booking.intended_business || ''
      form.value.shop_name = props.booking.intended_business || ''
    }
  }
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    const res = await post('/applications', {
      stall_id: targetStallId.value,
      stall_number: targetStallNumber.value,
      market_name: props.booking?.market_name || props.stall?.market_name || 'ตลาดนัดจตุจักร',
      booking_id: props.booking?.id || null,
      applicant_name: form.value.applicant_name,
      applicant_id_card: form.value.applicant_id_card,
      applicant_phone: form.value.applicant_phone,
      applicant_email: form.value.applicant_email,
      applicant_address: form.value.applicant_address,
      shop_name: form.value.shop_name,
      product_type: form.value.product_type,
      requested_start_date: form.value.requested_start_date,
      requested_period_months: form.value.requested_period_months,
      proposed_rent_type: form.value.proposed_rent_type
    })

    successAppNumber.value = res.application_number
    isSuccess.value = true
    emit('success')
  } catch (err: any) {
    await showError(err?.data?.detail || 'เกิดข้อผิดพลาดในการยื่นคำร้อง', 'ยื่นคำร้องไม่สำเร็จ')
  } finally {
    submitting.value = false
  }
}
</script>
