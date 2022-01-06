import type { App } from 'vue';

import { GetLang } from '@/shared/services/Language';

import RegisterLang from '@/setup/RegisterLang';

export default function(app: App) {
  app.config.globalProperties.$rootLang = GetLang;

  app.mixin({
    beforeCreate() {
      if (this.$options.RegisterLang) {
        const { lang } = RegisterLang(this.$options.RegisterLang);
        this.$lang = lang;
      }
    },
  });
}
