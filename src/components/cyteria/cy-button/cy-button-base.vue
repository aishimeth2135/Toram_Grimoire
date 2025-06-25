<script lang="ts" setup>
import { computed } from 'vue'

import { type ButtonBaseProps } from './setup'

type Props = ButtonBaseProps

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
})

const classList = computed(() => {
  return {
    [`theme-${props.color}`]: true,
    'button-selected': props.selected,
  }
})
</script>

<template>
  <component
    :is="link ? 'a' : 'button'"
    class="cy-button-base"
    :class="classList"
    :disabled="disabled"
  >
    <slot icon-class="cy-button-base-icon" />
  </component>
</template>
