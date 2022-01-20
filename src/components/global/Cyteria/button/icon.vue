<template>
  <button
    class="cy-button--icon button--main-content inline-flex p-1 mx-1 relative"
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
  name: 'CyButtonIcon',
  emits: ['click'],
  props: ButtonBaseProps,
  setup(props, { emit }) {
    return setupButtonBase(props, (evt) => emit('click', evt))
  },
})
</script>

<style scoped>
.cy-button--icon {
  --icon-width: 1.25rem;
}
</style>
