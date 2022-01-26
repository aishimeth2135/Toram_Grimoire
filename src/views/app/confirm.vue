<template>
  <div
    v-if="store.confirmItems.length !== 0"
    class="fixed w-full h-full z-100 top-0 left-0"
  >
    <div class="absolute w-full h-full bg-black opacity-30 -z-1" />
    <div class="w-full h-full flex items-center justify-center">
      <div class="w-full max-w-sm max-h-full overflow-y-auto border border-light-2 bg-white p-6 m-4 app-confirm-slide-up">
        <div class="mb-6 flex">
          <div>
            <cy-icon-text
              :icon="item.icon"
              :icon-src="(typeof item.icon === 'string') ? 'iconify' : item.icon.src"
              style="--icon-width: 2rem"
              class="flex-shrink-0 mr-4"
            />
          </div>
          <div>
            {{ item.message }}
          </div>
        </div>
        <div class="flex items-center">
          <cy-button-border
            icon="line-md:confirm-circle"
            class="ml-auto"
            @click="confirm"
          >
            {{ t('global.confirm') }}
          </cy-button-border>
          <cy-button-border
            icon="ic-round-cancel"
            type="border"
            main-color="gray"
            @click="cancel"
          >
            {{ t('global.cancel') }}
          </cy-button-border>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AppConfirm',
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { ConfirmItem, useConfirmStore } from '@/stores/app/confirm'


const store = useConfirmStore()

// if store.confirmItems.length is 0, this component will hide
const item = computed<ConfirmItem>(() => store.confirmItems[0])

const confirm = () => {
  item.value.confirm?.()
}

const cancel = () => store.nextItem()

const { t } = useI18n()
</script>

<style lang="postcss" scoped>
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
