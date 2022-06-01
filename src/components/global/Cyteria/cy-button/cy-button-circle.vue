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
      <ButtonIcon
        v-else
        :icon="icon"
        :src="iconSrc"
        :class="iconClass"
      />
    </template>
  </CyButtonBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import CyButtonBase from './cy-button-base.vue'
import ButtonIcon from './button-icon.vue'

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
  @apply justify-center border-1 rounded-full bg-white bg-opacity-100 shadow-sm w-11 h-11;

  --button-icon-width: 1.25rem;

  &.button-small {
    @apply w-9 h-9;

    --button-icon-width: 1rem;
  }

  &.button-float {
    @apply shadow-md;
  }
}
</style>
