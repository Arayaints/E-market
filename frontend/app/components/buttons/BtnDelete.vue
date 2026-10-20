<template>
	<button
		type="button"
		:disabled="loading || disabled"
		class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 hover:text-white active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
		@click="$emit('click')"
	>
		<svg
			v-if="loading"
			class="animate-spin h-3.5 w-3.5 text-red-300"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
		</svg>
		<svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
		</svg>
		<slot>{{ label }}</slot>
	</button>
</template>

<script setup lang="ts">
withDefaults(
	defineProps<{
		label?: string
		loading?: boolean
		disabled?: boolean
	}>(),
	{
		label: "ลบ",
		loading: false,
		disabled: false,
	}
)

defineEmits<{
	(e: "click"): void
}>()
</script>
