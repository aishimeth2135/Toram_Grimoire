<template>
  <span ref="cy-button--icon" @click="click"
    @mouseenter="updateCaptionPosition"
    class="cy-button--icon button--main-content inline-flex p-1 mx-1 relative"
    :class="baseClass">
    <cy-icon :icon="icon" :src="iconSrc" />
    <div v-if="$slots['caption']"
      class="caption-container absolute py-2 px-3 border-1 rounded-lg border-purple z-5 bg-white"
      :style="captionPosition">
      <slot name="caption"></slot>
    </div>
  </span>
</template>

<script>
import BaseButton from "./base";

export default {
  mixins: [BaseButton],
  data() {
    return {
      captionPosition: null
    }
  },
  methods: {
    updateCaptionPosition() {
      const el = this.$refs['cy-button--icon'];
      if (!el) {
        return null;
      }
      const rect = el.getBoundingClientRect();

      const position = {};

      const len2bottom = window.innerHeight - rect.bottom;
      if (rect.top >= len2bottom) {
        position.bottom = '100%';
      } else {
        position.top = '100%';
      }
      const len2right = window.innerWidth - rect.right;
      if (rect.left >= len2right) {
        position.right = '0';
      } else {
        position.left = '0';
      }
      this.captionPosition = position;
    }
  }
};
</script>

<style lang="postcss" scoped>
.cy-button--icon {
  --icon-width: 1.3rem;

  & > .caption-container {
    display: none;
  }

  &:hover > .caption-container {
    display: flex;
    flex-wrap: wrap;
    @apply min-w-max;
  }
}
</style>