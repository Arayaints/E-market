export interface IStall {
	id: number
	ident: string
	zone_id?: number
	zone_name?: string
	name?: string
	width: number
	depth: number
	area_sqm: number
	daily_rent: number
	monthly_rent: number
	status: "available" | "reserved" | "occupied" | "maintenance"
	floor?: string
	coordinates_geojson?: string
	created_at?: string
	updated_at?: string
}

export interface IWaitingQueueInfo {
	stall_ident: string
	queue_count: number
	current_position: number
	masked_current_booker: string
	masked_booker_phone: string
	status: string
	expires_at?: string
}
