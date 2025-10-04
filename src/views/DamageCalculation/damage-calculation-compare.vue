<template>
  <div v-if="calculationItems.length > 0" class="w-full">
    <div>
      <cy-button-action icon="bx:bx-git-compare" @click="toggleSelectCalculationVisible(true)">
        {{ t('damage-calculation.compare.select-build') }}
      </cy-button-action>
    </div>
    <div v-if="comparedCalculationItems.length > 0" class="space-y-2 pt-4">
      <DamageCalculationCompareItem
        v-for="item in comparedCalculationItems"
        :key="item.index"
        :calculation="item.origin"
      />
    </div>
    <div v-else class="px-2">
      <cy-default-tips icon="@potum">
        {{ t('damage-calculation.compare.introduction') }}
      </cy-default-tips>
    </div>
    <cy-modal
      :visible="selectCalculationVisible"
      footer
      @close="toggleSelectCalculationVisible(false)"
    >
      <template #title>
        <cy-icon-text icon="bx:bx-git-compare">
          {{ t('damage-calculation.compare.select-build') }}
        </cy-icon-text>
      </template>
      <cy-list-item
        v-for="item in calculationItems"
        :key="item.index"
        @click="toggleComparedCalculation(item.origin)"
      >
        <cy-button-check :selected="comparedCalculationItems.includes(item)" inline>
          {{ item.origin.name }}
        </cy-button-check>
      </cy-list-item>
    </cy-modal>
  </div>
  <cy-default-tips v-else icon="@potum">
    {{ t('damage-calculation.compare.at-least-two-builds-tips') }}
  </cy-default-tips>
</template>

<script lang="ts" setup>
import { type Ref, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToggle } from '@/shared/setup/State'

import { Calculation } from '@/lib/Damage/DamageCalculation'

import DamageCalculationCompareItem from './damage-calculation-compare-item.vue'

import { setupCalculationStoreState } from './setup'

const { currentCalculation: mainCalculation, calculations } = setupCalculationStoreState()

const calculationItems = computed(() => {
  return calculations.value
    .filter(calc => calc !== mainCalculation.value)
    .map((calc, index) => ({
      index,
      origin: calc,
    }))
})

const comparedCalculations: Ref<Calculation[]> = ref([])

const toggleComparedCalculation = (calc: Calculation) => {
  const calcs = comparedCalculations.value
  const idx = calcs.indexOf(calc)
  if (idx >= 0) {
    calcs.splice(idx, 1)
  } else {
    calcs.push(calc)
  }
}

watch(calculations, newValue => {
  comparedCalculations.value = comparedCalculations.value.filter(calc => newValue.includes(calc))
})

const comparedCalculationItems = computed(() => {
  return calculationItems.value.filter(calcItem =>
    comparedCalculations.value.includes(calcItem.origin)
  )
})

const selectCalculationVisible = ref(false)
const toggleSelectCalculationVisible = useToggle(selectCalculationVisible)

const { t } = useI18n()
</script>
