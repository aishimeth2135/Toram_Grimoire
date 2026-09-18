import { type Ref, computed } from 'vue'

import {
  type CalcResultOptions,
  Calculation,
  type CalculationBase,
  type CalculationSnapshot,
  evaluateCalculationExpectedResult,
} from '@/lib/Damage/DamageCalculation'

export function setupCalculationExpectedResult(
  calculation: Ref<Calculation>,
  calculationOptions?: Ref<CalcResultOptions>
) {
  const evaluation = computed(() =>
    evaluateCalculationExpectedResult(
      calculation.value.base,
      calculation.value.createSnapshot(),
      calculationOptions?.value
    )
  )
  const baseResultCritical = computed(() => evaluation.value.baseResultCritical)
  const baseResultWithoutCritical = computed(() => evaluation.value.baseResultWithoutCritical)
  const expectedResult = computed(() => evaluation.value.expectedResult)

  return {
    baseResultCritical,
    baseResultWithoutCritical,

    expectedResult,
  }
}

export function setupCalculationSnapshotExpectedResult(
  calculationBase: CalculationBase,
  snapshot: Ref<CalculationSnapshot>,
  calculationOptions?: Ref<CalcResultOptions>
) {
  const evaluation = computed(() =>
    evaluateCalculationExpectedResult(calculationBase, snapshot.value, calculationOptions?.value)
  )
  return {
    baseResultCritical: computed(() => evaluation.value.baseResultCritical),
    baseResultWithoutCritical: computed(() => evaluation.value.baseResultWithoutCritical),
    expectedResult: computed(() => evaluation.value.expectedResult),
    evaluation,
  }
}
