<template>
  <StallManageMain />
</template>

<script setup lang="ts">
import StallManageMain from '~/core/modules/stall/ui/StallManageMain.vue'
import { useAuthStore } from '~/core/modules/auth/store/AuthStore'

definePageMeta({
  middleware: (to) => {
    const authStore = useAuthStore()
    authStore.hydrate()
    if (import.meta.client && !['admin', 'staff'].includes(authStore.role)) {
      return navigateTo({ path: '/stalls/book', query: to.query })
    }
  }
})
</script>
