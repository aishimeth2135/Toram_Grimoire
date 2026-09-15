import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { AppStorageService } from '@/shared/services/AppStorageService'

export const useSettingStore = defineStore('app-setting', () => {
  const appFont = ref(AppStorageService.getFontFamily())
  const appRem = ref(AppStorageService.getRootElementFontSize())
  const appNightMode = ref(AppStorageService.getNightMode())

  const initDocumentElementClassList = () => {
    const rel = document.documentElement
    rel.classList.add('app-font-' + appFont.value.toString())
    rel.style.fontSize = (appRem.value / 10).toString() + 'px'
    rel.classList.toggle('theme--night-mode', appNightMode.value)
  }

  return {
    initDocumentElementClassList,

    appFont: computed<number>({
      set(value) {
        if (appFont.value !== 0) {
          document.documentElement.classList.remove('app-font-' + appFont.value.toString())
        }
        appFont.value = value
        if (value !== 0) {
          document.documentElement.classList.add('app-font-' + value.toString())
        }
        AppStorageService.setFontFamily(value)
      },
      get() {
        return appFont.value
      },
    }),
    appRem: computed<number>({
      set(value) {
        appRem.value = value
        document.documentElement.style.fontSize = (value / 10).toString() + 'px'
        AppStorageService.setRootElementFontSize(value)
      },
      get() {
        return appRem.value
      },
    }),
    appNightMode: computed<boolean>({
      set(value) {
        appNightMode.value = value
        document.documentElement.classList.toggle('theme--night-mode', value)
        AppStorageService.setNightMode(value)
      },
      get() {
        return appNightMode.value
      },
    }),
  }
})
