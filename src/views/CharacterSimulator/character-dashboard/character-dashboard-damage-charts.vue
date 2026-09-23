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
import { useCharacterSkillBuildStore } from '@/stores/views/character/skill-build'

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
  '--app-violet-60',
  '--app-blue-60',
  '--app-red-60',
  '--app-orange-60',
  '--app-emerald-60',
  '--app-cyan-60',
  '--app-fuchsia-60',
  '--app-primary-60',
]
const fallbackLineColors = [
  '#7c3aed',
  '#2563eb',
  '#dc2626',
  '#ea580c',
  '#059669',
  '#0891b2',
  '#c026d3',
  '#4f46e5',
]

const { t } = useI18n()
const settingStore = useSettingStore()
const characterStore = useCharacterStore()
const skillBuildStore = useCharacterSkillBuildStore()
const { appNightMode } = storeToRefs(settingStore)

const currentTab = ref<ChartTab>(ChartTabs.Low)
const damageSkillLines = shallowRef<DamageSkillLine[]>([])
const lineColors = shallowRef(fallbackLineColors)

const updateChartColors = () => {
  const styles = getComputedStyle(document.documentElement)
  lineColors.value = chartColorVariables.map(
    (variable, index) => styles.getPropertyValue(variable).trim() || fallbackLineColors[index]
  )
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
  const skillBuild = skillBuildStore.currentSkillBuild
  if (!skillBuild) {
    return []
  }

  return characterStore.damageSkillResultStates.flatMap(state => {
    if (
      skillBuild.getSkillLevel(state.skill) === 0 ||
      !characterStore.isDamageCalculationSkillEnabled(state.skill)
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
    enabled: computed(() =>
      characterStore.isDamageCalculationSkillBranchEnabled(resultRef.value.container.branchItem)
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
        color: lineColors.value[index % lineColors.value.length],
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
    default-hidden
  >
    <div class="px-4">
      <cy-tabs v-model="currentTab">
        <cy-tab v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.text }}
        </cy-tab>
      </cy-tabs>
    </div>
    <div class="border-primary-10 border-t p-4">
      <template v-if="damageChartSeries.length > 0">
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
              :style="{ backgroundColor: series.color }"
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
      </template>
      <cy-default-tips v-else>
        {{ t('character-simulator.character-dashboard.damage-chart.no-data') }}
      </cy-default-tips>
    </div>
  </CharacterDashboardSection>
</template>
