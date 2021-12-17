<template>
  <button
    class="button--main-content inline-flex items-center py-0.5 px-2"
    :class="baseClass"
    @click="click"
  >
    <cy-icon :icon="icon" :src="iconSrc" />
    <span
      v-if="$slots['default']"
      class="button--text inline-flex items-center ml-3 duration-300"
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
