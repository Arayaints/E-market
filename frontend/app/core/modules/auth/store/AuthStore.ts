import { defineStore } from "pinia"
import { AuthService } from "../infrastructure/AuthService"
import type { IUser } from "../models/AuthModel"

export interface IAuthState {
	currentUser: IUser | null
	accessToken: string | null
	refreshToken: string | null
	role: string
	isLoading: boolean
}

export const useAuthStore = defineStore("auth", {
	state: (): IAuthState => {
		let token: string | null = null
		let storedRole = "tenant"
		let user: IUser | null = null

		if (typeof window !== "undefined") {
			token =
				localStorage.getItem("token") ||
				localStorage.getItem("access_token") ||
				localStorage.getItem("emarket_jwt_token")
			storedRole = localStorage.getItem("user_role") || "tenant"
			const rawUser = localStorage.getItem("user_info") || localStorage.getItem("emarket_user")
			if (rawUser) {
				try {
					user = JSON.parse(rawUser)
				} catch {}
			}
			// If token exists but no user info, create initial active session
			if (token && !user) {
				user = {
					id: storedRole === "tenant" ? 3 : 1,
					username: storedRole === "tenant" ? "tenant" : "admin",
					full_name: storedRole === "tenant" ? "คุณสมศักดิ์ ค้าขายดี (ผู้เช่า)" : "ผู้ดูแลระบบ (Admin)",
					role: storedRole,
				}
			}
		}

		return {
			currentUser: user,
			accessToken: token,
			refreshToken: null,
			role: storedRole,
			isLoading: false,
		}
	},
	getters: {
		isLoggedIn: (state) => !!state.accessToken,
		isAdmin: (state) => state.role === "admin",
		isTenant: (state) => state.role === "tenant",
	},
	actions: {
		setToken(accessToken: string, refreshToken?: string) {
			this.accessToken = accessToken
			if (refreshToken) {
				this.refreshToken = refreshToken
			}
			if (typeof window !== "undefined") {
				localStorage.setItem("token", accessToken)
				localStorage.setItem("access_token", accessToken)
				localStorage.setItem("emarket_jwt_token", accessToken)
				if (refreshToken) {
					localStorage.setItem("refresh_token", refreshToken)
				}
			}
		},

		setUser(user: IUser) {
			this.currentUser = user
			this.role = user.role || this.role
			if (typeof window !== "undefined") {
				localStorage.setItem("user_info", JSON.stringify(user))
				localStorage.setItem("emarket_user", JSON.stringify(user))
				localStorage.setItem("user_role", this.role)
			}
		},

		switchRole(newRole: "tenant" | "admin" | "staff") {
			this.role = newRole
			if (newRole === "tenant") {
				this.currentUser = {
					id: 3,
					username: "tenant",
					full_name: "คุณสมศักดิ์ ค้าขายดี (ผู้เช่า)",
					role: "tenant",
					phone: "081-999-8877",
				}
			} else {
				this.currentUser = {
					id: 1,
					username: "admin",
					full_name: "ผู้ดูแลระบบตลาด (Admin)",
					role: "admin",
					phone: "02-123-4567",
				}
			}
			if (typeof window !== "undefined") {
				localStorage.setItem("user_role", newRole)
				localStorage.setItem("user_info", JSON.stringify(this.currentUser))
				localStorage.setItem("emarket_user", JSON.stringify(this.currentUser))
			}
		},

		async login(credentials: { username: string; password: string }) {
			this.isLoading = true
			try {
				const service = new AuthService()
				const res = await service.login(credentials)
				if (res.status && res.data) {
					const data = res.data
					this.setToken(data.access_token, data.refresh_token)
					const userRole = data.role || data.user?.role || (credentials.username === "tenant" ? "tenant" : "admin")
					this.role = userRole
					this.setUser(data.user || {
						id: credentials.username === "tenant" ? 3 : 1,
						username: credentials.username,
						full_name: credentials.username === "tenant" ? "คุณสมศักดิ์ ค้าขายดี (ผู้เช่า)" : "ผู้ดูแลระบบ (Admin)",
						role: userRole,
					})
					return res.data
				}
				throw new Error(res.error?.message || "เข้าสู่ระบบไม่สำเร็จ")
			} finally {
				this.isLoading = false
			}
		},

		logout() {
			this.accessToken = null
			this.refreshToken = null
			this.currentUser = null
			if (typeof window !== "undefined") {
				localStorage.removeItem("token")
				localStorage.removeItem("access_token")
				localStorage.removeItem("refresh_token")
				localStorage.removeItem("user_info")
				localStorage.removeItem("user_role")
				localStorage.removeItem("emarket_jwt_token")
				localStorage.removeItem("emarket_user")
			}
			return navigateTo("/auth/login")
		},
	},
})
