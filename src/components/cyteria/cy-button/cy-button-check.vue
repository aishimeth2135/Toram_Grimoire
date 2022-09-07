<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-check px-2"
    :class="{
      'py-1': !inline,
    }"
    @click="buttonClick"
  >
    <ButtonIcon
      :icon="selected ? 'ic:round-check-box' : 'ic:round-check-box-outline-blank'"
      :class="iconClass"
    />
    <div v-if="$slots.default" class="ml-2 mr-1.5 flex">
      <slot />
    </div>
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
    inline: {
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
    @apply bg-primary-30 bg-opacity-15;
  }
}
</style>
