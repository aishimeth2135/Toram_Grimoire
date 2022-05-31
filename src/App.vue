<template>
  <div
    ref="appElement"
    class="h-full overflow-y-auto"
    :class="{ 'overscroll-none': mainStore.routerGuiding }"
  >
    <template v-if="languageStore.i18nMessageLoaded">
      <AppSideMenu />
      <router-view />
      <AppInitialize />
      <AppConfirm />
      <AppNotify />
      <AppSideFloatMenu :visible="sideMenuButtonVisible" />
      <AppLoading />
    </template>
    <div v-else class="fixed w-full h-full top-0 left-0 flex items-center justify-center bg-white z-100">
      <div class="flex justify-center flex-wrap">
        <LoadingAnimation :status="0" />
        <div class="text-xl w-full text-center mt-2 text-light-2">
          Initializing...
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'App',
}
</script>

<script lang="ts" setup>
import { onMounted, Ref, ref, watch } from 'vue'

import { useLanguageStore } from '@/stores/app/language'

import AppSideMenu from '@/views/app/app-side-menu.vue'
import AppInitialize from '@/views/app/initialize.vue'
import AppLoading from '@/views/app/loading.vue'
import AppNotify from '@/views/app/notify.vue'
import AppConfirm from '@/views/app/confirm.vue'
import AppSideFloatMenu from '@/views/app/app-side-float-menu.vue'
import LoadingAnimation from '@/views/app/initialization/loading-animation.vue'

import { useMainStore } from './stores/app/main'
import { debounce } from './shared/utils/function'

const sideMenuButtonVisible = ref(false)
const appElement: Ref<HTMLElement | null> = ref(null)

const startDetectScroll = (el: HTMLElement) => {
  let lastTop = 0
  let lastHeight = 0
  const handler = () => {
    const top = el.scrollTop
    const height = el.scrollHeight
    const lastTopFix = lastTop + (top < height / 2 ? lastHeight - height : height - lastHeight)
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
  el.addEventListener('scroll', debounce(handler, 200), { passive: true })
}

watch(appElement, (value) => {
  if (value) {
    startDetectScroll(value)
  }
})

onMounted(() => {
  const el = document.getElementById('app--error')
  if (el) {
    el.parentElement!.removeChild(el)
  }
})

const languageStore = useLanguageStore()
languageStore.updateLocaleGlobalMessages()

const mainStore = useMainStore()
</script>
