import { createCdnDataset } from '@/shared/services/CdnDataset'
import { manifestObject, parseCsvFile, positiveInt } from '@/shared/services/CdnDatasetCsv'

import type { RegistletCategoryIds } from '@/lib/Registlet/RegistletItem'

const header = ['kind', 'payload'] as const
const idPattern = /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/
const prefixPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const invalid = () => new Error('Invalid registlet dataset')
const isCategory = (value: unknown): value is RegistletCategoryIds =>
  value === 'stat' || value === 'special' || value === 'skill'
const isText = (value: unknown): value is string => typeof value === 'string' && !!value.trim()
const isCount = (value: unknown): value is number => value === 0 || positiveInt(value)

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
    revision,
    generatedAt,
    file: parseCsvFile(manifestObject(files).registletData, 'registlet-data'),
  }
}

function parseGroups(value: unknown) {
  if (!Array.isArray(value) || !value.length) {
    throw invalid()
  }
  const keys = new Set<string>()
  return value.map(group => {
    const { key, rows } = manifestObject(group)
    if (!isText(key) || keys.has(key) || !Array.isArray(rows) || !rows.length) {
      throw invalid()
    }
    keys.add(key)
    return {
      key,
      rows: rows.map(row => {
        const { key: rowKey, value: rowValue } = manifestObject(row)
        if (!isText(rowKey) || !isText(rowValue)) {
          throw invalid()
        }
        return { key: rowKey, value: rowValue }
      }),
    }
  })
}

export function parseRegistletRows(rows: string[][]) {
  const sections = new Map<string, string>()
  const sequence = new Map<string, number>()
  const identities = new Set<string>()
  const items = rows.slice(1).flatMap(([kind, json]) => {
    const payload = manifestObject(JSON.parse(json))
    const { category } = payload
    if (!isCategory(category)) {
      throw invalid()
    }
    if (kind === 'subcategory') {
      const { key, prefix, position } = payload
      if (
        !isText(key) ||
        !isText(prefix) ||
        !isCount(position) ||
        (key === 'default'
          ? position !== 0 || prefix !== '@' + category
          : position === 0 || prefix !== key || !prefixPattern.test(key))
      ) {
        throw invalid()
      }
      const section = category + '/' + key
      if (sections.has(section)) {
        throw invalid()
      }
      sections.set(section, prefix)
      return []
    }
    const {
      uid,
      id,
      legacyId,
      subcategory,
      number,
      name,
      maxLevel,
      obtainLevels,
      powderCost,
      powderCostAdditional,
      skillIds,
    } = payload
    if (
      kind !== 'item' ||
      !isText(uid) ||
      !idPattern.test(uid) ||
      identities.has(uid) ||
      !isText(subcategory) ||
      !positiveInt(number) ||
      !isText(name) ||
      !isCount(maxLevel) ||
      !isCount(powderCost) ||
      !(powderCostAdditional === null || isCount(powderCostAdditional)) ||
      !Array.isArray(obtainLevels) ||
      !obtainLevels.every(isCount) ||
      !Array.isArray(skillIds) ||
      !skillIds.every((value): value is string => isText(value) && /^\d+-\d+-\d+$/.test(value)) ||
      (category !== 'skill' && skillIds.length > 0)
    ) {
      throw invalid()
    }
    const section = category + '/' + subcategory
    const prefix = sections.get(section)
    const expectedId =
      category !== 'skill' && subcategory === 'default'
        ? `${category}-${number}`
        : `${category}--${prefix}-${number}`
    if (
      !prefix ||
      number !== (sequence.get(section) ?? 0) + 1 ||
      id !== expectedId ||
      !(legacyId === null || legacyId === id)
    ) {
      throw invalid()
    }
    const groups = parseGroups(payload.groups)
    if (category === 'stat' && !groups.some(group => group.key === 'stat')) {
      throw invalid()
    }
    identities.add(uid)
    sequence.set(section, number)
    return [
      {
        category,
        id,
        uid,
        legacyId,
        name,
        maxLevel,
        obtainLevels,
        powderCost,
        powderCostAdditional: powderCostAdditional ?? powderCost * 10,
        skillIds,
        groups,
      },
    ]
  })
  if (!['stat', 'special', 'skill'].every(category => sections.has(category + '/default'))) {
    throw invalid()
  }
  return items
}

const dataset = createCdnDataset({
  origin: import.meta.env.VITE_REGISTLET_DATA_ORIGIN || 'https://data.cy-grimoire.com',
  path: '/public/registlet/',
  cacheName: 'toram-grimoire-registlet-files',
  indexName: 'toram-grimoire-registlet-datasets',
  parseManifest,
  files: manifest => [manifest.file],
  context: () => null,
  contextKey: () => '',
  async load(manifest, _context, readCsv) {
    return parseRegistletRows(await readCsv(manifest.file, header))
  },
})

export type RegistletDatasetItem = ReturnType<typeof parseRegistletRows>[number]
export const downloadRegistletDataset = async () => (await dataset.load()).data
export const recoverRegistletDatasetModel = dataset.recover
