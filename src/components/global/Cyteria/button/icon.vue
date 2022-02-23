<template>
  <button
    class="button--main-content inline-flex p-1 mx-1 relative"
    :class="baseClassList"
    style="--icon-width: 1.25rem"
    @click="click"
  >
    <cy-icon :icon="icon" :src="iconSrc" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { ButtonBaseProps, setupButtonBase } from './setup'

export default defineComponent({
  name: 'CyButtonIcon',
  emits: ['click'],
  props: ButtonBaseProps,
  setup(props, { emit }) {
    return setupButtonBase(props, (evt) => emit('click', evt))
  },
})
</script>
