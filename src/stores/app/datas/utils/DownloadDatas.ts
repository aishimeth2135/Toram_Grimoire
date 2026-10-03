import Papa from 'papaparse'

import { useLocaleStore } from '@/stores/app/locale'

import { DataPathIds, getDataPath, getLocaleDataPaths } from '@/shared/services/DataPath'
import { CommonLogger } from '@/shared/services/Logger'

type CsvData = string[][]

interface LocaleCsvDatas {
  baseData: CsvData
  primaryLocaleData: CsvData | null
  fallbackLocaleData: CsvData | null
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

export async function DownloadDatas(...pathIds: DataPathIds[]): Promise<LocaleCsvDatas[]> {
  const promises = pathIds.map(async pathId => {
    const baseData = await downloadCsvData(getDataPath(pathId))
    return {
      baseData,
      primaryLocaleData: null,
      fallbackLocaleData: null,
      dataVersion: getDataVersion(pathId, baseData),
    } satisfies LocaleCsvDatas
  })
  const result = await Promise.all(promises)
  return result
}

export async function DownloadDatasWithLocale(
  ...pathIds: DataPathIds[]
): Promise<LocaleCsvDatas[]> {
  const promises = pathIds.map(pathId => downloadLocaleCsvDatas(pathId))
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

const DEFAULT_LOCALE_INDEX = 1
async function downloadLocaleCsvDatas(pathId: DataPathIds): Promise<LocaleCsvDatas> {
  const localeStore = useLocaleStore()

  const promises: Promise<CsvData>[] = []
  const primaryIndex = localeStore.primaryLocaleIndex,
    fallbackIndex = localeStore.fallbackLocaleIndex

  const resultData: LocaleCsvDatas = {
    baseData: [[]],
    primaryLocaleData: null,
    fallbackLocaleData: null,
    dataVersion: null,
  }

  const baseData = await downloadCsvData(getDataPath(pathId))
  resultData.baseData = baseData
  const dataVersion = getDataVersion(pathId, baseData)
  resultData.dataVersion = dataVersion

  if (primaryIndex !== DEFAULT_LOCALE_INDEX) {
    const paths = getLocaleDataPaths(pathId, dataVersion)
    if (paths[primaryIndex] !== null) {
      promises.push(
        downloadCsvData(paths[primaryIndex]).then(res => (resultData.primaryLocaleData = res))
      )
    }
    if (primaryIndex !== fallbackIndex && paths[fallbackIndex] !== null) {
      promises.push(
        downloadCsvData(paths[fallbackIndex]).then(res => (resultData.fallbackLocaleData = res))
      )
    }
  }

  await Promise.allSettled(promises)

  return resultData
}

export type { CsvData, LocaleCsvDatas }
