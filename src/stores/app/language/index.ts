import { defineStore } from 'pinia'
import { computed, readonly, ref, shallowReactive } from 'vue'
import { Composer } from 'vue-i18n'

import CY from '@/shared/utils/Cyteria'
import { APP_STORAGE_KEYS } from '@/shared/consts'

import { useMainStore } from '../main'
import { LocaleGlobalNamespaces, LocaleNamespaces, LocaleViewNamespaces } from './enums'

interface LangData {
  [key: string]: LangData | string;
}

type LangInjectData = Record<string, LangData | (() => LangData)>

export const DEFAULT_LOCALE = 'zh-TW'
const LANG_ORDER = ['en', 'zh_tw', 'ja', 'zh_cn']
const LOCALE_LIST = ['en', 'zh-TW', 'ja', 'zh-CN']
const LOCALE_GLOBAL_NAMESPACE_LIST: LocaleGlobalNamespaces[] = [
  LocaleGlobalNamespaces.App,
  LocaleGlobalNamespaces.Common,
  LocaleGlobalNamespaces.Global,
]

export const I18nStore: {
  i18n: Composer | null;
} = shallowReactive({
  i18n: null,
})

export const useLanguageStore = defineStore('app-language', () => {
  const langData = {} as LangData
  const primaryLang = ref(0)
  const secondaryLang = ref(0)
  const i18nMessageLoaded = ref(false)
  const i18n = computed(() => I18nStore.i18n)

  const primaryLocale = computed(() => {
    return LOCALE_LIST[primaryLang.value]
  })

  const fallbackLocale = computed(() => {
    return LOCALE_LIST[secondaryLang.value]
  })

  // expected return value is string, but it may also be object or array
  const get = (id: string, values?: string[]) => {
    const ids = id.split('/')
    let data = (() => {
      let ptr = 0
      let cur: LangData | string = langData
      while (ptr !== ids.length && typeof cur !== 'string' && cur !== undefined) {
        cur = cur[ids[ptr]]
        ptr += 1
      }
      return cur as string
    })()

    if (data === undefined) {
      console.warn(`[Language] unknown id: "${id}"`)
      return '???'
    }

    if (typeof data === 'string' &&  Array.isArray(values)) {
      data = data.replace(/\$(\d+)/g, (match, p1) => values[p1] !== undefined && values[p1] !== null ? values[p1] : '?')
    }

    return data || '???'
  }

  const injectData = (input: LangInjectData) => {
    const data = {} as Record<string, LangData>
    Object.keys(input).forEach(key => {
      const currentData = input[key]
      data[key] = typeof currentData === 'function' ? currentData() : currentData
    })

    const check = (value: unknown) => typeof value === 'object' && value !== null

    const pri = primaryLang.value,
      sec = secondaryLang.value,
      pData = data[LANG_ORDER[pri]]

    check(pData) && setLangData(langData, pData)
    if (pri !== sec) {
      const sData = data[LANG_ORDER[sec]]
      check(sData) && setLangData(langData, sData)
    }

    LANG_ORDER.forEach((name, idx) => {
      if (idx === pri || idx === sec) {
        return
      }
      const currentData = data[name]
      check(currentData) && setLangData(langData, currentData)
    })
  }

  const setI18nInstance = (i18nInstance: Composer) => {
    I18nStore.i18n = i18nInstance
  }

  const autoSetLang = () => {
    // @ts-ignore
    const lang = (window.navigator.language || window.navigator.userLanguage).toLowerCase()
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

      secondaryLang.value = parseInt(localStorage.getItem(APP_STORAGE_KEYS.FALLBACK_LOCALE)!, 10)
    } else {
      autoSetLang()
    }
  }

  const init = (initData: LangInjectData) => {
    initLocale()

    langData.value = {}
    injectData(initData)
  }

  const mainStore = useMainStore()

  type LoadLocaleMessages<Namespace extends LocaleNamespaces = LocaleNamespaces> = (namespaces: Namespace | Namespace[]) => Promise<void>
  const loadLocaleMessages: LoadLocaleMessages = async (namespaces) => {
    const namespaceList = typeof namespaces === 'string' ? [namespaces] : namespaces
    if (!i18n.value) {
      console.warn('[Init language data] instance is no found')
      return
    }
    const loadData = async (locale: string) => {
      const data = {} as Record<string, object>
      const promises = namespaceList.map(async (filePath) => {
        const dataModule = await import(`../../../locales/${locale}/${filePath}.yaml`)
        data[filePath] = dataModule.default
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
  }

  const updateLocaleGlobalMessages = async () => {
    if (!i18n.value) {
      console.warn('[Init language data] instance is no found')
      return
    }
    await loadLocaleMessages(LOCALE_GLOBAL_NAMESPACE_LIST)

    i18nMessageLoaded.value = true
    mainStore.updateTitle()
  }

  return {
    primaryLang: readonly(primaryLang),
    secondaryLang: readonly(secondaryLang),
    i18n: readonly(i18n),
    i18nMessageLoaded: readonly(i18nMessageLoaded),
    primaryLocale,
    fallbackLocale,
    injectData,

    get,
    setI18nInstance,
    initLocale,
    init,
    loadLocaleMessages: loadLocaleMessages as LoadLocaleMessages<LocaleViewNamespaces>,
    updateLocaleGlobalMessages,
  }
})

function setLangData(target: LangData, obj: LangData) {
  Object.keys(obj).forEach(key => {
    const to = target[key]
    const from = obj[key]
    if (typeof from === 'object' && !Array.isArray(from)) {
      if (to === undefined) {
        target[key] = {}
      }
      setLangData(target[key] as LangData, from)
    } else if (typeof to !== 'string' && !Array.isArray(to)) {
      target[key] = from
    }
  })
}

export type { LangInjectData }
