<script lang="ts" setup>
import { Ref, StyleValue, computed, ref, useAttrs, useSlots } from 'vue'

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
          <div
            class="flex flex-shrink-0 items-center border-b border-primary-10 px-4 py-3"
          >
            <div class="flex items-center text-primary-80">
              <cy-icon :icon="titleIcon" class="mr-3" />
              {{ title }}
            </div>
            <cy-button-icon
              icon="ic:round-close"
              class="ml-auto"
              @click="closePage"
            />
          </div>
          <div v-if="slotNotEmpty(slots.top)" class="flex-shrink-0 px-4">
            <slot name="top" />
          </div>
          <div ref="containerEl" class="app-layout-float-page--container">
            <div class="app-layout-float-page--container-inner">
              <slot :switch-to-content="switchToContent" />
            </div>
          </div>
        </div>
      </div>
    </cy-transition>
  </teleport>
</template>

<style lang="postcss">
.app-layout-float-page-wrapper {
  @apply pointer-events-none fixed left-0 top-0 h-full;
  z-index: 49;
  width: 100%;
  background-color: var(--app-body-bg-color);
}

.app-layout-float-page {
  @apply pointer-events-auto mx-auto flex h-full flex-col;
  width: 100%;
  max-width: var(--app-screen-max-width);
}

/* ==== container ==== */
.app-layout-float-page--container {
  @apply flex h-full min-h-0 w-full;
}
.app-layout-float-page--container-inner {
  @apply h-full w-full px-4 py-6;
}

.app-layout-float-page--side {
  @apply h-full w-full flex-shrink-0;
  max-width: var(--app-layout-float-page--side-width, auto);
}

/* ==== content ==== */
.app-layout-float-page--content-tabs-wrapper {
  @apply flex h-full w-full flex-col pl-8;

  & > .app-layout-float-page--content {
    @apply pl-0 pt-6;
  }

  &:first-child {
    @apply flex-shrink-0;
  }
}

.app-layout-float-page--content {
  @apply flex h-full w-full overflow-y-auto pl-8;
}

/* ==== content/inner ==== */
.app-layout-float-page--main {
  @apply h-full w-full flex-shrink-0;
  max-width: var(--app-layout-float-page--main-width, auto);
}

.app-layout-float-page--sub {
  @apply h-full w-full;
  max-width: var(--app-layout-float-page--sub-width, auto);
}

.app-layout-float-page--content-top {
  @apply hidden;
}

@media (max-width: 93rem) {
  .app-layout-float-page-wrapper {
    z-index: 51;
  }
}

@media (max-width: 55rem) {
  .app-layout-float-page--container {
    @apply block overflow-y-auto;
  }

  .app-layout-float-page--side,
  .app-layout-float-page--content-tabs-wrapper,
  .app-layout-float-page--content,
  .app-layout-float-page--main {
    @apply h-auto;
  }

  .app-layout-float-page--content-top {
    @apply block h-4;
  }

  .app-layout-float-page--content-tabs-wrapper {
    @apply pl-0 pt-8;
  }

  .app-layout-float-page--content {
    @apply pl-0 pt-8;
  }

  .app-layout-float-page--sub {
    height: calc(100vh - 8rem);
  }
}

@media (max-width: 30rem) {
  .app-layout-float-page--content {
    @apply block overflow-y-visible pt-4;
  }

  .app-layout-float-page--main {
    @apply pb-8;
  }
}
</style>
