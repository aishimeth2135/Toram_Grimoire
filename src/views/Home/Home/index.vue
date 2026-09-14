<template>
  <div ref="rootEl" class="relative h-full">
    <HomeBackgroud />
    <HomeBackgroundSnow />
    <div class="flex size-full flex-col items-center">
      <div class="flex size-full min-h-0" style="max-width: 1024px">
        <div class="size-full overflow-hidden">
          <div class="ml-5 flex size-full flex-col overflow-y-auto py-5 pr-11">
            <HomeMainSection class="my-auto" />
            <div v-if="!device.hasAside" class="z-1 relative mt-3">
              <div class="flex w-full items-center justify-center space-x-4 py-6">
                <router-link v-slot="{ navigate }" :to="{ name: AppRouteNames.About }" custom>
                  <cy-button-circle icon="bx-bxs-star-half" @click="navigate" />
                </router-link>
                <cy-button-circle
                  v-if="storageAvailable"
                  icon="ic-baseline-settings"
                  @click="mainStore.toggleSetting(true)"
                />
              </div>
              <div class="flex items-center justify-center py-6">
                <div class="flex items-center rounded-full bg-white/50 p-5 duration-150">
                  <HomeIconTitle :root-el="rootEl" />
                </div>
                <div class="ml-5">
                  <div class="text-primary-80 text-3xl">Cy's Grimoire</div>
                  <div class="text-primary-50 mt-0.5">布偶的魔法書</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="device.hasAside"
        class="absolute right-4 top-4 flex flex-col items-center space-y-3"
      >
        <router-link v-slot="{ navigate }" :to="{ name: AppRouteNames.About }" custom>
          <cy-button-circle icon="bx-bxs-star-half" @click="navigate" />
        </router-link>
        <cy-button-circle
          v-if="storageAvailable"
          icon="ic-baseline-settings"
          @click="mainStore.toggleSetting(true)"
        />
      </div>
      <HomeTitle v-if="device.hasAside" :root-el="rootEl" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useTemplateRef } from 'vue'

// import { useBookmarkStore } from '@/stores/app/bookmark'
import { useMainStore } from '@/stores/app/main'

import { useDevice } from '@/shared/composables/Device'
import { LocalStorageService } from '@/shared/services/Storage'

import { AppRouteNames } from '@/router/enums'

import HomeBackgroud from './home-backgroud.vue'
import HomeBackgroundSnow from './home-background-snow.vue'
import HomeIconTitle from './home-icon-title.vue'
import HomeMainSection from './home-main-section.vue'
import HomeTitle from './home-title.vue'

import { usePreviewDetect } from './usePreviewDetect'

defineOptions({
  name: 'AppHome',
})

const storageAvailable = LocalStorageService.isAvailable()

if (storageAvailable) {
  usePreviewDetect()
}

const mainStore = useMainStore()
const { device } = useDevice()

const rootEl = useTemplateRef('rootEl')

// const { bookmarks } = useBookmarkStore()
</script>
