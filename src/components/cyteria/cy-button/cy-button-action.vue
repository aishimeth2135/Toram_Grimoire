<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-action mx-2 my-1"
  >
    <ButtonIcon :icon="icon" :src="iconSrc" :class="iconClass" />
    <span
      v-if="$slots.default"
      class="mr-1"
      :class="icon !== null ? 'ml-1.5' : 'ml-1'"
    >
      <slot />
    </span>
  </CyButtonBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import {
  ButtonBasePropList,
  ButtonIconPropList,
  getButtonBaseBinds,
} from './setup'

export default defineComponent({
  props: {
    ...ButtonBasePropList,
    ...ButtonIconPropList,
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
  @apply relative rounded border bg-white bg-opacity-100 px-4 py-1.5;

  box-shadow: 0.125rem 0.125rem 0 0 var(--button-color-main-light);
}
</style>
