import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import Papa from 'papaparse'

export type CsvData = string[][]

const __dirname = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(__dirname, '..')
export const DATA_DIR = resolve(ROOT, 'data')
export const OUT_DIR = resolve(ROOT, 'src', 'data')

export function readCsv(filename: string): CsvData {
  const path = resolve(DATA_DIR, filename)
  if (!existsSync(path)) {
    console.warn(`  [warn] ${filename} not found, skipping`)
    return []
  }
  const content = readFileSync(path, 'utf-8')
  return Papa.parse(content).data as CsvData
}

export function writeJson(filename: string, data: unknown): void {
  const path = resolve(OUT_DIR, filename)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8')
  const kb = (JSON.stringify(data).length / 1024).toFixed(1)
  console.log(`  wrote ${filename} (${kb} KB)`)
}
