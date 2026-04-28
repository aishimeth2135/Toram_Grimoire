import { isNumberString } from '@/shared/utils/string'

import CharacterSystem from '@/lib/Character'
import {
  CharacterStat,
  CharacterStatCategory,
  CharacterStatFormula,
} from '@/lib/Character/Character'

import type { CharacterStatData, CharacterStatLocale } from '@/data/types/character-stats'

export function LoadCharacterStats(
  characterSystem: CharacterSystem,
  data: CharacterStatData,
  locale?: CharacterStatLocale
) {
  data.forEach(categoryEntry => {
    const categoryName = locale?.[`section:${categoryEntry.name}`]?.name ?? categoryEntry.name
    const category = characterSystem.appendCharacterStatCategory(categoryName)

    categoryEntry.stats.forEach(statEntry => {
      const statName = locale?.[`stat:${statEntry.id}`]?.name ?? statEntry.name
      const [minStr, maxStr] = statEntry.limit.split('~')
      const min = isNumberString(minStr) ? parseFloat(minStr) : null
      const max = isNumberString(maxStr) ? parseFloat(maxStr) : null

      const stat = category.appendStat({
        id: statEntry.id,
        name: statName,
        displayFormula: statEntry.displayFormula,
        link: statEntry.link,
        max,
        min,
        caption: statEntry.caption,
        hiddenOption: ['永久', '變數值為0時', '計算結果為0時'].indexOf(statEntry.hiddenOption),
      })

      const formula = stat.setFormula(statEntry.formula)
      statEntry.conditions.forEach(cond => {
        formula.appendConditionValue(cond.base, cond.value, cond.options)
      })
    })
  })
}
