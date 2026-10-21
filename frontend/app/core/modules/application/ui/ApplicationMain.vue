<template>
  <div>
    <AppHeader />

    <div class="content-body">


      <!-- Loading State -->
      <div v-if="loading" style="text-align: center; padding: 60px;">
        <div style="font-size: 1rem; color: #64748b; display: inline-flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>กำลังโหลดรายการคำร้องขอเช่า...</span>
        </div>
      </div>

      <!-- Standard Table Card Container (Mockup Standard) -->
      <div v-else class="table-card-container">
        <!-- Card Header: Title + Subtitle on Left, Export + Actions + Search on Right -->
        <div class="table-card-header">
          <div class="table-header-left">
            <h2 class="table-card-title">รายการคำร้องขอเช่าแผงทั้งหมด</h2>
            <div class="table-card-subtitle">{{ filteredApplications.length }} รายการ</div>
          </div>

          <div class="table-header-actions">
            <!-- Outlined Export Report Button -->
            <button class="btn-export-report" @click="exportReport" title="ส่งออกรายงาน">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
              <span>ออกรายงาน</span>
            </button>

            <!-- Primary Action Button -->
            <NuxtLink to="/bookings" class="btn-table-primary-action">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>ยื่นคำร้องใหม่</span>
            </NuxtLink>

            <!-- Search Box with Search Icon Left & Funnel Filter Icon Right -->
            <div class="table-search-funnel-box">
              <span class="search-icon-left">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาหมายเลขคำร้อง / ร้านค้า..."
                @input="currentPage = 1"
              />
              <span class="filter-icon-right" title="ตัวกรอง">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              </span>
            </div>
          </div>
        </div>

        <!-- Filter Tabs (ทั้งหมด, รอ จนท., รอ ผอ.ตลาด, รอ ผอ.สำนัก, อนุมัติแล้ว, ส่งกลับแก้ไข) -->
        <div class="table-nav-tabs">
          <button
            class="table-nav-tab"
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'; currentPage = 1"
          >
            ทั้งหมด ({{ applications.length }})
          </button>
          <button
            class="table-nav-tab"
            :class="{ active: activeTab === 'pending_officer' }"
            @click="activeTab = 'pending_officer'; currentPage = 1"
          >
            รอ จนท. ตรวจสอบ ({{ countByStatus('pending_officer') }})
          </button>
          <button
            class="table-nav-tab"
            :class="{ active: activeTab === 'pending_market_director' }"
            @click="activeTab = 'pending_market_director'; currentPage = 1"
          >
            รอ ผอ.ตลาด ({{ countByStatus('pending_market_director') }})
          </button>
          <button
            class="table-nav-tab"
            :class="{ active: activeTab === 'pending_bureau_director' }"
            @click="activeTab = 'pending_bureau_director'; currentPage = 1"
          >
            รอ ผอ.สำนักตลาด ({{ countByStatus('pending_bureau_director') }})
          </button>
          <button
            class="table-nav-tab"
            :class="{ active: activeTab === 'approved' }"
            @click="activeTab = 'approved'; currentPage = 1"
          >
            อนุมัติแล้ว ({{ countByStatus('approved') }})
          </button>
          <button
            class="table-nav-tab"
            :class="{ active: activeTab === 'rejected' }"
            @click="activeTab = 'rejected'; currentPage = 1"
          >
            ส่งกลับ/ไม่อนุมัติ ({{ countByStatus('rejected') + countByStatus('revision_required') }})
          </button>
        </div>

        <!-- Table -->
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th style="width: 140px;">เลขที่คำร้อง</th>
                <th style="width: 150px;">แผงที่ขอเช่า</th>
                <th>ผู้ยื่นคำร้อง</th>
                <th>ชื่อร้าน / สินค้าที่ขาย</th>
                <th style="width: 130px;">วันที่ประสงค์เช่า</th>
                <th style="width: 160px;">สถานะการพิจารณา</th>
                <th style="text-align: right; width: 180px;">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in paginatedApplications" :key="app.id">
                <td>
                  <strong class="table-code-blue">{{ app.application_number }}</strong>
                  <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">
                    {{ app.created_at?.slice(0, 10) }}
                  </div>
                </td>
                <td>
                  <span class="badge badge-occupied">
                    แผง {{ app.stall_number }}
                  </span>
                  <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">
                    ฿{{ Number(app.stall_monthly_rate).toLocaleString() }}/ด. ({{ app.requested_period_months }} เดือน)
                  </div>
                </td>
                <td>
                  <div style="font-weight: 600; color: #1e293b;">{{ app.applicant_name }}</div>
                  <div style="font-size: 0.78rem; color: #64748b;">{{ app.applicant_phone }}</div>
                </td>
                <td>
                  <div style="font-weight: 600; color: #1e293b;">{{ app.shop_name }}</div>
                  <div style="font-size: 0.78rem; color: #94a3b8;">{{ app.product_type || '-' }}</div>
                </td>
                <td style="color: #475569;">{{ app.requested_start_date }}</td>
                <td>
                  <span class="status-pill-badge" :class="getStatusBadgeClass(app.status)">
                    {{ getStatusLabel(app.status) }}
                  </span>
                  <div v-if="app.officer_comment" style="font-size: 0.73rem; color: #475569; margin-top: 3px;">
                    จนท: {{ app.officer_comment }}
                  </div>
                  <div v-if="app.market_director_comment" style="font-size: 0.73rem; color: #4f46e5; margin-top: 2px;">
                    ผอ.ตลาด: {{ app.market_director_comment }}
                  </div>
                  <div v-if="app.bureau_director_comment" style="font-size: 0.73rem; color: #059669; margin-top: 2px;">
                    ผอ.สำนัก: {{ app.bureau_director_comment }}
                  </div>
                </td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 6px;">
                    <!-- Step 1: Officer Review -->
                    <button
                      v-if="app.status === 'pending_officer'"
                      class="btn-table-action btn-table-primary"
                      @click="processApproval(app, 'เจ้าหน้าที่ตรวจสอบเอกสารครบถ้วน ส่งต่อ ผอ.ตลาด')"
                      title="เจ้าหน้าที่ตรวจสอบ"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>ตรวจแล้ว</span>
                    </button>

                    <!-- Step 2: Market Director Review -->
                    <button
                      v-else-if="app.status === 'pending_market_director'"
                      class="btn-table-action btn-table-primary"
                      @click="processApproval(app, 'ผอ.ตลาด พิจารณาอนุมัติคำร้อง')"
                      title="ผอ.ตลาด อนุมัติ"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>ผอ. อนุมัติ</span>
                    </button>

                    <!-- Step 3: Bureau Director Review -->
                    <button
                      v-else-if="app.status === 'pending_bureau_director'"
                      class="btn-table-action btn-table-primary"
                      @click="processApproval(app, 'ผอ.สำนักตลาด พิจารณาอนุมัติคำร้องเรียบร้อย')"
                      title="ผอ.สำนัก อนุมัติ"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>ผอ.สำนัก</span>
                    </button>

                    <!-- Final: Approved -> Generate Contract -->
                    <NuxtLink
                      v-else-if="app.status === 'approved'"
                      :to="`/contracts?new_for_stall=${app.stall_id}`"
                      class="btn-table-action btn-table-primary"
                      title="จัดทำสัญญาเช่า"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      <span>ทำสัญญา</span>
                    </NuxtLink>

                    <!-- Reject / Request Revision -->
                    <button
                      v-if="['pending_officer', 'pending_market_director', 'pending_bureau_director'].includes(app.status)"
                      class="btn-table-action btn-table-cancel"
                      @click="rejectApp(app)"
                      title="ส่งกลับแก้ไข / ไม่อนุมัติ"
                    >
                      <span>ไม่อนุมัติ</span>
                    </button>

                    <!-- Clean Edit/Detail Icon per mockup -->
                    <button
                      class="btn-table-icon-edit"
                      title="ดูรายละเอียด/จัดการคำร้อง"
                      @click="openDetails(app)"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredApplications.length === 0">
                <td colspan="7" style="text-align: center; color: #94a3b8; padding: 48px;">
                  ไม่พบรายการคำร้องขอเช่าตามเงื่อนไขที่ค้นหา
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Standard Table Pagination Footer (Mockup Standard) -->
        <div v-if="filteredApplications.length > 0" class="table-pagination-bar">
          <div class="table-page-jump">
            <span>หน้า</span>
            <select v-model="currentPage" class="table-page-select">
              <option v-for="p in totalPages" :key="p" :value="p">{{ p }}</option>
            </select>
            <span>จาก {{ totalPages || 1 }}</span>
          </div>

          <div class="table-page-nav">
            <button class="table-page-btn" :disabled="currentPage === 1" @click="currentPage = 1">«</button>
            <button class="table-page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
            <button
              v-for="p in visiblePages"
              :key="p"
              class="table-page-btn"
              :class="{ active: currentPage === p }"
              @click="currentPage = p"
            >
              {{ p }}
            </button>
            <button class="table-page-btn" :disabled="currentPage === totalPages || totalPages === 0" @click="currentPage++">›</button>
            <button class="table-page-btn" :disabled="currentPage === totalPages || totalPages === 0" @click="currentPage = totalPages">»</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { get, post } = useApi()
const { showAlert, showConfirm, showSuccess, showError } = useAppAlert()

const loading = ref(true)
const applications = ref<any[]>([])
const searchQuery = ref('')
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)

const loadApplications = async () => {
  loading.value = true
  try {
    applications.value = await get('/applications')
  } catch (err) {
    console.error('Failed to load applications:', err)
  } finally {
    loading.value = false
  }
}

const countByStatus = (status: string) => {
  return applications.value.filter(a => a.status === status).length
}

const filteredApplications = computed(() => {
  let list = applications.value

  if (activeTab.value !== 'all') {
    if (activeTab.value === 'rejected') {
      list = list.filter(a => a.status === 'rejected' || a.status === 'revision_required')
    } else {
      list = list.filter(a => a.status === activeTab.value)
    }
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(a =>
      (a.application_number && a.application_number.toLowerCase().includes(q)) ||
      (a.applicant_name && a.applicant_name.toLowerCase().includes(q)) ||
      (a.shop_name && a.shop_name.toLowerCase().includes(q)) ||
      (a.stall_number && a.stall_number.toLowerCase().includes(q))
    )
  }

  return list
})

const totalPages = computed(() => {
  return Math.ceil(filteredApplications.value.length / pageSize.value) || 1
})

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredApplications.value.slice(start, start + pageSize.value)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const cur = currentPage.value

  let start = Math.max(1, cur - 2)
  let end = Math.min(total, cur + 2)

  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else if (end === total) start = Math.max(1, end - 4)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const processApproval = async (app: any, defaultComment: string) => {
  const confirmed = await showConfirm(
    `ยืนยันการอนุมัติคำร้อง ${app.application_number} (ผู้ยื่น: ${app.applicant_name}) ใช่หรือไม่?`,
    {
      title: 'ยืนยันพิจารณาอนุมัติ',
      type: 'info',
      confirmText: 'อนุมัติคำร้อง',
      cancelText: 'ยกเลิก'
    }
  )
  if (!confirmed) return

  try {
    await post(`/applications/${app.id}/action`, {
      action: 'approve',
      comment: defaultComment
    })
    await loadApplications()
    await showSuccess('บันทึกผลการอนุมัติเรียบร้อยแล้ว', 'อนุมัติสำเร็จ')
  } catch (err: any) {
    await showError(err?.data?.detail || 'เกิดข้อผิดพลาดในการอนุมัติ', 'ข้อผิดพลาด')
  }
}

const rejectApp = async (app: any) => {
  const confirmed = await showConfirm(
    `คุณต้องการไม่อนุมัติคำร้อง ${app.application_number} (ผู้ยื่น: ${app.applicant_name}) หรือไม่?`,
    {
      title: 'ยืนยันปฏิเสธคำร้อง',
      type: 'error',
      icon: 'trash',
      confirmText: 'ปฏิเสธคำร้อง',
      cancelText: 'ยกเลิก'
    }
  )
  if (!confirmed) return

  try {
    await post(`/applications/${app.id}/action`, {
      action: 'reject',
      comment: 'ไม่อนุมัติคำร้อง'
    })
    await loadApplications()
    await showSuccess('บันทึกการปฏิเสธคำร้องเรียบร้อยแล้ว', 'สำเร็จ')
  } catch (err: any) {
    await showError(err?.data?.detail || 'เกิดข้อผิดพลาดในการปฏิเสธคำร้อง', 'ข้อผิดพลาด')
  }
}

const openDetails = async (app: any) => {
  await showAlert(
    `เลขที่คำร้อง: ${app.application_number}\nผู้ยื่น: ${app.applicant_name}\nร้านค้า: ${app.shop_name}\nแผง: ${app.stall_number}\nสถานะ: ${getStatusLabel(app.status)}`,
    { title: 'รายละเอียดคำร้องขอเช่า', type: 'info' }
  )
}

const exportReport = async () => {
  await showSuccess(`ส่งออกรายงานคำร้องขอเช่าแผง ${filteredApplications.value.length} รายการ เรียบร้อยแล้ว`, 'ส่งออกรายงาน')
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending_officer':
    case 'pending_market_director':
    case 'pending_bureau_director':
      return 'badge-soft-blue'
    case 'approved':
      return 'badge-soft-success'
    case 'revision_required':
      return 'badge-soft-warning'
    case 'rejected':
      return 'badge-soft-danger'
    default:
      return 'badge-soft-gray'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending_officer': return 'รอ จนท. ตรวจสอบ'
    case 'pending_market_director': return 'รอ ผอ.ตลาด อนุมัติ'
    case 'pending_bureau_director': return 'รอ ผอ.สำนัก อนุมัติ'
    case 'approved': return 'อนุมัติแล้ว'
    case 'revision_required': return 'ส่งกลับแก้ไข'
    case 'rejected': return 'ไม่อนุมัติ'
    default: return status
  }
}

onMounted(() => {
  loadApplications()
})
</script>
