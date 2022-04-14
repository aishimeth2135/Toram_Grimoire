
import { computed } from '@vue/reactivity'
import { Ref } from 'vue'

import { Calculation } from '@/lib/Calculation/Damage/Calculation'
import { CalculationContainerIds, CalculationItemIds } from '@/lib/Calculation/Damage/Calculation/enums'
import { CalcResultOptions } from '@/lib/Calculation/Damage/Calculation/base'

import { calcStructCritical, calcStructWithoutCritical } from './consts'

export function setupCalculationExpectedResult(calculation: Ref<Calculation>, calculationOptions?: Ref<CalcResultOptions>) {
  const stabilityRef = computed(() => calculation.value.containers.get(CalculationContainerIds.Stability)!.result())
  const baseResultCritical = computed(() => calculation.value.result(calcStructCritical, calculationOptions?.value))
  const baseResultCriticalRate = computed(() => {
    const cr = calculation.value.containers.get(CalculationContainerIds.CriticalRate)!.result()
    const acContainer = calculation.value.containers.get(CalculationContainerIds.Accuracy)!
    const ac = acContainer.result()
    const stability = stabilityRef.value
    return ((stability + 100) / 2 * ac + (stability / 2 + 100) / 2 * (100 - ac)) * cr / 1000000
  })
  const baseResultWithoutCritical = computed(() => calculation.value.result(calcStructWithoutCritical, calculationOptions?.value))
  const baseResultWithoutCriticalRate = computed(() => {
    const cr = calculation.value.containers.get(CalculationContainerIds.CriticalRate)!.result()
    const acContainer = calculation.value.containers.get(CalculationContainerIds.Accuracy)!
    const ac = acContainer.result()
    const pac = acContainer.getItemValue(CalculationItemIds.PromisedAccuracyRate)
    const stability = stabilityRef.value
    return ((stability + 100) / 2 * ac + (stability / 2 + 100) / 2 * Math.max(0, pac - ac)) * (100 - cr) / 1000000
  })
  const expectedResultCritical = computed(() => baseResultCritical.value * baseResultCriticalRate.value)
  const expectedResultWithoutCritical = computed(() => baseResultWithoutCritical.value * baseResultWithoutCriticalRate.value)

  const expectedResult = computed(() => {
    return Math.floor(expectedResultCritical.value + expectedResultWithoutCritical.value)
  })

  return {
    expectedResult,
  }
}
