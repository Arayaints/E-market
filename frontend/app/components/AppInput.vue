<template>
  <input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-invalid="Boolean(error)"
    :aria-describedby="error ? errorId : undefined"
    class="app-input"
    :class="{ 'has-error': error }"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    @blur="emit('blur')"
  />
  <span v-if="error" :id="errorId" class="app-input-error">{{ error }}</span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}>(), { modelValue: '', type: 'text', placeholder: '', disabled: false, error: '' })

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()
const errorId = `app-input-error-${Math.random().toString(36).slice(2, 9)}`
</script>

<style scoped>
.app-input{box-sizing:border-box;width:100%;min-height:42px;padding:9px 14px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#1e293b;font:500 .88rem/1.2 inherit;outline:none;transition:border-color .15s,box-shadow .15s}.app-input::placeholder{color:#94a3b8}.app-input:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12)}.app-input:disabled{background:#f8fafc;color:#64748b;border-color:#e2e8f0;cursor:not-allowed;-webkit-text-fill-color:#64748b}.app-input.has-error{border-color:#ef4444;box-shadow:0 0 0 1px #ef4444,0 1px 2px rgba(239,68,68,.1);background:#fffafa}.app-input-error{display:block;margin-top:5px;color:#dc2626;font-size:.8125rem;font-weight:500;line-height:1.3}
</style>
