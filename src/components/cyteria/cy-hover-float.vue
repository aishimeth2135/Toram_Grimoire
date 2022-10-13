<template>
  <CyPopper
    ref="popper"
    :element="currentElement"
    :options="{
      custom: true,
      offset: 0,
    }"
    @hidden="keepVisible = false"
    @mouseenter="show"
    @mouseleave="onLeave"
  >
    <div
      class="cy--hover-float--content"
      :class="{ 'content-default-theme': !custom }"
    >
      <slot />
    </div>
  </CyPopper>
</template>

<script lang="ts" setup>
import { Ref, nextTick, ref, toRefs } from 'vue'

import CyPopper from './cy-popover/cy-popper.vue'

interface Props {
  element: HTMLElement | null
  target?: string
  custom?: boolean
  positionMode?: 'auto' | 'h-middle'
}

interface Emits {
  (evt: 'element-hover', el: HTMLElement): void
}

const props = withDefaults(defineProps<Props>(), {
  custom: false,
  positionMode: 'auto',
})
const emit = defineEmits<Emits>()

const { element, target } = toRefs(props)
const popper: Ref<InstanceType<typeof CyPopper> | null> = ref(null)

const currentElement: Ref<HTMLElement | null> = ref(null)
const keepVisible = ref(false)

const show = () => {
  popper.value?.togglePopper(true)
}

const showCaption = (el: HTMLElement) => {
  currentElement.value = el
  show()
  emit('element-hover', el)
}
const hideCaption = () => {
  popper.value?.togglePopper(false)
}
const enableKeepVisible = () => {
  keepVisible.value = true
}

const DATA_FLAG_NAME = 'data-cy-hover-float-flag'
const onEnter = function (this: HTMLElement) {
  showCaption(this)
}
const onLeave = function () {
  if (!keepVisible.value) {
    hideCaption()
  }
}
const onClick = function (this: HTMLElement, evt: MouseEvent) {
  evt.stopPropagation()
  enableKeepVisible()
  showCaption(this)
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
    node.addEventListener('mouseenter', onEnter)
    node.addEventListener('mouseleave', onLeave)
    node.addEventListener('click', onClick)
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
})
</script>

<style lang="postcss" scoped>
.cy--hover-float--content {
  max-width: 50rem;

  @apply overflow-y-auto;

  &.content-default-theme {
    @apply rounded-md border-1 border-primary-50 bg-white px-4 py-2 drop-shadow;
  }
}
</style>
