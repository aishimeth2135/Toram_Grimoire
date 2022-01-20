import EnchantSystem from '@/lib/Enchant'
import { EnchantCategory, EnchantItem } from '@/lib/Enchant/Enchant'
import { EnchantItemConditions } from '@/lib/Enchant/Enchant/enums'
import type { MaterialPointTypeRange } from '@/lib/Enchant/Enchant/base'

import type { CsvData } from './DownloadDatas'

export default function LoadEnchantData(root: EnchantSystem, csvData: CsvData) {
  const STAT_ID = 0,
    CONDITION = 1,
    CONDITION_LIST = ['主手武器', '身體裝備', '原有屬性'],
    POTENTIAL_CONSTANT = 2,
    LIMIT_CONSTANT = 3,
    POTENTIAL_MULTIPLIER = 4,
    LIMIT_MULTIPLIER = 5,
    UNIT_VALUE_CONSTANT = 6,
    UNIT_VALUE_MULTIPLIER = 7,
    MATERIAL_POINT_TYPE = 8,
    MATERIAL_POINT_TYPE_LIST = ['金屬', '獸品', '木材', '布料', '藥品', '魔素'],
    MATERIAL_POINT_VALUE_CONSTANT = 9,
    MATERIAL_POINT_VALUE_MULTIPLIER = 10,
    POTENTIAL_CONVERT_THRESHOLD_CONSTANT = 11,
    POTENTIAL_CONVERT_THRESHOLD_MULTIPLIER = 12,
    CHECK = 1,
    CATEGORY_TITLE = 2,
    CATEGORY_EXTRA = 3

  const handleItemValue = (value: string) => value !== '' ? parseFloat(value) : null

  const handleLimit = (str: string): [number | null, number | null] => {
    if (str === '')
      return [null, null]
    const limitStrs = str.split('::')
    const l1 = handleItemValue(limitStrs[0])
    const l2 = limitStrs[1] === undefined ? (l1 !== null ? -1 * l1 : l1) : handleItemValue(limitStrs[1])
    return [l1, l2]
  }

  const handleUnitValue = (str: string): [number, number] => {
    const [str1, str2] = str.split('|')
    const v1 = str1 ? parseInt(str1, 10) : 1
    const v2 = str2 ? parseInt(str2, 10) : v1
    return [v1, v2]
  }

  const processItemProps = (targetRow: string[]): [number, number] => {
    return [
      handleItemValue(targetRow[POTENTIAL_CONSTANT]) as number,
      handleItemValue(targetRow[POTENTIAL_MULTIPLIER]) as number,
    ]
  }

  let currentCategory: EnchantCategory, currentItem: EnchantItem
  csvData.forEach((row, idx) => {
    if (idx === 0)
      return
    if (row[STAT_ID] === '') {
      const check = row[CHECK]
      if (check === '')
        return
      if (check === '0') {
        currentCategory = root.appendCategory(row[CATEGORY_TITLE])
        if (row[CATEGORY_EXTRA] === 'weapon-only')
          currentCategory.setWeaponOnly()
        return
      }
      const conditionId = CONDITION_LIST.indexOf(row[CONDITION])
      if (conditionId !== -1) {
        const cond = [
          EnchantItemConditions.MainWeapon,
          EnchantItemConditions.BodyArmor,
          EnchantItemConditions.OriginalElement,
        ][conditionId]
        currentItem.appendConditionalProps(cond, { potential: processItemProps(row) })
      }
    } else {
      currentItem = currentCategory
        .appendItem({
          baseName: row[STAT_ID],
          limit: [
            handleLimit(row[LIMIT_CONSTANT]),
            handleLimit(row[LIMIT_MULTIPLIER]),
          ],
          unitValue: [
            handleUnitValue(row[UNIT_VALUE_CONSTANT]),
            handleUnitValue(row[UNIT_VALUE_MULTIPLIER]),
          ],
          materialPointType: MATERIAL_POINT_TYPE_LIST.indexOf(row[MATERIAL_POINT_TYPE]) as MaterialPointTypeRange,
          materialPointValue: [
            handleItemValue(row[MATERIAL_POINT_VALUE_CONSTANT]),
            handleItemValue(row[MATERIAL_POINT_VALUE_MULTIPLIER]),
          ],
          potentialConvertThreshold: [
            handleItemValue(row[POTENTIAL_CONVERT_THRESHOLD_CONSTANT]),
            handleItemValue(row[POTENTIAL_CONVERT_THRESHOLD_MULTIPLIER]),
          ],
          potential: processItemProps(row),
        })
    }
  })
}
