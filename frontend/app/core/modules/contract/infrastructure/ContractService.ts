import { HttpService, type IResponse } from "~/core/shared/http"
import type { IContract } from "../models/ContractModel"

export class ContractService extends HttpService {
	constructor() {
		super("contracts")
	}

	async getContracts(params: Record<string, any> = {}): Promise<IResponse<IContract[]>> {
		return this.get<IContract[]>("", params)
	}

	async getContractByID(id: number): Promise<IResponse<IContract>> {
		return this.get<IContract>(`/${id}`)
	}

	async createContract(body: any): Promise<IResponse<IContract>> {
		return this.post<IContract>("", body)
	}
}
