import type { LangCsvData } from '@/stores/app/datas/utils/DownloadDatas'
import { useLanguageStore } from '@/stores/app/language'
import type { LangInjectData } from '@/stores/app/language'

import en from './globalData/en.js'
import ja from './globalData/ja.js'
import zh_cn from './globalData/zh_cn.js'
import zh_tw from './globalData/zh_tw.js'

interface GetLangHandler {
  (id: string, values?: string[]): string;
}

let GetLang: GetLangHandler

function InitLanguageSystem() {
  const languageStore = useLanguageStore()
  languageStore.init({ en, zh_tw, ja, zh_cn })

  GetLang = function(id, values) {
    return languageStore.get(id, values)
  }
}

function InitLanguageData(datas: LangInjectData) {
  const languageStore = useLanguageStore()
  languageStore.injectData(datas)
}

function HandleLanguageData(datas: LangCsvData, mapping: { [key: number]: number }) {
  const langDatas = [datas[1], datas[2]]
  Object.entries(mapping).forEach(([key, value]) => {
    const dataIdx = parseInt(key, 10), langDataIdx = value
    datas[0].forEach((data, idx) => {
      const res = langDatas
        .map(langData => langData && langData[idx] ? langData[idx][langDataIdx] : null)
        .find(field => field !== '' && field !== null && field !== undefined)
      if (res) {
        data[dataIdx] = res
      }
    })
  })
}

export { InitLanguageSystem, GetLang, InitLanguageData, HandleLanguageData }
export type { GetLangHandler }
