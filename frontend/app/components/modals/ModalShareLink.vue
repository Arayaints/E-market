<template>
	<Teleport to="body">
		<div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" @click.self="$emit('close')">
			<div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-base font-semibold text-slate-100">{{ title }}</h3>
					<button type="button" class="text-slate-400 hover:text-slate-200" @click="$emit('close')">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>
				<p class="text-xs text-slate-400">{{ description }}</p>
				<div class="flex items-center gap-2">
					<input
						type="text"
						readonly
						:value="link"
						class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
					/>
					<button
						type="button"
						class="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors"
						@click="copyToClipboard"
					>
						{{ copied ? 'คัดลอกแล้ว' : 'คัดลอก' }}
					</button>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue"

const props = withDefaults(
	defineProps<{
		isOpen: boolean
		title?: string
		description?: string
		link: string
	}>(),
	{
		title: "แชร์ลิงก์",
		description: "คัดลอกลิงก์เพื่อส่งต่อหรือเปิดใช้งานในอุปกรณ์อื่น",
	}
)

defineEmits<{ (e: "close"): void }>()

const copied = ref(false)

const copyToClipboard = async () => {
	try {
		await navigator.clipboard.writeText(props.link)
		copied.value = true
		setTimeout(() => {
			copied.value = false
		}, 2000)
	} catch {}
}
</script>
