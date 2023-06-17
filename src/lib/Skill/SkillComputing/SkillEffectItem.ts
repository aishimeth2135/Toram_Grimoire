import { EquipmentTypes } from '@/lib/Character/CharacterEquipment'
import { EquipmentRestrictions } from '@/lib/Character/Stat'

import type { Skill, SkillEffect, SkillEffectHistory } from '../Skill'
import { SkillBranchItem } from './SkillBranchItem'
import type { SkillItem } from './SkillComputingContainer'
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

export { SkillEffectItem, SkillEffectItemHistory }
export type { SkillEffectItemBase, BranchGroupState, BranchStackState }
