<template>
  <div ref="rootEl" class="relative h-full">
    <HomeBackgroud />
    <HomeBackgroundSnow />
    <div class="flex h-full w-full flex-col items-center">
      <div class="flex h-full min-h-0 w-full" style="max-width: 1024px">
        <div class="h-full w-full overflow-hidden">
          <div
            class="ml-5 flex h-full w-full flex-col overflow-y-auto py-5 pr-11"
          >
            <HomeMainSection class="my-auto bg-opacity-100" />
            <div v-if="!device.hasAside" class="relative z-1 mt-3">
              <div
                class="flex w-full items-center justify-center space-x-4 py-6"
              >
                <router-link
                  v-slot="{ navigate }"
                  :to="{ name: AppRouteNames.About }"
                  custom
                >
                  <cy-button-circle icon="bx-bxs-star-half" @click="navigate" />
                </router-link>
                <cy-button-circle
                  v-if="storageAvailable"
                  icon="ic-baseline-settings"
                  @click="mainStore.toggleSetting(true)"
                />
              </div>
              <div class="flex items-center justify-center py-6">
                <div
                  class="flex items-center rounded-full bg-white bg-opacity-50 p-5 duration-150"
                >
                  <HomeIconTitle :root-el="rootEl" />
                </div>
                <div class="ml-5">
                  <div class="text-3xl text-primary-80">Cy's Grimoire</div>
                  <div class="mt-0.5 text-primary-50">布偶的魔法書</div>
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
        <router-link
          v-slot="{ navigate }"
          :to="{ name: AppRouteNames.About }"
          custom
        >
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

<script lang="ts">
import { Ref, ref } from 'vue'

// import { useBookmarkStore } from '@/stores/app/bookmark'
import { useMainStore } from '@/stores/app/main'

import { useDevice } from '@/shared/setup/Device'
import Cyteria from '@/shared/utils/Cyteria'

import { AppRouteNames } from '@/router/enums'

import HomeBackgroud from './home-backgroud.vue'
import HomeBackgroundSnow from './home-background-snow.vue'
import HomeIconTitle from './home-icon-title.vue'
import HomeMainSection from './home-main-section.vue'
import HomeTitle from './home-title.vue'

export default {
  name: 'AppHome',
}
</script>

<script lang="ts" setup>
const storageAvailable = Cyteria.storageAvailable('localStorage')

const mainStore = useMainStore()
const { device } = useDevice()

const rootEl: Ref<HTMLElement | null> = ref(null)

// const { bookmarks } = useBookmarkStore()
</script>
