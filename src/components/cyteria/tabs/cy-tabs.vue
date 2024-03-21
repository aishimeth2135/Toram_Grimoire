<script lang="ts" setup generic="T extends any">
import { Ref, StyleValue, computed, shallowRef } from 'vue'

import { useResizeObserver } from '@/shared/setup/ElementObserver'

import { useTabsContext, useTabsSlider } from './setup'

interface Props {
  modelValue: T
  direction?: 'horizontal' | 'vertical'
  plain?: boolean
}
interface Emits {
  (evt: 'update:model-value', value: T): void
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
  plain: false,
})
const emit = defineEmits<Emits>()

const currentValue = computed<T>({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:model-value', value)
  },
})

const sliderStyle: Ref<StyleValue | undefined> = shallowRef(undefined)
const tabsEl: Ref<HTMLElement | null> = shallowRef(null)
const isHorizontal = computed(() => props.direction === 'horizontal')

const tabsContext = { tabsEl, isHorizontal, currentValue, sliderStyle }

const { idBind } = useTabsContext(tabsContext)

const { autoUpdateSliderStyle } = useTabsSlider()

const { forceUpdateSliderStyle } = autoUpdateSliderStyle(tabsContext)
useResizeObserver(tabsEl, forceUpdateSliderStyle)
</script>

<template>
  <div
    ref="tabsEl"
    v-bind:[idBind.name]="idBind.value"
    class="cy-tabs"
    :class="[
      direction === 'horizontal' ? 'cy-tabs-h' : 'cy-tabs-v',
      { 'not-plain': !plain },
    ]"
  >
    <slot />
    <div
      class="absolute rounded-full bg-primary-40 ease-linear"
      :style="sliderStyle"
    />
  </div>
</template>

<style lang="postcss">
.cy-tabs {
  @apply relative flex flex-wrap items-start;

  .cy-tabs-h {
    @apply pb-0.5;

    & > .cy-tab {
      min-width: 8rem;
    }
  }

  .cy-tabs-v {
    @apply flex-col items-start pr-0.5;
  }

  &.not-plain {
    @apply border-b-1 border-primary-10;
  }
}
</style>
