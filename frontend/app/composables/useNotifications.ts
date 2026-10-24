import { computed } from 'vue'

export interface INotificationItem {
  id: number
  recipient_role: 'tenant' | 'officer'
  recipient_user_id?: number
  recipient_name: string
  type: string
  status_code: string
  status_label: string
  title: string
  message: string
  booking_id?: number
  booking_number?: string
  stall_number?: string
  market_name?: string
  project_name?: string
  target_url?: string
  is_read: boolean
  created_at: string
}

let lastTopNotifId = 0
let isInitialFetchDone = false

export const useNotifications = () => {
  const { get, post } = useApi()
  const { user, role: authRole } = useAuth()
  const route = useRoute()

  const notifications = useState<INotificationItem[]>('global_notifications_list', () => [])
  const tenantUnreadCount = useState<number>('global_notifications_tenant_unread', () => 0)
  const officerUnreadCount = useState<number>('global_notifications_officer_unread', () => 0)
  const loading = useState<boolean>('global_notifications_loading', () => false)
  const toastQueue = useState<INotificationItem[]>('global_notifications_toast_queue', () => [])

  // Determine the active role context ('tenant' vs 'officer')
  const activeRole = computed<'tenant' | 'officer'>(() => {
    const queryRole = String(route.query?.role || '').toLowerCase()
    if (queryRole === 'tenant') return 'tenant'
    if (queryRole === 'officer' || queryRole === 'admin' || queryRole === 'staff') return 'officer'
    const currentAuthRole = String(user.value?.role || authRole.value || '').toLowerCase()
    return currentAuthRole === 'tenant' ? 'tenant' : 'officer'
  })

  const normalizeOwnerName = (value: unknown) => String(value || '')
    .replace(/^(คุณ|นาย|นางสาว|นาง|น\.ส\.)\s*/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

  const isNotificationVisibleToActiveUser = (item: INotificationItem) => {
    if (activeRole.value !== 'tenant' || item.recipient_role !== 'tenant') {
      return activeRole.value === 'officer' ? item.recipient_role === 'officer' : false
    }
    const currentUser = user.value as any
    if (item.recipient_user_id !== undefined && item.recipient_user_id !== null && currentUser?.id !== undefined) {
      return String(item.recipient_user_id) === String(currentUser.id)
    }
    const currentName = normalizeOwnerName(currentUser?.full_name)
    const demoOwnerNames: Record<string, string> = { tenant: 'สมชาย ใจดี', tenant2: 'นภาพร รัตนศิลป์' }
    const fallbackName = normalizeOwnerName(demoOwnerNames[String(currentUser?.username || '')])
    const recipientName = normalizeOwnerName(item.recipient_name)
    return Boolean(recipientName && (recipientName === currentName || recipientName === fallbackName))
  }

  const dismissToast = (id: number) => {
    toastQueue.value = toastQueue.value.filter(t => t.id !== id)
  }

  const pushToast = (items: INotificationItem[]) => {
    for (const item of items) {
      if (!toastQueue.value.some(t => t.id === item.id)) {
        toastQueue.value.unshift(item)
        if (toastQueue.value.length > 3) {
          toastQueue.value = toastQueue.value.slice(0, 3)
        }
        if (typeof window !== 'undefined') {
          window.setTimeout(() => {
            dismissToast(item.id)
          }, 7000)
        }
      }
    }
  }

  const fetchNotifications = async (showNewAsToast = true) => {
    loading.value = true
    try {
      const res: any = await get('/notifications', { role: 'all', _t: Date.now() })
      const list: INotificationItem[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : []
      const visibleList = list.filter(isNotificationVisibleToActiveUser)

      if (isInitialFetchDone && showNewAsToast && visibleList.length > 0 && lastTopNotifId > 0) {
        const newlyAdded: INotificationItem[] = []
        for (const n of visibleList) {
          if (n.id === lastTopNotifId) break
          if (!n.is_read) {
            newlyAdded.push(n)
          }
        }
        if (newlyAdded.length > 0) {
          pushToast(newlyAdded.reverse())
        }
      }

      if (visibleList.length > 0) {
        lastTopNotifId = visibleList[0].id
      }
      isInitialFetchDone = true

      notifications.value = visibleList
      tenantUnreadCount.value = visibleList.filter((n: INotificationItem) => n.recipient_role === 'tenant' && !n.is_read).length
      officerUnreadCount.value = visibleList.filter((n: INotificationItem) => n.recipient_role === 'officer' && !n.is_read).length
    } catch (e) {
      console.error('Failed to fetch notifications:', e)
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id: number) => {
    const target = notifications.value.find(n => n.id === id)
    if (target && !target.is_read) {
      target.is_read = true
      if (target.recipient_role === 'tenant') {
        tenantUnreadCount.value = Math.max(0, tenantUnreadCount.value - 1)
      } else {
        officerUnreadCount.value = Math.max(0, officerUnreadCount.value - 1)
      }
    }
    dismissToast(id)
    try {
      await post(`/notifications/${id}/read`, { user_id: (user.value as any)?.id, role: activeRole.value })
    } catch {}
  }

  const markAllAsRead = async (roleFilter?: 'tenant' | 'officer' | 'all') => {
    const targetRole = roleFilter || activeRole.value
    notifications.value.forEach((n) => {
      if (targetRole === 'all' || n.recipient_role === targetRole) {
        n.is_read = true
      }
    })
    if (targetRole === 'all' || targetRole === 'tenant') tenantUnreadCount.value = 0
    if (targetRole === 'all' || targetRole === 'officer') officerUnreadCount.value = 0

    try {
      await post('/notifications/read-all', { role: targetRole, user_id: (user.value as any)?.id })
    } catch {}
  }

  const tenantNotifications = computed(() =>
    notifications.value.filter(n => n.recipient_role === 'tenant')
  )

  const officerNotifications = computed(() =>
    notifications.value.filter(n => n.recipient_role === 'officer')
  )

  const activeRoleUnreadCount = computed(() =>
    activeRole.value === 'tenant' ? tenantUnreadCount.value : officerUnreadCount.value
  )

  const totalUnreadCount = computed(() =>
    tenantUnreadCount.value + officerUnreadCount.value
  )

  return {
    notifications,
    tenantNotifications,
    officerNotifications,
    tenantUnreadCount,
    officerUnreadCount,
    activeRole,
    activeRoleUnreadCount,
    totalUnreadCount,
    toastQueue,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissToast
  }
}
