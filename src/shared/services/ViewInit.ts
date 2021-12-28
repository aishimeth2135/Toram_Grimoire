// import { InitLanguageData } from "./Language";
import { nextTick } from 'vue';

import store from '@/store';

export default async function viewInit(...inits: string[]) {
  store.commit('initialize/initState');
  await nextTick();

  if (inits.length === 0) {
    store.commit('initialize/skipInit');
    return;
  }

  const initItems = inits
    .map(async (id) => {
      const loaded = store.getters['datas/checkLoad'](id) as boolean;
      const origin = loaded ? null : ((await store.dispatch('datas/load' + id)) as AsyncGenerator<void, void, void>);
      console.log(`[Init: ${id}] ${loaded ? 'The item is loaded. Skip loading.' : 'Loading...'}`);
      const promise = loaded ? Promise.resolve() : origin!.next();
      const msg = 'app.loading-message.' + id;
      return { id, origin, promise, msg, loaded };
    });

  const resolvedInitItems = await Promise.all(initItems);
  resolvedInitItems.forEach(item => store.commit('initialize/appendInitItems', item));

  await store.dispatch('initialize/startInit');
  await Promise.all(resolvedInitItems.map(async item => {
    if (!item.loaded) {
      await item.origin!.next();
      console.log(`[Init: ${item.id}] Loading finished.`);
    }
    store.commit('datas/loadFinished', item.id);
  }));
  store.commit('initialize/initBeforeFinished');
}
