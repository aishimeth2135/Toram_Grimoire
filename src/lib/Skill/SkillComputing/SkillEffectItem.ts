import {
  type InstanceId,
  InstanceIdGenerator,
  type InstanceWithId,
} from '@/shared/services/InstanceId'
import { computeFormula } from '@/shared/utils/data'

import { EquipmentTypes } from '@/lib/Character/CharacterEquipment'
import { EquipmentRestrictions } from '@/lib/Character/Stat'

import { Skill, SkillBranchNames, SkillEffect, SkillEffectHistory } from '../Skill'
import { SkillBranchItem } from './SkillBranchItem'
import type { SkillItem } from './SkillComputingContainer'
import {
  classifyBranches,
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

abstract class SkillEffectItemBase implements InstanceWithId {
  private static _idGenerator = new InstanceIdGenerator()

  readonly instanceId: InstanceId

  abstract readonly branchItems: SkillBranchItem<SkillEffectItemBase>[]

  readonly parent: SkillItem

  // init in `classifyBranches`
  readonly auxiliaryBranchItems: SkillBranchItem<SkillEffectItemBase>[]

  // reactive: init in `initStackStates`
  readonly stackStates: BranchStackState[]

  constructor(parent: SkillItem) {
    this.instanceId = SkillEffectItemBase._idGenerator.generate()
    this.parent = parent
    this.stackStates = []
    this.auxiliaryBranchItems = []
  }

  get visibleBranchItems(): SkillBranchItem[] {
    return this.branchItems.filter(branch => !branch.propBoolean('invisible'))
  }

  getStackState(stackId: number) {
    return this.stackStates.find(state => state.stackId === stackId) ?? null
  }
}

/**
 * @vue-reactive-raw
 */
class SkillEffectItem extends SkillEffectItemBase {
  declare auxiliaryBranchItems: SkillBranchItem<SkillEffectItem>[]

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
    const dualSwordRegress = defaultSef.parent.effects.every(eft => eft.mainWeapon !== 10)
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

    classifyBranches(this)
    handleVirtualBranches(this)
    initBranchesPostpone(this)

    this.historys.forEach(history => {
      classifyBranches(history)
      handleVirtualBranches(history)
      initStackStates(history)
      initHistoryNexts(history)
    })

    initStackStates(this)
  }

  private computedEquipmentBranchValue(
    value: string,
    scope: { getSkillLevel?: (skillId: string) => number }
  ): boolean {
    if (!value) {
      return false
    }
    return computeFormula(value, scope, false) as boolean
  }

  equipmentMatch(
    equipment: EquipmentRestrictions,
    getSkillLevel?: (skill: Skill) => number
  ): boolean {
    const equipments = this.equipments.slice()

    // 雙手合持 (0-6-11)
    if (getSkillLevel && this.parent.skill.skillId === '0-6-11') {
      // 忍道 (4-5-1)
      const skillNinjaSpirit = this.parent.skill.parent.parent.parent.findSkillById('4-5-1')
      if (skillNinjaSpirit) {
        const skillNinjaSpiritLevel = getSkillLevel(skillNinjaSpirit)
        if (skillNinjaSpiritLevel === 10) {
          const mainRest = equipments.find(rest => rest.main !== null && rest.sub === null)
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

    const extraEquipments = (() => {
      const equipmentBranch = this.auxiliaryBranchItems.find(bch =>
        bch.is(SkillBranchNames.Equipment)
      )

      if (!equipmentBranch) {
        return null
      }

      const scope = {
        getSkillLevel: (skillId: string) => {
          if (!getSkillLevel) {
            return 0
          }
          const skill = this.parent.skill.parent.parent.parent.findSkillById(skillId)
          return skill ? getSkillLevel(skill) : 0
        },
      }

      return {
        main: this.computedEquipmentBranchValue(equipmentBranch.prop('main'), scope),
        sub: this.computedEquipmentBranchValue(equipmentBranch.prop('sub'), scope),
        body: this.computedEquipmentBranchValue(equipmentBranch.prop('body'), scope),
      }
    })()

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
        if (extraEquipments && extraEquipments[key]) {
          return true
        }
        return effectEquipment[key] === equipment[key]
      })
    })
  }

  equipmentId() {
    const keys = ['main', 'sub', 'body'] as const
    return this.equipments.map(equip => keys.map(key => equip[key] || 'none').join('+')).join('/')
  }

  resetStackStates(vars: { slv: number; clv: number }) {
    this.historys.forEach(history => {
      initStackStates(history, vars)
    })
    initStackStates(this, vars)
  }
}

/**
 * @vue-reactive-raw
 */
class SkillEffectItemHistory extends SkillEffectItemBase {
  declare auxiliaryBranchItems: SkillBranchItem<SkillEffectItemHistory>[]

  override branchItems: SkillBranchItem<SkillEffectItemHistory>[]

  readonly origin: SkillEffectHistory
  readonly parentEffect: SkillEffectItem
  readonly date: string
  readonly introductionBranches: SkillBranchItem[]
  readonly removedBranches: SkillBranchItem[]
  nextEffect!: SkillEffectItemBase

  // store the previous branch of every item in branchItems
  // Map<SkillBranchItem.instanceId, SkillBranchItem | null>
  nexts: Map<InstanceId, SkillBranchItem | null>

  constructor(parent: SkillItem, parentEffect: SkillEffectItem, historyEffect: SkillEffectHistory) {
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
      if (branchItem.hasId() && this.origin.branches.find(bch => bch.id === branchItem.id)) {
        return true
      }
      return branchItem.suffixBranches.some(
        suffix => suffix.hasId() && this.origin.branches.find(bch => suffix.id === bch.id)
      )
    })
  }
}

export { SkillEffectItem, SkillEffectItemHistory }
export type { SkillEffectItemBase, BranchGroupState, BranchStackState }
