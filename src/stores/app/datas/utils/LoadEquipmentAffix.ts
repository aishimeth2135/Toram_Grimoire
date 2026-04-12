import type EquipmentAffixSystem from '@/lib/EquipmentAffix'

import type { CsvData } from './DownloadDatas'
import { getCsvDataRowGetterHelper } from './utils'
import { EquipmentAffixCategory } from '@/lib/EquipmentAffix/EquipmentAffix/enums'
import type { EquipmentAffixItem } from '@/lib/EquipmentAffix'

export function LoadEquipments(root: EquipmentAffixSystem, csvData: CsvData): void {
  const { createRowGetter } = getCsvDataRowGetterHelper({
    'id': 0,
    'name': 1,
    'max-level': 2,
    'attr/category': 3,
    'attr/name': 4,
    'attr/value': 5,
  })

  const CATEGORY_STAT_CHECK = '@stat'
  const CATEGORY_SPECIAL_CHECK = '@stat'

  let currentItemCategory: EquipmentAffixCategory;
  let currentItem: EquipmentAffixItem

  let currentAttrCategory: string

  csvData.forEach((rowData, index) => {
    if (index === 0 || rowData.every(col => col === '')) {
      return
    }

    const { row } = createRowGetter(rowData)

    if (row('id') === CATEGORY_STAT_CHECK) {
      currentItemCategory = EquipmentAffixCategory.Stat
      return
    }
    if (row('id') === CATEGORY_SPECIAL_CHECK) {
      currentItemCategory = EquipmentAffixCategory.Special
      return
    }

    if (row('id') !== '' && row('name') !== '' && currentItemCategory) {
      currentItem = root.appendEquipmentAffixItem(row('id'), currentItemCategory, row('name'))
      currentAttrCategory = row('attr/category')
      if (currentAttrCategory === '') {
        if (currentItemCategory === EquipmentAffixCategory.Stat) {
          currentAttrCategory =  'stat'
        } else if (currentItemCategory === EquipmentAffixCategory.Special) {
          currentAttrCategory =  'text'
        }
      }
    }
    if (!currentItem) {
      return
    }

    let attrName = row('attr/name')
    if (currentItemCategory === EquipmentAffixCategory.Stat) {
      currentAttrCategory =  currentAttrCategory || 'stat'
    } else if (currentItemCategory === EquipmentAffixCategory.Special) {
      currentAttrCategory =  currentAttrCategory || 'text'
      attrName = attrName || 'caption'
    }

    if (currentAttrCategory)
  });
}
