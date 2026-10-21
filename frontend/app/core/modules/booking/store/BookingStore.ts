import { defineStore } from "pinia"
import { BookingService } from "../infrastructure/BookingService"
import type { IBooking, ICreateBookingPayload } from "../models/BookingModel"
import { useAuthStore } from "~/core/modules/auth/store/AuthStore"

export interface IBookingState {
	bookings: IBooking[]
	currentBooking: IBooking | null
	isLoading: boolean
}

export const useBookingStore = defineStore("booking", {
	state: (): IBookingState => ({
		bookings: [],
		currentBooking: null,
		isLoading: false,
	}),
	getters: {
		filteredBookings: (state) => {
			const authStore = useAuthStore()
			if (authStore.isTenant) {
				const currentName = authStore.currentUser?.full_name?.replace(/\s*\(ผู้เช่า\)\s*/, '')?.trim() || ""
				const currentPhone = authStore.currentUser?.phone || ""
				const matched = state.bookings.filter(
					(b: any) =>
						(currentPhone && (b.applicant_phone === currentPhone || b.tenant_phone === currentPhone)) ||
						(currentName && ((b.applicant_name && currentName.includes(b.applicant_name)) || (b.tenant_name && currentName.includes(b.tenant_name))))
				)
				return matched.length > 0 ? matched : state.bookings
			}
			return state.bookings
		},
		pendingBookings: (state) => state.bookings.filter((b) => b.status === "pending"),
		approvedBookings: (state) => state.bookings.filter((b) => b.status === "approved"),
	},
	actions: {
		async fetchBookings(params: Record<string, any> = {}) {
			this.isLoading = true
			try {
				const service = new BookingService()
				const res = await service.getBookings(params)
				if (res.status && res.data) {
					this.bookings = Array.isArray(res.data) ? res.data : (res.data as any).items || []
				}
				return this.bookings
			} finally {
				this.isLoading = false
			}
		},

		async createBooking(payload: ICreateBookingPayload) {
			const service = new BookingService()
			const res = await service.createBooking(payload)
			if (res.status && res.data) {
				await this.fetchBookings()
				return res.data
			}
			throw new Error(res.error?.message || "ไม่สามารถทำการจองได้")
		},

		async approveBooking(id: number) {
			const service = new BookingService()
			const res = await service.approveBooking(id)
			if (res.status && res.data) {
				await this.fetchBookings()
				return res.data
			}
			throw new Error(res.error?.message || "ไม่สามารถอนุมัติได้")
		},

		async rejectBooking(id: number, reason?: string) {
			const service = new BookingService()
			const res = await service.rejectBooking(id, reason)
			if (res.status && res.data) {
				await this.fetchBookings()
				return res.data
			}
			throw new Error(res.error?.message || "ไม่สามารถปฏิเสธได้")
		},
	},
})
