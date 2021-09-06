import zh_tw from './globalData/zh_tw.js';
import en from './globalData/en.js';
import ja from './globalData/ja.js';
import zh_cn from './globalData/zh_cn.js';

import store from '@/store';

function InitLanguageSystem() {
  store.dispatch('language/init', { en, zh_tw, ja, zh_cn });
}

interface LangData {
  [x: string]: unknown,
}
function InitLanguageData(datas: LangData) {
  store.commit('language/injectData', datas);
}

function GetLang(id: string, values?: Array<string>): string {
  return store.getters['language/get'](id, values);
}

function HandleLanguageData(datas: Array<Array<string>>, mapping: { [x: number]: number }) {
  const langDatas = [datas[1], datas[2]];
  Object.entries(mapping).forEach(([key, value]) => {
    const dataIdx = key, langDataIdx = value;
    datas[0].forEach((p, idx) => {
      const res = langDatas
        .map(a => a && a[idx] ? a[idx][langDataIdx] : null)
        .find(t => t !== '' && t !== null && t !== undefined);
      if (res !== undefined)
        p[dataIdx] = res;
    });
  });
}

export default GetLang;

export { InitLanguageSystem, GetLang, InitLanguageData, HandleLanguageData };
