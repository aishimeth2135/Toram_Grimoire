<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { ButtonBaseProps, ButtonIconProps, useButtonBaseBinding } from './setup'

interface Props extends ButtonBaseProps, ButtonIconProps {}

const props = defineProps<Props>()

const { buttonBaseBinding } = useButtonBaseBinding(props)
</script>

<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinding"
    class="cy-button-icon-action"
  >
    <ButtonIcon :icon="icon" :src="iconSrc" :class="iconClass" />
  </CyButtonBase>
</template>

<style lang="postcss" scoped>
.cy-button-icon-action {
  @apply relative rounded border bg-white bg-opacity-100 p-2.5;
  box-shadow: 0.125rem 0.125rem 0 0 var(--button-color-main-light);
}
</style>
