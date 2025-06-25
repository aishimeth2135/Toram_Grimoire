<script lang="ts" setup>
import { computed } from 'vue'

import IconBase from './icon/icon-base.vue'

import { type IconBaseProps } from './icon/setup'

interface Props extends IconBaseProps {
  width?: string
  small?: boolean
}

const props = defineProps<Props>()

const iconStyle = computed(() => {
  if (!props.width) {
    return null
  }
  return {
    width: props.width,
    height: props.width,
  }
})

const iconClass = computed(() => {
  const baseClass = ['cy-icon-base']

  if (props.small) {
    baseClass.push('cy-icon-sm')
  }
  baseClass.push('cy-icon-md')

  return baseClass
})
</script>

<template>
  <IconBase
    :icon="icon"
    :style="iconStyle"
    :class="iconClass"
    class="inline-block max-w-none shrink-0"
  />
</template>

<style>
.cy-icon-md {
  width: 1.125rem;
  height: 1.125rem;
}

.cy-icon-sm {
  width: 0.875rem;
  height: 0.875rem;
}
</style>
