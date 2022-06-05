<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-check py-1 px-2"
    @click="buttonClick"
  >
    <ButtonIcon
      :icon="selected ? 'ic:round-check-box' : 'ic:round-check-box-outline-blank'"
      :class="iconClass"
    />
    <span v-if="$slots.default" class="ml-2 mr-1.5">
      <slot />
    </span>
  </CyButtonBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import CyButtonBase from './cy-button-base.vue'
import ButtonIcon from './button-icon.vue'

import { ButtonBaseProps, getButtonBaseBinds } from './setup'

export default defineComponent({
  emits: ['click', 'update:selected'],
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
  methods: {
    buttonClick(evt: MouseEvent) {
      this.$emit('click', evt)
      this.$emit('update:selected', !this.selected)
    },
  },
})
</script>

<style lang="postcss" scoped>
.cy-button-check {
  @apply rounded-full duration-200;

  &:focus:not(:active) {
    @apply bg-light bg-opacity-15;
  }
}
</style>
