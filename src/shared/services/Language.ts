import type { LangCsvData } from '@/stores/app/datas/utils/DownloadDatas'

import { toIndex } from '../utils/number'

function HandleLanguageData(datas: LangCsvData, mapping: Record<number, number>): void {
  if (!datas[0]) {
    return
  }
  const langDatas = [datas[1], datas[2]]
  Object.entries(mapping).forEach(([key, value]) => {
    const dataIdx = toIndex(key),
      langDataIdx = value
    datas[0].forEach((data, idx) => {
      const res = langDatas
        .map(langData => (langData && langData[idx] ? langData[idx][langDataIdx] : null))
        .find(field => field !== '' && field !== null && field !== undefined)
      if (res) {
        data[dataIdx] = res
      }
    })
  })
}

export { HandleLanguageData }
