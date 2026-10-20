<template>
  <header class="top-navbar">
    <div class="navbar-left">
      <!-- Hamburger Button (Expand / Collapse Sidebar) -->
      <button
        class="btn-icon-square hamburger-toggle-btn"
        :class="{ active: isExpanded }"
        @click="toggleSidebar"
        :title="isExpanded ? 'ย่อแถบเมนู (Collapse Sidebar)' : 'ขยายแถบเมนู (Expand Sidebar)'"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div v-if="subtitle" class="navbar-subtitle-text">
        {{ subtitle }}
      </div>
    </div>

    <div class="navbar-right">
      <!-- Notification Bell -->
      <button class="notification-bell-btn" title="การแจ้งเตือน">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span class="notification-badge-dot"></span>
      </button>

      <!-- Quick Role Switcher Pill -->
      <div class="role-switcher-pill" style="display: flex; align-items: center; background: #f1f5f9; padding: 3px; border-radius: 20px; border: 1px solid #cbd5e1;">
        <button
          type="button"
          class="role-switch-btn"
          :class="{ active: user?.role === 'tenant' }"
          @click.stop="switchRole('tenant')"
          title="สลับเป็นบทบาทผู้เช่า (จองแผง, ติดตามคำร้อง, ดูแผงของตนเอง)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>ผู้เช่า (Tenant)</span>
        </button>
        <button
          type="button"
          class="role-switch-btn"
          :class="{ active: user?.role !== 'tenant' }"
          @click.stop="switchRole('admin')"
          title="สลับเป็นบทบาทเจ้าหน้าที่/แอดมิน (อนุมัติการจอง, บริหารสัญญาและคำร้อง)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>เจ้าหน้าที่ (Admin)</span>
        </button>
      </div>

      <!-- User Profile Badge -->
      <div class="user-profile-badge" @click="toggleMenu" style="position: relative; cursor: pointer;">
        <div class="user-avatar-circle" :style="user?.role === 'tenant' ? 'border: 2px solid #10b981;' : 'border: 2px solid #3b82f6;'">
          <img :src="user?.role === 'tenant' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'" alt="Avatar" />
        </div>
        <div class="user-info-text">
          <span class="user-name-text">{{ user?.full_name || (user?.role === 'tenant' ? 'สมชาย ใจดี' : 'ผู้ดูแลระบบ') }}</span>
          <span class="user-role-text" :style="user?.role === 'tenant' ? 'color: #059669; font-weight: 700;' : 'color: #2563eb; font-weight: 700;'">
            {{ user?.role === 'tenant' ? '👤 ผู้เช่าแผงค้า' : '🛡️ ผู้ดูแลระบบ (Admin)' }}
          </span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #94a3b8; margin-left: 2px;">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>

        <!-- Dropdown Menu -->
        <div v-if="showDropdown" class="card" style="position: absolute; top: 110%; right: 0; min-width: 190px; padding: 8px; z-index: 50; box-shadow: var(--shadow-lg);">
          <div style="padding: 6px 10px; font-size: 0.76rem; color: #64748b; border-bottom: 1px solid #f1f5f9; margin-bottom: 4px;">
            บทบาทปัจจุบัน: <strong>{{ user?.role === 'tenant' ? 'ผู้เช่าแผงค้า' : 'เจ้าหน้าที่แอดมิน' }}</strong>
          </div>
          <button class="btn btn-sm btn-outline" style="width: 100%; border: none; justify-content: flex-start; color: #ef4444; display: flex; align-items: center; gap: 8px;" @click="handleLogout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string
  subtitle?: string
}>()

const { user, logout } = useAuth()
const { isExpanded, toggle: toggleSidebar } = useSidebar()
const showDropdown = ref(false)

const toggleMenu = () => {
  showDropdown.value = !showDropdown.value
}

const switchRole = (newRole: 'tenant' | 'admin') => {
  if (newRole === 'tenant') {
    user.value = {
      id: 3,
      username: 'tenant',
      email: 'somchai@tenant.com',
      full_name: 'สมชาย ใจดี (ผู้เช่าแผงค้า)',
      role: 'tenant'
    }
  } else {
    user.value = {
      id: 1,
      username: 'admin',
      email: 'admin@emarket.com',
      full_name: 'ผู้ดูแลระบบ (System Admin)',
      role: 'admin'
    }
  }
  if (process.client) {
    localStorage.setItem('emarket_user', JSON.stringify(user.value))
  }
}

const { showConfirm } = useAppAlert()

const handleLogout = async () => {
  const confirmed = await showConfirm('คุณต้องการออกจากระบบหรือไม่?', 'ยืนยันออกจากระบบ')
  if (confirmed) {
    await logout()
  }
}
</script>

<style scoped>
.navbar-subtitle-text {
  font-size: 0.86rem;
  color: #64748b;
  font-weight: 500;
  margin-left: 6px;
}

.role-switch-btn {
  border: none;
  background: transparent;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.74rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;
}

.role-switch-btn.active {
  background: #ffffff;
  color: #1e3a8a;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .navbar-subtitle-text {
    display: none;
  }
}
</style>
