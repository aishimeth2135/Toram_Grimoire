// import { InitLanguageData } from "./Language";
import GetLang from "@services/Language";

import store from "@/store";

/**
 * @param  {...String} inits
 */
export default async function viewInit(...inits) {
  if (inits.length === 0) {
    store.commit('initialize/skipInit');
    return;
  }
  const initItems = inits
    .map(async id => {
      const loaded = store.getters['datas/checkLoad'](id);
      const origin = loaded ? null : await store.dispatch('datas/load' + id);
      const promise = loaded ? Promise.resolve() : origin.next();
      const msg = GetLang('Loading Message/' + id);
      return { id, origin, promise, msg, loaded };
    });
  for (let i=0; i<initItems.length; ++i)
    initItems[i] = await initItems[i];
  initItems.forEach(p => store.commit('initialize/appendInitItems', p));

  await store.dispatch('initialize/startInit');
  initItems.forEach(async p => {
    !p.loaded && await p.origin.next();
    store.commit('datas/loadFinished', p.id);
  });
  store.commit('initialize/initBeforeFinished');
}
