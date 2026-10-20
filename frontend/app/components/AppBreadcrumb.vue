<template>
  <div class="body-breadcrumb-wrapper">
    <div class="body-breadcrumb-left">
      <!-- Back Button: Square rounded button with left arrow icon matching user mockup -->
      <button
        class="body-breadcrumb-back-btn"
        type="button"
        @click="handleBack"
        title="ย้อนกลับ"
        aria-label="ย้อนกลับ"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- Breadcrumb Items -->
      <nav class="body-breadcrumb-trail" aria-label="Breadcrumb">
        <NuxtLink to="/" class="body-breadcrumb-link">หน้าหลัก</NuxtLink>

        <!-- Optional Market Parent (e.g. ตลาดธนบุรี (สนามหลวง 2)) -->
        <template v-if="market">
          <span class="body-breadcrumb-sep">&gt;</span>
          <NuxtLink v-if="current" :to="marketId ? `/stalls?market=${marketId}` : '/stalls'" class="body-breadcrumb-link">
            {{ market }}
          </NuxtLink>
          <span v-else class="body-breadcrumb-current">{{ market }}</span>
        </template>

        <!-- Optional Intermediate Items List -->
        <template v-for="(item, idx) in items" :key="idx">
          <span class="body-breadcrumb-sep">&gt;</span>
          <NuxtLink v-if="item.to" :to="item.to" class="body-breadcrumb-link">{{ item.label }}</NuxtLink>
          <span v-else class="body-breadcrumb-current">{{ item.label }}</span>
        </template>

        <!-- Active / Current Page Label -->
        <template v-if="current">
          <span class="body-breadcrumb-sep">&gt;</span>
          <span class="body-breadcrumb-current">{{ current }}</span>
        </template>
      </nav>
    </div>

    <!-- Optional Right Slot (e.g. Action buttons) -->
    <div v-if="$slots.actions" class="body-breadcrumb-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  current?: string
  market?: string
  marketId?: string | number
  items?: Array<{ label: string; to?: string }>
  backTo?: string
}>()

const router = useRouter()

const handleBack = () => {
  if (process.client && window.history.state && window.history.state.back) {
    if (window.history.state.back !== '/login') {
      router.back()
      return
    }
  }

  if (props.backTo) {
    router.push(props.backTo)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.body-breadcrumb-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 2px 0;
  flex-wrap: wrap;
}

.body-breadcrumb-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.body-breadcrumb-back-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.body-breadcrumb-back-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: var(--primary);
  transform: translateX(-1px);
}

.body-breadcrumb-back-btn:active {
  transform: translateX(0);
}

.body-breadcrumb-trail {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-family: 'Bai Jamjuree', sans-serif;
  flex-wrap: wrap;
  line-height: 1.4;
}

.body-breadcrumb-link {
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s ease;
}

.body-breadcrumb-link:hover {
  color: var(--primary);
  text-decoration: underline;
}

.body-breadcrumb-sep {
  color: #cbd5e1;
  font-size: 0.75rem;
  font-weight: 300;
  user-select: none;
}

.body-breadcrumb-current {
  color: #0f172a;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.body-breadcrumb-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
