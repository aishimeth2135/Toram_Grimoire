import { isNumberString } from '@/shared/utils/string'

import CharacterSystem from '@/lib/Character'
import { CharacterStat, CharacterStatCategory, CharacterStatFormula } from '@/lib/Character/Character'

import type { LangCsvData } from './DownloadDatas'

export default function(characterSystem: CharacterSystem, datas: LangCsvData) {
  const ID = 0,
    NAME = 1,
    DISPLAY_FORMULA = 2,
    LINK = 3,
    FORMULA = 5,
    LIMIT = 6,
    HIDDEN_OPTION = 7,
    CAPTION = 8,
    CONDITIONAL = 3,
    CONDITIONAL_OPTIONS = 4,
    CONDITION_VALUE = 5,
    CONFIRM_CATEGORY = '0',
    CATEGORY_NAME = 1

  const handleHiddenOption = (value: string) => ['永久', '變數值為0時', '計算結果為0時'].indexOf(value)

  const csvData = datas[0]

  let curCategory: CharacterStatCategory
  let curStat: CharacterStat
  let curFormula: CharacterStatFormula
  csvData.forEach((row, index) => {
    if (index === 0) {
      return
    }
    if (row.every(col => col === '')) {
      return
    }

    const id = row[ID]
    if (id === CONFIRM_CATEGORY) {
      curCategory = characterSystem.appendCharacterStatCategory(row[CATEGORY_NAME])
    } else if (id === '') {
      curFormula.appendConditionValue(row[CONDITIONAL], row[CONDITION_VALUE], row[CONDITIONAL_OPTIONS])
    } else {
      const [minStr, maxStr] = row[LIMIT].split('~')
      const min = isNumberString(minStr) ? parseFloat(minStr) : null
      const max = isNumberString(maxStr) ? parseFloat(maxStr) : null
      curStat = curCategory.appendStat({
        id,
        name: row[NAME],
        displayFormula: row[DISPLAY_FORMULA],
        link: row[LINK],
        max,
        min,
        caption: row[CAPTION],
        hiddenOption: handleHiddenOption(row[HIDDEN_OPTION]),
      })
      curFormula = curStat.setFormula(row[FORMULA])
    }
  })
}
