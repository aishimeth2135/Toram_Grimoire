import zh_tw from "./globalData/zh_tw.js";
import en from "./globalData/en.js";
import ja from "./globalData/ja.js";
import zh_cn from "./globalData/zh_cn.js";

import store from "@/store";

function InitLanguageSystem() {
  store.dispatch('language/init', { en, zh_tw, ja, zh_cn });
}

function InitLanguageData(datas) {
  store.commit('language/injectData', datas);
}

/**
 * @param {string} id
 * @param {Array<string|number>} [values]
 * @returns {string}
 */
function GetLang(id, values) {
  return store.getters['language/get'](id, values);
}

function HandleLanguageData(datas, mapping) {
  const langDatas = [datas[1], datas[2]];
  Object.entries(mapping).forEach(([key, value]) => {
    const dataIdx = key, langDataIdx = value;
    datas[0].forEach((p, idx) => {
      const res = langDatas
        .map(a => a && a[idx] ? a[idx][langDataIdx] : null)
        .find(t => t !== '' && t !== null && t !== void 0);
      if (res !== void 0)
        p[dataIdx] = res;
    });
  });
}

export default GetLang;

export { InitLanguageSystem, GetLang, InitLanguageData, HandleLanguageData };