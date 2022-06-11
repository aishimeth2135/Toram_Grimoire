<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-action m-1"
  >
    <ButtonIcon :icon="icon" :src="iconSrc" :class="iconClass" />
    <span v-if="$slots.default" class="mr-1" :class="icon !== null ? 'ml-2' : 'ml-1'">
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
.cy-button-action {
  @apply py-1 px-3 rounded-2xl border-1 bg-white bg-opacity-100 shadow-sm;
}
</style>
