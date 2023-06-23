import { ComputedRef, Ref, computed, ref, watch } from 'vue'

import Grimoire from '@/shared/Grimoire'

import {
  Character,
  CharacterBaseStatTypes,
  CharacterStat,
  CharacterStatResult,
  EquipmentFieldTypes,
} from '@/lib/Character/Character'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment'
import { RegistletBuild } from '@/lib/Character/RegistletBuild'
import { SkillBuild } from '@/lib/Character/SkillBuild'
import { StatRecorded, StatRestriction } from '@/lib/Character/Stat'
import { Skill } from '@/lib/Skill/Skill'

import { checkStatRestriction, getCharacterElement } from '../utils'
import type { SkillItemState } from './setupCharacterBuilds'
import { SkillResult, setupCharacterSkills } from './setupCharacterSkills'
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
  (otherStats: Ref<StatRecorded[]>, skillResult: Ref<SkillResult>): {
    categoryResults: ComputedRef<CharacterStatCategoryResult[]>
    characterPureStats: ComputedRef<StatRecorded[]>
  }
}

export function prepareSetupCharacter() {
  const setupCharacterStats = (
    character: Ref<Character | null>,
    skillBuild: Ref<SkillBuild | null>,
    skillStats: Ref<StatRecorded[]>,
    foodStats: Ref<StatRecorded[]>,
    registletBuild: Ref<RegistletBuild | null>,
    registletStats: Ref<StatRecorded[]>,
    potionStats: Ref<StatRecorded[]>,
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

    const equipmentElement = computed(() =>
      character.value ? getCharacterElement(character.value) : {}
    )

    const skill_Conversion = computed(() => {
      const stc = Grimoire.Skill.skillRoot.skillTreeCategorys.find(
        _stc => _stc.id === 4
      )
      const st = stc?.skillTrees.find(_st => _st.id === 1)
      return st?.skills.find(_skill => _skill.id === 1) ?? null
    })

    const computedVarsBase = computed(() => {
      const chara = character.value!

      const isDualSword =
        chara.checkFieldEquipmentType(
          EquipmentFieldTypes.MainWeapon,
          EquipmentTypes.OneHandSword
        ) &&
        chara.checkFieldEquipmentType(
          EquipmentFieldTypes.SubWeapon,
          EquipmentTypes.OneHandSword
        )

      const mainField = chara.fieldEquipment(EquipmentFieldTypes.MainWeapon)
      const subField = chara.fieldEquipment(EquipmentFieldTypes.SubWeapon)
      const bodyField = chara.fieldEquipment(EquipmentFieldTypes.BodyArmor)
      const additionalField = chara.fieldEquipment(
        EquipmentFieldTypes.Additional
      )
      const specialField = chara.fieldEquipment(EquipmentFieldTypes.Special)
      return {
        value: {
          '@clv': chara.level,
          '@str': chara.baseStatValue(CharacterBaseStatTypes.STR),
          '@dex': chara.baseStatValue(CharacterBaseStatTypes.DEX),
          '@int': chara.baseStatValue(CharacterBaseStatTypes.INT),
          '@agi': chara.baseStatValue(CharacterBaseStatTypes.AGI),
          '@vit': chara.baseStatValue(CharacterBaseStatTypes.VIT),
          '@tec': chara.baseStatValue(CharacterBaseStatTypes.TEC),
          '@men': chara.baseStatValue(CharacterBaseStatTypes.MEN),
          '@crt': chara.baseStatValue(CharacterBaseStatTypes.CRT),
          '@luk': chara.baseStatValue(CharacterBaseStatTypes.LUK),
          '@main': mainField
            ? {
                atk: mainField.basicValue,
                refining: mainField.refining,
                stability: mainField.stability,
              }
            : {
                atk: 0,
                refining: 0,
                stability: 0,
              },
          '@sub': subField
            ? {
                atk: subField.basicValue,
                def: subField.basicValue,
                refining: subField.refining,
                stability: subField.stability,
              }
            : {
                atk: 0,
                def: 0,
                refining: 0,
                stability: 0,
              },
          '@armor': bodyField
            ? {
                def: bodyField.basicValue,
                refining: bodyField.refining,
              }
            : {
                def: 0,
                refining: 0,
              },
          '@additional': additionalField
            ? {
                def: additionalField.basicValue,
                refining: additionalField.refining,
              }
            : {
                def: 0,
                refining: 0,
              },
          '@special': specialField
            ? { def: specialField.basicValue }
            : { def: 0 },
          '@shield': chara.checkFieldEquipmentType(
            EquipmentFieldTypes.SubWeapon,
            EquipmentTypes.Shield
          )
            ? { refining: subField!.refining, def: subField!.basicValue }
            : { refining: 0, def: 0 },
          '@arrow': chara.checkFieldEquipmentType(
            EquipmentFieldTypes.SubWeapon,
            EquipmentTypes.Arrow
          )
            ? { stability: subField!.stability, atk: subField!.basicValue }
            : { stability: 0, atk: 0 },
          '@element': equipmentElement.value,
          '@skill': {
            Conversion: skill_Conversion.value
              ? skillBuild.value?.getSkillLevel(skill_Conversion.value) ?? 0
              : 0,
          },
        },
        conditional: {
          '@1h_sword':
            !isDualSword &&
            chara.checkFieldEquipmentType(
              EquipmentFieldTypes.MainWeapon,
              EquipmentTypes.OneHandSword
            ),
          '@2h_sword': chara.checkFieldEquipmentType(
            EquipmentFieldTypes.MainWeapon,
            EquipmentTypes.TwoHandSword
          ),
          '@bow': chara.checkFieldEquipmentType(
            EquipmentFieldTypes.MainWeapon,
            EquipmentTypes.Bow
          ),
          '@bowgun': chara.checkFieldEquipmentType(
            EquipmentFieldTypes.MainWeapon,
            EquipmentTypes.Bowgun
          ),
          '@staff': chara.checkFieldEquipmentType(
            EquipmentFieldTypes.MainWeapon,
            EquipmentTypes.Staff
          ),
          '@magic_device': chara.checkFieldEquipmentType(
            EquipmentFieldTypes.MainWeapon,
            EquipmentTypes.MagicDevice
          ),
          '@knuckle': chara.checkFieldEquipmentType(
            EquipmentFieldTypes.MainWeapon,
            EquipmentTypes.Knuckle
          ),
          '@dual_sword': isDualSword,
          '@halberd': chara.checkFieldEquipmentType(
            EquipmentFieldTypes.MainWeapon,
            EquipmentTypes.Halberd
          ),
          '@katana': chara.checkFieldEquipmentType(
            EquipmentFieldTypes.MainWeapon,
            EquipmentTypes.Katana
          ),
          '@main': {
            none: chara.checkFieldEquipmentType(
              EquipmentFieldTypes.MainWeapon,
              EquipmentTypes.Empty
            ),
          },
          '@sub': {
            arrow: chara.checkFieldEquipmentType(
              EquipmentFieldTypes.SubWeapon,
              EquipmentTypes.Arrow
            ),
            shield: chara.checkFieldEquipmentType(
              EquipmentFieldTypes.SubWeapon,
              EquipmentTypes.Shield
            ),
            dagger: chara.checkFieldEquipmentType(
              EquipmentFieldTypes.SubWeapon,
              EquipmentTypes.Dagger
            ),
            knuckle: chara.checkFieldEquipmentType(
              EquipmentFieldTypes.SubWeapon,
              EquipmentTypes.Knuckle
            ),
            magic_device: chara.checkFieldEquipmentType(
              EquipmentFieldTypes.SubWeapon,
              EquipmentTypes.MagicDevice
            ),
          },
          '@armor': {
            normal: chara.checkFieldEquipmentType(
              EquipmentFieldTypes.BodyArmor,
              EquipmentTypes.BodyNormal
            ),
            dodge: chara.checkFieldEquipmentType(
              EquipmentFieldTypes.BodyArmor,
              EquipmentTypes.BodyDodge
            ),
            defense: chara.checkFieldEquipmentType(
              EquipmentFieldTypes.BodyArmor,
              EquipmentTypes.BodyDefense
            ),
            none: chara.checkFieldEquipmentType(
              EquipmentFieldTypes.BodyArmor,
              EquipmentTypes.Empty
            ),
          },
        },
      }
    })

    const basePureStatsEntries = computed(() => {
      const allStats = new Map<string, StatRecorded>()
      mergeStats(allStats, allEquipmentStats.value)
      mergeStats(allStats, skillStats.value)
      if (setupOptions.value.handleFood) {
        mergeStats(allStats, foodStats.value)
      }
      if (setupOptions.value.handleRegistlet) {
        mergeStats(allStats, registletStats.value)
      }
      if (setupOptions.value.handlePotion) {
        mergeStats(allStats, potionStats.value)
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
          basePureStatsEntries.value.map(([statId, stat]) => [
            statId,
            stat.clone(),
          ])
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
        const vars = CharacterStat.prepareCalcResultVars(computedVarsBase.value)

        return categoryList
          .map(
            category =>
              ({
                name: category.name,
                stats: category.stats.map(stat => {
                  const res = stat.result(pureStats, vars)
                  return {
                    id: stat.id,
                    name: stat.name,
                    ...res,
                  } as CharacterStatResultWithId
                }),
              } as CharacterStatCategoryResult)
          )
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

    const baseCharacterStatCategoryResultsMap = ref(
      undefined as unknown as Map<string, number>
    )
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

    const baseCharacterPureStats = ref(
      undefined as unknown as Map<string, number>
    )
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
    } = setupCharacterSkills(
      character,
      skillBuild,
      skillItemStates,
      registletBuild,
      setupOptions,
      {
        getCharacterStatValue: id =>
          baseCharacterStatCategoryResultsMap.value.get(id) ?? 0,
        getCharacterPureStatValue: id =>
          baseCharacterPureStats.value.get(id) ?? 0,
      }
    )
    const finalResults = setupResults(postponedSkillPureStats, baseResults)
    const {
      categoryResults: characterStatCategoryResults,
      characterPureStats,
    } = finalResults

    const setupCharacterStatCategoryResultsExtended: SetupCharacterStatCategoryResultsExtended =
      (otherStats, skillResult) => {
        const conditionalStats = computed(() => {
          if (!skillResult.value.root.basicContainer) {
            return []
          }
          const stats: StatRecorded[] = []
          skillConditionalStatContainers.value.forEach(statContainer => {
            if (
              getSkillStatContainerValid(
                character.value,
                skillResult.value,
                statContainer
              )
            ) {
              const stat = statContainer.toStatRecorded(
                parseFloat(statContainer.value)
              )
              stats.push(stat)
            }
          })
          const statsMap = new Map<string, StatRecorded>()
          mergeStats(statsMap, stats)
          return [...statsMap.values()]
        })
        const stats = computed(() => {
          if (
            otherStats.value.length === 0 &&
            conditionalStats.value.length === 0
          ) {
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
