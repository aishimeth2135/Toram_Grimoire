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
            <div v-if="slots['title'] || title" class="text-primary-70 flex items-center px-4 pb-2">
              <slot name="title">
                <cy-icon :icon="titleIcon" class="mr-1.5" />
                {{ title }}
              </slot>
              <slot name="title-end" />
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
import { type CSSProperties, computed, ref, useAttrs, useSlots, useTemplateRef } from 'vue'
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

const extraContentElement = useTemplateRef('extraContentElement')
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
  display: flex;
  position: fixed;
  top: --spacing(0);
  left: --spacing(0);
  justify-content: center;
  z-index: 100;
  background-color: --alpha(var(--color-black) / 20%);
  width: 100%;
  height: 100%;

  & > .modal-wrapper {
    display: inline-block;
    position: relative;
    margin-inline: --spacing(2);
    margin-top: --spacing(2.5);
    margin-bottom: --spacing(2);
    max-width: 100%;
    height: calc(100% - 1.125rem);

    & > .modal-container {
      display: flex;
      flex-direction: column;
      border-width: 2px;
      border-color: var(--color-primary-30);
      background-color: var(--color-white);
      padding-top: --spacing(3);
      width: 100%;
      min-height: 10rem;
      max-height: 100%;
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
  display: flex;
  position: absolute;
  left: calc(50% + 13rem);
  align-items: center;
  transition-duration: 300ms;
  margin-inline: --spacing(2);
  margin-block: --spacing(4);
  width: --spacing(80);
  max-width: 100%;
  height: 100%;

  @media screen and (max-width: 32rem) {
    left: calc(50% + 40vw);
  }
}

.modal-extra-container {
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  max-height: calc(100% - 12rem);
}

.modal-extra {
  padding-right: --spacing(2);
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: none;
}

.cy--modal--close-btn {
  position: absolute;
  top: -0.75rem;
  right: -0.8rem;
  z-index: 1;
  padding: 0;

  &::before {
    position: absolute;
    top: 0.3rem;
    left: 0.3rem;
    width: 0.8rem;
    height: 0.8rem;
    content: '';
  }
}
</style>
