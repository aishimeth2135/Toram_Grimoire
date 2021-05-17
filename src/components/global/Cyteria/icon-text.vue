<template>
  <span ref="cy--icon-text"
    @mouseenter="updateCaptionPosition"
    class="cy--icon-text inline-flex relative"
    :class="rootClass"
    :style="colorSetStyle">
    <cy-icon :icon="icon" :src="iconSrc" class="icon" />
    <span v-if="$slots['default']" class="text">
      <slot></slot>
    </span>
    <div v-if="$slots['caption']"
      class="caption-container absolute py-2 px-3 border-1 rounded-lg border-purple z-5 bg-white"
      :style="captionPosition">
      <slot name="caption"></slot>
    </div>
  </span>
</template>

<script>
import IconSet from "./base/icon-set.vue";
import ColorSet from "./base/color-set.vue";

export default {
  mixins: [IconSet, ColorSet],
  props: {
    type: {
      type: String,
      default: 'normal',
      validator: v => ['normal', 'item'].includes(v)
    },
    textSize: {
      type: String,
      default: 'normal',
      validator(v) {
        return ['normal', 'small'].includes(v);
      }
    },
    display: {
      type: String,
      default: 'inline',
      validator(v) {
        return ['inline', 'block'].includes(v);
      }
    }
  },
  data() {
    return {
      captionPosition: null
    }
  },
  computed: {
    rootClass() {
      return {
        'is-item': this.type === 'item',
        ['text-' + this.textSize]: true,
        ['display-' + this.display]: true
      };
    }
  },
  methods: {
    updateCaptionPosition() {
      const el = this.$refs['cy--icon-text'];
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
<style lang="less" scoped>
.cy--icon-text {
  display: inline-flex;
  align-items: center;
  --icon-color: var(--color-set--icon-color);
  --icon-width: 1.2rem;
  --text-color: var(--color-set--text-color);
  --text-margin-left: 0.6rem;

  &.display-block {
    display: flex;
  }

  & > .text {
    margin-left: var(--text-margin-left);
    color: var(--text-color);
    display: inline-flex;
    align-items: center;
  }

  &.is-item {
    & > .icon {
      --icon-width: 0.8rem;
      align-self: flex-end;
      margin-bottom: 0.2rem;
    }
    & > .text {
      margin-left: 0.2rem;
      align-items: flex-end;
    }
  }

  &.text-normal {
    font-size: 1rem;
  }
  &.text-small {
    --icon-width: 0.9rem;
    --text-margin-left: 0.5rem;
    @apply text-sm;
  }
<<<<<<< Updated upstream

  @colors: ~'dark', ~'light', ~'light-2', ~'light-3', ~'light-4', ~'purple',
    ~'red', ~'red-light', ~'water-blue', ~'water-blue-light',
    ~'gray', ~'gray-light', ~'orange', ~'orange-light', ~'green',
    ~'blue-green', ~'blue-green-light';
  @color-texts: ~'text', ~'icon';
  each(@colors, .(@color) {
    each(@color-texts, .(@name) {
      &.@{name}-color-@{color} {
        --@{name}-color: ~'var(--primary-@{color})';
      }
      &.@{name}-color-hover-@{color} {
        --@{name}-color-hover: ~'var(--primary-@{color})';
      }
    })
  });
=======
>>>>>>> Stashed changes
}
</style>