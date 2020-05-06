import {InitLanguageData} from "./LanguageSystem.js";

import loadingStore from "@store/loading.js";

function viewInit({
  languageDatas = null,
  initItems = null
}={}){
  if ( languageDatas )
      InitLanguageData(languageDatas);

  /**
   * initItems: Array<Object>
   * <Object> {
   *     msg: String,
   *     promise: Promise,
   * }
   */
  if ( initItems ){
    initItems.forEach(p => {
      if ( typeof p.msg == 'function' )
          p.msg = p.msg();
    });
    initItems.forEach(p => loadingStore.commit('appendInitItems', p));
  }
  return loadingStore.dispatch('startInit');
}

function viewInitReady(){
  loadingStore.commit('initFinished');
}

function viewInitEnd(){

}

function handleInit(_startCallback){
  _startCallback().catch(e => console.log(e));
}

export {viewInit, viewInitReady, viewInitEnd, handleInit};