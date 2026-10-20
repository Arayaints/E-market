import { useAppAlert } from "~/composables/useAppAlert"

export const useHandlerSuccess = () => {
	const { showSuccess } = useAppAlert()

	const handleSuccess = (message = "ดำเนินการสำเร็จเรียบร้อยแล้ว", title = "สำเร็จ") => {
		showSuccess(message, title)
	}

	return {
		showSuccess: handleSuccess,
		handleSuccess,
	}
}
