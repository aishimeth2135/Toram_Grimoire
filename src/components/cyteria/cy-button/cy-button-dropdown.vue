<script lang="ts" setup>
import { computed, ref } from 'vue'

import { useToggle } from '@/shared/setup/State'

import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import {
  type ButtonBaseProps,
  type ButtonIconProps,
  useButtonBaseBinds,
} from './setup'

interface Props extends ButtonBaseProps, ButtonIconProps {
  contentDefaultVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  contentDefaultVisible: false,
})

const contentVisible = ref(props.contentDefaultVisible)
const toggleContentVisible = useToggle(contentVisible)

const baseButtonBaseBinds = useButtonBaseBinds(props)

const buttonBaseBinds = computed(() => {
  return {
    ...baseButtonBaseBinds.value,
    selected: contentVisible.value,
  }
})
</script>

<template>
  <div
    class="cy-button-dropdown-wrapper"
    :class="{ 'content-visble': contentVisible }"
  >
    <CyButtonBase
      v-slot="{ iconClass }"
      v-bind="buttonBaseBinds"
      class="cy-button-dropdown-main w-full"
      @click="toggleContentVisible"
    >
      <ButtonIcon :icon="icon" :class="iconClass" />
      <span class="mr-1" :class="icon !== null ? 'ml-2' : 'ml-1'">
        <slot />
      </span>
    </CyButtonBase>
    <div v-if="contentVisible" class="pl-5">
      <slot name="content" />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.cy-button-dropdown-wrapper {
  @apply border-l-2 border-primary-30 duration-200;

  &.content-visble {
    @apply border-primary-30;
  }
}

.cy-button-dropdown-main {
  @apply px-3 py-2;

  &:hover {
    background-color: rgba(var(--app-rgb-light), 0.25);
  }
}
</style>
