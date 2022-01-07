import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

interface ConfirmItemParam {
  message: string;
  icon?: string | { name: string; src: string };
  confirm?: () => void;
  cancel?: () => void;
}

interface ConfirmItem extends ConfirmItemParam {
  icon: string | { name: string; src: string };
}

export const useConfirmStore = defineStore('app-confirm', () => {
  const items = ref<ConfirmItem[]>([]);

  const appendItem = (item: ConfirmItemParam) => {
    item.icon = item.icon ?? 'ic:round-help-outline';
    items.value.push(item as ConfirmItem);
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

export type { ConfirmItem, ConfirmItemParam };
