import { readonly, shallowRef } from 'vue'

import {
  type CdnCsvFile,
  type ReadCdnCsv,
  decodeDatasetManifest,
  maxManifestBytes,
  parseCdnCsv,
} from './CdnDatasetCsv'
import { type DatasetIndex, createDatasetIndex } from './CdnDatasetIndex'

type Snapshot<Manifest, Data> = {
  data: Data
  manifest: Manifest
  stale: boolean
  offlineReady: boolean
}

type DatasetStatus =
  | { state: 'idle' | 'loading' | 'unavailable' }
  | {
      state: 'ready'
      revision: number
      stale: boolean
      offlineReady: boolean
      updateAvailable: boolean
    }

type DatasetOptions<Manifest, Context, Data> = {
  origin: string
  path: string
  cacheName: string
  indexName: string
  parseManifest: (value: unknown) => Manifest
  files: (manifest: Manifest) => readonly CdnCsvFile[]
  context: () => Context
  contextKey: (context: Context) => string
  load: (manifest: Manifest, context: Context, readCsv: ReadCdnCsv) => Promise<Data>
  canActivate?: (manifest: Manifest) => boolean
}

type CachedFile = { url: string; bytes: ArrayBuffer; cached: boolean }
type LoadMode = 'startup' | 'refresh' | 'offline'

function getDatasetUrl(origin: string, path: string) {
  const url = new URL(origin)
  if (
    (url.protocol !== 'https:' &&
      !(import.meta.env.DEV && url.protocol === 'http:' && url.hostname === 'localhost')) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('Invalid dataset origin')
  }
  return new URL(path, url)
}

async function readBytes(response: Response, limit: number): Promise<ArrayBuffer> {
  if (!response.ok || response.type === 'opaque' || !response.body) {
    await response.body?.cancel()
    throw new Error(`Dataset HTTP ${response.status}`)
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
        throw new Error('Dataset exceeds its size limit')
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

async function fetchBytes(url: string, limit: number, cache: RequestCache) {
  const controller = new AbortController()
  const timer = globalThis.setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch(url, {
      cache,
      mode: 'cors',
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal,
    })
    return await readBytes(response, limit)
  } finally {
    globalThis.clearTimeout(timer)
  }
}

export function createCdnDataset<Manifest extends { revision: number }, Context, Data>(
  options: DatasetOptions<Manifest, Context, Data>
) {
  const { cacheName, indexName } = options
  // Resolve configuration inside a load so errors use the normal initialization UI.
  let resolvedUrl: URL | undefined
  const datasetUrl = () => (resolvedUrl ??= getDatasetUrl(options.origin, options.path))
  const assetUrl = (file: string) => new URL(file, datasetUrl()).href
  const sameFiles = (first: Manifest, second: Manifest) =>
    JSON.stringify(options.files(first)) === JSON.stringify(options.files(second))
  const indexStore = createDatasetIndex(indexName, options.parseManifest, sameFiles)
  const indexKey = (context: Context) => assetUrl('') + options.contextKey(context)
  const status = shallowRef<DatasetStatus>({ state: 'idle' })
  const rejectedModels = new Set<number>()
  let automaticCheck: Promise<Manifest | null> | undefined
  let startupIndex: { key: string; value: Promise<DatasetIndex<Manifest>> } | undefined
  let selected: Snapshot<Manifest, Data> | undefined
  let pending: Promise<Snapshot<Manifest, Data>> | undefined

  const fetchManifest = async () =>
    options.parseManifest(
      decodeDatasetManifest(
        await fetchBytes(assetUrl('manifest.json'), maxManifestBytes, 'no-cache')
      )
    )

  function check() {
    if (!automaticCheck) {
      automaticCheck = fetchManifest().catch(() => null)
      try {
        const key = indexKey(options.context())
        startupIndex = { key, value: indexStore.read(key).catch(() => ({})) }
      } catch {
        // Configuration errors are reported when the dataset is requested.
      }
    }
    return automaticCheck
  }

  function hasConflict(first: Manifest, second: Manifest | undefined) {
    return second?.revision === first.revision && !sameFiles(first, second)
  }

  function eligible(manifest: Manifest) {
    return (
      !rejectedModels.has(manifest.revision) &&
      (selected !== undefined || options.canActivate?.(manifest) !== false)
    )
  }

  async function loadSnapshot(
    manifest: Manifest,
    context: Context,
    cache: Cache | undefined,
    cachedOnly: boolean
  ) {
    const files: CachedFile[] = []
    const readCsv: ReadCdnCsv = async (file, header) => {
      const url = assetUrl(file.file)
      try {
        const response = await cache?.match(url)
        if (response) {
          const bytes = await readBytes(response, file.byteLength)
          const rows = await parseCdnCsv(bytes, file, header)
          files.push({ url, bytes, cached: true })
          return rows
        }
      } catch {
        // A bad entry can be replaced from the network.
      }
      if (cachedOnly) {
        throw new Error('Dataset CSV is missing from the local snapshot')
      }
      const bytes = await fetchBytes(url, file.byteLength, 'default')
      const rows = await parseCdnCsv(bytes, file, header)
      files.push({ url, bytes, cached: false })
      return rows
    }
    return { data: await options.load(manifest, context, readCsv), files }
  }

  async function cleanUnreferencedFiles(cache: Cache) {
    const prefix = datasetUrl().href
    const indexes = await indexStore.readAll(prefix)
    const referenced = new Set<string>()
    for (const { active, previous } of indexes) {
      for (const manifest of [active, previous]) {
        if (!manifest) {
          continue
        }
        for (const file of options.files(manifest)) {
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

  async function saveSnapshot(
    key: string,
    manifest: Manifest,
    context: Context,
    files: CachedFile[],
    cache: Cache
  ): Promise<{ saved: boolean; index: DatasetIndex<Manifest> }> {
    const lock = navigator.locks
    const save = async () => {
      const index = await indexStore.read(key)
      if (
        index.active &&
        (index.active.revision > manifest.revision || hasConflict(manifest, index.active))
      ) {
        return { saved: false, index }
      }

      // A cached file may have disappeared between validation and acquiring the lock.
      for (const { url, bytes, cached } of files) {
        if (cached) {
          try {
            const response = await cache.match(url)
            if (response) {
              const actual = new Uint8Array(await readBytes(response, bytes.byteLength))
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

      let incompleteActive: Manifest | undefined
      if (index.active && index.active.revision < manifest.revision) {
        try {
          await loadSnapshot(index.active, context, cache, true)
        } catch {
          incompleteActive = index.active
        }
      }
      const latest = await indexStore.commit(key, manifest, lock ? incompleteActive : undefined)
      const saved =
        latest.active?.revision === manifest.revision && !hasConflict(manifest, latest.active)
      if (saved && lock) {
        await cleanUnreferencedFiles(cache).catch(() => undefined)
      }
      return { saved, index: latest }
    }
    return lock ? lock.request(indexName, save) : save()
  }

  async function chooseSnapshot(mode: LoadMode): Promise<Snapshot<Manifest, Data>> {
    const context = options.context()
    const key = indexKey(context)
    const [remote, cache, initial] = await Promise.all([
      mode === 'startup' ? check() : mode === 'refresh' ? fetchManifest().catch(() => null) : null,
      globalThis.caches?.open(cacheName).catch(() => undefined),
      startupIndex?.key === key
        ? startupIndex.value
        : indexStore.read(key).catch((): DatasetIndex<Manifest> => ({})),
    ])
    let index = await indexStore.read(key).catch(() => initial)
    let memory: Snapshot<Manifest, Data> | undefined
    if (
      remote &&
      eligible(remote) &&
      !hasConflict(remote, selected?.manifest) &&
      (!index.active ||
        (remote.revision >= index.active.revision && !hasConflict(remote, index.active)))
    ) {
      try {
        const candidate = await loadSnapshot(remote, context, cache, false)
        memory = {
          data: candidate.data,
          manifest: remote,
          stale: false,
          offlineReady: false,
        }
        if (cache) {
          try {
            const result = await saveSnapshot(key, remote, context, candidate.files, cache)
            index = result.index
            if (result.saved) {
              return { ...memory, offlineReady: true }
            }
          } catch {
            index = await indexStore.read(key).catch(() => index)
          }
        }
      } catch {
        index = await indexStore.read(key).catch(() => index)
      }
    }
    for (const manifest of [index.active, index.previous]) {
      if (!manifest || !eligible(manifest) || hasConflict(manifest, selected?.manifest)) {
        continue
      }
      try {
        const { data } = await loadSnapshot(manifest, context, cache, true)
        return { data, manifest, stale: true, offlineReady: true }
      } catch {
        // A browser can evict one file independently of the snapshot index.
      }
    }
    if (memory && remote && !hasConflict(remote, index.active)) {
      return { ...memory, stale: (index.active?.revision ?? 0) > remote.revision }
    }
    throw new Error(`No verified dataset is available: ${datasetUrl().href}`)
  }

  function startLoad(mode: LoadMode) {
    if (pending) {
      return pending
    }

    if (!selected) {
      status.value = { state: 'loading' }
    }
    pending = chooseSnapshot(mode)
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
          status.value.state === 'ready'
            ? { ...status.value, stale: true }
            : { state: 'unavailable' }
        throw error
      })
      .finally(() => {
        pending = undefined
      })
    return pending
  }

  const load = async () =>
    selected ?? (await startLoad(status.value.state === 'unavailable' ? 'refresh' : 'startup'))

  async function retry() {
    await startLoad('refresh')
    return status.value
  }

  async function recover() {
    await pending?.catch(() => undefined)
    if (!selected) {
      return false
    }

    rejectedModels.add(selected.manifest.revision)
    selected = undefined
    return startLoad('offline').then(
      () => true,
      () => false
    )
  }

  return { check, load, retry, recover, status: readonly(status) }
}
