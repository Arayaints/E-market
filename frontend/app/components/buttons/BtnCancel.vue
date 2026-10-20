<template>
	<button
		type="button"
		:disabled="disabled"
		class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
		@click="$emit('click')"
	>
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
		label: "ยกเลิก",
		disabled: false,
	}
)

defineEmits<{
	(e: "click"): void
}>()
</script>
