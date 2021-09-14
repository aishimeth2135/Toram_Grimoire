import store from '@/store';
import type { LangCsvData } from '@/store/app/datas/utils/DownloadDatas';

import en from './globalData/en.js';
import ja from './globalData/ja.js';
import zh_cn from './globalData/zh_cn.js';
import zh_tw from './globalData/zh_tw.js';

type LangData = {
  [key: string]: unknown;
};

function InitLanguageSystem() {
  store.dispatch('language/init', { en, zh_tw, ja, zh_cn });
}

function InitLanguageData(datas: LangData) {
  store.commit('language/injectData', datas);
}

function GetLang(id: string, values?: string[]): string {
  return store.getters['language/get'](id, values);
}

function HandleLanguageData(datas: LangCsvData, mapping: { [key: number]: number }) {
  const langDatas = [datas[1], datas[2]];
  Object.entries(mapping).forEach(([key, value]) => {
    const dataIdx = parseInt(key, 10), langDataIdx = value;
    datas[0].forEach((data, idx) => {
      const res = langDatas
        .map(langData => langData && langData[idx] ? langData[idx][langDataIdx] : null)
        .find(field => field !== '' && field !== null && field !== undefined);
      if (res) {
        data[dataIdx] = res;
      }
    });
  });
}

export default GetLang;

export { InitLanguageSystem, GetLang, InitLanguageData, HandleLanguageData };
