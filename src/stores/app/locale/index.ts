import { defineStore } from 'pinia'
import { computed, reactive, readonly, ref } from 'vue'
import { type Composer } from 'vue-i18n'

import { useNotify } from '@/shared/composables/Notify'
import { APP_STORAGE_KEYS } from '@/shared/consts/storage'
import { LocalStorageService } from '@/shared/services/Storage'
import { toInt } from '@/shared/utils/number'

import { I18nStore } from './I18nStore'
import { LocaleGlobalNamespaces, type LocaleNamespaces, LocaleViewNamespaces } from './enums'

export const DEFAULT_LOCALE = 'zh-TW'
const LOCALE_LIST = ['en', 'zh-TW', 'ja', 'zh-CN']
const LOCALE_GLOBAL_NAMESPACE_LIST: LocaleGlobalNamespaces[] = [
  LocaleGlobalNamespaces.App,
  LocaleGlobalNamespaces.Common,
  LocaleGlobalNamespaces.Global,
]

export const useLocaleStore = defineStore('app-locale', () => {
  const primaryLang = ref(0)
  const secondaryLang = ref(0)
  const i18nMessageLoaded = ref(false)
  const i18n = computed(() => I18nStore.i18n)
  const i18nLoadedLocaleNamespaces = reactive(new Set<LocaleNamespaces>())
  const loadingLocalePromises = new Map<LocaleNamespaces, Promise<void>>()

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
    const lang = window.navigator.language.toLowerCase()
    const list: Record<string, number> = {
      'zh-tw': 1,
      'zh-hk': 1,
      'ja': 2,
      'zh-cn': 3,
    }
    primaryLang.value = list[lang] ?? 0
  }

  const initLocale = () => {
    if (LocalStorageService.isAvailable()) {
      // default
      const primaryLocaleResult = LocalStorageService.getItem(APP_STORAGE_KEYS.PRIMARY_LOCALE)
      if (!primaryLocaleResult.success || !primaryLocaleResult.value) {
        LocalStorageService.setItem(APP_STORAGE_KEYS.PRIMARY_LOCALE, 'auto')
      }
      const fallbackLocaleResult = LocalStorageService.getItem(APP_STORAGE_KEYS.FALLBACK_LOCALE)
      if (!fallbackLocaleResult.success || !fallbackLocaleResult.value) {
        LocalStorageService.setItem(APP_STORAGE_KEYS.FALLBACK_LOCALE, '0')
      }

      const curLangSet = LocalStorageService.getItem(APP_STORAGE_KEYS.PRIMARY_LOCALE)
      const primaryLocaleSetting = curLangSet.success ? (curLangSet.value ?? 'auto') : 'auto'
      if (primaryLocaleSetting === 'auto') {
        autoSetLang()
      } else {
        primaryLang.value = toInt(primaryLocaleSetting) ?? 0
      }

      const fallbackLocaleSetting = LocalStorageService.getItem(APP_STORAGE_KEYS.FALLBACK_LOCALE)
      secondaryLang.value =
        toInt(fallbackLocaleSetting.success ? fallbackLocaleSetting.value : null) ?? 0
    } else {
      autoSetLang()
    }
  }

  type LoadLocaleMessages<Namespace extends LocaleNamespaces = LocaleNamespaces> = (
    namespaces: Namespace | Namespace[]
  ) => Promise<void>
  const loadLocaleMessages: LoadLocaleMessages = async namespaces => {
    const namespaceList = typeof namespaces === 'string' ? [namespaces] : namespaces
    if (!i18n.value) {
      console.warn('[Init language data] instance is no found')
      return
    }

    const loadData = async (locale: string) => {
      const data = {} as Record<string, object>
      const promises = namespaceList.map(async namespace => {
        let count = 0
        let resultData!: object
        let lastError: unknown
        const retry = async () => {
          try {
            const dataModule = await import(`../../../locales/${locale}/${namespace}.yaml`)
            resultData = dataModule.default ?? {}
          } catch (err) {
            count += 1
            lastError = err
          }
        }
        while (count < 3 && !resultData) {
          await retry()
        }
        if (!resultData) {
          throw lastError
        }
        data[namespace] = resultData
      })
      await Promise.all(promises)

      return data
    }
    const messages = await loadData(primaryLocale.value)
    const fallbackMessages = await loadData(fallbackLocale.value)
    i18n.value.mergeLocaleMessage(primaryLocale.value, messages)
    i18n.value.mergeLocaleMessage(fallbackLocale.value, fallbackMessages)

    if (primaryLocale.value !== DEFAULT_LOCALE && fallbackLocale.value !== DEFAULT_LOCALE) {
      const defaultMessages = await loadData(DEFAULT_LOCALE)
      i18n.value.mergeLocaleMessage(DEFAULT_LOCALE, defaultMessages)
    }

    namespaceList.forEach(namespace => i18nLoadedLocaleNamespaces.add(namespace))
  }

  const ensureLocaleLoaded = async (namespaces: LocaleViewNamespaces[]) => {
    const namespaceList = [...new Set(namespaces)].filter(
      namespace => !i18nLoadedLocaleNamespaces.has(namespace)
    )
    await Promise.all(
      namespaceList.map(namespace => {
        const loadingPromise = loadingLocalePromises.get(namespace)
        if (loadingPromise) {
          return loadingPromise
        }

        const promise = loadLocaleMessages(namespace)
        loadingLocalePromises.set(namespace, promise)
        return promise.finally(() => {
          if (loadingLocalePromises.get(namespace) === promise) {
            loadingLocalePromises.delete(namespace)
          }
        })
      })
    )
  }

  const updateLocaleGlobalMessages = async () => {
    if (!i18n.value) {
      console.warn('[Init language data] instance is no found')
      return
    }
    try {
      await loadLocaleMessages(LOCALE_GLOBAL_NAMESPACE_LIST)
    } catch (err) {
      console.error(err)
      const notify = useNotify()
      notify(
        'An unknown error occurred while initializing the locale datas, texts on the page will be displayed abnormally. Please refresh the page later to try to reinitialize.'
      )
    } finally {
      i18nMessageLoaded.value = true
    }
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
    loadLocaleMessages: loadLocaleMessages as LoadLocaleMessages<LocaleViewNamespaces>,
    ensureLocaleLoaded,
    updateLocaleGlobalMessages,
  }
})
