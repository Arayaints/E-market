<template>
	<StallMain />
</template>

<script setup lang="ts">
import StallMain from "~/core/modules/stall/ui/StallMain.vue"
import { useAuthStore } from "~/core/modules/auth/store/AuthStore"

definePageMeta({
	middleware: (to) => {
		if (!import.meta.client) return
		const auth = useAuthStore()
		auth.hydrate()
		if (auth.role !== 'staff') return
		const assignedId = auth.currentUser?.assigned_markets?.[0]?.id
		if (assignedId && String(to.query.market || '') !== String(assignedId)) {
			return navigateTo({ path: '/stalls', query: { market: assignedId } }, { replace: true })
		}
	}
})
</script>
