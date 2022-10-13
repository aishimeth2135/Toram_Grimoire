import { computed } from 'vue'
import { Ref } from 'vue'

import { Calculation } from '@/lib/Calculation/Damage/Calculation'
import { CalcResultOptions } from '@/lib/Calculation/Damage/Calculation/base'
import {
  CalculationContainerIds,
  CalculationItemIds,
} from '@/lib/Calculation/Damage/Calculation/enums'

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
    calculation.value.containers
      .get(CalculationContainerIds.Stability)!
      .result()

  const baseResultCritical = computed(() =>
    calculation.value.result(calcStructCritical, calculationOptions?.value)
  )
  const baseResultCriticalRate = computed(() => {
    const cr = calculation.value.containers
      .get(CalculationContainerIds.CriticalRate)!
      .result()
    const acContainer = calculation.value.containers.get(
      CalculationContainerIds.Accuracy
    )!
    const ac = acContainer.result()
    const grazeStability = Math.floor(getStability() / 2)
    return (
      ((getStabilityExpected() * ac +
        ((grazeStability + 100) / 2) * (100 - ac)) *
        cr) /
      1000000
    )
  })
  const baseResultWithoutCritical = computed(() =>
    calculation.value.result(
      calcStructWithoutCritical,
      calculationOptions?.value
    )
  )
  const baseResultWithoutCriticalRate = computed(() => {
    const cr = calculation.value.containers
      .get(CalculationContainerIds.CriticalRate)!
      .result()
    const acContainer = calculation.value.containers.get(
      CalculationContainerIds.Accuracy
    )!
    const ac = acContainer.result()
    const pac = acContainer.getItemValue(
      CalculationItemIds.PromisedAccuracyRate
    )
    const grazeStability = Math.floor(getStability() / 2)
    return (
      ((getStabilityExpected() * ac +
        ((grazeStability + 100) / 2) * Math.max(0, pac - ac)) *
        (100 - cr)) /
      1000000
    )
  })

  const expectedResult = computed(() => {
    const expectedResultCritical =
      baseResultCritical.value * baseResultCriticalRate.value
    const expectedResultWithoutCritical =
      baseResultWithoutCritical.value * baseResultWithoutCriticalRate.value
    return Math.floor(expectedResultCritical + expectedResultWithoutCritical)
  })

  return {
    baseResultCritical,
    baseResultWithoutCritical,

    expectedResult,
  }
}
