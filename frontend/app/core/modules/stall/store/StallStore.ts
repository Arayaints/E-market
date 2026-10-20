import { defineStore } from "pinia"
import { StallService } from "../infrastructure/StallService"
import type { IStall, IWaitingQueueInfo } from "../models/StallModel"

export interface IStallState {
	stalls: IStall[]
	currentStall: IStall | null
	selectedStalls: IStall[]
	waitingQueues: Record<string, IWaitingQueueInfo>
	isLoading: boolean
}

export const useStallStore = defineStore("stall", {
	state: (): IStallState => ({
		stalls: [],
		currentStall: null,
		selectedStalls: [],
		waitingQueues: {},
		isLoading: false,
	}),
	getters: {
		availableStalls: (state) => state.stalls.filter((s) => s.status === "available"),
		reservedStalls: (state) => state.stalls.filter((s) => s.status === "reserved"),
		occupiedStalls: (state) => state.stalls.filter((s) => s.status === "occupied"),
		hasMixedSelection: (state) => {
			if (state.selectedStalls.length <= 1) return false
			const hasAvailable = state.selectedStalls.some((s) => s.status === "available")
			const hasReserved = state.selectedStalls.some((s) => s.status === "reserved")
			return hasAvailable && hasReserved
		},
	},
	actions: {
		async fetchStalls(params: Record<string, any> = {}) {
			this.isLoading = true
			try {
				const service = new StallService()
				const res = await service.getStalls(params)
				if (res.status && res.data) {
					this.stalls = Array.isArray(res.data) ? res.data : (res.data as any).items || []
				}
				return this.stalls
			} finally {
				this.isLoading = false
			}
		},

		async fetchWaitingQueue(stallIdent: string) {
			if (this.waitingQueues[stallIdent]) return this.waitingQueues[stallIdent]
			const service = new StallService()
			const res = await service.getWaitingQueue(stallIdent)
			if (res.status && res.data) {
				this.waitingQueues[stallIdent] = res.data
				return res.data
			}
			return null
		},

		toggleSelectStall(stall: IStall) {
			const index = this.selectedStalls.findIndex((s) => s.ident === stall.ident)
			if (index > -1) {
				this.selectedStalls.splice(index, 1)
			} else {
				this.selectedStalls.push(stall)
			}
		},

		clearSelectedStalls() {
			this.selectedStalls = []
		},

		setSelectedStall(stall: IStall | null) {
			this.currentStall = stall
		},
	},
})
