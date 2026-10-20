<template>
	<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center">
		<slot />
		<AppAlertModal />
	</div>
</template>

<script setup lang="ts">
import AppAlertModal from "~/components/modals/AppAlertModal.vue"
</script>
