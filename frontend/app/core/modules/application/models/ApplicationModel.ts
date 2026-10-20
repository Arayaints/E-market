export interface IApplication {
	id: number
	stall_id?: number
	stall_ident: string
	applicant_name: string
	applicant_phone: string
	applicant_id_card?: string
	shop_name: string
	product_category: string
	lease_term_months: number
	monthly_rate?: number
	status: "submitted" | "under_review" | "approved" | "rejected"
	submitted_at: string
	reviewed_at?: string
	review_note?: string
}

export interface ICreateApplicationPayload {
	stall_id?: number
	stall_ident: string
	applicant_name: string
	applicant_phone: string
	applicant_id_card: string
	shop_name: string
	product_category: string
	lease_term_months: number
}
