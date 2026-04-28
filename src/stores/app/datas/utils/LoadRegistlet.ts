import Grimoire from '@/shared/Grimoire'

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

import type { RegistletData, RegistletLocale } from '@/data/types/registlet'

function loadCategory(
  root: RegistletSystem,
  category: RegistletCategory<RegistletItemBase>,
  categoryData: RegistletData['skillCategory'],
  isSkill: boolean,
  isStat: boolean,
  localeSection?: Record<string, { name?: string }>
) {
  categoryData.groups.forEach(group => {
    group.items.forEach(itemEntry => {
      const compositeId = isSkill ? `-${group.groupId}-${itemEntry.id}` : itemEntry.id
      const localeName = localeSection?.[compositeId]?.name
      const infos: RegistletInfos = {
        id: compositeId,
        name: localeName ?? itemEntry.name,
        obtainLevels: itemEntry.obtainLevels,
        maxLevel: itemEntry.maxLevel,
        powderCost: itemEntry.powderCost,
        powderCostAdditional: itemEntry.powderCostAdditional,
      }

      let currentItem: RegistletItemBase | null = null

      if (isStat) {
        const statBase = Grimoire.Character.findStatBase(itemEntry.link)
        if (statBase) {
          const newItem = new RegistletItemBaseStat(
            category as RegistletCategory<RegistletItemBaseStat>,
            infos,
            statBase
          )
          category.appendItem(newItem)
          currentItem = newItem
        }
      } else if (isSkill) {
        const skills = itemEntry.link
          .split(',')
          .map(s => s.trim())
          .map(id => Grimoire.Skill.skillRoot.findSkillById(id))
          .filter(Boolean) as Skill[]
        const newItem = new RegistletItemBaseSkill(
          category as RegistletCategory<RegistletItemBaseSkill>,
          infos,
          skills
        )
        category.appendItem(newItem)
        currentItem = newItem
      } else {
        const newItem = new RegistletItemBaseSpecial(
          category as RegistletCategory<RegistletItemBaseSpecial>,
          infos
        )
        category.appendItem(newItem)
        currentItem = newItem
      }

      if (!currentItem) return

      itemEntry.rows.forEach(rowEntry => {
        const defaultType = isStat ? 'value' : 'caption'
        currentItem!.rows.push(new RegistletItemRow(rowEntry.type || defaultType, rowEntry.value))
      })
    })
  })
}

export function LoadRegistlet(root: RegistletSystem, data: RegistletData, locale?: RegistletLocale) {
  loadCategory(root, root.skillCategory, data.skillCategory, true, false, locale?.skill)
  loadCategory(root, root.statCategory, data.statCategory, false, true, locale?.stat)
  loadCategory(root, root.specialCategory, data.specialCategory, false, false, locale?.special)
}
