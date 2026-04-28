import type { CsvData } from '../utils'
import type {
  RegistletData,
  RegistletCategory,
  RegistletGroup,
  RegistletItem,
} from '../../src/data/types/registlet'

const CATEGORY_IDS = ['skill', 'stat', 'special'] as const
type CategoryId = (typeof CATEGORY_IDS)[number]

function isCategoryId(str: string): str is CategoryId {
  return CATEGORY_IDS.includes(str as CategoryId)
}

export function convertRegistlet(csv: CsvData): RegistletData {
  const skillCategory: RegistletCategory = { id: 'skill', groups: [] }
  const statCategory: RegistletCategory = { id: 'stat', groups: [] }
  const specialCategory: RegistletCategory = { id: 'special', groups: [] }

  const categoryMap: Record<CategoryId, RegistletCategory> = {
    skill: skillCategory,
    stat: statCategory,
    special: specialCategory,
  }

  let currentCategory: RegistletCategory | null = null
  let currentGroup: RegistletGroup | null = null
  let currentItem: RegistletItem | null = null
  let idPrefix = ''

  csv.forEach(row => {
    const col0 = row[0] ?? ''

    if (col0.startsWith('@')) {
      const categoryId = col0.slice(1)
      if (isCategoryId(categoryId)) {
        currentCategory = categoryMap[categoryId]
        currentGroup = null
        currentItem = null
      }
      return
    }

    if (!currentCategory) return

    const id = row[0]
    const name = row[1]

    if (id && name) {
      if (!currentGroup) {
        currentGroup = { groupId: idPrefix, items: [] }
        currentCategory.groups.push(currentGroup)
      }

      const powderCost = parseInt(row[4]) || 0
      const powderCostAdditional = row[5] ? parseInt(row[5]) || 0 : powderCost * 10

      currentItem = {
        id,
        name,
        obtainLevels: row[2]
          ? row[2]
              .split(/\s*,\s*/)
              .map(s => parseInt(s))
              .filter(n => !isNaN(n))
          : [],
        maxLevel: parseInt(row[3]) || 0,
        powderCost,
        powderCostAdditional,
        link: row[6] ?? '',
        rows: [],
      }
      currentGroup.items.push(currentItem)

      // first row of the item (the attr value row)
      const type = row[7] ?? ''
      const value = row[8] ?? ''
      if (type || value) {
        currentItem.rows.push({ type: type || 'caption', value })
      }
    } else if (id && !name) {
      // group prefix row
      idPrefix = id
      currentGroup = { groupId: idPrefix, items: [] }
      currentCategory.groups.push(currentGroup)
      currentItem = null
    } else if (!id && currentItem) {
      // continuation row
      const type = row[7] ?? ''
      const value = row[8] ?? ''
      currentItem.rows.push({ type: type || 'caption', value })
    }
  })

  return { skillCategory, statCategory, specialCategory }
}
