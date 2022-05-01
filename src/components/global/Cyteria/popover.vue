<template>
  <component
    :is="tag"
    v-if="slots['default']"
    ref="rootElement"
    class="cy--popover"
    @click="togglePopover"
  >
    <slot />
    <teleport to="#app-popovers">
      <cy-transition type="fade">
        <div
          v-if="unfold"
          ref="wrapperElement"
          class="cy--popover-wrapper"
          :style="wrapperStyle"
          @click="togglePopover"
        >
          <div @click.stop>
            <slot name="popover" :toggle-popover="togglePopover" />
          </div>
        </div>
      </cy-transition>
    </teleport>
  </component>
</template>

<script lang="ts">
export default {
  name: 'CyPopover',
}
</script>

<script lang="ts" setup>
import {
  computePosition, autoUpdate, flip, size, shift, limitShift,
  DetectOverflowOptions, ComputePositionConfig,
} from '@floating-ui/dom'
import { CSSProperties, Ref, ref, nextTick, useSlots } from 'vue'

interface Props {
  tag?: string;
}

withDefaults(defineProps<Props>(), {
  tag: 'div',
})

const slots = useSlots()

const rootElement: Ref<HTMLElement | null> = ref(null)
const wrapperElement: Ref<HTMLElement | null> = ref(null)
const unfold = ref(false)
const wrapperStyle: Ref<CSSProperties> = ref({})

const overFlowOptions: Partial<DetectOverflowOptions> = {
  padding: 8,
  rootBoundary: 'viewport',
}
const options: Partial<ComputePositionConfig> = {
  strategy: 'fixed',
  middleware: [
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
        wrapperStyle.value = {
          ...wrapperStyle.value,
          maxWidth: `${width}px`,
          maxHeight: `${height}px`,
        }
      },
      ...overFlowOptions,
    }),
  ],
  placement: 'bottom-start',
}

const updatePosition = async () => {
  await nextTick()
  if (!rootElement.value || !wrapperElement.value) {
    return
  }
  const data = await computePosition(rootElement.value!, wrapperElement.value!, options)
  wrapperStyle.value = {
    ...wrapperStyle.value,
    left: `${data.x}px`,
    top: `${data.y}px`,
  }
}

const togglePopover = async () => {
  unfold.value = !unfold.value

  if (unfold.value) {
    await nextTick()
    if (!rootElement.value || !wrapperElement.value) {
      return
    }
    autoUpdate(rootElement.value, wrapperElement.value, updatePosition)
  }
}
</script>

<style lang="postcss" scoped>
.cy--popover {
  position: relative;
}

.cy--popover-wrapper {
  min-width: 20rem;
  @apply fixed z-100;

  @media screen and (max-width: 20rem) {
    min-width: auto;
    width: 100%;
  }

  &::before {
    content: '';

    @apply fixed w-full h-full bg-white bg-opacity-50 top-0 left-0 -z-1;
  }
}
</style>
