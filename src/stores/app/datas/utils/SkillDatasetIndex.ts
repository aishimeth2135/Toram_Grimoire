import { type SkillManifest, parseSkillManifest, skillManifestFiles } from './SkillDataset'

export type SkillSnapshotIndex = { active?: SkillManifest; previous?: SkillManifest }

const storeName = 'snapshots'

function openIndex(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('toram-grimoire-skill-datasets', 1)
    let blocked = false
    request.onupgradeneeded = () => request.result.createObjectStore(storeName)
    request.onblocked = () => {
      blocked = true
      reject(new Error('Skill snapshot index is blocked'))
    }
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      if (blocked) {
        request.result.close()
      } else {
        resolve(request.result)
      }
    }
  })
}

async function withIndex<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore, result: (value: T) => void) => void
): Promise<T> {
  const db = await openIndex()
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(storeName, mode)
      let result: T
      transaction.oncomplete = () => resolve(result)
      transaction.onabort = () => reject(transaction.error ?? new Error('Skill index aborted'))
      run(transaction.objectStore(storeName), value => {
        result = value
      })
    })
  } finally {
    db.close()
  }
}

function parseSaved(value: unknown): SkillManifest | undefined {
  try {
    return parseSkillManifest(value)
  } catch {
    return undefined
  }
}

function readIndex(value: SkillSnapshotIndex | undefined): SkillSnapshotIndex {
  return { active: parseSaved(value?.active), previous: parseSaved(value?.previous) }
}

export function readSkillSnapshotIndex(key: string) {
  return withIndex<SkillSnapshotIndex>('readonly', (store, result) => {
    const request = store.get(key)
    request.onsuccess = () => result(readIndex(request.result))
  })
}

export function readSkillSourceIndexes(prefix: string) {
  return withIndex<SkillSnapshotIndex[]>('readonly', (store, result) => {
    const request = store.getAll(IDBKeyRange.bound(prefix, prefix + '\uffff'))
    request.onsuccess = () => result(request.result.map(readIndex))
  })
}

function identity(manifest: SkillManifest) {
  return JSON.stringify([manifest.schemaVersion, skillManifestFiles(manifest)])
}

export function sameSkillFiles(first: SkillManifest, second: SkillManifest) {
  return identity(first) === identity(second)
}

export function commitSkillSnapshot(
  key: string,
  manifest: SkillManifest,
  incompleteActive: SkillManifest | undefined
) {
  return withIndex<SkillSnapshotIndex>('readwrite', (store, result) => {
    const request = store.get(key)
    request.onsuccess = () => {
      const saved = readIndex(request.result)
      if (saved.active && saved.active.revision >= manifest.revision) {
        result(saved)
        return
      }

      const discardActive =
        incompleteActive &&
        saved.active?.revision === incompleteActive.revision &&
        sameSkillFiles(saved.active, incompleteActive)
      const next = { active: manifest, previous: discardActive ? saved.previous : saved.active }
      try {
        store.put(next, key)
        result(next)
      } catch {
        store.transaction.abort()
      }
    }
  })
}
