import { HttpService, type IResponse, type IPagination } from "~/core/shared/http"
import type { IStall, IWaitingQueueInfo } from "../models/StallModel"

import { BookingService } from "../../booking/infrastructure/BookingService"

export class StallService extends HttpService {
	constructor() {
		super("stalls")
	}

	async getStalls(params: Record<string, any> = {}): Promise<IResponse<IStall[]>> {
		return this.get<IStall[]>("", params)
	}

	async getStallByID(id: number): Promise<IResponse<IStall>> {
		return this.get<IStall>(`/${id}`)
	}

	async getWaitingQueue(stallIdent: string): Promise<IResponse<IWaitingQueueInfo>> {
		const bookingService = new BookingService()
		return bookingService.getWaitingQueue(stallIdent)
	}
}
