import { type ComputedRef, type Ref, computed, markRaw, reactive } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { computeFormula } from '@/shared/utils/data'
import { isNumberString } from '@/shared/utils/string'

import {
  Character,
  CharacterBaseStatTypes,
  EquipmentFieldTypes,
} from '@/lib/Character/Character'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment'
import { RegistletBuild } from '@/lib/Character/RegistletBuild'
import { SkillBuild } from '@/lib/Character/SkillBuild'
import {
  StatComputed,
  StatRecorded,
  StatValueSourceTypes,
} from '@/lib/Character/Stat'
import { Skill, SkillBranchNames } from '@/lib/Skill/Skill'
import {
  SkillBranchItem,
  SkillBranchItemSuffix,
  SkillBranchStatResult,
  SkillBuffs,
  SkillComputingContainer,
  SkillEffectItem,
} from '@/lib/Skill/SkillComputing'

import BasicHandler from '@/views/SkillQuery/skill/branch-handlers/BasicHandler'
import DamageHandler from '@/views/SkillQuery/skill/branch-handlers/DamageHandler'
import EffectHandler from '@/views/SkillQuery/skill/branch-handlers/EffectHandler'
import ExtraHandler from '@/views/SkillQuery/skill/branch-handlers/ExtraHandler'
import PassiveHandler from '@/views/SkillQuery/skill/branch-handlers/PassiveHandler'
import StackHandler from '@/views/SkillQuery/skill/branch-handlers/StackHandler'
import DisplayDataContainer from '@/views/SkillQuery/skill/branch-handlers/handle/DisplayDataContainer'

import { getSkillBranchState } from './getState'
import type { SkillItemState } from './setupCharacterBuilds'
import { useGetSkillLevel } from './setupCharacterBuilds'

type DisplayDataContainerAlly = DisplayDataContainer<
  SkillBranchItem<SkillEffectItem>
>
type DisplayDataContainerSuffixAlly = DisplayDataContainer<
  SkillBranchItemSuffix<SkillEffectItem>
>

interface SkillResultBase {
  container: DisplayDataContainerAlly
  suffixContainers: DisplayDataContainerSuffixAlly[]
}
export interface SkillResult extends SkillResultBase {
  root: SkillResultsState
}

export interface SkillResultsState {
  skill: Skill
  skillLevel: number
  results: SkillResult[]
  stackContainers: DisplayDataContainerAlly[]
  basicContainer: DisplayDataContainerAlly | null
  hasOptions: boolean
}

interface CharacterSetupOptions {
  handleFood: boolean
  handleRegistlet: boolean
  handlePotion: boolean
  handleActiveSkill: boolean
  handlePassiveSkill: boolean
  skillDisplayStatsOnly: boolean
}

interface SkillSetupPostponeOptions {
  getCharacterStatValue: (id: string) => number
  getCharacterPureStatValue: (id: string) => number
}

function useSkillExtendedVariables(
  character: Ref<Character | null>,
  postponeOptions?: SkillSetupPostponeOptions
) {
  const isPostpone = !!postponeOptions

  return computed(() => {
    if (!character.value) {
      return {} as Record<string, number>
    }

    const subField = character.value.fieldEquipment(
      EquipmentFieldTypes.SubWeapon
    )

    return {
      $BSTR: character.value.baseStatValue(CharacterBaseStatTypes.STR),
      $BINT: character.value.baseStatValue(CharacterBaseStatTypes.INT),
      $BAGI: character.value.baseStatValue(CharacterBaseStatTypes.AGI),
      $BVIT: character.value.baseStatValue(CharacterBaseStatTypes.VIT),
      $BDEX: character.value.baseStatValue(CharacterBaseStatTypes.DEX),
      $TEC: character.value.baseStatValue(CharacterBaseStatTypes.TEC),
      $CRT: character.value.baseStatValue(CharacterBaseStatTypes.CRT),
      $MEN: character.value.baseStatValue(CharacterBaseStatTypes.MEN),
      $LUK: character.value.baseStatValue(CharacterBaseStatTypes.LUK),
      $shield_refining: character.value.checkFieldEquipmentType(
        EquipmentFieldTypes.SubWeapon,
        EquipmentTypes.Shield
      )
        ? subField?.refining ?? 0
        : 0,
      $dagger_atk: character.value.checkFieldEquipmentType(
        EquipmentFieldTypes.SubWeapon,
        EquipmentTypes.Dagger
      )
        ? subField?.basicValue ?? 0
        : 0,

      // not used for handling stats of skills
      $target_def: 0,
      $target_level: 0,

      // postpone
      $STR: isPostpone ? postponeOptions.getCharacterStatValue('str') : 0,
      $INT: isPostpone ? postponeOptions.getCharacterStatValue('int') : 0,
      $AGI: isPostpone ? postponeOptions.getCharacterStatValue('agi') : 0,
      $VIT: isPostpone ? postponeOptions.getCharacterStatValue('vit') : 0,
      $DEX: isPostpone ? postponeOptions.getCharacterStatValue('dex') : 0,

      $guard_power: isPostpone
        ? postponeOptions.getCharacterStatValue('guard_power')
        : 0,
    } as Record<string, number>
  })
}

function useFormulaExtraValueVariables(
  character: Ref<Character | null>,
  getSkillLevel: (skill: Skill) => number,
  postponeOptions?: SkillSetupPostponeOptions
) {
  return computed(() => {
    if (!character.value) {
      return {}
    }

    const chara = character.value

    const mainField = chara.fieldEquipment(EquipmentFieldTypes.MainWeapon)
    const subField = chara.fieldEquipment(EquipmentFieldTypes.SubWeapon)
    const bodyField = chara.fieldEquipment(EquipmentFieldTypes.BodyArmor)
    const additionalField = chara.fieldEquipment(EquipmentFieldTypes.Additional)
    const specialField = chara.fieldEquipment(EquipmentFieldTypes.Special)
    return {
      '@C': {
        main: mainField
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
        sub: subField
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
        armor: bodyField
          ? {
              def: bodyField.basicValue,
              refining: bodyField.refining,
            }
          : {
              def: 0,
              refining: 0,
            },
        additional: additionalField
          ? {
              def: additionalField.basicValue,
              refining: additionalField.refining,
            }
          : {
              def: 0,
              refining: 0,
            },
        special: specialField ? { def: specialField.basicValue } : { def: 0 },
        shield: chara.checkFieldEquipmentType(
          EquipmentFieldTypes.SubWeapon,
          EquipmentTypes.Shield
        )
          ? { refining: subField!.refining, def: subField!.basicValue }
          : { refining: 0, def: 0 },
        arrow: chara.checkFieldEquipmentType(
          EquipmentFieldTypes.SubWeapon,
          EquipmentTypes.Arrow
        )
          ? { stability: subField!.stability, atk: subField!.basicValue }
          : { stability: 0, atk: 0 },
        ninjutsu_scroll: chara.checkFieldEquipmentType(
          EquipmentFieldTypes.SubWeapon,
          EquipmentTypes.NinjutsuScroll
        )
          ? { stability: subField!.stability, atk: subField!.basicValue }
          : { stability: 0, atk: 0 },
        stat: (id: string) => {
          const getter = postponeOptions?.getCharacterStatValue
          return getter ? getter(id) : 0
        },
        pureStat: (id: string) => {
          const getter = postponeOptions?.getCharacterPureStatValue
          return getter ? getter(id) : 0
        },
      },
      'getSkillLevel': (skillId: string) => {
        const skill = Grimoire.Skill.skillRoot.findSkillById(skillId)
        return skill ? getSkillLevel(skill) : 0
      },
    } as Record<string, any>
  })
}

export function setupCharacterSkills(
  character: Ref<Character | null>,
  skillBuild: Ref<SkillBuild | null>,
  skillItemStates: Map<Skill, SkillItemState>,
  registletBuild: Ref<RegistletBuild | null>,
  setupOptions: Ref<CharacterSetupOptions>,
  postponeOptions?: SkillSetupPostponeOptions
) {
  const isPostpone = !!postponeOptions

  const getSkillLevel = useGetSkillLevel(skillItemStates, skillBuild)

  const computing = new SkillComputingContainer()
  computing.varGetters.skillLevel = getSkillLevel
  computing.varGetters.characterLevel = () => character.value?.level ?? 0
  computing.varGetters.registletLevel = (() => {
    const _computeds = new Map<Skill, Ref<number[]>>()
    return skill => {
      if (!_computeds.has(skill)) {
        _computeds.set(
          skill,
          computed(() => {
            const registletItems =
              Grimoire.Registlet.getRegistletItemsBySkill(skill)
            if (!registletBuild.value) {
              return registletItems.map(() => 0)
            }
            return registletItems.map(itemBase => {
              const item = registletBuild.value!.getItem(itemBase)
              return item && item.enabled ? item.level : 0
            })
          })
        )
      }
      return _computeds.get(skill)!.value
    }
  })()

  const extendVars = useSkillExtendedVariables(character, postponeOptions)

  computing.handleFormulaExtends.push(() => {
    if (!character.value) {
      return { vars: {}, texts: {} }
    }
    return {
      vars: extendVars.value,
      texts: {},
      methods: {
        getSkillLevel: (skillId: string) => {
          const skill = Grimoire.Skill.skillRoot.findSkillById(skillId)
          return skill ? getSkillLevel(skill) : 0
        },
      },
    }
  })

  const getFormulaExtraValueVars = useFormulaExtraValueVariables(
    character,
    getSkillLevel,
    postponeOptions
  )

  computing.config.computeFormulaExtraValue = formula => {
    if (!character.value) {
      return null
    }
    if (!formula) {
      return null
    }
    const res = computeFormula(formula, getFormulaExtraValueVars.value, 0)
    if (typeof res === 'number') {
      return res
    }
    if (typeof res === 'string' && isNumberString(res)) {
      return parseFloat(res)
    }
    return null
  }

  computing.config.getFormulaExtraValue = (branch, id, props) => {
    return getSkillBranchState(branch.default).getFormulaExtraState(id, props)
      .value
  }

  const allSkills: Skill[] = []
  Grimoire.Skill.skillRoot.skillTreeCategorys.forEach(stc =>
    stc.skillTrees.forEach(st => allSkills.push(...st.skills))
  )

  const {
    computingContainer,
    activeSkillResults,
    passiveSkillResults,
    nextSkillResults,
    damageSkillResults,
    skillStackContainers,
    skillBasicContainers,
  } = (() => {
    type ComputingResultsMap = Map<Skill, ComputedRef<SkillResultBase[]>>
    const computingResultsActive: ComputingResultsMap = new Map()
    const computingResultsPassive: ComputingResultsMap = new Map()
    const computingResultsDamage: ComputingResultsMap = new Map()
    const computingResultsNext: ComputingResultsMap = new Map()

    const stackContainers: Map<
      Skill,
      ComputedRef<DisplayDataContainerAlly[]>
    > = new Map()
    const basicContainers: Map<
      Skill,
      ComputedRef<DisplayDataContainerAlly | null>
    > = new Map()

    const checkPostpone = (bch: SkillBranchItem) =>
      isPostpone ? bch.postpone : !bch.postpone
    const suffixBranchFilter = (suf: SkillBranchItemSuffix) => {
      if (!checkPostpone(suf.mainBranch)) {
        return false
      }
      if (
        suf.prop('type') === 'next' &&
        suf.mainBranch.realName === SkillBranchNames.Effect
      ) {
        return false
      }
      if (!suf.is(SkillBranchNames.Extra)) {
        return false
      }
      if (suf.propBoolean('display_only')) {
        return false
      }
      return suf.stats.length !== 0 || suf.hasProp('dual_element')
    }

    const handleComputingResults = (
      target: ComputedRef<SkillBranchItem[]>,
      handler: (
        _computing: SkillComputingContainer,
        bch: SkillBranchItem
      ) => DisplayDataContainer,
      validBranchNames: SkillBranchNames[]
    ) => {
      return computed(() => {
        return target.value.map(bch => {
          const container = (
            validBranchNames.some(name => bch.is(name))
              ? handler(computing, bch)
              : new DisplayDataContainer({ branchItem: bch })
          ) as DisplayDataContainerAlly // empty container
          const suffixContainers = bch.suffixBranches
            .filter(suffixBranchFilter)
            .map(
              suf =>
                ExtraHandler(computing, suf) as DisplayDataContainerSuffixAlly
            )
          return {
            container,
            suffixContainers,
          } as SkillResultBase
        })
      })
    }

    allSkills.forEach(skill => {
      const skillItemState = skillItemStates.get(skill)
      if (!skillItemState) {
        return
      }
      const { skillItem, effectItem: currentEffectItem } = skillItemState

      interface BranchItemArrayFilter {
        (bch: SkillBranchItem): boolean
      }

      // active
      const checkBranchStats = (stats: StatComputed[]): boolean => {
        return !setupOptions.value.skillDisplayStatsOnly || stats.length !== 0
      }
      const checkActive: BranchItemArrayFilter = bch => {
        if (!checkPostpone(bch)) {
          return false
        }
        if (bch.is(SkillBranchNames.Effect)) {
          if (bch.propBoolean('display_only')) {
            return false
          }
          return (
            checkBranchStats(bch.stats) ||
            bch.suffixBranches.some(suffixBranchFilter)
          )
        }
        return false
      }
      const activeValid = skillItem.effectItems.some(effectItem =>
        effectItem.branchItems.some(checkActive)
      )
      const activeSkillBranchItems = !activeValid
        ? null
        : computed(() => {
            return (
              currentEffectItem.value?.branchItems.filter(checkActive) ?? []
            )
          })

      // passive
      const checkPassive: BranchItemArrayFilter = bch => {
        if (!checkPostpone(bch)) {
          return false
        }
        if (bch.is(SkillBranchNames.Passive)) {
          return (
            checkBranchStats(bch.stats) ||
            bch.suffixBranches.some(suffixBranchFilter)
          )
        }
        return false
      }
      const passiveValid = skillItem.effectItems.some(effectItem =>
        effectItem.branchItems.some(checkPassive)
      )
      const passiveSkillBranchItems = !passiveValid
        ? null
        : computed(() => {
            return (
              currentEffectItem.value?.branchItems.filter(checkPassive) ?? []
            )
          })

      // next
      const checkNext: BranchItemArrayFilter = bch => {
        if (!checkPostpone(bch)) {
          return false
        }
        if (bch.is(SkillBranchNames.Next)) {
          return (
            bch.stats.length !== 0 ||
            !!bch.buffs?.has(SkillBuffs.MpCostHalf) ||
            bch.suffixBranches.some(suffixBranchFilter)
          )
        }
        return false
      }
      const nextValid = skillItem.effectItems.some(effectItem =>
        effectItem.branchItems.some(checkNext)
      )
      const nextSkillBranchItems = !nextValid
        ? null
        : computed(() => {
            return currentEffectItem.value?.branchItems.filter(checkNext) ?? []
          })

      let damageSkillBranchItems: ComputedRef<
        SkillBranchItem<SkillEffectItem>[]
      > | null = null
      if (isPostpone) {
        // damage
        const checkDamage: BranchItemArrayFilter = bch =>
          bch.is(SkillBranchNames.Damage) && checkPostpone(bch)
        const damageValid = skillItem.effectItems.some(effectItem =>
          effectItem.branchItems.some(checkDamage)
        )
        damageSkillBranchItems = !damageValid
          ? null
          : computed(() => {
              return (
                currentEffectItem.value?.branchItems.filter(checkDamage) ?? []
              )
            })
      }

      if (activeSkillBranchItems) {
        computingResultsActive.set(
          skill,
          handleComputingResults(activeSkillBranchItems, EffectHandler, [
            SkillBranchNames.Effect,
          ])
        )
      }
      if (passiveSkillBranchItems) {
        computingResultsPassive.set(
          skill,
          handleComputingResults(passiveSkillBranchItems, PassiveHandler, [
            SkillBranchNames.Passive,
          ])
        )
      }
      if (nextSkillBranchItems) {
        computingResultsNext.set(
          skill,
          handleComputingResults(nextSkillBranchItems, EffectHandler, [
            SkillBranchNames.Next,
          ])
        )
      }
      if (damageSkillBranchItems) {
        computingResultsDamage.set(
          skill,
          handleComputingResults(damageSkillBranchItems, DamageHandler, [
            SkillBranchNames.Damage,
          ])
        )
      }
      if (
        activeSkillBranchItems ||
        passiveSkillBranchItems ||
        damageSkillBranchItems ||
        nextSkillBranchItems
      ) {
        stackContainers.set(
          skill,
          computed(() => {
            return (
              currentEffectItem.value?.branchItems
                .filter(
                  _bch =>
                    _bch.is(SkillBranchNames.Stack) && !_bch.hasProp('value')
                )
                .map(_bch => StackHandler(computing, _bch)) ?? []
            )
          })
        )
        basicContainers.set(
          skill,
          computed(() => {
            const basicBranch = currentEffectItem.value?.basicBranchItem
            return basicBranch ? BasicHandler(computing, basicBranch) : null
          })
        )
      }
    })
    return {
      computingContainer: computing,
      activeSkillResults: computingResultsActive,
      passiveSkillResults: computingResultsPassive,
      nextSkillResults: computingResultsNext,
      damageSkillResults: computingResultsDamage,
      skillStackContainers: stackContainers,
      skillBasicContainers: basicContainers,
    }
  })()

  const skillBuildAllSkills = computed(() => skillBuild.value?.allSkills ?? [])

  const getUsedStackContainers = (
    branchItems: SkillBranchItem[],
    skill: Skill
  ) => {
    const stackIds = new Set<number>()
    branchItems.forEach(bch =>
      bch.linkedStackIds.forEach(id => stackIds.add(id))
    )
    const stackIdList = [...stackIds]
    const res = skillStackContainers
      .get(skill)
      ?.value.filter(container =>
        stackIdList.includes(container.branchItem.stackId!)
      )
    return res ?? []
  }

  const getSkillResultStatesComputed = (
    target: Map<Skill, ComputedRef<SkillResultBase[]>>
  ) => {
    const _map = new Map<Skill, SkillResultsState>()
    for (const [skill, resultBases] of target.entries()) {
      const stackContainers = computed(() =>
        getUsedStackContainers(
          resultBases.value.map(result => result.container.branchItem),
          skill
        )
      )
      const basicContainer = skillBasicContainers.get(skill)!
      const hasOptions = computed(() => {
        if (stackContainers.value.length > 0) {
          return true
        }
        return resultBases.value.some(
          resultBase =>
            getSkillBranchState(resultBase.container.branchItem.default)
              .formulaExtraIds.length > 0
        )
      })
      const resultStates = reactive({
        skillLevel: computed(() => skillBuild.value?.getSkillLevel(skill) ?? 0),
        skill,
        stackContainers,
        basicContainer,
        hasOptions,
      }) as SkillResultsState
      const results = computed(() =>
        resultBases.value.map(item => {
          return {
            ...item,
            root: resultStates,
          } as SkillResult
        })
      )
      resultStates.results = results as unknown as SkillResult[]
      _map.set(skill, resultStates)
    }

    const resultStates = computed(() => {
      const results: SkillResultsState[] = []
      skillBuildAllSkills.value.forEach(skill => {
        if (_map.has(skill)) {
          results.push(_map.get(skill)!)
        }
      })
      return results
    })

    const allResultStatesMap = _map

    return {
      resultStates,
      allResultStatesMap,
    }
  }

  const {
    allResultStatesMap: allActiveSkillResultStatesMap,
    resultStates: activeSkillResultStates,
  } = getSkillResultStatesComputed(activeSkillResults)
  const {
    allResultStatesMap: allPassiveSkillResultStatesMap,
    resultStates: passiveSkillResultStates,
  } = getSkillResultStatesComputed(passiveSkillResults)
  const { resultStates: nextSkillResultStates } =
    getSkillResultStatesComputed(nextSkillResults)
  const { resultStates: damageSkillResultStates } =
    getSkillResultStatesComputed(damageSkillResults)

  const skillStatResults = computed(() => {
    if (!skillBuild.value) {
      return {
        stats: [],
        conditionalStatContainers: [],
      }
    }
    const list: SkillResultsState[] = []
    if (setupOptions.value.handleActiveSkill) {
      list.push(...activeSkillResultStates.value)
    }
    if (setupOptions.value.handlePassiveSkill) {
      list.push(...passiveSkillResultStates.value)
    }
    if (list.length === 0) {
      return {
        stats: [],
        conditionalStatContainers: [],
      }
    }

    const stats: Map<string, StatRecorded> = new Map()
    const conditionalStatContainers: SkillBranchStatResult[] = []
    const handleStatContainer = (statContainer: SkillBranchStatResult) => {
      if (!isNumberString(statContainer.value)) {
        return
      }
      if (statContainer.conditionValue) {
        conditionalStatContainers.push(statContainer)
        return
      }
      const statId = statContainer.stat.statId
      if (stats.has(statId)) {
        stats
          .get(statId)!
          .add(
            statContainer.valueSum,
            statContainer.branch.default,
            StatValueSourceTypes.Skill
          )
      } else {
        stats.set(statId, statContainer.toStatRecorded(statContainer.valueSum))
      }
    }
    list
      .filter(resultState => {
        const state = skillBuild.value!.getSkillState(resultState.skill)
        return state.enabled && (state.level !== 0 || state.starGemLevel !== 0)
      })
      .forEach(resultState => {
        resultState.results
          .filter(
            result =>
              getSkillBranchState(result.container.branchItem.default).enabled
          )
          .forEach(result => {
            result.container.statContainers.forEach(handleStatContainer)
            result.suffixContainers.forEach(suffix =>
              suffix.statContainers.forEach(handleStatContainer)
            )
          })
      })
    return {
      stats: [...stats.values()],
      conditionalStatContainers,
    }
  })

  return {
    skillComputingContainer: markRaw(computingContainer),

    activeSkillResultStates,
    passiveSkillResultStates,
    allActiveSkillResultStatesMap,
    allPassiveSkillResultStatesMap,
    nextSkillResultStates,
    damageSkillResultStates,

    skillPureStats: computed(() => skillStatResults.value.stats),
    skillConditionalStatContainers: computed(
      () => skillStatResults.value.conditionalStatContainers
    ),
  }
}
