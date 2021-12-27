<template>
  <span
    class="cy--icon-text"
    :class="rootClass"
    :style="rootStyle"
  >
    <cy-icon :icon="icon" :src="iconSrc" class="icon" />
    <span v-if="$slots['default']" class="text">
      <slot />
    </span>
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from 'vue';

import { IconSetProps } from './setup/icon-set';
import { ColorSetProps, setupColorSetStyles } from './setup/color-set';

export default defineComponent({
  // mixins: [IconSet, ColorSet],
  name: 'CyIconText',
  props: {
    type: {
      type: String as PropType<'normal' | 'item'>,
      default: 'normal',
      validator: (value: string) => ['normal', 'item'].includes(value),
    },
    size: {
      type: String as PropType<'normal' | 'small'>,
      default: 'normal',
      validator: (value: string) => {
        return ['normal', 'small'].includes(value);
      },
    },
    iconWidth: {
      type: String,
      default: null,
    },
    alignV: {
      type: String as PropType<'start' | 'center'>,
      default: 'center',
      validator: (value: string) => {
        return ['start', 'center'].includes(value);
      },
    },
    displayBlock: {
      type: Boolean,
      default: false,
    },
    ...IconSetProps,
    ...ColorSetProps,
  },
  setup(props) {
    const { colorSetStyles } = setupColorSetStyles(props);
    const {
      iconWidth,
      type,
      size,
      alignV,
      displayBlock,
    } = toRefs(props);

    const rootStyle = computed(() => {
      if (iconWidth.value !== null) {
        return {
          ...colorSetStyles.value,
          '--icon-width': iconWidth.value,
        };
      }
      return colorSetStyles.value;
    });

    const rootClass = () => computed(() => {
      const alignVMapping = {
        'start': 'align-v-start',
        'center': 'align-v-center',
      };
      return {
        'is-item': type.value === 'item',
        ['size-' + size.value]: true,
        [alignVMapping[alignV.value]]: true,
        'flex': displayBlock.value,
        'inline-flex': !displayBlock.value,
      };
    });

    return {
      rootStyle,
      rootClass,
    };
  },
});
</script>

<style lang="postcss" scoped>
.cy--icon-text {
  --icon-color: var(--color-set--icon-color);
  --icon-width: 1.25rem;
  --icon-margin-top-fix: 0;
  --text-color: var(--color-set--text-color);
  --text-margin-left: 0.625rem;

  @apply inline-flex items-center;

  & > .text {
    margin-left: var(--text-margin-left);
    color: var(--text-color);

    @apply inline-flex items-center;
  }

  & > .icon {
    margin-top: var(--icon-margin-top-fix);
  }

  &.is-item {
    & > .icon {
      --icon-width: 0.75rem;
      @apply mb-1 self-end;
    }
    & > .text {
      @apply ml-1 self-end;
    }
  }

  &.size-normal {
    font-size: 1rem;
  }
  &.size-small {
    --icon-width: 0.875rem;
    --text-margin-left: 0.375rem;
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
