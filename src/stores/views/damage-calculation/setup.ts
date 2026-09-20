import { type Ref, computed } from 'vue'

import {
  type CalcResultOptions,
  Calculation,
  type CalculationBase,
  CalculationContainerIds,
  CalculationItemIds,
  type CalculationSnapshot,
} from '@/lib/Damage/DamageCalculation'

import { calcStructCritical, calcStructWithoutCritical } from './consts'

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

export function evaluateCalculationExpectedResult(
  calculationBase: CalculationBase,
  snapshot: CalculationSnapshot,
  calculationOptions?: CalcResultOptions
) {
  const evaluateContainer = (containerId: CalculationContainerIds) => {
    const result = calculationBase.evaluate(snapshot, containerId, calculationOptions)
    return result.containerResults.get(containerId) ?? 0
  }

  const stability = snapshot.itemValues.get(CalculationItemIds.Stability) ?? 0
  const stabilityExpected = evaluateContainer(CalculationContainerIds.Stability)
  const criticalRate = evaluateContainer(CalculationContainerIds.CriticalRate)
  const accuracy = evaluateContainer(CalculationContainerIds.Accuracy)
  const promisedAccuracyRate = snapshot.itemValues.get(CalculationItemIds.PromisedAccuracyRate) ?? 0
  const grazeStability = Math.floor(stability / 2)

  const criticalEvaluation = calculationBase.evaluate(
    snapshot,
    calcStructCritical,
    calculationOptions
  )
  const criticalAccuracyExpected =
    stabilityExpected * accuracy + ((grazeStability + 100) / 2) * (100 - accuracy)
  const criticalRateMultiplier = (criticalAccuracyExpected * criticalRate) / 1000000

  const nonCriticalEvaluation = calculationBase.evaluate(
    snapshot,
    calcStructWithoutCritical,
    calculationOptions
  )
  const nonCriticalAccuracyExpected =
    stabilityExpected * accuracy +
    ((grazeStability + 100) / 2) * Math.max(0, promisedAccuracyRate - accuracy)
  const nonCriticalRateMultiplier = (nonCriticalAccuracyExpected * (100 - criticalRate)) / 1000000

  return {
    baseResultCritical: criticalEvaluation.value,
    baseResultWithoutCritical: nonCriticalEvaluation.value,
    expectedResult: Math.floor(
      criticalEvaluation.value * criticalRateMultiplier +
        nonCriticalEvaluation.value * nonCriticalRateMultiplier
    ),
    criticalEvaluation,
    nonCriticalEvaluation,
  }
}
