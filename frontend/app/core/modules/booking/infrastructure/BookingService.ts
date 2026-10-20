import { HttpService, type IResponse } from "~/core/shared/http"
import type { IBooking, ICreateBookingPayload } from "../models/BookingModel"

export class BookingService extends HttpService {
	constructor() {
		super("bookings")
	}

	async getBookings(params: Record<string, any> = {}): Promise<IResponse<IBooking[]>> {
		return this.get<IBooking[]>("", params)
	}

	async getBookingByID(id: number): Promise<IResponse<IBooking>> {
		return this.get<IBooking>(`/${id}`)
	}

	async createBooking(body: ICreateBookingPayload): Promise<IResponse<IBooking>> {
		return this.post<IBooking>("", body)
	}

	async updateStatus(id: number, status: string, reason?: string): Promise<IResponse<IBooking>> {
		return this.patch<IBooking>(`/${id}/status`, { status, reason })
	}

	async approveBooking(id: number): Promise<IResponse<IBooking>> {
		return this.updateStatus(id, "approved")
	}

	async rejectBooking(id: number, reason?: string): Promise<IResponse<IBooking>> {
		return this.updateStatus(id, "rejected", reason)
	}
}
