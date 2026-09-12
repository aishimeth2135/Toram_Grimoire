<script lang="ts" setup generic="T extends any">
import { type Ref, type StyleValue, computed, shallowRef, useTemplateRef } from 'vue'

import { useResizeObserver } from '@/shared/composables/ElementObserver'
import { nextFrame } from '@/shared/utils/dom'

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
const tabsEl = useTemplateRef('tabsEl')
const isHorizontal = computed(() => props.direction === 'horizontal')

const tabsContext = { tabsEl, isHorizontal, currentValue, sliderStyle }

const { idBind } = useTabsContext(tabsContext)

const { autoUpdateSliderStyle } = useTabsSlider()

const { forceUpdateSliderStyle } = autoUpdateSliderStyle(tabsContext)
useResizeObserver(tabsEl, () => {
  nextFrame(forceUpdateSliderStyle)
})
</script>

<template>
  <div
    ref="tabsEl"
    v-bind:[idBind.name]="idBind.value"
    class="cy-tabs"
    :class="[direction === 'horizontal' ? 'cy-tabs-h' : 'cy-tabs-v', { 'not-plain': !plain }]"
  >
    <slot />
    <div class="bg-primary-40 absolute rounded-full ease-linear" :style="sliderStyle" />
  </div>
</template>

<style>
@reference "@/tailwind.css";

.cy-tabs {
  display: flex;
  position: relative;
  flex-wrap: wrap;
  align-items: flex-start;

  &.cy-tabs-h.not-plain {
    border-bottom-width: 1px;
    border-color: var(--color-primary-10);

    & > .cy-tab {
      min-width: 6rem;
      text-align: center;
    }
  }

  &.cy-tabs-v {
    flex-direction: column;
    align-items: flex-start;

    &.not-plain {
      border-right-width: 2px;
      border-color: var(--color-primary-10);

      & > .cy-tab {
        width: 100%;
        text-align: left;
      }
    }
  }

  &.not-plain > .cy-tab {
    margin-top: --spacing(1);
    border-radius: var(--radius-sm);
    padding-inline: --spacing(6);
    padding-block: --spacing(2);

    &:hover {
      background-color: --alpha(var(--color-primary-10) / 50%);
    }
  }
}
</style>
