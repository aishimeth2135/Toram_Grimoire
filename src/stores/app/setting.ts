import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { APP_STORAGE_KEYS } from '@/shared/consts/storage'
import { LocalStorageService } from '@/shared/services/Storage'
import { toInt } from '@/shared/utils/number'

export const useSettingStore = defineStore('app-setting', () => {
  const getSetting = (key: string) => {
    const result = LocalStorageService.getItem(key)
    return result.success ? result.value : null
  }

  const appFont = ref(toInt(getSetting(APP_STORAGE_KEYS.FONT_FAMILY)) ?? 1)
  const appRem = ref(toInt(getSetting(APP_STORAGE_KEYS.ROOT_ELEMENT_FONT_SIZE)) ?? 160)
  const appNightMode = ref(getSetting(APP_STORAGE_KEYS.NIGHT_MODE) === '1')

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
        LocalStorageService.setItem(APP_STORAGE_KEYS.FONT_FAMILY, value.toString())
      },
      get() {
        return appFont.value
      },
    }),
    appRem: computed<number>({
      set(value) {
        appRem.value = value
        document.documentElement.style.fontSize = (value / 10).toString() + 'px'
        LocalStorageService.setItem(APP_STORAGE_KEYS.ROOT_ELEMENT_FONT_SIZE, value.toString())
      },
      get() {
        return appRem.value
      },
    }),
    appNightMode: computed<boolean>({
      set(value) {
        appNightMode.value = value
        document.documentElement.classList.toggle('theme--night-mode', value)
        LocalStorageService.setItem(APP_STORAGE_KEYS.NIGHT_MODE, value ? '1' : '0')
      },
      get() {
        return appNightMode.value
      },
    }),
  }
})
