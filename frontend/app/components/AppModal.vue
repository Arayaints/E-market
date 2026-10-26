<template>
  <Teleport to="body">
    <Transition name="app-modal-fade">
      <div v-if="modelValue" class="app-modal-backdrop" @click.self="close">
        <section class="app-modal" role="dialog" aria-modal="true" :aria-labelledby="titleId">
          <header class="app-modal-header">
            <div>
              <h2 :id="titleId">{{ title }}</h2>
              <p v-if="description">{{ description }}</p>
            </div>
            <AppButton variant="ghost" size="sm" class="app-modal-close" aria-label="ปิด" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </AppButton>
          </header>

          <div class="app-modal-body"><slot /></div>
          <footer v-if="$slots.footer" class="app-modal-footer"><slot name="footer" /></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import AppButton from './AppButton.vue'

const props = defineProps<{
  modelValue: boolean
  title: string
  description?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const titleId = `app-modal-title-${Math.random().toString(36).slice(2, 9)}`
const close = () => emit('update:modelValue', false)
</script>

<style scoped>
.app-modal-backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.48);backdrop-filter:blur(4px)}
.app-modal{width:min(480px,100%);overflow:visible;border:1px solid #e2e8f0;border-radius:16px;background:#fff;box-shadow:0 24px 48px rgba(15,23,42,.22)}
.app-modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:22px 22px 0}
.app-modal-header h2{margin:0;color:#0f172a;font-size:1.125rem;line-height:1.35;font-weight:700}
.app-modal-header p{margin:4px 0 0;color:#64748b;font-size:.875rem;line-height:1.5}
.app-modal-close{flex:0 0 auto!important;padding:0!important;width:32px!important}.app-modal-close svg{width:18px;height:18px}
.app-modal-body{padding:20px 22px}.app-modal-footer{display:flex;justify-content:flex-end;gap:8px;padding:0 22px 22px}
.app-modal-fade-enter-active,.app-modal-fade-leave-active{transition:opacity .16s ease}.app-modal-fade-enter-active .app-modal,.app-modal-fade-leave-active .app-modal{transition:transform .16s ease}.app-modal-fade-enter-from,.app-modal-fade-leave-to{opacity:0}.app-modal-fade-enter-from .app-modal,.app-modal-fade-leave-to .app-modal{transform:translateY(6px) scale(.98)}
</style>
