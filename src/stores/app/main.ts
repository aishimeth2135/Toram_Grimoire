import { defineStore } from 'pinia'
import { readonly, ref, shallowReactive } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { useLanguageStore } from './language'

const version = '4.4.17'

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

  return {
    redirectPathName: readonly(redirectPathName),
    version,
    serviceWorker: readonly(serviceWorker),

    setRedirectPathName,
    clearRedirectPathName,
    serviceWorkerHasUpdate,
    updateTitle,

    startRouting: () => routerGuiding.value = true,
    endRouting: () => routerGuiding.value = false,
    routerGuiding: readonly(routerGuiding),
  }
})

