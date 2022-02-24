<template>
  <teleport to="body">
    <div
      v-if="(visible || keepVisible)"
      ref="rootElement"
      class="cy--hover-float-wrapper z-10 fixed py-0.5 px-4"
      :style="position ?? undefined"
      @mouseenter="visible = true"
      @mouseleave="hideCaption"
    >
      <div
        class="absolute -top-9 right-4"
        :class="{ 'invisible': !keepVisible }"
      >
        <div class="flex items-center border-1 rounded-md border-light py-1 px-2 bg-white bg-opacity-85">
          <cy-icon-text icon="fluent:cursor-click-24-regular" class="ml-auto" />
          <cy-icon-text icon="ic:round-arrow-forward" />
          <cy-icon-text icon="jam:close-circle" />
        </div>
      </div>
      <div
        :class="contentClass"
        style="max-height: calc(45vh - 5rem);"
        @click="contentClick"
      >
        <slot />
      </div>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import { ref, toRefs, computed, nextTick } from 'vue'
import type { Ref, CSSProperties } from 'vue'

import { remToPixels } from '@/shared/utils/element'

interface Props {
  element: HTMLElement | null;
  target?: string;
  custom?: boolean;
  positionMode?: 'auto' | 'h-middle';
}

interface Emits {
  (evt: 'element-hover', el: HTMLElement): void;
}

const props = withDefaults(defineProps<Props>(), {
  custom: false,
  positionMode: 'auto',
})
const emit = defineEmits<Emits>()

const { element, target, positionMode, custom } = toRefs(props)

const contentClass = computed(() => {
  let classList = 'overflow-y-auto max-w-full'
  if (!custom.value) {
    classList += ' border-1 rounded-md drop-shadow border-light-3 px-4 py-2 bg-white'
  }
  return classList
})

const visible = ref(false)
const position: Ref<CSSProperties | null> = ref(null)
const currentElement: Ref<HTMLElement | null> = ref(null)
const rootElement: Ref<HTMLElement | null> = ref(null)
const keepVisible = ref(false)

const targetElement = computed(() => {
  return currentElement.value || null
})

const fixPosition = () => {
  const el = rootElement.value
  if (!el || position.value === null) {
    return
  }
  const rect = el.getBoundingClientRect()
  const ww = window.innerWidth
  const pd = remToPixels(1)

  if (positionMode.value === 'h-middle') {
    const spacing = (ww - rect.width) / 2
    position.value.left = spacing + 'px'
    position.value.right = 'auto'
    return
  }
  if (rect.left < pd) {
    position.value.left = pd.toString() + 'px'
    position.value.right = 'auto'
  } else if (rect.right > ww - pd) {
    position.value.right = pd.toString() + 'px'
    position.value.left = 'auto'
  }
}
const updateCaptionPosition = async () => {
  const el = targetElement.value
  if (!el) {
    position.value = null
    return
  }
  const rect = el.getBoundingClientRect()

  const resultPosition: CSSProperties = {}

  const margin = remToPixels(-0.1)
  const wh = window.innerHeight, ww = window.innerWidth
  const len2bottom = wh - rect.bottom
  if (rect.top >= len2bottom) {
    resultPosition.bottom = (wh - rect.bottom + rect.height + margin) + 'px'
  } else {
    resultPosition.top = (rect.top + rect.height + margin) + 'px'
  }
  if (positionMode.value !== 'h-middle') {
    const len2right = window.innerWidth - rect.right
    if (rect.left >= len2right) {
      resultPosition.right = (ww - rect.right + margin) + 'px'
    } else {
      resultPosition.left = (rect.left + margin) + 'px'
    }
  }
  position.value = resultPosition

  await nextTick()
  fixPosition()
}
const showCaption = (el: HTMLElement) => {
  visible.value = true
  currentElement.value = el
  emit('element-hover', el)
  updateCaptionPosition()
}
const hideCaption = () => {
  visible.value = false
  if (!keepVisible.value) {
    currentElement.value = null
  }
}
const enableKeepVisible = () => {
  keepVisible.value = true
}
const contentClick = () => {
  keepVisible.value = false
  hideCaption()
}

const DATA_FLAG_NAME = 'data-cy-hover-float-flag'
const listenerShow = function(this: HTMLElement) { showCaption(this) }
const listenerClick = function(evt: MouseEvent) {
  evt.stopPropagation()
  enableKeepVisible()
}
const updateListenerBinding = async () => {
  await nextTick()
  const el = element.value
  if (!el) {
    return
  }
  const bind = (node: HTMLElement) => {
    if (node.getAttribute(DATA_FLAG_NAME) !== null) {
      return
    }
    node.addEventListener('mouseenter', listenerShow)
    node.addEventListener('mouseleave', hideCaption)
    // node.addEventListener('touchstart', show);
    // node.addEventListener('touchend', hideCaption);
    node.addEventListener('click', listenerClick)
    node.setAttribute(DATA_FLAG_NAME, 'true')
  }
  if (target?.value === undefined) {
    bind(el)
  } else {
    const nodes = el.querySelectorAll(target.value)
    nodes.forEach(node => bind(node as HTMLElement))
  }
}

defineExpose({
  update: updateListenerBinding,
  fixPosition,
})
</script>

<style lang="postcss" scoped>
.cy--hover-float-wrapper {
  @apply flex;
  max-width: 50rem;

  &.layout-h-middle {
    width: 50rem;
    @apply justify-center;
    left: auto;
    right: auto;
  }

  @media screen and (max-width: 50rem) {
    max-width: 100vw;
  }
}
</style>
