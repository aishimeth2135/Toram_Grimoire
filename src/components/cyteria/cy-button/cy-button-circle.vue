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
      <ButtonIcon v-else :icon="icon" :src="iconSrc" :class="iconClass" />
    </template>
  </CyButtonBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { ButtonBaseProps, ButtonIconProps, getButtonBaseBinds } from './setup'

export default defineComponent({
  props: {
    ...ButtonBaseProps,
    ...ButtonIconProps,
    small: {
      type: Boolean,
      default: false,
    },
    float: {
      type: Boolean,
      default: false,
    },
    toggle: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    CyButtonBase,
    ButtonIcon,
  },
  computed: {
    buttonBaseBinds() {
      return getButtonBaseBinds(this)
    },
  },
})
</script>

<style lang="postcss" scoped>
.cy-button-circle {
  @apply h-11 w-11 justify-center rounded-full border-1 bg-white bg-opacity-100 shadow;

  --button-icon-width: 1.25rem;

  &.button-small {
    @apply h-9 w-9;

    --button-icon-width: 1rem;
  }

  &.button-float {
    @apply shadow-md;
  }
}
</style>
