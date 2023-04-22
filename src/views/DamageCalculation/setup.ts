import { storeToRefs } from 'pinia'
import { Ref, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useDamageCalculationStore } from '@/stores/views/damage-calculation'
import { setupCalculationExpectedResult } from '@/stores/views/damage-calculation/setup'

import {
  CalcItemContainer,
  CalcStructExpression,
  Calculation,
  CalculationContainerIds,
  CalculationItemIds,
} from '@/lib/Damage/DamageCalculation'

import Notify from '@/setup/Notify'

import { calcStructDisplay, calcStructDisplayCritical } from './consts'

interface CalcModeItem {
  id: 'common' | 'critical'
  calcStruct: CalcStructExpression
  outsideItems: CalculationContainerIds[]
  maxLayer: number
}

const setupCalcMode = () => {
  const calcModeList: CalcModeItem[] = [
    {
      id: 'common',
      calcStruct: calcStructDisplay,
      outsideItems: [CalculationContainerIds.BaseTwoHanded],
      maxLayer: 4,
    },
    {
      id: 'critical',
      calcStruct: calcStructDisplayCritical,
      outsideItems: [CalculationContainerIds.Critical_Accuracy_Stability],
      maxLayer: 6,
    },
  ]
  const currentCalcModeId = ref('common')
  const selectCalcMode = (id: string) => (currentCalcModeId.value = id)
  const calcMode = computed(
    () => calcModeList.find(item => item.id === currentCalcModeId.value)!
  )

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
    calculations: Ref<Calculation[]>
    currentCalculation: Ref<Calculation>
  } = storeToRefs(store)

  return {
    calculations,
    currentCalculation,
  }
}

const setupCalculationStore = () => {
  const store = useDamageCalculationStore()
  const { notify } = Notify()
  const { t } = useI18n()

  const { calculations, currentCalculation } = setupCalculationStoreState()

  const removeCurrentCalculation = () => {
    if (calculations.value.length === 1) {
      notify(t('damage-calculation.tips.at-least-one-build'))
      return
    }
    const calculation = currentCalculation.value
    store.removeCalculation(calculation)
    notify(
      t('damage-calculation.tips.removed-build-success', {
        name: calculation.name,
      }),
      {
        buttons: [
          {
            text: t('global.recovery'),
            removeMessageAfterClick: true,
            click: () => store.appendCalculation(calculation),
          },
        ],
      }
    )
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
  const { baseResultCritical, baseResultWithoutCritical, expectedResult } =
    setupCalculationExpectedResult(calculation)

  const getStability = () =>
    calculation.value.containers
      .get(CalculationContainerIds.Stability)!
      .getItemValue(CalculationItemIds.Stability)

  const expectedResultMax = computed(() => Math.floor(baseResultCritical.value))
  const expectedResultMin = computed(() =>
    Math.floor((baseResultWithoutCritical.value * getStability()) / 100)
  )
  const expectedResultGrazeMin = computed(() =>
    Math.floor((baseResultWithoutCritical.value * getStability()) / 200)
  )

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
  id: Id
  icon: string
  value: Id extends ResultModeIdExpected
    ? number
    : {
        min: number
        max: number
      }
}

const setupResultMode = (calculation: Ref<Calculation>) => {
  const { expectedResult, stabilityResult, stabilityResultGraze } =
    setupExpectedResults(calculation)

  const resultModeId = ref<ResultModeId>('expected')

  const selectResultMode = (modeId: ResultModeId) => {
    resultModeId.value = modeId
  }

  const resultModeList = computed<ResultModeItem[]>(() => {
    return [
      {
        id: 'stability',
        icon: 'tabler:angle',
        value: stabilityResult.value,
      },
      {
        id: 'stability-with-graze',
        icon: 'tabler:angle',
        value: stabilityResultGraze.value,
      },
      {
        id: 'expected',
        icon: 'ant-design:star-outlined',
        value: expectedResult.value,
      },
    ]
  })
  const resultMode = computed(
    () => resultModeList.value.find(item => item.id === resultModeId.value)!
  )

  return {
    resultMode,
    resultModeList,
    selectResultMode,
  }
}

const setupCalculationCalcOptions = (calculation: Ref<Calculation>) => {
  const options = [
    {
      containerId: CalculationContainerIds.DamageType,
    },
  ]

  const calculationContainerOptions = computed(() => {
    return options.map(item => {
      const container = calculation.value.containers.get(
        item.containerId
      ) as CalcItemContainer
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
}

export type {
  ResultModeIdStability,
  ResultModeIdExpected,
  ResultModeItem,
  CalcModeItem,
}
