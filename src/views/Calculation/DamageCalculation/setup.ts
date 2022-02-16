import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useDamageCalculationStore } from '@/stores/views/damage-calculation'

import { CalcItemContainer, Calculation } from '@/lib/Calculation/Damage/Calculation'
import { CalcStructExpression } from '@/lib/Calculation/Damage/Calculation/base'
import { CalculationContainerIds, CalculationItemIds } from '@/lib/Calculation/Damage/Calculation/enums'

import Notify from '@/setup/Notify'
import RegisterLang from '@/setup/RegisterLang'

import { calcStructDisplay, calcStructCritical, calcStructWithoutCritical } from './consts'

interface CalcModeItem {
  id: 'common' | 'critical';
  calcStruct: CalcStructExpression;
  outsideItems: CalculationContainerIds[];
  maxLayer: number;
}

const setupCalcMode = () => {
  const calcModeList: CalcModeItem[] = [{
    id: 'common',
    calcStruct: calcStructDisplay,
    outsideItems: [CalculationContainerIds.AtkTwoHanded],
    maxLayer: 4,
  }, {
    id: 'critical',
    calcStruct: calcStructCritical,
    outsideItems: [CalculationContainerIds.Critical_Accuracy_Stability],
    maxLayer: 6,
  }]
  const currentCalcModeId = ref('common')
  const selectCalcMode = (id: string) => currentCalcModeId.value = id
  const calcMode = computed(() => calcModeList.find(item => item.id === currentCalcModeId.value)!)

  return {
    calcModeList,
    calcMode,
    selectCalcMode,
  }
}

const setupCalculationStoreState = () => {
  const store = useDamageCalculationStore()
  const {
    calculations,
    currentCalculation,
  }: {
    calculations: Ref<Calculation[]>;
    currentCalculation: Ref<Calculation>;
  } = storeToRefs(store)

  return {
    calculations,
    currentCalculation,
  }
}

const setupCalculationStore = () => {
  const store = useDamageCalculationStore()
  const { lang, rootLang } = RegisterLang('Damage Calculation')
  const { notify } = Notify()

  const { calculations, currentCalculation } = setupCalculationStoreState()

  const removeCurrentCalculation = () => {
    if (calculations.value.length === 1) {
      notify(lang('tips/At least one build must be kept'))
      return
    }
    const calculation = currentCalculation.value
    store.removeCalculation(calculation)
    notify(lang('tips/Successfully removed build', [calculation.name]), {
      buttons: [{
        text: rootLang('global/recovery'),
        removeMessageAfterClick: true,
        click: () => store.appendCalculation(calculation),
      }],
    })
  }

  const copyCurrentCalculation = () => {
    const calculation = currentCalculation.value.clone()
    store.appendCalculation(calculation)
  }

  const calculationItems = computed(() => {
    return calculations.value.map((calc, index) => ({
      index,
      origin: calc,
    }))
  })

  return {
    calculations,
    currentCalculation,
    calculationItems,

    removeCurrentCalculation,
    copyCurrentCalculation,
  }
}

const setupExpectedResults = (calculation: Ref<Calculation>) => {
  const stabilityRef = computed(() => calculation.value.containers.get(CalculationContainerIds.Stability)!.result())
  const baseResultCritical = computed(() => calculation.value.result(calcStructCritical))
  const baseResultCriticalRate = computed(() => {
    const cr = calculation.value.containers.get(CalculationContainerIds.CriticalRate)!.result()
    const acContainer = calculation.value.containers.get(CalculationContainerIds.Accuracy)!
    const ac = acContainer.result()
    const stability = stabilityRef.value
    return ((stability + 100) / 2 * ac + (stability / 2 + 100) / 2 * (100 - ac)) * cr / 1000000
  })
  const baseResultWithoutCritical = computed(() => calculation.value.result(calcStructWithoutCritical))
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

  const expectedResultMax = computed(() => Math.floor(baseResultCritical.value))
  const expectedResultMin = computed(() => Math.floor(baseResultWithoutCritical.value * stabilityRef.value / 100))
  const expectedResultGrazeMin = computed(() => Math.floor(baseResultWithoutCritical.value * stabilityRef.value / 200))

  const expectedResult = computed(() => {
    return Math.floor(expectedResultCritical.value + expectedResultWithoutCritical.value)
  })

  const stabilityResult = computed(() => ({
    min: expectedResultMin.value,
    max: expectedResultMax.value,
  }))
  const stabilityResultGraze = computed(() => ({
    min: expectedResultGrazeMin.value,
    max: expectedResultMax.value,
  }))

  return {
    expectedResult,
    stabilityResult,
    stabilityResultGraze,
  }
}

type ResultModeIdStability = 'stability' | 'stability-with-graze'
type ResultModeIdExpected = 'expected'
type ResultModeId = ResultModeIdStability | ResultModeIdExpected
interface ResultModeItem<Id extends ResultModeId = ResultModeId> {
  id: Id;
  icon: string;
  value: Id extends ResultModeIdExpected ? number : {
    min: number;
    max: number;
  };
}

const setupResultMode = (calculation: Ref<Calculation>) => {
  const {
    expectedResult,
    stabilityResult,
    stabilityResultGraze,
  } = setupExpectedResults(calculation)

  const resultModeId = ref<ResultModeId>('expected')

  const selectResultMode = (modeId: ResultModeId) => {
    resultModeId.value = modeId
  }

  const resultModeList = computed<ResultModeItem[]>(() => {
    return [{
      id: 'stability',
      icon: 'tabler:angle',
      value: stabilityResult.value,
    }, {
      id: 'stability-with-graze',
      icon: 'tabler:angle',
      value: stabilityResultGraze.value,
    }, {
      id: 'expected',
      icon: 'ant-design:star-outlined',
      value: expectedResult.value,
    }]
  })
  const resultMode = computed(() => resultModeList.value.find(item => item.id === resultModeId.value)!)

  return {
    resultMode,
    resultModeList,
    selectResultMode,
  }
}

const setupCalculationCalcOptions = (calculation: Ref<Calculation>) => {
  const options = [{
    containerId: CalculationContainerIds.DamageType,
  }]

  const calculationContainerOptions = computed(() => {
    return options.map(item => {
      const container = calculation.value.containers.get(item.containerId) as CalcItemContainer
      return {
        container,
        containerItems: Array.from(container.items.values()),
      }
    })
  })

  return {
    calculationContainerOptions,
  }
}

export {
  setupCalcMode,
  setupCalculationStoreState,
  setupCalculationStore,
  setupExpectedResults,
  setupResultMode,
  setupCalculationCalcOptions,

  ResultModeIdStability,
  ResultModeIdExpected,
  ResultModeItem,
  CalcModeItem,
}
