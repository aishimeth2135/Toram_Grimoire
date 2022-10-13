import {
  ComputedRef,
  Ref,
  computed,
  reactive,
  ref,
  shallowReactive,
  shallowReadonly,
  watch,
} from 'vue'

import Grimoire from '@/shared/Grimoire'
import { computeFormula } from '@/shared/utils/data'
import { isNumberString } from '@/shared/utils/string'

import {
  Character,
  CharacterStatResult,
  CharacterStatResultVars,
} from '@/lib/Character/Character'
import {
  CharacterBaseStatTypes,
  CharacterOptionalBaseStatTypes,
  EquipmentFieldTypes,
} from '@/lib/Character/Character/enums'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums'
import { FoodBuild } from '@/lib/Character/Food'
import { StatComputed, StatRestriction } from '@/lib/Character/Stat'
import { StatRecorded } from '@/lib/Character/Stat'
import { Skill, SkillBranch } from '@/lib/Skill/Skill'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'
import SkillComputingContainer, {
  EquipmentRestrictions,
  SkillBranchItem,
  SkillBranchItemSuffix,
  SkillEffectItem,
  SkillFormulaExtraProps,
  SkillItem,
} from '@/lib/Skill/SkillComputingContainer'
import { ResultContainerStat } from '@/lib/Skill/SkillComputingContainer/ResultContainer'
import { SkillBuffs } from '@/lib/Skill/SkillComputingContainer/enums'

import BasicHandler from '@/views/SkillQuery/skill/branch-handlers/BasicHandler'
import DamageHandler from '@/views/SkillQuery/skill/branch-handlers/DamageHandler'
import EffectHandler from '@/views/SkillQuery/skill/branch-handlers/EffectHandler'
import ExtraHandler from '@/views/SkillQuery/skill/branch-handlers/ExtraHandler'
import PassiveHandler from '@/views/SkillQuery/skill/branch-handlers/PassiveHandler'
import StackHandler from '@/views/SkillQuery/skill/branch-handlers/StackHandler'
import DisplayDataContainer from '@/views/SkillQuery/skill/branch-handlers/handle/DisplayDataContainer'

import { SkillBuild } from '../skill-build/SkillBuild'
import { checkStatRestriction, getCharacterElement } from '../utils'
import { getSkillStatContainerValid, mergeStats } from './utils'

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
  results: SkillResult[]
  stackContainers: DisplayDataContainerAlly[]
  basicContainer: DisplayDataContainerAlly | null
  hasOptions: boolean
}

interface CharacterSetupOptions {
  handleFood: boolean
  handleActiveSkill: boolean
  handlePassiveSkill: boolean
  skillDisplayStatsOnly: boolean
}

interface SkillSetupPostponeOptions {
  getCharacterStatValue: (id: string) => number
  getCharacterPureStatValue: (id: string) => number
}

export interface SkillFormulaExtraVarState extends SkillFormulaExtraProps {
  id: string
  text: string
  value: number
}

interface SkillBranchItemState {
  enabled: boolean
  formulaExtraIds: string[]
  getFormulaExtraState: (
    text: string,
    props?: SkillFormulaExtraProps
  ) => SkillFormulaExtraVarState
}

export interface SetupCharacterStatCategoryResultsExtended {
  (otherStats: Ref<StatRecorded[]>, skillResult: Ref<SkillResult>): {
    categoryResults: ComputedRef<CharacterStatCategoryResult[]>
    characterPureStats: ComputedRef<StatRecorded[]>
  }
}

interface SkillItemState {
  skillItem: SkillItem
  effectItem: ComputedRef<SkillEffectItem | null>
}

export function setupCharacterSkillItems(
  character: Ref<Character | null>,
  skillBuild: Ref<SkillBuild | null>
) {
  const currentCharacterEquipment = computed<EquipmentRestrictions>(() => {
    if (!character.value) {
      return new EquipmentRestrictions()
    }

    const main = character.value.equipmentField(
      EquipmentFieldTypes.MainWeapon
    ).equipmentType
    const sub = character.value.equipmentField(
      EquipmentFieldTypes.SubWeapon
    ).equipmentType
    const body = character.value.equipmentField(
      EquipmentFieldTypes.BodyArmor
    ).equipmentType
    if (
      main === EquipmentTypes.OneHandSword &&
      sub === EquipmentTypes.OneHandSword
    ) {
      return new EquipmentRestrictions({
        main: EquipmentTypes.DualSword,
        body,
      })
    }
    return new EquipmentRestrictions({ main, sub, body })
  })

  const allSkills: Skill[] = []
  Grimoire.Skill.skillRoot.skillTreeCategorys.forEach(stc =>
    stc.skillTrees.forEach(st => allSkills.push(...st.skills))
  )

  const skillItemStates: Map<Skill, SkillItemState> = new Map()
  allSkills.forEach(skill => {
    const skillItem = new SkillItem(skill)
    const getSkillLevel = (_skill: Skill) =>
      skillBuild.value?.getSkillLevel(_skill) ?? 0
    const currentEffectItem = computed(() =>
      skillItem.findEffectItem(currentCharacterEquipment.value, getSkillLevel)
    )
    skillItemStates.set(
      skill,
      shallowReadonly({
        skillItem,
        effectItem: currentEffectItem,
      })
    )
  })

  return { skillItemStates }
}

export function prepareSetupCharacter() {
  const getSkillBranchState = (() => {
    const skillBranchStates: Map<SkillBranch, SkillBranchItemState> | null =
      reactive(new Map())
    return (skillBranch: SkillBranch) => {
      if (!skillBranchStates.has(skillBranch)) {
        const formulaExtraStates = ref(
          new Map<string, SkillFormulaExtraVarState>()
        )
        const formulaExtraIds = shallowReactive([] as string[])
        const getFormulaExtraState = (
          id: string,
          props?: SkillFormulaExtraProps
        ) => {
          if (!formulaExtraStates.value.has(id)) {
            formulaExtraStates.value.set(id, {
              id,
              text: id,
              value: 0,
              max: null,
              min: null,
            })
            formulaExtraIds.push(id)
          }
          const state = formulaExtraStates.value.get(id)!
          if (props) {
            const { max, min } = props
            state.max = max
            state.min = min
            if (max !== null) {
              state.value = Math.min(max, state.value)
            }
            if (min !== null) {
              state.value = Math.max(min, state.value)
            }
          }
          return state
        }
        const state: SkillBranchItemState = {
          enabled: true,
          formulaExtraIds,
          getFormulaExtraState,
        }
        skillBranchStates.set(skillBranch, state)
      }
      return skillBranchStates.get(skillBranch)!
    }
  })()

  const setupCharacterSkills = (
    character: Ref<Character | null>,
    skillBuild: Ref<SkillBuild | null>,
    skillItemStates: Map<Skill, SkillItemState>,
    handleOptions: Ref<CharacterSetupOptions>,
    postponeOptions?: SkillSetupPostponeOptions
  ) => {
    const isPostpone = !!postponeOptions

    const computing = new SkillComputingContainer()
    const getSkillLevel = (skill: Skill) =>
      skillBuild.value?.getSkillLevel(skill) ?? 0
    computing.varGetters.skillLevel = getSkillLevel
    computing.varGetters.characterLevel = () => character.value?.level ?? 0

    const extendVars = computed(() => {
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
        $TEC: character.value.baseStatValue(CharacterOptionalBaseStatTypes.TEC),
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
    computing.handleFormulaDynamicExtends.push(() => {
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

    const getFormulaExtraValueVars = computed(() => {
      if (!character.value) {
        return {}
      }

      const chara = character.value

      const mainField = chara.fieldEquipment(EquipmentFieldTypes.MainWeapon)
      const subField = chara.fieldEquipment(EquipmentFieldTypes.SubWeapon)
      const bodyField = chara.fieldEquipment(EquipmentFieldTypes.BodyArmor)
      const additionalField = chara.fieldEquipment(
        EquipmentFieldTypes.Additional
      )
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

    const {
      activeSkillResults,
      passiveSkillResults,
      nextSkillResults,
      damageSkillResults,
      skillStackContainers,
      skillBasicContainers,
    } = (() => {
      const allSkills: Skill[] = []
      Grimoire.Skill.skillRoot.skillTreeCategorys.forEach(stc =>
        stc.skillTrees.forEach(st => allSkills.push(...st.skills))
      )
      const computingResultsActive: Map<
        Skill,
        ComputedRef<SkillResultBase[]>
      > = new Map()
      const computingResultsPassive: Map<
        Skill,
        ComputedRef<SkillResultBase[]>
      > = new Map()
      const computingResultsDamage: Map<
        Skill,
        ComputedRef<SkillResultBase[]>
      > = new Map()
      const computingResultsNext: Map<
        Skill,
        ComputedRef<SkillResultBase[]>
      > = new Map()
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
                : new DisplayDataContainer({
                    branchItem: bch,
                    containers: {},
                    statContainers: [],
                    value: {},
                  })
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

        // active
        const checkBranchStats = (stats: StatComputed[]) =>
          !handleOptions.value.skillDisplayStatsOnly || stats.length !== 0
        const checkActive = (bch: SkillBranchItem) => {
          if (!checkPostpone(bch)) {
            return false
          }
          if (bch.is(SkillBranchNames.Effect)) {
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
        const checkPassive = (bch: SkillBranchItem) => {
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
        const checkNext = (bch: SkillBranchItem) => {
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
              return (
                currentEffectItem.value?.branchItems.filter(checkNext) ?? []
              )
            })

        let damageSkillBranchItems: ComputedRef<
          SkillBranchItem<SkillEffectItem>[]
        > | null = null
        if (isPostpone) {
          // damage
          const checkDamage = (bch: SkillBranchItem) =>
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
        activeSkillResults: computingResultsActive,
        passiveSkillResults: computingResultsPassive,
        nextSkillResults: computingResultsNext,
        damageSkillResults: computingResultsDamage,
        skillStackContainers: stackContainers,
        skillBasicContainers: basicContainers,
      }
    })()

    const allSkills = computed(() => skillBuild.value?.allSkills ?? [])

    const getUsedStackContainers = (
      branchItems: SkillBranchItem[],
      skill: Skill
    ) => {
      const stackIds = new Set<number>()
      branchItems.forEach(bch =>
        bch.linkedStackIds.forEach(id => stackIds.add(id))
      )
      const stackIdList = [...stackIds]
      return (
        skillStackContainers
          .get(skill)
          ?.value.filter(container =>
            stackIdList.includes(container.branchItem.stackId!)
          ) ?? []
      )
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
          skill,
          stackContainers,
          basicContainer,
          hasOptions,
        }) as SkillResultsState
        const results = computed(() =>
          resultBases.value.map(
            item =>
              ({
                ...item,
                root: resultStates,
              } as SkillResult)
          )
        )
        resultStates.results = results as unknown as SkillResult[]
        _map.set(skill, resultStates)
      }
      return computed(() => {
        const results: SkillResultsState[] = []
        allSkills.value.forEach(skill => {
          if (_map.has(skill)) {
            results.push(_map.get(skill)!)
          }
        })
        return results
      })
    }

    const activeSkillResultStates =
      getSkillResultStatesComputed(activeSkillResults)
    const passiveSkillResultStates =
      getSkillResultStatesComputed(passiveSkillResults)
    const nextSkillResultStates = getSkillResultStatesComputed(nextSkillResults)
    const damageSkillResultStates =
      getSkillResultStatesComputed(damageSkillResults)

    const skillStatResults = computed(() => {
      if (!skillBuild.value) {
        return {
          stats: [],
          conditionalStatContainers: [],
        }
      }
      const list: SkillResultsState[] = []
      if (handleOptions.value.handleActiveSkill) {
        list.push(...activeSkillResultStates.value)
      }
      if (handleOptions.value.handlePassiveSkill) {
        list.push(...passiveSkillResultStates.value)
      }
      if (list.length === 0) {
        return {
          stats: [],
          conditionalStatContainers: [],
        }
      }

      const stats: Map<string, StatRecorded> = new Map()
      const conditionalStatContainers: ResultContainerStat[] = []
      const handleStatContainer = (statContainer: ResultContainerStat) => {
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
            .add(parseFloat(statContainer.value), statContainer.branch.default)
        } else {
          stats.set(
            statId,
            statContainer.toStatRecord(parseFloat(statContainer.value))
          )
        }
      }
      list
        .filter(resultState => {
          const state = skillBuild.value!.getSkillState(resultState.skill)
          return (
            state.enabled && (state.level !== 0 || state.starGemLevel !== 0)
          )
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
      activeSkillResultStates,
      passiveSkillResultStates,
      nextSkillResultStates,
      damageSkillResultStates,

      skillPureStats: computed(() => skillStatResults.value.stats),
      skillConditionalStatContainers: computed(
        () => skillStatResults.value.conditionalStatContainers
      ),
    }
  }

  const setupCharacterStats = (
    character: Ref<Character | null>,
    skillBuild: Ref<SkillBuild | null>,
    skillStats: Ref<StatRecorded[]>,
    foodStats: Ref<StatRecorded[]>,
    skillItemStates: Map<Skill, SkillItemState>,
    handleOptions: Ref<CharacterSetupOptions>
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
          '@tec': chara.baseStatValue(CharacterOptionalBaseStatTypes.TEC),
          '@men': chara.baseStatValue(CharacterOptionalBaseStatTypes.MEN),
          '@crt': chara.baseStatValue(CharacterOptionalBaseStatTypes.CRT),
          '@luk': chara.baseStatValue(CharacterOptionalBaseStatTypes.LUK),
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
      if (handleOptions.value.handleFood) {
        mergeStats(allStats, foodStats.value)
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
        const vars = {
          ...computedVarsBase.value,
          computed: {},
          computedResultStore: {},
        } as CharacterStatResultVars

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
      handleOptions,
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
              const stat = statContainer.toStatRecord(
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
    getSkillBranchState,
    setupCharacterSkills,
    setupCharacterStats,
  }
}

export function setupFoodStats(foodBuild: Ref<FoodBuild>) {
  const allFoodBuildStats = computed(() => {
    return foodBuild.value.selectedFoods
      .filter(food => food.level !== 0)
      .map(food => StatRecorded.from(food.stat(), food))
  })

  return {
    allFoodBuildStats,
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
