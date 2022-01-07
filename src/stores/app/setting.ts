import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { APP_STORAGE_KEYS } from '@/shared/consts';

export const useSettingStore = defineStore('app-setting', () => {
  const appFont = ref(parseInt(window.localStorage.getItem(APP_STORAGE_KEYS.FONT_FAMILY) ?? '1', 10));
  const appRem = ref(parseInt(window.localStorage.getItem(APP_STORAGE_KEYS.ROOT_ELEMENT_FONT_SIZE) ?? '160', 10));
  const appNightMode = ref(window.localStorage.getItem(APP_STORAGE_KEYS.NIGHT_MODE) === '1');

  const initDocumentElementClassList = () => {
    const rel = document.documentElement;
    rel.classList.add('font-' + appFont.value.toString());
    rel.style.fontSize = (appRem.value / 10).toString() + 'px';
    rel.classList.toggle('theme--night-mode', appNightMode.value);
  };

  return {
    initDocumentElementClassList,

    appFont: computed<number>({
      set(value) {
        if (appFont.value !== 0) {
          document.documentElement.classList.remove('font-' + appFont.value.toString());
        }
        appFont.value = value;
        if (value !== 0) {
          document.documentElement.classList.add('font-' + value.toString());
        }
        window.localStorage.setItem(APP_STORAGE_KEYS.FONT_FAMILY, value.toString());
      },
      get() {
        return appFont.value;
      },
    }),
    appRem: computed<number>({
      set(value) {
        appRem.value = value;
        document.documentElement.style.fontSize = (value / 10).toString() + 'px';
        window.localStorage.setItem(APP_STORAGE_KEYS.ROOT_ELEMENT_FONT_SIZE, value.toString());
      },
      get() {
        return appRem.value;
      },
    }),
    appNightMode: computed<boolean>({
      set(value) {
        appNightMode.value = value;
        document.documentElement.classList.toggle('theme--night-mode', value);
        window.localStorage.setItem(APP_STORAGE_KEYS.NIGHT_MODE, value ? '1' : '0');
      },
      get() {
        return appNightMode.value;
      },
    }),
  };
});
