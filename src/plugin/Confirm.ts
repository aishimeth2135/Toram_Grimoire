import type { App } from 'vue';

import { useConfirmStore } from '@/stores/app/confirm';
import type { ConfirmItem } from '@/stores/app/confirm';

export default function(app: App) {
  const confirmStore = useConfirmStore();
  const confirm = (item: string | ConfirmItem) => {
    const realItem: ConfirmItem = typeof item === 'string' ? {
      message: item,
    } : item;

    const emptyFun = () => {};
    const oldConfirm = realItem.confirm || emptyFun;
    const oldCancel = realItem.cancel || emptyFun;
    return new Promise((resolve) => {
      const resItem = {
        message: realItem.message,
        icon: realItem.icon,
        confirm: () => {
          oldConfirm();
          resolve(true);
        },
        cancel: () => {
          oldCancel();
          resolve(false);
        },
      };
      confirmStore.appendItem(resItem);
    });
  };
  app.config.globalProperties.$confirm = confirm;
}
