import { defineStore } from "pinia"
import { MarketService } from "../infrastructure/MarketService"
import type { IMarket, IZone } from "../models/MarketModel"

export interface IMarketState {
	markets: IMarket[]
	selectedMarket: IMarket | null
	zones: IZone[]
	isLoading: boolean
}

export const useMarketStore = defineStore("market", {
	state: (): IMarketState => ({
		markets: [],
		selectedMarket: null,
		zones: [],
		isLoading: false,
	}),
	actions: {
		async fetchMarkets() {
			this.isLoading = true
			try {
				const service = new MarketService()
				const res = await service.getMarkets()
				if (res.status && res.data) {
					this.markets = Array.isArray(res.data) ? res.data : []
					if (!this.selectedMarket && this.markets.length > 0) {
						this.selectedMarket = this.markets[0]
					}
				}
				return this.markets
			} finally {
				this.isLoading = false
			}
		},

		async fetchZones(marketId: number) {
			const service = new MarketService()
			const res = await service.getMarketZones(marketId)
			if (res.status && res.data) {
				this.zones = Array.isArray(res.data) ? res.data : []
				return this.zones
			}
			return []
		},
	},
})
