<template>
  <span @click="click"
    class="cy-button--line flex items-center justify-start border-l-2 border-solid border-light-2 py-1 px-3 m-2"
    :class="rootClass">
    <iconify-icon v-if="iconifyName" :name="iconifyName" />
    <svg-icon v-if="iconId" :icon-id="iconId" />
    <image-icon v-if="imagePath" :image-path="imagePath" />
    <span v-if="$slots['default']"
      class="text inline-flex items-center ml-2 duration-300 whitespace-nowrap">
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
  mixins: [BaseButton],
  props: {
    inline: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    rootClass() {
      return {
        ...this.baseClass,
        'type-inline': this.inline
      }
    }
  }
};
</script>

<style lang="postcss" scoped>
.cy-button--line {
  --icon-width: 1.3rem;

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

  &.type-inline {
    display: inline-flex;
    min-width: 15rem;
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