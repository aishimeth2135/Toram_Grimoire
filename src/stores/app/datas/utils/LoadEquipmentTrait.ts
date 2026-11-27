import Grimoire from '@/shared/Grimoire'
import { getLocaleDataResult } from '@/shared/services/Locale'

import { StatComputed } from '@/lib/Character/Stat'
import type EquipmentTraitSystem from '@/lib/EquipmentTrait'
import type { EquipmentTraitItem } from '@/lib/EquipmentTrait'
import { EquipmentTraitCategory } from '@/lib/EquipmentTrait/EquipmentTrait'

import type { LocaleCsvDatas } from './DownloadDatas'
import { getCsvDataRowGetterHelper, parseStatValueDataRaw } from './utils'

export function LoadEquipmentTraits(root: EquipmentTraitSystem, datas: LocaleCsvDatas): void {
  const { createRowGetter, createLocaleMapping } = getCsvDataRowGetterHelper({
    'id': 0,
    'name': 1,
    'max-level': 2,
    'attr/category': 3,
    'attr/name': 4,
    'attr/value': 5,
  })

  const csvData = getLocaleDataResult(
    datas,
    createLocaleMapping({
      'name': 0,
      'attr/value': 1,
    })
  )

  const CATEGORY_STAT_CHECK = '@stat'
  const CATEGORY_SPECIAL_CHECK = '@special'

  let currentItemCategory: EquipmentTraitCategory | '' = ''
  let currentItem: EquipmentTraitItem | null = null

  let currentAttrCategory: string = ''

  csvData.forEach((rowData, index) => {
    if (index === 0 || rowData.every(col => col === '')) {
      return
    }

    const { row } = createRowGetter(rowData)

    if (row('id') === CATEGORY_STAT_CHECK) {
      currentItemCategory = EquipmentTraitCategory.Stat
      return
    }
    if (row('id') === CATEGORY_SPECIAL_CHECK) {
      currentItemCategory = EquipmentTraitCategory.Special
      return
    }

    if (row('attr/category') !== '') {
      currentAttrCategory = row('attr/category')
    }

    if (row('id') !== '' && row('name') !== '' && currentItemCategory !== '') {
      currentItem = root.appendEquipmentTraitItem(row('id'), currentItemCategory, row('name'))
      if (row('max-level')) {
        currentItem.maxLevel = parseInt(row('max-level'), 10)
      }

      currentAttrCategory = row('attr/category')
      if (currentAttrCategory === '') {
        if (currentItemCategory === EquipmentTraitCategory.Stat) {
          currentAttrCategory = 'stat'
        } else if (currentItemCategory === EquipmentTraitCategory.Special) {
          currentAttrCategory = 'text'
        }
      }
    }
    if (!currentItem) {
      return
    }

    let attrName = row('attr/name')
    if (currentItemCategory === EquipmentTraitCategory.Stat) {
      currentAttrCategory = currentAttrCategory || 'stat'
    } else if (currentItemCategory === EquipmentTraitCategory.Special) {
      currentAttrCategory = currentAttrCategory || 'text'
      if (currentAttrCategory === 'text') {
        attrName = attrName || 'caption'
      } else if (currentAttrCategory === 'stack') {
        attrName = attrName || 'max'
      }
    }

    applyEquipmentTraitRow(currentItem, currentAttrCategory, attrName, row('attr/value'))
  })
}

export function applyEquipmentTraitRow(
  item: EquipmentTraitItem,
  group: string,
  key: string,
  value: string
) {
  if (group === 'text') {
    if (key === 'caption') {
      item.caption.description = value
    }
    if (key === 'tips') {
      item.caption.tips.push(value)
    }
  } else if (group === 'stack' && key === 'max') {
    item.setStackInfo('max', value)
  } else if (group === 'stat') {
    const { value: statId, type } = parseStatValueDataRaw(key)
    const base = Grimoire.Character.findStatBase(statId)
    if (base) {
      item.appendStat(StatComputed.create(base, type, value))
    }
  }
}
