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
  dataVersion: string | null
}

export function getDataVersion(pathId: DataPathIds, data: CsvData): string | null {
  const rawRes = data.at(0)?.at(0) ?? ''
  const res = rawRes.startsWith('v') ? rawRes : null
  if (res !== null) {
    CommonLogger.info(`DataVersion`, `${pathId}:`, res)
  }
  return res
}

export async function DownloadDatas(...paths: PathItem[]): Promise<LocaleCsvDatas[]> {
  const isDataPathId = (value: any): value is DataPathIds => typeof value === 'number'
  const promises = paths.map(async pathItem => {
    if (isDataPathId(pathItem)) {
      pathItem = { path: pathItem }
    }
    const { path: pathId, lang = false } = pathItem
    if (lang) {
      const results = await downloadLocaleCsvDatas(pathId)
      return results
    }
    const baseData = await downloadCsvData(DataPath(pathId))
    return {
      baseData,
      primaryLocaleData: null,
      secondaryLocaleData: null,
      dataVersion: getDataVersion(pathId, baseData),
    }
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
  const primaryLocale = languageStore.primaryLang,
    fallbackLocale = languageStore.secondaryLang

  const resultData: LocaleCsvDatas = {
    baseData: [[]],
    primaryLocaleData: null,
    secondaryLocaleData: null,
    dataVersion: null,
  }

  const baseData = await downloadCsvData(DataPath(pathId))
  resultData.baseData = baseData
  const dataVersion = getDataVersion(pathId, baseData)
  resultData.dataVersion = dataVersion

  if (primaryLocale !== DEFAULT_LANG) {
    const path = DataPathLang(pathId, dataVersion)
    if (path[primaryLocale] !== null) {
      promises.push(
        downloadCsvData(path[primaryLocale]).then(res => (resultData.primaryLocaleData = res))
      )
    }
    if (primaryLocale !== fallbackLocale && path[fallbackLocale] !== null) {
      promises.push(
        downloadCsvData(path[fallbackLocale]).then(res => (resultData.secondaryLocaleData = res))
      )
    }
  }

  await Promise.allSettled(promises)

  return resultData
}

export type { CsvData, LocaleCsvDatas }
