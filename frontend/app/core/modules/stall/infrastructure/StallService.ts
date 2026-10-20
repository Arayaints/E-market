import { HttpService, type IResponse, type IPagination } from "~/core/shared/http"
import type { IStall, IWaitingQueueInfo } from "../models/StallModel"

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
		// Endpoint is at bookings/waiting-queue/{stall_ident}
		const config = useRuntimeConfig()
		const base = (config.public?.apiUrl || config.public?.apiBase || "/api/v1") as string
		const url = `${base.replace(/\/+$/, "")}/bookings/waiting-queue/${stallIdent}`
		try {
			const res = await fetch(url)
			const data = await res.json()
			return {
				code: res.status,
				status: res.ok,
				data: data,
			}
		} catch (err: any) {
			return {
				code: 500,
				status: false,
				error: { message: err?.message || "Failed to fetch queue" },
			}
		}
	}
}
