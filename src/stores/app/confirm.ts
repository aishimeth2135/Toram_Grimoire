import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

interface ConfirmItem {
  message: string;
  icon?: string | { name: string; src: string };
  confirm?: () => void;
  cancel?: () => void;
}

export const useConfirmStore = defineStore('app-confirm', () => {
  const items = ref<ConfirmItem[]>([]);

  const appendItem = (item: ConfirmItem) => {
    items.value.push(item);
  };

  const nextItem = () => {
    items.value.shift();
  };

  return {
    confirmItems: readonly(items),
    appendItem,
    nextItem,
  };
});

export type { ConfirmItem };
