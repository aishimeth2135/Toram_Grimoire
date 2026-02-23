import Grimoire from '@/shared/Grimoire'
import { toInt } from '@/shared/utils/number'
import { splitComma } from '@/shared/utils/string'

import RegistletSystem from '@/lib/Registlet'
import {
  RegistletCategory,
  RegistletCategoryIds,
  type RegistletInfos,
  RegistletItemBase,
  RegistletItemBaseSkill,
  RegistletItemBaseSpecial,
  RegistletItemBaseStat,
  RegistletItemRow,
} from '@/lib/Registlet/RegistletItem'
import { Skill } from '@/lib/Skill/Skill'

import type { CsvData } from './DownloadDatas'
import { getCsvDataRowGetterHelper } from './utils'

export function LoadRegistlet(root: RegistletSystem, csvData: CsvData) {
  const { createRowGetter } = getCsvDataRowGetterHelper({
    'id': 0,
    'name': 1,
    'obtain-levels': 2,
    'max-level': 3,
    'powder-cost/base': 4,
    'powder-cost/additional': 5,
    'link': 6,
    'type': 7,
    'value': 8,

    // category
    'category/id': 0,
  })

  const categoryIdList: string[] = [
    RegistletCategoryIds.Skill,
    RegistletCategoryIds.Special,
    RegistletCategoryIds.Stat,
  ]
  const isCategoryId = (str: string): str is RegistletCategoryIds => categoryIdList.includes(str)

  let currentCategory: RegistletCategory | null = null
  let currentItem: RegistletItemBase | null = null
  let idPrefix = ''

  csvData.forEach(rowData => {
    const { row } = createRowGetter(rowData)

    if (row('category/id') && row('category/id').startsWith('@')) {
      const categoryId = row('category/id').slice(1)
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

    const handleIntegerData = (data: string) => toInt(data) ?? 0

    if (row('id') && row('name')) {
      const powderCost = handleIntegerData(row('powder-cost/base'))
      const infos: RegistletInfos = {
        id: row('id'),
        name: row('name'),
        obtainLevels: row('obtain-levels')
          .split(/\s*,\s*/)
          .map(item => toInt(item))
          .filter(item => item !== null) as number[],
        maxLevel: handleIntegerData(row('max-level')),
        powderCost,
        powderCostAdditional: row('powder-cost/additional')
          ? handleIntegerData(row('powder-cost/additional'))
          : powderCost * 10,
      }

      if (currentCategory.id === RegistletCategoryIds.Stat) {
        const statBase = Grimoire.Character.findStatBase(row('link'))
        if (statBase) {
          const newItem = new RegistletItemBaseStat(
            currentCategory as RegistletCategory<RegistletItemBaseStat>,
            infos,
            statBase
          )
          currentCategory.appendItem(newItem)
          currentItem = newItem
        }
      } else if (currentCategory.id === RegistletCategoryIds.Skill) {
        const skills = splitComma(row('link'))
          .map(item => Grimoire.Skill.skillRoot.findSkillById(item))
          .filter(item => item) as Skill[]
        infos.id = `-${idPrefix}-${infos.id}`
        const newItem = new RegistletItemBaseSkill(
          currentCategory as RegistletCategory<RegistletItemBaseSkill>,
          infos,
          skills
        )
        currentCategory.appendItem(newItem)
        currentItem = newItem
      } else if (currentCategory.id === RegistletCategoryIds.Special) {
        const newItem = new RegistletItemBaseSpecial(
          currentCategory as RegistletCategory<RegistletItemBaseSpecial>,
          infos
        )
        currentCategory.appendItem(newItem)
        currentItem = newItem
      }
    } else if (row('id')) {
      idPrefix = row('id')
    }

    if (!currentItem) {
      return
    }

    let defaultRowType = 'caption'
    if (currentItem instanceof RegistletItemBaseStat) {
      defaultRowType = 'value'
    }
    const rowType = row('type') || defaultRowType
    const itemRow = new RegistletItemRow(rowType, row('value'))
    currentItem.rows.push(itemRow)
  })
}
