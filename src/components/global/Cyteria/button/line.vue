<template>
  <button
    class="cy-button--line button--main-content flex items-center justify-start border-l-2 border-solid py-1 px-3 m-2"
    :class="rootClass"
    @click="click"
  >
    <cy-icon :icon="icon" :src="iconSrc" />
    <span
      v-if="$slots['default']"
      class="button--text flex items-center ml-2 duration-300 whitespace-nowrap w-full"
    >
      <slot />
    </span>
    <slot name="tail" />
    <span
      v-if="$slots['content-right']"
      class="inline-flex items-center ml-auto"
    >
      <slot name="content-right" />
    </span>
  </button>
</template>

<script>
import ButtonBase from './base';

export default {
  mixins: [ButtonBase],
  props: {
    inline: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    rootClass() {
      return {
        ...this.baseClass,
        'type-inline': this.inline,
      };
    },
  },
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
