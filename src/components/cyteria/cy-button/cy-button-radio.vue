<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-radio py-1 px-2"
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

<script lang="ts">
import { defineComponent } from 'vue'

import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { ButtonBaseProps, getButtonBaseBinds } from './setup'

export default defineComponent({
  props: {
    ...ButtonBaseProps,
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
.cy-button-radio {
  @apply rounded-full duration-200;

  &:focus:not(:active) {
    @apply bg-primary-30 bg-opacity-20;
  }
}
</style>
