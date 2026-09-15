import { LocalStorageService, type StorageResult } from '@/shared/services/Storage'

interface DataPersistenceServiceOptions {
  legacyKey: string
  compressedKey: string
}

type SaveStorageMode = 'compressed' | 'legacy'

export class DataPersistenceService<Value> {
  private readonly legacyKey: string
  private readonly compressedKey: string
  private migratedInCurrentRuntime: boolean
  private legacyCleanupPending: boolean
  private storageMode: SaveStorageMode

  constructor(options: DataPersistenceServiceOptions) {
    this.legacyKey = options.legacyKey
    this.compressedKey = options.compressedKey
    this.migratedInCurrentRuntime = false
    this.legacyCleanupPending = false
    this.storageMode = 'compressed'
  }

  delete(): StorageResult<void> {
    const compressedResult = LocalStorageService.removeItem(this.compressedKey)
    const legacyResult = LocalStorageService.removeItem(this.legacyKey)
    if (compressedResult.success && legacyResult.success) {
      this.migratedInCurrentRuntime = false
      this.legacyCleanupPending = false
      this.storageMode = 'compressed'
    }
    return compressedResult.success ? legacyResult : compressedResult
  }

  has(): boolean {
    const compressedResult = LocalStorageService.getItem(this.compressedKey)
    if (compressedResult.success && compressedResult.value !== null) {
      return true
    }

    const legacyResult = LocalStorageService.getItem(this.legacyKey)
    return legacyResult.success && legacyResult.value !== null
  }

  load(): StorageResult<Value | null> {
    const compressedResult = LocalStorageService.getCompressedJson<Value>(this.compressedKey)
    if (!compressedResult.success || compressedResult.value !== null) {
      this.legacyCleanupPending = compressedResult.success && !this.migratedInCurrentRuntime
      this.storageMode = 'compressed'
      return compressedResult
    }

    this.legacyCleanupPending = false
    const legacyResult = LocalStorageService.getJson<Value>(this.legacyKey)
    if (legacyResult.success && legacyResult.value !== null) {
      const migrationResult = LocalStorageService.setCompressedJson(
        this.compressedKey,
        legacyResult.value
      )
      this.migratedInCurrentRuntime = migrationResult.success
      this.storageMode = migrationResult.success ? 'compressed' : 'legacy'
    } else {
      this.storageMode = 'compressed'
    }

    return legacyResult
  }

  confirmLoaded(): void {
    if (!this.legacyCleanupPending) {
      return
    }

    const result = LocalStorageService.removeItem(this.legacyKey)
    if (result.success) {
      this.legacyCleanupPending = false
    }
  }

  save(data: Value): StorageResult<void> {
    if (this.storageMode === 'legacy') {
      const legacyResult = LocalStorageService.setJson(this.legacyKey, data)
      if (!legacyResult.success) {
        return legacyResult
      }

      const migrationResult = LocalStorageService.setCompressedJson(this.compressedKey, data)
      if (migrationResult.success) {
        this.migratedInCurrentRuntime = true
        this.storageMode = 'compressed'
      }

      return legacyResult
    }

    const result = LocalStorageService.setCompressedJson(this.compressedKey, data)
    if (result.success) {
      this.migratedInCurrentRuntime = true
    }
    return result
  }
}
