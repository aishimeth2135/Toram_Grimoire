// import { InitLanguageData } from "./LanguageSystem.js";
import GetLang from "@global-modules/LanguageSystem.js";

import loadingStore from "@store/loading.js";
import mainStore from "@store/main";

export default async function viewInit(...inits) {
  /**
   * initItems: Array<Object>
   * <Object> {
   *     msg: String,
   *     promise: Promise,
   * }
   */
  const initItems = inits
    .map(async id => {
      const loaded = mainStore.getters['datas/checkLoad'](id);
      const origin = loaded ? null : await mainStore.dispatch('datas/load' + id);
      const promise = loaded ? Promise.resolve() : origin.next();
      const msg = GetLang('Loading Message/' + id);
      return { id, origin, promise, msg, loaded };
    });
  for (let i=0; i<initItems.length; ++i)
    initItems[i] = await initItems[i];
  initItems.forEach(p => loadingStore.commit('appendInitItems', p));

  await loadingStore.dispatch('startInit');
  initItems.forEach(async p => {
    !p.loaded && await p.origin.next();
    mainStore.commit('datas/loadFinished', p.id);
  });
  loadingStore.commit('initBeforeFinished');
}
