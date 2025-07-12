<template>
  <teleport to="#app-modals">
    <cy-transition>
      <div v-if="visible" class="cy--modal" :class="rootClass" v-bind="attrs" @click="closeModal">
        <div class="modal-wrapper">
          <cy-button-icon
            icon="jam-close-circle-f"
            icon-width="1.5rem"
            class="cy--modal--close-btn"
            @click.stop="closeModal"
          />
          <div class="modal-container" :class="{ 'h-full': heightFull }" @click.stop>
            <div v-if="slots['title'] || title" class="px-4 pb-2">
              <slot name="title">
                <cy-icon-text :icon="titleIcon" text-color="primary-70">
                  {{ title }}
                </cy-icon-text>
              </slot>
            </div>
            <div class="relative h-full overflow-y-auto overscroll-none p-4 pt-0">
              <slot />
            </div>
            <div v-if="footer" class="mx-4 flex justify-end space-x-2 bg-white py-1.5">
              <slot name="footer" :close-modal="closeModal">
                <slot name="footer-actions" />
                <cy-button-action icon="ic-round-close" @click="closeModal">
                  {{ t('global.close') }}
                </cy-button-action>
              </slot>
            </div>
          </div>
        </div>
        <div
          v-if="$slots['extra-content']"
          ref="extraContentElement"
          class="modal-extra-wrapper"
          :style="extraContentStyle"
        >
          <div class="modal-extra-container" @click.stop>
            <div class="modal-extra" @click="showExtraContent">
              <slot name="extra-content" />
            </div>
            <div class="absolute -bottom-16 right-4">
              <cy-button-circle
                v-show="extraContentVisible"
                color="blue"
                icon="ep:arrow-right-bold"
                @click="hideExtraContent"
              />
            </div>
          </div>
        </div>
      </div>
    </cy-transition>
  </teleport>
</template>

<script lang="ts" setup>
import { type CSSProperties, type Ref, computed, ref, useAttrs, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'

import { remToPixels } from '@/shared/utils/dom'

defineOptions({
  name: 'CyModal',
  inheritAttrs: false,
})

interface Props {
  visible: boolean
  verticalPosition?: 'start' | 'center'
  width?: 'normal' | 'auto' | 'wide'
  heightFull?: boolean
  footer?: boolean
  title?: string
  titleIcon?: string
}
interface Emits {
  (evt: 'close'): void
  (evt: 'update:visible', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  verticalPosition: 'center',
  width: 'normal',
  footer: false,
  heightFull: false,
})
const emit = defineEmits<Emits>()

const extraContentVisible = ref(false)

const attrs = useAttrs()
const slots = useSlots()

const rootClass = computed(() => {
  return {
    'items-start': props.verticalPosition === 'start',
    'items-center': props.verticalPosition === 'center',
    ['width-' + props.width]: true,
  }
})

const closeModal = () => {
  emit('update:visible', false)
  emit('close')
}

const extraContentElement: Ref<HTMLElement | null> = ref(null)
const extraContentStyle = ref<CSSProperties>({})
const showExtraContent = () => {
  if (extraContentElement.value && !extraContentVisible.value) {
    const pd = remToPixels(1)
    const ww = window.innerWidth
    const rect = extraContentElement.value.getBoundingClientRect()
    if (rect.width + 2 * pd > ww) {
      extraContentStyle.value = { left: '0' }
      extraContentVisible.value = true
      return
    }
    if (rect.right > ww - pd) {
      const base = ww <= remToPixels(32) ? '50% + 40vw' : '50% + 13rem'
      extraContentStyle.value = {
        left: `calc(${base} - ${rect.right - ww + pd}px)`,
      }
      extraContentVisible.value = true
      return
    }
  }
}
const hideExtraContent = () => {
  if (extraContentVisible.value) {
    extraContentVisible.value = false
    extraContentStyle.value = {}
  }
}

const { t } = useI18n()
</script>

<style>
@reference "@/tailwind.css";

.cy--modal {
  @apply bg-black/20 fixed left-0 top-0 z-100 flex h-full w-full justify-center;

  & > .modal-wrapper {
    @apply relative mx-2 mb-2 mt-2.5 inline-block max-w-full;
    height: calc(100% - 1.125rem);

    & > .modal-container {
      @apply flex max-h-full w-full flex-col border-1 border-primary-30 bg-white pt-3;
      min-height: 10rem;
    }
  }

  &.width-normal > .modal-wrapper {
    width: 25rem;
  }
  &.width-wide > .modal-wrapper {
    width: 42.5rem;
  }
  &.width-auto > .modal-wrapper {
    width: auto;

    & > .modal-container {
      overflow: auto;
    }
  }
}

.modal-extra-wrapper {
  @apply absolute mx-2 my-4 flex h-full w-80 max-w-full items-center duration-300;
  left: calc(50% + 13rem);

  @media screen and (max-width: 32rem) {
    left: calc(50% + 40vw);
  }
}

.modal-extra-container {
  @apply relative flex w-full flex-col;
  max-height: calc(100% - 12rem);
}

.modal-extra {
  @apply h-full w-full overflow-y-auto pr-2;
  overscroll-behavior: none;
}

.cy--modal--close-btn {
  position: absolute;
  top: -0.75rem;
  right: -0.8rem;
  z-index: 1;
  padding: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0.3rem;
    left: 0.3rem;
    width: 0.8rem;
    height: 0.8rem;
  }
}
</style>
