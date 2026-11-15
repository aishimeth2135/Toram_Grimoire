import Papa from 'papaparse'

import type { LocaleCsvDatas } from './DownloadDatas'
import { validateSkillLayout } from './SkillDatasetLayout'

export const skillFileKinds = ['skillData', 'skillMainData'] as const
const skillLocales = ['en', 'ja', 'zh-CN'] as const
export const maxSkillManifestBytes = 16 * 1024
const maxCsvBytes = 8 * 1024 * 1024
const stems = { skillData: 'skill-data', skillMainData: 'skill-main-data' }
const baseHeaders = {
  skillData: [
    'v3',
    '技能名稱',
    '預設',
    '主手裝備',
    '副手裝備',
    '身體裝備',
    '分支ID',
    '分支名稱',
    '屬性名稱',
    '屬性值',
    '屬性追加',
  ],
  skillMainData: ['分類', '編號', '前置技能', '技能樹順序'],
}
const legacyHeaders = {
  skillData: [
    ...baseHeaders.skillData,
    '屬性值-英文',
    '屬性值-日文',
    '屬性值-簡中(唯讀)',
    '屬性值-簡中(可編輯)',
    '屬性值-簡中(自動產生)',
  ],
  skillMainData: [...baseHeaders.skillMainData, '名稱-英文', '名稱-日文', '名稱-簡中'],
}
const statsHeader = ['', '遊戲內名稱', '公式', '倍率', '顯示順序', '自訂能力隱藏']
const statsLocaleHeader = [
  '',
  '遊戲內名稱（英文）',
  '公式',
  '遊戲內名稱（日文）',
  '公式',
  '遊戲內名稱（簡中）',
  '公式',
]
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })

type Locale = (typeof skillLocales)[number]
type Kind = (typeof skillFileKinds)[number]
export type SkillCsvFile = {
  file: string
  sha256: string
  byteLength: number
  recordCount: number
}
type FilePair = Record<Kind, SkillCsvFile>
type StatFiles = { statsData: SkillCsvFile; statsLocaleData: SkillCsvFile }
type ManifestMetadata = { format: 'csv'; revision: number; generatedAt: string }
export type SkillManifest = ManifestMetadata &
  (
    | { schemaVersion: 1; csvSchemaVersion: 1; files: FilePair }
    | {
        schemaVersion: 2
        csvSchemaVersion: 2
        files: FilePair & { locales: Record<Locale, FilePair>; stats?: StatFiles }
      }
  )

function positiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

export function statFiles(manifest: SkillManifest) {
  return manifest.schemaVersion === 2 ? manifest.files.stats : undefined
}

export function skillManifestFiles(manifest: SkillManifest) {
  const pairs =
    manifest.schemaVersion === 1
      ? [manifest.files]
      : [manifest.files, ...Object.values(manifest.files.locales)]
  const stats = statFiles(manifest)
  return [
    ...pairs.flatMap(pair => skillFileKinds.map(kind => pair[kind])),
    ...(stats ? [stats.statsData, stats.statsLocaleData] : []),
  ]
}

function object(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid skill manifest object')
  }
  return value as Record<string, unknown>
}

function parseFile(value: unknown, stem: string): SkillCsvFile {
  const { file, sha256, byteLength, recordCount } = object(value)
  if (
    typeof sha256 !== 'string' ||
    !/^[0-9a-f]{64}$/.test(sha256) ||
    file !== `${stem}.${sha256}.csv` ||
    !positiveInt(byteLength) ||
    byteLength > maxCsvBytes ||
    (recordCount !== 0 && !positiveInt(recordCount))
  ) {
    throw new Error('Invalid skill file descriptor')
  }
  return { file, sha256, byteLength, recordCount }
}

function parsePair(value: unknown, suffix = ''): FilePair {
  const { skillData, skillMainData } = object(value)
  return {
    skillData: parseFile(skillData, stems.skillData + suffix),
    skillMainData: parseFile(skillMainData, stems.skillMainData + suffix),
  }
}

export function parseSkillManifest(value: unknown): SkillManifest {
  const { schemaVersion, csvSchemaVersion, format, revision, generatedAt, files } = object(value)
  if (
    (schemaVersion !== 1 && schemaVersion !== 2) ||
    csvSchemaVersion !== schemaVersion ||
    format !== 'csv' ||
    !positiveInt(revision) ||
    typeof generatedAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(generatedAt) ||
    !Number.isFinite(Date.parse(generatedAt)) ||
    new Date(generatedAt).toISOString().slice(0, 19) !== generatedAt.slice(0, 19)
  ) {
    throw new Error('Invalid skill manifest')
  }

  const metadata: ManifestMetadata = { format, revision, generatedAt }
  const base = parsePair(files)
  if (schemaVersion === 1) {
    return { ...metadata, schemaVersion, csvSchemaVersion: 1, files: base }
  }

  const { locales: rawLocales, stats: rawStats } = object(files)
  const translations = object(rawLocales)
  const localizedPair = (locale: Locale) => {
    const pair = parsePair(translations[locale], '-' + locale.toLowerCase())
    if (skillFileKinds.some(kind => pair[kind].recordCount !== base[kind].recordCount)) {
      throw new Error('Skill translation record count differs from its base')
    }
    return pair
  }
  const locales = {
    'en': localizedPair('en'),
    'ja': localizedPair('ja'),
    'zh-CN': localizedPair('zh-CN'),
  }
  let stats: StatFiles | undefined
  if (rawStats !== undefined) {
    const data = object(rawStats)
    const statsData = parseFile(data.statsData, 'stats-data')
    const statsLocaleData = parseFile(data.statsLocaleData, 'stats-locale-data')
    if (!statsData.recordCount || statsData.recordCount !== statsLocaleData.recordCount) {
      throw new Error('Stat translation record count differs from its base')
    }
    stats = { statsData, statsLocaleData }
  }
  return {
    ...metadata,
    schemaVersion,
    csvSchemaVersion: 2,
    files: { ...base, locales, ...(stats ? { stats } : {}) },
  }
}

export function decodeSkillManifest(bytes: ArrayBuffer) {
  if (bytes.byteLength > maxSkillManifestBytes) {
    throw new Error('Skill manifest exceeds its size limit')
  }
  return parseSkillManifest(JSON.parse(decoder.decode(bytes)))
}

export async function parseSkillCsv(
  bytes: ArrayBuffer,
  file: SkillCsvFile,
  header: readonly string[]
): Promise<string[][]> {
  if (bytes.byteLength !== file.byteLength || bytes.byteLength > maxCsvBytes) {
    throw new Error('Skill CSV byte length mismatch')
  }
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join(
    ''
  )
  if (hash !== file.sha256) {
    throw new Error('Skill CSV checksum mismatch')
  }
  const text = decoder.decode(bytes)
  const { data, errors } = Papa.parse<string[]>(text, { delimiter: ',', newline: '\r\n' })
  if (
    text.startsWith('\uFEFF') ||
    errors.length ||
    data.length !== file.recordCount + 1 ||
    data.some(row => row.length !== header.length) ||
    !header.every((cell, index) => data[0][index] === cell)
  ) {
    throw new Error('Invalid skill CSV layout')
  }
  return data
}

function getLocale(value: string) {
  return skillLocales.find(locale => locale === value)
}

export function getSkillDatasetLocales(primaryLocale: string, fallbackLocale: string) {
  const primary = getLocale(primaryLocale)
  const fallback = primary && fallbackLocale !== primary ? getLocale(fallbackLocale) : undefined
  return { primary, fallback }
}

function legacyTranslation(rows: string[][], kind: Kind, locale: Locale) {
  const index = skillLocales.indexOf(locale)
  return rows.map(row => [
    kind === 'skillMainData'
      ? row[4 + index]
      : locale === 'zh-CN'
        ? row[14] || row[13] || row[15]
        : row[11 + index],
  ])
}

type ReadCsv = (file: SkillCsvFile, header: readonly string[]) => Promise<string[][]>
type SelectedLocales = ReturnType<typeof getSkillDatasetLocales>

export async function readStatDataset(
  files: StatFiles,
  { primary, fallback }: SelectedLocales,
  readCsv: ReadCsv
): Promise<LocaleCsvDatas> {
  const [baseData, rows] = await Promise.all([
    readCsv(files.statsData, statsHeader),
    readCsv(files.statsLocaleData, statsLocaleHeader),
  ])
  const ids = new Set<string>()
  for (const [index, [id, caption, , multiplier, order, hidden]] of baseData.slice(1).entries()) {
    if (
      !/^[a-z][a-z0-9_]{0,79}$/i.test(id) ||
      ids.has(id) ||
      rows[index + 1]?.[0] !== id ||
      !caption.trim() ||
      !['1', '無'].includes(multiplier) ||
      !/^-?\d+$/.test(order) ||
      !Number.isSafeInteger(Number(order)) ||
      !['', '1', 'dev'].includes(hidden)
    ) {
      throw new Error('Invalid Stat CSV row')
    }
    ids.add(id)
  }
  const translations = (locale: Locale | undefined) => {
    if (!locale) {
      return null
    }
    const start = 1 + skillLocales.indexOf(locale) * 2
    return rows.map(row => row.slice(start, start + 2))
  }
  return {
    baseData,
    primaryLocaleData: translations(primary),
    fallbackLocaleData: translations(fallback),
    dataVersion: null,
  }
}

export async function readSkillDataset(
  manifest: SkillManifest,
  { primary, fallback }: SelectedLocales,
  readCsv: ReadCsv
): Promise<readonly [LocaleCsvDatas, LocaleCsvDatas]> {
  const read = async (kind: Kind): Promise<LocaleCsvDatas> => {
    const translation = (locale: Locale | undefined) =>
      manifest.schemaVersion === 2 && locale
        ? readCsv(manifest.files.locales[locale][kind], ['譯文'])
        : null
    const [base, primaryRows, fallbackRows] = await Promise.all([
      readCsv(
        manifest.files[kind],
        (manifest.schemaVersion === 2 ? baseHeaders : legacyHeaders)[kind]
      ),
      translation(primary),
      translation(fallback),
    ])
    const localeRows = (rows: string[][] | null, locale: Locale | undefined) =>
      rows?.map(row => row.slice()) ?? (locale ? legacyTranslation(base, kind, locale) : null)

    return {
      baseData: base.map(row => {
        const copy = row.slice(0, baseHeaders[kind].length)
        if (kind === 'skillMainData') {
          copy.push('')
        }
        return copy
      }),
      primaryLocaleData: localeRows(primaryRows, primary),
      fallbackLocaleData: localeRows(fallbackRows, fallback),
      dataVersion: kind === 'skillData' ? 'v3' : null,
    }
  }

  const [skill, layout] = await Promise.all([read('skillData'), read('skillMainData')])
  validateSkillLayout(skill.baseData, layout.baseData)
  return [skill, layout]
}
