import DamageCalculationSystem from '@/lib/Damage'

import { DatasStoreBase } from '../DatasStoreBase'

const initDamageCalculationInstance = () => {
  if (DatasStoreBase.DamageCalculation === null) {
    DatasStoreBase.DamageCalculation = DamageCalculationSystem.create()
  }
  return DatasStoreBase.DamageCalculation
}

export async function prepareDamageCalculation(): Promise<() => Promise<void>> {
  initDamageCalculationInstance()
  return () => Promise.resolve()
}
