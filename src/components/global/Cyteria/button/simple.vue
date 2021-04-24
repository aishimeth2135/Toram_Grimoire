<template>
  <span @click="click"
    class="button--main-content inline-flex items-center border-b border-solid py-1 px-2 m-1"
    :class="baseClass">
    <cy-icon :icon="icon" :src="iconSrc" />
    <span v-if="$slots['default']"
      class="button--text inline-flex items-center ml-2 duration-300">
      <slot></slot>
    </span>
    <slot name="tail"></slot>
    <span v-if="$slots['content-right']"
      class="inline-flex items-center ml-auto">
      <slot name="content-right"></slot>
    </span>
  </span>
</template>

<script>
import BaseButton from "./base";

export default {
  mixins: [BaseButton]
};
</script>