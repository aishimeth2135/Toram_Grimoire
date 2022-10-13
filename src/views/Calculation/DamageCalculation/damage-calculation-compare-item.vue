<template>
  <div class="border-t border-primary-30 p-2">
    <div class="mb-1 text-sm text-fuchsia-60">{{ calculation.name }}</div>
    <div class="flex items-center">
      <cy-icon-text icon="ant-design:star-outlined">
        {{ t('damage-calculation.result.modes.expected') }}
      </cy-icon-text>
      <span class="ml-2 mr-4 text-primary-50">{{ expectedResult }}</span>
      <div
        :class="
          calculationResultDifferenceRate >= 0 ? 'text-blue-60' : 'text-red-60'
        "
      >
        {{ calculationResultDifferenceRateDisplay }}
      </div>
    </div>
    <div class="mt-2 space-y-1 px-2">
      <div
        v-for="comparedItem in comparedItems"
        :key="comparedItem.item.base.id"
        class="flex items-center"
      >
        <cy-icon-text class="mr-2" small>
          <span
            v-html="
              markText(
                t(
                  'damage-calculation.item-base-titles.' +
                    comparedItem.item.base.id
                )
              )
            "
          ></span>
        </cy-icon-text>
        <span
          :class="comparedItem.value >= 0 ? 'text-blue-60' : 'text-red-60'"
          class="text-sm"
        >
          {{
            (comparedItem.value > 0 ? '+' : '') +
            comparedItem.value +
            comparedItem.item.base.unit
          }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { numberToFixed } from '@/shared/utils/number'
import { markText } from '@/shared/utils/view'

import { CalcItem, Calculation } from '@/lib/Calculation/Damage/Calculation'

import { DamageCalculationRootInjectionKey } from './injection-keys'
import { setupCalculationStoreState, setupExpectedResults } from './setup'

interface Props {
  calculation: Calculation
}

const props = defineProps<Props>()
const { calculation } = toRefs(props)

const { t } = useI18n()

const { currentCalculation: comparedCalculation } = setupCalculationStoreState()

const { expectedResult } = setupExpectedResults(calculation)

const { currentExpectedResult: comparedCalculationExpectedResult } = inject(
  DamageCalculationRootInjectionKey
)!

const calculationResultDifferenceRate = computed(() => {
  const comparedResult = comparedCalculationExpectedResult.value
  if (comparedResult < 1) {
    return 1000
  }
  return numberToFixed(
    ((expectedResult.value - comparedResult) * 100) / comparedResult,
    1
  )
})

const calculationResultDifferenceRateDisplay = computed(() => {
  if (calculationResultDifferenceRate.value > 999) {
    return '+999~%'
  }
  const sign = calculationResultDifferenceRate.value >= 0 ? '+' : ''
  return sign + calculationResultDifferenceRate.value + '%'
})

const comparedItems = computed(() => {
  const result: { item: CalcItem; value: number }[] = []
  Array.from(calculation.value.containers.values()).forEach(container => {
    const comparedContainer = comparedCalculation.value.containers.get(
      container.base.id
    )!
    if (container.selectable) {
      result.push({
        item: container.currentItem,
        value:
          container.currentItem.value - comparedContainer.currentItem.value,
      })
    } else {
      Array.from(container.items.values()).forEach(item => {
        if (result.find(resItem => resItem.item.base.id === item.base.id)) {
          return
        }
        const comparedItem = comparedContainer.items.get(item.base.id)!
        result.push({
          item,
          value: container.customItemAddable
            ? container.result() - comparedContainer.result()
            : item.value - comparedItem.value,
        })
      })
    }
  })
  return result.filter(item => item.value !== 0)
})
</script>
