<template>
  <span @click="click"
    class="cy-button--line button--main-content flex items-center justify-start border-l-2 border-solid py-1 px-3 m-2"
    :class="rootClass">
    <cy-icon :icon="icon" :src="iconSrc" />
    <span v-if="$slots['default']"
      class="button--text inline-flex items-center ml-2 duration-300 whitespace-nowrap">
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
  --border-color: var(--primary-light-2);

  &.type-inline {
    display: inline-flex;
    min-width: 15rem;
  }
}
</style>