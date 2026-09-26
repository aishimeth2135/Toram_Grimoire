<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

interface Props {
  visible: boolean
  contentClass?: any
  size?: 'md' | 'lg'
}
interface Emits {
  (evt: 'close'): void
}

withDefaults(defineProps<Props>(), {
  size: 'md',
})
const emit = defineEmits<Emits>()

const { t } = useI18n()
</script>

<template>
  <teleport to="#app-float-pages">
    <cy-transition>
      <div v-if="visible" class="app-layout--side-float-wrapper" @click="emit('close')">
        <div class="app-layout--side-float" :class="`side-float-${size}`" @click.stop>
          <div class="sticky top-0 z-10 flex justify-end bg-white/75 pb-1.5 pt-2.5">
            <span
              class="text-primary-40 flex cursor-pointer items-center px-3 text-sm"
              @click="emit('close')"
            >
              <cy-icon icon="ic:round-close" class="mr-1" small />
              {{ t('global.close') }}
            </span>
          </div>
          <div :class="contentClass">
            <slot />
          </div>
        </div>
      </div>
    </cy-transition>
  </teleport>
</template>
