<template>
  <div class="app-container" :class="{ 'sidebar-is-expanded': isExpanded }">
    <!-- Mobile Sidebar Backdrop Overlay -->
    <div
      v-if="isExpanded"
      class="sidebar-backdrop"
      @click="collapse"
    ></div>
    <AppSidebar />
    <div class="main-wrapper">
      <slot />
    </div>
    <AppAlertModal />
  </div>
</template>

<script setup lang="ts">
const { isExpanded, collapse } = useSidebar()
const { initAuth } = useAuth()

onMounted(() => {
  initAuth()
})
</script>
