import type { App } from 'vue'
import { createI18n } from 'vue-i18n'

import { useLanguageStore } from '@/stores/app/language'

export default function(app: App<Element>) {
  const languageStore = useLanguageStore()
  languageStore.initLocale()
  const primaryLocale = languageStore.primaryLocale
  const fallbackLocale = languageStore.fallbackLocale
  const i18n = createI18n({
    legacy: false,
    locale: primaryLocale,
    fallbackLocale,
  })
  languageStore.setI18nInstance(i18n.global)
  app.use(i18n)
}
