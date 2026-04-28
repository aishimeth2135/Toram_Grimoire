import Papa from 'papaparse'

import { CommonLogger } from './Logger'

export type CsvData = string[][]

export async function fetchCsvData(path: string): Promise<CsvData> {
  if (!path) return [[]]
  try {
    const res = await fetch(path)
    const csvstr = await res.text()
    return Papa.parse(csvstr).data as CsvData
  } catch (err) {
    CommonLogger.warn('fetchCsvData', `Load "${path}" failed.`)
    CommonLogger.track(err)
    throw err
  }
}
