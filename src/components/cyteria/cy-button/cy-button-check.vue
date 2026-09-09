<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { type ButtonBaseProps } from './setup'

interface Props extends ButtonBaseProps {
  inline?: boolean
}
interface Emits {
  (evt: 'click', event: MouseEvent): void
  (evt: 'update:selected', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  inline: false,
})
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
    class="cy-button-check gap-icon px-2"
    :class="{
      'py-1': !inline,
    }"
    @click="buttonClick"
  >
    <ButtonIcon
      :icon="props.selected ? 'ic:round-check-box' : 'ic:round-check-box-outline-blank'"
      class="cy-button-base-icon"
    />
    <div v-if="$slots.default" class="mr-1.5 flex">
      <slot />
    </div>
  </CyButtonBase>
</template>
