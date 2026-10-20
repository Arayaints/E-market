<template>
	<button
		:type="type"
		:disabled="loading || disabled"
		class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-cyan-900/30"
		@click="$emit('click')"
	>
		<svg
			v-if="loading"
			class="animate-spin -ml-1 mr-1 h-4 w-4 text-white"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
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
		type?: "button" | "submit" | "reset"
	}>(),
	{
		label: "บันทึกข้อมูล",
		loading: false,
		disabled: false,
		type: "submit",
	}
)

defineEmits<{
	(e: "click"): void
}>()
</script>
