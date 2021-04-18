<template>
  <span @click="click"
    class="cy-button--simple inline-flex items-center border-b border-solid border-light py-1.5 px-2 m-1"
    :class="baseClass">
    <iconify-icon v-if="iconifyName" :name="iconifyName" />
    <svg-icon v-if="iconId" :icon-id="iconId" />
    <image-icon v-if="imagePath" :image-path="imagePath" />
    <span v-if="$slots['default']"
      class="text inline-flex items-center ml-2 duration-300">
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
.cy-button--simple {
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