<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { ButtonBaseProps, useButtonBaseBinds } from './setup'

interface Props extends ButtonBaseProps {
  inline?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  inline: false,
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
    class="cy-button-check px-2"
    :class="{
      'py-1': !inline,
    }"
    @click="buttonClick"
  >
    <ButtonIcon
      :icon="
        selected ? 'ic:round-check-box' : 'ic:round-check-box-outline-blank'
      "
      :class="iconClass"
    />
    <div v-if="$slots.default" class="ml-2.5 mr-1.5 flex">
      <slot />
    </div>
  </CyButtonBase>
</template>

<style lang="postcss" scoped>
.cy-button-check {
  @apply rounded-full duration-200;

  &:focus:not(:active) {
    @apply bg-primary-30 bg-opacity-20;
  }
}
</style>
