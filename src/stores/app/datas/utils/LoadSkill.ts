import Grimoire from '@/shared/Grimoire'
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
import { SkillBranchNames } from '@/lib/Skill/Skill'

import type { SkillData, SkillLocale, SkillMainData, SkillMainLocale } from '@/data/types/skill'

const DEFAULT_SET_LIST = ['預設', '非預設', '預設/and', '非預設/and', '歷史紀錄']
const MAIN_WEAPON_LIST = [
  '空手', '單手劍', '雙手劍', '弓', '弩', '法杖',
  '魔導具', '拳套', '旋風槍', '拔刀劍', '雙劍',
]
const SUB_WEAPON_LIST = ['無裝備', '箭矢', '盾牌', '小刀', '魔導具', '拳套', '拔刀劍', '忍術卷軸']
const BODY_ARMOR_LIST = ['無裝備', '輕量化', '重量化', '一般']
const SKILL_TYPE_LIST = ['瞬發', '須詠唱', '須蓄力', '被動', 'EX技能']
const IN_COMBO_LIST = ['可以放入連擊', '無法放入連擊', '不可放入連擊的第一招']
const ACTION_TIME_LIST = ['極慢', '慢', '稍慢', '一般', '稍快', '快', '極快']

const checkNull = <T extends number | string>(value: T, nullValue: T): T | null =>
  value === nullValue ? null : value

export function LoadSkill(skillSystem: SkillSystem, data: SkillData, locale?: SkillLocale) {
  const skillRoot = skillSystem.skillRoot

  data.forEach(catEntry => {
    const catName = locale?.[`category:${catEntry.id}`]?.name ?? catEntry.name
    const category = skillRoot.appendSkillTreeCategory(catEntry.id, catName)

    catEntry.trees.forEach(treeEntry => {
      const treeName = locale?.[`tree:${catEntry.id}:${treeEntry.id}`]?.name ?? treeEntry.name
      const tree = category.appendSkillTree(treeEntry.id, treeName)
      if (treeEntry.simulatorFlag) tree.attrs.simulatorFlag = true

      treeEntry.skills.forEach(skillEntry => {
        const skillName =
          locale?.[`skill:${catEntry.id}:${treeEntry.id}:${skillEntry.id}`]?.name ??
          skillEntry.name
        const skill = tree.appendSkill(skillEntry.id, skillName)

        skillEntry.effects.forEach(effectEntry => {
          const defaultSelected = DEFAULT_SET_LIST.indexOf(effectEntry.defaultSet)
          if (defaultSelected === -1) return

          let effect: SkillEffect | SkillEffectHistory
          if (defaultSelected === 4) {
            // historyTargetEffectId of -1 is a converter artifact: parseInt('0') || -1 = -1,
            // so -1 actually means effectId 0 (the first effect).
            const targetId = (effectEntry.historyTargetEffectId ?? -1) < 0 ? 0 : effectEntry.historyTargetEffectId!
            const historyEffect = skill.appendSkillEffectHistory(targetId, effectEntry.historyDate ?? '')
            if (!historyEffect) return
            effect = historyEffect
          } else {
            const mainWeapon = MAIN_WEAPON_LIST.indexOf(effectEntry.mainWeapon)
            const subWeapon = SUB_WEAPON_LIST.indexOf(effectEntry.subWeapon)
            const bodyArmor = BODY_ARMOR_LIST.indexOf(effectEntry.bodyArmor)
            effect = skill.appendSkillEffect(mainWeapon, subWeapon, bodyArmor)
          }

          if (effect instanceof SkillEffect) {
            if (defaultSelected === 0 || defaultSelected === 2) skill.setDefaultEffect(effect)
            if (defaultSelected === 2 || defaultSelected === 3) effect.equipmentOperator = 1
            effect.basicProps.mpCost = checkNull(effectEntry.mpCost, '')
            effect.basicProps.range = checkNull(effectEntry.range, '')
            effect.basicProps.skillType = checkNull(
              SKILL_TYPE_LIST.indexOf(effectEntry.skillType),
              -1
            )
            effect.basicProps.inCombo = checkNull(
              IN_COMBO_LIST.indexOf(effectEntry.inCombo),
              -1
            )
            effect.basicProps.actionTime = checkNull(
              ACTION_TIME_LIST.indexOf(effectEntry.actionTime),
              -1
            )
            effect.basicProps.castingTime = checkNull(effectEntry.castingTime, '')
          }

          effectEntry.branches.forEach(branchEntry => {
            const branch = effect.appendSkillBranch(
              branchEntry.id,
              branchEntry.name as SkillBranchNames
            )
            branchEntry.attrs.forEach(attr => {
              if (!attr.name) return
              if (!Grimoire.Character.findStatBase(attr.name)) {
                branch.appendProp(attr.name, attr.value, attr.extra)
              } else {
                branch.appendStat(attr.name, attr.value, attr.extra)
              }
            })
          })
        })

        if (!skill.defaultEffect) {
          const newEffect = skill.appendSkillEffect(0, 0, 0)
          skill.setDefaultEffect(newEffect)
        }
        skill.initTypes()
      })
    })
  })
}

export function LoadSkillMain(
  skillSystem: SkillSystem,
  data: SkillMainData,
  locale?: SkillMainLocale
) {
  const sr = skillSystem.skillRoot
  let curCategory: SkillTreeCategory | null = null
  let curTree: SkillTree | null = null

  data.forEach(entry => {
    try {
      if (entry.type === '0') {
        const cat = sr.skillTreeCategorys.find(c => c.id === entry.id)
        if (cat) {
          curCategory = cat
          const name = locale?.[`category:${entry.id}`]?.name
          if (name) cat.name = name
        }
      } else if (entry.type === '1') {
        const tree = curCategory?.skillTrees.find(t => t.id === entry.id)
        if (tree) {
          curTree = tree
          curTree.init(entry.drawTreeCode ?? '')
          const name = locale?.[`tree:${entry.id}`]?.name
          if (name) tree.name = name
        }
      } else {
        const skill = curTree?.skills.find(s => s.id === entry.id)
        if (skill) {
          skill.init(entry.previousSkill ?? -1, entry.drawOrder ?? -1)
          const name = locale?.[`skill:${entry.id}`]?.name
          if (name) skill.name = name
        }
      }
    } catch (error) {
      CommonLogger.start('LoadSkillMain', 'Unexpected error').track(error).log(entry).end()
    }
  })
}
