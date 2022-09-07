<template>
  <teleport to="#app-popovers">
    <cy-transition>
      <div
        v-if="shown"
        ref="popperElement"
        class="cy--popper"
        :style="popperStyle"
        v-bind="attrs"
        @cypopperhide="handlePopperHide"
      >
        <div :class="{ 'popper-content': !popperOptions.custom }">
          <slot :hide="() => togglePopper(false)" />
        </div>
      </div>
    </cy-transition>
  </teleport>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script lang="ts" setup>
import { Middleware } from '@floating-ui/core'
import {
  computePosition, autoUpdate, flip, size, shift, offset, limitShift,
  DetectOverflowOptions, ComputePositionConfig,
} from '@floating-ui/dom'
import { CSSProperties, Ref, ref, nextTick, computed, watch, toRef, useAttrs } from 'vue'

import { setupPopperOptions, PopperHideEventDetail, PopperOptions } from './setup'

interface Props {
  element: HTMLElement | null;
  options?: PopperOptions;
}
interface Emits {
  (evt: 'shown'): void;
  (evt: 'hidden'): void;
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
    apply({ width, height }) {
      popperStyle.value = {
        ...popperStyle.value,
        maxWidth: `${Math.min(width, 480)}px`,
        maxHeight: `${height}px`,
      }
    },
    ...overFlowOptions,
  }),
]

const computePositionOptions = computed(() => {
  return {
    strategy: 'fixed',
    middleware: [
      offset(popperOptions.offset),
      ...baseMiddlewares,
    ],
    placement: popperOptions.placement,
  } as Partial<ComputePositionConfig>
})

const updatePosition = async () => {
  await nextTick()
  if (!mainElement.value || !popperElement.value) {
    return
  }
  const data = await computePosition(mainElement.value, popperElement.value, computePositionOptions.value)
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
  if (evt.detail.eventTarget && [mainElement.value, popperElement.value].some(el => el?.contains(evt.detail.eventTarget))) {
    return
  }
  togglePopper(false)
}

watch(() => props.options, () => updatePosition())

defineExpose({
  shown,
  togglePopper,
})
</script>

<style lang="postcss" scoped>
.cy--popper {
  min-width: 15rem;

  @apply fixed z-100 overflow-y-auto;

  @media screen and (max-width: 15rem) {
    min-width: auto;
    width: 100%;
  }

  & > .popper-content {
    @apply bg-white border-1 border-primary-30 shadow;
  }
}
</style>
