<template>
  <div
    class="flex shrink-0 justify-center rounded-full border bg-white p-1.5"
    :class="colorClasses.border"
  >
    <cy-icon :icon="icon" :class="colorClasses.text" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const iconCircleColorClassMap = {
  primary: { border: 'border-primary-30', text: 'text-primary-30' },
  emerald: { border: 'border-emerald-30', text: 'text-emerald-30' },
} as const

type IconCircleColor = keyof typeof iconCircleColorClassMap

interface Props {
  icon: string
  color?: IconCircleColor
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
})

const colorClasses = computed(() => iconCircleColorClassMap[props.color])
</script>
