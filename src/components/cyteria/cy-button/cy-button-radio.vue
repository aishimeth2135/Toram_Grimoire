<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { ButtonBaseProps, useButtonBaseBinds } from './setup'

interface Props extends ButtonBaseProps {}

const props = defineProps<Props>()

const buttonBaseBinds = useButtonBaseBinds(props)
</script>

<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-radio px-2 py-1"
  >
    <ButtonIcon
      :icon="
        selected
          ? 'ic:round-radio-button-checked'
          : 'ic:round-radio-button-unchecked'
      "
      :class="iconClass"
    />
    <div v-if="$slots.default" class="ml-2 mr-1.5 flex">
      <slot />
    </div>
  </CyButtonBase>
</template>

<style lang="postcss" scoped>
.cy-button-radio {
  @apply rounded-full duration-200;

  &:focus:not(:active) {
    @apply bg-primary-30 bg-opacity-20;
  }
}
</style>
