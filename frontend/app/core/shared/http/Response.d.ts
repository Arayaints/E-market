import type { IError } from "./Error.d"

export interface IResponse<T = any> {
	code: number
	status: boolean
	data?: T
	error?: IError
}

export interface IPagination<T> {
	current_page: number
	next_page: number
	previous_page: number
	size_per_page: number
	total_pages: number
	total_items: number
	items: T[]
}
