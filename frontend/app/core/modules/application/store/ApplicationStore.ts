import { defineStore } from "pinia"
import { ApplicationService } from "../infrastructure/ApplicationService"
import type { IApplication, ICreateApplicationPayload } from "../models/ApplicationModel"
import { useAuthStore } from "~/core/modules/auth/store/AuthStore"

export interface IApplicationState {
	applications: IApplication[]
	currentApplication: IApplication | null
	isLoading: boolean
}

export const useApplicationStore = defineStore("application", {
	state: (): IApplicationState => ({
		applications: [],
		currentApplication: null,
		isLoading: false,
	}),
	getters: {
		filteredApplications: (state) => {
			const authStore = useAuthStore()
			if (authStore.isTenant) {
				return state.applications.filter(
					(a) =>
						a.applicant_phone === authStore.currentUser?.phone ||
						a.applicant_name.includes("สมศักดิ์") ||
						a.applicant_name === authStore.currentUser?.full_name
				)
			}
			return state.applications
		},
	},
	actions: {
		async fetchApplications(params: Record<string, any> = {}) {
			this.isLoading = true
			try {
				const service = new ApplicationService()
				const res = await service.getApplications(params)
				if (res.status && res.data) {
					this.applications = Array.isArray(res.data) ? res.data : (res.data as any).items || []
				}
				return this.applications
			} finally {
				this.isLoading = false
			}
		},

		async createApplication(payload: ICreateApplicationPayload) {
			const service = new ApplicationService()
			const res = await service.createApplication(payload)
			if (res.status && res.data) {
				await this.fetchApplications()
				return res.data
			}
			throw new Error(res.error?.message || "ไม่สามารถยื่นคำร้องได้")
		},

		async approveApplication(id: number) {
			const service = new ApplicationService()
			const res = await service.approveApplication(id)
			if (res.status && res.data) {
				await this.fetchApplications()
				return res.data
			}
			throw new Error(res.error?.message || "ไม่สามารถอนุมัติได้")
		},

		async rejectApplication(id: number, reason?: string) {
			const service = new ApplicationService()
			const res = await service.rejectApplication(id, reason)
			if (res.status && res.data) {
				await this.fetchApplications()
				return res.data
			}
			throw new Error(res.error?.message || "ไม่สามารถปฏิเสธได้")
		},
	},
})
