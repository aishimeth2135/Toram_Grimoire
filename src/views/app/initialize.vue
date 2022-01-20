<template>
  <div
    v-if="status !== InitializeStatus.Finished"
    class="w-full h-full fixed top-0 left-0 bg-white z-100 flex items-center justify-center p-4"
  >
    <div class="max-w-full text-center w-128">
      <div class="border-light pb-4" :class="{ 'border-b': status < InitializeStatus.BeforeFinished }">
        <LoadingAnimation :status="status" @done="initializeStore.initFinished()" />
      </div>
      <div v-if="status < InitializeStatus.BeforeFinished" class="pt-8 inline-block">
        <template v-if="status <= InitializeStatus.ViewSuccess">
          <div v-for="item in initItems" :key="item.msg" class="flex justify-center items-center mb-2 pl-1">
            <span class="mr-3 w-full text-light-4">{{ t(item.msg) }}</span>
            <cy-icon-text
              display-block
              :icon="statusIcon(item.status)"
              :class="{ 'loading-circle': item.status === InitItemStatus.Loading }"
              :icon-color="item.status === InitItemStatus.Error ? 'red' : 'water-blue'"
            />
          </div>
        </template>
        <template v-else-if="status <= InitializeStatus.LocaleSuccess">
          <div class="flex justify-center items-center pl-1">
            <span class="mr-3 w-full text-light-4">{{ t('app.loading-message.init-locale') }}</span>
            <cy-icon-text
              display-block
              :icon="statusIcon(status - 10)"
              :class="{ 'loading-circle': status === InitializeStatus.LocaleLoading }"
              icon-color="water-blue"
            />
          </div>
        </template>
      </div>
    </div>
    <div class="absolute right-4 bottom-4 text-sm">
      <div>{{ t('app.loading-message.bottom-tips.0') }}</div>
      <div>{{ t('app.loading-message.bottom-tips.1') }}</div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AppInitialzie',
}
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { useInitializeStore } from '@/stores/app/initialize'
import { InitializeStatus, InitItemStatus } from '@/stores/app/initialize/enums'

import LoadingAnimation from './initialization/loading-animation.vue'


const initializeStore = useInitializeStore()

const {
  initItems,
  status,
} = storeToRefs(initializeStore)

const { t } = useI18n()
const statusIcon = (value: number) => {
  if (value >= 0) {
    return ['mdi-loading', 'ic-round-check-circle-outline'][value]
  }
  return 'ic-round-close'
}
</script>

<style lang="less" scoped>
&.loading-circle {
  animation: loading-circle 0.8s ease infinite;
}
@keyframes loading-circle {
  0% {
    transform: rotateZ(0);
  }
  80% {
    transform: rotateZ(359deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}
</style>
