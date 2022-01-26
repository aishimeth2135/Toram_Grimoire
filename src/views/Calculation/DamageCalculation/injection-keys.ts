import type { Ref, InjectionKey } from 'vue'

import { CalcModeItem } from './setup'
interface DamageCalculationRootInjection {
  currentExpectedResult: Ref<number>;
  currentCalcMode: Ref<CalcModeItem>;
}

export const DamageCalculationRootInjectionKey: InjectionKey<DamageCalculationRootInjection> = Symbol()
