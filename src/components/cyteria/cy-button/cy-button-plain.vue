<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-plain m-1"
    :class="{ 'button-width-full': widthFull }"
  >
    <ButtonIcon :icon="icon" :src="iconSrc" :class="iconClass" />
    <span class="mr-1" :class="icon !== null ? 'ml-2' : 'ml-1'">
      <slot />
    </span>
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
    widthFull: {
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
.cy-button-plain {
  --button-color-text: var(--button-color-main-light);
  --button-color-text-hover: var(--button-color-main);

  &:hover, &.button-selected {
    color: var(--button-color-text-hover);
  }

  &.button-width-full {
    @apply w-full;
  }

  &.theme-secondary {
    --button-color-main: var(--app-light-3);
    --button-color-main-light: var(--app-light-2);
  }
}
</style>
