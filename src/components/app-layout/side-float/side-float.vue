<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

interface Props {
  visible: boolean
  contentClass?: any
}
interface Emits {
  (evt: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
</script>

<template>
  <teleport to="#app-float-pages">
    <cy-transition>
      <div
        v-if="visible"
        class="app-layout--side-float-wrapper"
        @click="emit('close')"
      >
        <div class="app-layout--side-float" @click.stop>
          <div class="flex justify-end pb-1.5 pt-2.5">
            <span
              class="flex cursor-pointer items-center px-3 text-sm text-primary-40"
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
