import { type ComputedRef, type Ref, computed } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { computeFormula } from '@/shared/utils/data'

import {
  Character,
  CharacterBaseStatTypes,
  CharacterStat,
  type CharacterStatResult,
} from '@/lib/Character/Character'
import { StatRecorded, StatRestriction, StatValueSourceTypes } from '@/lib/Character/Stat'
import { Skill } from '@/lib/Skill/Skill'

import { checkStatRestriction } from '../utils'
import {
  type CharacterBuildsContext,
  type CharacterPureStatsResult,
  useCharacterStatsBaseVars,
} from './context'
import type { SkillItemState } from './setupCharacterBuilds'
import { type SkillResult, setupCharacterSkills } from './setupCharacterSkills'
import { getSkillStatContainerValid, mergeStatRecordeds } from './utils'

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
    const allEquipmentStats = computed<StatRecorded[]>(() => {
      if (!character.value) {
        return []
      }
      const _checkStatRestriction = (stat: StatRestriction) =>
        checkStatRestriction(character.value!, stat)
      const stats: Map<string, StatRecorded> = new Map()
      character.value.equipmentFields.forEach(field => {
        if (!field.isEmpty && !field.statsDisabled()) {
          mergeStatRecordeds(stats, field.equipment!.getAllStats(_checkStatRestriction))
        }
      })
      return [...stats.values()]
    })

    const { characterStatsBaseVars } = useCharacterStatsBaseVars(character, buildsContext)

    const basePureStatsEntries = computed<[string, StatRecorded][]>(() => {
      const allStats = new Map<string, StatRecorded>()
      mergeStatRecordeds(allStats, allEquipmentStats.value)
      mergeStatRecordeds(allStats, statsResult.skillStats.value)
      if (setupOptions.value.handleFood) {
        mergeStatRecordeds(allStats, statsResult.foodStats.value)
      }
      if (setupOptions.value.handleRegistlet) {
        mergeStatRecordeds(allStats, statsResult.registletStats.value)
      }
      if (setupOptions.value.handlePotion) {
        mergeStatRecordeds(allStats, statsResult.potionStats.value)
      }
      return [...allStats]
    })

    interface CharacterStatSetupResults {
      categoryResults: ComputedRef<CharacterStatCategoryResult[]>
      characterPureStats: ComputedRef<StatRecorded[]>
    }

    interface SetupCharacterStatResultsOptions {
      additionalStats?: Ref<StatRecorded[]>
      fallbackResults?: CharacterStatSetupResults
    }

    const setupCharacterStatResults = ({
      additionalStats,
      fallbackResults,
    }: SetupCharacterStatResultsOptions = {}): CharacterStatSetupResults => {
      const characterPureStats = computed<StatRecorded[]>(() => {
        if (!character.value) {
          return []
        }
        if ((!additionalStats || additionalStats.value.length === 0) && fallbackResults) {
          return fallbackResults.characterPureStats.value
        }
        const allStats = new Map<string, StatRecorded>(
          basePureStatsEntries.value.map(([statId, stat]) => [statId, stat.clone()])
        )
        if (additionalStats) {
          mergeStatRecordeds(allStats, additionalStats.value)
        }
        return [...allStats.values()]
      })

      const categoryResults = computed<CharacterStatCategoryResult[]>(() => {
        if (!character.value) {
          return []
        }
        if ((!additionalStats || additionalStats.value.length === 0) && fallbackResults) {
          return fallbackResults.categoryResults.value
        }

        const categoryList = Grimoire.Character.characterStatCategoryList
        const pureStats = characterPureStats.value
        const vars = CharacterStat.prepareCalcResultVars(
          characterStatsBaseVars.value,
          categoryList,
          pureStats
        )

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

    const baseResults = setupCharacterStatResults()
    const {
      categoryResults: _characterStatCategoryResults,
      characterPureStats: _characterPureStats,
    } = baseResults

    const baseCharacterStatCategoryResultsMap = computed<Map<string, number>>(() => {
      const results = new Map<string, number>()
      _characterStatCategoryResults.value.forEach(categoryResult => {
        categoryResult.stats.forEach(stat => {
          results.set(stat.id, stat.resultValue)
        })
      })
      return results
    })

    const baseCharacterPureStats = computed<Map<string, number>>(() => {
      return new Map(_characterPureStats.value.map(stat => [stat.statId, stat.value]))
    })

    const createStatValueGetter = (stats: ComputedRef<Map<string, number>>) => {
      const values = new Map<string, ComputedRef<number>>()
      return (id: string): number => {
        let value = values.get(id)
        if (!value) {
          value = computed(() => stats.value.get(id) ?? 0)
          values.set(id, value)
        }
        return value.value
      }
    }
    const getBaseCharacterStatValue = createStatValueGetter(baseCharacterStatCategoryResultsMap)
    const getBaseCharacterPureStatValue = createStatValueGetter(baseCharacterPureStats)

    const traitPureStats = computed<StatRecorded[]>(() => {
      if (!character.value) {
        return []
      }
      const vars = {
        STR: getBaseCharacterStatValue('str'),
        DEX: getBaseCharacterStatValue('dex'),
        INT: getBaseCharacterStatValue('int'),
        AGI: getBaseCharacterStatValue('agi'),
        VIT: getBaseCharacterStatValue('vit'),
        BSTR: character.value.baseStatValue(CharacterBaseStatTypes.STR),
        BDEX: character.value.baseStatValue(CharacterBaseStatTypes.DEX),
        BINT: character.value.baseStatValue(CharacterBaseStatTypes.INT),
        BAGI: character.value.baseStatValue(CharacterBaseStatTypes.AGI),
        BVIT: character.value.baseStatValue(CharacterBaseStatTypes.VIT),
        TEC: character.value.baseStatValue(CharacterBaseStatTypes.TEC),
        CRT: character.value.baseStatValue(CharacterBaseStatTypes.CRT),
        MEN: character.value.baseStatValue(CharacterBaseStatTypes.MEN),
        LUK: character.value.baseStatValue(CharacterBaseStatTypes.LUK),
      }
      const stats = new Map<string, StatRecorded>()
      character.value.equipmentFields.forEach(field => {
        if (field.isEmpty || field.statsDisabled()) {
          return
        }
        const equip = field.equipment!
        if (!equip.supportTrait || !equip.trait) {
          return false
        }
        const equipTrait = equip.trait!
        const traitStats: StatRecorded[] = []
        equipTrait.base.stats.forEach(traitStat => {
          const newVars = {
            Lv: equipTrait.level,
            ...vars,
          }
          const value = computeFormula(traitStat.value, newVars) as number
          if (typeof value === 'number') {
            const resultValue = value * equipTrait.currentStack
            traitStats.push(
              StatRecorded.create(
                traitStat.base,
                traitStat.type,
                resultValue,
                equipTrait,
                StatValueSourceTypes.Trait
              )
            )
          }
        })

        mergeStatRecordeds(stats, traitStats)
      })
      return [...stats.values()]
    })

    const {
      skillComputingContainer: postponedSkillComputingContainer,
      skillPureStats: postponedSkillPureStats,
      skillConditionalStatContainers,
      activeSkillResultStates: postponedActiveSkillResultStates,
      buffSkillResultStates: postponedBuffSkillResultStates,
      passiveSkillResultStates: postponedPassiveSkillResultStates,
      damageSkillResultStates,
    } = setupCharacterSkills(character, buildsContext, skillItemStates, setupOptions, {
      getCharacterStatValue: getBaseCharacterStatValue,
      getCharacterPureStatValue: getBaseCharacterPureStatValue,
    })

    const allPostponedPureStats = computed<StatRecorded[]>(() => {
      const tmpMap = new Map<string, StatRecorded>()
      mergeStatRecordeds(tmpMap, traitPureStats.value)
      mergeStatRecordeds(tmpMap, postponedSkillPureStats.value)
      return [...tmpMap.values()]
    })
    const finalResults = setupCharacterStatResults({
      additionalStats: allPostponedPureStats,
      fallbackResults: baseResults,
    })
    const { categoryResults: characterStatCategoryResults, characterPureStats } = finalResults

    // Pass the additional stats and compute character-stat-category results (for damage-calc currently)
    const setupCharacterStatCategoryResultsExtended: SetupCharacterStatCategoryResultsExtended = (
      otherStats,
      skillResult
    ) => {
      const conditionalStats = computed<StatRecorded[]>(() => {
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
        mergeStatRecordeds(statsMap, stats)
        return [...statsMap.values()]
      })
      const stats = computed<StatRecorded[]>(() => {
        if (otherStats.value.length === 0 && conditionalStats.value.length === 0) {
          return []
        }
        const allStats = new Map<string, StatRecorded>()
        mergeStatRecordeds(allStats, otherStats.value)
        mergeStatRecordeds(allStats, allPostponedPureStats.value)
        mergeStatRecordeds(allStats, conditionalStats.value)
        return [...allStats.values()]
      })
      return setupCharacterStatResults({ additionalStats: stats, fallbackResults: finalResults })
    }

    return {
      characterStatCategoryResults,
      characterPureStats,
      postponedSkillComputingContainer,
      postponedActiveSkillResultStates,
      postponedBuffSkillResultStates,
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
