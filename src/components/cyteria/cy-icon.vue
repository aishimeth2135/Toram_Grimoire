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
    '--icon-size': props.width,
  }
})

const iconClass = computed(() => {
  const baseClass = []

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
@layer components {
  .cy-icon-md {
    --icon-size: 1.125rem;
    width: var(--icon-size);
    height: var(--icon-size);
  }

  .cy-icon-sm {
    --icon-size: 0.875rem;
  }
}
</style>
