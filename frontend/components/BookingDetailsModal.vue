<template>
  <div v-if="show && booking" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content" style="max-width: 640px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 700;">รายละเอียดการจองดูแผงค้า (Booking Details)</h3>
            <div style="font-size: 0.8rem; color: var(--primary);">เลขที่การจอง: {{ booking.booking_number }}</div>
          </div>
        </div>
        <button class="btn-logout" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Status Banner -->
        <div style="padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;" :class="getStatusBannerClass(booking.status)">
          <div>
            <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 600; opacity: 0.85;">สถานะปัจจุบัน</div>
            <div style="font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 8px; margin-top: 2px;">
              <span class="badge-dot"></span>
              <span>{{ getStatusLabel(booking.status) }}</span>
            </div>
          </div>
          <div style="text-align: right; font-size: 0.8rem;">
            <div>จองเมื่อ: {{ booking.created_at?.slice(0, 10) }}</div>
            <div v-if="booking.reviewed_at" style="color: #34d399;">อนุมัติเมื่อ: {{ booking.reviewed_at?.slice(0, 10) }}</div>
          </div>
        </div>

        <!-- Flow Progress Indicator -->
        <div class="flow-steps">
          <div class="flow-step" :class="{ done: true, active: booking.status === 'pending_approval' }">
            <div class="step-num">1</div>
            <div class="step-txt">จองดูแผง</div>
          </div>
          <div class="flow-step-line" :class="{ done: isStepPassed(booking.status, 2) }"></div>
          <div class="flow-step" :class="{ done: isStepPassed(booking.status, 2), active: booking.status === 'approved' }">
            <div class="step-num">2</div>
            <div class="step-txt">จนท. อนุมัติ</div>
          </div>
          <div class="flow-step-line" :class="{ done: isStepPassed(booking.status, 3) }"></div>
          <div class="flow-step" :class="{ done: isStepPassed(booking.status, 3), active: booking.status === 'visited' }">
            <div class="step-num">3</div>
            <div class="step-txt">ชมแผงหน้างาน</div>
          </div>
          <div class="flow-step-line" :class="{ done: isStepPassed(booking.status, 4) }"></div>
          <div class="flow-step" :class="{ done: isStepPassed(booking.status, 4), active: booking.status === 'lease_applied' }">
            <div class="step-num">4</div>
            <div class="step-txt">ยื่นคำร้องขอเช่า</div>
          </div>
        </div>

        <!-- 1. Stall Details -->
        <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--radius-md); margin-bottom: 18px;">
          <h4 style="font-size: 0.88rem; color: var(--primary); font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>ข้อมูลแผงที่จองเข้าชม</span>
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.88rem;">
            <div>เลขที่แผง: <strong style="color: #0f172a; font-size: 1.05rem;">{{ booking.stall_number }}</strong></div>
            <div>หมวดสินค้า: <strong style="color: #334155;">{{ booking.stall_category }}</strong></div>
            <div>โซนตลาด: <strong style="color: #334155;">{{ booking.stall_zone_name || '-' }}</strong></div>
            <div>อัตราค่าเช่า: <strong style="color: #059669;">฿{{ Number(booking.stall_monthly_rate || 0).toLocaleString() }}/เดือน</strong></div>
          </div>
        </div>

        <!-- 2. Appointment Details -->
        <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--radius-md); margin-bottom: 18px;">
          <h4 style="font-size: 0.88rem; color: var(--primary); font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>วันและเวลาที่นัดหมายเข้าดูแผง</span>
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.88rem;">
            <div>วันนัดหมาย: <strong style="color: #0f172a;">{{ booking.visit_date }}</strong></div>
            <div>ช่วงเวลา: <strong style="color: #0f172a;">{{ booking.visit_time_slot }}</strong></div>
            <div style="grid-column: 1 / -1;">สินค้าที่ต้องการจำหน่าย: <strong style="color: #334155;">{{ booking.intended_business || '-' }}</strong></div>
          </div>
          <div v-if="booking.officer_notes" style="margin-top: 10px; padding: 10px 14px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; font-size: 0.85rem; color: #065f46; display: flex; align-items: flex-start; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <div><strong>บันทึกจากเจ้าหน้าที่:</strong> {{ booking.officer_notes }}</div>
          </div>
          <div v-if="booking.rejection_reason" style="margin-top: 10px; padding: 10px 14px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; font-size: 0.85rem; color: #9f1239; display: flex; align-items: flex-start; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div><strong>เหตุผลที่ไม่อนุมัติ:</strong> {{ booking.rejection_reason }}</div>
          </div>
        </div>

        <!-- 3. Tenant Details -->
        <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--radius-md); margin-bottom: 14px;">
          <h4 style="font-size: 0.88rem; color: var(--primary); font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>ข้อมูลผู้ขอจองเข้าชม</span>
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.88rem;">
            <div>ชื่อ-นามสกุล: <strong style="color: #0f172a;">{{ booking.tenant_name }}</strong></div>
            <div>เบอร์โทรศัพท์: <strong style="color: #0f172a;">{{ booking.tenant_phone }}</strong></div>
            <div>อีเมล: <strong style="color: #334155;">{{ booking.tenant_email || '-' }}</strong></div>
            <div>เลขบัตรประชาชน: <strong style="color: #334155;">{{ booking.tenant_id_card || '-' }}</strong></div>
          </div>
        </div>
      </div>

      <div class="modal-footer" style="justify-content: space-between;">
        <button class="btn btn-secondary" @click="$emit('close')">ปิดหน้าต่าง</button>

        <div style="display: flex; gap: 8px;">
          <!-- If visited -> Button to apply lease -->
          <button
            v-if="booking.status === 'visited'"
            class="btn btn-primary"
            style="display: inline-flex; align-items: center; gap: 6px;"
            @click="$emit('applyLease', booking)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            <span>ยื่นคำร้องขอเช่าแผงนี้ทันที</span>
          </button>

          <!-- If approved -> Button to mark as visited -->
          <button
            v-else-if="booking.status === 'approved'"
            class="btn btn-primary"
            style="display: inline-flex; align-items: center; gap: 6px;"
            @click="$emit('markVisited', booking)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>ยืนยันว่าได้เข้าชมแผงแล้ว</span>
          </button>

          <!-- If pending -> Buttons to approve or reject directly -->
          <template v-if="booking.status === 'pending_approval'">
            <button
              class="btn btn-danger"
              @click="$emit('reject', booking)"
            >
              ✕ ไม่อนุมัติ
            </button>
            <button
              class="btn btn-primary"
              @click="$emit('approve', booking)"
            >
              ✓ อนุมัตินัดหมาย
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  booking: any
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'applyLease', booking: any): void
  (e: 'markVisited', booking: any): void
  (e: 'approve', booking: any): void
  (e: 'reject', booking: any): void
}>()

const isStepPassed = (status: string, step: number) => {
  if (step === 2) {
    return ['approved', 'visited', 'lease_applied'].includes(status)
  }
  if (step === 3) {
    return ['visited', 'lease_applied'].includes(status)
  }
  if (step === 4) {
    return ['lease_applied'].includes(status)
  }
  return false
}

const getStatusBannerClass = (status: string) => {
  switch (status) {
    case 'pending_approval': return 'banner-pending'
    case 'approved': return 'banner-approved'
    case 'visited': return 'banner-visited'
    case 'lease_applied': return 'banner-applied'
    case 'rejected':
    case 'cancelled': return 'banner-rejected'
    default: return ''
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending_approval': return 'รอเจ้าหน้าที่อนุมัติวันเข้าชม'
    case 'approved': return 'นัดหมายสำเร็จ (รอเข้าชมแผงหน้างาน)'
    case 'visited': return 'ชมแผงแล้ว (พร้อมยื่นคำร้องขอเช่า)'
    case 'lease_applied': return 'ยื่นคำร้องขอเช่าเรียบร้อยแล้ว'
    case 'rejected': return 'ไม่อนุมัติวันเข้าชม'
    case 'cancelled': return 'ยกเลิกการจอง'
    default: return status
  }
}
</script>

<style scoped>
.banner-pending {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #b45309;
}
.banner-approved {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #059669;
}
.banner-visited {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #2563eb;
}
.banner-applied {
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  color: #7c3aed;
}
.banner-rejected {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
}

/* Flow steps timeline */
.flow-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 0 10px;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  border: 2px solid #cbd5e1;
  transition: var(--transition);
}

.flow-step.done .step-num {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.flow-step.active .step-num {
  border-color: var(--primary);
  color: var(--primary);
  background: #eff6ff;
  box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.15);
  transform: scale(1.05);
}

.step-txt {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.flow-step.done .step-txt {
  color: var(--primary);
  font-weight: 700;
}

.flow-step-line {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin: 0 8px -14px;
}

.flow-step-line.done {
  background: var(--primary);
}
</style>
