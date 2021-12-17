import { useStore } from 'vuex';
import type { Store } from 'vuex';
import { useI18n } from 'vue-i18n';
import type { Composer } from 'vue-i18n';

export default function Locale(store: Store<any> = useStore(), i18n: Composer = useI18n()) {
  const { setLocaleMessage } = i18n;
  const updateLocalMessages = async () => {
    const locale = store.getters['language/primaryLocale'] as string;
    const messages = await import(
      /* webpackChunkName: "locale-[request]" */ `@/locales/${locale}/index.ts`
    );
    setLocaleMessage(locale, messages.default);
  };
  return {
    updateLocalMessages,
  };
}
