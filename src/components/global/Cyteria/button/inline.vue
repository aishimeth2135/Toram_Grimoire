<template>
  <span @click="click"
    class="button--main-content inline-flex items-center py-0.5 px-2"
    :class="baseClass">
    <cy-icon :icon="icon" :src="iconSrc" />
    <span v-if="$slots['default']"
      class="button--text inline-flex items-center ml-3 duration-300">
      <slot></slot>
    </span>
  </span>
</template>

<script>
import BaseButton from "./base";

export default {
  mixins: [BaseButton]
};
</script>