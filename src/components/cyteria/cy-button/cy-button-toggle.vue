<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { type ButtonBaseProps, type ButtonIconProps } from './setup'

interface Props extends ButtonBaseProps, ButtonIconProps {}
const props = defineProps<Props>()

interface Emits {
  (evt: 'click', event: MouseEvent): void
  (evt: 'update:selected', value: boolean): void
}
const emit = defineEmits<Emits>()

const buttonClick = (evt: MouseEvent) => {
  emit('click', evt)
  emit('update:selected', !props.selected)
}
</script>

<template>
  <CyButtonBase
    :color="props.color"
    :selected="props.selected"
    :disabled="props.disabled"
    class="cy-button-toggle gap-icon px-2 py-1"
    @click="buttonClick"
  >
    <ButtonIcon
      :icon="props.selected ? 'ic:round-toggle-on' : 'ic:outline-toggle-off'"
      class="cy-button-base-icon cy-button-toggle-icon"
    />
    <div v-if="$slots.default" class="mr-1.5 flex">
      <slot />
    </div>
  </CyButtonBase>
</template>
