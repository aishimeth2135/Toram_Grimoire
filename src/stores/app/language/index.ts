import { defineStore } from 'pinia'
import { computed, reactive, readonly, ref } from 'vue'
import { Composer } from 'vue-i18n'

import { APP_STORAGE_KEYS } from '@/shared/consts'
import CY from '@/shared/utils/Cyteria'

import Notify from '@/setup/Notify'

import { I18nStore } from './I18nStore'
import {
  LocaleGlobalNamespaces,
  LocaleNamespaces,
  LocaleViewNamespaces,
} from './enums'

interface LangData {
  [key: string]: LangData | string
}

type LangInjectData = Record<string, LangData | (() => LangData)>

export const DEFAULT_LOCALE = 'zh-TW'
const LOCALE_LIST = ['en', 'zh-TW', 'ja', 'zh-CN']
const LOCALE_GLOBAL_NAMESPACE_LIST: LocaleGlobalNamespaces[] = [
  LocaleGlobalNamespaces.App,
  LocaleGlobalNamespaces.Common,
  LocaleGlobalNamespaces.Global,
]

export const useLanguageStore = defineStore('app-language', () => {
  const primaryLang = ref(0)
  const secondaryLang = ref(0)
  const i18nMessageLoaded = ref(false)
  const i18n = computed(() => I18nStore.i18n)
  const i18nLoadedLocaleNamespaces = reactive(new Set<LocaleNamespaces>())

  const primaryLocale = computed(() => {
    return LOCALE_LIST[primaryLang.value]
  })

  const fallbackLocale = computed(() => {
    return LOCALE_LIST[secondaryLang.value]
  })

  const setI18nInstance = (i18nInstance: Composer) => {
    I18nStore.i18n = i18nInstance
  }

  const autoSetLang = () => {
    const lang = // @ts-ignore
      (window.navigator.language || window.navigator.userLanguage).toLowerCase()
    const list: Record<string, number> = {
      'zh-tw': 1,
      'zh-hk': 1,
      'ja': 2,
      'zh-cn': 3,
    }
    primaryLang.value = list[lang as string] ?? 0
  }

  const initLocale = () => {
    if (CY.storageAvailable('localStorage')) {
      // default
      if (!localStorage.getItem(APP_STORAGE_KEYS.PRIMARY_LOCALE)) {
        localStorage.setItem(APP_STORAGE_KEYS.PRIMARY_LOCALE, 'auto')
      }
      if (!localStorage.getItem(APP_STORAGE_KEYS.FALLBACK_LOCALE)) {
        localStorage.setItem(APP_STORAGE_KEYS.FALLBACK_LOCALE, '0')
      }

      const curLangSet = localStorage.getItem(APP_STORAGE_KEYS.PRIMARY_LOCALE)!
      if (curLangSet === 'auto') {
        autoSetLang()
      } else {
        primaryLang.value = parseInt(curLangSet, 10)
      }

      secondaryLang.value = parseInt(
        localStorage.getItem(APP_STORAGE_KEYS.FALLBACK_LOCALE)!,
        10
      )
    } else {
      autoSetLang()
    }
  }

  type LoadLocaleMessages<
    Namespace extends LocaleNamespaces = LocaleNamespaces
  > = (namespaces: Namespace | Namespace[]) => Promise<void>
  const loadLocaleMessages: LoadLocaleMessages = async namespaces => {
    const namespaceList =
      typeof namespaces === 'string' ? [namespaces] : namespaces
    if (!i18n.value) {
      console.warn('[Init language data] instance is no found')
      return
    }

    let unknownError = false

    const loadData = async (locale: string) => {
      const data = {} as Record<string, object>
      const promises = namespaceList.map(async namespace => {
        let count = 0
        let resultData!: object
        const retry = async () => {
          try {
            const dataModule = await import(
              `../../../locales/${locale}/${namespace}.yaml`
            )
            resultData = dataModule.default ?? {}
          } catch (err) {
            count += 1
          }
        }
        while (count < 3 && !resultData) {
          await retry()
        }
        if (!resultData) {
          unknownError = true
        }
        data[namespace] = resultData ?? {}
      })
      await Promise.all(promises)

      return data
    }
    const messages = await loadData(primaryLocale.value)
    const fallbackMessages = await loadData(fallbackLocale.value)
    i18n.value.mergeLocaleMessage(primaryLocale.value, messages)
    i18n.value.mergeLocaleMessage(fallbackLocale.value, fallbackMessages)

    if (
      primaryLocale.value !== DEFAULT_LOCALE &&
      fallbackLocale.value !== DEFAULT_LOCALE
    ) {
      const defaultMessages = await loadData(DEFAULT_LOCALE)
      i18n.value.mergeLocaleMessage(DEFAULT_LOCALE, defaultMessages)
    }

    namespaceList.forEach(namespace =>
      i18nLoadedLocaleNamespaces.add(namespace)
    )

    if (unknownError) {
      const { notify } = Notify()
      notify(
        'An unknown error occurred while initializing the locale datas, texts on the page will be displayed abnormally. Please refresh the page later to try to reinitialize.'
      )
    }
  }

  const updateLocaleGlobalMessages = async () => {
    if (!i18n.value) {
      console.warn('[Init language data] instance is no found')
      return
    }
    await loadLocaleMessages(LOCALE_GLOBAL_NAMESPACE_LIST)

    i18nMessageLoaded.value = true
  }

  return {
    primaryLang: readonly(primaryLang),
    secondaryLang: readonly(secondaryLang),
    i18n: readonly(i18n),
    i18nMessageLoaded: readonly(i18nMessageLoaded),
    i18nLoadedLocaleNamespaces,
    primaryLocale,
    fallbackLocale,

    setI18nInstance,
    initLocale,
    loadLocaleMessages:
      loadLocaleMessages as LoadLocaleMessages<LocaleViewNamespaces>,
    updateLocaleGlobalMessages,
  }
})

export type { LangInjectData }
