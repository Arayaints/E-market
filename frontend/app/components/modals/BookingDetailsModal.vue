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
        <button class="btn-logout" @click="$emit('close')" aria-label="ปิด">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Status Banner -->
        <div class="modal-status-banner" :class="getStatusBannerClass(booking.status)">
          <div>
            <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 600; opacity: 0.85;">สถานะปัจจุบัน</div>
            <div style="font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 8px; margin-top: 2px;">
              <span class="badge-dot"></span>
              <span>{{ getStatusLabel(booking.status) }}</span>
            </div>
          </div>
          <div class="modal-status-dates" style="text-align: right; font-size: 0.8rem;">
            <div>จองเมื่อ: {{ booking.created_at?.slice(0, 10) }}</div>
            <div v-if="booking.reviewed_at" style="color: #34d399;">อนุมัติเมื่อ: {{ booking.reviewed_at?.slice(0, 10) }}</div>
          </div>
        </div>

        <!-- Flow Progress Indicator (3-Step Lifecycle) -->
        <div class="flow-steps">
          <div class="flow-step" :class="{ done: true, active: isStepActive(booking.status, 1) }">
            <div class="step-num">1</div>
            <div class="step-txt">จองดูแผง</div>
          </div>
          <div class="flow-step-line" :class="{ done: isStepPassed(booking.status, 2) }"></div>
          <div class="flow-step" :class="{ done: isStepPassed(booking.status, 2), active: isStepActive(booking.status, 2) }">
            <div class="step-num">2</div>
            <div class="step-txt">นัดชมแผง</div>
          </div>
          <div class="flow-step-line" :class="{ done: isStepPassed(booking.status, 3) }"></div>
          <div class="flow-step" :class="{ done: isStepPassed(booking.status, 3), active: isStepActive(booking.status, 3) }">
            <div class="step-num">3</div>
            <div class="step-txt">{{ isStepPassed(booking.status, 3) ? 'ยื่นคำร้องสำเร็จ' : 'ยื่นคำร้องขอเช่า' }}</div>
          </div>
        </div>

        <!-- Waiting Queue Banner if in queue -->
        <div v-if="booking.status === 'waiting_queue'" class="queue-notice-banner" style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #fef3c7; color: #b45309; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; flex-shrink: 0;">
              {{ booking.queue_position || 1 }}
            </div>
            <div>
              <div style="font-weight: 700; color: #92400e;">คุณอยู่คิวลำดับที่ {{ booking.queue_position || 1 }} ของแผง {{ booking.stall_number }}</div>
              <div style="font-size: 0.8rem; color: #b45309;">เข้าคิวเมื่อ {{ booking.waiting_since?.slice(0, 10) || booking.created_at?.slice(0, 10) }} (มีผู้รอก่อนหน้า {{ Math.max(0, (booking.queue_position || 1) - 1) }} ราย)</div>
            </div>
          </div>
          <span style="font-size: 0.78rem; background: #ffffff; padding: 4px 10px; border-radius: 20px; border: 1px solid #fde68a; color: #92400e; font-weight: 600;">
            ระบบขยับคิวอัตโนมัติ
          </span>
        </div>

        <!-- 1. Stall Details -->
        <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--radius-md); margin-bottom: 18px;">
          <h4 style="font-size: 0.88rem; color: var(--primary); font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>ข้อมูลแผงและตลาด</span>
          </h4>
          <div class="modal-info-grid">
            <div>ตลาด: <strong style="color: #0f172a;">{{ booking.market_name }}</strong></div>
            <div>เลขที่แผง: <strong style="color: #2563eb; font-size: 1.05rem;">{{ booking.stall_number }}</strong></div>
            <div>โซนตลาด: <strong style="color: #334155;">{{ booking.stall_zone_name || '-' }}</strong></div>
            <div>อัตราค่าเช่า: <strong style="color: #059669;">฿{{ Number(booking.stall_monthly_rate || 0).toLocaleString() }}/เดือน</strong></div>
          </div>
        </div>

        <!-- 2. Appointment Details -->
        <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--radius-md); margin-bottom: 18px;">
          <h4 style="font-size: 0.88rem; color: var(--primary); font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>ข้อมูลการนัดหมายและการประสานงาน</span>
          </h4>
          <div class="modal-info-grid">
            <div>วันนัดหมาย: <strong style="color: #0f172a;">{{ booking.visit_date || 'ยังไม่ได้ระบุ (รอถึงคิว)' }}</strong></div>
            <div>ช่วงเวลา: <strong style="color: #0f172a;">{{ booking.visit_time_slot || '-' }}</strong></div>
            <div class="grid-col-full">จุดนัดพบ: <strong style="color: #0f172a;">{{ booking.meeting_point || 'หน้ากองอำนวยการตลาด เสาธง 1' }}</strong></div>
            <div class="grid-col-full">จนท. ผู้พาชม: <strong style="color: #2563eb;">{{ booking.escort_officer || 'เจ้าหน้าที่เวรฝ่ายปฏิบัติการ' }}</strong></div>
            <div class="grid-col-full">สินค้าที่ต้องการจำหน่าย: <strong style="color: #334155;">{{ booking.intended_business || '-' }}</strong></div>
          </div>
          <div v-if="booking.officer_notes" style="margin-top: 10px; padding: 10px 14px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; font-size: 0.85rem; color: #065f46; display: flex; align-items: flex-start; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <div><strong>บันทึกจากเจ้าหน้าที่:</strong> {{ booking.officer_notes }}</div>
          </div>
          <div v-if="booking.rejection_reason" style="margin-top: 10px; padding: 10px 14px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; font-size: 0.85rem; color: #9f1239; display: flex; align-items: flex-start; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div><strong>เหตุผลที่ไม่อนุมัติ:</strong> {{ booking.rejection_reason }}</div>
          </div>
          <div v-if="booking.not_interested_reason" style="margin-top: 10px; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; color: #475569; display: flex; align-items: flex-start; gap: 8px;">
            <div><strong>เหตุผลที่ไม่สนใจเช่า:</strong> {{ booking.not_interested_reason }}</div>
          </div>
        </div>

        <!-- 3. Tenant Details -->
        <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--radius-md); margin-bottom: 18px;">
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

        <!-- 4. Audit Log Timeline (Rule 5: บันทึก log ผู้กระทำ, เวลา, หมายเหตุ ทุกขั้นตอน) -->
        <div style="background: #ffffff; border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--radius-md); margin-bottom: 14px;">
          <h4 style="font-size: 0.88rem; color: var(--primary); font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>ประวัติไทม์ไลน์และบันทึกการดำเนินการ (Audit Logs)</span>
          </h4>
          <div v-if="booking.timeline && booking.timeline.length > 0" class="audit-timeline">
            <div v-for="(log, idx) in booking.timeline" :key="idx" class="timeline-entry">
              <div class="timeline-bullet" :class="getRoleClass(log.actor_role)"></div>
              <div class="timeline-content">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                  <span style="font-weight: 700; font-size: 0.85rem; color: #0f172a;">{{ log.action }}</span>
                  <span style="font-size: 0.72rem; color: #64748b;">{{ log.timestamp?.slice(0, 16).replace('T', ' ') }} น.</span>
                </div>
                <div style="font-size: 0.75rem; color: #475569; margin-top: 2px; display: flex; align-items: center; gap: 6px;">
                  <span class="role-tag" :class="getRoleClass(log.actor_role)">{{ getActorRoleName(log.actor_role) }}</span>
                  <span>{{ log.actor_name }}</span>
                </div>
                <div v-if="log.note" style="font-size: 0.78rem; color: #334155; margin-top: 4px; background: #f8fafc; padding: 4px 8px; border-radius: 6px; border: 1px solid #f1f5f9;">
                  {{ log.note }}
                </div>
              </div>
            </div>
          </div>
          <div v-else style="font-size: 0.8rem; color: #94a3b8; text-align: center; padding: 12px;">
            ไม่มีประวัติเพิ่มเติม
          </div>
        </div>
      </div>

      <div class="modal-footer" style="justify-content: space-between; flex-wrap: wrap; gap: 10px;">
        <button class="btn btn-secondary" @click="$emit('close')">ปิดหน้าต่าง</button>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <!-- OFFICER ROLE ACTIONS -->
          <template v-if="role === 'officer'">
            <template v-if="booking.status === 'pending_approval' || booking.status === 'pending'">
              <button class="btn btn-danger btn-sm" @click="$emit('reject', booking)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                <span>ไม่อนุมัติ</span>
              </button>
              <button class="btn btn-primary btn-sm" @click="$emit('approve', booking)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>อนุมัตินัดหมาย</span>
              </button>
            </template>
            <template v-else-if="booking.status === 'approved'">
              <button class="btn btn-danger btn-sm" @click="$emit('cancel', booking)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                <span>ยกเลิก</span>
              </button>
              <button class="btn btn-success btn-sm" @click="$emit('markVisited', booking)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>ยืนยันการเช่า</span>
              </button>
            </template>
          </template>

          <!-- TENANT ROLE ACTIONS -->
          <template v-else>
            <template v-if="['approved', 'pending_approval', 'pending', 'waiting_queue', 'pending_slot'].includes(booking.status)">
              <button class="btn btn-outline-danger btn-sm" @click="$emit('cancel', booking)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                <span>ยกเลิก</span>
              </button>
            </template>
            <template v-else-if="booking.status === 'interested'">
              <button class="btn btn-primary btn-sm" @click="$emit('applyLease', booking)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>ยื่นคำร้องขอเช่าแผงนี้ทันที</span>
              </button>
            </template>
            <template v-else-if="booking.status === 'lease_applied'">
              <NuxtLink to="/applications" class="btn btn-primary btn-sm" @click="$emit('close')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span>ดูสถานะคำร้องขอเช่า ({{ booking.application_number || 'APP' }})</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </NuxtLink>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  show: boolean
  booking: any
  role?: 'tenant' | 'officer'
}>(), {
  role: 'tenant'
})

defineEmits<{
  (e: 'close'): void
  (e: 'applyLease', booking: any): void
  (e: 'markVisited', booking: any): void
  (e: 'noShow', booking: any): void
  (e: 'cancel', booking: any): void
  (e: 'approve', booking: any): void
  (e: 'reject', booking: any): void
  (e: 'confirmInterest', booking: any): void
  (e: 'notInterested', booking: any): void
  (e: 'recordProxy', booking: any): void
}>()

const isStepPassed = (status: string, step: number) => {
  if (step === 2) {
    return ['approved', 'interested', 'lease_applied', 'completed'].includes(status)
  }
  if (step === 3) {
    return ['lease_applied', 'completed'].includes(status)
  }
  return false
}

const isStepActive = (status: string, step: number) => {
  if (step === 1) return ['waiting_queue', 'pending_slot', 'pending_approval', 'pending'].includes(status)
  if (step === 2) return status === 'approved'
  if (step === 3) return ['interested'].includes(status)
  return false
}

const getStatusBannerClass = (status: string) => {
  switch (status) {
    case 'waiting_queue': return 'banner-queue'
    case 'pending_slot': return 'banner-slot'
    case 'pending_approval': return 'banner-pending'
    case 'approved': return 'banner-approved'
    case 'pending_decision': return 'banner-decision'
    case 'interested': return 'banner-interested'
    case 'lease_applied': return 'banner-applied'
    case 'no_show':
    case 'rejected':
    case 'not_interested':
    case 'cancelled': return 'banner-rejected'
    default: return ''
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'waiting_queue': return 'รอคิว (ต่อคิวแผงติดจอง)'
    case 'pending_slot': return 'ถึงคิวแล้ว (รอเลือกวันนัดชม)'
    case 'pending_approval':
    case 'pending': return 'รอเจ้าหน้าที่อนุมัติ'
    case 'approved': return 'นัดหมายสำเร็จ'
    case 'pending_decision': return 'รอผู้เช่ายื่นคำร้อง'
    case 'interested': return 'รอผู้เช่ายื่นคำร้อง'
    case 'lease_applied': return 'ยื่นคำร้องสำเร็จ'
    case 'completed': return 'ยื่นคำร้องสำเร็จ'
    case 'no_show': return 'ไม่มาตามนัดหมาย (สละสิทธิ์)'
    case 'rejected': return 'ไม่อนุมัติ (ยกเลิก)'
    case 'not_interested': return 'ไม่สนใจเช่า (สละสิทธิ์)'
    case 'cancelled': return 'ยกเลิกการจอง'
    default: return status
  }
}

const getActorRoleName = (role: string) => {
  if (role === 'officer') return 'เจ้าหน้าที่'
  if (role === 'system') return 'ระบบ'
  return 'ผู้เช่า'
}

const getRoleClass = (role: string) => {
  if (role === 'officer') return 'role-officer'
  if (role === 'system') return 'role-system'
  return 'role-tenant'
}
</script>

<style scoped>
.banner-queue {
  background: #fefce8;
  border: 1px solid #fef08a;
  color: #854d0e;
}
.banner-slot {
  background: #fdf4ff;
  border: 1px solid #f5d0fe;
  color: #86198f;
}
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
.banner-decision {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}
.banner-interested {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
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

/* Audit log timeline styling */
.audit-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  padding-left: 8px;
}
.timeline-entry {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
}
.timeline-bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.timeline-bullet.role-tenant { background: #3b82f6; box-shadow: 0 0 0 3px #dbeafe; }
.timeline-bullet.role-officer { background: #10b981; box-shadow: 0 0 0 3px #d1fae5; }
.timeline-bullet.role-system { background: #8b5cf6; box-shadow: 0 0 0 3px #ede9fe; }

.timeline-content {
  flex: 1;
}

.role-tag {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
}
.role-tag.role-tenant { background: #eff6ff; color: #2563eb; }
.role-tag.role-officer { background: #ecfdf5; color: #059669; }
.role-tag.role-system { background: #f5f3ff; color: #7c3aed; }

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

/* Modal Responsive Classes */
.modal-status-banner {
  padding: 16px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.modal-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  font-size: 0.88rem;
}

.grid-col-full {
  grid-column: 1 / -1;
}

@media (max-width: 600px) {
  .flow-steps {
    padding: 0 4px;
    margin-bottom: 16px;
  }
  .step-num {
    width: 26px;
    height: 26px;
    font-size: 0.75rem;
  }
  .step-txt {
    font-size: 0.68rem;
    text-align: center;
    max-width: 64px;
    line-height: 1.25;
  }
  .flow-step-line {
    margin: 0 4px -14px;
  }
  .modal-info-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .modal-status-banner {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 14px;
  }
  .modal-status-dates {
    text-align: left !important;
  }
}
</style>
