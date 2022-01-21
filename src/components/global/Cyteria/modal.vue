<template>
  <teleport to="#app-modals">
    <cy-transition type="fade">
      <div
        v-if="visible"
        class="cy--modal"
        :class="rootClass"
        v-bind="$attrs"
        @click="closeWindow"
      >
        <div class="modal-wrapper">
          <cy-button-icon
            icon="jam-close-circle-f"
            icon-width="1.5rem"
            class="cy--modal--close-btn"
            @click.stop="closeWindow"
          />
          <div class="modal-container" @click.stop>
            <div class="pb-2 px-4">
              <slot name="title" />
            </div>
            <div class="p-4 pt-0 relative">
              <slot />
            </div>
            <div v-if="footer" class="sticky bottom-0 mt-4 py-2 mx-4 bg-white flex">
              <cy-button-border icon="ic-round-close" class="ml-auto" @click="closeWindow">
                {{ t('global.close') }}
              </cy-button-border>
            </div>
          </div>
        </div>
        <div
          v-if="$slots['content-extra']"
          ref="extraContentElement"
          class="modal-extra-wrapper bg-opacity-100"
          :style="extraContentStyle"
        >
          <div class="modal-extra-container" @click.stop>
            <div class="modal-extra" @click="showExtraContent">
              <slot name="content-extra" />
            </div>
            <div class="absolute left-0 -bottom-16">
              <cy-button-circle
                v-show="extraContent.main"
                main-color="water-blue"
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

<script lang="ts">
import { computed, CSSProperties, ref, Ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { remToPixels } from '@/shared/utils/element'

import ToggleService from '@/setup/ToggleService'

export default {
  name: 'CyModal',
  inheritAttrs: false,
}
</script>

<script lang="ts" setup>
interface Props {
  visible: boolean;
  verticalPosition?: 'start' | 'center';
  width?: 'normal' | 'auto' | 'wide';
  footer?: boolean;
}
interface Emits {
  (evt: 'close'): void;
  (evt: 'update:visible', value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  verticalPosition: 'center',
  width: 'normal',
  footer: false,
})
const emit = defineEmits<Emits>()

const rootClass = computed(() => {
  return {
    'items-start': props.verticalPosition === 'start',
    'items-center': props.verticalPosition === 'center',
    ['width-' + props.width]: true,
  }
})

const closeWindow = () => {
  emit('update:visible', false)
  emit('close')
}

const { extraContent, toggle } = ToggleService({ extraContent: ['main'] as const })

const extraContentElement: Ref<HTMLElement | null> = ref(null)
const extraContentStyleOriginal = { left: 'calc(50% + 13rem)' }
const extraContentStyle = ref<CSSProperties>(extraContentStyleOriginal)
const showExtraContent = () => {
  if (extraContentElement.value && !extraContent.main) {
    const pd = remToPixels(1)
    const ww = window.innerWidth
    const rect = extraContentElement.value.getBoundingClientRect()
    if (rect.width > ww + 2 * pd) {
      extraContentStyle.value = { left: '1rem' }
      toggle('extraContent/main', true)
      return
    }
    if (rect.right > ww - pd) {
      extraContentStyle.value = { left: `calc(50% + 13rem - ${rect.right - ww + pd}px)` }
      toggle('extraContent/main', true)
      return
    }
  }
}
const hideExtraContent = () => {
  if (extraContent.main) {
    toggle('extraContent/main', false)
    extraContentStyle.value = extraContentStyleOriginal
  }
}

const { t } = useI18n()
</script>

<style lang="postcss" scoped>
.cy--modal {
  @apply fixed h-full w-full top-0 left-0 flex justify-center bg-black bg-opacity-10;

  z-index: 49;

  & > .modal-wrapper {
    @apply relative inline-block my-4 mx-2 bg-opacity-100 max-w-full;

    height: calc(100% - 2rem);

    & > .modal-container {
      @apply w-full overflow-y-auto max-h-full pt-3 border-1 border-light bg-white;

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
  @apply absolute w-80 h-full max-w-full m-4 duration-300 flex items-center;
}

.modal-extra-container {
  @apply max-h-full w-full relative;
}

.modal-extra {
  @apply max-h-full w-full pr-2 overflow-y-auto;

  max-height: 70%;
}

.cy--modal--close-btn {
  position: absolute;
  top: -0.75rem;
  right: -0.8rem;
  z-index: 51;
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
