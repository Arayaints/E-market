<template>
  <div class="stepper-container">
    <!-- Step 1 -->
    <div
      class="stepper-item"
      :class="{
        active: currentStep === 1,
        completed: currentStep > 1
      }"
      @click="onStepClick(1)"
    >
      <div class="stepper-circle">
        <span v-if="currentStep > 1">✓</span>
        <span v-else>01</span>
      </div>
      <div class="stepper-label">เลือกแผงเช่า</div>
    </div>

    <!-- Line 1-2 -->
    <div class="stepper-line" :class="{ completed: currentStep > 1 }"></div>

    <!-- Step 2 -->
    <div
      class="stepper-item"
      :class="{
        active: currentStep === 2,
        completed: currentStep > 2
      }"
      @click="onStepClick(2)"
    >
      <div class="stepper-circle">
        <span v-if="currentStep > 2">✓</span>
        <span v-else>02</span>
      </div>
      <div class="stepper-label">กรอกข้อมูล</div>
    </div>

    <!-- Line 2-3 -->
    <div class="stepper-line" :class="{ completed: currentStep > 2 }"></div>

    <!-- Step 3 -->
    <div
      class="stepper-item"
      :class="{
        active: currentStep === 3
      }"
      @click="onStepClick(3)"
    >
      <div class="stepper-circle">
        <span>03</span>
      </div>
      <div class="stepper-label">ตรวจสอบและยืนยัน</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentStep: number
}>()

const emit = defineEmits<{
  (e: 'changeStep', step: number): void
}>()

const onStepClick = (step: number) => {
  // Only allow navigating backwards to completed steps
  if (step < props.currentStep) {
    emit('changeStep', step)
  }
}
</script>
