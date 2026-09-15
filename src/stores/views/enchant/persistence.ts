import { DataPersistenceService } from '@/shared/services/DataPersistenceService'

import type { EnchantBuildSaveData } from '@/lib/Enchant/Enchant'

import type { EnchantStoreConfig } from './config'

export interface EnchantStoreSaveData {
  builds: EnchantBuildSaveData[]
  index: number
  config: EnchantStoreConfig
}

export const EnchantPersistenceService = new DataPersistenceService<EnchantStoreSaveData>({
  legacyKey: 'app--enchant-simulator--vbeta--auto',
  compressedKey: 'app--enchant-simulator--lz-v1--auto',
})
