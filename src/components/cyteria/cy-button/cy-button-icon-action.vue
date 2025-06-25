<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import {
  type ButtonBaseProps,
  type ButtonIconProps,
  useButtonBaseBinds,
} from './setup'

interface Props extends ButtonBaseProps, ButtonIconProps {}

const props = defineProps<Props>()

const buttonBaseBinds = useButtonBaseBinds(props)
</script>

<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-icon-action"
  >
    <ButtonIcon :icon="icon" :class="iconClass" />
  </CyButtonBase>
</template>
