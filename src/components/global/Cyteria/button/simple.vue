<template>
  <button
    class="button--main-content inline-flex items-center border-b border-solid py-0.5 px-2 m-1"
    :class="baseClassList"
    @click="click"
  >
    <cy-icon :icon="icon" :src="iconSrc" />
    <span
      v-if="$slots['default']"
      class="button--text inline-flex items-center ml-2 duration-300"
    >
      <slot />
    </span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { ButtonBaseProps, setupButtonBase } from './setup'

export default defineComponent({
  name: 'CyButtonSimple',
  emits: ['click'],
  props: ButtonBaseProps,
  setup(props, { emit }) {
    return setupButtonBase(props, (evt) => emit('click', evt))
  },
})
</script>
