import { DataPersistenceService } from '@/shared/services/DataPersistenceService'

import { type CalculationSaveData, parseCalculationSaveData } from '@/lib/Damage/DamageCalculation'

export interface DamageCalculationSaveData {
  version: 2
  calculations: CalculationSaveData[]
  currentCalculationIndex: number
}

export function parseDamageCalculationSaveData(data: unknown): DamageCalculationSaveData | null {
  if (!data || typeof data !== 'object') {
    return null
  }
  const source = data as Record<string, unknown>
  if (!Array.isArray(source.calculations) || typeof source.currentCalculationIndex !== 'number') {
    return null
  }

  const calculations = source.calculations.flatMap(calculation => {
    const parsed = parseCalculationSaveData(calculation)
    return parsed ? [parsed] : []
  })
  if (calculations.length === 0) {
    return null
  }

  const currentCalculationIndex = Math.min(
    Math.max(Math.trunc(source.currentCalculationIndex), 0),
    calculations.length - 1
  )
  return {
    version: 2,
    calculations,
    currentCalculationIndex,
  }
}

export const DamageCalculationPersistenceService = new DataPersistenceService<unknown>({
  legacyKey: 'app--damage-calculation--v1--data',
  compressedKey: 'app--damage-calculation--lz-v1',
})
