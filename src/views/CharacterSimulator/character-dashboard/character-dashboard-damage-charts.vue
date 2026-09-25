<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import {
  type EffectScope,
  type Ref,
  computed,
  effectScope,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { useI18n } from 'vue-i18n'

import { useSettingStore } from '@/stores/app/setting'
import { useCharacterStore } from '@/stores/views/character'
import type { SkillResult } from '@/stores/views/character/setup'

import type { InstanceId } from '@/shared/services/InstanceId'

import { CalculationItemIds, type CalculationSweepDimension } from '@/lib/Damage/DamageCalculation'
import {
  computeDamageSourceAmount,
  getDamageSource,
  matchesDamageSource,
} from '@/lib/Skill/SkillComputing'

import CharacterDashboardDamageChart from './character-dashboard-damage-chart.vue'
import CharacterDashboardDamageRatioChart from './character-dashboard-damage-ratio-chart.vue'
import CharacterDashboardSection from './character-dashboard-section.vue'

import { setupSkilResultExtraStats } from '../character-damage/setup'
import type { DamageChartSeries } from './character-dashboard-damage-chart-types'

interface DamageResultValues {
  result: Ref<SkillResult>
  enabled: Ref<boolean>
  valid: Ref<boolean>
  values: Ref<readonly number[]>
}

interface DamageSkillLine {
  label: string
  results: DamageResultValues[]
}

interface DamageResultCalculator {
  result: Ref<SkillResult>
  scope: EffectScope
  values: DamageResultValues
}

interface SelectedSkillResults {
  label: string
  results: SkillResult[]
}

const ChartTabs = {
  Low: 0,
  Medium: 2000,
  High: 4000,
} as const
type ChartTab = (typeof ChartTabs)[keyof typeof ChartTabs]

const SAMPLE_COUNT = 6
const RESISTANCE_MAX = 30
const DEFENSE_RANGE = 2000

const chartColorVariables = [
  { borderColor: '--app-violet-60', backgroundColor: '--app-violet-30' },
  { borderColor: '--app-blue-60', backgroundColor: '--app-blue-30' },
  { borderColor: '--app-red-60', backgroundColor: '--app-red-30' },
  { borderColor: '--app-orange-60', backgroundColor: '--app-orange-30' },
  { borderColor: '--app-emerald-60', backgroundColor: '--app-emerald-30' },
  { borderColor: '--app-cyan-60', backgroundColor: '--app-cyan-30' },
  { borderColor: '--app-fuchsia-60', backgroundColor: '--app-fuchsia-30' },
  { borderColor: '--app-primary-60', backgroundColor: '--app-primary-30' },
]
const fallbackChartColors = [
  { borderColor: '#7c3aed', backgroundColor: '#c4b4ff' },
  { borderColor: '#2563eb', backgroundColor: '#8ec5ff' },
  { borderColor: '#dc2626', backgroundColor: '#ffa1ad' },
  { borderColor: '#ea580c', backgroundColor: '#ffd230' },
  { borderColor: '#059669', backgroundColor: '#5ee9b5' },
  { borderColor: '#0891b2', backgroundColor: '#53eafd' },
  { borderColor: '#c026d3', backgroundColor: '#f4a8ff' },
  { borderColor: '#4f46e5', backgroundColor: '#ffa3c2' },
]

const { t } = useI18n()
const settingStore = useSettingStore()
const characterStore = useCharacterStore()
const { appNightMode } = storeToRefs(settingStore)

const currentTab = ref<ChartTab>(ChartTabs.Low)
const damageSkillLines = shallowRef<DamageSkillLine[]>([])
const chartColors = shallowRef(fallbackChartColors)

const updateChartColors = () => {
  const styles = getComputedStyle(document.documentElement)
  chartColors.value = chartColorVariables.map((variables, index) => ({
    borderColor:
      styles.getPropertyValue(variables.borderColor).trim() ||
      fallbackChartColors[index].borderColor,
    backgroundColor:
      styles.getPropertyValue(variables.backgroundColor).trim() ||
      fallbackChartColors[index].backgroundColor,
  }))
}

watch(appNightMode, updateChartColors, { immediate: true, flush: 'post' })

const tabs = computed(() => [
  {
    value: ChartTabs.Low,
    text: t('character-simulator.character-dashboard.damage-chart.tabs.low'),
  },
  {
    value: ChartTabs.Medium,
    text: t('character-simulator.character-dashboard.damage-chart.tabs.medium'),
  },
  {
    value: ChartTabs.High,
    text: t('character-simulator.character-dashboard.damage-chart.tabs.high'),
  },
])

const selectedSkillResults = computed<SelectedSkillResults[]>(() => {
  const skillBuild = characterStore.currentCharacterState.skillBuild
  if (!skillBuild) {
    return []
  }

  return characterStore.damageSkillResultStates.flatMap(state => {
    if (
      skillBuild.getSkillLevel(state.skill) === 0 ||
      !skillBuild.isDamageCalculationSkillEnabled(state.skill)
    ) {
      return []
    }
    return [{ label: state.skill.name, results: state.results }]
  })
})

const resistanceValues = Array.from(
  { length: SAMPLE_COUNT },
  (_value, index) => (RESISTANCE_MAX * index) / (SAMPLE_COUNT - 1)
)

const defenseValues = computed(() =>
  Array.from(
    { length: SAMPLE_COUNT },
    (_value, index) => currentTab.value + (DEFENSE_RANGE * index) / (SAMPLE_COUNT - 1)
  )
)

const targetProperties = computed(() => characterStore.targetProperties)
const calculationOptions = computed(() => characterStore.calculationOptions)
const sweepDimensions = computed<readonly CalculationSweepDimension[]>(() => [
  {
    itemId: CalculationItemIds.TargetPhysicalResistance,
    values: resistanceValues,
  },
  {
    itemId: CalculationItemIds.TargetMagicResistance,
    values: resistanceValues,
  },
  {
    itemId: CalculationItemIds.TargetDef,
    values: defenseValues.value,
  },
  {
    itemId: CalculationItemIds.TargetMdef,
    values: defenseValues.value,
  },
])

const damageChartTips = computed(() =>
  t('character-simulator.character-dashboard.damage-chart.tips', {
    min: defenseValues.value[0],
    max: defenseValues.value[defenseValues.value.length - 1],
  })
)

const calculators = new Map<InstanceId, DamageResultCalculator>()

const setupDamageResultValues = (resultRef: Ref<SkillResult>): DamageResultValues => {
  const { extraStats } = setupSkilResultExtraStats(resultRef)
  const calculator = characterStore.setupDamageCalculationExpectedResultSweep(
    resultRef,
    extraStats,
    targetProperties,
    calculationOptions,
    sweepDimensions
  )

  return {
    result: resultRef,
    enabled: computed(
      () =>
        characterStore.currentCharacterState.skillBuild?.getSkillBranchState(
          resultRef.value.container.branchItem
        ).enabled ?? false
    ),
    valid: calculator.valid,
    values: calculator.expectedResults,
  }
}

watch(
  selectedSkillResults,
  skills => {
    const unusedIds = new Set(calculators.keys())
    damageSkillLines.value = skills.map(skill => ({
      label: skill.label,
      results: skill.results.map(result => {
        const id = result.container.branchItem.instanceId
        unusedIds.delete(id)
        const existing = calculators.get(id)
        if (existing) {
          existing.result.value = result
          return existing.values
        }

        const resultRef = shallowRef<SkillResult>(result)
        const scope = effectScope(true)
        const values = scope.run(() => setupDamageResultValues(resultRef))!
        calculators.set(id, { result: resultRef, scope, values })
        return values
      }),
    }))
    unusedIds.forEach(id => {
      calculators.get(id)!.scope.stop()
      calculators.delete(id)
    })
  },
  { immediate: true }
)

const damageChartSeries = computed<DamageChartSeries[]>(() =>
  damageSkillLines.value.flatMap((line, index) => {
    const selectedResults = line.results.filter(
      result => result.enabled.value && !getDamageSource(result.result.value.container.branchItem)
    )
    if (selectedResults.length === 0 || selectedResults.some(result => !result.valid.value)) {
      return []
    }

    return [
      {
        label: line.label,
        ...chartColors.value[index % chartColors.value.length],
        values: resistanceValues.map((_resistance, pointIndex) =>
          selectedResults.reduce((sum, result) => {
            const target = result.result.value
            const additional = damageSkillLines.value
              .flatMap(item => item.results)
              .reduce((total, source) => {
                const branch = source.result.value.container.branchItem
                if (
                  !source.enabled.value ||
                  !source.valid.value ||
                  !matchesDamageSource(
                    branch,
                    target.container.branchItem,
                    target.root.skill.skillId
                  )
                ) {
                  return total
                }
                return (
                  total +
                  computeDamageSourceAmount(
                    getDamageSource(branch)!,
                    source.values.value[pointIndex] ?? 0,
                    target.container.getValueSum('frequency')
                  )
                )
              }, 0)
            return sum + (result.values.value[pointIndex] ?? 0) + additional
          }, 0)
        ),
      },
    ]
  })
)

onBeforeUnmount(() => {
  calculators.forEach(calculator => calculator.scope.stop())
  calculators.clear()
})
</script>

<template>
  <CharacterDashboardSection
    :title="t('character-simulator.character-dashboard.damage-chart.title')"
    title-icon="ic:baseline-insert-chart-outlined"
    default-hidden
  >
    <template v-if="damageChartSeries.length > 0">
      <div class="px-4">
        <cy-tabs v-model="currentTab">
          <cy-tab v-for="tab in tabs" :key="tab.value" :value="tab.value">
            {{ tab.text }}
          </cy-tab>
        </cy-tabs>
      </div>
      <div class="border-primary-10 border-t p-4">
        <div class="gap-icon text-primary-30 mb-3 inline-flex items-start px-2 text-sm">
          <cy-icon icon="ic-outline-info" small class="icon-first-line text-primary-30" />
          {{ damageChartTips }}
        </div>
        <ul class="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 px-2 text-sm">
          <li
            v-for="(series, index) in damageChartSeries"
            :key="`${series.label}-${index}`"
            class="flex items-center gap-2"
          >
            <span
              class="h-1 w-6 rounded-full"
              :style="{ backgroundColor: series.borderColor }"
              aria-hidden="true"
            ></span>
            <span class="text-primary-70">{{ series.label }}</span>
          </li>
        </ul>
        <div class="wd:flex-row flex flex-col gap-6">
          <div class="wd:min-w-0 wd:flex-[3_1_0%] w-full">
            <div class="border-primary-10 text-primary-60 mb-3 border-b px-2 pb-1 text-sm">
              {{ t('character-simulator.character-dashboard.damage-chart.damage-title') }}
            </div>
            <CharacterDashboardDamageChart
              :series="damageChartSeries"
              :resistance-values="resistanceValues"
              :defense-values="defenseValues"
              :x-axis-title="t('character-simulator.character-dashboard.damage-chart.x-axis-title')"
              :y-axis-title="t('character-simulator.character-dashboard.damage-chart.y-axis-title')"
            />
          </div>
          <div class="wd:min-w-0 wd:flex-[2_1_0%] w-full">
            <div class="border-primary-10 text-primary-60 mb-3 border-b px-2 pb-1 text-sm">
              {{ t('character-simulator.character-dashboard.damage-chart.comparison-title') }}
            </div>
            <CharacterDashboardDamageRatioChart :series="damageChartSeries" />
          </div>
        </div>
      </div>
    </template>
    <div v-else class="text-red-40 px-6 py-5 text-sm">
      {{ t('character-simulator.character-dashboard.damage-chart.no-skill-tips') }}
    </div>
  </CharacterDashboardSection>
</template>
