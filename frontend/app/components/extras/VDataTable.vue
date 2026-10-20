<template>
	<div class="space-y-3">
		<div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
			<table class="w-full text-left text-sm text-slate-300">
				<thead class="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-800">
					<tr>
						<th
							v-for="col in columns"
							:key="col.key"
							:class="['px-6 py-3.5 font-semibold', col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : '']"
						>
							{{ col.label }}
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/60">
					<tr v-if="loading">
						<td :colspan="columns.length" class="px-6 py-10 text-center text-slate-400">
							<div class="flex items-center justify-center gap-2">
								<svg class="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24" fill="none">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
								</svg>
								<span>กำลังโหลดข้อมูล...</span>
							</div>
						</td>
					</tr>
					<tr v-else-if="!items || items.length === 0">
						<td :colspan="columns.length" class="px-6 py-10 text-center text-slate-500">
							{{ emptyText }}
						</td>
					</tr>
					<slot v-else />
				</tbody>
			</table>
		</div>

		<!-- Pagination Footer -->
		<div v-if="pagination && pagination.total_items > 0" class="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 px-2">
			<div>
				แสดงผลรายการ {{ ((pagination.current_page - 1) * pagination.size_per_page) + 1 }} ถึง {{ Math.min(pagination.current_page * pagination.size_per_page, pagination.total_items) }} จากทั้งหมด {{ pagination.total_items }} รายการ
			</div>
			<div class="flex items-center gap-1.5">
				<button
					type="button"
					:disabled="pagination.current_page <= 1"
					class="px-2.5 py-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700/60"
					@click="$emit('page-change', pagination.current_page - 1)"
				>
					ก่อนหน้า
				</button>
				<span class="px-2 font-mono">หน้า {{ pagination.current_page }} / {{ pagination.total_pages || 1 }}</span>
				<button
					type="button"
					:disabled="pagination.current_page >= pagination.total_pages"
					class="px-2.5 py-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700/60"
					@click="$emit('page-change', pagination.current_page + 1)"
				>
					ถัดไป
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { IPagination } from "~/core/shared/http"

export interface TableColumn {
	key: string
	label: string
	align?: "left" | "center" | "right"
}

withDefaults(
	defineProps<{
		columns: TableColumn[]
		items: any[]
		loading?: boolean
		emptyText?: string
		pagination?: IPagination<any> | null
	}>(),
	{
		loading: false,
		emptyText: "ไม่พบข้อมูลในระบบ",
		pagination: null,
	}
)

defineEmits<{
	(e: "page-change", page: number): void
}>()
</script>
