<template>
  <span
    class="cy-button--border button--main-content inline-flex items-center py-1 px-3 m-1 rounded-2xl border-1 border-solid bg-white"
    :class="baseClass"
    @click="click"
  >
    <cy-icon :icon="icon" :src="iconSrc" />
    <span
      v-if="$slots['default']"
      class="button--text inline-flex items-center ml-2 mr-1 duration-300"
    >
      <slot />
    </span>
  </span>
</template>

<script>
import BaseButton from "./base";

export default {
  mixins: [BaseButton],
};
</script>
