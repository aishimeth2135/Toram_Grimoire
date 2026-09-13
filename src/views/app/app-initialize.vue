<template>
  <div
    v-if="status !== InitializeStatus.Finished"
    class="z-100 fixed left-0 top-0 flex size-full items-center justify-center bg-white py-4"
    :class="{ 'bg-white/50': isDeferred }"
  >
    <HomeBackgroud :class="{ 'opacity-50': isDeferred }" />
    <div
      class="wd:bg-transparent relative flex w-full flex-col items-center justify-center bg-white/75"
    >
      <div
        class="wd:flex-row wd:bg-white/75 mx-4 flex flex-col items-center gap-4 rounded-2xl px-8 py-6"
      >
        <div class="wd:w-48 wd:max-w-48 wd:py-6 flex items-center justify-center">
          <div
            class="title-icon-bg wd:size-32 flex size-24 items-center justify-center rounded-full"
          >
            <AppInitializeLogo :status="status" @done="initializeStore.emitInitFinished()" />
          </div>
        </div>
        <div v-if="contentVisible" class="flex flex-col justify-center px-4">
          <div class="wd:max-h-56 wd:min-w-56 wd:py-6 wd:pr-4 flex grow flex-col flex-wrap gap-x-4">
            <template v-if="viewStatusVisible">
              <div
                v-for="item in initItems"
                :key="item.message"
                class="gap-icon mb-2 flex items-center pl-1 text-sm"
              >
                <cy-icon
                  :icon="statusIcon(item.status)"
                  :class="{
                    'loading-circle': item.status === InitItemStatus.Loading,
                    'text-orange-60': item.status === InitItemStatus.Error,
                    'text-blue-60': item.status !== InitItemStatus.Error,
                  }"
                  class="icon-first-line"
                />
                <span class="text-primary-70 w-full">
                  {{ t(item.message) }}
                </span>
              </div>
              <div v-if="status === InitializeStatus.Error" class="mt-4 text-center">
                <div class="text-orange-60 mb-2">
                  {{ t('app.loading-message.load-failed') }}
                </div>
                <cy-button-plain
                  icon="mdi-refresh"
                  :disabled="retrying"
                  @click="initializeStore.retryInit()"
                >
                  {{ t(retrying ? 'app.loading-message.retrying' : 'app.loading-message.retry') }}
                </cy-button-plain>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center justify-center pl-1">
                <span class="text-primary-60 mr-3 w-full">
                  {{ t('app.loading-message.init-locale') }}
                </span>
                <cy-icon
                  :icon="
                    statusIcon(
                      status === InitializeStatus.LocaleLoading
                        ? InitItemStatus.Loading
                        : InitItemStatus.Success
                    )
                  "
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
    </div>
    <div class="absolute bottom-4 right-4 text-sm">
      <div>{{ t('app.loading-message.bottom-tips.0') }}</div>
      <div>{{ t('app.loading-message.bottom-tips.1') }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useInitializeStore } from '@/stores/app/initialize'
import { InitItemStatus, InitializeStatus } from '@/stores/app/initialize/enums'

import HomeBackgroud from '@/views/Home/Home/home-backgroud.vue'

import AppInitializeLogo from './app-initialize-logo.vue'

const initializeStore = useInitializeStore()

const { initItems, status, isDeferred, retrying } = storeToRefs(initializeStore)

const { t } = useI18n()
const contentVisible = computed(
  () =>
    status.value !== InitializeStatus.BeforeFinished && status.value !== InitializeStatus.Finished
)
const viewStatusVisible = computed(
  () =>
    status.value === InitializeStatus.ViewLoading ||
    status.value === InitializeStatus.ViewSuccess ||
    status.value === InitializeStatus.Error
)
const statusIcon = (value: InitItemStatus) => {
  if (value === InitItemStatus.Loading) {
    return 'mdi-loading'
  }
  if (value === InitItemStatus.Success) {
    return 'ic-round-check-circle-outline'
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

.title-icon-bg {
  background: linear-gradient(to bottom right, var(--app-blue-10) 0%, var(--app-primary-10) 100%);
}
</style>
