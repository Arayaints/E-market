<template>
  <div>
    <AppHeader />

    <div class="content-body">
      <!-- Breadcrumb Navigation at top of section body -->
      <AppBreadcrumb current="สัญญาการเช่าพื้นที่" backTo="/">
        <template #actions>
          <button class="btn btn-primary btn-sm" @click="openCreateModal">
            <span>+ สร้างสัญญาเช่าใหม่</span>
          </button>
        </template>
      </AppBreadcrumb>
      <!-- Filter Bar -->
      <div class="filter-bar card" style="padding: 16px 20px;">
        <div class="filter-group">
          <select v-model="selectedStatus" class="form-select" style="width: auto; min-width: 170px;" @change="filterContracts">
            <option value="">ทุกสถานะสัญญา (All)</option>
            <option value="active">ใช้งานอยู่ (Active)</option>
            <option value="pending">รอดำเนินการ (Pending)</option>
            <option value="expired">หมดสัญญา (Expired)</option>
            <option value="terminated">ยกเลิกแล้ว (Terminated)</option>
          </select>
        </div>

        <div class="search-box">
          <span class="search-icon" style="display: flex; align-items: center;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-input"
            placeholder="ค้นหาเลขที่สัญญา, ผู้เช่า, ร้านค้า, เบอร์โทร..."
            @input="filterContracts"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" style="text-align: center; padding: 60px;">
        <div style="font-size: 1rem; color: #64748b; display: inline-flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>กำลังโหลดข้อมูลสัญญา...</span>
        </div>
      </div>

      <!-- Contracts Table -->
      <div v-else class="card">
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>เลขที่สัญญา</th>
                <th>แผงเช่า</th>
                <th>ชื่อร้านค้า / สินค้า</th>
                <th>ผู้เช่า (Tenant)</th>
                <th>ระยะเวลาสัญญา</th>
                <th>ค่าเช่า / เดือน</th>
                <th>เงินประกัน</th>
                <th>สถานะ</th>
                <th style="text-align: right;">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in filteredContracts" :key="c.id">
                <td>
                  <strong style="color: var(--primary);">{{ c.contract_number }}</strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">รอบ: {{ c.billing_cycle === 'monthly' ? 'รายเดือน' : 'รายวัน' }}</div>
                </td>
                <td>
                  <span class="badge badge-occupied" v-if="c.stall">
                    {{ c.stall.stall_number }} ({{ c.stall.zone_code }})
                  </span>
                </td>
                <td>
                  <div><strong>{{ c.business_name }}</strong></div>
                  <div style="font-size: 0.78rem; color: var(--text-dim);">{{ c.business_type || 'ทั่วไป' }}</div>
                </td>
                <td>
                  <div>{{ c.tenant_name }}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">{{ c.tenant_phone }}</div>
                </td>
                <td>
                  <div>{{ c.start_date }} ถึง {{ c.end_date }}</div>
                  <div v-if="isExpiringSoon(c.end_date) && c.status === 'active'" style="font-size: 0.75rem; color: #fb7185; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <span>ใกล้หมดอายุ</span>
                  </div>
                </td>
                <td><strong>฿{{ Number(c.rental_fee).toLocaleString() }}</strong></td>
                <td>฿{{ Number(c.security_deposit || 0).toLocaleString() }}</td>
                <td>
                  <span :class="getStatusBadgeClass(c.status)">
                    <span class="badge-dot"></span>
                    {{ getStatusLabel(c.status) }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; gap: 6px;">
                    <button class="btn btn-sm btn-secondary" title="ดูเอกสารสัญญาฉบับเต็ม" style="display: inline-flex; align-items: center; gap: 5px;" @click="viewContractDoc(c)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                      <span>สัญญา</span>
                    </button>
                    <button
                      v-if="c.status === 'active'"
                      class="btn btn-sm btn-danger"
                      title="สิ้นสุด/ยกเลิกสัญญา"
                      style="display: inline-flex; align-items: center; gap: 5px;"
                      @click="terminateContract(c)"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                      <span>สิ้นสุด</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredContracts.length === 0">
                <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 40px;">
                  ไม่พบรายการสัญญาเช่าที่ค้นหา
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: Create Contract -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content" style="max-width: 720px;">
        <div class="modal-header">
          <h3 style="font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            <span>สร้างสัญญาเช่าพื้นที่ใหม่ (New Rental Contract)</span>
          </h3>
          <button class="btn-logout" @click="showCreateModal = false">✕</button>
        </div>

        <form @submit.prevent="submitContract">
          <div class="modal-body">
            <h4 style="font-size: 0.95rem; margin-bottom: 12px; color: var(--primary);">1. ข้อมูลแผงเช่าและร้านค้า</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c_stall_id">เลือกแผงเช่าที่ต้องการเช่า *</label>
                <select id="c_stall_id" v-model="formContract.stall_id" required class="form-select" @change="onStallSelected">
                  <option value="" disabled>-- เลือกแผงเช่าที่ว่าง --</option>
                  <option v-for="s in availableStalls" :key="s.id" :value="s.id">
                    แผง {{ s.stall_number }} (โซน {{ s.zone?.name || s.zone_id }}) - ฿{{ Number(s.monthly_rate).toLocaleString() }}/ด.
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="c_business_name">ชื่อร้านค้า (Shop/Business Name) *</label>
                <input id="c_business_name" v-model="formContract.business_name" type="text" required placeholder="เช่น ส้มตำรสเด็ด" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="c_business_type">ประเภทสินค้าที่จำหน่าย</label>
              <input id="c_business_type" v-model="formContract.business_type" type="text" placeholder="เช่น อาหารปรุงสุก, เครื่องดื่ม, เสื้อผ้า" class="form-input" />
            </div>

            <h4 style="font-size: 0.95rem; margin: 20px 0 12px; color: var(--primary);">2. ข้อมูลผู้เช่า (Tenant Information)</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c_tenant_name">ชื่อ-นามสกุล ผู้เช่า *</label>
                <input id="c_tenant_name" v-model="formContract.tenant_name" type="text" required placeholder="นาย/นาง/น.ส. ..." class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label" for="c_tenant_id_card">เลขประจำตัวประชาชน / Tax ID *</label>
                <input id="c_tenant_id_card" v-model="formContract.tenant_id_card" type="text" required placeholder="13 หลัก" class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c_tenant_phone">เบอร์โทรศัพท์ติดต่อ *</label>
                <input id="c_tenant_phone" v-model="formContract.tenant_phone" type="text" required placeholder="08x-xxx-xxxx" class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label" for="c_tenant_email">อีเมล (ถ้ามี)</label>
                <input id="c_tenant_email" v-model="formContract.tenant_email" type="email" placeholder="tenant@example.com" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="c_tenant_address">ที่อยู่ตามบัตรประชาชน / ที่อยู่ติดต่อ</label>
              <textarea id="c_tenant_address" v-model="formContract.tenant_address" rows="2" class="form-textarea" placeholder="บ้านเลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด"></textarea>
            </div>

            <h4 style="font-size: 0.95rem; margin: 20px 0 12px; color: var(--primary);">3. เงื่อนไขและอัตราค่าเช่า (Lease Terms)</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c_start_date">วันที่เริ่มต้นสัญญา *</label>
                <input id="c_start_date" v-model="formContract.start_date" type="date" required class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label" for="c_end_date">วันที่สิ้นสุดสัญญา *</label>
                <input id="c_end_date" v-model="formContract.end_date" type="date" required class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c_billing_cycle">รอบการชำระเงิน</label>
                <select id="c_billing_cycle" v-model="formContract.billing_cycle" class="form-select">
                  <option value="monthly">รายเดือน (Monthly)</option>
                  <option value="daily">รายวัน (Daily)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="c_rental_fee">ค่าเช่าต่องวด (บาท) *</label>
                <input id="c_rental_fee" v-model.number="formContract.rental_fee" type="number" required class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c_security_deposit">เงินประกันความเสียหาย (บาท)</label>
                <input id="c_security_deposit" v-model.number="formContract.security_deposit" type="number" class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label" for="c_advance_payment">เงินจ่ายล่วงหน้า (บาท)</label>
                <input id="c_advance_payment" v-model.number="formContract.advance_payment" type="number" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="c_terms">ข้อกำหนดพิเศษ / เงื่อนไขสัญญา</label>
              <textarea id="c_terms" v-model="formContract.terms_and_conditions" rows="2" class="form-textarea" placeholder="เช่น ห้ามโอนสิทธิ์ให้บุคคลอื่น, ห้ามดัดแปลงโครงสร้าง"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">ยกเลิก</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving">กำลังสร้างสัญญา...</span>
              <span v-else>ยืนยันและเปิดใช้งานสัญญา</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: View Contract Document (Print-ready) -->
    <div v-if="viewDocModal && currentDoc" class="modal-overlay" @click.self="viewDocModal = false">
      <div class="modal-content" style="max-width: 800px; background: #fff;">
        <div class="modal-header" style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #0f172a;">
          <h3 style="font-size: 1.15rem;">เอกสารสัญญาเช่าพื้นที่แผงค้า (เลขที่ {{ currentDoc.contract_number }})</h3>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-primary" style="display: inline-flex; align-items: center; gap: 6px;" @click="printDoc">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span>พิมพ์เอกสาร</span>
            </button>
            <button class="btn btn-sm btn-secondary" @click="viewDocModal = false">ปิด</button>
          </div>
        </div>

        <div class="modal-body" id="print-area">
          <div class="contract-document">
            <div class="contract-header">
              <h2 style="font-size: 1.4rem; font-weight: 700;">หนังสือสัญญาเช่าพื้นที่แผงค้าในตลาด</h2>
              <div style="font-size: 0.9rem; color: #475569; margin-top: 4px;">ระบบจัดการตลาด e-Market Management System</div>
              <div style="font-size: 0.85rem; font-weight: 600; color: #059669; margin-top: 6px;">
                เลขที่สัญญา: {{ currentDoc.contract_number }}
              </div>
            </div>

            <div style="line-height: 1.8; font-size: 0.92rem; text-align: justify;">
              <p>
                สัญญาฉบับนี้ทำขึ้น ณ <strong>ตลาดกลางชุมชน e-Market</strong> เมื่อวันที่ <strong>{{ currentDoc.created_at ? currentDoc.created_at.slice(0, 10) : currentDoc.start_date }}</strong>
                ระหว่าง <strong>บริษัท บริหารจัดการตลาด จำกัด</strong> (ซึ่งต่อไปนี้เรียกว่า "ผู้ให้เช่า") ฝ่ายหนึ่ง กับ
              </p>

              <div class="contract-grid" style="margin-top: 14px; background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div><strong>ชื่อผู้เช่า:</strong> {{ currentDoc.tenant_name }}</div>
                <div><strong>เลขประจำตัวประชาชน:</strong> {{ currentDoc.tenant_id_card }}</div>
                <div><strong>เบอร์โทรศัพท์:</strong> {{ currentDoc.tenant_phone }}</div>
                <div><strong>อีเมล:</strong> {{ currentDoc.tenant_email || '-' }}</div>
                <div style="grid-column: 1 / -1;"><strong>ที่อยู่:</strong> {{ currentDoc.tenant_address || '-' }}</div>
              </div>

              <div class="section-title">ข้อ ๑. วัตถุประสงค์และสถานที่เช่า</div>
              <p>
                ผู้ให้เช่าตกลงให้เช่า และผู้เช่าตกลงเช่าพื้นที่แผงค้าเลขที่ <strong>{{ currentDoc.stall ? currentDoc.stall.stall_number : currentDoc.stall_id }}</strong> 
                เพื่อประกอบกิจการร้านค้า <strong>"{{ currentDoc.business_name }}"</strong> จำหน่ายสินค้าประเภท <strong>{{ currentDoc.business_type || 'ทั่วไป' }}</strong>
              </p>

              <div class="section-title">ข้อ ๒. ระยะเวลาการเช่า</div>
              <p>
                สัญญาการเช่ามีกำหนดระยะเวลา ตั้งแต่วันที่ <strong>{{ currentDoc.start_date }}</strong> ถึงวันที่ <strong>{{ currentDoc.end_date }}</strong>
              </p>

              <div class="section-title">ข้อ ๓. ค่าเช่าและเงินประกัน</div>
              <div class="contract-grid" style="margin-top: 8px; background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div><strong>อัตราค่าเช่า:</strong> ฿{{ Number(currentDoc.rental_fee).toLocaleString() }} ({{ currentDoc.billing_cycle === 'monthly' ? 'รายเดือน' : 'รายวัน' }})</div>
                <div><strong>เงินประกันสัญญา:</strong> ฿{{ Number(currentDoc.security_deposit || 0).toLocaleString() }} บาท</div>
                <div><strong>เงินจ่ายล่วงหน้า:</strong> ฿{{ Number(currentDoc.advance_payment || 0).toLocaleString() }} บาท</div>
                <div><strong>สถานะสัญญา:</strong> {{ getStatusLabel(currentDoc.status) }}</div>
              </div>

              <div class="section-title">ข้อ ๔. ข้อกำหนดและเงื่อนไขเพิ่มเติม</div>
              <p style="color: #475569;">
                {{ currentDoc.terms_and_conditions || 'ผู้เช่าต้องปฏิบัติตามกฎระเบียบความสะอาด สุขอนามัย และความปลอดภัยของตลาดอย่างเคร่งครัด' }}
              </p>

              <!-- Signature Area -->
              <div class="contract-sign-box">
                <div>
                  <div class="sign-line">
                    ลงชื่อ ...........................................................<br>
                    ( ผู้ให้เช่า / เจ้าหน้าที่ดูแลตลาด )
                  </div>
                </div>
                <div>
                  <div class="sign-line">
                    ลงชื่อ ...........................................................<br>
                    ( {{ currentDoc.tenant_name }} )<br>
                    ผู้เช่า
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { get, post, del } = useApi()

const loading = ref(true)
const saving = ref(false)
const contracts = ref<any[]>([])
const filteredContracts = ref<any[]>([])
const availableStalls = ref<any[]>([])

const selectedStatus = ref('')
const searchQuery = ref('')

// Create Modal
const showCreateModal = ref(false)
const formContract = ref({
  stall_id: '' as any,
  tenant_name: '',
  tenant_id_card: '',
  tenant_phone: '',
  tenant_email: '',
  tenant_address: '',
  business_name: '',
  business_type: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  billing_cycle: 'monthly',
  rental_fee: 4000,
  security_deposit: 8000,
  advance_payment: 4000,
  terms_and_conditions: 'ผู้เช่าต้องรักษาความสะอาดและชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน',
  status: 'active'
})

// Document Preview Modal
const viewDocModal = ref(false)
const currentDoc = ref<any>(null)

const loadData = async () => {
  loading.value = true
  try {
    const [contractsRes, stallsRes] = await Promise.all([
      get('/contracts'),
      get('/stalls')
    ])
    contracts.value = contractsRes
    availableStalls.value = stallsRes.filter((s: any) => s.status === 'available')
    filterContracts()

    // If query contains new_for_stall
    if (route.query.new_for_stall) {
      const targetStallId = Number(route.query.new_for_stall)
      const target = stallsRes.find((s: any) => s.id === targetStallId)
      if (target) {
        openCreateModal()
        formContract.value.stall_id = target.id
        formContract.value.rental_fee = target.monthly_rate
        formContract.value.security_deposit = target.monthly_rate * 2
        formContract.value.advance_payment = target.monthly_rate
      }
    }
  } catch (err) {
    console.error('Failed to load contracts:', err)
  } finally {
    loading.value = false
  }
}

const filterContracts = () => {
  let list = [...contracts.value]
  if (selectedStatus.value) {
    list = list.filter(c => c.status === selectedStatus.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(c =>
      c.contract_number.toLowerCase().includes(q) ||
      c.tenant_name.toLowerCase().includes(q) ||
      c.business_name.toLowerCase().includes(q) ||
      c.tenant_phone.includes(q)
    )
  }
  filteredContracts.value = list
}

const onStallSelected = () => {
  const stall = availableStalls.value.find(s => s.id === formContract.value.stall_id)
  if (stall) {
    formContract.value.rental_fee = stall.monthly_rate
    formContract.value.security_deposit = stall.monthly_rate * 2
    formContract.value.advance_payment = stall.monthly_rate
    formContract.value.business_type = stall.category
  }
}

const openCreateModal = () => {
  formContract.value = {
    stall_id: availableStalls.value[0]?.id || '',
    tenant_name: '',
    tenant_id_card: '',
    tenant_phone: '',
    tenant_email: '',
    tenant_address: '',
    business_name: '',
    business_type: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    billing_cycle: 'monthly',
    rental_fee: 4000,
    security_deposit: 8000,
    advance_payment: 4000,
    terms_and_conditions: 'ผู้เช่าต้องรักษาความสะอาดและชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน',
    status: 'active'
  }
  if (formContract.value.stall_id) {
    onStallSelected()
  }
  showCreateModal.value = true
}

const submitContract = async () => {
  saving.value = true
  try {
    await post('/contracts', formContract.value)
    showCreateModal.value = false
    await loadData()
    alert('บันทึกสัญญาเช่าและเปิดใช้งานแผงเช่าเรียบร้อยแล้ว')
  } catch (err: any) {
    alert(err?.data?.detail || 'เกิดข้อผิดพลาดในการสร้างสัญญา')
  } finally {
    saving.value = false
  }
}

const terminateContract = async (contract: any) => {
  if (confirm(`คุณต้องการสิ้นสุดสัญญา ${contract.contract_number} ก่อนกำหนดหรือไม่? ระบบจะเปลี่ยนสถานะแผงเป็น "ว่าง" โดยอัตโนมัติ`)) {
    try {
      await post(`/contracts/${contract.id}/terminate`)
      await loadData()
      alert('สัญญาเช่าถูกยกเลิกแล้ว และสถานะแผงถูกปรับเป็นว่างเรียบร้อย')
    } catch (err: any) {
      alert(err?.data?.detail || 'เกิดข้อผิดพลาด')
    }
  }
}

const viewContractDoc = (c: any) => {
  currentDoc.value = c
  viewDocModal.value = true
}

const printDoc = () => {
  window.print()
}

const isExpiringSoon = (endDateStr: string) => {
  const end = new Date(endDateStr).getTime()
  const now = Date.now()
  const diffDays = (end - now) / (1000 * 3600 * 24)
  return diffDays > 0 && diffDays <= 30
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'active': return 'badge badge-available'
    case 'pending': return 'badge badge-reserved'
    case 'expired': return 'badge badge-occupied'
    case 'terminated': return 'badge badge-maintenance'
    default: return 'badge'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'ใช้งานอยู่'
    case 'pending': return 'รอดำเนินการ'
    case 'expired': return 'หมดสัญญา'
    case 'terminated': return 'ยกเลิกแล้ว'
    default: return status
  }
}

onMounted(() => {
  loadData()
})
</script>
