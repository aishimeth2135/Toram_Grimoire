// import { InitLanguageData } from "./Language";
import store from '@/store';

import GetLang from '@/shared/services/Language';


export default async function viewInit(...inits: string[]) {
  if (inits.length === 0) {
    store.commit('initialize/skipInit');
    return;
  }
  const initItems = inits
    .map(async id => {
      const loaded = store.getters['datas/checkLoad'](id) as boolean;
      const origin = loaded ? null : ((await store.dispatch('datas/load' + id)) as AsyncGenerator<void, void, void>);
      const promise = loaded ? Promise.resolve() : (origin as AsyncGenerator).next();
      const msg = GetLang('Loading Message/' + id);
      return { id, origin, promise, msg, loaded };
    });

  const resolvedInitItems = await Promise.all(initItems);
  resolvedInitItems.forEach(item => store.commit('initialize/appendInitItems', item));

  await store.dispatch('initialize/startInit');
  resolvedInitItems.forEach(async item => {
    if (!item.loaded) {
      await (item.origin as AsyncGenerator).next();
    }
    store.commit('datas/loadFinished', item.id);
  });
  store.commit('initialize/initBeforeFinished');
}
