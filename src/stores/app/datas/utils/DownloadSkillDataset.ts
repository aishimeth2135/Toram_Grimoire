import { useLocaleStore } from '@/stores/app/locale'

import { createCdnDataset } from '@/shared/services/CdnDataset'

import type { LocaleCsvDatas } from './DownloadDatas'
import {
  type SkillManifest,
  getSkillDatasetLocales,
  parseSkillManifest,
  readSkillDataset,
  readStatDataset,
  skillManifestFiles,
} from './SkillDataset'

let selectedStats: string | undefined
const statIdentity = (manifest: SkillManifest) => JSON.stringify(manifest.files.stats)

const dataset = createCdnDataset({
  origin: import.meta.env.VITE_SKILL_DATA_ORIGIN || 'https://data.cy-grimoire.com',
  path: '/public/data/',
  cacheName: 'toram-grimoire-skill-files',
  indexName: 'toram-grimoire-skill-datasets',
  parseManifest: parseSkillManifest,
  files: skillManifestFiles,
  context: () => {
    const { primaryLocale, fallbackLocale } = useLocaleStore()
    return getSkillDatasetLocales(primaryLocale, fallbackLocale)
  },
  contextKey: ({ primary, fallback }) => (primary ?? 'zh-TW') + ':' + (fallback ?? ''),
  // A recovered skill model must use the Stat definitions already loaded in this document.
  canActivate: manifest => selectedStats === undefined || selectedStats === statIdentity(manifest),
  async load(manifest, locales, readCsv) {
    const [skills, stats] = await Promise.all([
      readSkillDataset(manifest, locales, readCsv),
      readStatDataset(manifest.files.stats, locales, readCsv),
    ])
    return { skills, stats }
  },
})

export const checkSkillDataset = dataset.check
export const retrySkillDataset = dataset.retry
export const recoverSkillDatasetModel = dataset.recover
export const skillDatasetStatus = dataset.status

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
    data: {
      skills: [skill, layout],
    },
  } = await dataset.load()
  return [copyLocaleCsv(skill), copyLocaleCsv(layout)] as const
}

export async function downloadStatDataset() {
  const {
    data: { stats },
    manifest,
  } = await dataset.load()
  selectedStats = statIdentity(manifest)
  return copyLocaleCsv(stats)
}
