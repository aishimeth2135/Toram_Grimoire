import { shallowReactive } from 'vue'
import { Composer } from 'vue-i18n'

export const I18nStore: {
  i18n: Composer | null
} = shallowReactive({
  i18n: null,
})
