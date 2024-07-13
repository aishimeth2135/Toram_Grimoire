<script lang="ts" setup>
import { computed } from 'vue'

import IconBase from './icon/icon-base.vue'

import { IconBaseProps } from './icon/setup'
import { useColorString } from './setup'

interface Props extends IconBaseProps {
  iconColor?: string
  color?: string | null
  textColor?: string
  iconWidth?: string
  small?: boolean
  isItem?: boolean
  block?: boolean
  singleColor?: boolean
  alignV?: 'start' | 'center'
}

const props = withDefaults(defineProps<Props>(), {
  color: null,
  small: false,
  isItem: false,
  block: false,
  singleColor: false,
  alignV: 'center',
})

const innerIconWidth = computed(() => {
  if (!props.iconWidth) {
    if (props.isItem) {
      return '0.75rem'
    }
    return props.small ? '0.875rem' : '1.125rem'
  }
  return props.iconWidth
})

const baseColor = computed(() => props.color)

const iconColor = useColorString(
  baseColor,
  computed(() => props.iconColor),
  'primary-30',
  computed(() => !props.singleColor)
)
const textColor = useColorString(
  baseColor,
  computed(() => props.textColor),
  'primary-90'
)

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
  }
})
</script>

<template>
  <div class="cy-icon-text" :class="rootClass">
    <IconBase
      :icon="icon"
      :class="iconClass"
      :style="iconStyle"
      class="flex-shrink-0"
    />
    <span v-if="$slots.default" :class="textClass">
      <slot />
    </span>
  </div>
</template>

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
</style>
