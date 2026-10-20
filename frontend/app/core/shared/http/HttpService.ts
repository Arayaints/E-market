import type { IResponse } from "./Response.d"
import { useAuthStore } from "~/core/modules/auth/store/AuthStore"

export interface IRequestOptions extends Omit<RequestInit, "body"> {
	params?: Record<string, any>
	body?: any
	_retry?: boolean
}

// Single-flight refresh token promise
let refreshPromise: Promise<string | null> | null = null

export abstract class HttpService {
	protected readonly fullBaseURL: string

	protected constructor(
		protected readonly path: string = "",
		protected readonly baseURL: string = ""
	) {
		let base = baseURL
		if (!base) {
			try {
				const config = useRuntimeConfig()
				base = (config.public?.apiUrl || config.public?.apiBase || "/api/v1") as string
			} catch {
				base = "/api/v1"
			}
		}
		let url = base.replace(/\/+$/, "")
		if (path) {
			const cleanPath = path.replace(/^\/+/, "")
			url = `${url}/${cleanPath}`
		}
		this.fullBaseURL = url
	}

	protected createParams(record: Record<string, any> = {}): URLSearchParams {
		const params = new URLSearchParams()
		for (const [key, value] of Object.entries(record)) {
			if (value !== null && value !== undefined && value !== "") {
				params.append(key, String(value))
			}
		}
		return params
	}

	protected buildUrl(endpoint: string = "", params?: Record<string, any>): string {
		let url = this.fullBaseURL
		if (endpoint) {
			const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
			url = `${url}${cleanEndpoint}`
		}
		if (params) {
			const searchParams = this.createParams(params).toString()
			if (searchParams) {
				url += (url.includes("?") ? "&" : "?") + searchParams
			}
		}
		return url
	}

	protected async request<T>(endpoint: string, options: IRequestOptions = {}): Promise<IResponse<T>> {
		const { params, body, _retry, headers: customHeaders, ...fetchOptions } = options
		const url = this.buildUrl(endpoint, params)

		const headers = new Headers(customHeaders)
		if (!headers.has("Accept")) {
			headers.set("Accept", "application/json;charset=UTF-8")
		}

		const isFormData = typeof FormData !== "undefined" && body instanceof FormData
		if (!isFormData && body !== undefined && !headers.has("Content-Type")) {
			headers.set("Content-Type", "application/json;charset=UTF-8")
		}

		try {
			const authStore = useAuthStore()
			if (authStore.isLoggedIn && authStore.accessToken) {
				headers.set("Authorization", `Bearer ${authStore.accessToken}`)
			}
		} catch {
			// Auth store might not be ready yet in SSR or early lifecycle
			if (typeof window !== "undefined") {
				const token = localStorage.getItem("token") || localStorage.getItem("access_token")
				if (token) {
					headers.set("Authorization", `Bearer ${token}`)
				}
			}
		}

		try {
			const response = await fetch(url, {
				...fetchOptions,
				headers,
				body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
			})

			// Handle 401 Unauthorized -> Single-Flight Refresh Token -> Retry Original Request
			if (
				response.status === 401 &&
				!_retry &&
				!url.endsWith("/auth/refresh_token") &&
				!url.endsWith("/auth/login")
			) {
				const authStore = useAuthStore()
				if (authStore.accessToken && authStore.refreshToken) {
					const newAccessToken = await this.refreshAccessToken()
					if (newAccessToken) {
						return this.request<T>(endpoint, { ...options, _retry: true })
					}
				}
			}

			const payload = await response.json().catch(() => null)

			if (response.ok) {
				return this.handleResponse<T>(response.status, payload)
			}
			return this.handleError<T>(response.status, payload, response.statusText)
		} catch (error: any) {
			if (!url.startsWith("/api/v1")) {
				try {
					const cleanEp = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
					const subPath = this.path ? `/${this.path.replace(/^\/+|\/+$/g, "")}` : ""
					let fallbackUrl = `/api/v1${subPath}${cleanEp}`
					if (params) {
						const searchParams = this.createParams(params).toString()
						if (searchParams) {
							fallbackUrl += (fallbackUrl.includes("?") ? "&" : "?") + searchParams
						}
					}
					const fallbackRes = await fetch(fallbackUrl, {
						...fetchOptions,
						headers,
						body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
					})
					const payload = await fallbackRes.json().catch(() => null)
					if (fallbackRes.ok) {
						return this.handleResponse<T>(fallbackRes.status, payload)
					}
				} catch {
					// fallback failed, continue to standard error handling
				}
			}
			return this.handleError<T>(0, null, error?.message || "Network Error: Please check your connection")
		}
	}

	private async refreshAccessToken(): Promise<string | null> {
		if (!refreshPromise) {
			refreshPromise = (async () => {
				const authStore = useAuthStore()
				try {
					const config = useRuntimeConfig()
					const base = (config.public?.apiUrl || config.public?.apiBase || "/api/v1") as string
					const refreshUrl = `${base.replace(/\/+$/, "")}/auth/refresh_token`
					const res = await fetch(refreshUrl, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							access_token: authStore.accessToken,
							refresh_token: authStore.refreshToken,
						}),
					})
					const payload = await res.json().catch(() => null)
					if (res.ok && payload?.status && payload?.data?.access_token) {
						authStore.setToken(payload.data.access_token, payload.data.refresh_token)
						return payload.data.access_token as string
					}
					authStore.logout()
					return null
				} catch {
					authStore.logout()
					return null
				}
			})().finally(() => {
				refreshPromise = null
			})
		}
		return refreshPromise
	}

	protected get<T>(endpoint: string = "", params?: Record<string, any>, options?: IRequestOptions): Promise<IResponse<T>> {
		return this.request<T>(endpoint, { ...options, method: "GET", params })
	}

	protected post<T>(endpoint: string = "", body?: any, options?: IRequestOptions): Promise<IResponse<T>> {
		return this.request<T>(endpoint, { ...options, method: "POST", body })
	}

	protected put<T>(endpoint: string = "", body?: any, options?: IRequestOptions): Promise<IResponse<T>> {
		return this.request<T>(endpoint, { ...options, method: "PUT", body })
	}

	protected patch<T>(endpoint: string = "", body?: any, options?: IRequestOptions): Promise<IResponse<T>> {
		return this.request<T>(endpoint, { ...options, method: "PATCH", body })
	}

	protected delete<T>(endpoint: string = "", options?: IRequestOptions): Promise<IResponse<T>> {
		return this.request<T>(endpoint, { ...options, method: "DELETE" })
	}

	protected handleResponse<T>(status: number, result: any): IResponse<T> {
		if (result && typeof result === "object" && "data" in result && "status" in result) {
			return {
				code: status,
				status: result.status ?? true,
				data: result.data,
			}
		}
		// Direct payload adaptation
		return {
			code: status,
			status: true,
			data: result as T,
		}
	}

	protected handleError<T>(status: number, result: any, fallbackMessage?: string): IResponse<T> {
		return {
			code: status,
			status: false,
			error: result?.error || {
				message: result?.detail || fallbackMessage || "Request failed",
			},
		}
	}
}
