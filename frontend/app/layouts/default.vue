<template>
  <div class="app-container" :class="{ 'sidebar-is-expanded': isExpanded }">
    <AppSidebar />
    <div class="main-wrapper">
      <slot />
    </div>
    <AppAlertModal />
  </div>
</template>

<script setup lang="ts">
const { isExpanded } = useSidebar()
const { initAuth } = useAuth()

onMounted(() => {
  initAuth()
})
</script>
