<template>
  <span ref="rootElement"
    class="cy--icon-text inline-flex"
    :class="rootClass"
    :style="colorSetStyle">
    <cy-icon :icon="icon" :src="iconSrc" class="icon" />
    <span v-if="$slots['default']" class="text">
      <slot></slot>
    </span>
    <sub-caption v-if="$slots['caption']"
      :root="rootElement">
      <slot name="caption"></slot>
    </sub-caption>
  </span>
</template>

<script>
import { ref } from 'vue';
import IconSet from "./base/icon-set.vue";
import ColorSet from "./base/color-set.vue";
import vue_subCaption from "./components/sub-caption.vue";

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
  setup() {
    const rootElement = ref(null);
    return {
      rootElement
    };
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
  components: {
    'sub-caption': vue_subCaption
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
}
</style>