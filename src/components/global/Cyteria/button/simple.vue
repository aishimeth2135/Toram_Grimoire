<template>
  <span @click="click"
    class="button--main-content inline-flex items-center border-b border-solid py-0.5 px-2 m-1"
    :class="baseClass">
    <cy-icon :icon="icon" :src="iconSrc" />
    <span v-if="$slots['default']"
      class="button--text inline-flex items-center ml-2 duration-300">
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