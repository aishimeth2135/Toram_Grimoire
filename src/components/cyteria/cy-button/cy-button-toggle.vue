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

interface Emits {
  (evt: 'click', event: MouseEvent): void
  (evt: 'update:selected', value: boolean): void
}
const emit = defineEmits<Emits>()

const buttonBaseBinds = useButtonBaseBinds(props)

const buttonClick = (evt: MouseEvent) => {
  emit('click', evt)
  emit('update:selected', !props.selected)
}
</script>

<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-toggle px-2 py-1"
    @click="buttonClick"
  >
    <ButtonIcon
      :icon="selected ? 'ic:round-toggle-on' : 'ic:outline-toggle-off'"
      :class="iconClass"
      class="cy-button-toggle-icon"
    />
    <div v-if="$slots.default" class="ml-2 mr-1.5 flex">
      <slot />
    </div>
  </CyButtonBase>
</template>
