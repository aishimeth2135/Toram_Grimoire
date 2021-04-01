import { InitLanguageData } from "./LanguageSystem.js";

import loadingStore from "@store/loading.js";

function viewInit({
  languageDatas = null,
  initItems = null
} = {}) {
  if (languageDatas)
    InitLanguageData(languageDatas);

  /**
   * initItems: Array<Object>
   * <Object> {
   *     msg: String,
   *     promise: Promise,
   * }
   */
  if (initItems) {
    initItems.forEach(p => {
      if (typeof p.msg == 'function')
        p.msg = p.msg();
    });
    initItems.forEach(p => loadingStore.commit('appendInitItems', p));
  }
  return loadingStore.dispatch('startInit');
}

function viewInitReady() {
  loadingStore.commit('initBeforeFinished');
}

function viewInitEnd() {

}

async function handleInit(_startCallback) {
  await _startCallback();
}

export { viewInit, viewInitReady, viewInitEnd, handleInit };