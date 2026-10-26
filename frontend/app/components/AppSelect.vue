<template>
  <div ref="rootRef" class="app-select-container" :class="{ 'is-open': isOpen, 'is-disabled': disabled }">
    <!-- Trigger Button -->
    <button
      type="button"
      class="app-select-trigger"
      :class="{ 'has-value': !!selectedOption, 'is-focused': isOpen, 'is-error': Boolean(error) }"
      :disabled="disabled"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      :aria-invalid="Boolean(error)"
    >
      <span class="app-select-label">
        {{ selectedLabel || placeholder }}
      </span>
      <span class="app-select-arrow" :class="{ 'is-rotated': isOpen }">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    </button>
    <span v-if="typeof error === 'string' && error" class="app-select-error">{{ error }}</span>

    <!-- Dropdown Menu -->
    <transition name="app-select-fade">
      <div v-if="isOpen" class="app-select-menu">
        <div class="app-select-list" role="listbox">
          <div
            v-for="opt in normalizedOptions"
            :key="opt.value"
            class="app-select-option"
            :class="{ 'is-selected': isOptionSelected(opt) }"
            role="option"
            :aria-selected="isOptionSelected(opt)"
            @click.stop="selectOption(opt)"
          >
            <span class="app-select-option-text">{{ opt.label }}</span>
            <span v-if="isOptionSelected(opt)" class="app-select-check">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export interface SelectOption {
  value: string | number
  label: string
}

const props = withDefaults(defineProps<{
  modelValue?: string | number
  options: (SelectOption | string)[]
  placeholder?: string
  disabled?: boolean
  error?: boolean | string
}>(), {
  modelValue: '',
  options: () => [],
  placeholder: 'กรุณาเลือก...',
  disabled: false,
  error: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void
  (e: 'change', val: string | number): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const normalizedOptions = computed<SelectOption[]>(() => {
  return props.options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt }
    }
    return opt
  })
})

const isOptionSelected = (opt: SelectOption) => {
  const currentVal = props.modelValue ?? ''
  return String(opt.value) === String(currentVal)
}

const selectedOption = computed(() => {
  const currentVal = props.modelValue ?? ''
  return normalizedOptions.value.find(o => String(o.value) === String(currentVal))
})

const selectedLabel = computed(() => {
  return selectedOption.value?.label || ''
})

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const selectOption = (opt: SelectOption) => {
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
  isOpen.value = false
  // ป้องกัน event จากคอนเทนเนอร์ภายนอกเปิดเมนูซ้ำในรอบ click เดียวกัน
  requestAnimationFrame(() => { isOpen.value = false })
}

const handleClickOutside = (e: MouseEvent) => {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.app-select-container {
  position: relative;
  width: 100%;
  font-family: inherit;
}

.app-select-container.is-open {
  z-index: 50;
}

.app-select-trigger {
  width: 100%;
  min-height: 42px;
  padding: 9px 14px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.88rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: all 0.18s ease;
  outline: none;
  text-align: left;
}

.app-select-trigger:hover:not(:disabled) {
  border-color: #94a3b8;
  background: #f8fafc;
}

.app-select-trigger.is-focused {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.app-select-trigger.has-value {
  color: #1e293b;
  font-weight: 500;
}

.app-select-trigger.is-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 1px #ef4444, 0 1px 2px rgba(239, 68, 68, 0.1) !important;
  background: #fffafa;
}

.app-select-error {
  display: block;
  margin-top: 5px;
  color: #dc2626;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.3;
}

.app-select-trigger:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.75;
}

.app-select-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-select-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.app-select-arrow.is-rotated {
  transform: rotate(180deg);
  color: #2563eb;
}

.app-select-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 100;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12), 0 4px 10px rgba(15, 23, 42, 0.04);
  padding: 6px;
  max-height: 260px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.app-select-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 0.86rem;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.app-select-option:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.app-select-option.is-selected {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.app-select-check {
  display: inline-flex;
  align-items: center;
  color: #2563eb;
  flex-shrink: 0;
  margin-left: 8px;
}

.app-select-fade-enter-active,
.app-select-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.app-select-fade-enter-from,
.app-select-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
