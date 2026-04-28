import type { CsvData } from '../utils'
import type {
  SkillData,
  SkillCategory,
  SkillTree,
  SkillEntry,
  SkillEffect,
  SkillBranch,
} from '../../src/data/types/skill'

const SKILL_TREE_CATEGORY_CHECK = '0'
const SKILL_TREE_CHECK = '1'
const HISTORY_SET = '歷史紀錄'

export function convertSkill(csv: CsvData): SkillData {
  const result: SkillData = []
  let curCategory: SkillCategory | null = null
  let curTree: SkillTree | null = null
  let curSkill: SkillEntry | null = null
  let curEffect: SkillEffect | null = null
  let curBranch: SkillBranch | null = null

  csv.forEach((row, index) => {
    if (index === 0 || row.every(item => item === '')) return

    const rawId = row[0]
    const id = rawId !== '' ? parseInt(rawId) : null

    if (id !== null && !isNaN(id)) {
      const nameChecking = row[1]

      if (nameChecking === SKILL_TREE_CATEGORY_CHECK) {
        curCategory = { id, name: row[2], trees: [] }
        result.push(curCategory)
        curTree = null
        curSkill = null
        curEffect = null
        curBranch = null
        return
      }

      if (nameChecking === SKILL_TREE_CHECK) {
        if (!curCategory) return
        curTree = { id, name: row[2], simulatorFlag: row[3] !== '', skills: [] }
        curCategory.trees.push(curTree)
        curSkill = null
        curEffect = null
        curBranch = null
        return
      }

      // skill or new effect on existing skill
      const defaultSet = row[2]
      if (defaultSet === '') return // malformed

      if (nameChecking !== '') {
        if (!curTree) return
        curSkill = { id, name: nameChecking, effects: [] }
        curTree.skills.push(curSkill)
      }

      if (!curSkill) return

      if (defaultSet === HISTORY_SET) {
        const prevEffect = curEffect
        const parsedTargetId = parseInt(row[3])
        const targetEffectId = isNaN(parsedTargetId) ? -1 : parsedTargetId
        const historyDate = row[4] ?? ''
        curEffect = {
          defaultSet,
          mainWeapon: '',
          subWeapon: '',
          bodyArmor: '',
          mpCost: '',
          range: '',
          skillType: '',
          inCombo: '',
          actionTime: '',
          castingTime: '',
          historyTargetEffectId: targetEffectId,
          historyDate,
          branches: [],
        }
        // clone branches from previous effect if no branch id on first branch row
        if (prevEffect && !row[6]) {
          curEffect.branches = prevEffect.branches.map(b => ({ ...b, attrs: [...b.attrs] }))
        }
      } else {
        curEffect = {
          defaultSet,
          mainWeapon: row[3] ?? '',
          subWeapon: row[4] ?? '',
          bodyArmor: row[5] ?? '',
          mpCost: row[11] ?? '',
          range: row[12] ?? '',
          skillType: row[13] ?? '',
          inCombo: row[14] ?? '',
          actionTime: row[15] ?? '',
          castingTime: row[16] ?? '',
          branches: [],
        }
      }
      curSkill.effects.push(curEffect)
      curBranch = null
    } else {
      // no id — history continuation or branch/attr row
      const isHistoryRow =
        curEffect?.defaultSet === HISTORY_SET && row[4] !== ''
      if (isHistoryRow && curSkill && curEffect) {
        const prevEffect = curEffect
        curEffect = {
          ...prevEffect,
          historyDate: row[4],
          branches: [],
        }
        if (!row[6]) {
          curEffect.branches = prevEffect.branches.map(b => ({ ...b, attrs: [...b.attrs] }))
        }
        curSkill.effects.push(curEffect)
        curBranch = null
      }
    }

    if (!curEffect) return

    const branchId = row[6]
    if (branchId !== undefined && branchId !== '') {
      const branchIdNum = branchId === '-' ? -1 : parseInt(branchId) ?? -1
      curBranch = { id: branchIdNum, name: row[7] ?? '', attrs: [] }
      curEffect.branches.push(curBranch)
    }

    if (!curBranch) return

    const attrName = row[8]
    const attrValue = row[9] ?? ''
    const attrExtra = row[10] ?? ''
    if (attrName) {
      curBranch.attrs.push({ name: attrName, value: attrValue, extra: attrExtra })
    }
  })

  return result
}
