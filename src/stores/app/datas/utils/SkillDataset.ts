import {
  type CdnCsvFile,
  type ReadCdnCsv,
  decodeDatasetManifest,
  manifestObject,
  parseCsvFile,
  positiveInt,
} from '@/shared/services/CdnDatasetCsv'

import type { LocaleCsvDatas } from './DownloadDatas'
import { validateSkillLayout } from './SkillDatasetLayout'

export { parseCdnCsv as parseSkillCsv } from '@/shared/services/CdnDatasetCsv'

export const skillFileKinds = ['skillData', 'skillMainData'] as const
const skillLocales = ['en', 'ja', 'zh-CN'] as const
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

type Locale = (typeof skillLocales)[number]
type Kind = (typeof skillFileKinds)[number]
type FilePair = Record<Kind, CdnCsvFile>
type StatFiles = { statsData: CdnCsvFile; statsLocaleData: CdnCsvFile }
export type SkillManifest = {
  schemaVersion: 2
  csvSchemaVersion: 2
  format: 'csv'
  revision: number
  generatedAt: string
  files: FilePair & { locales: Record<Locale, FilePair>; stats: StatFiles }
}

export function skillManifestFiles({ files }: SkillManifest) {
  return [
    ...[files, ...Object.values(files.locales)].flatMap(pair =>
      skillFileKinds.map(kind => pair[kind])
    ),
    files.stats.statsData,
    files.stats.statsLocaleData,
  ]
}

function parsePair(value: unknown, suffix = ''): FilePair {
  const { skillData, skillMainData } = manifestObject(value)
  return {
    skillData: parseCsvFile(skillData, stems.skillData + suffix),
    skillMainData: parseCsvFile(skillMainData, stems.skillMainData + suffix),
  }
}

export function parseSkillManifest(value: unknown): SkillManifest {
  const { schemaVersion, csvSchemaVersion, format, revision, generatedAt, files } =
    manifestObject(value)
  if (
    schemaVersion !== 2 ||
    csvSchemaVersion !== 2 ||
    format !== 'csv' ||
    !positiveInt(revision) ||
    typeof generatedAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(generatedAt) ||
    !Number.isFinite(Date.parse(generatedAt)) ||
    new Date(generatedAt).toISOString().slice(0, 19) !== generatedAt.slice(0, 19)
  ) {
    throw new Error('Invalid skill manifest')
  }

  const base = parsePair(files)
  const { locales: rawLocales, stats: rawStats } = manifestObject(files)
  const translations = manifestObject(rawLocales)
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
  const stats = manifestObject(rawStats)
  const statsData = parseCsvFile(stats.statsData, 'stats-data')
  const statsLocaleData = parseCsvFile(stats.statsLocaleData, 'stats-locale-data')
  if (!statsData.recordCount || statsData.recordCount !== statsLocaleData.recordCount) {
    throw new Error('Stat translation record count differs from its base')
  }
  return {
    schemaVersion,
    csvSchemaVersion,
    format,
    revision,
    generatedAt,
    files: { ...base, locales, stats: { statsData, statsLocaleData } },
  }
}

export function decodeSkillManifest(bytes: ArrayBuffer) {
  return parseSkillManifest(decodeDatasetManifest(bytes))
}

function getLocale(value: string) {
  return skillLocales.find(locale => locale === value)
}

export function getSkillDatasetLocales(primaryLocale: string, fallbackLocale: string) {
  const primary = getLocale(primaryLocale)
  const fallback = primary && fallbackLocale !== primary ? getLocale(fallbackLocale) : undefined
  return { primary, fallback }
}

type SelectedLocales = ReturnType<typeof getSkillDatasetLocales>

export async function readStatDataset(
  files: StatFiles,
  { primary, fallback }: SelectedLocales,
  readCsv: ReadCdnCsv
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
  readCsv: ReadCdnCsv
): Promise<readonly [LocaleCsvDatas, LocaleCsvDatas]> {
  const read = async (kind: Kind): Promise<LocaleCsvDatas> => {
    const translation = (locale: Locale | undefined) =>
      locale ? readCsv(manifest.files.locales[locale][kind], ['譯文']) : null
    const [base, primaryRows, fallbackRows] = await Promise.all([
      readCsv(manifest.files[kind], baseHeaders[kind]),
      translation(primary),
      translation(fallback),
    ])
    return {
      baseData: base.map(row => {
        return kind === 'skillMainData' ? [...row, ''] : row
      }),
      primaryLocaleData: primaryRows,
      fallbackLocaleData: fallbackRows,
      dataVersion: kind === 'skillData' ? 'v3' : null,
    }
  }

  const [skill, layout] = await Promise.all([read('skillData'), read('skillMainData')])
  validateSkillLayout(skill.baseData, layout.baseData)
  return [skill, layout]
}
