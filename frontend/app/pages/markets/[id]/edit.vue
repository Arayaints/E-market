<template>
  <MarketEditMain />
</template>

<script setup lang="ts">
import MarketEditMain from '~/core/modules/market/ui/MarketEditMain.vue'
import { useAuthStore } from '~/core/modules/auth/store/AuthStore'

definePageMeta({
  middleware: (to) => {
    const authStore = useAuthStore()
    authStore.hydrate()
    if (import.meta.client && !['admin', 'staff'].includes(authStore.role)) {
      return navigateTo({ path: '/stalls', query: { market: to.params.id } }, { replace: true })
    }
    if (import.meta.client && authStore.role === 'staff') {
      const assignedId = authStore.currentUser?.assigned_markets?.[0]?.id
      if (!assignedId || String(to.params.id) !== String(assignedId)) {
        return navigateTo('/staff', { replace: true })
      }
    }
  }
})
</script>
