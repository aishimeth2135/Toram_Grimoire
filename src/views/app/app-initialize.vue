<template>
  <div
    v-if="status !== InitializeStatus.Finished"
    class="z-100 fixed left-0 top-0 flex size-full items-center justify-center bg-white py-4"
  >
    <HomeBackgroud />
    <div class="relative flex w-full flex-col items-center">
      <div class="flex size-32 items-center justify-center rounded-full bg-white/50">
        <LoadingAnimation :status="status" @done="initializeStore.initFinished()" />
      </div>
      <div
        v-if="status < InitializeStatus.BeforeFinished"
        class="mt-8 flex min-h-48 w-full justify-center bg-white/40 px-4 py-6"
      >
        <div class="mt-2 inline-block">
          <template v-if="status <= InitializeStatus.ViewSuccess">
            <div
              v-for="item in initItems"
              :key="item.message"
              class="mb-2 flex items-center justify-center pl-1"
            >
              <cy-icon
                :icon="statusIcon(item.status)"
                :class="{
                  'loading-circle': item.status === InitItemStatus.Loading,
                  'text-orange-60': item.status === InitItemStatus.Error,
                  'text-blue-60': item.status !== InitItemStatus.Error,
                }"
                width="1.25rem"
              />
              <span class="text-primary-70 ml-4 w-full">
                {{ t(item.message) }}
              </span>
            </div>
          </template>
          <template v-else-if="status <= InitializeStatus.LocaleSuccess">
            <div class="flex items-center justify-center pl-1">
              <span class="text-primary-60 mr-3 w-full">
                {{ t('app.loading-message.init-locale') }}
              </span>
              <cy-icon
                :icon="statusIcon(status - 10)"
                :class="{
                  'loading-circle': status === InitializeStatus.LocaleLoading,
                }"
                class="text-blue-60"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="absolute bottom-4 right-4 text-sm">
      <div>{{ t('app.loading-message.bottom-tips.0') }}</div>
      <div>{{ t('app.loading-message.bottom-tips.1') }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { useInitializeStore } from '@/stores/app/initialize'
import { InitItemStatus, InitializeStatus } from '@/stores/app/initialize/enums'

import HomeBackgroud from '@/views/Home/Home/home-backgroud.vue'

import LoadingAnimation from './initialization/loading-animation.vue'

const initializeStore = useInitializeStore()

const { initItems, status } = storeToRefs(initializeStore)

const { t } = useI18n()
const statusIcon = (value: number) => {
  if (value >= 0) {
    return ['mdi-loading', 'ic-round-check-circle-outline'][value]
  }
  return 'ic-round-close'
}
</script>

<style scoped>
.loading-circle {
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
