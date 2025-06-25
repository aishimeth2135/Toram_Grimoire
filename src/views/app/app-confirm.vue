<template>
  <div v-if="store.confirmItems.length !== 0" class="fixed left-0 top-0 z-100 h-full w-full">
    <div class="absolute -z-1 h-full w-full bg-black opacity-30" />
    <div class="flex h-full w-full items-center justify-center">
      <div
        class="app-confirm-slide-up m-4 max-h-full w-full max-w-sm overflow-y-auto border border-primary-30 bg-white p-6"
      >
        <div class="mb-6 flex">
          <div>
            <cy-icon :icon="item.icon" icon-width="2rem" class="mr-4 shrink-0" />
          </div>
          <div>
            {{ item.message }}
          </div>
        </div>
        <div class="flex items-center justify-end">
          <cy-button-action icon="line-md:confirm-circle" @click="confirm">
            {{ t('global.confirm') }}
          </cy-button-action>
          <cy-button-action icon="ic-round-cancel" color="secondary" @click="cancel">
            {{ t('global.cancel') }}
          </cy-button-action>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { type ConfirmItem, useConfirmStore } from '@/stores/app/confirm'

const store = useConfirmStore()

// if store.confirmItems.length is 0, this component will hide
const item = computed<ConfirmItem>(() => store.confirmItems[0])

const confirm = () => {
  item.value.confirm?.()
}

const cancel = () => store.nextItem()

const { t } = useI18n()
</script>

<style scoped>
.app-confirm-slide-up {
  animation: app-confirm-slide-up 0.3s ease;
}

@keyframes app-confirm-slide-up {
  0% {
    transform: translateY(30%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
