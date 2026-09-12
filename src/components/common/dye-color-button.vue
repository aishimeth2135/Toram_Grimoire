<script lang="ts" setup>
import { computed } from 'vue'

import { getColorCode } from '@/lib/Items/Dye/DyeColors'

interface Props {
  color: number
}

const props = defineProps<Props>()

const backgroundColor = computed<string>(() => {
  if (props.color === 0) {
    return 'transparent'
  }
  const colorCode = getColorCode(props.color)
  return colorCode ?? 'transparent'
})

const rootClass = computed(() => {
  if (props.color === 0) {
    return 'border-gray-60 text-gray-60'
  }
  return props.color > 47 || (props.color >= 3 && props.color <= 6)
    ? 'border-[#fff] text-[#fff]'
    : 'border-[#333] text-[#333]'
})
</script>

<template>
  <button
    type="button"
    class="cursor-pointer border leading-7"
    :class="rootClass"
    :style="{ backgroundColor }"
  >
    {{ color === 0 ? '-' : color.toString() }}
  </button>
</template>
