import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

export const useLoadingStore = defineStore('app-loading', () => {
  const active = ref(false);

  const show = () => {
    active.value = true;
  };
  const hide = () => {
    active.value = false;
  };

  return {
    active: readonly(active),
    show,
    hide,
  };
});
