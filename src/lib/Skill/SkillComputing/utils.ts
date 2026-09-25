import { inplaceAssign, lastElement } from '@/shared/utils/array'
import { toIndex, toInt } from '@/shared/utils/number'

import { EquipmentTypes } from '@/lib/Character/CharacterEquipment'
import { EquipmentRestrictions, StatComputed } from '@/lib/Character/Stat'

import { SkillBranch, SkillEffect, type SkillEffectBasicProps } from '../Skill'
import { SkillBranchNames } from '../Skill'
import { SkillBranchBuffs } from './SkillBranchBuffs'
import { SkillBranchItem } from './SkillBranchItem'
import type {
  BranchGroupState,
  SkillEffectItem,
  SkillEffectItemBase,
  SkillEffectItemHistory,
} from './SkillEffectItem'
import {
  BRANCH_PROPS_DEFAULT_VALUE,
  EQUIPMENT_TYPE_BODY_ORDER,
  EQUIPMENT_TYPE_MAIN_ORDER,
  EQUIPMENT_TYPE_SUB_ORDER,
} from './consts'

function initBasicBranchItem(effectItem: SkillEffectItem, origin: SkillEffect) {
  let basicBranch = effectItem.branchItems.find(branchItem =>
    branchItem.isA(SkillBranchNames.Basic)
  )
  if (!basicBranch) {
    basicBranch = SkillBranchItem.create(effectItem, effectBasicPropsToBranch(origin))
    effectItem.branchItems.unshift(basicBranch)
  }
  effectItem.basicBranchItem = basicBranch
}

function effectOverwrite(to: SkillEffectItem, from: SkillEffect) {
  const fromBranches = from.branches.slice()
  if (!fromBranches.some(bch => bch.name === SkillBranchNames.Basic)) {
    fromBranches.unshift(effectBasicPropsToBranch(from))
  }
  branchesOverwrite(to.branchItems, fromBranches)
}

function effectBasicPropsToBranch(origin: SkillEffect) {
  const skillTypeList = ['instant', 'casting', 'charging', 'passive', 'extra']
  const actionTimeList = [
    'very_slow',
    'slow',
    'little_slow',
    'normal',
    'little_fast',
    'fast',
    'very_fast',
  ]
  const inComboList = ['1', '0', 'not_lead']

  const CONVERT_LIST: Record<string, (value: string) => string> = {
    mp_cost: value => value,
    range: value => (value === '-' ? 'no_limit' : value),
    skill_type: value => skillTypeList[toIndex(value)],
    in_combo: value => inComboList[toIndex(value)],
    action_time: value => actionTimeList[toIndex(value)],
    casting_time: value => value,
  }
  const branch = SkillBranch.create(
    origin,
    139,
    SkillBranch.generateBranchId(origin.parent.skillId, SkillBranchNames.Basic, 0),
    SkillBranchNames.Basic
  )
  ;(Object.entries(origin.basicProps) as [keyof SkillEffectBasicProps, string | number][]).forEach(
    ([key, value]) => {
      if (value !== null) {
        const attrKey = key.replace(/[A-Z]/g, char => '_' + char.toLowerCase())
        const handle = CONVERT_LIST[attrKey]
        const res = handle ? handle(value.toString()) : value.toString()
        branch.appendProp(attrKey, res)
      }
    }
  )
  return branch
}

function branchesOverwrite(to: SkillBranchItem[], from: SkillBranch[] | SkillBranchItem[]) {
  from.forEach(fromBranch => {
    if (fromBranch.overrideId === -1) {
      return
    }
    const idx = to.findIndex(bch => bch.overrideId === fromBranch.overrideId)
    if (idx === -1) {
      return
    }
    /**
     * If some `fromBranch.isExactly(SkillBranchNames.None) && fromBranch.isEmpty`.
     * Remove branch which `id` is same as `fromBranch` in `toBranches`.
     */
    if (fromBranch.isExactly(SkillBranchNames.None) && fromBranch.isEmpty) {
      to.splice(idx, 1)
      return
    }

    const toBranch = to[idx]
    branchOverwrite(toBranch, fromBranch)
  })
}

function branchOverwrite(to: SkillBranchItem, from: SkillBranch | SkillBranchItem) {
  // 相同 overrideId 的分支只有在實際類型改變時清空屬性。
  // None 表示未指定類型，保留目標類型。
  if (!from.isExactly(SkillBranchNames.None) && !to.isKindEquals(from)) {
    to.copyKindFrom(from)
    to.clearProp()
  }

  const propMap = from instanceof SkillBranch ? from.props : from.allProps
  for (const [key, value] of propMap) {
    if (value === '' && to.prop(key)) {
      to.removeProp(key)
      to.record.props.remove.push(key)
    } else {
      if (to.hasProp(key)) {
        to.record.props.overwrite.push(key)
      } else {
        to.record.props.append.push(key)
      }
      to.setProp(key, value)
    }
  }

  from.stats.forEach(stat => {
    const idx = to.stats.findIndex(_stat => stat.equals(_stat))
    const findedStat = to.stats[idx]
    if (idx === -1) {
      to.stats.push(stat.clone())
      to.record.stats.append.push([stat.baseId, stat.type])
    } else {
      if (stat.value === '') {
        to.stats.splice(idx, 1)
        to.record.stats.remove.push([stat.baseId, stat.type])
      } else {
        findedStat.value = stat.value
        to.record.stats.overwrite.push([stat.baseId, stat.type])
      }
    }
  })

  to._initDatasByProp()
}

/**
 * Should call after branch be overwritten.
 */
function initBranchSpecialProps(effectItem: SkillEffectItemBase) {
  effectItem.branchItems.forEach(bch => {
    if (
      (bch.isA(SkillBranchNames.Effect) || bch.isA(SkillBranchNames.Damage)) &&
      bch.hasProp('buffs')
    ) {
      bch.buffs = SkillBranchBuffs.create(bch.prop('buffs'))
      bch.removeProp('buffs')
    }
  })
}

/**
 * Convert equipment data of skill to array of EquipmentRestrictions
 * @param effect
 * @param dualSwordRegress - if true, it will create EquipmentRestrictions for dual-sword when main is one-hand-sword
 */
function convertEffectEquipment(
  effect: SkillEffect,
  dualSwordRegress: boolean = false
): EquipmentRestrictions[] {
  const { mainWeapon: main, subWeapon: sub, bodyArmor: body, equipmentOperator: operator } = effect

  if (main === -1 && sub === -1 && body === -1) {
    return [EquipmentRestrictions.create()]
  }
  // const results: Map<string, EquipmentRestrictions> = new Map()
  const results: [string, EquipmentRestrictions][] = []
  const appendResult = (data: EquipmentRestrictions, isMain = false) => {
    const list = [data.main, data.sub, data.body]
    if (list.every(value => value === null)) {
      return
    }
    const key = list.map(value => (value === null ? '-' : value)).join('|')
    if (isMain) {
      results.unshift([key, data])
    } else {
      results.push([key, data])
    }
  }

  const mainData = EquipmentRestrictions.create({
    main: main === -1 ? null : EQUIPMENT_TYPE_MAIN_ORDER[main],
  })
  if (
    dualSwordRegress &&
    EQUIPMENT_TYPE_MAIN_ORDER[main] === EquipmentTypes.OneHandSword &&
    operator === 0
  ) {
    appendResult(
      EquipmentRestrictions.create({
        main: EquipmentTypes.DualSword,
      })
    )
  }
  const firstResult: EquipmentRestrictions = mainData

  const subItem = sub === -1 ? null : EQUIPMENT_TYPE_SUB_ORDER[sub]
  if (operator === 1) {
    firstResult.sub = subItem
  } else {
    appendResult(
      EquipmentRestrictions.create({
        sub: subItem,
      })
    )
  }

  const bodyItem = body === -1 ? null : EQUIPMENT_TYPE_BODY_ORDER[body]
  if (operator === 1) {
    firstResult.body = bodyItem
  } else {
    appendResult(
      EquipmentRestrictions.create({
        body: bodyItem,
      })
    )
  }

  appendResult(mainData, true)

  return [...new Map(results).values()]
}

function classifyBranches(effectItem: SkillEffectItemBase) {
  const suffixBranchList = {
    [SkillBranchNames.Damage]: [
      SkillBranchNames.Extra,
      SkillBranchNames.Proration,
      SkillBranchNames.Base,
      SkillBranchNames.DamageHit,
      SkillBranchNames.DamageStat,
      SkillBranchNames.DamageSource,
    ],
    [SkillBranchNames.Effect]: [SkillBranchNames.Extra],
    [SkillBranchNames.Passive]: [SkillBranchNames.Extra],
    [SkillBranchNames.Heal]: [SkillBranchNames.Extra],
    [SkillBranchNames.List]: [SkillBranchNames.List],
    [SkillBranchNames.Table]: [SkillBranchNames.Row],
    '@global': [SkillBranchNames.FormulaExtra, SkillBranchNames.Group],
  } satisfies Partial<Record<SkillBranchNames | '@global', SkillBranchNames[]>>

  const searchSuffixList = (current: SkillBranchItem, bch: SkillBranchItem) => {
    return [
      ...current.collectKindConfigs<SkillBranchNames[]>(suffixBranchList).flat(),
      ...suffixBranchList['@global'],
    ].some(kind => bch.isA(kind))
  }

  const mainBranchNameList: SkillBranchNames[] = [
    SkillBranchNames.Damage,
    SkillBranchNames.Effect,
    SkillBranchNames.Proration,
    SkillBranchNames.List,
    SkillBranchNames.Passive,
    SkillBranchNames.Heal,
    SkillBranchNames.Text,
    SkillBranchNames.Tips,
    SkillBranchNames.Stack,
    SkillBranchNames.Reference,
    SkillBranchNames.Import,
    SkillBranchNames.Basic,
    SkillBranchNames.Table,
  ]
  const isMainBranch = (_bch: SkillBranchItem) => mainBranchNameList.some(kind => _bch.isA(kind))

  const auxiliaryBranchNameList: SkillBranchNames[] = [SkillBranchNames.Equipment]
  const isAuxiliaryBranch = (_bch: SkillBranchItem) =>
    auxiliaryBranchNameList.some(kind => _bch.isA(kind))

  const resBranches: SkillBranchItem[] = []
  const resAuxiliaryBranches: SkillBranchItem[] = []
  let spaceFlag = false

  effectItem.branchItems.forEach(branchItem => {
    if (branchItem.isA(SkillBranchNames.Space)) {
      spaceFlag = true
      return
    }

    if (isAuxiliaryBranch(branchItem)) {
      resAuxiliaryBranches.push(branchItem)
      return
    }

    const mainBranch = resBranches.length !== 0 ? lastElement(resBranches) : null

    if (!mainBranch && isMainBranch(branchItem)) {
      resBranches.push(branchItem)
      return
    }
    if (mainBranch && !spaceFlag) {
      if (branchItem.isExactly(SkillBranchNames.None)) {
        mainBranch.emptySuffixBranches.push(branchItem.toSuffix(mainBranch))
        return
      }
      if (searchSuffixList(mainBranch, branchItem)) {
        mainBranch.suffixBranches.push(branchItem.toSuffix(mainBranch))
        return
      }
    }
    if (isMainBranch(branchItem)) {
      resBranches.push(branchItem)
      spaceFlag = false
    }
  })

  inplaceAssign(effectItem.branchItems, resBranches)
  inplaceAssign(effectItem.auxiliaryBranchItems, resAuxiliaryBranches)
}

function handleVirtualBranches(effectItem: SkillEffectItemBase) {
  effectItem.branchItems.forEach(branchItem => {
    const filtered = branchItem.suffixBranches.filter(suffix => {
      if (suffix.isA(SkillBranchNames.Group)) {
        const newGroupState: BranchGroupState = {
          size: toInt(suffix.prop('size')) ?? 0,
          expandable: suffix.prop('expandable') === '1',
          expanded: suffix.prop('expansion_default') === '1',
          parentExpanded: true,
          isGroupEnd: false,
        }
        Object.assign(branchItem.groupState, newGroupState)
        return false
      }

      return true
    })

    inplaceAssign(branchItem.suffixBranches, filtered)
  })
}

export function initBranchesPostpone(effectItem: SkillEffectItem) {
  const allStackBranches = effectItem.branchItems.filter(_bch => _bch.isA(SkillBranchNames.Stack))
  const postponeVarList = ['$STR', '$INT', '$AGI', '$VIT', '$DEX', '$guard_power']
  const checkStatsContainsPostponeVar = (stats: StatComputed[]) =>
    stats.some(_stat => postponeVarList.some(stat => _stat.value.includes(stat)))
  effectItem.branchItems.forEach(bch => {
    const stackBranches = allStackBranches.filter(_bch =>
      bch.linkedStackIds.includes(_bch.stackId!)
    )
    if (stackBranches.some(_bch => _bch.postpone)) {
      bch.postpone = true
    } else if (
      checkStatsContainsPostponeVar(bch.stats) ||
      bch.suffixBranches.some(suf => checkStatsContainsPostponeVar(suf.stats))
    ) {
      bch.postpone = true
    } else if (bch.isA(SkillBranchNames.Damage)) {
      bch.postpone = true
    } else if (bch.stats.some(stat => bch.hasProp(stat.statId, 'conditionValue'))) {
      bch.postpone = true
    }
  })
}

function regressHistoryBranches(effectItem: SkillEffectItem) {
  // 日期新的擺前面
  effectItem.historys.sort((item1, item2) =>
    new Date(item1.date) <= new Date(item2.date) ? 1 : -1
  )
  effectItem.historys.forEach((history, idx, ary) => {
    const nextEffect = idx === 0 ? effectItem : ary[idx - 1]
    history.nextEffect = nextEffect
    const toBranches = nextEffect.branchItems.map(bch => bch.clone(history))
    const fromBranches = history.branchItems
    let meetFirstBranchHasId = false
    fromBranches.forEach(historyBch => {
      if (historyBch.overrideId === -1) {
        if (meetFirstBranchHasId) {
          history.removedBranches.push(historyBch)
          toBranches.push(historyBch)
        } else {
          history.introductionBranches.push(historyBch)
          toBranches.unshift(historyBch)
        }
        return
      }
      meetFirstBranchHasId = true
    })
    branchesOverwrite(toBranches, fromBranches)
    inplaceAssign(history.branchItems, toBranches)
  })
}

function initHistoryNexts(history: SkillEffectItemHistory) {
  history.modifiedBranchItems.forEach(branchItem => {
    const next = branchItem.hasId()
      ? history.nextEffect.branchItems.find(bch => branchItem.overrideId === bch.overrideId)
      : history.nextEffect.branchItems.find(bch =>
          [...bch.suffixBranches, ...bch.emptySuffixBranches].some(
            suf =>
              suf.hasId() &&
              branchItem.suffixBranches.some(_suf => suf.overrideId === _suf.overrideId)
          )
        )
    if (next) {
      const nextClone = next.clone(history)
      nextClone.setHistoryRecord(branchItem.record)
      nextClone.suffixBranches.forEach(suffix => {
        const find = branchItem.suffixBranches.find(suf => suf.overrideId === suffix.overrideId)
        if (find) {
          suffix.setHistoryRecord(find.record)
        }
      })
      history.nexts.set(branchItem.instanceId, nextClone)
    }
  })
}

function setBranchAttrsDefaultValue(effectItem: SkillEffectItem) {
  effectItem.branchItems.forEach(branchItem => {
    const defaultValueList: Record<string, string> = Object.assign(
      {},
      ...branchItem.collectKindConfigs(BRANCH_PROPS_DEFAULT_VALUE)
    )
    if (defaultValueList) {
      Object.entries(defaultValueList).forEach(([key, value]) => {
        if (!branchItem.hasProp(key)) {
          branchItem.setProp(key, value)
        }
      })
    }
  })
}

function resolveExtendBranches(effectItem: SkillEffectItemBase) {
  const resolving = new Set<SkillBranchItem>()
  const resolved = new Map<SkillBranchItem, boolean>()

  const resolve = (branch: SkillBranchItem): boolean => {
    if (!branch.isExactly(SkillBranchNames.Extend)) {
      return true
    }
    if (resolved.has(branch)) {
      return resolved.get(branch)!
    }
    if (resolving.has(branch)) {
      return false
    }

    resolving.add(branch)
    const targetId = toInt(branch.prop('extend'))
    const target = effectItem.branchItems.find(
      item => item.overrideId === targetId && item !== branch
    )
    if (!target || !resolve(target)) {
      resolving.delete(branch)
      resolved.set(branch, false)
      return false
    }

    const ownProps = new Map(branch.allProps)
    const ownStats = branch.stats.map(stat => stat.clone())
    branch.copyKindFrom(target)
    branch.clearProp()
    target.allProps.forEach((value, key) => branch.setProp(key, value))
    ownProps.forEach((value, key) => {
      if (value === '' && branch.hasProp(key)) {
        branch.removeProp(key)
      } else {
        branch.setProp(key, value)
      }
    })
    branch.stats.splice(0, branch.stats.length, ...target.stats.map(stat => stat.clone()))
    ownStats.forEach(stat => {
      const idx = branch.stats.findIndex(inherited => inherited.equals(stat))
      if (idx === -1) {
        if (stat.value !== '') {
          branch.stats.push(stat)
        }
      } else if (stat.value === '') {
        branch.stats.splice(idx, 1)
      } else {
        branch.stats[idx].value = stat.value
      }
    })
    branch._initDatasByProp()

    resolving.delete(branch)
    resolved.set(branch, true)
    return true
  }

  inplaceAssign(
    effectItem.branchItems,
    effectItem.branchItems.filter(branch => resolve(branch))
  )
}

export {
  initBasicBranchItem,
  convertEffectEquipment,
  effectOverwrite,
  initBranchSpecialProps,
  classifyBranches,
  handleVirtualBranches,
  regressHistoryBranches,
  initHistoryNexts,
  setBranchAttrsDefaultValue,
  resolveExtendBranches,
}
