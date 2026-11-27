import { useLocaleStore } from '@/stores/app/locale'

import { createCdnDataset } from '@/shared/services/CdnDataset'

import type { LocaleCsvDatas } from './DownloadDatas'
import {
  getSkillDatasetLocales,
  parseStandaloneSkillManifest,
  parseStatManifest,
  readSkillDataset,
  readStatDataset,
  skillManifestFiles,
} from './SkillDataset'

const origin = import.meta.env.VITE_SKILL_DATA_ORIGIN
const context = () => {
  const { primaryLocale, fallbackLocale } = useLocaleStore()
  return getSkillDatasetLocales(primaryLocale, fallbackLocale)
}
const contextKey = ({ primary, fallback }: ReturnType<typeof context>) =>
  (primary ?? 'zh-TW') + ':' + (fallback ?? '')

const skillDataset = createCdnDataset({
  origin,
  path: '/public/skill/',
  cacheName: 'toram-grimoire-skill-files',
  indexName: 'toram-grimoire-skill-datasets',
  parseManifest: parseStandaloneSkillManifest,
  files: skillManifestFiles,
  context,
  contextKey,
  load: readSkillDataset,
})

const statDataset = createCdnDataset({
  origin: import.meta.env.VITE_STAT_DATA_ORIGIN || origin,
  path: '/public/stat/',
  cacheName: 'toram-grimoire-stat-files',
  indexName: 'toram-grimoire-stat-datasets',
  parseManifest: parseStatManifest,
  files: ({ files }) => [files.statsData, files.statsLocaleData],
  context,
  contextKey,
  load: ({ files }, locales, readCsv) => readStatDataset(files, locales, readCsv),
})

export const checkSkillDataset = skillDataset.check
export const retrySkillDataset = skillDataset.retry
export const recoverSkillDatasetModel = skillDataset.recover
export const skillDatasetStatus = skillDataset.status

// The existing loaders apply locale values in place.
function copyLocaleCsv(data: LocaleCsvDatas): LocaleCsvDatas {
  return {
    baseData: data.baseData.map(row => row.slice()),
    primaryLocaleData: data.primaryLocaleData?.map(row => row.slice()) ?? null,
    fallbackLocaleData: data.fallbackLocaleData?.map(row => row.slice()) ?? null,
    dataVersion: data.dataVersion,
  }
}

export async function downloadSkillDataset() {
  const {
    data: [skill, layout],
  } = await skillDataset.load()
  return [copyLocaleCsv(skill), copyLocaleCsv(layout)] as const
}

export async function downloadStatDataset() {
  const { data: stats } = await statDataset.load()
  return copyLocaleCsv(stats)
}
