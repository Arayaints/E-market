export interface IContract {
	id: number
	contract_number: string
	application_id?: number
	stall_id?: number
	stall_ident: string
	tenant_name: string
	tenant_phone: string
	tenant_id_card?: string
	shop_name: string
	start_date: string
	end_date: string
	monthly_rental: number
	security_deposit: number
	status: "active" | "draft" | "expired" | "terminated"
	created_at: string
}
