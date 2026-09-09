<script lang="ts" setup>
import { computed } from 'vue'

import { type ButtonBaseProps, ButtonTheme } from './setup'

type Props = ButtonBaseProps

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
})

const classList = computed(() => {
  return {
    [ButtonTheme[props.color]]: true,
    'button-selected': props.selected,
  }
})
</script>

<template>
  <button class="cy-button-base" type="button" :class="classList" :disabled="disabled">
    <slot />
  </button>
</template>
