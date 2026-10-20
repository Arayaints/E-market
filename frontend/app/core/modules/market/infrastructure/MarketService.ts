import { HttpService, type IResponse } from "~/core/shared/http"
import type { IMarket, IZone } from "../models/MarketModel"

export class MarketService extends HttpService {
	constructor() {
		super("markets")
	}

	async getMarkets(): Promise<IResponse<IMarket[]>> {
		return this.get<IMarket[]>("")
	}

	async getMarketZones(marketId: number): Promise<IResponse<IZone[]>> {
		return this.get<IZone[]>(`/${marketId}/zones`)
	}
}
