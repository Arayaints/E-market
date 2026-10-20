export interface IBooking {
	id: number
	booking_no?: string
	stall_id?: number
	stall_ident: string
	applicant_name: string
	applicant_phone: string
	applicant_email?: string
	business_type?: string
	visit_date: string
	visit_time: string
	note?: string
	status: "pending" | "confirmed" | "approved" | "completed" | "cancelled" | "rejected"
	created_at: string
	queue_number?: number
	masked_name?: string
	masked_phone?: string
}

export interface ICreateBookingPayload {
	stall_id?: number
	stall_ident: string
	applicant_name: string
	applicant_phone: string
	applicant_email?: string
	business_type?: string
	visit_date: string
	visit_time: string
	note?: string
}
