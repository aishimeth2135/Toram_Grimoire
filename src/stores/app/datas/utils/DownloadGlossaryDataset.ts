import { useLocaleStore } from '@/stores/app/locale'

import { createCdnDataset } from '@/shared/services/CdnDataset'
import { manifestObject, parseCsvFile, positiveInt } from '@/shared/services/CdnDatasetCsv'

import type { LocaleCsvDatas } from './DownloadDatas'

const header = [
  '名稱',
  '外框',
  '文字',
  '名稱（英文）',
  '文字',
  '名稱(日文)',
  '文字',
  '名稱（簡體中文）',
  '文字',
] as const

function parseManifest(value: unknown) {
  const { schemaVersion, csvSchemaVersion, format, revision, generatedAt, files } =
    manifestObject(value)
  if (
    schemaVersion !== 1 ||
    csvSchemaVersion !== 1 ||
    format !== 'csv' ||
    !positiveInt(revision) ||
    typeof generatedAt !== 'string' ||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(generatedAt) ||
    !Number.isFinite(Date.parse(generatedAt))
  ) {
    throw new Error('Invalid glossary manifest')
  }
  return {
    schemaVersion,
    csvSchemaVersion,
    format,
    revision,
    generatedAt,
    files: {
      glossaryTagData: parseCsvFile(manifestObject(files).glossaryTagData, 'glossary-tag-data'),
    },
  }
}

function validateRows(rows: string[][]) {
  const names = new Set<string>()
  let hasSection = false
  for (const [name, kind, , english, , japanese, , simplified] of rows.slice(1)) {
    if (name) {
      if (kind !== 'category' || names.has(name)) {
        throw new Error('Invalid glossary category')
      }
      names.add(name)
      hasSection = false
    } else {
      if (english || japanese || simplified || !names.size) {
        throw new Error('Invalid glossary name')
      }
      if (kind === 'caption' || kind === 'list') {
        hasSection = true
      } else if (kind || !hasSection) {
        throw new Error('Invalid glossary section')
      }
    }
  }
}

const dataset = createCdnDataset({
  origin: import.meta.env.VITE_GLOSSARY_DATA_ORIGIN || 'https://data.cy-grimoire.com',
  path: '/public/glossary/',
  cacheName: 'toram-grimoire-glossary-files',
  indexName: 'toram-grimoire-glossary-datasets',
  parseManifest,
  files: manifest => [manifest.files.glossaryTagData],
  context: () => null,
  contextKey: () => '',
  async load(manifest, _context, readCsv) {
    const rows = await readCsv(manifest.files.glossaryTagData, header)
    validateRows(rows)
    return rows
  },
})

export const glossaryDatasetStatus = dataset.status
export const retryGlossaryDataset = dataset.retry
export const recoverGlossaryDatasetModel = dataset.recover

const localeColumns = [3, null, 5, 7]
const defaultLocale = 1

export async function downloadGlossaryDataset(): Promise<LocaleCsvDatas> {
  const { primaryLocaleIndex, fallbackLocaleIndex } = useLocaleStore()
  const { data, manifest } = await dataset.load()
  function translation(locale: number) {
    const column = localeColumns[locale]
    return column === null || column === undefined
      ? null
      : data.map(row => row.slice(column, column + 2))
  }
  return {
    baseData: data.map(row => row.slice(0, 3)),
    primaryLocaleData:
      primaryLocaleIndex === defaultLocale ? null : translation(primaryLocaleIndex),
    fallbackLocaleData:
      primaryLocaleIndex === defaultLocale || primaryLocaleIndex === fallbackLocaleIndex
        ? null
        : translation(fallbackLocaleIndex),
    dataVersion: String(manifest.revision),
  }
}
