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
  const initItems = inits.map(async p => {
    const origin = await mainStore.dispatch('datas/load' + p);
    const promise = origin.next();
    const msg = GetLang('Loading Message/' + p);
    return { origin, promise, msg };
  })
  for (let i=0; i<initItems.length; ++i)
    initItems[i] = await initItems[i];
  initItems.forEach(p => loadingStore.commit('appendInitItems', p));

  await loadingStore.dispatch('startInit');
  initItems.forEach(async p => await p.origin.next());
  loadingStore.commit('initBeforeFinished');
}
