import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

export const useLoadingStore = defineStore('app-loading', () => {
  const active = ref(false);
  const loadingText = ref('Loading...');

  const show = (text = 'Loading...') => {
    active.value = true;
    loadingText.value = text;
  };
  const hide = () => {
    active.value = false;
  };

  return {
    active: readonly(active),
    loadingText: readonly(loadingText),
    show,
    hide,
  };
});
