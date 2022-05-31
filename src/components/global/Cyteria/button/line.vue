<template>
  <button
    class="cy-button--line button--main-content flex items-center justify-start border-l-2 border-solid py-1 px-3 m-2"
    :class="baseClassList"
    @click="click"
  >
    <cy-icon :icon="icon" :src="iconSrc" />
    <span
      v-if="$slots['default']"
      class="button--text flex items-center ml-2 duration-300 whitespace-nowrap w-full"
    >
      <slot />
    </span>
    <slot name="tail" />
    <span
      v-if="$slots['content-right']"
      class="inline-flex items-center ml-auto"
    >
      <slot name="content-right" />
    </span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { ButtonBaseProps, setupButtonBase } from './setup'

export default defineComponent({
  name: 'CyButtonLine',
  emits: ['click'],
  props: ButtonBaseProps,
  setup(props, { emit }) {
    return setupButtonBase(props, (evt) => emit('click', evt))
  },
})
</script>

<style lang="postcss" scoped>
.cy-button--line {
  --icon-width: 1.25rem;
  --border-color: var(--app-light-2);
}
</style>
