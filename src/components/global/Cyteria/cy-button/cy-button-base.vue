<template>
  <component
    :is="link ? 'a' : 'button'"
    class="cy-button-base"
    :class="classList"
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
  --button-color-main: var(--app-light-3);
  --button-color-main-light: var(--app-light-2);

  --button-color-text: var(--button-color-main);
  --button-color-icon: var(--button-color-main-light);
  --button-color-icon-hover: var(--button-color-main);
  --button-color-border: var(--button-color-main-light);
  --button-color-border-hover: var(--button-color-main);

  --button-icon-width: 1.25rem;

  color: var(--button-color-text);
  border-color: var(--button-color-border);

  @apply inline-flex items-center text-base border-0 duration-200;

  &:deep(.cy-button-base-icon) {
    @apply duration-200 flex-shrink-0;
    color: var(--button-color-icon);
    width: var(--button-icon-width);
    height: var(--button-icon-width);
  }

  &:hover, &.button-selected {
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

  &.theme-primary {
    --button-color-text: var(--app-dark-light);
  }

  &.theme-bright {
    --button-color-main: var(--app-light-4);
    --button-color-main-light: var(--app-light-3);
  }

  &.theme-secondary {
    --button-color-main: var(--app-light-2);
    --button-color-main-light: var(--app-light);
  }

  &.theme-blue-green {
    --button-color-main: var(--app-blue-green);
    --button-color-main-light: var(--app-blue-green-light);
  }

  &.theme-water-blue {
    --button-color-main: var(--app-water-blue);
    --button-color-main-light: var(--app-water-blue-light);
  }

  &.theme-purple {
    --button-color-main: var(--app-purple);
    --button-color-main-light: var(--app-purple-light);
  }

  &.theme-orange {
    --button-color-main: var(--app-orange);
    --button-color-main-light: var(--app-orange-light);
  }

  &.theme-green {
    --button-color-main: var(--app-green);
    --button-color-main-light: var(--app-green-light);
  }

  &.theme-gray {
    --button-color-main: var(--app-gray);
    --button-color-main-light: var(--app-gray-light);
  }
}
</style>
