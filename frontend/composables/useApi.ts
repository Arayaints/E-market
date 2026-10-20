export const useApi = () => {
  const config = useRuntimeConfig()
  const { token, logout } = useAuth()

  const apiFetch = async <T = any>(endpoint: string, options: any = {}): Promise<T> => {
    const url = `${config.public.apiBase}${endpoint}`
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
