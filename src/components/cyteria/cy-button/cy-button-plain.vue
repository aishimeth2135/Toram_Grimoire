<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import {
  type ButtonBaseProps,
  type ButtonIconProps,
  useButtonBaseBinds,
} from './setup'

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
    class="cy-button-plain m-1"
    :class="{ 'button-width-full': widthFull }"
    @click="buttonClick"
  >
    <ButtonIcon :icon="icon" :class="iconClass" />
    <span class="mr-1" :class="icon !== null ? 'ml-2' : 'ml-1'">
      <slot />
    </span>
  </CyButtonBase>
</template>
