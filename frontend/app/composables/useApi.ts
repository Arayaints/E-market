export const useApi = () => {
  const config = useRuntimeConfig()
  const { token, role, logout } = useAuth()

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
    if (role.value) {
      headers['X-Active-Role'] = String(role.value)
    }

    try {
      return await $fetch<T>(url, {
        ...options,
        headers
      })
    } catch (err: any) {
      if (err?.response?.status === 401) {
        logout()
      }
      const isReadOnly = String(options.method || 'GET').toUpperCase() === 'GET'
      const isMarketsRead = isReadOnly && cleanEndpoint.startsWith('/markets')
      const isNetworkOrMissingRoute = err?.name === 'FetchError' ||
        err?.message?.includes('Failed to fetch') ||
        !err?.response ||
        (isMarketsRead && err?.response?.status === 404)
      if (isReadOnly && !url.startsWith('/api/v1') && isNetworkOrMissingRoute) {
        try {
          const fallbackUrl = `/api/v1${cleanEndpoint}`
          return await $fetch<T>(fallbackUrl, {
            ...options,
            headers
          })
        } catch {
          // rethrow original
        }
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
