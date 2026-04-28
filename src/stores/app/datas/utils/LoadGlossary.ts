import GlossarySystem from '@/lib/Glossary'
import { GlossaryTag, GlossaryTagRow } from '@/lib/Glossary/GlossaryTag'

import type { GlossaryData, GlossaryLocale } from '@/data/types/glossary'

export function LoadGlossaryTag(
  root: GlossarySystem,
  data: GlossaryData,
  locale?: GlossaryLocale
) {
  data.forEach(tagEntry => {
    try {
      const loc = locale?.[tagEntry.name]
      const tagName = loc?.tagName ?? tagEntry.name
      const tag = root.appendTag(tagName)

      tagEntry.rows.forEach(rowEntry => {
        const translatedValues = loc?.frames?.[rowEntry.name]
        const values = translatedValues ?? rowEntry.values

        const row = tag.appendRow(rowEntry.name, values[0] ?? '')
        for (let i = 1; i < values.length; i++) {
          row.appendValue(values[i])
        }
      })
    } catch (err) {
      console.warn('[LoadGlossaryTag] unknown error', tagEntry, err)
    }
  })
}
