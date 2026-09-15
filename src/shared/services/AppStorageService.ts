import { LocalStorageService, type StorageResult } from '@/shared/services/Storage'
import { toInt } from '@/shared/utils/number'

const STORAGE_KEYS = {
  FONT_FAMILY: 'app--font-family',
  PRIMARY_LOCALE: 'app--app-locale',
  FALLBACK_LOCALE: 'app--fallback-locale',
  ROOT_ELEMENT_FONT_SIZE: 'app--root-element-font-size',
  NIGHT_MODE: 'app--night-mode',
  DEV_MODE: 'dev-mode',
} as const

function getItem(key: string): string | null {
  const result = LocalStorageService.getItem(key)
  return result.success ? result.value : null
}

function getInteger(key: string, fallback: number): number {
  return toInt(getItem(key)) ?? fallback
}

function isLocaleIndex(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value < AppStorageService.LOCALE_LIST.length
}

export class AppStorageService {
  static readonly LOCALE_AUTO = -1
  static readonly LOCALE_LIST = ['en', 'zh-TW', 'ja', 'zh-CN'] as const

  private constructor() {}

  static getFontFamily(): number {
    return getInteger(STORAGE_KEYS.FONT_FAMILY, 1)
  }

  static setFontFamily(value: number): StorageResult<void> {
    return LocalStorageService.setItem(STORAGE_KEYS.FONT_FAMILY, value.toString())
  }

  static getRootElementFontSize(): number {
    return getInteger(STORAGE_KEYS.ROOT_ELEMENT_FONT_SIZE, 160)
  }

  static setRootElementFontSize(value: number): StorageResult<void> {
    return LocalStorageService.setItem(STORAGE_KEYS.ROOT_ELEMENT_FONT_SIZE, value.toString())
  }

  static getNightMode(): boolean {
    return getItem(STORAGE_KEYS.NIGHT_MODE) === '1'
  }

  static setNightMode(value: boolean): StorageResult<void> {
    return LocalStorageService.setItem(STORAGE_KEYS.NIGHT_MODE, value ? '1' : '0')
  }

  static getDevMode(): boolean {
    return getItem(STORAGE_KEYS.DEV_MODE) === '1'
  }

  static setDevMode(value: boolean): StorageResult<void> {
    return value
      ? LocalStorageService.setItem(STORAGE_KEYS.DEV_MODE, '1')
      : LocalStorageService.removeItem(STORAGE_KEYS.DEV_MODE)
  }

  // Primary locale: -1(auto), 0, 1, 2, 3
  static getPrimaryLocale(): number {
    const value = getItem(STORAGE_KEYS.PRIMARY_LOCALE) ?? 'auto'
    if (value === 'auto') {
      return AppStorageService.LOCALE_AUTO
    }

    const locale = toInt(value)
    return locale !== null && isLocaleIndex(locale) ? locale : AppStorageService.LOCALE_AUTO
  }

  static setPrimaryLocale(value: number): StorageResult<void> {
    const locale = isLocaleIndex(value) ? value.toString() : 'auto'
    return LocalStorageService.setItem(STORAGE_KEYS.PRIMARY_LOCALE, locale)
  }

  // Fallback locale: 0, 1, 2, 3
  static getFallbackLocale(): number {
    const locale = getInteger(STORAGE_KEYS.FALLBACK_LOCALE, 0)
    return isLocaleIndex(locale) ? locale : 0
  }

  static setFallbackLocale(value: number): StorageResult<void> {
    const locale = isLocaleIndex(value) ? value : 0
    return LocalStorageService.setItem(STORAGE_KEYS.FALLBACK_LOCALE, locale.toString())
  }
}
