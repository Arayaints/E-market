<template>
  <div class="media-field">
    <div><strong>{{ title }}</strong><span>{{ hint }}</span></div>
    <label class="media-upload">
      <img v-if="preview" :src="preview" :alt="title" />
      <span v-else class="upload-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" /></svg>เพิ่มรูปภาพ</span>
      <span v-if="preview" class="replace-label">เปลี่ยนรูปภาพ</span>
      <input accept="image/png,image/jpeg" type="file" @change="onChange" />
    </label>
  </div>
</template>
<script setup lang="ts">
defineProps<{ title: string; hint: string; preview?: string }>()
const emit = defineEmits<{ (e: 'file', file: File): void }>()
const onChange = (event: Event) => { const file = (event.target as HTMLInputElement).files?.[0]; if (file) emit('file', file) }
</script>
<style scoped>
.media-field{display:grid;gap:10px}.media-field>div{display:flex;flex-direction:column;gap:3px;color:#334155;font-size:.84rem}.media-field span{font-size:.75rem;color:#94a3b8}.media-upload{height:190px;position:relative;display:grid;place-items:center;overflow:hidden;border:1px dashed #93c5fd;border-radius:12px;background:#f8fbff;cursor:pointer}.media-upload img{width:100%;height:100%;object-fit:cover}.media-upload input{display:none}.upload-placeholder{display:flex!important;align-items:center;gap:8px!important;color:#2563eb!important;font-weight:700}.upload-placeholder svg{width:24px}.replace-label{position:absolute;right:10px;bottom:10px;background:rgba(15,23,42,.78);color:#fff!important;padding:6px 10px;border-radius:7px;font-weight:600}
</style>
