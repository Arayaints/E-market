<template>
  <aside class="sidebar" :class="{ 'expanded': isExpanded }">
    <!-- Brand Header -->
    <div class="sidebar-brand-wrapper">
      <NuxtLink to="/" class="sidebar-brand" title="e-Market สำนักงานตลาดกรุงเทพมหานคร">
        <div class="brand-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <div v-if="isExpanded" class="brand-text-block">
          <span class="brand-title">e-Market</span>
          <span class="brand-subtitle">สำนักงานตลาด กทม.</span>
        </div>
      </NuxtLink>
    </div>

    <!-- Nav Items -->
    <nav class="sidebar-nav">
      <!-- 1. Home: 12 Markets Directory / Stalls Map -->
      <NuxtLink
        to="/"
        class="nav-icon-link"
        :class="{ active: route.path === '/' || route.path.startsWith('/stalls') }"
        :title="isExpanded ? '' : 'หน้าแรก'"
      >
        <span class="nav-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </span>
        <span v-if="isExpanded" class="nav-label">หน้าแรก</span>
      </NuxtLink>

      <!-- 2. Bookings -->
      <NuxtLink
        to="/bookings"
        class="nav-icon-link"
        :class="{ active: route.path.startsWith('/bookings') }"
        :title="isExpanded ? '' : 'การจอง'"
      >
        <span class="nav-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </span>
        <span v-if="isExpanded" class="nav-label">การจอง</span>
      </NuxtLink>

      <!-- 3. Applications -->
      <NuxtLink
        to="/applications"
        class="nav-icon-link"
        :class="{ active: route.path.startsWith('/applications') }"
        :title="isExpanded ? '' : 'คำร้อง'"
      >
        <span class="nav-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </span>
        <span v-if="isExpanded" class="nav-label">คำร้อง</span>
      </NuxtLink>

      <!-- 4. Contracts -->
      <NuxtLink
        to="/contracts"
        class="nav-icon-link"
        :class="{ active: route.path.startsWith('/contracts') }"
        :title="isExpanded ? '' : (user?.role === 'tenant' ? 'แผงเช่าและสัญญาของฉัน' : 'สัญญาการเช่า')"
      >
        <span class="nav-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </span>
        <span v-if="isExpanded" class="nav-label">
          {{ user?.role === 'tenant' ? 'แผงเช่า & สัญญาของฉัน' : 'สัญญาการเช่า' }}
        </span>
      </NuxtLink>

      <!-- 5. Settings (Admin Only) -->
      <NuxtLink
        v-if="user?.role !== 'tenant'"
        to="/settings"
        class="nav-icon-link"
        :class="{ active: route.path === '/settings' }"
        :title="isExpanded ? '' : 'ตั้งค่าโซนตลาด'"
      >
        <span class="nav-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </span>
        <span v-if="isExpanded" class="nav-label">ตั้งค่าโซนตลาด</span>
      </NuxtLink>
    </nav>

  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const { user } = useAuth()
const { isExpanded, collapse } = useSidebar()

watch(() => route.fullPath, () => {
  if (process.client && window.innerWidth <= 768) {
    collapse()
  }
})
</script>

<style scoped>
.sidebar {
  border-right: 1px solid rgba(226, 232, 240, 0.85);
  box-shadow: 2px 0 16px rgba(15, 23, 42, 0.03);
}

.brand-icon-box {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.28);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.brand-icon-box:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.38);
}

.nav-icon-link {
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-icon-link:hover {
  background: #f8fafc;
  color: #2563eb;
  transform: translateX(2px);
}

.nav-icon-link.active {
  background: #eff6ff;
  color: #2563eb;
  box-shadow: inset 0 0 0 1px rgba(191, 219, 254, 0.5);
}
</style>
