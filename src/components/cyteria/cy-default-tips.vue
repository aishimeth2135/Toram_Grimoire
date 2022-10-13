<template>
  <div class="flex items-center justify-center px-2 py-4">
    <div class="flex items-center whitespace-normal">
      <cy-icon-text
        :icon="icon"
        :icon-src="iconSrc"
        icon-width="2.75rem"
        icon-color="primary-30"
        class="mr-3"
      />
      <span :style="contentStyle" class="text-primary-90">
        <slot />
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { StyleValue, computed, defineComponent } from 'vue'

import { IconBaseProps } from './icon/setup'

export default defineComponent({
  props: {
    ...IconBaseProps,
    icon: {
      type: String,
      default: 'bx:message-detail',
    },
    textAlign: {
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
