import { markRaw } from 'vue'

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
import { initializeEffectBranches } from './assemble'
import { convertEffectEquipment, initBasicBranchItem } from './utils'

interface BranchGroupState {
  readonly size: number
  readonly expandable: boolean
  expanded: boolean
  parentExpanded: boolean
  isGroupEnd: boolean
}

// Only for constructor type check, `effectId` will be store as string
type SkillEffectItemId = `${string}-${number}`

abstract class SkillEffectItemBase implements InstanceWithId {
  private static _idGenerator = new InstanceIdGenerator()

  protected static generateEffectId(skill: Skill, effect: SkillEffect): SkillEffectItemId {
    return `${skill.skillId}-${effect.effectId}`
  }

  readonly instanceId: InstanceId
  readonly effectId: string
  readonly parent: SkillItem

  abstract readonly branchItems: SkillBranchItem<SkillEffectItemBase>[]

  // init in `classifyBranches`
  readonly auxiliaryBranchItems: SkillBranchItem<SkillEffectItemBase>[]

  protected constructor(parent: SkillItem, effectId: SkillEffectItemId) {
    this.instanceId = SkillEffectItemBase._idGenerator.generate()
    this.effectId = effectId
    this.parent = parent
    this.auxiliaryBranchItems = []
  }

  get visibleBranchItems(): SkillBranchItem[] {
    return this.branchItems.filter(branch => !branch.propBoolean('invisible'))
  }
}

class SkillEffectItem extends SkillEffectItemBase {
  declare auxiliaryBranchItems: SkillBranchItem<SkillEffectItem>[]

  override branchItems: SkillBranchItem<SkillEffectItem>[]

  readonly equipments: EquipmentRestrictions[]
  readonly historys: SkillEffectItemHistory[]

  basicBranchItem!: SkillBranchItem<SkillEffectItem>

  private constructor(parent: SkillItem, defaultSef: SkillEffect, from?: SkillEffect) {
    const effect = from ? from : defaultSef
    const effectId = SkillEffectItemBase.generateEffectId(parent.skill, effect)

    super(parent, effectId)

    this.branchItems = defaultSef.branches.map(bch => SkillBranchItem.create(this, bch))
    initBasicBranchItem(this, defaultSef)

    const dualSwordRegress = defaultSef.parent.effects.every(eft => eft.mainWeapon !== 10)
    this.equipments = convertEffectEquipment(effect, dualSwordRegress)

    this.historys = effect.historys.map((history, idx) =>
      SkillEffectItemHistory.create(parent, this, idx, history)
    )

    initializeEffectBranches(this, from)
  }

  static create(parent: SkillItem, defaultSef: SkillEffect, from?: SkillEffect): SkillEffectItem {
    return markRaw(new SkillEffectItem(parent, defaultSef, from))
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
              EquipmentRestrictions.create({
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
        bch.isA(SkillBranchNames.Equipment)
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

  get equipmentId() {
    const keys = ['main', 'sub', 'body'] as const
    return this.equipments.map(equip => keys.map(key => equip[key] || 'none').join('+')).join('/')
  }
}

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

  private constructor(
    parent: SkillItem,
    parentEffect: SkillEffectItem,
    indexId: number,
    historyEffect: SkillEffectHistory
  ) {
    super(parent, `${parentEffect.effectId}-history-${indexId}-` as SkillEffectItemId)

    this.branchItems = historyEffect.branches.map(bch => SkillBranchItem.create(this, bch))

    this.origin = historyEffect
    this.parentEffect = parentEffect
    this.date = historyEffect.date
    this.nexts = new Map()
    this.introductionBranches = []
    this.removedBranches = []
  }

  static create(
    parent: SkillItem,
    parentEffect: SkillEffectItem,
    indexId: number,
    historyEffect: SkillEffectHistory
  ): SkillEffectItemHistory {
    return markRaw(new SkillEffectItemHistory(parent, parentEffect, indexId, historyEffect))
  }

  get modifiedBranchItems() {
    return this.branchItems.filter(branchItem => {
      if (
        branchItem.hasId() &&
        this.origin.branches.find(bch => bch.overrideId === branchItem.overrideId)
      ) {
        return true
      }
      return branchItem.suffixBranches.some(
        suffix =>
          suffix.hasId() && this.origin.branches.find(bch => suffix.overrideId === bch.overrideId)
      )
    })
  }
}

export { SkillEffectItem, SkillEffectItemHistory }
export type { SkillEffectItemBase, BranchGroupState }
