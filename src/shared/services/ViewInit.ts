// import { InitLanguageData } from "./Language";
import { nextTick } from 'vue';

import { useInitializeStore } from '@/stores/app/initialize';
import { useDatasStore } from '@/stores/app/datas';
import { DataStoreIds } from '@/stores/app/datas/enums';

export default async function viewInit(...inits: DataStoreIds[]) {
  const initializeStore = useInitializeStore();
  const datasStore = useDatasStore();

  initializeStore.initState();
  await nextTick();

  if (inits.length === 0) {
    initializeStore.skipInit();
    return;
  }

  const initItems = inits
    .map(async (id) => {
      const loaded = datasStore.checkLoad(id);
      const origin = loaded ? null : datasStore[`init${id}`]();
      console.log(`[Init: ${id}] ${loaded ? 'The item is loaded. Skip loading.' : 'Loading...'}`);
      const promise: Promise<any> = loaded ? Promise.resolve() : origin!.next();
      const msg = 'app.loading-message.' + id;
      return { id, origin, promise, msg, loaded };
    });

  const resolvedInitItems = await Promise.all(initItems);
  resolvedInitItems.forEach(item => initializeStore.appendInitItems(item));

  await initializeStore.startInit();
  await Promise.all(resolvedInitItems.map(async item => {
    if (!item.loaded) {
      await item.origin!.next();
      console.log(`[Init: ${item.id}] Loading finished.`);
    }
    datasStore.loadFinished(item.id);
  }));
  initializeStore.initBeforeFinished();
}
