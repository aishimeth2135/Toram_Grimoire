import { isNumberString } from '@/shared/utils/string'

import CharacterSystem from '@/lib/Character'
import {
  CharacterStat,
  CharacterStatCategory,
  CharacterStatFormula,
} from '@/lib/Character/Character'

import type { LocaleCsvDatas } from './DownloadDatas'
import { getCsvDataRowGetterHelper } from './utils'

export function LoadCharacterStats(characterSystem: CharacterSystem, datas: LocaleCsvDatas) {
  const { createRowGetter } = getCsvDataRowGetterHelper({
    'id': 0,
    'name': 1,
    'display-formula': 2,
    'link': 3,
    'formula': 5,
    'limit': 6,
    'hidden-option': 7,
    'caption': 8,

    'conditional/base': 3,
    'conditional/options': 4,
    'conditional/value': 5,

    // 'category/id': 0,
    'category/name': 1,
  })

  // Used to check if the row is category
  const CATEGORY_CHECKING_ID = '0'

  const getHiddenOptionIndex = (value: string) =>
    ['永久', '變數值為0時', '計算結果為0時'].indexOf(value)

  const csvData = datas.baseData

  let curCategory: CharacterStatCategory
  let curStat: CharacterStat
  let curFormula: CharacterStatFormula
  csvData.forEach((rowData, index) => {
    if (index === 0 || rowData.every(col => col === '')) {
      return
    }

    const { row } = createRowGetter(rowData)

    const id = row('id')
    if (id === CATEGORY_CHECKING_ID) {
      curCategory = characterSystem.appendCharacterStatCategory(row('category/name'))
    } else if (id === '') {
      curFormula.appendConditionValue(
        row('conditional/base'),
        row('conditional/value'),
        row('conditional/options')
      )
    } else {
      const [minStr, maxStr] = row('limit').split('~')
      const min = isNumberString(minStr) ? parseFloat(minStr) : null
      const max = isNumberString(maxStr) ? parseFloat(maxStr) : null
      curStat = curCategory.appendStat({
        id,
        name: row('name'),
        displayFormula: row('display-formula'),
        link: row('link'),
        max,
        min,
        caption: row('caption'),
        hiddenOption: getHiddenOptionIndex(row('hidden-option')),
      })
      curFormula = curStat.setFormula(row('formula'))
    }
  })
}
