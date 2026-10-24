import { defineStore } from "pinia"
import { AuthService } from "../infrastructure/AuthService"
import type { IUser } from "../models/AuthModel"

const normalizeRole = (role?: string | null) => role === "officer" ? "staff" : (role || "tenant")

const normalizeLegacyTenantProfile = (user: IUser | null): IUser | null => {
	if (!user) return null
	if (user.username === "tenant" && (!user.full_name || user.full_name.includes("สมศักดิ์"))) {
		return {
			...user,
			id: user.id || 3,
			full_name: "สมชาย ใจดี",
			phone: user.phone && user.phone !== "081-999-8877" ? user.phone : "081-234-5678",
			role: "tenant",
		}
	}
	return user
}

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
		let storedRole = ""
		let user: IUser | null = null

		if (typeof window !== "undefined") {
			token =
				localStorage.getItem("token") ||
				localStorage.getItem("access_token") ||
				localStorage.getItem("emarket_jwt_token")
			const storedRoleValue = localStorage.getItem("user_role")
			storedRole = storedRoleValue ? normalizeRole(storedRoleValue) : ""
			const rawUser = localStorage.getItem("user_info") || localStorage.getItem("emarket_user")
			if (rawUser) {
				try {
					user = normalizeLegacyTenantProfile(JSON.parse(rawUser))
				} catch {}
			}
			// If token exists but no user info, create initial active session
			if (token && !user) {
				user = {
					id: storedRole === "tenant" ? 3 : 1,
					username: storedRole === "tenant" ? "tenant" : "admin",
					full_name: storedRole === "tenant" ? "สมชาย ใจดี" : "ผู้ดูแลระบบตลาด กทม. (Admin)",
					phone: storedRole === "tenant" ? "081-234-5678" : "02-123-4567",
					role: storedRole || "tenant",
				}
			}
		}

		return {
			currentUser: user,
			accessToken: token,
			refreshToken: null,
			role: storedRole || user?.role || "",
			isLoading: false,
		}
	},
	getters: {
		isLoggedIn: (state) => !!state.accessToken,
		isAdmin: (state) => state.role === "admin",
		isTenant: (state) => state.role === "tenant",
	},
	actions: {
		hydrate() {
			if (typeof window === "undefined") return

			this.accessToken =
				localStorage.getItem("token") ||
				localStorage.getItem("access_token") ||
				localStorage.getItem("emarket_jwt_token")
			const storedRole = localStorage.getItem("user_role")
			this.role = storedRole ? normalizeRole(storedRole) : ""

			const rawUser = localStorage.getItem("user_info") || localStorage.getItem("emarket_user")
			if (rawUser) {
				try {
					this.currentUser = normalizeLegacyTenantProfile(JSON.parse(rawUser))
					if (this.currentUser && !this.role) {
						this.role = normalizeRole(this.currentUser.role)
					}
				} catch {
					this.currentUser = null
				}
			} else if (this.accessToken) {
				this.currentUser = {
					id: this.role === "tenant" ? 3 : 1,
					username: this.role === "tenant" ? "tenant" : "admin",
					full_name: this.role === "tenant" ? "สมชาย ใจดี" : "ผู้ดูแลระบบตลาด กทม. (Admin)",
					phone: this.role === "tenant" ? "081-234-5678" : "02-123-4567",
					role: this.role || "tenant",
				}
			} else {
				// Never retain the previous account in memory after its token was removed.
				this.currentUser = null
			}
		},

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
			const normalized = normalizeLegacyTenantProfile(user) || user
			this.currentUser = normalized
			this.role = normalizeRole(normalized.role || this.role)
			if (typeof window !== "undefined") {
				localStorage.setItem("user_info", JSON.stringify(normalized))
				localStorage.setItem("emarket_user", JSON.stringify(normalized))
				localStorage.setItem("user_role", this.role)
			}
		},

		switchRole(newRole: "tenant" | "admin" | "staff") {
			const normalized = normalizeRole(newRole) as "tenant" | "admin" | "staff"
			this.role = normalized
			if (normalized === "tenant") {
				this.currentUser = {
					id: 3,
					username: "tenant",
					full_name: "สมชาย ใจดี",
					role: "tenant",
					phone: "081-234-5678",
					email: "tenant@emarket.bma.go.th",
				}
			} else {
				this.currentUser = {
					id: normalized === "staff" ? 2 : 1,
					username: normalized === "staff" ? "staff" : "admin",
					full_name: normalized === "staff" ? "เจ้าหน้าที่ตลาด (Staff)" : "ผู้ดูแลระบบตลาด กทม. (Admin)",
					role: normalized,
					phone: "02-123-4567",
					email: `${normalized}@emarket.bma.go.th`,
				}
			}
			if (typeof window !== "undefined") {
				localStorage.setItem("user_role", normalized)
				localStorage.setItem("user_info", JSON.stringify(this.currentUser))
				localStorage.setItem("emarket_user", JSON.stringify(this.currentUser))
				let switchUrl = "/api/v1/auth/switch-role"
				try {
					const config = useRuntimeConfig()
					const base = (config.public?.apiUrl || config.public?.apiBase || "/api/v1") as string
					switchUrl = `${base.replace(/\/+$/, "")}/auth/switch-role`
				} catch {}
				fetch(switchUrl, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ role: normalized }),
				})
					.then((r) => (r.ok ? r.json() : null))
					.then((payload) => {
						const token = payload?.data?.access_token || payload?.access_token
						const refresh = payload?.data?.refresh_token || payload?.refresh_token
						if (token) {
							this.setToken(token, refresh)
						}
					})
					.catch(() => {})
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
					const userRole = normalizeRole(data.role || data.user?.role || (credentials.username.startsWith("tenant") ? "tenant" : credentials.username === "staff" ? "staff" : "admin"))
					this.role = userRole
					this.setUser(data.user || {
						id: credentials.username === "tenant" ? 3 : credentials.username === "tenant2" ? 4 : 1,
						username: credentials.username,
						full_name: credentials.username === "tenant" ? "สมชาย ใจดี" : credentials.username === "tenant2" ? "นภาพร รัตนศิลป์" : "ผู้ดูแลระบบตลาด กทม. (Admin)",
						phone: credentials.username === "tenant" ? "081-234-5678" : credentials.username === "tenant2" ? "089-111-2233" : "02-123-4567",
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
			this.role = ""
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
