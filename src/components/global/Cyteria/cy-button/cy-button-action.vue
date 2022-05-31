<template>
  <component
    :is="link ? 'a' : 'button'"
    class="cy-button-action m-1"
    :class="classList"
    :disabled="disabled"
  >
    <ButtonIcon v-if="icon" :icon="icon" :src="iconSrc" class="cy-button-action-icon" />
    <span v-if="$slots.default" class="mr-1 duration-200" :class="!!icon ? 'ml-2' : 'ml-1'">
      <slot />
    </span>
  </component>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import ButtonIcon from './button-icon.vue'

import { ButtonIconProps } from './setup'

export default defineComponent({
  props: {
    ...ButtonIconProps,
    icon: {
      type: String,
    },
    color: {
      type: String as PropType<'primary' | 'secondary' | 'blue-green' | 'orange' | 'gray'>,
      default: 'primary',
    },
    selected: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    link: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ButtonIcon,
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
.cy-button-action {
  --button-color-main: var(--app-light-3);
  --button-color-main-light: var(--app-light-2);

  --button-color-text: var(--button-color-main);
  --button-color-icon: var(--button-color-main-light);
  --button-color-icon-hover: var(--button-color-main);
  --button-color-border: var(--button-color-main-light);
  --button-color-border-hover: var(--button-color-main);

  color: var(--button-color-text);
  border-color: var(--button-color-border);

  @apply
    inline-flex items-center
    py-1 px-3
    rounded-2xl border-1
    bg-white bg-opacity-100 text-base shadow-sm duration-200;

  .cy-button-action-icon {
    @apply duration-200 w-5 h-5;
    color: var(--button-color-icon);
  }

  &:hover, &.button-selected {
    border-color: var(--button-color-border-hover);

    .cy-button-action-icon {
      color: var(--button-color-icon-hover);
    }
  }

  &:focus:not(:active) {
    @apply outline outline-1;

    outline-color: rgba(var(--rgb-app-light), 0.5);
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

  &.theme-secondary {
    --button-color-main: var(--app-light-2);
    --button-color-main-light: var(--app-light);
  }

  &.theme-blue-green {
    --button-color-main: var(--app-blue-green);
    --button-color-main-light: var(--app-blue-green-light);
  }

  &.theme-orange {
    --button-color-main: var(--app-orange);
    --button-color-main-light: var(--app-orange-light);
  }

  &.theme-gray {
    --button-color-main: var(--app-gray);
    --button-color-main-light: var(--app-gray-light);
  }
}
</style>
