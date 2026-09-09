<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { type ButtonBaseProps, type ButtonIconProps } from './setup'

interface Props extends ButtonBaseProps, ButtonIconProps {
  small?: boolean
  float?: boolean
  toggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  small: false,
  float: false,
  toggle: false,
})
</script>

<template>
  <CyButtonBase
    :color="props.color"
    :selected="props.selected"
    :disabled="props.disabled"
    class="cy-button-circle"
    :class="{
      'button-small': small,
      'button-float': float,
    }"
  >
    <template v-if="props.icon">
      <ButtonIcon
        v-if="props.toggle && props.selected"
        icon="ic-round-close"
        class="cy-button-base-icon"
      />
      <ButtonIcon v-else :icon="props.icon" class="cy-button-base-icon" />
    </template>
  </CyButtonBase>
</template>
