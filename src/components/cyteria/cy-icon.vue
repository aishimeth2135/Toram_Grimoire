<script lang="ts" setup>
import { computed } from 'vue'
import { useCssModule } from 'vue'

import IconBase from './icon/icon-base.vue'

import { IconSrc } from './icon/setup'
import { normalizeIconColorString } from './setup'

interface Props {
  icon?: string
  path?: string
  color?: string
  width?: string
  small?: boolean
}

const props = defineProps<Props>()

const iconStyle = computed(() => {
  if (!props.width) {
    return null
  }
  return {
    width: props.width,
    height: props.width,
  }
})

const classes = useCssModule()

const iconColor = computed(() => {
  if (!props.color) {
    return 'primary-30'
  }
  return normalizeIconColorString(props.color)
})

const iconClass = computed(() => {
  const baseClass = [`text-${iconColor.value}`]

  if (props.small) {
    baseClass.push(classes.sm)
  }
  baseClass.push(classes.md)

  return baseClass
})

const iconData = computed(() => {
  const data: { src: IconSrc; icon: string | undefined } = {
    src: 'iconify',
    icon: props.icon,
  }

  if (props.path) {
    data.src = 'image'
    data.icon = props.path
    return data
  }

  if (data.icon?.startsWith('@')) {
    data.src = 'custom'
    data.icon = data.icon.slice(1)
  }

  return data
})
</script>

<template>
  <IconBase
    :icon="iconData.icon"
    :src="iconData.src"
    :style="iconStyle"
    :class="iconClass"
    class="inline-block"
  />
</template>

<style lang="postcss" module>
.md {
  width: 1.125rem;
  height: 1.125rem;
}

.sm {
  width: 0.875rem;
  height: 0.875rem;
}
</style>
