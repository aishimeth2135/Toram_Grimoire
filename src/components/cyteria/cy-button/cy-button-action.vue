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

const buttonBaseBinds = useButtonBaseBinds(props)
</script>

<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-action mx-2 my-1"
  >
    <ButtonIcon :icon="icon" :class="iconClass" />
    <span v-if="$slots.default" class="mr-1" :class="icon ? 'ml-1.5' : 'ml-1'">
      <slot />
    </span>
  </CyButtonBase>
</template>

<style lang="postcss" scoped>
.cy-button-action {
  @apply relative rounded border bg-white bg-opacity-100 px-4 py-1.5;

  box-shadow: 0.125rem 0.125rem 0 0 var(--button-color-main-light);

  &.button-selected {
    box-shadow: 0.125rem 0.125rem 0 0 var(--button-color-main);
  }
}
</style>
