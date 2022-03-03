<template>
  <div class="cy--default-tips flex items-center justify-center px-2 py-4">
    <div class="flex items-center whitespace-normal">
      <cy-icon-text
        :icon="icon"
        :icon-src="iconSrc"
        icon-width="2.75rem"
        icon-color="light-2"
        class="mr-3"
      />
      <span :style="contentStyle" class="text-dark text-opacity-60">
        <slot />
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, StyleValue } from 'vue'

import { IconSetProps } from './setup/icon-set'

export default defineComponent({
  props: {
    ...IconSetProps,
    'icon': {
      type: String,
      default: 'bx:message-detail',
    },
    'textAlign': {
      type: String,
      default: 'center',
    },
  },
  setup(props) {
    const contentStyle = computed(() => {
      return { 'text-align': props.textAlign } as StyleValue
    })
    return { contentStyle }
  },
})
</script>
