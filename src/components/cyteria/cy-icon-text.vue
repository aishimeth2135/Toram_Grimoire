<template>
  <div class="cy-icon-text" :class="rootClass">
    <IconBase
      :icon="icon"
      :src="iconSrc"
      :class="iconClass"
      :style="iconStyle"
      class="flex-shrink-0"
    />
    <span v-if="$slots.default" :class="textClass">
      <slot />
    </span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'

import Color from '@/shared/services/Color'

import IconBase from './icon/icon-base.vue'

import { IconBaseProps } from './icon/setup'

export default defineComponent({
  props: {
    ...IconBaseProps,
    iconColor: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },
    textColor: {
      type: String,
      default: null,
    },
    iconWidth: {
      type: String,
    },
    small: {
      type: Boolean,
      default: false,
    },
    isItem: {
      type: Boolean,
      default: false,
    },
    block: {
      type: Boolean,
      default: false,
    },
    singleColor: {
      type: Boolean,
      default: false,
    },
    alignV: {
      type: String as PropType<'start' | 'center'>,
      default: 'center',
      validator: (value: string) => {
        return ['start', 'center'].includes(value)
      },
    },
    textMinimize: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    IconBase,
  },
  setup(props) {
    const innerIconWidth = computed(() => {
      if (!props.iconWidth) {
        if (props.isItem) {
          return '0.75rem'
        }
        return props.small ? '0.875rem' : '1.125rem'
      }
      return props.iconWidth
    })

    const handleColorValue = (type: 'icon' | 'text', value: undefined | null | string, defaultValue: string) => {
      if (typeof value !== 'string') {
        if (props.color) {
          let color = props.color
          if (!color.includes('-') && color !== 'white') {
            color += '-60'
          }
          value = type === 'icon' && !props.singleColor ? Color.lighten(color) : color
        } else {
          value = 'default'
        }
      }
      return value === 'default' ? defaultValue : value
    }

    const iconColor = computed(() => handleColorValue('icon', props.iconColor, 'primary-30'))
    const textColor = computed(() => handleColorValue('text', props.textColor, 'primary-90'))

    const rootClass = computed(() => {
      return {
        [props.block ? 'flex' : 'inline-flex']: true,
        [`align-v-${props.alignV}`]: props.alignV !== 'center',
        'size-small': props.small,
        'text-sm': props.small,
        'items-center': props.alignV === 'center',
        'items-start': props.alignV === 'start',
      }
    })

    const iconClass = computed(() => {
      return {
        [`text-${iconColor.value}`]: true,
        'self-end': props.isItem,
        'cy-icon-text-icon': true,
      }
    })

    const iconStyle = computed(() => {
      return {
        '--icon-text-icon-width': innerIconWidth.value,
      }
    })

    const textClass = computed(() => {
      return {
        [`text-${textColor.value}`]: true,
        [props.small ? 'ml-2' : 'ml-1.5']: true,
        'cy-icon-text-minimize': props.textMinimize,
      }
    })

    return {
      rootClass,
      iconClass,
      iconStyle,
      textClass,
    }
  },
})
</script>

<style lang="postcss" scoped>
.cy-icon-text-icon {
  width: var(--icon-text-icon-width);
  height: var(--icon-text-icon-width);
}
.cy-icon-text.align-v-start {
  & > .cy-icon-text-icon {
    margin-top: calc((1.5rem - var(--icon-text-icon-width)) / 2);
  }

  &.size-small > .cy-icon-text-icon {
    margin-top: calc((1.25rem - var(--icon-text-icon-width)) / 2);
  }
}

.cy-icon-text-minimize {
  @apply text-sm leading-none;
}
</style>
