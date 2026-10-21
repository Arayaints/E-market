export type BookingStatus =
	| "waiting_queue"        // รอคิว (ต่อคิวแผงติดจอง)
	| "pending_slot"         // รอเลือกวันนัด (ถึงคิวแล้ว หรือเลยวันนัด)
	| "pending_approval"     // รออนุมัติ (แผงว่างเลือกวันนัดแล้ว)
	| "approved"             // อนุมัติ - รอเข้าชม
	| "pending_decision"     // รอยืนยันความสนใจ (นับถอยหลัง 3 วัน)
	| "interested"           // สนใจเช่า - รอยื่นคำร้อง (นับถอยหลัง 7 วัน)
	| "lease_applied"        // ยื่นคำร้องแล้ว (ถือแผงจนกว่าคำร้อง/สัญญาจบ)
	| "rejected"             // ไม่อนุมัติ
	| "not_interested"       // ไม่สนใจ
	| "cancelled"            // ยกเลิก / หมดเวลา

export interface IBookingAuditLog {
	action: string
	actor_role: "tenant" | "officer" | "system"
	actor_name: string
	timestamp: string
	note?: string
}

export interface IBooking {
	id: number
	booking_number: string
	stall_id?: number
	stall_number: string
	stall_monthly_rate?: number
	stall_category?: string
	stall_zone_name?: string
	market_name: string
	market_district?: string
	meeting_point?: string
	escort_officer?: string
	tenant_name: string
	tenant_phone: string
	tenant_email?: string
	tenant_id_card?: string
	intended_business?: string
	visit_date?: string
	visit_time_slot?: string
	status: BookingStatus
	holding_stall: boolean
	queue_position?: number
	total_in_queue?: number
	waiting_since?: string
	decision_deadline?: string
	application_deadline?: string
	slot_selection_deadline?: string
	officer_notes?: string
	rejection_reason?: string
	not_interested_reason?: string
	proxy_recorded_by?: string
	proxy_channel?: "phone" | "onsite" | "other"
	application_number?: string
	timeline?: IBookingAuditLog[]
	created_at: string
}

export interface ICreateBookingPayload {
	stall_id?: number
	stall_number?: string
	market_name?: string
	tenant_name: string
	tenant_phone: string
	tenant_email?: string
	tenant_id_card?: string
	intended_business?: string
	visit_date?: string
	visit_time_slot?: string
	is_queue?: boolean
}

