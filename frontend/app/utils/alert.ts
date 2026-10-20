import { useAppAlert } from "~/composables/useAppAlert"

export const alertConfirm = async (title: string, message: string): Promise<boolean> => {
	try {
		const { showConfirm } = useAppAlert()
		return await showConfirm(title, message)
	} catch {
		return false
	}
}

export const alertError = async (title: string, message: string): Promise<void> => {
	try {
		const { showError } = useAppAlert()
		await showError(title, message)
	} catch {}
}

export const alertSuccess = async (title: string, message: string): Promise<void> => {
	try {
		const { showSuccess } = useAppAlert()
		await showSuccess(title, message)
	} catch {}
}

export const alertWarning = async (title: string, message: string): Promise<void> => {
	try {
		const { showWarning } = useAppAlert()
		await showWarning(title, message)
	} catch {}
}
