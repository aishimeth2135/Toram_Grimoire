import { type Ref, computed, effectScope, onScopeDispose, shallowRef, watch } from 'vue'

import { useCharacterStore } from '@/stores/views/character'
import { type SkillResult } from '@/stores/views/character/setup'
import { useCharacterSkillBuildStore } from '@/stores/views/character/skill-build'

import { isNumberString } from '@/shared/utils/string'

import { StatRecorded } from '@/lib/Character/Stat'
import {
  computeDamageSourceAmount,
  getDamageSource,
  matchesDamageSource,
} from '@/lib/Skill/SkillComputing'
import { DisplayDataContainer } from '@/lib/Skill/SkillDisplay'

export function getContainerStats(
  store: ReturnType<typeof useCharacterStore>,
  container: DisplayDataContainer
) {
  const stats: StatRecorded[] = []
  if (!store.isDamageCalculationSkillBranchEnabled(container.branchItem)) {
    return stats
  }
  container.statContainers.forEach(statContainer => {
    if (isNumberString(statContainer.value)) {
      stats.push(statContainer.toStatRecorded(parseFloat(statContainer.value)))
    }
  })
  return stats
}

export function setupSkilResultExtraStats(result: Ref<SkillResult>) {
  const store = useCharacterStore()

  const extraStats = computed(() => {
    const stats: StatRecorded[] = []
    result.value.suffixContainers.forEach(sufContainer => {
      stats.push(...getContainerStats(store, sufContainer))
    })
    return stats
  })

  return { extraStats }
}

export function setupStoreDamageCalculationExpectedResult(
  result: Ref<SkillResult>,
  extraStats: Ref<StatRecorded[]>
) {
  const store = useCharacterStore()

  return store.setupDamageCalculationExpectedResult(
    result,
    extraStats,
    computed(() => store.targetProperties),
    computed(() => store.calculationOptions)
  )
}

export function setupDamageSourceBonuses(target: Ref<SkillResult>) {
  const store = useCharacterStore()
  const skillBuildStore = useCharacterSkillBuildStore()
  interface SourceCalculator {
    result: SkillResult
    valid: Ref<boolean>
    expectedResult: Ref<number>
  }
  const calculators = shallowRef<SourceCalculator[]>([])
  const sources = computed<SkillResult[]>(() =>
    store.damageSkillResultStates.flatMap(state => {
      if (
        !skillBuildStore.currentSkillBuild?.getSkillLevel(state.skill) ||
        !store.isDamageCalculationSkillEnabled(state.skill)
      ) {
        return []
      }
      return state.results.filter(
        result =>
          store.isDamageCalculationSkillBranchEnabled(result.container.branchItem) &&
          matchesDamageSource(
            result.container.branchItem,
            target.value.container.branchItem,
            target.value.root.skill.skillId
          )
      )
    })
  )
  let scope = effectScope()
  watch(
    sources,
    results => {
      scope.stop()
      scope = effectScope()
      calculators.value = scope.run(() =>
        results.map(result => {
          const resultRef = shallowRef<SkillResult>(result)
          const { extraStats } = setupSkilResultExtraStats(resultRef)
          const { valid, expectedResult } = setupStoreDamageCalculationExpectedResult(
            resultRef,
            extraStats
          )
          return { result, valid, expectedResult }
        })
      )!
    },
    { immediate: true }
  )
  onScopeDispose(() => scope.stop())

  return computed<{ id: SkillResult['container']['instanceId']; name: string; amount: number }[]>(
    () => {
      if (!store.isDamageCalculationSkillBranchEnabled(target.value.container.branchItem)) {
        return []
      }
      return calculators.value
        .filter(source => source.valid.value)
        .map(source => ({
          id: source.result.container.instanceId,
          name: source.result.container.branchItem.hasProp('name')
            ? source.result.container.branchItem.prop('name')
            : source.result.container.get('name'),
          amount: computeDamageSourceAmount(
            getDamageSource(source.result.container.branchItem)!,
            source.expectedResult.value,
            target.value.container.getValueSum('frequency')
          ),
        }))
    }
  )
}
