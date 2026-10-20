export const useApi = () => {
  const config = useRuntimeConfig()
  const { token, logout } = useAuth()

  const apiFetch = async <T = any>(endpoint: string, options: any = {}): Promise<T> => {
    // When running on production cloud (e.g. Vercel) or when localhost backend is blocked, use relative /api/v1
    let base = config.public.apiBase || '/api/v1'
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      base = '/api/v1'
    }
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
      if (err?.response?.status === 401) {
        logout()
      }
      // If fetching from external backend failed, retry with internal Nitro API route
      if (!url.startsWith('/api/v1') && (err?.name === 'FetchError' || err?.message?.includes('Failed to fetch') || !err?.response)) {
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
