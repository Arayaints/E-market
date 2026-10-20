import { defineStore } from "pinia"
import { ContractService } from "../infrastructure/ContractService"
import type { IContract } from "../models/ContractModel"
import { useAuthStore } from "~/core/modules/auth/store/AuthStore"

export interface IContractState {
	contracts: IContract[]
	currentContract: IContract | null
	isLoading: boolean
}

export const useContractStore = defineStore("contract", {
	state: (): IContractState => ({
		contracts: [],
		currentContract: null,
		isLoading: false,
	}),
	getters: {
		filteredContracts: (state) => {
			const authStore = useAuthStore()
			if (authStore.isTenant) {
				return state.contracts.filter(
					(c) =>
						c.tenant_phone === authStore.currentUser?.phone ||
						c.tenant_name.includes("สมศักดิ์") ||
						c.tenant_name === authStore.currentUser?.full_name
				)
			}
			return state.contracts
		},
		activeContracts: (state) => state.contracts.filter((c) => c.status === "active"),
	},
	actions: {
		async fetchContracts(params: Record<string, any> = {}) {
			this.isLoading = true
			try {
				const service = new ContractService()
				const res = await service.getContracts(params)
				if (res.status && res.data) {
					this.contracts = Array.isArray(res.data) ? res.data : (res.data as any).items || []
				}
				return this.contracts
			} finally {
				this.isLoading = false
			}
		},
	},
})
