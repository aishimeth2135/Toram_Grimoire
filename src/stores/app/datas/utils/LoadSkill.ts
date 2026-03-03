import Grimoire from '@/shared/Grimoire'
import { getLanguageDataResult } from '@/shared/services/Locale'
import { CommonLogger } from '@/shared/services/Logger'
import { toInt } from '@/shared/utils/number'

import SkillSystem from '@/lib/Skill'
import {
  Skill,
  SkillBranch,
  SkillEffect,
  SkillEffectHistory,
  SkillTree,
  SkillTreeCategory,
} from '@/lib/Skill/Skill'
import type { SkillEffectBase } from '@/lib/Skill/Skill'
import { SkillBranchNames } from '@/lib/Skill/Skill'

import type { LocaleCsvDatas } from './DownloadDatas'
import { getCsvDataRowGetterHelper } from './utils'

export function LoadSkill(skillSystem: SkillSystem, datas: LocaleCsvDatas) {
  const skillRoot = skillSystem.skillRoot

  const { createRowGetter, createLocaleMapping } = getCsvDataRowGetterHelper({
    'id': 0,
    'name': 1,
    'default-set': 2,
    'main-weapon': 3,
    'sub-weapon': 4,
    'body-armor': 5,
    'effect-branch/id': 6,
    'effect-branch/name': 7,
    'effect-branch/attr/name': 8,
    'effect-branch/attr/value': 9,
    'effect-branch/attr/extra': 10,
    'mp-cost': 11,
    'range': 12,
    'skill-type': 13,
    'in-combo': 14,
    'action-time': 15,
    'casting-time': 16,

    'skill-tree-category/confirm': 1,
    'skill-tree-category/name': 2,

    'skill-tree/confirm': 1,
    'skill-tree/name': 2,
    'skill-tree/simulator-flag': 3,

    'history-effect/target-effect-id': 3,
    'history-effect/date': 4,
  })

  const DEFAULT_SET_LIST = ['預設', '非預設', '預設/and', '非預設/and', '歷史紀錄'],
    MAIN_WEAPON_LIST = [
      '空手',
      '單手劍',
      '雙手劍',
      '弓',
      '弩',
      '法杖',
      '魔導具',
      '拳套',
      '旋風槍',
      '拔刀劍',
      '雙劍',
    ],
    SUB_WEAPON_LIST = ['無裝備', '箭矢', '盾牌', '小刀', '魔導具', '拳套', '拔刀劍', '忍術卷軸'],
    BODY_ARMOR_LIST = ['無裝備', '輕量化', '重量化', '一般'],
    SKILL_TYPE_LIST = ['瞬發', '須詠唱', '須蓄力', '被動', 'EX技能'],
    IN_COMBO_LIST = ['可以放入連擊', '無法放入連擊', '不可放入連擊的第一招'],
    ACTION_TIME_LIST = ['極慢', '慢', '稍慢', '一般', '稍快', '快', '極快'],
    SKILL_TREE_CATEGORY_CHECKING_NAME = '0',
    SKILL_TREE_CHECKING_NAME = '1'

  const enum SkillElementType {
    TypeSkillTreeCategory,
    TypeSkillTree,
    TypeSkill,
    TypeSkillEffect,
  }

  let curElement: SkillElementType
  let curSkillTreeCategory: SkillTreeCategory
  let curSkillTree: SkillTree
  let curSkill: Skill
  let curSkillEffect: SkillEffectBase | void
  let curSkillBranch: SkillBranch | void

  const csvData = getLanguageDataResult(
    datas,
    createLocaleMapping({
      'effect-branch/attr/value': 0,
    })
  )

  const checkNull = <T extends number | string>(value: T, nullValue: T) => {
    return value === nullValue ? null : value
  }

  /**
   * If branch id is empty, clone branches from previous effect
   */
  const checkEffectEmpty = (
    rowGetter: ReturnType<typeof createRowGetter>['row'],
    previewEffect: SkillEffectBase | void,
    currentEffect: SkillEffectBase
  ) => {
    if (previewEffect && previewEffect !== currentEffect && !rowGetter('effect-branch/id')) {
      previewEffect.branches.forEach(bch => currentEffect.appendSkillBranchFrom(bch))
      return true
    }
    return false
  }

  csvData.forEach((rowData, index) => {
    try {
      if (index === 0 || rowData.every(item => item === '')) {
        return
      }

      const { row } = createRowGetter(rowData)

      const id = toInt(row('id'))
      if (id !== null) {
        const nameChecking = row('name')

        if (nameChecking === SKILL_TREE_CATEGORY_CHECKING_NAME) {
          const name = row('skill-tree-category/name')
          curSkillTreeCategory = skillRoot.appendSkillTreeCategory(id, name)
          curElement = SkillElementType.TypeSkillTreeCategory
        } else if (nameChecking === SKILL_TREE_CHECKING_NAME) {
          const name = row('skill-tree/name')
          curSkillTree = curSkillTreeCategory.appendSkillTree(id, name)
          curElement = SkillElementType.TypeSkillTree
          if (row('skill-tree/simulator-flag')) {
            curSkillTree.attrs.simulatorFlag = true
          }
        } else {
          if (nameChecking !== '') {
            const name = nameChecking
            curSkill = curSkillTree.appendSkill(id, name)
            curElement = SkillElementType.TypeSkill
          }

          const mainWeapon = MAIN_WEAPON_LIST.indexOf(row('main-weapon')),
            subWeapon = SUB_WEAPON_LIST.indexOf(row('sub-weapon')),
            bodyArmor = BODY_ARMOR_LIST.indexOf(row('body-armor')),
            defaultSelected = DEFAULT_SET_LIST.indexOf(row('default-set'))
          if (defaultSelected === -1) {
            return
          }
          const previousEffect = curSkillEffect
          if (defaultSelected !== 4) {
            curSkillEffect = curSkill.appendSkillEffect(mainWeapon, subWeapon, bodyArmor)
          } else {
            const targetEffectId = toInt(row('history-effect/target-effect-id')) ?? -1
            curSkillEffect = curSkill.appendSkillEffectHistory(
              targetEffectId,
              row('history-effect/date')
            )
          }
          curElement = SkillElementType.TypeSkillEffect
          if (curSkillEffect && curSkillEffect instanceof SkillEffect) {
            if (defaultSelected === 0 || defaultSelected === 2) {
              curSkill.setDefaultEffect(curSkillEffect)
            }
            if (defaultSelected === 2 || defaultSelected === 3) {
              curSkillEffect.equipmentOperator = 1
            }
            curSkillEffect.basicProps.mpCost = checkNull(row('mp-cost'), '')
            curSkillEffect.basicProps.range = checkNull(row('range'), '')
            curSkillEffect.basicProps.skillType = checkNull(
              SKILL_TYPE_LIST.indexOf(row('skill-type')),
              -1
            )
            curSkillEffect.basicProps.inCombo = checkNull(
              IN_COMBO_LIST.indexOf(row('in-combo')),
              -1
            )
            curSkillEffect.basicProps.actionTime = checkNull(
              ACTION_TIME_LIST.indexOf(row('action-time')),
              -1
            )
            curSkillEffect.basicProps.castingTime = checkNull(row('casting-time'), '')
            if (checkEffectEmpty(row, previousEffect, curSkillEffect)) {
              return
            }
          }
        }
      } else if (
        curSkillEffect instanceof SkillEffectHistory &&
        row('history-effect/date') !== ''
      ) {
        const previousEffect = curSkillEffect
        curSkillEffect = curSkill.appendSkillEffectHistory(
          curSkillEffect.parentEffect.effectId,
          row('history-effect/date')
        )
        if (checkEffectEmpty(row, previousEffect, curSkillEffect!)) {
          return
        }
      }
      if (curElement !== SkillElementType.TypeSkillEffect || !curSkillEffect) {
        return
      }
      const branchId = row('effect-branch/id') || null
      if (branchId !== null) {
        const branchIdNum = branchId === '-' ? -1 : (toInt(row('effect-branch/id')) ?? -1)
        const branchName = row('effect-branch/name')
        curSkillBranch = curSkillEffect.appendSkillBranch(
          branchIdNum,
          branchName as SkillBranchNames
        )
      }
      if (!curSkillBranch) {
        return
      }
      const attrName = row('effect-branch/attr/name'),
        attrValue = row('effect-branch/attr/value')
      if (attrName !== '') {
        if (!Grimoire.Character.findStatBase(attrName)) {
          curSkillBranch.appendProp(attrName, attrValue, row('effect-branch/attr/extra'))
        } else {
          curSkillBranch.appendStat(attrName, attrValue, row('effect-branch/attr/extra'))
        }
      }
    } catch (err) {
      CommonLogger.warn('LoadSkill', 'Unable to parse row:', rowData)
      CommonLogger.track(err)
    }
  })

  skillSystem.skillRoot.skillTreeCategorys.forEach(stc => {
    stc.skillTrees.forEach(st => {
      st.skills.forEach(skill => {
        if (!skill.defaultEffect) {
          const newEffect = skill.appendSkillEffect(0, 0, 0)
          skill.setDefaultEffect(newEffect)
        }
        skill.initTypes()
      })
    })
  })
}

export function LoadSkillMain(skillSystem: SkillSystem, datas: LocaleCsvDatas) {
  const sr = skillSystem.skillRoot

  const { createRowGetter, createLocaleMapping } = getCsvDataRowGetterHelper({
    'type-checking': 0,
    'id': 1,
    'previous-skill': 2,
    'skill/draw-tree-order': 3,

    'skill-tree/draw-tree-code': 3,

    // Note:
    // The original csv data row length is 4.
    // This is the added data for filling the locale name and will make the row length to 5.
    'name': 4,
  })

  const SKILL_TREE_CATEGORY_CHECKING = '0',
    SKILL_TREE_CHECKING = '1'

  let curSkillTreeCategory: SkillTreeCategory
  let curSkillTree: SkillTree

  const csvData = getLanguageDataResult(
    datas,
    createLocaleMapping({
      name: 0,
    })
  )

  csvData.forEach((rowData, idx) => {
    if (idx === 0) {
      return
    }

    const { row } = createRowGetter(rowData)

    if (row('id') === '') {
      return
    }

    try {
      const typeChecking = row('type-checking'),
        idToSearch = toInt(row('id')),
        name = row('name')
      if (typeChecking === SKILL_TREE_CATEGORY_CHECKING) {
        const skillTreeCategory = sr.skillTreeCategorys.find(item => item.id === idToSearch)
        if (skillTreeCategory) {
          curSkillTreeCategory = skillTreeCategory
          if (name) {
            skillTreeCategory.name = name
          }
        }
      } else if (typeChecking === SKILL_TREE_CHECKING) {
        const skillTree = curSkillTreeCategory.skillTrees.find(item => item.id === idToSearch)
        if (skillTree) {
          curSkillTree = skillTree
          curSkillTree.init(row('skill-tree/draw-tree-code'))
          if (name) {
            skillTree.name = name
          }
        }
      } else if (typeChecking === '') {
        const skill = curSkillTree.skills.find(item => item.id === idToSearch)
        if (skill) {
          skill.init(
            row('previous-skill') === '-' ? -1 : (toInt(row('previous-skill')) ?? -1),
            toInt(row('skill/draw-tree-order')) ?? -1
          )
          if (name) {
            skill.name = name
          }
        }
      }
    } catch (error) {
      CommonLogger.start('LoadSkillMain', 'Unexpected error').track(error).log(rowData).end()
    }
  })
}
