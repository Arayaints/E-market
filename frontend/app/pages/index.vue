<template>
	<MarketMain />
</template>

<script setup lang="ts">
import MarketMain from "~/core/modules/market/ui/MarketMain.vue"
import { useAuthStore } from "~/core/modules/auth/store/AuthStore"

definePageMeta({
	middleware: () => {
		if (!import.meta.client) return
		const auth = useAuthStore()
		auth.hydrate()
		if (auth.role === "staff") return navigateTo("/staff", { replace: true })
	}
})
</script>
