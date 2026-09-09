<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { type ButtonBaseProps } from './setup'

interface Props extends ButtonBaseProps {
  icon: string
}

const props = defineProps<Props>()
</script>

<template>
  <CyButtonBase
    :color="props.color"
    :selected="props.selected"
    :disabled="props.disabled"
    class="cy-button-icon mx-1.5"
  >
    <ButtonIcon :icon="props.icon" class="cy-button-base-icon" />
  </CyButtonBase>
</template>
