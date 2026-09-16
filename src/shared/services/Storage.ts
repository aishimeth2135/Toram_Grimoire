import LZString from 'lz-string'

export type StorageResult<Value> =
  | {
      success: true
      value: Value
    }
  | {
      success: false
      error: unknown
    }

export interface StorageRestoreFailure {
  success: false
  error: unknown
  rollbackSuccess: boolean
}

export type StorageRestoreResult =
  | {
      success: true
    }
  | StorageRestoreFailure

type StorageKeyFilter = (key: string) => boolean

const STORAGE_TEST_KEY = '__storage_test__'
const COMPRESSED_JSON_PREFIX = 'cy-grimoire:lz:utf16:v1:'

function getLocalStorage(): StorageResult<Storage> {
  try {
    return {
      success: true,
      value: window.localStorage,
    }
  } catch (error) {
    return {
      success: false,
      error,
    }
  }
}

function getEntries(storage: Storage, filter?: StorageKeyFilter): Record<string, string> {
  const entries: Record<string, string> = {}
  const keys = Array.from({ length: storage.length }, (_value, index) => storage.key(index))

  keys.forEach(key => {
    if (key === null || (filter && !filter(key))) {
      return
    }

    const value = storage.getItem(key)
    if (value !== null) {
      entries[key] = value
    }
  })

  return entries
}

function restoreSnapshot(
  storage: Storage,
  snapshot: Record<string, string>,
  filter: StorageKeyFilter
): boolean {
  try {
    Object.keys(getEntries(storage, filter)).forEach(key => storage.removeItem(key))
    Object.entries(snapshot).forEach(([key, value]) => storage.setItem(key, value))
    return true
  } catch (_error) {
    return false
  }
}

function hasOwnEntry(entries: Record<string, string>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(entries, key)
}

function getEntrySizeDifference(
  snapshot: Record<string, string>,
  [key, value]: [string, string]
): number {
  if (!hasOwnEntry(snapshot, key)) {
    return key.length + value.length
  }

  return value.length - snapshot[key].length
}

function encodeJsonString(value: string): string {
  try {
    const compressed = LZString.compressToUTF16(value)
    const encoded = COMPRESSED_JSON_PREFIX + compressed
    if (encoded.length < value.length && LZString.decompressFromUTF16(compressed) === value) {
      return encoded
    }
  } catch (_error) {
    return value
  }

  return value
}

function decodeJsonString(value: string): StorageResult<string> {
  if (!value.startsWith(COMPRESSED_JSON_PREFIX)) {
    return {
      success: true,
      value,
    }
  }

  try {
    const decoded = LZString.decompressFromUTF16(value.slice(COMPRESSED_JSON_PREFIX.length))
    if (typeof decoded !== 'string') {
      throw new Error('The compressed JSON data is invalid.')
    }

    return {
      success: true,
      value: decoded,
    }
  } catch (error) {
    return {
      success: false,
      error,
    }
  }
}

export class LocalStorageService {
  private constructor() {}

  static isAvailable(): boolean {
    const storageResult = getLocalStorage()
    if (!storageResult.success) {
      return false
    }

    const storage = storageResult.value
    try {
      storage.setItem(STORAGE_TEST_KEY, STORAGE_TEST_KEY)
      storage.removeItem(STORAGE_TEST_KEY)
      return true
    } catch (error) {
      return (
        error instanceof DOMException &&
        (error.code === 22 ||
          error.code === 1014 ||
          error.name === 'QuotaExceededError' ||
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        storage.length !== 0
      )
    }
  }

  static getItem(key: string): StorageResult<string | null> {
    const storageResult = getLocalStorage()
    if (!storageResult.success) {
      return storageResult
    }

    try {
      return {
        success: true,
        value: storageResult.value.getItem(key),
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  static setItem(key: string, value: string): StorageResult<void> {
    const storageResult = getLocalStorage()
    if (!storageResult.success) {
      return storageResult
    }

    try {
      storageResult.value.setItem(key, value)
      return {
        success: true,
        value: undefined,
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  static removeItem(key: string): StorageResult<void> {
    const storageResult = getLocalStorage()
    if (!storageResult.success) {
      return storageResult
    }

    try {
      storageResult.value.removeItem(key)
      return {
        success: true,
        value: undefined,
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  static getJson<Value>(key: string): StorageResult<Value | null> {
    const itemResult = LocalStorageService.getItem(key)
    if (!itemResult.success) {
      return itemResult
    }
    if (itemResult.value === null) {
      return {
        success: true,
        value: null,
      }
    }

    try {
      return {
        success: true,
        value: JSON.parse(itemResult.value) as Value,
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  static setJson(key: string, value: unknown): StorageResult<void> {
    try {
      return LocalStorageService.setItem(key, JSON.stringify(value))
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  static getCompressedJson<Value>(key: string): StorageResult<Value | null> {
    const itemResult = LocalStorageService.getItem(key)
    if (!itemResult.success) {
      return itemResult
    }
    if (itemResult.value === null) {
      return {
        success: true,
        value: null,
      }
    }

    const decodedResult = decodeJsonString(itemResult.value)
    if (!decodedResult.success) {
      return decodedResult
    }

    try {
      const value = JSON.parse(decodedResult.value) as Value
      if (!itemResult.value.startsWith(COMPRESSED_JSON_PREFIX)) {
        const encoded = encodeJsonString(decodedResult.value)
        if (encoded !== decodedResult.value) {
          LocalStorageService.setItem(key, encoded)
        }
      }

      return {
        success: true,
        value,
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  static setCompressedJson(key: string, value: unknown): StorageResult<void> {
    try {
      const json = JSON.stringify(value)
      if (typeof json !== 'string') {
        throw new Error('The value cannot be serialized as JSON.')
      }

      return LocalStorageService.setItem(key, encodeJsonString(json))
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  static getEntries(filter?: StorageKeyFilter): StorageResult<Record<string, string>> {
    const storageResult = getLocalStorage()
    if (!storageResult.success) {
      return storageResult
    }

    try {
      return {
        success: true,
        value: getEntries(storageResult.value, filter),
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  static getDecompressedEntries(filter?: StorageKeyFilter): StorageResult<Record<string, string>> {
    const entriesResult = LocalStorageService.getEntries(filter)
    if (!entriesResult.success) {
      return entriesResult
    }

    try {
      const entries = Object.fromEntries(
        Object.entries(entriesResult.value).map(([key, value]) => {
          const decodedResult = decodeJsonString(value)
          if (!decodedResult.success) {
            throw decodedResult.error
          }

          return [key, decodedResult.value]
        })
      )
      return {
        success: true,
        value: entries,
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  static removeByPrefix(prefix: string): StorageResult<void> {
    const storageResult = getLocalStorage()
    if (!storageResult.success) {
      return storageResult
    }

    try {
      const keys = Object.keys(getEntries(storageResult.value, key => key.startsWith(prefix)))
      keys.forEach(key => storageResult.value.removeItem(key))
      return {
        success: true,
        value: undefined,
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  static replaceEntries(
    entries: Record<string, string>,
    filter: StorageKeyFilter = () => true
  ): StorageRestoreResult {
    const storageResult = getLocalStorage()
    if (!storageResult.success) {
      return {
        ...storageResult,
        rollbackSuccess: true,
      }
    }

    const storage = storageResult.value
    let snapshot: Record<string, string>
    try {
      // Keep the complete original state so a partially applied restore can be reverted.
      snapshot = getEntries(storage, filter)
    } catch (error) {
      return {
        success: false,
        error,
        rollbackSuccess: true,
      }
    }

    try {
      const filteredEntries = Object.fromEntries(
        Object.entries(entries).filter(([key]) => filter(key))
      )
      const obsoleteKeys = Object.keys(snapshot).filter(key => !hasOwnEntry(filteredEntries, key))
      const entriesToSet = Object.entries(filteredEntries).sort(
        (entry1, entry2) =>
          getEntrySizeDifference(snapshot, entry1) - getEntrySizeDifference(snapshot, entry2)
      )

      // Release obsolete and shrinking data before operations that require additional capacity.
      obsoleteKeys.forEach(key => storage.removeItem(key))
      entriesToSet.forEach(([key, value]) => storage.setItem(key, value))
      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        error,
        rollbackSuccess: restoreSnapshot(storage, snapshot, filter),
      }
    }
  }
}
