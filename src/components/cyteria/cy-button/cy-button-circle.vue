<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { type ButtonBaseProps, type ButtonIconProps, useButtonBaseBinds } from './setup'

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

const buttonBaseBinds = useButtonBaseBinds(props)
</script>

<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-circle"
    :class="{
      'button-small': small,
      'button-float': float,
    }"
  >
    <template v-if="icon">
      <ButtonIcon v-if="toggle && selected" icon="ic-round-close" :class="iconClass" />
      <ButtonIcon v-else :icon="icon" :class="iconClass" />
    </template>
  </CyButtonBase>
</template>
