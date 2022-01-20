<template>
  <div class="cy-button--drop-down py-2 px-3 m-1 bg-white">
    <button
      class="content-title button--main-content flex items-center justify-start"
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
      <span
        v-if="$slots['content-right']"
        class="inline-flex items-center ml-auto"
      >
        <slot name="content-right" />
      </span>
    </button>
    <div v-show="menuVisible" class="menu">
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

<style lang="postcss" scoped>
.cy-button--drop-down {
  --icon-width: 1.25rem;
  border-left: 0.2rem solid var(--primary-light-2);
}
</style>
