<template>
  <div>
    <AppHeader />

    <div class="content-body">
      <!-- Breadcrumb Navigation at top of section body -->
      <AppBreadcrumb current="ระบบจองดูแผงและอนุมัติเข้าชม" backTo="/">
        <template #actions>
          <NuxtLink to="/stalls" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
            <span>ไปที่แผนที่ GIS เพื่อจองแผง</span>
          </NuxtLink>
        </template>
      </AppBreadcrumb>
      <!-- Top Tabs Navigation -->
      <div style="display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; flex-wrap: wrap;">
        <button
          class="btn btn-sm"
          :class="activeTab === 'pending' ? 'btn-primary' : 'btn-outline'"
          style="display: inline-flex; align-items: center; gap: 6px;"
          @click="activeTab = 'pending'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>รอเจ้าหน้าที่อนุมัติ</span>
          <span class="badge" style="background: rgba(255,255,255,0.2); padding: 2px 6px;">{{ pendingBookings.length }}</span>
        </button>

        <button
          class="btn btn-sm"
          :class="activeTab === 'approved' ? 'btn-primary' : 'btn-outline'"
          style="display: inline-flex; align-items: center; gap: 6px;"
          @click="activeTab = 'approved'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>นัดหมายสำเร็จ (รอเข้าชม)</span>
          <span class="badge" style="background: rgba(255,255,255,0.2); padding: 2px 6px;">{{ approvedBookings.length }}</span>
        </button>

        <button
          class="btn btn-sm"
          :class="activeTab === 'visited' ? 'btn-primary' : 'btn-outline'"
          style="display: inline-flex; align-items: center; gap: 6px;"
          @click="activeTab = 'visited'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/>
          </svg>
          <span>ชมแผงแล้ว (ตัดสินใจขอเช่า)</span>
          <span class="badge" style="background: rgba(255,255,255,0.2); padding: 2px 6px;">{{ visitedBookings.length }}</span>
        </button>

        <button
          class="btn btn-sm"
          :class="activeTab === 'all' ? 'btn-primary' : 'btn-outline'"
          style="display: inline-flex; align-items: center; gap: 6px;"
          @click="activeTab = 'all'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <span>รายการทั้งหมด</span>
          <span class="badge" style="background: rgba(255,255,255,0.2); padding: 2px 6px;">{{ bookings.length }}</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" style="text-align: center; padding: 60px;">
        <div style="font-size: 1rem; color: #64748b; display: inline-flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>กำลังโหลดรายการการจอง...</span>
        </div>
      </div>

      <!-- Tab Content -->
      <div v-else class="card">
        <div class="card-header">
          <div class="card-title" style="display: flex; align-items: center; gap: 8px;">
            <svg v-if="activeTab === 'pending'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f59e0b;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <svg v-else-if="activeTab === 'approved'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #10b981;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <svg v-else-if="activeTab === 'visited'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #6366f1;"><circle cx="12" cy="12" r="9"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>

            <span v-if="activeTab === 'pending'">รายการคำขอจองรอเจ้าหน้าที่อนุมัติ</span>
            <span v-else-if="activeTab === 'approved'">รายการที่อนุมัตินัดหมายแล้ว (รอนำชมแผงหน้างาน)</span>
            <span v-else-if="activeTab === 'visited'">แผงที่เข้าชมแล้ว (ขั้นตอนตัดสินใจยื่นคำร้องขอเช่า)</span>
            <span v-else>ประวัติรายการจองดูแผงทั้งหมด</span>
          </div>
          <button class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 5px;" @click="loadBookings">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            <span>รีเฟรช</span>
          </button>
        </div>

        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>เลขที่จอง</th>
                <th>แผงเช่า</th>
                <th>ผู้ขอจองเข้าชม</th>
                <th>เบอร์โทรศัพท์</th>
                <th>วันและเวลาที่นัดหมาย</th>
                <th>สินค้าที่ต้องการขาย</th>
                <th>สถานะ</th>
                <th style="text-align: right;">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in currentTabBookings" :key="b.id">
                <td>
                  <strong style="color: var(--primary); cursor: pointer; text-decoration: underline;" title="คลิกดูรายละเอียดการจอง" @click="openBookingDetails(b)">
                    {{ b.booking_number }}
                  </strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">{{ b.created_at?.slice(0, 10) }}</div>
                </td>
                <td>
                  <span class="badge badge-available">
                    แผง {{ b.stall_number }}
                  </span>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                    ฿{{ Number(b.stall_monthly_rate).toLocaleString() }}/ด.
                  </div>
                </td>
                <td>
                  <div><strong>{{ b.tenant_name }}</strong></div>
                  <div style="font-size: 0.75rem; color: var(--text-dim);" v-if="b.tenant_email">{{ b.tenant_email }}</div>
                </td>
                <td>{{ b.tenant_phone }}</td>
                <td>
                  <div style="font-weight: 600; display: flex; align-items: center; gap: 5px;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>{{ b.visit_date }}</span>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px; margin-top: 2px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>{{ b.visit_time_slot }}</span>
                  </div>
                </td>
                <td>{{ b.intended_business || '-' }}</td>
                <td>
                  <span :class="getBookingBadgeClass(b.status)">
                    <span class="badge-dot"></span>
                    {{ getBookingStatusLabel(b.status) }}
                  </span>
                  <div v-if="b.officer_notes" style="font-size: 0.75rem; color: #059669; margin-top: 2px; font-weight: 500;">
                    จนท: {{ b.officer_notes }}
                  </div>
                  <div v-if="b.rejection_reason" style="font-size: 0.75rem; color: #e11d48; margin-top: 2px; font-weight: 500;">
                    เหตุผล: {{ b.rejection_reason }}
                  </div>
                </td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; gap: 6px; align-items: center; justify-content: flex-end;">
                    <!-- Always available: View Details Button -->
                    <button class="btn btn-sm btn-outline" style="border-color: #cbd5e1; color: var(--primary); display: inline-flex; align-items: center; gap: 5px;" @click="openBookingDetails(b)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      <span>รายละเอียด</span>
                    </button>

                    <!-- Action for Pending Approval: Officer Approve or Reject -->
                    <template v-if="b.status === 'pending_approval'">
                      <button class="btn btn-sm btn-primary" @click="openApproveModal(b)">
                        ✓ อนุมัติ
                      </button>
                      <button class="btn btn-sm btn-danger" @click="openRejectModal(b)">
                        ✕ ไม่อนุมัติ
                      </button>
                    </template>

                    <!-- Action for Approved: Mark as visited or decide -->
                    <template v-else-if="b.status === 'approved'">
                      <button class="btn btn-sm btn-secondary" style="display: inline-flex; align-items: center; gap: 5px;" @click="markAsVisited(b)" title="ยืนยันว่าเข้าดูแผงหน้างานแล้ว">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        <span>เข้าชมแผงแล้ว</span>
                      </button>
                    </template>

                    <!-- Action for Visited: Tenant decides to Apply Lease or Reject -->
                    <template v-else-if="b.status === 'visited'">
                      <button class="btn btn-sm btn-primary" style="display: inline-flex; align-items: center; gap: 5px;" @click="openLeaseApplication(b)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                        <span>ยื่นคำร้องขอเช่าแผง</span>
                      </button>
                      <button class="btn btn-sm btn-danger" @click="handleNotInterested(b)">
                        ไม่สนใจ
                      </button>
                    </template>

                    <!-- Already Applied or Finished -->
                    <span v-else-if="b.status === 'lease_applied'" style="font-size: 0.82rem; color: #059669; font-weight: 600;">
                      ✓ ยื่นคำร้องแล้ว
                    </span>
                    <span v-else style="color: var(--text-muted); font-size: 0.82rem;">
                      เสร็จสิ้น
                    </span>
                  </div>
                </td>
              </tr>

              <tr v-if="currentTabBookings.length === 0">
                <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px;">
                  ไม่มีรายการในหมวดนี้
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Officer Approve Modal -->
    <div v-if="showApproveModal && targetBooking" class="modal-overlay" @click.self="showApproveModal = false">
      <div class="modal-content" style="max-width: 480px;">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem;">อนุมัติการนัดหมายเข้าดูแผง ({{ targetBooking.booking_number }})</h3>
          <button class="btn-logout" @click="showApproveModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 14px;">
            ยืนยันอนุมัตินัดหมายให้คุณ <strong>{{ targetBooking.tenant_name }}</strong> เข้าดูแผง <strong>{{ targetBooking.stall_number }}</strong> วันที่ {{ targetBooking.visit_date }} ({{ targetBooking.visit_time_slot }})
          </p>
          <div class="form-group">
            <label class="form-label" for="notes">ข้อความ/คำแนะนำจากเจ้าหน้าที่</label>
            <textarea id="notes" v-model="officerNotes" rows="2" class="form-textarea" placeholder="เช่น ให้ติดต่อเจ้าหน้าที่ดูแลตลาด ณ อาคารอำนวยการ ก่อนเข้าชม"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showApproveModal = false">ยกเลิก</button>
          <button class="btn btn-primary" @click="confirmApprove">ยืนยันการอนุมัติ</button>
        </div>
      </div>
    </div>

    <!-- Officer Reject Modal -->
    <div v-if="showRejectModal && targetBooking" class="modal-overlay" @click.self="showRejectModal = false">
      <div class="modal-content" style="max-width: 480px;">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; color: #fb7185;">ไม่อนุมัติการนัดหมายดูแผง ({{ targetBooking.booking_number }})</h3>
          <button class="btn-logout" @click="showRejectModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="rej_reason">ระบุเหตุผลในการไม่อนุมัติ (ตาม Flow เจ้าหน้าที่ต้องใส่หมายเหตุ) *</label>
            <textarea id="rej_reason" v-model="rejectionReason" required rows="3" class="form-textarea" placeholder="เช่น แผงปิดปรับปรุงระบบไฟฟ้าในวันดังกล่าว กรุณาเลือกวันอื่น"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showRejectModal = false">ยกเลิก</button>
          <button class="btn btn-danger" @click="confirmReject" :disabled="!rejectionReason.trim()">
            ยืนยันไม่อนุมัติ
          </button>
        </div>
      </div>
    </div>

    <!-- Booking Details Modal -->
    <BookingDetailsModal
      :show="showDetailsModal"
      :booking="targetBooking"
      @close="showDetailsModal = false"
      @approve="onDetailsApprove"
      @reject="onDetailsReject"
      @markVisited="onDetailsMarkVisited"
      @applyLease="onDetailsApplyLease"
    />

    <!-- Lease Application Modal (ยื่นคำร้องขอเช่า) -->
    <LeaseApplicationModal
      :show="showLeaseModal"
      :booking="targetBooking"
      :stall="null"
      @close="showLeaseModal = false"
      @success="onApplicationSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { get, post } = useApi()

const loading = ref(true)
const bookings = ref<any[]>([])
const activeTab = ref<'pending' | 'approved' | 'visited' | 'all'>('pending')

// Modals
const showDetailsModal = ref(false)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showLeaseModal = ref(false)
const targetBooking = ref<any>(null)
const officerNotes = ref('อนุมัตินัดหมาย ให้เจ้าหน้าที่เวรนำชมแผง')
const rejectionReason = ref('')

const loadBookings = async () => {
  loading.value = true
  try {
    bookings.value = await get('/bookings')
  } catch (err) {
    console.error('Failed to load bookings:', err)
  } finally {
    loading.value = false
  }
}

const pendingBookings = computed(() => bookings.value.filter(b => b.status === 'pending_approval'))
const approvedBookings = computed(() => bookings.value.filter(b => b.status === 'approved'))
const visitedBookings = computed(() => bookings.value.filter(b => b.status === 'visited'))

const currentTabBookings = computed(() => {
  switch (activeTab.value) {
    case 'pending': return pendingBookings.value
    case 'approved': return approvedBookings.value
    case 'visited': return visitedBookings.value
    default: return bookings.value
  }
})

const openApproveModal = (b: any) => {
  targetBooking.value = b
  officerNotes.value = 'อนุมัตินัดหมาย ให้เจ้าหน้าที่เวรนำชมแผง'
  showApproveModal.value = true
}

const confirmApprove = async () => {
  if (!targetBooking.value) return
  try {
    await post(`/bookings/${targetBooking.value.id}/approve`, {
      officer_notes: officerNotes.value
    })
    showApproveModal.value = false
    await loadBookings()
  } catch (err: any) {
    alert(err?.data?.detail || 'เกิดข้อผิดพลาดในการอนุมัติ')
  }
}

const openRejectModal = (b: any) => {
  targetBooking.value = b
  rejectionReason.value = ''
  showRejectModal.value = true
}

const confirmReject = async () => {
  if (!targetBooking.value || !rejectionReason.value.trim()) return
  try {
    await post(`/bookings/${targetBooking.value.id}/reject`, {
      rejection_reason: rejectionReason.value
    })
    showRejectModal.value = false
    await loadBookings()
  } catch (err: any) {
    alert(err?.data?.detail || 'เกิดข้อผิดพลาด')
  }
}

const markAsVisited = async (b: any) => {
  try {
    await post(`/bookings/${b.id}/decide`, {
      decision: 'interested'
    })
    await loadBookings()
    activeTab.value = 'visited'
  } catch (err: any) {
    alert(err?.data?.detail || 'เกิดข้อผิดพลาด')
  }
}

const handleNotInterested = async (b: any) => {
  if (confirm(`คุณต้องการยกเลิกการจองแผง ${b.stall_number} หรือไม่?`)) {
    try {
      await post(`/bookings/${b.id}/decide`, {
        decision: 'not_interested'
      })
      await loadBookings()
    } catch (err: any) {
      alert(err?.data?.detail || 'เกิดข้อผิดพลาด')
    }
  }
}

const openLeaseApplication = (b: any) => {
  targetBooking.value = b
  showLeaseModal.value = true
}

const onApplicationSubmitted = async () => {
  await loadBookings()
}

const getBookingBadgeClass = (status: string) => {
  switch (status) {
    case 'pending_approval': return 'badge badge-reserved'
    case 'approved': return 'badge badge-available'
    case 'visited': return 'badge badge-occupied'
    case 'lease_applied': return 'badge badge-available'
    case 'rejected': return 'badge badge-maintenance'
    case 'cancelled': return 'badge badge-maintenance'
    default: return 'badge'
  }
}

const getBookingStatusLabel = (status: string) => {
  switch (status) {
    case 'pending_approval': return 'รอเจ้าหน้าที่อนุมัติ'
    case 'approved': return 'นัดหมายสำเร็จ'
    case 'visited': return 'ดูแผงแล้ว (รอตัดสินใจ)'
    case 'lease_applied': return 'ยื่นคำร้องขอเช่าแล้ว'
    case 'rejected': return 'ไม่อนุมัติ (ยกเลิก)'
    case 'cancelled': return 'ยกเลิกการจอง'
    default: return status
  }
}

const openBookingDetails = (b: any) => {
  targetBooking.value = b
  showDetailsModal.value = true
}

const onDetailsApprove = (b: any) => {
  showDetailsModal.value = false
  openApproveModal(b)
}

const onDetailsReject = (b: any) => {
  showDetailsModal.value = false
  openRejectModal(b)
}

const onDetailsMarkVisited = (b: any) => {
  showDetailsModal.value = false
  markAsVisited(b)
}

const onDetailsApplyLease = (b: any) => {
  showDetailsModal.value = false
  openLeaseApplication(b)
}

const checkQueryParams = () => {
  const bNum = route.query.booking_number as string
  const bId = route.query.id as string
  const stallId = route.query.stall_id as string

  if (bNum || bId || stallId) {
    const match = bookings.value.find(b =>
      (bNum && b.booking_number === bNum) ||
      (bId && String(b.id) === String(bId)) ||
      (stallId && String(b.stall_id) === String(stallId))
    )
    if (match) {
      targetBooking.value = match
      showDetailsModal.value = true
      if (match.status === 'pending_approval') activeTab.value = 'pending'
      else if (match.status === 'approved') activeTab.value = 'approved'
      else if (match.status === 'visited') activeTab.value = 'visited'
      else activeTab.value = 'all'
    }
  }
}

onMounted(async () => {
  await loadBookings()
  checkQueryParams()
})
</script>
