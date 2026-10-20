import { useAuthStore } from "~/core/modules/auth/store/AuthStore"

export const usePermission = () => {
	const authStore = useAuthStore()

	const hasRole = (...roles: string[]): boolean => {
		const currentRole = authStore.role
		return roles.includes(currentRole)
	}

	const canApprove = (): boolean => {
		return authStore.role === "admin" || authStore.role === "staff"
	}

	const canBook = (): boolean => {
		return true
	}

	return {
		hasRole,
		canApprove,
		canBook,
	}
}
