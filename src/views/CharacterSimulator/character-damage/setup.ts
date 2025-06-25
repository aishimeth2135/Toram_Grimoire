import { type Ref, computed } from 'vue'

import { useCharacterStore } from '@/stores/views/character'
import { type SkillResult } from '@/stores/views/character/setup'

import { isNumberString } from '@/shared/utils/string'

import { StatRecorded } from '@/lib/Character/Stat'

import DisplayDataContainer from '@/views/SkillQuery/skill/branch-handlers/handle/DisplayDataContainer'

export function getContainerStats(
  store: ReturnType<typeof useCharacterStore>,
  container: DisplayDataContainer
) {
  const stats: StatRecorded[] = []
  if (!store.getDamageCalculationSkillBranchState(container.branchItem.default)?.enabled) {
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
  extraStats: Ref<StatRecorded[]>,
  { armorBreak = false } = {}
) {
  const store = useCharacterStore()

  return store.setupDamageCalculationExpectedResult(
    result,
    extraStats,
    armorBreak
      ? computed(() => ({
          ...store.targetProperties,
          def: Math.floor(store.targetProperties.def / 2),
          mdef: Math.floor(store.targetProperties.mdef / 2),
        }))
      : computed(() => store.targetProperties),
    computed(() => store.calculationOptions)
  )
}
