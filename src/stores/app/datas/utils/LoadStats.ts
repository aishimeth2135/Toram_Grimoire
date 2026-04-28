import { toInt } from '@/shared/utils/number'

import CharacterSystem from '@/lib/Character'

import type { StatData, StatLocale } from '@/data/types/stats'

export function LoadStats(
  characterSystem: CharacterSystem,
  data: StatData,
  locale?: StatLocale
) {
  data.forEach(entry => {
    if (characterSystem.findStatBase(entry.baseName)) return

    try {
      const loc = locale?.[entry.baseName]
      const caption = loc?.caption ?? entry.caption
      const constantFormula = loc?.constantFormula ?? entry.constantFormula

      const stat = characterSystem.appendStatBase(
        entry.baseName,
        caption,
        entry.hasMultiplier,
        entry.order
      )
      if (constantFormula) {
        stat.constantDisplayFormat = constantFormula
      }
      stat.hidden = entry.hidden === true
      stat.devOnly = entry.hidden === 'dev'
    } catch (err) {
      console.warn('[LoadStats] unknown error', entry, err)
    }
  })
}
