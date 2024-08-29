import type { InjectionKey, Ref } from 'vue'

import { type CalcModeItem } from './setup'

interface DamageCalculationRootInjection {
  currentExpectedResult: Ref<number>
  currentCalcMode: Ref<CalcModeItem>
}

export const DamageCalculationRootInjectionKey: InjectionKey<DamageCalculationRootInjection> =
  Symbol()
