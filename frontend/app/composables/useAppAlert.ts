export interface AlertOptions {
  title?: string
  type?: 'warning' | 'error' | 'success' | 'info'
  confirmText?: string
  cancelText?: string
  isConfirm?: boolean
}

let activeResolve: ((value: boolean) => void) | null = null

export const useAppAlert = () => {
  const isOpen = useState<boolean>('app_alert_open', () => false)
  const alertTitle = useState<string>('app_alert_title', () => 'แจ้งเตือน')
  const alertMessage = useState<string>('app_alert_message', () => '')
  const alertType = useState<'warning' | 'error' | 'success' | 'info'>('app_alert_type', () => 'warning')
  const confirmText = useState<string>('app_alert_confirm_text', () => 'ตกลง')
  const cancelText = useState<string>('app_alert_cancel_text', () => 'ยกเลิก')
  const isConfirm = useState<boolean>('app_alert_is_confirm', () => false)

  const showAlert = (message: string, options?: AlertOptions): Promise<boolean> => {
    alertMessage.value = message
    alertTitle.value = options?.title || (
      options?.type === 'error' ? 'เกิดข้อผิดพลาด' :
      options?.type === 'success' ? 'สำเร็จ' :
      'แจ้งเตือน'
    )
    alertType.value = options?.type || 'warning'
    confirmText.value = options?.confirmText || 'ตกลง'
    cancelText.value = options?.cancelText || 'ยกเลิก'
    isConfirm.value = options?.isConfirm || false
    isOpen.value = true

    return new Promise((resolve) => {
      activeResolve = resolve
    })
  }

  const showSuccess = (message: string, title = 'สำเร็จ') => {
    return showAlert(message, { title, type: 'success' })
  }

  const showError = (message: string, title = 'เกิดข้อผิดพลาด') => {
    return showAlert(message, { title, type: 'error' })
  }

  const showWarning = (message: string, title = 'แจ้งเตือน') => {
    return showAlert(message, { title, type: 'warning' })
  }

  const showConfirm = (message: string, title = 'ยืนยันการทำรายการ') => {
    return showAlert(message, { title, type: 'warning', isConfirm: true, confirmText: 'ยืนยัน', cancelText: 'ยกเลิก' })
  }

  const handleConfirm = () => {
    isOpen.value = false
    if (activeResolve) {
      activeResolve(true)
      activeResolve = null
    }
  }

  const handleCancel = () => {
    isOpen.value = false
    if (activeResolve) {
      activeResolve(false)
      activeResolve = null
    }
  }

  return {
    isOpen,
    alertTitle,
    alertMessage,
    alertType,
    confirmText,
    cancelText,
    isConfirm,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    handleConfirm,
    handleCancel
  }
}
