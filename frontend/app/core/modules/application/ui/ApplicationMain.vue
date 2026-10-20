<template>
  <div>
    <AppHeader />

    <div class="content-body">
      <!-- Breadcrumb Navigation at top of section body -->
      <AppBreadcrumb current="คำร้องขอเช่าแผงค้า" backTo="/">
        <template #actions>
          <NuxtLink to="/bookings" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>ไปที่รายการจองดูแผง</span>
          </NuxtLink>
        </template>
      </AppBreadcrumb>
      <!-- Loading State -->
      <div v-if="loading" style="text-align: center; padding: 60px;">
        <div style="font-size: 1rem; color: #64748b; display: inline-flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>กำลังโหลดรายการคำร้องขอเช่า...</span>
        </div>
      </div>

      <div v-else class="card">
        <div class="card-header">
          <div class="card-title" style="display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            <span>รายการคำร้องขอเช่าแผงทั้งหมด ({{ applications.length }})</span>
          </div>
          <button class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 5px;" @click="loadApplications">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            <span>รีเฟรช</span>
          </button>
        </div>

        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>เลขที่คำร้อง</th>
                <th>แผงที่ขอเช่า</th>
                <th>ผู้ยื่นคำร้อง</th>
                <th>ชื่อร้าน / สินค้าที่ขาย</th>
                <th>วันที่ประสงค์เริ่มเช่า</th>
                <th>สถานะการพิจารณา</th>
                <th style="text-align: right;">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in applications" :key="app.id">
                <td>
                  <strong style="color: var(--primary);">{{ app.application_number }}</strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">
                    {{ app.created_at?.slice(0, 10) }}
                  </div>
                </td>
                <td>
                  <span class="badge badge-occupied">
                    แผง {{ app.stall_number }}
                  </span>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                    ฿{{ Number(app.stall_monthly_rate).toLocaleString() }}/ด. ({{ app.requested_period_months }} เดือน)
                  </div>
                </td>
                <td>
                  <div><strong>{{ app.applicant_name }}</strong></div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">{{ app.applicant_phone }}</div>
                </td>
                <td>
                  <div><strong>{{ app.shop_name }}</strong></div>
                  <div style="font-size: 0.78rem; color: var(--text-dim);">{{ app.product_type || '-' }}</div>
                </td>
                <td>{{ app.requested_start_date }}</td>
                <td>
                  <span :class="getStatusBadgeClass(app.status)">
                    <span class="badge-dot"></span>
                    {{ getStatusLabel(app.status) }}
                  </span>
                  <div v-if="app.officer_comment" style="font-size: 0.75rem; color: #475569; margin-top: 3px; font-weight: 500;">
                    จนท: {{ app.officer_comment }}
                  </div>
                  <div v-if="app.market_director_comment" style="font-size: 0.75rem; color: #4f46e5; margin-top: 2px; font-weight: 500;">
                    ผอ.ตลาด: {{ app.market_director_comment }}
                  </div>
                  <div v-if="app.bureau_director_comment" style="font-size: 0.75rem; color: #059669; margin-top: 2px; font-weight: 500;">
                    ผอ.สำนัก: {{ app.bureau_director_comment }}
                  </div>
                </td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; gap: 6px;">
                    <!-- Step 1: Officer Review -->
                    <button
                      v-if="app.status === 'pending_officer'"
                      class="btn btn-sm btn-primary"
                      @click="processApproval(app, 'เจ้าหน้าที่ตรวจสอบเอกสารครบถ้วน ส่งต่อ ผอ.ตลาด')"
                    >
                      ✓ จนท. ตรวจสอบ
                    </button>

                    <!-- Step 2: Market Director Review -->
                    <button
                      v-else-if="app.status === 'pending_market_director'"
                      class="btn btn-sm btn-primary"
                      style="background: linear-gradient(135deg, #6366f1, #8b5cf6);"
                      @click="processApproval(app, 'ผอ.ตลาด พิจารณาอนุมัติคำร้อง')"
                    >
                      ✓ ผอ.ตลาด อนุมัติ
                    </button>

                    <!-- Step 3: Bureau Director Review -->
                    <button
                      v-else-if="app.status === 'pending_bureau_director'"
                      class="btn btn-sm btn-primary"
                      style="background: linear-gradient(135deg, #059669, #10b981);"
                      @click="processApproval(app, 'ผอ.สำนักตลาด พิจารณาอนุมัติคำร้องเรียบร้อย')"
                    >
                      ✓ ผอ.สำนัก อนุมัติ
                    </button>

                    <!-- Final: Approved -> Generate Contract -->
                    <NuxtLink
                      v-else-if="app.status === 'approved'"
                      :to="`/contracts?new_for_stall=${app.stall_id}`"
                      class="btn btn-sm btn-primary"
                      style="display: inline-flex; align-items: center; gap: 5px;"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      <span>จัดทำสัญญาเช่า</span>
                    </NuxtLink>

                    <!-- Reject / Request Revision -->
                    <button
                      v-if="['pending_officer', 'pending_market_director', 'pending_bureau_director'].includes(app.status)"
                      class="btn btn-sm btn-danger"
                      @click="rejectApp(app)"
                    >
                      ส่งแก้ไข/ไม่อนุมัติ
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="applications.length === 0">
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
                  ยังไม่มีคำร้องขอเช่าแผงในระบบ
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { get, post } = useApi()

const loading = ref(true)
const applications = ref<any[]>([])

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

const processApproval = async (app: any, defaultComment: string) => {
  const comment = prompt('บันทึกความเห็นการอนุมัติ (Comment):', defaultComment)
  if (comment === null) return

  try {
    await post(`/applications/${app.id}/action`, {
      action: 'approve',
      comment: comment || defaultComment
    })
    await loadApplications()
    alert('บันทึกผลการอนุมัติเรียบร้อยแล้ว')
  } catch (err: any) {
    alert(err?.data?.detail || 'เกิดข้อผิดพลาด')
  }
}

const rejectApp = async (app: any) => {
  const reason = prompt('ระบุเหตุผลในการไม่อนุมัติ / ส่งกลับแก้ไข:')
  if (!reason || !reason.trim()) return

  try {
    await post(`/applications/${app.id}/action`, {
      action: 'reject',
      comment: reason.trim()
    })
    await loadApplications()
  } catch (err: any) {
    alert(err?.data?.detail || 'เกิดข้อผิดพลาด')
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending_officer': return 'badge badge-reserved'
    case 'pending_market_director': return 'badge badge-occupied'
    case 'pending_bureau_director': return 'badge badge-occupied'
    case 'approved': return 'badge badge-available'
    case 'revision_required': return 'badge badge-maintenance'
    case 'rejected': return 'badge badge-maintenance'
    default: return 'badge'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending_officer': return '1. รอ จนท. ตรวจสอบ'
    case 'pending_market_director': return '2. รอ ผอ.ตลาด อนุมัติ'
    case 'pending_bureau_director': return '3. รอ ผอ.สำนักตลาด อนุมัติ'
    case 'approved': return 'อนุมัติแล้ว (พร้อมทำสัญญา)'
    case 'revision_required': return 'ส่งกลับแก้ไข'
    case 'rejected': return 'ไม่อนุมัติ'
    default: return status
  }
}

onMounted(() => {
  loadApplications()
})
</script>
