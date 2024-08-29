<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import {
  type ButtonBaseProps,
  type ButtonIconProps,
  useButtonBaseBinds,
} from './setup'

interface Props extends ButtonBaseProps, ButtonIconProps {
  small?: boolean
  float?: boolean
  toggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  small: false,
  float: false,
  toggle: false,
})

const buttonBaseBinds = useButtonBaseBinds(props)
</script>

<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-circle"
    :class="{
      'button-small': small,
      'button-float': float,
    }"
  >
    <template v-if="icon">
      <ButtonIcon
        v-if="toggle && selected"
        icon="ic-round-close"
        :class="iconClass"
      />
      <ButtonIcon v-else :icon="icon" :class="iconClass" />
    </template>
  </CyButtonBase>
</template>

<style lang="postcss" scoped>
.cy-button-circle {
  @apply h-11 w-11 justify-center rounded-full border bg-white bg-opacity-100;
  --button-icon-width: 1.25rem;
  box-shadow:
    1px 3px 1px -2px rgba(0, 0, 0, 0.1),
    1px 2px 2px 0 rgba(0, 0, 0, 0.07),
    1px 1px 5px 0 rgba(0, 0, 0, 0.06);

  &.button-small {
    @apply h-9 w-9;

    --button-icon-width: 1rem;
  }

  &.button-float {
    @apply shadow-md;
  }
}
</style>
