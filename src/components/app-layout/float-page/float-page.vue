<script lang="ts" setup>
import { type Ref, type StyleValue, computed, ref, useAttrs, useSlots } from 'vue'

import { slotNotEmpty } from '@/shared/utils/vue'

import { useFloatPageClose } from './setup'

interface Props {
  title: string
  titleIcon?: string
  visible: boolean
  columns?: string
}
interface Emits {
  (evt: 'update:visible', value: boolean): void
}

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const slots = useSlots()

const innerVisible = computed<boolean>({
  get() {
    return props.visible
  },
  set(value) {
    emit('update:visible', value)
  },
})

const columnsStyle = computed(() => {
  if (!props.columns) {
    return undefined
  }

  const [side, main, sub] = props.columns.split(' ')
  const style: StyleValue = {}
  if (side && side !== 'auto') {
    style['--app-layout-float-page--side-width'] = side
  }
  if (main && main !== 'auto') {
    style['--app-layout-float-page--main-width'] = main
  }
  if (sub && sub !== 'sub') {
    style['--app-layout-float-page--sub-width'] = sub
  }

  return style
})

const attrs = useAttrs()

const closePage = () => {
  innerVisible.value = false
}

const containerEl: Ref<HTMLElement | null> = ref(null)

const switchToContent = () => {
  containerEl.value
    ?.querySelector('.app-layout-float-page--content-top')
    ?.scrollIntoView({ behavior: 'smooth' })
}

const { registPageClose } = useFloatPageClose()
registPageClose(innerVisible, closePage)
</script>

<template>
  <teleport to="#app-float-pages">
    <cy-transition>
      <div
        v-if="innerVisible"
        class="app-layout-float-page-wrapper"
        :style="columnsStyle"
        v-bind="attrs"
      >
        <div class="app-layout-float-page">
          <div class="flex shrink-0 items-center border-b border-primary-10 px-4 py-3">
            <div class="flex items-center text-primary-80">
              <cy-icon :icon="titleIcon" class="mr-3" />
              {{ title }}
            </div>
            <cy-button-icon icon="ic:round-close" class="ml-auto" @click="closePage" />
          </div>
          <div v-if="slotNotEmpty(slots.top)" class="shrink-0 px-4">
            <slot name="top" />
          </div>
          <div ref="containerEl" class="app-layout-float-page--container">
            <slot :switch-to-content="switchToContent" />
          </div>
        </div>
      </div>
    </cy-transition>
  </teleport>
</template>
