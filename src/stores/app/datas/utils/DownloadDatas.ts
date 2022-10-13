import Papa from 'papaparse'

import { useLanguageStore } from '@/stores/app/language'

import { DataPath, DataPathIds, DataPathLang } from '@/shared/services/DataPath'

type PathItem = DataPathIds | { path: DataPathIds; lang?: boolean }
type CsvData = string[][]
type LangCsvData = [CsvData, CsvData | null, CsvData | null]

export default async function (...paths: PathItem[]): Promise<LangCsvData[]> {
  const isDataPathId = (value: any): value is DataPathIds =>
    typeof value === 'number'
  const promises = paths.map(async pathItem => {
    if (isDataPathId(pathItem)) {
      pathItem = { path: pathItem }
    }
    const { path: pathId, lang = false } = pathItem
    const results: LangCsvData = lang
      ? await loadLangDatas(pathId)
      : [await downloadCsv(DataPath(pathId)), null, null]
    return results
  })
  const result = await Promise.all(promises)

  return result
}

export async function downloadCsv(path: string): Promise<CsvData> {
  if (path) {
    try {
      const res = await fetch(path)
      const csvstr = await res.text()

      return Papa.parse(csvstr).data as CsvData
    } catch (err) {
      console.warn(`[DownloadData] load "${path}" failed. Try to use backup...`)
      console.log(err)
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
      console.warn(
        `[DownloadData] load backup of "${path}" failed. path: ${orignalPath}`
      )
      throw err
    }
  }
  return [[]]
}

const DEFAULT_LANG = 1
async function loadLangDatas(pathId: DataPathIds): Promise<LangCsvData> {
  const languageStore = useLanguageStore()

  const promises: Promise<CsvData>[] = []
  const current = languageStore.primaryLang,
    second = languageStore.secondaryLang
  const datas: (CsvData | null)[] = Array(3)

  promises.push(downloadCsv(DataPath(pathId)))
  if (current !== DEFAULT_LANG) {
    const path = DataPathLang(pathId)
    if (path[current] !== null) {
      promises.push(downloadCsv(path[current] as string))
    }
    if (current !== second && path[second] !== null) {
      promises.push(downloadCsv(path[second] as string))
    }
  }

  const results = await Promise.allSettled(promises)
  results.map((item, idx) => {
    datas[idx] = item.status === 'fulfilled' ? item.value : null
  })
  return datas as LangCsvData
}

export type { CsvData, LangCsvData }
