import { useAppAlert } from "~/composables/useAppAlert"

export const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
	const { showSuccess, showError, showWarning } = useAppAlert()
	if (type === "success") {
		showSuccess("สำเร็จ", message)
	} else if (type === "error") {
		showError("เกิดข้อผิดพลาด", message)
	} else {
		showWarning("แจ้งเตือน", message)
	}
}
