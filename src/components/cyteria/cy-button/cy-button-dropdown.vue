<script lang="ts" setup>
import { computed, ref } from 'vue'

import { useToggle } from '@/shared/composables/State'

import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { type ButtonBaseProps, type ButtonIconProps } from './setup'

interface Props extends ButtonBaseProps, ButtonIconProps {
  contentDefaultVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  contentDefaultVisible: false,
})

const contentVisible = ref(props.contentDefaultVisible)
const toggleContentVisible = useToggle(contentVisible)

const buttonBaseBinds = computed(() => {
  return {
    color: props.color,
    disabled: props.disabled,
    selected: contentVisible.value,
  }
})
</script>

<template>
  <div class="cy-button-dropdown-wrapper" :class="{ 'content-visble': contentVisible }">
    <CyButtonBase
      v-bind="buttonBaseBinds"
      class="cy-button-dropdown-main gap-icon w-full"
      @click="toggleContentVisible"
    >
      <ButtonIcon :icon="props.icon" class="cy-button-base-icon" />
      <span class="mr-1">
        <slot />
      </span>
    </CyButtonBase>
    <div v-if="contentVisible" class="pl-5">
      <slot name="content" />
    </div>
  </div>
</template>
