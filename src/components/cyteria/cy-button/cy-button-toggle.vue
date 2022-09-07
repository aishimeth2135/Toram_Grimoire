<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-toggle py-1 px-2"
    @click="buttonClick"
  >
    <ButtonIcon
      :icon="selected ? 'ic:round-toggle-on' : 'ic:outline-toggle-off'"
      :class="iconClass"
      class="cy-button-toggle-icon"
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
.cy-button-toggle {
  @apply rounded-full duration-200;

  --button-icon-width: 2rem;

  &:focus:not(:active) {
    @apply bg-primary-30 bg-opacity-15;
  }

  & > .cy-button-toggle-icon {
    @apply -my-3;
  }
}
</style>

