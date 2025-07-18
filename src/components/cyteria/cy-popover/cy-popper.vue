<template>
  <teleport to="#app-popovers">
    <cy-transition>
      <div
        v-if="shown"
        ref="popperElement"
        class="cy--popper"
        :class="{ 'theme-common': !popperOptions.custom }"
        :style="popperStyle"
        v-bind="attrs"
        @cypopperhide="handlePopperHide"
      >
        <div class="popper-content" :class="contentClass">
          <slot :hide="() => togglePopper(false)" />
        </div>
      </div>
    </cy-transition>
  </teleport>
</template>

<script lang="ts" setup>
import { type Middleware } from '@floating-ui/core'
import {
  type ComputePositionConfig,
  type DetectOverflowOptions,
  autoUpdate,
  computePosition,
  flip,
  limitShift,
  offset,
  shift,
  size,
} from '@floating-ui/dom'
import { type CSSProperties, type Ref, computed, nextTick, ref, toRef, useAttrs, watch } from 'vue'

import { type PopperHideEventDetail, type PopperOptions, setupPopperOptions } from './setup'

defineOptions({
  inheritAttrs: false,
})

interface Props {
  element: HTMLElement | null
  options?: PopperOptions
  contentClass?: any
}
interface Emits {
  (evt: 'shown'): void
  (evt: 'hidden'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const attrs = useAttrs()

const popperOptions = setupPopperOptions(props.options)

const mainElement = toRef(props, 'element')

const popperElement: Ref<HTMLElement | null> = ref(null)
const shown = ref(false)
const popperStyle: Ref<CSSProperties> = ref({})

const overFlowOptions: Partial<DetectOverflowOptions> = {
  padding: 8,
  rootBoundary: 'viewport',
}

const baseMiddlewares: Middleware[] = [
  flip({
    ...overFlowOptions,
    flipAlignment: false, // for size()
  }),
  shift({
    ...overFlowOptions,
    limiter: limitShift(),
  }),
  size({
    apply({ availableWidth, availableHeight }) {
      popperStyle.value = {
        ...popperStyle.value,
        maxWidth: `${Math.min(availableWidth, 512)}px`,
        maxHeight: `${availableHeight}px`,
      }
    },
    ...overFlowOptions,
  }),
]

const computePositionOptions = computed(() => {
  return {
    strategy: 'fixed',
    middleware: [offset(popperOptions.offset), ...baseMiddlewares],
    placement: popperOptions.placement,
  } as Partial<ComputePositionConfig>
})

const updatePosition = async () => {
  await nextTick()
  if (!mainElement.value || !popperElement.value) {
    return
  }
  const data = await computePosition(
    mainElement.value,
    popperElement.value,
    computePositionOptions.value
  )
  popperStyle.value = {
    ...popperStyle.value,
    left: `${data.x}px`,
    top: `${data.y}px`,
  }
}

const togglePopper = async (force?: boolean) => {
  shown.value = force ?? !shown.value

  if (shown.value) {
    await nextTick()
    if (!mainElement.value || !popperElement.value) {
      return
    }
    autoUpdate(mainElement.value, popperElement.value, updatePosition)
    if (popperOptions.autoSelect) {
      popperElement.value.querySelector('input')?.select()
    }
    emit('shown')
  } else {
    emit('hidden')
  }
}

const handlePopperHide = (evt: CustomEvent<PopperHideEventDetail>) => {
  if (
    evt.detail.eventTarget &&
    [mainElement.value, popperElement.value].some(el => el?.contains(evt.detail.eventTarget))
  ) {
    return
  }
  togglePopper(false)
}

watch(
  () => props.options,
  () => updatePosition()
)

defineExpose({
  shown,
  togglePopper,
})
</script>

<style>
@reference "@/tailwind.css";

.cy--popper {
  min-width: 15rem;
  @apply fixed z-100 overflow-y-auto;

  &.theme-common {
    @apply shadow-md;
    & > .popper-content {
      @apply rounded-sm border border-primary-40 bg-white p-0.5;
    }
  }

  @media screen and (max-width: 15rem) {
    min-width: auto;
    width: 100%;
  }
}
</style>
