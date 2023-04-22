import { shallowReactive } from 'vue'

import {
  HandleFormulaMethods,
  HandleFormulaTexts,
  HandleFormulaVars,
} from '@/shared/utils/data'

import { EquipmentTypes } from '@/lib/Character/CharacterEquipment'
import { EquipmentRestrictions } from '@/lib/Character/Stat'

import { Skill, SkillEffect, SkillEffectHistory } from '../Skill'
import { SkillBranchItem } from './SkillBranchItem'
import { FormulaDisplayModes } from './enums'
import {
  convertEffectEquipment,
  effectOverwrite,
  handleVirtualBranches,
  initBasicBranchItem,
  initBranchSpecialProps,
  initBranchesPostpone,
  initHistoryNexts,
  initStackStates,
  normalizeBaseBranches,
  regressHistoryBranches,
  separateSuffixBranches,
  setBranchAttrsDefaultValue,
} from './utils'

interface HandleFormulaExtends {
  vars: HandleFormulaVars
  texts: HandleFormulaTexts
  methods?: HandleFormulaMethods
}

interface SkillFormulaExtraProps {
  max: number | null
  min: number | null
}

/**
 * @vue-reactive controller
 */
class SkillComputingContainer {
  varGetters: {
    characterLevel: (() => number) | null
    skillLevel: ((skill: Skill) => number) | null
    registletLevel: ((skill: Skill) => number[]) | null
  }

  handleFormulaExtends: HandleFormulaExtends

  handleFormulaDynamicExtends: (() => HandleFormulaExtends)[]

  config: {
    formulaDisplayMode: FormulaDisplayModes
    getFormulaExtraValue:
      | ((
          branch: SkillBranchItem,
          id: string,
          props?: SkillFormulaExtraProps
        ) => number | null)
      | null
    computeFormulaExtraValue: ((formula: string) => number | null) | null
  }

  constructor() {
    this.varGetters = {
      characterLevel: null,
      skillLevel: null,
      registletLevel: null,
    }
    this.handleFormulaExtends = {
      vars: {},
      texts: {},
    }
    this.handleFormulaDynamicExtends = []
    this.config = shallowReactive({
      formulaDisplayMode: FormulaDisplayModes.Normal,
      getFormulaExtraValue: null,
      computeFormulaExtraValue: null,
    })
  }
}

/**
 * @vue-reactive raw
 */
class SkillItem {
  readonly skill: Skill
  readonly effectItems: SkillEffectItem[]

  constructor(skill: Skill) {
    this.skill = skill

    const defaultSef = skill.defaultEffect
    const otherSefs = skill.effects.filter(sef => sef !== defaultSef)
    this.effectItems = [
      new SkillEffectItem(this, defaultSef),
      ...otherSefs.map(sef => new SkillEffectItem(this, defaultSef, sef)),
    ]
  }

  findEffectItem(
    equipment: EquipmentRestrictions,
    getSkillLevel?: (skill: Skill) => number
  ) {
    return (
      this.effectItems.find(effectItem =>
        effectItem.equipmentMatch(equipment, getSkillLevel)
      ) ?? null
    )
  }
}

type EquipmentRestrictionsBaseKeys = 'main' | 'sub' | 'body'

interface BranchGroupState {
  readonly size: number
  readonly expandable: boolean
  expanded: boolean
  parentExpanded: boolean
  isGroupEnd: boolean
}

interface BranchStackState {
  readonly stackId: number
  readonly branch: SkillBranchItem
  value: number
}

abstract class SkillEffectItemBase {
  abstract readonly branchItems: SkillBranchItem<SkillEffectItemBase>[]

  readonly parent: SkillItem

  // reactive: init in `initStackStates`
  readonly stackStates: BranchStackState[]

  constructor(parent: SkillItem) {
    this.parent = parent
    this.stackStates = []
  }

  getStackState(stackId: number) {
    return this.stackStates.find(state => state.stackId === stackId) ?? null
  }
}

/**
 * @vue-reactive raw
 */
class SkillEffectItem extends SkillEffectItemBase {
  override branchItems: SkillBranchItem<SkillEffectItem>[]

  readonly equipments: EquipmentRestrictions[]
  readonly historys: SkillEffectItemHistory[]

  basicBranchItem!: SkillBranchItem<SkillEffectItem>

  constructor(parent: SkillItem, defaultSef: SkillEffect, from?: SkillEffect) {
    super(parent)

    this.branchItems = normalizeBaseBranches(defaultSef.branches).map(
      bch => new SkillBranchItem(this, bch)
    )
    initBasicBranchItem(this, defaultSef)

    const current = from ? from : defaultSef
    const dualSwordRegress = defaultSef.parent.effects.every(
      eft => eft.mainWeapon !== 10
    )
    this.equipments = convertEffectEquipment(current, dualSwordRegress)

    this.historys = current.historys.map(
      history => new SkillEffectItemHistory(parent, this, history)
    )

    if (from) {
      effectOverwrite(this, from)
    }
    setBranchAttrsDefaultValue(this)
    initBranchSpecialProps(this)

    regressHistoryBranches(this)

    separateSuffixBranches(this)
    handleVirtualBranches(this)
    initBranchesPostpone(this)

    this.historys.forEach(history => {
      separateSuffixBranches(history)
      handleVirtualBranches(history)
      initStackStates(history)
      initHistoryNexts(history)
    })

    initStackStates(this)
  }

  equipmentMatch(
    equipment: EquipmentRestrictions,
    getSkillLevel?: (skill: Skill) => number
  ): boolean {
    const equipments = this.equipments.slice()

    // 雙手合持 (0-6-11)
    if (getSkillLevel && this.parent.skill.skillId === '0-6-11') {
      // 忍道 (4-5-1)
      const skillNinjaSpirit =
        this.parent.skill.parent.parent.parent.findSkillById('4-5-1')
      if (skillNinjaSpirit) {
        const skillNinjaSpiritLevel = getSkillLevel(skillNinjaSpirit)
        if (skillNinjaSpiritLevel === 10) {
          const mainRest = equipments.find(
            rest => rest.main !== null && rest.sub === null
          )
          if (mainRest) {
            equipments.push(
              new EquipmentRestrictions({
                main: mainRest.main,
                sub: EquipmentTypes.NinjutsuScroll,
              })
            )
          }
        }
      }
    }

    return equipments.some(effectEquipment => {
      if (
        effectEquipment.main === null &&
        effectEquipment.sub === null &&
        effectEquipment.body === null
      ) {
        return true
      }
      return (['main', 'sub', 'body'] as const).every(key => {
        if (effectEquipment[key] === null) {
          return true
        }
        return effectEquipment[key] === equipment[key]
      })
    })
  }

  equipmentId() {
    const keys = ['main', 'sub', 'body'] as const
    return this.equipments
      .map(equip => keys.map(key => equip[key] || 'none').join('+'))
      .join('/')
  }

  resetStackStates(vars: { slv: number; clv: number }) {
    this.historys.forEach(history => {
      initStackStates(history, vars)
    })
    initStackStates(this, vars)
  }
}

/**
 * @vue-reactive raw
 */
class SkillEffectItemHistory extends SkillEffectItemBase {
  override branchItems: SkillBranchItem<SkillEffectItemHistory>[]

  readonly origin: SkillEffectHistory
  readonly parentEffect: SkillEffectItem
  readonly date: string
  readonly introductionBranches: SkillBranchItem[]
  readonly removedBranches: SkillBranchItem[]
  nextEffect!: SkillEffectItemBase

  // store the previous branch of every item in branchItems
  nexts: Map<SkillBranchItem, SkillBranchItem | null>

  constructor(
    parent: SkillItem,
    parentEffect: SkillEffectItem,
    historyEffect: SkillEffectHistory
  ) {
    super(parent)
    this.branchItems = normalizeBaseBranches(historyEffect.branches).map(
      bch => new SkillBranchItem(this, bch)
    )

    this.origin = historyEffect
    this.parentEffect = parentEffect
    this.date = historyEffect.date
    this.nexts = new Map()
    this.introductionBranches = []
    this.removedBranches = []
  }

  get modifiedBranchItems() {
    return this.branchItems.filter(branchItem => {
      if (
        branchItem.id !== -1 &&
        this.origin.branches.find(bch => bch.id === branchItem.id)
      ) {
        return true
      }
      return branchItem.suffixBranches.some(
        suffix =>
          suffix.id !== -1 &&
          this.origin.branches.find(bch => suffix.id === bch.id)
      )
    })
  }
}

export {
  SkillComputingContainer,
  SkillItem,
  SkillEffectItem,
  SkillEffectItemHistory,
  EquipmentRestrictions,
}

export type {
  SkillEffectItemBase,
  BranchGroupState,
  BranchStackState,
  EquipmentRestrictionsBaseKeys,
  SkillFormulaExtraProps,
}
