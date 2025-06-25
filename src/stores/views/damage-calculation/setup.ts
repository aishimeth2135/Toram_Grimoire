import { type Ref, computed } from 'vue'

import {
  type CalcResultOptions,
  Calculation,
  CalculationContainerIds,
  CalculationItemIds,
} from '@/lib/Damage/DamageCalculation'

import { calcStructCritical, calcStructWithoutCritical } from './consts'

export function setupCalculationExpectedResult(
  calculation: Ref<Calculation>,
  calculationOptions?: Ref<CalcResultOptions>
) {
  const getStability = () =>
    calculation.value.containers
      .get(CalculationContainerIds.Stability)!
      .getItemValue(CalculationItemIds.Stability)
  const getStabilityExpected = () =>
    calculation.value.containers.get(CalculationContainerIds.Stability)!.result()

  const baseResultCritical = computed(() =>
    calculation.value.result(calcStructCritical, calculationOptions?.value)
  )
  const baseResultRateCritical = computed(() => {
    const cr = calculation.value.containers.get(CalculationContainerIds.CriticalRate)!.result()
    const acContainer = calculation.value.containers.get(CalculationContainerIds.Accuracy)!
    const ac = acContainer.result()
    const grazeStability = Math.floor(getStability() / 2)
    const acExpected = getStabilityExpected() * ac + ((grazeStability + 100) / 2) * (100 - ac)
    return (acExpected * cr) / 1000000
  })
  const baseResultWithoutCritical = computed(() =>
    calculation.value.result(calcStructWithoutCritical, calculationOptions?.value)
  )
  const baseResultRateWithoutCritical = computed(() => {
    const cr = calculation.value.containers.get(CalculationContainerIds.CriticalRate)!.result()
    const acContainer = calculation.value.containers.get(CalculationContainerIds.Accuracy)!
    const ac = acContainer.result()
    const pac = acContainer.getItemValue(CalculationItemIds.PromisedAccuracyRate)
    const grazeStability = Math.floor(getStability() / 2)
    const acExpected =
      getStabilityExpected() * ac + ((grazeStability + 100) / 2) * Math.max(0, pac - ac)
    return (acExpected * (100 - cr)) / 1000000
  })

  const expectedResult = computed(() => {
    const expectedResultCritical = baseResultCritical.value * baseResultRateCritical.value
    const expectedResultWithoutCritical =
      baseResultWithoutCritical.value * baseResultRateWithoutCritical.value
    return Math.floor(expectedResultCritical + expectedResultWithoutCritical)
  })

  return {
    baseResultCritical,
    baseResultWithoutCritical,

    expectedResult,
  }
}
