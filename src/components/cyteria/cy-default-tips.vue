<template>
  <div class="flex items-center justify-center px-2 py-4">
    <div class="flex items-center whitespace-normal">
      <cy-icon :icon="icon" width="2.75rem" class="mr-3" />
      <span :style="contentStyle" class="text-primary-70">
        <slot />
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type StyleValue, computed } from 'vue'

import { type IconBaseProps } from './icon/setup'

interface Props extends IconBaseProps {
  textAlign?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'bx:message-detail',
  textAlign: 'center',
})

const contentStyle = computed(() => {
  return { 'text-align': props.textAlign } as StyleValue
})
</script>
