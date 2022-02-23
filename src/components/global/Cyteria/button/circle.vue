<template>
  <button
    class="button--main-content inline-flex items-center justify-center border-1 bg-white rounded-full"
    :style="widthStyle"
    :class="baseClassList"
    @click="click"
  >
    <cy-icon :icon="icon" :src="iconSrc" />
  </button>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { ButtonBaseProps, setupButtonBase } from './setup'

export default defineComponent({
  name: 'CyButtonCircle',
  emits: ['click'],
  props: {
    size: {
      type: String,
      default: 'normal',
      validation: (value: string) => ['normal', 'small'].includes(value),
    },
    ...ButtonBaseProps,
  },
  setup(props, { emit }) {
    const widthStyle = computed(() => {
      const width = props.size === 'normal' ? '2.75rem' : '2.25rem'
      const iconWidth = props.size === 'normal' ? '1.25rem' : '1rem'
      return {
        width: width,
        height: width,
        '--icon-width': iconWidth,
      } as Record<string, string>
    })
    const base = setupButtonBase(props, (evt) => emit('click', evt))
    return {
      baseClassList: base.baseClassList,
      click: base.click,
      widthStyle,
    }
  },
})
</script>
