import { useLocaleStore } from '@/stores/app/locale'

import { AppStorageService } from '@/shared/services/AppStorageService'
import { createCdnDataset } from '@/shared/services/CdnDataset'
import { manifestObject, parseCsvFile, positiveInt } from '@/shared/services/CdnDatasetCsv'

import type { LocaleCsvDatas } from './DownloadDatas'

const baseHeader = [
  '',
  '裝備部位',
  '基礎ATK/DEF',
  '基礎穩定度',
  '屬性分類',
  '屬性名稱',
  '屬性值1',
  '屬性值2',
  '說明',
] as const
const localeHeader = ['equipment_name', 'attr_value1'] as const
const locales = ['en', 'ja', 'zh-CN'] as const
type Locale = (typeof locales)[number]
const invalid = () => new Error('Invalid equipment dataset')
const unsigned = (value: string) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value))
const statValue = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?[%~]?$/i
const supportedFields: Record<string, readonly string[]> = {
  recipe: ['item_level', 'item_difficulty', 'cost', 'potential', 'materials'],
  obtain: ['type', 'name', 'map', 'dye', 'npc'],
  extra: ['caption'],
}

function parseManifest(value: unknown) {
  const { schemaVersion, csvSchemaVersion, revision, format, generatedAt, files } =
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
    throw invalid()
  }
  const descriptors = manifestObject(files)
  const equipmentData = parseCsvFile(descriptors.equipmentData, 'equipment-data')
  const translations = manifestObject(descriptors.locales)
  const localized = {
    'en': parseCsvFile(translations.en, 'equipment-locale-en'),
    'ja': parseCsvFile(translations.ja, 'equipment-locale-ja'),
    'zh-CN': parseCsvFile(translations['zh-CN'], 'equipment-locale-zh-CN'),
  }
  if (locales.some(locale => localized[locale].recordCount !== equipmentData.recordCount)) {
    throw invalid()
  }
  return {
    schemaVersion,
    csvSchemaVersion,
    revision,
    format,
    generatedAt,
    files: { equipmentData, locales: localized },
  }
}

function materials(value: string, translated = false) {
  return value.split(',').map(part => {
    const [name, quantity, ...rest] = part.split('#')
    if (rest.length || !unsigned(quantity ?? '') || (!translated && !name)) {
      throw invalid()
    }
    return { name, quantity }
  })
}

export function parseEquipmentRows(base: string[][], translations: Record<Locale, string[][]>) {
  let hasItem = false
  let group = ''
  let groups = new Set<string>()
  let keys = new Set<string>()
  if (locales.some(locale => translations[locale].length !== base.length)) {
    throw invalid()
  }

  return base.slice(1).map((row, index) => {
    const [name, category, amount, stability, groupStart, key, value, extra, caption] = row
    const start = Boolean(name && category)
    if (start) {
      if (
        !name.trim() ||
        !category.trim() ||
        !unsigned(amount) ||
        !unsigned(stability) ||
        Number(stability) > 100
      ) {
        throw invalid()
      }
      hasItem = true
      group = ''
      groups = new Set()
    } else if (!hasItem || name || category || amount || stability) {
      throw invalid()
    }
    if (caption) {
      throw invalid()
    }
    if (groupStart) {
      if (groupStart !== 'stats' && !Object.hasOwn(supportedFields, groupStart)) {
        throw invalid()
      }
      if (groupStart !== 'obtain' && groups.has(groupStart)) {
        throw invalid()
      }
      groups.add(groupStart)
      group = groupStart
      keys = new Set()
    }
    if (!key) {
      if (!start || groupStart || value || extra) {
        throw invalid()
      }
    } else if (group === 'stats') {
      const numeric = value.replace(/[%~]$/, '')
      if (!/^[^\s%~]+$/.test(key) || !statValue.test(value) || !Number.isFinite(Number(numeric))) {
        throw invalid()
      }
    } else {
      if (extra || !supportedFields[group]?.includes(key) || keys.has(key)) {
        throw invalid()
      }
      keys.add(key)
      if (group === 'recipe' && key !== 'materials' && !unsigned(value)) {
        throw invalid()
      }
      if (group === 'extra' && !value.trim()) {
        throw invalid()
      }
    }
    const isMaterials = group === 'recipe' && key === 'materials'
    const baseMaterials = isMaterials ? materials(value) : null
    const canTranslateValue =
      isMaterials || (group === 'obtain' && (key === 'name' || key === 'map'))
    const translated = {} as Record<
      Locale,
      { name: string; value: string; materials: ReturnType<typeof materials> | null }
    >
    for (const locale of locales) {
      const [nameText, valueText] = translations[locale][index + 1]
      if ((nameText && !start) || (valueText && !canTranslateValue)) {
        throw invalid()
      }
      const recipe = baseMaterials && valueText ? materials(valueText, true) : null
      if (
        recipe &&
        baseMaterials &&
        (recipe.length !== baseMaterials.length ||
          recipe.some((part, idx) => part.quantity !== baseMaterials[idx].quantity))
      ) {
        throw invalid()
      }
      translated[locale] = { name: nameText, value: valueText, materials: recipe }
    }
    return { row, translated, baseMaterials }
  })
}

type Rows = ReturnType<typeof parseEquipmentRows>
type AppLocale = (typeof AppStorageService.LOCALE_LIST)[number]
export function localizeEquipmentRows(rows: Rows, primary: AppLocale, fallback: AppLocale) {
  const selected =
    primary === 'zh-TW'
      ? []
      : fallback === 'zh-TW' || fallback === primary
        ? [primary]
        : [primary, fallback]
  return [
    Array.from(baseHeader),
    ...rows.map(({ row, translated, baseMaterials }) => {
      const output = [...row]
      const find = (pick: (item: (typeof translated)[Locale]) => string | undefined) =>
        selected.map(locale => pick(translated[locale])).find(value => value?.trim())
      output[0] = find(item => item.name) ?? row[0]
      output[6] = baseMaterials
        ? baseMaterials
            .map(
              ({ name, quantity }, index) =>
                (find(item => item.materials?.[index]?.name) ?? name) + '#' + quantity
            )
            .join(',')
        : (find(item => item.value) ?? row[6])
      return output
    }),
  ]
}

const dataset = createCdnDataset({
  origin: import.meta.env.VITE_EQUIPMENT_DATA_ORIGIN,
  path: '/public/equipment/',
  cacheName: 'toram-grimoire-equipment-files',
  indexName: 'toram-grimoire-equipment-datasets',
  parseManifest,
  files: ({ files }) => [files.equipmentData, ...locales.map(locale => files.locales[locale])],
  context: () => null,
  contextKey: () => '',
  async load({ files }, _context, readCsv) {
    const [base, en, ja, zhCn] = await Promise.all([
      readCsv(files.equipmentData, baseHeader),
      readCsv(files.locales.en, localeHeader),
      readCsv(files.locales.ja, localeHeader),
      readCsv(files.locales['zh-CN'], localeHeader),
    ])
    return parseEquipmentRows(base, { en, ja, 'zh-CN': zhCn })
  },
})

export const recoverEquipmentDataset = dataset.recover

export async function downloadEquipmentDataset(): Promise<LocaleCsvDatas> {
  const { primaryLocaleIndex, fallbackLocaleIndex } = useLocaleStore()
  const { data, manifest } = await dataset.load()
  return {
    baseData: localizeEquipmentRows(
      data,
      AppStorageService.LOCALE_LIST[primaryLocaleIndex],
      AppStorageService.LOCALE_LIST[fallbackLocaleIndex]
    ),
    primaryLocaleData: null,
    fallbackLocaleData: null,
    dataVersion: String(manifest.revision),
  }
}
