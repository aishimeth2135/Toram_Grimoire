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
