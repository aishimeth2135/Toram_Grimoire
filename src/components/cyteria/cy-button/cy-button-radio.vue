<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { type ButtonBaseProps } from './setup'

type Props = ButtonBaseProps

const props = defineProps<Props>()
</script>

<template>
  <CyButtonBase
    :color="props.color"
    :selected="props.selected"
    :disabled="props.disabled"
    class="cy-button-radio gap-icon my-1 px-2"
  >
    <ButtonIcon
      :icon="props.selected ? 'ic:round-radio-button-checked' : 'ic:round-radio-button-unchecked'"
      class="cy-button-base-icon"
    />
    <div v-if="$slots.default" class="mr-1.5 flex">
      <slot />
    </div>
  </CyButtonBase>
</template>
