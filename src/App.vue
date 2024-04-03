<template>
  <div
    id="app-root"
    ref="appElement"
    class="h-full overflow-y-auto"
    :class="{
      'overscroll-none': mainStore.routerGuiding,
      'page-wide': layout.wide && !device.isMobile,
      'page-has-aside': device.hasAside,
    }"
  >
    <template v-if="languageStore.i18nMessageLoaded">
      <AppSideMenu v-if="currentRoute.name !== AppRouteNames.Home" />
      <div id="app-top" />
      <div
        id="app-top-sticky"
        ref="appSticky"
        class="app-layout-container-root"
        :style="`top: ${sideMenuButtonVisible ? 0 : -1 * appStickyHeight}px`"
      />
      <router-view />
      <AppSetting />
      <AppInitialize />
      <AppConfirm />
      <AppNotify />
      <AppSideFloatMenu :visible="sideMenuButtonVisible" />
      <AppLoading />
    </template>
    <div
      v-else
      class="fixed left-0 top-0 z-100 flex h-full w-full items-center justify-center bg-white"
    >
      <div class="flex flex-wrap justify-center">
        <LoadingAnimation :status="0" />
        <div class="mt-2 w-full text-center text-xl text-primary-30">
          Initializing...
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useLanguageStore } from '@/stores/app/language'
import { useMainStore } from '@/stores/app/main'

import { debounce } from '@/shared/utils/function'

import { AppRouteNames } from '@/router/enums'
import AppConfirm from '@/views/app/app-confirm.vue'
import AppInitialize from '@/views/app/app-initialize.vue'
import AppLoading from '@/views/app/app-loading.vue'
import AppNotify from '@/views/app/app-notify.vue'
import AppSetting from '@/views/app/app-settings.vue'
import AppSideFloatMenu from '@/views/app/app-side-float-menu.vue'
import AppSideMenu from '@/views/app/app-side-menu.vue'
import LoadingAnimation from '@/views/app/initialization/loading-animation.vue'

import { useDevice } from './shared/setup/Device'
import { useResizeObserver } from './shared/setup/ElementObserver'
import { usePageLayout } from './shared/setup/Layout'

defineOptions({
  name: 'App',
})

const { layout } = usePageLayout()

const { device } = useDevice()

const sideMenuButtonVisible = ref(false)
const appElement: Ref<HTMLElement | null> = ref(null)

const startDetectScroll = (el: HTMLElement) => {
  let lastTop = 0
  let lastHeight = 0
  const handler = () => {
    const top = el.scrollTop
    const height = el.scrollHeight
    const lastTopFix =
      lastTop + (top < height / 2 ? lastHeight - height : height - lastHeight)
    if (top <= 0) {
      sideMenuButtonVisible.value = true
    } else if (top < lastTopFix) {
      sideMenuButtonVisible.value = true
    } else {
      sideMenuButtonVisible.value = false
    }
    lastTop = top
    lastHeight = height
  }
  handler()
  el.addEventListener('scroll', debounce(handler, 100), { passive: true })
}

watch(appElement, value => {
  if (value) {
    startDetectScroll(value)
  }
})

const appSticky: Ref<HTMLElement | null> = ref(null)
const appStickyHeight = ref(0)
useResizeObserver(appSticky, () => {
  if (appSticky.value) {
    appStickyHeight.value = appSticky.value?.clientHeight
  }
})

onMounted(() => {
  const el = document.getElementById('app--error')
  if (el) {
    el.parentElement!.removeChild(el)
  }
  if (appSticky.value) {
    appStickyHeight.value = appSticky.value?.clientHeight
  }
})

const languageStore = useLanguageStore()

const mainStore = useMainStore()

languageStore.updateLocaleGlobalMessages().then(() => mainStore.updateTitle())

const { currentRoute } = useRouter()
</script>
