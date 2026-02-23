import Papa from 'papaparse'

import { useLocaleStore } from '@/stores/app/locale'

import { DataPath, DataPathIds, DataPathLang } from '@/shared/services/DataPath'
import { CommonLogger } from '@/shared/services/Logger'

type PathItem = DataPathIds | { path: DataPathIds; lang?: boolean }
type CsvData = string[][]

interface LocaleCsvDatas {
  baseData: CsvData
  primaryLocaleData: CsvData | null
  secondaryLocaleData: CsvData | null
}

export async function DownloadDatas(...paths: PathItem[]): Promise<LocaleCsvDatas[]> {
  const isDataPathId = (value: any): value is DataPathIds => typeof value === 'number'
  const promises = paths.map(async pathItem => {
    if (isDataPathId(pathItem)) {
      pathItem = { path: pathItem }
    }
    const { path: pathId, lang = false } = pathItem
    const results: LocaleCsvDatas = lang
      ? await downloadLocaleCsvDatas(pathId)
      : {
          baseData: await downloadCsvData(DataPath(pathId)),
          primaryLocaleData: null,
          secondaryLocaleData: null,
        }
    return results
  })
  const result = await Promise.all(promises)

  return result
}

export async function downloadCsvData(path: string): Promise<CsvData> {
  if (path) {
    try {
      const res = await fetch(path)
      const csvstr = await res.text()

      return Papa.parse(csvstr).data as CsvData
    } catch (err) {
      CommonLogger.warn('downloadCsvData', `Load "${path}" failed. Try to use backup...`)
      CommonLogger.track(err)
    }

    const orignalPath = path
    try {
      path = encodeURIComponent(path)
      path =
        'https://script.google.com/macros/s/AKfycbxGeeJVBuTL23gNtaC489L_rr8GoKfaQHONtl2HQuX0B1lCGbEo/exec?url=' +
        path

      const res = await fetch(path)
      const csvstr = await res.text()

      return Papa.parse(csvstr).data as CsvData
    } catch (err) {
      CommonLogger.warn('downloadCsvData', `Load backup of "${path}" failed. path: ${orignalPath}`)
      CommonLogger.track(err)
      throw err
    }
  }
  return [[]]
}

const DEFAULT_LANG = 1
async function downloadLocaleCsvDatas(pathId: DataPathIds): Promise<LocaleCsvDatas> {
  const languageStore = useLocaleStore()

  const promises: Promise<CsvData>[] = []
  const current = languageStore.primaryLang,
    second = languageStore.secondaryLang
  const dataList: (CsvData | null)[] = Array(3)

  promises.push(downloadCsvData(DataPath(pathId)))
  if (current !== DEFAULT_LANG) {
    const path = DataPathLang(pathId)
    if (path[current] !== null) {
      promises.push(downloadCsvData(path[current] as string))
    }
    if (current !== second && path[second] !== null) {
      promises.push(downloadCsvData(path[second] as string))
    }
  }

  const results = await Promise.allSettled(promises)
  results.map((item, idx) => {
    dataList[idx] = item.status === 'fulfilled' ? item.value : null
  })

  return {
    baseData: dataList[0] ?? [[]],
    primaryLocaleData: dataList[1],
    secondaryLocaleData: dataList[2],
  } satisfies LocaleCsvDatas
}

export type { CsvData, LocaleCsvDatas }
