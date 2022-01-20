<template>
  <button
    class="button--main-content inline-flex items-center py-0.5 px-2 m-1"
    :class="baseClassList"
    @click="click"
  >
    <cy-icon
      :icon="selected ? selectedIcon : icon"
      :src="selected ? selectedIconSrc : iconSrc"
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
  name: 'CyButtonCheck',
  emits: ['click', 'update:selected'],
  props: {
    ...ButtonBaseProps,
    selectedIcon: {
      type: String,
      default: 'ic-round-check-box',
    },
    selectedIconSrc: {
      type: String,
      default: 'iconify',
    },
    icon: {
      type: String,
      default: 'ic-round-check-box-outline-blank',
    },
    iconSrc: {
      type: String,
      default: 'iconify',
    },
  },
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
