<template>
	<StallBookMain />
</template>

<script setup lang="ts">
import StallBookMain from "~/core/modules/stall/ui/StallBookMain.vue"
import { useAuthStore } from "~/core/modules/auth/store/AuthStore"

definePageMeta({
  middleware: (to) => {
    const authStore = useAuthStore()
    authStore.hydrate()
    if (import.meta.client && !authStore.isLoggedIn) {
      return navigateTo('/auth/login')
    }
    if (import.meta.client && authStore.role !== 'tenant') {
      return navigateTo({ path: '/stalls/manage', query: to.query }, { replace: true })
    }
  }
})
</script>
