<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    :style="rootStyle"
    class="cy-button-icon mx-1"
  >
    <ButtonIcon
      :icon="icon"
      :class="iconClass"
    />
  </CyButtonBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import CyButtonBase from './cy-button-base.vue'
import ButtonIcon from './button-icon.vue'

import { ButtonBaseProps, getButtonBaseBinds } from './setup'

export default defineComponent({
  props: {
    ...ButtonBaseProps,
    icon: {
      type: String,
      required: true,
    },
    iconColor: {
      type: String,
      default: null,
    },
    iconColorHover: {
      type: String,
      default: null,
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
    rootStyle() {
      const styles = {} as Record<string, string>
      if (this.iconColor) {
        styles['--button-color-icon'] = `var(--app-${this.iconColor})`
        styles['--button-color-icon-hover'] = `var(--app-${this.iconColor})`
      }
      if (this.iconColorHover) {
        styles['--button-color-icon-hover'] = `var(--app-${this.iconColorHover})`
      }
      return styles
    },
  },
})
</script>

<style lang="postcss" scoped>
.cy-button-icon {
  @apply rounded-full duration-200;

  &:focus:not(:active) {
    @apply bg-primary-30 bg-opacity-15;
  }
}
</style>
