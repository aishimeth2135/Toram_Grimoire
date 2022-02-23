<template>
  <div class="py-2 px-3 m-1 bg-white border-l-2 border-light-2">
    <button
      class="content-title button--main-content flex items-center justify-start w-full"
      @click="titleClick"
    >
      <cy-icon :icon="icon" :src="iconSrc" />
      <span
        v-if="$slots['default']"
        class="button--text inline-flex items-center ml-2 duration-300 whitespace-nowrap text-purple"
      >
        <slot />
      </span>
      <slot name="tail" />
      <cy-icon-text
        class="ml-auto"
        :icon="menuVisible ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
      />
    </button>
    <div v-show="menuVisible" class="mt-2">
      <slot name="menu" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

import { ButtonBaseProps, setupButtonBase } from './setup'

export default defineComponent({
  name: 'CyButtonDropDown',
  emits: ['click'],
  props: {
    menuDefaultVisible: {
      type: Boolean,
      default: false,
    },
    ...ButtonBaseProps,
  },
  setup(props, { emit }) {
    const { click } = setupButtonBase(props, (evt) => emit('click', evt))
    const menuVisible = ref(false)
    const titleClick = () => {
      menuVisible.value = !menuVisible.value
    }
    return {
      click,
      titleClick,
      menuVisible,
    }
  },
})
</script>
