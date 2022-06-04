<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
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
.cy-button-icon {
  @apply rounded-full duration-200;

  &:focus:not(:active) {
    @apply bg-light bg-opacity-15;
  }
}
</style>
