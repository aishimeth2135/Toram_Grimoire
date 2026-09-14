import { LocalStorageService } from '@/shared/services/Storage'

import type { CalculationSaveData } from '@/lib/Damage/DamageCalculation'

export interface DamageCalculationSaveData {
  calculations: CalculationSaveData[]
  currentCalculationIndex: number
}

const SAVE_KEY = 'app--damage-calculation--v1--data'

export function loadDamageCalculationSaveData() {
  return LocalStorageService.getJson<DamageCalculationSaveData>(SAVE_KEY)
}

export function saveDamageCalculationSaveData(data: DamageCalculationSaveData) {
  return LocalStorageService.setJson(SAVE_KEY, data)
}
