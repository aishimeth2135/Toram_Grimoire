<script lang="ts" setup>
import { type Ref, computed, ref } from 'vue'

import { useTabContext } from './setup'

interface Props {
  value: any
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const navEl: Ref<HTMLElement | null> = ref(null)

const tabContext = {
  sourceEl: navEl,
  tabValue: computed(() => props.value),
}

const { updateTabValue, tabSelected, idBind } = useTabContext(tabContext)

const tabClicked = () => {
  if (props.disabled) {
    return
  }
  updateTabValue()
}

// interface SliderState {
//   unfold: boolean
//   base: 'start' | 'end'
// }

// const sliderState: Ref<SliderState> = ref({
//   unfold: false,
//   base: 'start',
// })

// const sliderStyle = computed(() => {
//   const context = getParentTabsContext()
//   if (!context) {
//     return
//   }

//   const { isHorizontal } = context

//   if (isHorizontal.value) {
//     return {
//       height: '0.25rem',
//       width: sliderState.value.unfold ? 'calc(100% + 2px)' : '0',
//       [sliderState.value.base === 'start' ? 'left' : 'right']: '-1px',
//       bottom: '-0.125rem',
//     }
//   }
//   return {
//     width: '0.25rem',
//     height: sliderState.value.unfold ? 'calc(100% + 2px)' : '0',
//     [sliderState.value.base === 'start' ? 'top' : 'bottom']: '-1px',
//     left: '-0.125rem',
//   }
// })

// const valueTabIndex = computed(() => getTabIndex(props.value))

// const updateSlider = (tabIndexValue: number, tabIndexOldValue: number) => {
//   const value = tabIndexValue
//   const oldValue = tabIndexOldValue

//   if (value === oldValue) {
//     return
//   }

//   if (value !== valueTabIndex.value && oldValue !== valueTabIndex.value) {
//     return
//   }

//   const state: SliderState = {
//     unfold: false,
//     base: 'start',
//   }

//   if (value === valueTabIndex.value) {
//     state.unfold = true
//     state.base = value > oldValue ? 'start' : 'end'
//   } else if (oldValue === valueTabIndex.value) {
//     state.unfold = false
//     state.base = value > oldValue ? 'end' : 'start'
//   }

//   sliderState.value = state
// }

// onMounted(() => {
//   const context = getParentTabsContext()
//   if (context) {
//     updateSlider(currentTabIndex.value, -1)
//     watch(currentTabIndex, updateSlider)
//   }
// })
</script>

<template>
  <div
    ref="navEl"
    class="cy-tab"
    :class="[tabSelected ? 'text-primary-80' : 'text-stone-50', { 'tab-disabled': disabled }]"
    v-bind:[idBind.name]="idBind.value"
    @click="tabClicked"
  >
    <slot />
  </div>
</template>

<style>
@reference "@/tailwind.css";

.cy-tab {
  @apply cursor-pointer duration-150;

  &.tab-disabled {
    @apply hover:bg-gray-10/50 cursor-not-allowed text-stone-40;
  }
}
</style>
