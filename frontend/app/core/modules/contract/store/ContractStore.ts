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
				const currentName = authStore.currentUser?.full_name?.replace(/\s*\(ผู้เช่า\)\s*/, '')?.trim() || ""
				const currentPhone = authStore.currentUser?.phone || ""
				const matched = state.contracts.filter(
					(c: any) =>
						(currentPhone && (c.tenant_phone === currentPhone || c.phone === currentPhone)) ||
						(currentName && ((c.tenant_name && currentName.includes(c.tenant_name)) || (c.name && currentName.includes(c.name))))
				)
				return matched.length > 0 ? matched : state.contracts
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
