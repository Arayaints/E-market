export const useSidebar = () => {
  const isExpanded = useState<boolean>('isSidebarExpanded', () => false)

  // Initialize from localStorage on client side
  if (process.client) {
    const saved = localStorage.getItem('emarket_sidebar_expanded')
    if (saved !== null && isExpanded.value === false) {
      isExpanded.value = saved === 'true'
    }
  }

  const toggle = () => {
    isExpanded.value = !isExpanded.value
    if (process.client) {
      localStorage.setItem('emarket_sidebar_expanded', String(isExpanded.value))
    }
  }

  const expand = () => {
    isExpanded.value = true
    if (process.client) {
      localStorage.setItem('emarket_sidebar_expanded', 'true')
    }
  }

  const collapse = () => {
    isExpanded.value = false
    if (process.client) {
      localStorage.setItem('emarket_sidebar_expanded', 'false')
    }
  }

  return {
    isExpanded,
    toggle,
    expand,
    collapse
  }
}
