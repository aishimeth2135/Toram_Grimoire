<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { type ButtonBaseProps, type ButtonIconProps } from './setup'

interface Props extends ButtonBaseProps, ButtonIconProps {}

const props = defineProps<Props>()
</script>

<template>
  <CyButtonBase
    :color="props.color"
    :selected="props.selected"
    :disabled="props.disabled"
    class="cy-button-icon-action"
  >
    <ButtonIcon :icon="props.icon" class="cy-button-base-icon" />
  </CyButtonBase>
</template>
