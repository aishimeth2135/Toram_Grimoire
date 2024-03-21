<script lang="ts" setup generic="T extends any">
import { Ref, StyleValue, computed, shallowRef } from 'vue'

import { useResizeObserver } from '@/shared/setup/ElementObserver'

import { useTabsContext, useTabsSlider } from './setup'

interface Props {
  direction?: 'horizontal' | 'vertical'
  plain?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
  plain: false,
})

const currentValue = defineModel<T>({ required: true })

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

  &.cy-tabs-h.not-plain {
    @apply border-b-1 border-primary-10;

    & > .cy-tab {
      min-width: 6rem;
    }
  }

  &.cy-tabs-v {
    @apply flex-col items-start;

    &.not-plain {
      @apply border-r-1 border-primary-10;

      & > .cy-tab {
        @apply w-full text-left;
      }
    }
  }

  &.not-plain > .cy-tab {
    @apply mt-1 rounded px-6 py-2 hover:bg-primary-10/50;
  }
}
</style>
