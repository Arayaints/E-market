<template>
	<button
		type="button"
		class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-850 hover:bg-slate-800 border border-slate-700 hover:text-white transition-all"
		@click="handleClick"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
		</svg>
		<slot>{{ label }}</slot>
	</button>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"

const props = withDefaults(
	defineProps<{
		label?: string
		to?: string
	}>(),
	{
		label: "ย้อนกลับ",
		to: "",
	}
)

const emit = defineEmits<{ (e: "click"): void }>()
const router = useRouter()

const handleClick = () => {
	emit("click")
	if (props.to) {
		router.push(props.to)
	} else {
		router.back()
	}
}
</script>
