<template>
  <component
    :is="tag"
    v-if="slots['default']"
    ref="rootElement"
    class="cy--popover"
    @click="togglePopper(undefined)"
  >
    <slot :shown="shown" />
    <teleport to="#app-popovers">
      <cy-transition>
        <div
          v-if="shown"
          ref="wrapperElement"
          class="cy--popover-wrapper"
          :style="wrapperStyle"
          @cypopperhide="handlePopperHide"
        >
          <slot name="popper" :hide="() => togglePopper(false)" />
        </div>
      </cy-transition>
    </teleport>
  </component>
</template>

<script lang="ts">
interface PopperHideEventDetail {
  eventTarget: Node | null;
}

document.body.addEventListener('click', (evt: MouseEvent) => {
  const customEvent = new CustomEvent<PopperHideEventDetail>('cypopperhide', {
    detail: {
      eventTarget: evt.target as (Node | null),
    },
  })
  document.querySelectorAll('#app-popovers > .cy--popover-wrapper').forEach(el => el.dispatchEvent(customEvent))
}, { capture: true })
</script>

<script lang="ts" setup>
import {
  computePosition, autoUpdate, flip, size, shift, offset, limitShift,
  DetectOverflowOptions, ComputePositionConfig,
} from '@floating-ui/dom'
import { CSSProperties, Ref, ref, nextTick, useSlots, computed, watch } from 'vue'

interface Props {
  tag?: string;
  placement?: string;
  autoSelect?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'div',
  placement: 'bottom-start',
  autoSelect: false,
})

const slots = useSlots()

const rootElement: Ref<HTMLElement | null> = ref(null)
const wrapperElement: Ref<HTMLElement | null> = ref(null)
const shown = ref(false)
const wrapperStyle: Ref<CSSProperties> = ref({})

const overFlowOptions: Partial<DetectOverflowOptions> = {
  padding: 8,
  rootBoundary: 'viewport',
}
const baseOptions: Partial<ComputePositionConfig> = {
  strategy: 'fixed',
  middleware: [
    offset(6),
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
}

const options = computed(() => {
  return {
    ...baseOptions,
    placement: props.placement,
  } as Partial<ComputePositionConfig>
})

const updatePosition = async () => {
  await nextTick()
  if (!rootElement.value || !wrapperElement.value) {
    return
  }
  const data = await computePosition(rootElement.value, wrapperElement.value, options.value)
  wrapperStyle.value = {
    ...wrapperStyle.value,
    left: `${data.x}px`,
    top: `${data.y}px`,
  }
}

const togglePopper = async (force?: boolean) => {
  shown.value = force ?? !shown.value

  if (shown.value) {
    await nextTick()
    if (!rootElement.value || !wrapperElement.value) {
      return
    }
    autoUpdate(rootElement.value, wrapperElement.value, updatePosition)
    if (props.autoSelect) {
      wrapperElement.value.querySelector('input')?.select()
    }
  }
}

const handlePopperHide = (evt: CustomEvent<PopperHideEventDetail>) => {
  if (evt.detail.eventTarget && [rootElement.value, wrapperElement.value].some(el => el?.contains(evt.detail.eventTarget))) {
    return
  }
  togglePopper(false)
}

watch(options, () => updatePosition())
</script>

<style lang="postcss" scoped>
.cy--popover {
  position: relative;
}

.cy--popover-wrapper {
  min-width: 15rem;
  @apply fixed z-100 bg-white border-1 border-light shadow;

  @media screen and (max-width: 15rem) {
    min-width: auto;
    width: 100%;
  }
}
</style>
