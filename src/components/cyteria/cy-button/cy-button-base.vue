<template>
  <component
    :is="link ? 'a' : 'button'"
    class="cy-button-base"
    :class="classList"
    :disabled="disabled"
  >
    <slot icon-class="cy-button-base-icon" />
  </component>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { ButtonBaseProps } from './setup'

export default defineComponent({
  props: {
    ...ButtonBaseProps,
  },
  computed: {
    classList() {
      return {
        [`theme-${this.color}`]: true,
        'button-selected': this.selected,
      }
    },
  },
})
</script>

<style lang="postcss" scoped>
.cy-button-base {
  --button-color-main: var(--app-primary-60);
  --button-color-main-light: var(--app-primary-30);

  --button-color-text: var(--button-color-main);
  --button-color-icon: var(--button-color-main-light);
  --button-color-icon-hover: var(--button-color-main);
  --button-color-border: var(--button-color-main-light);
  --button-color-border-hover: var(--button-color-main);

  --button-icon-width: 1.25rem;

  color: var(--button-color-text);
  border-color: var(--button-color-border);

  @apply inline-flex items-center border-0 text-base duration-200;

  &:deep(.cy-button-base-icon) {
    @apply flex-shrink-0 duration-200;
    color: var(--button-color-icon);
    width: var(--button-icon-width);
    height: var(--button-icon-width);
  }

  &:hover,
  &.button-selected {
    border-color: var(--button-color-border-hover);

    &:deep(.cy-button-base-icon) {
      color: var(--button-color-icon-hover);
    }
  }

  &:active {
    @apply opacity-75;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus-visible {
    @apply outline-primary-30;
  }

  &.theme-primary {
    --button-color-text: var(--app-primary-80);
  }

  &.theme-bright {
    --button-color-main: var(--app-primary-60);
    --button-color-main-light: var(--app-primary-30);
  }

  &.theme-secondary {
    --button-color-main: var(--app-primary-30);
    --button-color-main-light: var(--app-primary-30);
  }

  &.theme-cyan {
    --button-color-main: var(--app-cyan-60);
    --button-color-main-light: var(--app-cyan-30);
  }

  &.theme-blue {
    --button-color-main: var(--app-blue-60);
    --button-color-main-light: var(--app-blue-30);
  }

  &.theme-fuchsia {
    --button-color-main: var(--app-fuchsia-60);
    --button-color-main-light: var(--app-fuchsia-30);
  }

  &.theme-violet {
    --button-color-main: var(--app-violet-60);
    --button-color-main-light: var(--app-violet-30);
  }

  &.theme-orange {
    --button-color-main: var(--app-orange-60);
    --button-color-main-light: var(--app-orange-30);
  }

  &.theme-emerald {
    --button-color-main: var(--app-emerald-60);
    --button-color-main-light: var(--app-emerald-30);
  }

  &.theme-gray {
    --button-color-main: var(--app-gray);
    --button-color-main-light: var(--app-gray-30);
  }

  &.theme-red {
    --button-color-main: var(--app-red-60);
    --button-color-main-light: var(--app-red-30);
  }
}
</style>
