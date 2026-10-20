export interface IMarket {
	id: number
	name: string
	code: string
	location: string
	latitude: number
	longitude: number
	total_stalls: number
	description?: string
}

export interface IZone {
	id: number
	market_id: number
	name: string
	code: string
	color?: string
	total_stalls?: number
}
