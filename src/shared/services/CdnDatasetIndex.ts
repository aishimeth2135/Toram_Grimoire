export type DatasetIndex<Manifest> = { active?: Manifest; previous?: Manifest }

const storeName = 'snapshots'

function openIndex(databaseName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1)
    let blocked = false
    request.onupgradeneeded = () => request.result.createObjectStore(storeName)
    request.onblocked = () => {
      blocked = true
      reject(new Error('Dataset snapshot index is blocked'))
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
  databaseName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore, result: (value: T) => void) => void
): Promise<T> {
  const db = await openIndex(databaseName)
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(storeName, mode)
      let result: T
      transaction.oncomplete = () => resolve(result)
      transaction.onabort = () => reject(transaction.error ?? new Error('Dataset index aborted'))
      run(transaction.objectStore(storeName), value => {
        result = value
      })
    })
  } finally {
    db.close()
  }
}

export function createDatasetIndex<Manifest extends { revision: number }>(
  databaseName: string,
  parseManifest: (value: unknown) => Manifest,
  sameFiles: (first: Manifest, second: Manifest) => boolean
) {
  function parseSaved(value: unknown) {
    try {
      return parseManifest(value)
    } catch {
      return undefined
    }
  }

  function readIndex(value: DatasetIndex<unknown> | undefined): DatasetIndex<Manifest> {
    return { active: parseSaved(value?.active), previous: parseSaved(value?.previous) }
  }

  function read(key: string) {
    return withIndex<DatasetIndex<Manifest>>(databaseName, 'readonly', (store, result) => {
      const request = store.get(key)
      request.onsuccess = () => result(readIndex(request.result))
    })
  }

  function readAll(prefix: string) {
    return withIndex<DatasetIndex<Manifest>[]>(databaseName, 'readonly', (store, result) => {
      const request = store.getAll(IDBKeyRange.bound(prefix, prefix + '\uffff'))
      request.onsuccess = () => result(request.result.map(readIndex))
    })
  }

  function commit(key: string, manifest: Manifest, incompleteActive: Manifest | undefined) {
    return withIndex<DatasetIndex<Manifest>>(databaseName, 'readwrite', (store, result) => {
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
          sameFiles(saved.active, incompleteActive)
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

  return { read, readAll, commit }
}
