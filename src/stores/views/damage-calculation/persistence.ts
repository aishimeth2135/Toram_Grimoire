import { DataPersistenceService } from '@/shared/services/DataPersistenceService'

import type { CalculationSaveData } from '@/lib/Damage/DamageCalculation'

export interface DamageCalculationSaveData {
  calculations: CalculationSaveData[]
  currentCalculationIndex: number
}

export const DamageCalculationPersistenceService =
  new DataPersistenceService<DamageCalculationSaveData>({
    legacyKey: 'app--damage-calculation--v1--data',
    compressedKey: 'app--damage-calculation--lz-v1',
  })
