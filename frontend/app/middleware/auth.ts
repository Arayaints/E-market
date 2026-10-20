import { useAuthStore } from "~/core/modules/auth/store/AuthStore"

export default defineNuxtRouteMiddleware((to, from) => {
	const authStore = useAuthStore()
	if (!authStore.isLoggedIn) {
		return navigateTo("/auth/login")
	}
})
