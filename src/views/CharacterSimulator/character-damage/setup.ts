import { computed } from '@vue/reactivity'
import { Ref } from 'vue'

import { SkillResult } from '@/stores/views/character/setup'

import { isNumberString } from '@/shared/utils/string'

import { Stat } from '@/lib/Character/Stat'

import { setupCharacterStore } from '../setup'

export function setupSkilResultExtraStats(result: Ref<SkillResult>) {
  const { store } = setupCharacterStore()
  const extraStats = computed(() => {
    const stats: Stat[] = []
    result.value.suffixContainers.forEach(sufContainer => {
      if (!store.getDamageCalculationSkillBranchState(sufContainer.branchItem.default)?.enabled) {
        return
      }
      sufContainer.statContainers.forEach(statContainer => {
        if (isNumberString(statContainer.value)) {
          stats.push(statContainer.stat.toStat(parseFloat(statContainer.value)))
        }
      })
    })
    return stats
  })

  return { extraStats }
}

export function setupStoreDamageCalculationExpectedResult(result: Ref<SkillResult>, extraStats: Ref<Stat[]>, { armorBreak = false } = {}) {
  const { store } = setupCharacterStore()

  return store.setupDamageCalculationExpectedResult(
    result,
    extraStats,
    armorBreak ?
      computed(() => ({
        ...store.targetProperties,
        def: Math.floor(store.targetProperties.def / 2),
        mdef: Math.floor(store.targetProperties.mdef / 2),
      })) :
      computed(() => store.targetProperties),
    computed(() => store.calculationOptions),
  )
}
