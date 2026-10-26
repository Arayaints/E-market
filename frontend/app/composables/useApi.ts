import { useAuthStore } from "~/core/modules/auth/store/AuthStore"

export const useApi = () => {
  const config = useRuntimeConfig()
  const { token, role, logout } = useAuth()
  const authStore = useAuthStore()

  const apiFetch = async <T = any>(endpoint: string, options: any = {}): Promise<T> => {
    // Production must honour NUXT_PUBLIC_API_BASE so writes reach the persistent
    // Go API/database when configured, while falling back cleanly to Nitro /api/v1.
    const base = String(config.public.apiBase || config.public.apiUrl || '/api/v1')
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = base.endsWith('/') ? `${base.slice(0, -1)}${cleanEndpoint}` : `${base}${cleanEndpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }

    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }

    try {
      return await $fetch<T>(url, {
        ...options,
        headers
      })
    } catch (err: any) {
      // Auto Refresh Token Interceptor: When 401 Unauthorized occurs, try silent refresh once
      if (
        err?.response?.status === 401 &&
        !options._retry &&
        !url.includes('/auth/login') &&
        !url.includes('/auth/refresh_token') &&
        authStore.refreshToken
      ) {
        try {
          const refreshUrl = `${base.replace(/\/+$/, '')}/auth/refresh_token`
          const refreshRes: any = await $fetch(refreshUrl, {
            method: 'POST',
            body: {
              access_token: authStore.accessToken,
              refresh_token: authStore.refreshToken
            }
          })
          const newToken = refreshRes?.data?.access_token || refreshRes?.access_token
          const newRefresh = refreshRes?.data?.refresh_token || refreshRes?.refresh_token
          if (newToken) {
            authStore.setToken(newToken, newRefresh)
            headers['Authorization'] = `Bearer ${newToken}`
            return await $fetch<T>(url, {
              ...options,
              _retry: true,
              headers
            })
          }
        } catch {
          logout()
        }
      }

      if (err?.response?.status === 401) {
        logout()
      }
      throw err
    }
  }

  return {
    get: <T = any>(endpoint: string, query?: Record<string, any>) =>
      apiFetch<T>(endpoint, { method: 'GET', query }),
    post: <T = any>(endpoint: string, body?: any) =>
      apiFetch<T>(endpoint, { method: 'POST', body }),
    put: <T = any>(endpoint: string, body?: any) =>
      apiFetch<T>(endpoint, { method: 'PUT', body }),
    patch: <T = any>(endpoint: string, body?: any) =>
      apiFetch<T>(endpoint, { method: 'PATCH', body }),
    del: <T = any>(endpoint: string) =>
      apiFetch<T>(endpoint, { method: 'DELETE' }),
    apiFetch
  }
}
