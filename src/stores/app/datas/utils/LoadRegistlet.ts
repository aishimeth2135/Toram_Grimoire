import Grimoire from '@/shared/Grimoire'
import { isIntegerString } from '@/shared/utils/string'

import RegistletSystem from '@/lib/Registlet'
import { RegistletCategory, RegistletInfos, RegistletItemBase, RegistletItemBaseSkill, RegistletItemBaseSpecial, RegistletItemBaseStat, RegistletItemRow } from '@/lib/Registlet/Registlet'
import { RegistletCategoryIds } from '@/lib/Registlet/Registlet/enums'

import type { CsvData } from './DownloadDatas'

export default function (root: RegistletSystem, csvData: CsvData) {
  const ID = 0,
    NAME = 1,
    OBTAIN_LEVELS = 2,
    MAX_LEVEL = 3,
    POWDER_COST = 4,
    POWDER_COST_ADDITIONAL = 5,
    LINK = 6,
    ROW_TYPE = 7,
    ROW_VALUE = 8,
    CATEGORY = {
      ID: 1,
    }
  const categoryIdList: string[] = [
    RegistletCategoryIds.Skill,
    RegistletCategoryIds.Special,
    RegistletCategoryIds.Stat,
  ]
  const isCategoryId = (str: string): str is RegistletCategoryIds => categoryIdList.includes(str)

  let currentCategory: RegistletCategory | null = null
  let currentItem: RegistletItemBase | null = null

  csvData.forEach(row => {
    if (row[CATEGORY.ID] && row[CATEGORY.ID].startsWith('@')) {
      const categoryId = row[CATEGORY.ID].slice(1)
      if (isCategoryId(categoryId)) {
        if (categoryId === RegistletCategoryIds.Skill) {
          currentCategory = root.skillCategory
        } else if (categoryId === RegistletCategoryIds.Stat) {
          currentCategory = root.statCategory
        } else if (categoryId === RegistletCategoryIds.Special) {
          currentCategory = root.specialCategory
        }
      }
    }
    if (!currentCategory) {
      return
    }

    const handleIntegerData = (data: string) => isIntegerString(data) ? parseInt(data, 10) : 0

    if (row[ID] && row[NAME]) {
      const powderCost = handleIntegerData(row[POWDER_COST])
      const infos: RegistletInfos = {
        id: row[ID],
        name: row[NAME],
        obtainLevels: row[OBTAIN_LEVELS].split(/\s*,\s*/)
          .filter(item => isIntegerString(item))
          .map(item => parseInt(item, 10)),
        maxLevel: handleIntegerData(row[MAX_LEVEL]),
        powderCost,
        powderCostAdditional: row[POWDER_COST_ADDITIONAL] ? handleIntegerData(row[POWDER_COST_ADDITIONAL]) : powderCost * 10,
      }

      if (currentCategory.id === RegistletCategoryIds.Stat) {
        const statBase = Grimoire.Character.findStatBase(row[LINK])
        if (statBase) {
          const newItem = new RegistletItemBaseStat(currentCategory as RegistletCategory<RegistletItemBaseStat>, infos, statBase)
          currentCategory.items.push(newItem)
          currentItem = newItem
        }
      } else if (currentCategory.id === RegistletCategoryIds.Skill) {
        const skill = row[LINK] ? Grimoire.Skill.skillRoot.findSkillById(row[LINK]) : null
        const newItem = new RegistletItemBaseSkill(currentCategory as RegistletCategory<RegistletItemBaseSkill>, infos, skill)
        currentCategory.items.push(newItem)
        currentItem = newItem
      } else if (currentCategory.id === RegistletCategoryIds.Special) {
        const newItem = new RegistletItemBaseSpecial(currentCategory as RegistletCategory<RegistletItemBaseSpecial>, infos)
        currentCategory.items.push(newItem)
        currentItem = newItem
      }
    }

    if (!currentItem) {
      return
    }

    let defaultRowType = 'caption'
    if (currentItem instanceof RegistletItemBaseStat) {
      defaultRowType = 'value'
    }
    const rowType = row[ROW_TYPE] || defaultRowType
    const itemRow = new RegistletItemRow(rowType, row[ROW_VALUE])
    currentItem.rows.push(itemRow)
  })
}
