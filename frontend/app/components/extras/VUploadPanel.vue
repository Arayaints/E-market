<template>
	<div class="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 rounded-xl p-6 text-center bg-slate-900/30 transition-colors cursor-pointer" @click="triggerFileInput">
		<input ref="fileInput" type="file" :accept="accept" class="hidden" @change="handleFileChange" />
		<div class="flex flex-col items-center justify-center gap-2">
			<div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
				<svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
				</svg>
			</div>
			<div class="text-sm font-medium text-slate-200">
				<span v-if="fileName">{{ fileName }}</span>
				<span v-else>{{ title }}</span>
			</div>
			<p class="text-xs text-slate-400">{{ hint }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue"

withDefaults(
	defineProps<{
		title?: string
		hint?: string
		accept?: string
	}>(),
	{
		title: "คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่",
		hint: "รองรับไฟล์ PDF, PNG, JPG ขนาดไม่เกิน 10MB",
		accept: ".pdf,.png,.jpg,.jpeg",
	}
)

const emit = defineEmits<{
	(e: "file-selected", file: File): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref("")

const triggerFileInput = () => {
	fileInput.value?.click()
}

const handleFileChange = (e: Event) => {
	const target = e.target as HTMLInputElement
	if (target.files && target.files.length > 0) {
		const file = target.files[0]
		fileName.value = file.name
		emit("file-selected", file)
	}
}
</script>
