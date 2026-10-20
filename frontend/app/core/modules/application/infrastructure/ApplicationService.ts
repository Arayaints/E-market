import { HttpService, type IResponse } from "~/core/shared/http"
import type { IApplication, ICreateApplicationPayload } from "../models/ApplicationModel"

export class ApplicationService extends HttpService {
	constructor() {
		super("applications")
	}

	async getApplications(params: Record<string, any> = {}): Promise<IResponse<IApplication[]>> {
		return this.get<IApplication[]>("", params)
	}

	async getApplicationByID(id: number): Promise<IResponse<IApplication>> {
		return this.get<IApplication>(`/${id}`)
	}

	async createApplication(body: ICreateApplicationPayload): Promise<IResponse<IApplication>> {
		return this.post<IApplication>("", body)
	}

	async approveApplication(id: number): Promise<IResponse<IApplication>> {
		return this.patch<IApplication>(`/${id}/status`, { status: "approved" })
	}

	async rejectApplication(id: number, reason?: string): Promise<IResponse<IApplication>> {
		return this.patch<IApplication>(`/${id}/status`, { status: "rejected", reason })
	}
}
