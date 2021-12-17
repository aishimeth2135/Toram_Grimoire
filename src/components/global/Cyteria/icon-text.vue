<template>
  <span
    ref="rootElement"
    class="cy--icon-text"
    :class="rootClass"
    :style="rootStyle"
  >
    <cy-icon :icon="icon" :src="iconSrc" class="icon" />
    <span v-if="$slots['default']" class="text">
      <slot />
    </span>
    <sub-caption
      v-if="$slots['caption']"
      :root="rootElement"
    >
      <slot name="caption" />
    </sub-caption>
  </span>
</template>

<script>
import { ref } from 'vue';

import ColorSet from './base/color-set.vue';
import IconSet from './base/icon-set.vue';
import vue_subCaption from './components/sub-caption.vue';

export default {
  components: {
    'sub-caption': vue_subCaption,
  },
  mixins: [IconSet, ColorSet],
  props: {
    type: {
      type: String,
      default: 'normal',
      validator: v => ['normal', 'item'].includes(v),
    },
    size: {
      type: String,
      default: 'normal',
      validator(v) {
        return ['normal', 'small'].includes(v);
      },
    },
    iconWidth: {
      type: String,
      default: null,
    },
    alignV: {
      type: String,
      default: 'center',
      validator(v) {
        return ['start', 'center'].includes(v);
      },
    },
    displayBlock: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const rootElement = ref(null);
    return {
      rootElement,
    };
  },
  computed: {
    rootStyle() {
      if (this.iconWidth) {
        return {
          ...this.colorSetStyle,
          '--icon-width': this.iconWidth,
        };
      }
      return this.colorSetStyle;
    },
    rootClass() {
      const alignVMapping = {
        'start': 'align-v-start',
        'center': 'align-v-center',
      };
      return {
        'is-item': this.type === 'item',
        ['size-' + this.size]: true,
        [alignVMapping[this.alignV]]: true,
        'flex': this.displayBlock,
        'inline-flex': !this.displayBlock,
      };
    },
  },
};
</script>

<style lang="postcss" scoped>
.cy--icon-text {
  --icon-color: var(--color-set--icon-color);
  --icon-width: 1.2rem;
  --icon-margin-top-fix: 0;
  --text-color: var(--color-set--text-color);
  --text-margin-left: 0.6rem;

  @apply inline-flex items-center;

  & > .text {
    margin-left: var(--text-margin-left);
    color: var(--text-color);
    display: inline-flex;
    align-items: center;
  }

  & > .icon {
    margin-top: var(--icon-margin-top-fix);
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

  &.size-normal {
    font-size: 1rem;
  }
  &.size-small {
    --icon-width: 0.9rem;
    --text-margin-left: 0.4rem;
    @apply text-sm;
  }

  &.align-v-start {
    @apply items-start;
    --icon-margin-top-fix: calc((1.5rem - var(--icon-width)) / 2);
    &.size-small {
      --icon-margin-top-fix: calc((1.25rem - var(--icon-width)) / 2);
    }
  }
  &.align-v-center {
    @apply items-center;
  }
}
</style>
