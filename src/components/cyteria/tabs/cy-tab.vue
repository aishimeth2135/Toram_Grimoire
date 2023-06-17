<script lang="ts" setup>
import { Ref, computed, ref, watch } from 'vue'
import { onMounted } from 'vue'

import { useTabNavButton } from './setup'

interface Props {
  value: number | string
}

const props = defineProps<Props>()

const navEl: Ref<HTMLElement | null> = ref(null)

const valueInt = computed(() =>
  typeof props.value === 'string' ? parseInt(props.value, 10) : props.value
)

const { setTabIndex, tabSelected, getParentTabsContext } = useTabNavButton(
  navEl,
  valueInt
)

interface SliderState {
  unfold: boolean
  base: 'start' | 'end'
}

const sliderState: Ref<SliderState> = ref({
  unfold: false,
  base: 'start',
})

const sliderStyle = computed(() => {
  const context = getParentTabsContext()
  if (!context) {
    return
  }

  const { isHorizontal } = context

  if (isHorizontal.value) {
    return {
      height: '0.25rem',
      width: sliderState.value.unfold ? 'calc(100% + 2px)' : '0',
      [sliderState.value.base === 'start' ? 'left' : 'right']: '-1px',
      bottom: '-0.125rem',
    }
  }
  return {
    width: '0.25rem',
    height: sliderState.value.unfold ? 'calc(100% + 2px)' : '0',
    [sliderState.value.base === 'start' ? 'top' : 'bottom']: '-1px',
    left: '-0.125rem',
  }
})

const updateSlider = (tabIndexValue: number, tabIndexOldValue: number) => {
  const value = tabIndexValue
  const oldValue = tabIndexOldValue

  if (value === oldValue) {
    return
  }

  if (value !== valueInt.value && oldValue !== valueInt.value) {
    return
  }

  const state: SliderState = {
    unfold: false,
    base: 'start',
  }

  if (value === valueInt.value) {
    state.unfold = true
    state.base = value > oldValue ? 'start' : 'end'
  } else if (oldValue === valueInt.value) {
    state.unfold = false
    state.base = value > oldValue ? 'end' : 'start'
  }

  sliderState.value = state
}

onMounted(() => {
  const context = getParentTabsContext()
  if (context) {
    updateSlider(context.tabIndex.value, -1)
    watch(context.tabIndex, updateSlider)
  }
})
</script>

<template>
  <div
    ref="navEl"
    class="cy-tab relative"
    :class="tabSelected ? 'text-primary-80' : 'text-stone-50'"
    :data-i="value"
    @click="setTabIndex"
  >
    <slot />
    <div
      ref="slider"
      class="absolute rounded-full bg-primary-40 duration-200 ease-linear"
      :style="sliderStyle"
    />
  </div>
</template>

<style lang="postcss" scoped>
.cy-tab {
  @apply mt-1 cursor-pointer rounded px-7 py-2 text-center duration-150 hover:bg-primary-10/50;
  min-width: 8rem;
}
</style>
