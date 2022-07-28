import { defineStore } from 'pinia'
import { computed, readonly, ref, shallowReactive } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { useLanguageStore } from './language'

const version = '4.5.23'

export const useMainStore = defineStore('app-main', () => {
  const redirectPathName = ref<string | null>(null)
  const serviceWorker = shallowReactive<{
    update: Function | null;
    hasUpdate: boolean;
  }>({
    update: null,
    hasUpdate: false,
  })
  const documentTitleId = ref('')
  const routerGuiding = ref(false)

  const setRedirectPathName = (path: string) => {
    redirectPathName.value = path
  }
  const clearRedirectPathName = () => {
    redirectPathName.value = null
  }

  const serviceWorkerHasUpdate = (update: Function) => {
    serviceWorker.update = update
    serviceWorker.hasUpdate = true
  }

  const setTitleId = (titleId: string | null = null) => {
    if (titleId !== null) {
      documentTitleId.value = titleId
    }
  }

  const languageStore = useLanguageStore()

  const updateTitle = (titleId: string | null = null) => {
    setTitleId(titleId)
    if (!languageStore.i18nMessageLoaded) {
      return
    }
    let title = Grimoire.i18n.t('app.page-title.base')
    if (documentTitleId.value) {
      title += '｜' + Grimoire.i18n.t(documentTitleId.value)
    }
    window.document.title = title
  }

  const _devMode = ref(localStorage.getItem('dev-mode') === '1')
  const devMode = computed({
    get() {
      return _devMode.value
    },
    set(value) {
      if (value) {
        localStorage.setItem('dev-mode', '1')
      } else {
        localStorage.removeItem('dev-mode')
      }
      _devMode.value = value
    },
  })

  const previewMode = window.location.hostname.startsWith('doll-preview') || window.location.hostname.startsWith('localhost')

  return {
    redirectPathName: readonly(redirectPathName),
    version,
    serviceWorker: readonly(serviceWorker),
    devMode,
    previewMode,

    setRedirectPathName,
    clearRedirectPathName,
    serviceWorkerHasUpdate,
    updateTitle,

    startRouting: () => routerGuiding.value = true,
    endRouting: () => routerGuiding.value = false,
    routerGuiding: readonly(routerGuiding),
  }
})

