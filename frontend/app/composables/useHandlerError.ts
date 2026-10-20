import { useAppAlert } from "~/composables/useAppAlert"

export const useHandlerError = () => {
	const { showError } = useAppAlert()

	const handleError = (error: any, fallbackTitle = "เกิดข้อผิดพลาด") => {
		const message =
			error?.message ||
			error?.data?.error?.message ||
			error?.response?.data?.error?.message ||
			(typeof error === "string" ? error : "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง")
		showError(message, fallbackTitle)
	}

	return {
		showError: handleError,
		handleError,
	}
}
