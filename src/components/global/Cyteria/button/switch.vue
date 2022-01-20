<template>
  <button
    class="button--main-content inline-flex items-center m-1 px-1.5"
    :class="baseClassList"
    @click="click"
  >
    <cy-icon
      :icon="selected ? 'ic:round-toggle-on' : 'ic:outline-toggle-off'"
      src="iconify"
      style="--icon-width: 2rem"
    />
    <span
      v-if="$slots['default']"
      class="button--text inline-flex items-center ml-2 duration-300"
    >
      <slot />
    </span>
  </button>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'

import { ButtonBaseProps, setupButtonBase } from './setup'

export default defineComponent({
  name: 'CyButtonSwitch',
  emits: ['click', 'update:selected'],
  props: ButtonBaseProps,
  setup(props, { emit }) {
    const { baseClassList, click: originalClick } = setupButtonBase(props, (evt) => emit('click', evt))
    const { selected } = toRefs(props)
    const click = (evt: MouseEvent) => {
      if (originalClick(evt)) {
        emit('update:selected', !selected.value)
      }
    }
    return {
      baseClassList,
      click,
    }
  },
})
</script>
