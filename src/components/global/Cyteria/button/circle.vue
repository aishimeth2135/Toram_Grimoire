<template>
  <button
    class="button--main-content inline-flex items-center justify-center mr-2 mb-2 border-1 bg-white rounded-full"
    style="width: 2.8rem; height: 2.8rem;"
    :class="baseClassList"
    @click="click"
  >
    <cy-icon :icon="icon" :src="iconSrc" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { ButtonBaseProps, setupButtonBase } from './setup'

export default defineComponent({
  name: 'CyButtonCircle',
  emits: ['click'],
  props: ButtonBaseProps,
  setup(props, { emit }) {
    return setupButtonBase(props, (evt) => emit('click', evt))
  },
})
</script>
