<template>
	<button
		type="button"
		:disabled="disabled"
		class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-cyan-900/30"
		@click="$emit('click')"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
		</svg>
		<slot>{{ label }}</slot>
	</button>
</template>

<script setup lang="ts">
withDefaults(
	defineProps<{
		label?: string
		disabled?: boolean
	}>(),
	{
		label: "สร้างใหม่",
		disabled: false,
	}
)

defineEmits<{
	(e: "click"): void
}>()
</script>
