import { createCdnDataset } from '@/shared/services/CdnDataset'
import { manifestObject, parseCsvFile, positiveInt } from '@/shared/services/CdnDatasetCsv'

import type { EquipmentTraitCategory } from '@/lib/EquipmentTrait/EquipmentTrait'

const header = ['kind', 'payload'] as const
const uidPattern = /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/
const invalid = () => new Error('Invalid equipment trait dataset')
const locales = ['en', 'ja', 'zh-CN'] as const
export type EquipmentTraitTranslations = Partial<Record<(typeof locales)[number], string>>

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
    throw invalid()
  }
  return {
    schemaVersion,
    csvSchemaVersion,
    format,
    revision,
    generatedAt,
    files: {
      equipmentTraitData: parseCsvFile(
        manifestObject(files).equipmentTraitData,
        'equipment-trait-data'
      ),
    },
  }
}

function parseTranslations(value: unknown): EquipmentTraitTranslations {
  if (value === undefined) {
    return {}
  }
  const input = manifestObject(value)
  const translations: EquipmentTraitTranslations = {}
  for (const locale of locales) {
    const translation = input[locale]
    if (translation === undefined) {
      continue
    }
    if (typeof translation !== 'string') {
      throw invalid()
    }
    translations[locale] = translation
  }
  return translations
}

function parseGroups(value: unknown) {
  if (!Array.isArray(value) || !value.length) {
    throw invalid()
  }
  return value.map(group => {
    const { key, rows } = manifestObject(group)
    if (
      (key !== 'stat' && key !== 'text' && key !== 'stack') ||
      !Array.isArray(rows) ||
      !rows.length
    ) {
      throw invalid()
    }
    return {
      key,
      rows: rows.map(row => {
        const { key: rowKey, value: text, translations } = manifestObject(row)
        if (typeof rowKey !== 'string' || typeof text !== 'string') {
          throw invalid()
        }
        const valid =
          key === 'stat'
            ? /^[^\s%~]+[%~]?$/.test(rowKey)
            : key === 'text'
              ? rowKey === 'caption' || rowKey === 'tips'
              : rowKey === 'max'
        if (!valid) {
          throw invalid()
        }
        return { key: rowKey, value: text, translations: parseTranslations(translations) }
      }),
    }
  })
}

export function parseEquipmentTraitRows(rows: string[][]) {
  const sequence = new Map<EquipmentTraitCategory, number>()
  const identities = new Set<string>()
  return rows.slice(1).map(([kind, json]) => {
    const { category, uid, id, number, name, maxLevel, translations, groups } = manifestObject(
      JSON.parse(json)
    )
    if (
      kind !== 'item' ||
      (category !== 'stat' && category !== 'special') ||
      !positiveInt(number) ||
      number !== (sequence.get(category) ?? 0) + 1 ||
      id !== category + number ||
      typeof uid !== 'string' ||
      !uidPattern.test(uid) ||
      identities.has(uid) ||
      typeof name !== 'string' ||
      !name.trim() ||
      !positiveInt(maxLevel)
    ) {
      throw invalid()
    }
    sequence.set(category, number)
    identities.add(uid)
    return {
      category,
      number,
      id,
      uid,
      name,
      maxLevel,
      translations: parseTranslations(translations),
      groups: parseGroups(groups),
    } as const
  })
}

const dataset = createCdnDataset({
  origin: import.meta.env.VITE_EQUIPMENT_TRAIT_DATA_ORIGIN,
  path: '/public/equipment-trait/',
  cacheName: 'toram-grimoire-equipment-trait-files',
  indexName: 'toram-grimoire-equipment-trait-datasets',
  parseManifest,
  files: manifest => [manifest.files.equipmentTraitData],
  context: () => null,
  contextKey: () => '',
  async load(manifest, _context, readCsv) {
    return parseEquipmentTraitRows(await readCsv(manifest.files.equipmentTraitData, header))
  },
})

export type EquipmentTraitDatasetItem = ReturnType<typeof parseEquipmentTraitRows>[number]
export const downloadEquipmentTraitDataset = async () => (await dataset.load()).data
export const recoverEquipmentTraitDataset = dataset.recover
