import { computed, ComputedRef, reactive, ref, Ref } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { isNumberString } from '@/shared/utils/string'
import { computeFormula } from '@/shared/utils/data'

import { Character, CharacterStatResult, CharacterStatResultVars } from '@/lib/Character/Character'
import SkillComputingContainer, { EquipmentRestrictions, SkillBranchItem, SkillBranchItemSuffix, SkillEffectItem } from '@/lib/Skill/SkillComputingContainer'
import { Skill, SkillBranch } from '@/lib/Skill/Skill'
import { CharacterBaseStatTypes, CharacterOptionalBaseStatTypes, EquipmentFieldTypes } from '@/lib/Character/Character/enums'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'
import { Stat, StatComputed, StatRestriction } from '@/lib/Character/Stat'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums'
import { FoodBuild } from '@/lib/Character/Food'
import { StatTypes } from '@/lib/Character/Stat/enums'
import { ResultContainerStat } from '@/lib/Skill/SkillComputingContainer/ResultContainer'

import EffectHandler from '@/views/SkillQuery/skill/branch-handlers/EffectHandler'
import DisplayDataContainer from '@/views/SkillQuery/skill/branch-handlers/utils/DisplayDataContainer'
import PassiveHandler from '@/views/SkillQuery/skill/branch-handlers/PassiveHandler'
import ExtraHandler from '@/views/SkillQuery/skill/branch-handlers/ExtraHandler'
import StackHandler from '@/views/SkillQuery/skill/branch-handlers/StackHandler'
import DamageHandler from '@/views/SkillQuery/skill/branch-handlers/DamageHandler'
import BasicHandler from '@/views/SkillQuery/skill/branch-handlers/BasicHandler'

import { SkillBuild } from '../skill-build/SkillBuild'
import { checkStatRestriction, getCharacterElement } from '../utils'
import { getSkillStatContainerValid, mergeStats } from './utils'

type DisplayDataContainerAlly = DisplayDataContainer<SkillBranchItem<SkillEffectItem>>
type DisplayDataContainerSuffixAlly = DisplayDataContainer<SkillBranchItemSuffix<SkillEffectItem>>

interface SkillResultBase {
  container: DisplayDataContainerAlly;
  suffixContainers: DisplayDataContainerSuffixAlly[];
}
export interface SkillResult extends SkillResultBase {
  root: SkillResultsState;
}

export interface SkillResultsState {
  skill: Skill;
  results: SkillResult[];
  stackContainers: DisplayDataContainerAlly[];
  basicContainer: DisplayDataContainerAlly | null;
}

interface CharacterSetupOptions {
  handleFood: boolean;
  handleActiveSkill: boolean;
  handlePassiveSkill: boolean;
  skillDisplayStatsOnly: boolean;
}

interface SkillSetupPostponeOptions {
  getCharacterStatValue: (id: string) => number;
  getCharacterPureStatValue: (id: string) => number;
  getSkillBranchItemState: (skillBranch: SkillBranch) => SkillBranchItemState;
}
interface SkillBranchItemState {
  enabled: boolean;
  vars?: Record<string, number>;
}

export interface SetupCharacterStatCategoryResultsExtended {
  (otherStats: Ref<Stat[]>, skillResult: Ref<SkillResult>): {
    categoryResults: ComputedRef<CharacterStatCategoryResult[]>;
    characterPureStats: ComputedRef<Stat[]>;
  };
}

export function setupCharacterSkills(
  character: Ref<Character | null>,
  skillBuild: Ref<SkillBuild | null>,
  handleOptions: Ref<CharacterSetupOptions>,
  postponeOptions?: SkillSetupPostponeOptions,
) {
  const isPostpone = !!postponeOptions

  const computingContainer: Ref<SkillComputingContainer> = ref(new SkillComputingContainer())
  const getSkillLevel = (skill: Skill) => skillBuild.value?.getSkillLevel(skill) ?? 0
  computingContainer.value.varGetters.skillLevel = getSkillLevel
  computingContainer.value.varGetters.characterLevel = () => character.value?.level ?? 0

  const extendVars = computed(() => {
    if (!character.value) {
      return {} as Record<string, any>
    }

    const subField = character.value.fieldEquipment(EquipmentFieldTypes.SubWeapon)

    return {
      '$BSTR': character.value.baseStatValue(CharacterBaseStatTypes.STR),
      '$BINT': character.value.baseStatValue(CharacterBaseStatTypes.INT),
      '$BAGI': character.value.baseStatValue(CharacterBaseStatTypes.AGI),
      '$BVIT': character.value.baseStatValue(CharacterBaseStatTypes.VIT),
      '$BDEX': character.value.baseStatValue(CharacterBaseStatTypes.DEX),
      '$TEC': character.value.baseStatValue(CharacterOptionalBaseStatTypes.TEC),
      '$shield_refining': character.value.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Shield) ? subField?.refining ?? 0 : 0,
      '$dagger_atk': character.value.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Dagger) ? subField?.atk ?? 0 : 0,

      // not used for handling stats of skills
      '$target_def': 0,
      '$target_level': 0,

      // postpone
      '$STR': isPostpone ? postponeOptions.getCharacterStatValue('str') : 0,
      '$INT': isPostpone ? postponeOptions.getCharacterStatValue('int') : 0,
      '$AGI': isPostpone ? postponeOptions.getCharacterStatValue('agi') : 0,
      '$VIT': isPostpone ? postponeOptions.getCharacterStatValue('vit') : 0,
      '$DEX': isPostpone ? postponeOptions.getCharacterStatValue('dex') : 0,

      '$guard_power': isPostpone ? postponeOptions.getCharacterStatValue('guard_power') : 0,
    } as Record<string, any>
  })
  computingContainer.value.handleFormulaDynamicExtends.push(() => {
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
    const additionalField = chara.fieldEquipment(EquipmentFieldTypes.Additional)
    const specialField = chara.fieldEquipment(EquipmentFieldTypes.Special)
    return {
      '@C': {
        'main': mainField ? {
          atk: mainField.atk,
          refining: mainField.refining,
          stability: mainField.stability,
        } : {
          atk: 0,
          refining: 0,
          stability: 0,
        },
        'sub': subField ? {
          atk: subField.atk || 0,
          def: subField.def || 0,
          refining: subField.refining || 0,
          stability: subField.stability || 0,
        } : {
          atk: 0,
          def: 0,
          refining: 0,
          stability: 0,
        },
        'armor': bodyField ? {
          def: bodyField.def,
          refining: bodyField.refining,
        } : {
          def: 0,
          refining: 0,
        },
        'additional': additionalField ? {
          def: additionalField.def,
          refining: additionalField.refining,
        } : {
          def: 0,
          refining: 0,
        },
        'special': specialField ? { def: specialField.def } : { def: 0 },
        'shield': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Shield) ?
          { refining: subField!.refining, def: subField!.def } :
          { refining: 0, def: 0 },
        'arrow': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Arrow) ?
          { stability: subField!.stability, atk: subField!.atk } :
          { stability: 0, atk: 0 },
        'ninjutsu_scroll': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.NinjutsuScroll) ?
          { stability: subField!.stability, atk: subField!.atk } :
          { stability: 0, atk: 0 },
        'stat': (id: string) => {
          const getter = postponeOptions?.getCharacterStatValue
          return getter ? getter(id) : 0
        },
        'pureStat': (id: string) => {
          const getter = postponeOptions?.getCharacterPureStatValue
          return getter ? getter(id) : 0
        },
      },
      getSkillLevel: (skillId: string) => {
        const skill = Grimoire.Skill.skillRoot.findSkillById(skillId)
        return skill ? getSkillLevel(skill) : 0
      },
    } as Record<string, any>
  })

  computingContainer.value.config.getFormulaExtraValue = (formula) => {
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

  const currentCharacterEquipment = computed<EquipmentRestrictions>(() => {
    if (!character.value) {
      return new EquipmentRestrictions()
    }

    const main = character.value.equipmentField(EquipmentFieldTypes.MainWeapon).equipmentType
    const sub = character.value.equipmentField(EquipmentFieldTypes.SubWeapon).equipmentType
    const body = character.value.equipmentField(EquipmentFieldTypes.BodyArmor).equipmentType
    if (main === EquipmentTypes.OneHandSword && sub === EquipmentTypes.OneHandSword) {
      return new EquipmentRestrictions({
        main: EquipmentTypes.DualSword,
        body,
      })
    }
    return new EquipmentRestrictions({ main, sub, body })
  })

  const {
    activeSkillResults,
    passiveSkillResults,
    damageSkillResults,
    skillStackContainers,
    skillBasicContainers,
  } = (() => {
    const allSkills: Skill[] = []
    Grimoire.Skill.skillRoot.skillTreeCategorys.forEach(stc => stc.skillTrees.forEach(st => allSkills.push(...st.skills)))
    const computingResultsActive: Map<Skill, ComputedRef<SkillResultBase[]>> = new Map()
    const computingResultsPassive: Map<Skill, ComputedRef<SkillResultBase[]>> = new Map()
    const computingResultsDamage: Map<Skill, ComputedRef<SkillResultBase[]>> = new Map()
    const stackContainers: Map<Skill, ComputedRef<DisplayDataContainerAlly[]>> = new Map()
    const basicContainers: Map<Skill, ComputedRef<DisplayDataContainerAlly | null>> = new Map()

    const checkPostpone = (bch: SkillBranchItem) => isPostpone ? bch.postpone : !bch.postpone
    const suffixBranchFilter = (suf: SkillBranchItemSuffix) => {
      if (!checkPostpone(suf.mainBranch)) {
        return false
      }
      return suf.is(SkillBranchNames.Extra) && suf.stats.length !== 0 && suf.prop('type') !== 'next'
    }

    const handleComputingResults = (target: ComputedRef<SkillBranchItem[]>, handler: (bch: SkillBranchItem) => DisplayDataContainer, validBranchNames: SkillBranchNames[]) => {
      return computed(() => {
        return target.value.map(bch => {
          const container = (validBranchNames.includes(bch.name) ?
            handler(bch) :
            new DisplayDataContainer({ branchItem: bch, containers: {}, statContainers: [], value: {} }) // empty container
          ) as DisplayDataContainerAlly
          const suffixContainers = bch.suffixBranches
            .filter(suffixBranchFilter)
            .map(suf => ExtraHandler(suf) as DisplayDataContainerSuffixAlly)
          return {
            container,
            suffixContainers,
          } as SkillResultBase
        })
      })
    }

    allSkills.forEach(skill => {
      const skillItem = computingContainer.value.createSkillItem(skill)

      const currentEffectItem = computed(() => skillItem.findEffectItem(currentCharacterEquipment.value) ?? null)

      // active
      const checkBranchStats = (stats: StatComputed[]) => !handleOptions.value.skillDisplayStatsOnly || stats.length !== 0
      const checkActive = (bch: SkillBranchItem) => {
        if (!checkPostpone(bch)) {
          return false
        }
        if (bch.is(SkillBranchNames.Effect)) {
          return checkBranchStats(bch.stats) || bch.suffixBranches.some(suffixBranchFilter)
        }
        return false
      }
      const activeValid = skillItem.effectItems.some(effectItem => effectItem.branchItems.some(checkActive))
      const activeSkillBranchItems = !activeValid ? null : computed(() => {
        return currentEffectItem.value?.branchItems.filter(checkActive) ?? []
      })

      // passive
      const checkPassive = (bch: SkillBranchItem) => {
        if (!checkPostpone(bch)) {
          return false
        }
        if (bch.is(SkillBranchNames.Passive)) {
          return checkBranchStats(bch.stats) || bch.suffixBranches.some(suffixBranchFilter)
        }
        return false
      }
      const passiveValid = skillItem.effectItems.some(effectItem => effectItem.branchItems.some(checkPassive))
      const passiveSkillBranchItems = !passiveValid ? null : computed(() => {
        return currentEffectItem.value?.branchItems.filter(checkPassive) ?? []
      })

      let damageSkillBranchItems: ComputedRef<SkillBranchItem<SkillEffectItem>[]> | null = null
      if (isPostpone) {
        // damage
        const checkDamage = (bch: SkillBranchItem) => bch.is(SkillBranchNames.Damage) && checkPostpone(bch)
        const damageValid = skillItem.effectItems.some(effectItem => effectItem.branchItems.some(checkDamage))
        damageSkillBranchItems = !damageValid ? null : computed(() => {
          return currentEffectItem.value?.branchItems.filter(checkDamage) ?? []
        })
      }

      if (activeSkillBranchItems) {
        computingResultsActive.set(skill, handleComputingResults(activeSkillBranchItems, EffectHandler, [SkillBranchNames.Effect]))
      }
      if (passiveSkillBranchItems) {
        computingResultsPassive.set(skill, handleComputingResults(passiveSkillBranchItems, PassiveHandler, [SkillBranchNames.Passive]))
      }
      if (damageSkillBranchItems) {
        computingResultsDamage.set(skill, handleComputingResults(damageSkillBranchItems, DamageHandler, [SkillBranchNames.Damage]))
      }
      if (activeSkillBranchItems || passiveSkillBranchItems || damageSkillBranchItems) {
        stackContainers.set(skill, computed(() => {
          return currentEffectItem.value?.branchItems
            .filter(_bch => _bch.is(SkillBranchNames.Stack) && !_bch.hasProp('value'))
            .map(_bch => StackHandler(_bch)) ?? []
        }))
        basicContainers.set(skill, computed(() => {
          const basicBranch = currentEffectItem.value?.branchItems.find(bch => bch.is(SkillBranchNames.Basic))
          return basicBranch ? BasicHandler(basicBranch) : null
        }))
      }
    })
    return {
      activeSkillResults: reactive(computingResultsActive),
      passiveSkillResults: reactive(computingResultsPassive),
      damageSkillResults: reactive(computingResultsDamage),
      skillStackContainers: stackContainers,
      skillBasicContainers: basicContainers,
    }
  })()

  const allSkills = computed(() => skillBuild.value?.allSkills ?? [])

  /**
   * @param skillBranch - skill branch as key from default effect of Skill
   */
  let getSkillBranchItemState: (skillBranch: SkillBranch) => SkillBranchItemState
  if (!isPostpone) {
    const skillBranchStates: Map<SkillBranch, SkillBranchItemState> | null = reactive(new Map())
    getSkillBranchItemState = (skillBranch: SkillBranch) => {
      if (!skillBranchStates.has(skillBranch)) {
        const state: SkillBranchItemState = { enabled: true }
        skillBranchStates.set(skillBranch, state)
      }
      return skillBranchStates.get(skillBranch)!
    }
  } else {
    getSkillBranchItemState = postponeOptions.getSkillBranchItemState
  }

  const getUsedStackContainers = (branchItems: SkillBranchItem[], skill: Skill) => {
    const stackIds = new Set<number>()
    branchItems.forEach(bch => bch.linkedStackIds.forEach(id => stackIds.add(id)))
    const stackIdList = [...stackIds]
    return (skillStackContainers.get(skill)?.value ?? []).filter(container => stackIdList.includes(container.branchItem.stackId!))
  }

  const getSkillResultStatesComputed = (target: Map<Skill, ComputedRef<SkillResultBase[]>>) => {
    return computed(() => {
      return allSkills.value.filter(skill => target.has(skill)).map(skill => {
        const resultBases = target.get(skill)!
        const stackContainers = getUsedStackContainers(resultBases.value.map(result => result.container.branchItem), skill)
        const basicContainer = skillBasicContainers.get(skill)!.value
        const resultStates = {
          skill,
          results: [] as SkillResult[],
          stackContainers,
          basicContainer,
        } as SkillResultsState
        const results = resultBases.value.map(item => ({
          ...item,
          root: resultStates,
        } as SkillResult))
        resultStates.results = results
        return resultStates
      })
    })
  }

  const activeSkillResultStates = getSkillResultStatesComputed(activeSkillResults)
  const passiveSkillResultStates = getSkillResultStatesComputed(passiveSkillResults)
  const damageSkillResultStates = getSkillResultStatesComputed(damageSkillResults)

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

    const stats: Map<string, Stat> = new Map()
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
        stats.get(statId)!.add(parseFloat(statContainer.value))
      } else {
        stats.set(statId, statContainer.stat.toStat(parseFloat(statContainer.value)))
      }
    }
    list
      .filter(resultState => {
        const state = skillBuild.value!.getSkillState(resultState.skill)
        return state.enabled && (state.level !== 0 || state.starGemLevel !== 0)
      })
      .forEach(resultState => {
        resultState.results
          .filter(result => getSkillBranchItemState(result.container.branchItem.default).enabled)
          .forEach(result => {
            result.container.statContainers.forEach(handleStatContainer)
            result.suffixContainers.forEach(suffix => suffix.statContainers.forEach(handleStatContainer))
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
    damageSkillResultStates,

    skillPureStats: computed(() => skillStatResults.value.stats),
    skillConditionalStatContainers: computed(() => skillStatResults.value.conditionalStatContainers),

    getSkillBranchItemState,
  }
}

export function setupFoodStats(foodBuild: Ref<FoodBuild>) {
  const allFoodBuildStats = computed(() => {
    return foodBuild.value.selectedFoods.filter(food => food.level !== 0).map(food => food.stat())
  })

  return {
    allFoodBuildStats,
  }
}

export interface CharacterStatResultWithId extends CharacterStatResult {
  id: string;
  name: string;
}
export interface CharacterStatCategoryResult {
  name: string;
  stats: CharacterStatResultWithId[];
}

export function setupCharacterStats(
  character: Ref<Character | null>,
  skillBuild: Ref<SkillBuild | null>,
  skillSetupDatas: {
    stats: Ref<Stat[]>;
    getSkillBranchItemState: (skillBranch: SkillBranch) => SkillBranchItemState;
  },
  foodStats: Ref<Stat[]>,
  handleOptions: Ref<CharacterSetupOptions>,
) {
  const allEquipmentStats = computed(() => {
    if (!character.value) {
      return []
    }
    const _checkStatRestriction = (stat: StatRestriction) => checkStatRestriction(character.value!, stat)
    const stats: Map<string, Stat> = new Map()
    character.value.equipmentFields.forEach(field => {
      if (!field.isEmpty && !field.statsDisabled()) {
        field.equipment!.getAllStats(_checkStatRestriction).forEach(stat => {
          if (stats.has(stat.statId)) {
            stats.get(stat.statId)!.add(stat.value)
          } else {
            stats.set(stat.statId, stat.pure())
          }
        })
      }
    })
    return [...stats.values()]
  })

  const equipmentElement = computed(() => character.value ? getCharacterElement(character.value) : {})

  const skill_Conversion = computed(() => {
    const stc = Grimoire.Skill.skillRoot.skillTreeCategorys.find(_stc => _stc.id === 4)
    const st = stc?.skillTrees.find(_st => _st.id === 1)
    return st?.skills.find(_skill => _skill.id === 1) ?? null
  })

  const computedVarsBase = computed(() => {
    const chara = character.value!

    const isDualSword = chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.OneHandSword) &&
        chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.OneHandSword)

    const mainField = chara.fieldEquipment(EquipmentFieldTypes.MainWeapon)
    const subField = chara.fieldEquipment(EquipmentFieldTypes.SubWeapon)
    const bodyField = chara.fieldEquipment(EquipmentFieldTypes.BodyArmor)
    const additionalField = chara.fieldEquipment(EquipmentFieldTypes.Additional)
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
        '@main': mainField ? {
          atk: mainField.atk,
          refining: mainField.refining,
          stability: mainField.stability,
        } : {
          atk: 0,
          refining: 0,
          stability: 0,
        },
        '@sub': subField ? {
          atk: subField.atk || 0,
          def: subField.def || 0,
          refining: subField.refining || 0,
          stability: subField.stability || 0,
        } : {
          atk: 0,
          def: 0,
          refining: 0,
          stability: 0,
        },
        '@armor': bodyField ? {
          def: bodyField.def,
          refining: bodyField.refining,
        } : {
          def: 0,
          refining: 0,
        },
        '@additional': additionalField ? {
          def: additionalField.def,
          refining: additionalField.refining,
        } : {
          def: 0,
          refining: 0,
        },
        '@special': specialField ? { def: specialField.def } : { def: 0 },
        '@shield': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Shield) ?
          { refining: subField!.refining, def: subField!.def } :
          { refining: 0, def: 0 },
        '@arrow': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Arrow) ?
          { stability: subField!.stability, atk: subField!.atk } :
          { stability: 0, atk: 0 },
        '@element': equipmentElement.value,
        '@skill': {
          'Conversion': skill_Conversion.value ? skillBuild.value?.getSkillLevel(skill_Conversion.value) ?? 0 : 0,
        },
      },
      conditional: {
        '@1h_sword': !isDualSword && chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.OneHandSword),
        '@2h_sword': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.TwoHandSword),
        '@bow': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Bow),
        '@bowgun': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Bowgun),
        '@staff': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Staff),
        '@magic_device': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.MagicDevice),
        '@knuckle': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Knuckle),
        '@dual_sword': isDualSword,
        '@halberd': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Halberd),
        '@katana': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Katana),
        '@main': {
          'none': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Empty),
        },
        '@sub': {
          'arrow': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Arrow),
          'shield': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Shield),
          'dagger': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Dagger),
          'knuckle': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Knuckle),
          'magic_device': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.MagicDevice),
        },
        '@armor': {
          'normal': chara.checkFieldEquipmentType(EquipmentFieldTypes.BodyArmor, EquipmentTypes.BodyNormal),
          'dodge': chara.checkFieldEquipmentType(EquipmentFieldTypes.BodyArmor, EquipmentTypes.BodyDodge),
          'defense': chara.checkFieldEquipmentType(EquipmentFieldTypes.BodyArmor, EquipmentTypes.BodyDefense),
          'none': chara.checkFieldEquipmentType(EquipmentFieldTypes.BodyArmor, EquipmentTypes.Empty),
        },
      },
    }
  })

  const basePureStatsEntries = computed(() => {
    const allStats = new Map<string, Stat>()
    mergeStats(allStats, allEquipmentStats.value)
    mergeStats(allStats, skillSetupDatas.stats.value)
    if (handleOptions.value.handleFood) {
      mergeStats(allStats, foodStats.value)
    }
    return [...allStats]
  })

  interface CharacterStatSetupResults {
    categoryResults: ComputedRef<CharacterStatCategoryResult[]>;
    characterPureStats: ComputedRef<Stat[]>;
  }

  const setupResults = (postponeStats?: Ref<Stat[]>, resultsCache?: CharacterStatSetupResults): CharacterStatSetupResults => {
    const characterPureStats = computed(() => {
      if (!character.value) {
        return []
      }
      if (postponeStats && postponeStats.value.length === 0 && resultsCache) {
        return resultsCache.characterPureStats.value
      }

      const allStats = new Map<string, Stat>(basePureStatsEntries.value.map(([statId, stat]) => [statId, stat.clone()]))

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
      }  as CharacterStatResultVars

      return categoryList.map(category => ({
        name: category.name,
        stats: category.stats.map(stat => {
          const res = stat.result(pureStats, vars)
          return {
            id: stat.id,
            name: stat.name,
            ...res,
          } as CharacterStatResultWithId
        }),
      } as CharacterStatCategoryResult)).filter(item => item.stats.length !== 0)
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

  const {
    skillPureStats: postponedSkillPureStats,
    skillConditionalStatContainers,
    activeSkillResultStates: postponedActiveSkillResultStates,
    passiveSkillResultStates: postponedPassiveSkillResultStates,
    damageSkillResultStates,
  } = setupCharacterSkills(
    character,
    skillBuild,
    handleOptions,
    {
      getCharacterStatValue: (id: string) => {
        let find!: CharacterStatResultWithId
        _characterStatCategoryResults.value.some(categoryResult => {
          const statResult = categoryResult.stats.find(stat => stat.id === id)
          if (statResult) {
            find = statResult
            return true
          }
          return false
        })
        return find ? find.resultValue : 0
      },
      getCharacterPureStatValue: (id: string) => {
        let type = StatTypes.Constant
        if (id.charAt(id.length - 1) === '%') {
          type = StatTypes.Multiplier
          id = id.slice(0, id.length - 1)
        } else if (id.charAt(id.length - 1) === '~') {
          type = StatTypes.Total
          id = id.slice(0, id.length - 1)
        }
        return _characterPureStats.value.find(stat => stat.baseId === id && stat.type === type)?.value ?? 0
      },
      getSkillBranchItemState: skillSetupDatas.getSkillBranchItemState,
    },
  )
  const finalResults = setupResults(postponedSkillPureStats, baseResults)
  const { categoryResults: characterStatCategoryResults, characterPureStats } = finalResults

  const setupCharacterStatCategoryResultsExtended: SetupCharacterStatCategoryResultsExtended = (otherStats, skillResult) => {
    const conditionalStats = computed(() => {
      if (!skillResult.value.root.basicContainer) {
        return []
      }
      const stats: Stat[] = []
      skillConditionalStatContainers.value.forEach(statContainer => {
        if (getSkillStatContainerValid(character.value, skillResult.value, statContainer)) {
          const stat = statContainer.stat.toStat(parseFloat(statContainer.value))
          stats.push(stat)
        }
      })
      const statsMap = new Map<string, Stat>()
      mergeStats(statsMap, stats)
      return [...statsMap.values()]
    })
    const stats = computed(() => {
      if (otherStats.value.length === 0 && conditionalStats.value.length === 0) {
        return []
      }
      const allStats = new Map<string, Stat>()
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
