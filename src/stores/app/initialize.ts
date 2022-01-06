import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

type InitializeStatus = 0 | 1 | 2 | 3;
type InitItemStatus = 0 | 1 | -1;

interface InitItem {
  msg: string;
  promise: Promise<void>;
  status: InitItemStatus;
}

export const useInitializeStore = defineStore('app-initialize', () => {
  const initItems = ref<InitItem[]>([]);
  const status = ref<InitializeStatus>(0);

  const appendInitItems = ({ msg, promise }: { msg: string; promise: Promise<any> }) => {
    initItems.value.push({
      msg,
      promise,
      status: 0, // 0: loading, 1: success,  -1: error
    });
  };

  const initState = () => {
    status.value = 0;
    initItems.value = [];
  };

  const initSucceed = () => {
    status.value = 1;
  };

  const initBeforeFinished = () => {
    if (status.value !== 1) {
      throw new Error(`[ViewInit] Unknow error. The status should be 1 instead of ${status.value}`);
    }
    status.value = 2;
  };

  const initFinished = () => {
    if (status.value !== 2) {
      throw new Error(`[ViewInit] Unknow error. The status should be 2 instead of ${status.value}`);
    }
    status.value = 3;
    initItems.value = [];
  };

  const skipInit = () => {
    status.value = 3;
  };

  const startInit = async () => {
    await Promise.all(
      initItems.value.map(async (item) => {
        try {
          await item.promise;
          item.status = 1;
        } catch (err) {
          console.error(err);
          item.status = -1;
        }
      }),
    );
    if (initItems.value.every(item => item.status !== -1)) {
      initSucceed();
    }
  };

  return {
    initItems: readonly(initItems),
    status: readonly(status),

    appendInitItems,
    initState,
    initBeforeFinished,
    initFinished,
    skipInit,
    startInit,
  };
});
