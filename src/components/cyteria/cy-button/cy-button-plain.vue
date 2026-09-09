<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { type ButtonBaseProps, type ButtonIconProps } from './setup'

interface Props extends ButtonBaseProps, ButtonIconProps {
  widthFull?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  widthFull: false,
})

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
    class="cy-button-plain gap-icon m-1"
    :class="{ 'button-width-full': widthFull }"
    @click="buttonClick"
  >
    <ButtonIcon :icon="props.icon" class="cy-button-base-icon" />
    <span class="mr-1">
      <slot />
    </span>
  </CyButtonBase>
</template>
