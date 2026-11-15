import { readonly, shallowRef } from 'vue'

import { useLocaleStore } from '@/stores/app/locale'

import type { LocaleCsvDatas } from './DownloadDatas'
import {
  type SkillCsvFile,
  type SkillManifest,
  decodeSkillManifest,
  getSkillDatasetLocales,
  maxSkillManifestBytes,
  parseSkillCsv,
  readSkillDataset,
  readStatDataset,
  skillManifestFiles,
  statFiles,
} from './SkillDataset'
import {
  type SkillSnapshotIndex,
  commitSkillSnapshot,
  readSkillSnapshotIndex,
  readSkillSourceIndexes,
  sameSkillFiles,
} from './SkillDatasetIndex'

const source = import.meta.env.VITE_SKILL_DATA_ORIGIN
const cacheName = 'toram-grimoire-skill-files'
const coordinationLock = 'toram-grimoire-skill-datasets'
type Locales = ReturnType<typeof getSkillDatasetLocales>
type Dataset = Awaited<ReturnType<typeof readSkillDataset>>
type Snapshot = {
  data: Dataset
  stats: LocaleCsvDatas | null
  manifest: SkillManifest
  stale: boolean
  offlineReady: boolean
}
type SkillDatasetStatus =
  | { state: 'idle' | 'loading' | 'unavailable' }
  | {
      state: 'ready'
      revision: number
      stale: boolean
      offlineReady: boolean
      updateAvailable: boolean
    }

const status = shallowRef<SkillDatasetStatus>({ state: 'idle' })
export const skillDatasetStatus = readonly(status)
const rejectedModels = new Set<number>()
let automaticCheck: Promise<SkillManifest | null> | undefined
let startupIndex: { key: string; value: Promise<SkillSnapshotIndex> } | undefined
let selected: Snapshot | undefined
let pending: Promise<Snapshot> | undefined
let statSelection: string | undefined

export function hasSkillDatasetSource() {
  return Boolean(source)
}

function assetUrl(file: string) {
  const url = new URL(source)
  if (
    (url.protocol !== 'https:' &&
      !(import.meta.env.DEV && url.protocol === 'http:' && url.hostname === 'localhost')) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('Invalid skill data origin')
  }
  return new URL('/public/skills/' + file, url).href
}

async function readBytes(response: Response, limit: number): Promise<ArrayBuffer> {
  if (!response.ok || response.type === 'opaque' || !response.body) {
    await response.body?.cancel()
    throw new Error(`Skill data HTTP ${response.status}`)
  }
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      length += value.byteLength
      if (length > limit) {
        await reader.cancel()
        throw new Error('Skill data exceeds its size limit')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes.buffer
}

async function fetchBytes(file: string, limit: number, cache: RequestCache) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch(assetUrl(file), {
      cache,
      mode: 'cors',
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal,
    })
    return await readBytes(response, limit)
  } finally {
    window.clearTimeout(timer)
  }
}

const getManifest = async () =>
  decodeSkillManifest(await fetchBytes('manifest.json', maxSkillManifestBytes, 'no-cache'))

function localeKey(locales: Locales) {
  return assetUrl('') + (locales.primary ?? 'zh-TW') + ':' + (locales.fallback ?? '')
}

function currentLocales() {
  const { primaryLocale, fallbackLocale } = useLocaleStore()
  return getSkillDatasetLocales(primaryLocale, fallbackLocale)
}

export function checkSkillDataset() {
  if (source && !automaticCheck) {
    automaticCheck = getManifest().catch(() => null)
    try {
      const key = localeKey(currentLocales())
      startupIndex = { key, value: readSkillSnapshotIndex(key).catch(() => ({})) }
    } catch {
      // A bad source is reported when the dataset is requested.
    }
  }
  return automaticCheck
}

type CachedFile = { file: SkillCsvFile; url: string; bytes: ArrayBuffer; cached: boolean }

async function loadSnapshot(
  manifest: SkillManifest,
  locales: Locales,
  cache: Cache | undefined,
  cachedOnly: boolean
) {
  const files: CachedFile[] = []
  const readCsv = async (file: SkillCsvFile, header: readonly string[]) => {
    const url = assetUrl(file.file)
    try {
      const response = await cache?.match(url)
      if (response) {
        const bytes = await readBytes(response, file.byteLength)
        const rows = await parseSkillCsv(bytes, file, header)
        files.push({ file, url, bytes, cached: true })
        return rows
      }
    } catch {
      // A bad entry can be replaced from the network.
    }
    if (cachedOnly) {
      throw new Error('Skill CSV is missing from the local snapshot')
    }
    const bytes = await fetchBytes(file.file, file.byteLength, 'default')
    const rows = await parseSkillCsv(bytes, file, header)
    files.push({ file, url, bytes, cached: false })
    return rows
  }
  const descriptors = statFiles(manifest)
  const [data, stats] = await Promise.all([
    readSkillDataset(manifest, locales, readCsv),
    descriptors ? readStatDataset(descriptors, locales, readCsv) : null,
  ])
  return { data, stats, files }
}

async function cleanUnreferencedFiles(cache: Cache) {
  const prefix = assetUrl('')
  const indexes = await readSkillSourceIndexes(prefix)
  const referenced = new Set<string>()
  for (const { active, previous } of indexes) {
    for (const manifest of [active, previous]) {
      if (!manifest) {
        continue
      }
      for (const file of skillManifestFiles(manifest)) {
        referenced.add(assetUrl(file.file))
      }
    }
  }
  for (const entry of await cache.keys()) {
    if (entry.url.startsWith(prefix) && !referenced.has(entry.url)) {
      await cache.delete(entry)
    }
  }
}

function hasConflict(first: SkillManifest, second: SkillManifest | undefined) {
  return second?.revision === first.revision && !sameSkillFiles(first, second)
}

async function saveSnapshot(
  key: string,
  manifest: SkillManifest,
  locales: Locales,
  files: CachedFile[],
  cache: Cache
): Promise<{ saved: boolean; index: SkillSnapshotIndex }> {
  const lock = navigator.locks
  const save = async () => {
    const index = await readSkillSnapshotIndex(key)
    if (
      index.active &&
      (index.active.revision > manifest.revision || hasConflict(manifest, index.active))
    ) {
      return { saved: false, index }
    }

    // A cached file may have disappeared between validation and acquiring the lock.
    for (const { url, bytes, cached, file } of files) {
      if (cached) {
        try {
          const response = await cache.match(url)
          if (response) {
            const actual = new Uint8Array(await readBytes(response, file.byteLength))
            const expected = new Uint8Array(bytes)
            if (
              actual.length === expected.length &&
              actual.every((byte, offset) => byte === expected[offset])
            ) {
              continue
            }
          }
        } catch {
          // Restore the verified bytes below.
        }
      }
      await cache.put(url, new Response(bytes))
    }

    let incompleteActive: SkillManifest | undefined
    if (index.active && index.active.revision < manifest.revision) {
      try {
        await loadSnapshot(index.active, locales, cache, true)
      } catch {
        incompleteActive = index.active
      }
    }
    const latest = await commitSkillSnapshot(key, manifest, lock ? incompleteActive : undefined)
    const saved =
      latest.active?.revision === manifest.revision && !hasConflict(manifest, latest.active)
    if (saved && lock) {
      await cleanUnreferencedFiles(cache).catch(() => undefined)
    }
    return { saved, index: latest }
  }
  return lock ? lock.request(coordinationLock, save) : save()
}

async function chooseSnapshot(retry: boolean): Promise<Snapshot> {
  const locales = currentLocales()
  const key = localeKey(locales)
  const [remote, cache, initial] = await Promise.all([
    retry ? getManifest().catch(() => null) : checkSkillDataset(),
    globalThis.caches?.open(cacheName).catch(() => undefined),
    startupIndex?.key === key
      ? startupIndex.value
      : readSkillSnapshotIndex(key).catch((): SkillSnapshotIndex => ({})),
  ])
  let index = await readSkillSnapshotIndex(key).catch(() => initial)
  let memory: Snapshot | undefined
  if (
    remote &&
    !rejectedModels.has(remote.revision) &&
    !hasConflict(remote, selected?.manifest) &&
    (!index.active ||
      (remote.revision >= index.active.revision && !hasConflict(remote, index.active)))
  ) {
    try {
      const candidate = await loadSnapshot(remote, locales, cache, false)
      memory = {
        data: candidate.data,
        stats: candidate.stats,
        manifest: remote,
        stale: false,
        offlineReady: false,
      }
      if (cache) {
        try {
          const result = await saveSnapshot(key, remote, locales, candidate.files, cache)
          index = result.index
          if (result.saved) {
            return { ...memory, offlineReady: true }
          }
        } catch {
          index = await readSkillSnapshotIndex(key).catch(() => index)
        }
      }
    } catch {
      index = await readSkillSnapshotIndex(key).catch(() => index)
    }
  }
  for (const manifest of [index.active, index.previous]) {
    if (
      !manifest ||
      rejectedModels.has(manifest.revision) ||
      hasConflict(manifest, selected?.manifest)
    ) {
      continue
    }
    try {
      const { data, stats } = await loadSnapshot(manifest, locales, cache, true)
      return { data, stats, manifest, stale: true, offlineReady: true }
    } catch {
      // A browser can evict one file independently of the snapshot index.
    }
  }
  if (memory && remote && !hasConflict(remote, index.active)) {
    return { ...memory, stale: (index.active?.revision ?? 0) > remote.revision }
  }
  throw new Error('No verified skill dataset is available')
}

function startLoad(retry: boolean) {
  if (pending) {
    return pending
  }

  if (!selected) {
    status.value = { state: 'loading' }
  }
  pending = chooseSnapshot(retry)
    .then(snapshot => {
      selected ??= snapshot
      const updateAvailable = snapshot.manifest.revision > selected.manifest.revision
      if (snapshot.manifest.revision === selected.manifest.revision) {
        selected = snapshot
      }
      status.value = {
        state: 'ready',
        revision: selected.manifest.revision,
        stale: snapshot.stale || selected.stale,
        offlineReady: selected.offlineReady,
        updateAvailable,
      }
      return selected
    })
    .catch((error: unknown) => {
      status.value =
        status.value.state === 'ready' ? { ...status.value, stale: true } : { state: 'unavailable' }
      throw error
    })
    .finally(() => {
      pending = undefined
    })
  return pending
}

export async function downloadSkillDataset(): Promise<Dataset> {
  const {
    data: [skill, layout],
  } = selected ?? (await startLoad(false))
  // LoadSkill and LoadSkillMain apply locale values in place.
  return [copyLocaleCsv(skill), copyLocaleCsv(layout)]
}

function copyLocaleCsv({
  baseData,
  primaryLocaleData,
  fallbackLocaleData,
  dataVersion,
}: LocaleCsvDatas): LocaleCsvDatas {
  return {
    baseData: baseData.map(row => row.slice()),
    primaryLocaleData: primaryLocaleData?.map(row => row.slice()) ?? null,
    fallbackLocaleData: fallbackLocaleData?.map(row => row.slice()) ?? null,
    dataVersion,
  }
}

function statIdentity(manifest: SkillManifest) {
  return JSON.stringify(statFiles(manifest) ?? null)
}

export async function downloadStatDataset() {
  const { stats, manifest } = selected ?? (await startLoad(false))
  statSelection = statIdentity(manifest)
  return stats ? copyLocaleCsv(stats) : null
}

export async function retrySkillDataset() {
  await startLoad(true)
  return status.value
}

export async function recoverSkillDatasetModel(): Promise<boolean> {
  if (!selected) {
    return false
  }
  rejectedModels.add(selected.manifest.revision)
  selected = undefined
  status.value = { state: 'unavailable' }

  const locales = currentLocales()
  const cache = await globalThis.caches?.open(cacheName).catch(() => undefined)
  const index = await readSkillSnapshotIndex(localeKey(locales)).catch(() => undefined)
  for (const manifest of [index?.active, index?.previous]) {
    if (
      !manifest ||
      rejectedModels.has(manifest.revision) ||
      (statSelection !== undefined && statSelection !== statIdentity(manifest))
    ) {
      continue
    }
    try {
      const { data, stats } = await loadSnapshot(manifest, locales, cache, true)
      selected = { data, stats, manifest, stale: true, offlineReady: true }
      status.value = {
        state: 'ready',
        revision: manifest.revision,
        stale: true,
        offlineReady: true,
        updateAvailable: false,
      }
      return true
    } catch {
      // The indexed revision can have missing files.
    }
  }
  return false
}
