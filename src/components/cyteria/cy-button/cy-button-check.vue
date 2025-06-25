<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { type ButtonBaseProps, useButtonBaseBinds } from './setup'

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
    class="cy-button-check px-2"
    :class="{
      'py-1': !inline,
    }"
    @click="buttonClick"
  >
    <ButtonIcon
      :icon="selected ? 'ic:round-check-box' : 'ic:round-check-box-outline-blank'"
      :class="iconClass"
    />
    <div v-if="$slots.default" class="ml-2.5 mr-1.5 flex">
      <slot />
    </div>
  </CyButtonBase>
</template>
