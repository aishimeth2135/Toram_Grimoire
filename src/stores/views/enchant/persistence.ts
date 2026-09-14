import { LocalStorageService } from '@/shared/services/Storage'

import type { EnchantBuildSaveData } from '@/lib/Enchant/Enchant'

import type { EnchantStoreConfig } from './config'

export interface EnchantStoreSaveData {
  builds: EnchantBuildSaveData[]
  index: number
  config: EnchantStoreConfig
}

const SAVE_PRETEXT = 'app--enchant-simulator--vbeta--'

function getSaveKey(target: string): string {
  return SAVE_PRETEXT + target
}

export function loadEnchantSaveData(target: string) {
  return LocalStorageService.getJson<EnchantStoreSaveData>(getSaveKey(target))
}

export function saveEnchantSaveData(target: string, data: EnchantStoreSaveData) {
  return LocalStorageService.setJson(getSaveKey(target), data)
}
