<script lang="ts" setup>
import { computed } from 'vue'

import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { ButtonBaseProps, useButtonBaseBinds } from './setup'

interface Props extends ButtonBaseProps {
  icon: string
  iconColor?: string
  iconColorHover?: string
}

const props = defineProps<Props>()

const buttonBaseBinds = useButtonBaseBinds(props)

const rootStyle = computed(() => {
  const styles = {} as Record<string, string>
  if (props.iconColor) {
    styles['--button-color-icon'] = `var(--app-${props.iconColor})`
    styles['--button-color-icon-hover'] = `var(--app-${props.iconColor})`
  }
  if (props.iconColorHover) {
    styles['--button-color-icon-hover'] = `var(--app-${props.iconColorHover})`
  }
  return styles
})
</script>

<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    :style="rootStyle"
    class="cy-button-icon mx-1"
  >
    <ButtonIcon :icon="icon" :class="iconClass" />
  </CyButtonBase>
</template>

<style lang="postcss" scoped>
.cy-button-icon {
  @apply rounded-full duration-200;

  &:focus:not(:active) {
    @apply bg-primary-30 bg-opacity-20;
  }
}
</style>
