<template>
  <button
    class="button--main-content inline-flex items-center py-1 px-3 m-1 rounded-2xl border-1 bg-white"
    :class="baseClassList"
    @click="click"
  >
    <slot name="icon">
      <cy-icon :icon="icon" :src="iconSrc" />
    </slot>
    <span
      v-if="$slots['default']"
      class="button--text inline-flex items-center ml-2 mr-1 duration-300"
    >
      <slot />
    </span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { ButtonBaseProps, setupButtonBase } from './setup';

export default defineComponent({
  name: 'CyButtonBorder',
  emits: ['click'],
  props: ButtonBaseProps,
  setup(props, { emit }) {
    return setupButtonBase(props, (evt) => emit('click', evt));
  },
});
</script>
