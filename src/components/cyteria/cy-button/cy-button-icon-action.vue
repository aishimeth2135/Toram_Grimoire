<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { ButtonBaseProps, ButtonIconProps, useButtonBaseBinds } from './setup'

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

<style lang="postcss" scoped>
.cy-button-icon-action {
  @apply relative rounded border bg-white bg-opacity-100 p-2.5;
  box-shadow: 0.125rem 0.125rem 0 0 var(--button-color-main-light);
}
</style>
