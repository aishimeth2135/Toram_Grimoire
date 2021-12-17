import type { App } from 'vue';
import { createI18n } from 'vue-i18n';

import store from '@/store';

export default function(app: App<Element>) {
  store.dispatch('language/initLocale');
  const primaryLocale = store.getters['language/primaryLocale'] as string;
  const secondaryLocale = store.getters['language/secondaryLocale'] as string;
  const i18n = createI18n({
    legacy: false,
    locale: primaryLocale,
    fallbackLocale: secondaryLocale,
  });
  store.commit('language/setI18nInstance', i18n.global);
  app.use(i18n);
}
