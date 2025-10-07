import { type ComputedRef, type Ref, computed, ref, watch } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { Character, CharacterStat, type CharacterStatResult } from '@/lib/Character/Character'
import { StatRecorded, StatRestriction } from '@/lib/Character/Stat'
import { Skill } from '@/lib/Skill/Skill'

import { checkStatRestriction } from '../utils'
import {
  type CharacterBuildsContext,
  type CharacterPureStatsResult,
  useCharacterStatsBaseVars,
} from './context'
import type { SkillItemState } from './setupCharacterBuilds'
import { type SkillResult, setupCharacterSkills } from './setupCharacterSkills'
import { getSkillStatContainerValid, mergeStats } from './utils'

interface CharacterSetupOptions {
  handleFood: boolean
  handleRegistlet: boolean
  handlePotion: boolean
  handleActiveSkill: boolean
  handlePassiveSkill: boolean
  skillDisplayStatsOnly: boolean
}

export interface SetupCharacterStatCategoryResultsExtended {
  (
    otherStats: Ref<StatRecorded[]>,
    skillResult: Ref<SkillResult>
  ): {
    categoryResults: ComputedRef<CharacterStatCategoryResult[]>
    characterPureStats: ComputedRef<StatRecorded[]>
  }
}

export function prepareSetupCharacter() {
  const setupCharacterStats = (
    character: Ref<Character | null>,
    buildsContext: Ref<CharacterBuildsContext>,
    statsResult: CharacterPureStatsResult,
    skillItemStates: Map<Skill, SkillItemState>,
    setupOptions: Ref<CharacterSetupOptions>
  ) => {
    const allEquipmentStats = computed(() => {
      if (!character.value) {
        return []
      }
      const _checkStatRestriction = (stat: StatRestriction) =>
        checkStatRestriction(character.value!, stat)
      const stats: Map<string, StatRecorded> = new Map()
      character.value.equipmentFields.forEach(field => {
        if (!field.isEmpty && !field.statsDisabled()) {
          mergeStats(stats, field.equipment!.getAllStats(_checkStatRestriction))
        }
      })
      return [...stats.values()]
    })

    const { characterStatsBaseVars } = useCharacterStatsBaseVars(character, buildsContext)

    const basePureStatsEntries = computed(() => {
      const allStats = new Map<string, StatRecorded>()
      mergeStats(allStats, allEquipmentStats.value)
      mergeStats(allStats, statsResult.skillStats.value)
      if (setupOptions.value.handleFood) {
        mergeStats(allStats, statsResult.foodStats.value)
      }
      if (setupOptions.value.handleRegistlet) {
        mergeStats(allStats, statsResult.registletStats.value)
      }
      if (setupOptions.value.handlePotion) {
        mergeStats(allStats, statsResult.potionStats.value)
      }
      return [...allStats]
    })

    interface CharacterStatSetupResults {
      categoryResults: ComputedRef<CharacterStatCategoryResult[]>
      characterPureStats: ComputedRef<StatRecorded[]>
    }

    const setupResults = (
      postponeStats?: Ref<StatRecorded[]>,
      resultsCache?: CharacterStatSetupResults
    ): CharacterStatSetupResults => {
      const characterPureStats = computed(() => {
        if (!character.value) {
          return []
        }
        if (postponeStats && postponeStats.value.length === 0 && resultsCache) {
          return resultsCache.characterPureStats.value
        }
        const allStats = new Map<string, StatRecorded>(
          basePureStatsEntries.value.map(([statId, stat]) => [statId, stat.clone()])
        )
        if (postponeStats) {
          mergeStats(allStats, postponeStats.value)
        }
        return [...allStats.values()]
      })

      const categoryResults = computed(() => {
        if (!character.value) {
          return []
        }
        if (postponeStats && postponeStats.value.length === 0 && resultsCache) {
          return resultsCache.categoryResults.value
        }

        const categoryList = Grimoire.Character.characterStatCategoryList
        const pureStats = [...characterPureStats.value]
        const vars = CharacterStat.prepareCalcResultVars(characterStatsBaseVars.value)

        return categoryList
          .map(category => {
            return {
              name: category.name,
              stats: category.stats.map(stat => {
                const res = stat.result(pureStats, vars)
                return {
                  id: stat.id,
                  name: stat.name,
                  ...res,
                } as CharacterStatResultWithId
              }),
            } as CharacterStatCategoryResult
          })
          .filter(item => item.stats.length !== 0)
      })

      return {
        categoryResults,
        characterPureStats,
      }
    }

    const baseResults = setupResults()
    const {
      categoryResults: _characterStatCategoryResults,
      characterPureStats: _characterPureStats,
    } = baseResults

    const baseCharacterStatCategoryResultsMap = ref(undefined as unknown as Map<string, number>)
    watch(
      _characterStatCategoryResults,
      newValue => {
        const newMap = new Map<string, number>()
        newValue.forEach(categoryResult => {
          categoryResult.stats.forEach(stat => {
            newMap.set(stat.id, stat.resultValue)
          })
        })
        baseCharacterStatCategoryResultsMap.value = newMap
      },
      { immediate: true }
    )

    const baseCharacterPureStats = ref(undefined as unknown as Map<string, number>)
    watch(
      _characterPureStats,
      newValue => {
        const newMap = new Map<string, number>()
        newValue.forEach(stat => {
          newMap.set(stat.statId, stat.value)
        })
        baseCharacterPureStats.value = newMap
      },
      { immediate: true }
    )

    const {
      skillPureStats: postponedSkillPureStats,
      skillConditionalStatContainers,
      activeSkillResultStates: postponedActiveSkillResultStates,
      passiveSkillResultStates: postponedPassiveSkillResultStates,
      damageSkillResultStates,
    } = setupCharacterSkills(character, buildsContext, skillItemStates, setupOptions, {
      getCharacterStatValue: id => baseCharacterStatCategoryResultsMap.value.get(id) ?? 0,
      getCharacterPureStatValue: id => baseCharacterPureStats.value.get(id) ?? 0,
    })
    const finalResults = setupResults(postponedSkillPureStats, baseResults)
    const { categoryResults: characterStatCategoryResults, characterPureStats } = finalResults

    const setupCharacterStatCategoryResultsExtended: SetupCharacterStatCategoryResultsExtended = (
      otherStats,
      skillResult
    ) => {
      const conditionalStats = computed(() => {
        if (!skillResult.value.root.basicContainer) {
          return []
        }
        const stats: StatRecorded[] = []
        skillConditionalStatContainers.value.forEach(statContainer => {
          if (getSkillStatContainerValid(character.value, skillResult.value, statContainer)) {
            const stat = statContainer.toStatRecorded(parseFloat(statContainer.value))
            stats.push(stat)
          }
        })
        const statsMap = new Map<string, StatRecorded>()
        mergeStats(statsMap, stats)
        return [...statsMap.values()]
      })
      const stats = computed(() => {
        if (otherStats.value.length === 0 && conditionalStats.value.length === 0) {
          return []
        }
        const allStats = new Map<string, StatRecorded>()
        mergeStats(allStats, otherStats.value)
        mergeStats(allStats, postponedSkillPureStats.value)
        mergeStats(allStats, conditionalStats.value)
        return [...allStats.values()]
      })
      return setupResults(stats, finalResults)
    }

    return {
      characterStatCategoryResults,
      characterPureStats,
      postponedActiveSkillResultStates,
      postponedPassiveSkillResultStates,
      damageSkillResultStates,
      setupCharacterStatCategoryResultsExtended,
    }
  }

  return {
    setupCharacterSkills,
    setupCharacterStats,
  }
}

export interface CharacterStatResultWithId extends CharacterStatResult {
  id: string
  name: string
}
export interface CharacterStatCategoryResult {
  name: string
  stats: CharacterStatResultWithId[]
}
