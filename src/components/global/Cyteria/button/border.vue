<template>
  <button
    class="button--main-content inline-flex items-center py-1 px-3 m-1 rounded-2xl border-1 bg-white"
    :class="baseClass"
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

<script>
import ButtonBase from './base';

export default {
  mixins: [ButtonBase],
};
</script>
