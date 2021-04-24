<template>
  <span @click="click"
    class="cy-button--border button--main-content inline-flex items-center py-1 px-3 m-1 rounded-2xl border-1 border-solid bg-white"
    :class="baseClass">
    <cy-icon :icon="icon" :src="iconSrc" />
    <span v-if="$slots['default']"
      class="button--text inline-flex items-center ml-2 mr-1 duration-300">
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

<style lang="postcss" scoped>
.cy-button--border {
  --icon-width: 1.2rem;

  & > svg, & > img {
    display: block;
    flex-shrink: 0;
    fill: currentcolor;
    color: var(--icon-color);
    height: var(--icon-width);
    width: var(--icon-width);

    @apply duration-300;
  }

  & > .text {
    color: var(--text-color);
  }

  &:hover, &.selected {
    @apply border-light-3;

    & > svg {
      color: var(--icon-color-hover);
    }
    & > .text {
      color: var(--text-color-hover);
    }
  }
}
</style>