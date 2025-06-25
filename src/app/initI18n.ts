import type { App } from 'vue'
import { createI18n } from 'vue-i18n'

import { DEFAULT_LOCALE, useLanguageStore } from '@/stores/app/language'

export default function (app: App<Element>) {
  const languageStore = useLanguageStore()
  languageStore.initLocale()
  const primaryLocale = languageStore.primaryLocale
  const fallbackLocales = [languageStore.fallbackLocale]
  if (primaryLocale !== DEFAULT_LOCALE && fallbackLocales[0] !== DEFAULT_LOCALE) {
    fallbackLocales.push(DEFAULT_LOCALE)
  }
  const i18n = createI18n({
    legacy: false,
    locale: primaryLocale,
    fallbackLocale: fallbackLocales,
  })
  languageStore.setI18nInstance(i18n.global)
  app.use(i18n)
}
