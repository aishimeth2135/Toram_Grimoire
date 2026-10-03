import type { CsvData, LocaleCsvDatas } from '@/stores/app/datas/utils/DownloadDatas'

import { toIndex } from '../utils/number'

export function getLocaleDataResult(
  datas: LocaleCsvDatas,
  mapping: Record<number, number>
): CsvData {
  const localeCsvDatas = [datas.primaryLocaleData, datas.fallbackLocaleData]
  Object.entries(mapping).forEach(([key, value]) => {
    const baseDataIdx = toIndex(key),
      localeDataIdx = value
    datas.baseData.forEach((data, idx) => {
      const res = localeCsvDatas
        .map(localeCsvData =>
          localeCsvData && localeCsvData[idx] ? localeCsvData[idx][localeDataIdx] : null
        )
        .find(rawData => rawData !== '' && rawData !== null && rawData !== undefined)
      if (res) {
        data[baseDataIdx] = res
      }
    })
  })

  return datas.baseData
}
