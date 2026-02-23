import { getLanguageDataResult } from '@/shared/services/Locale'
import { toInt } from '@/shared/utils/number'

import CharacterSystem from '@/lib/Character'

import type { LocaleCsvDatas } from './DownloadDatas'
import { getCsvDataRowGetterHelper } from './utils'

export function LoadStats(characterSystem: CharacterSystem, datas: LocaleCsvDatas) {
  const { createRowGetter, createLocaleMapping } = getCsvDataRowGetterHelper({
    'base-name': 0,
    'caption': 1,
    'constant-formula': 2,
    'has-multiplier': 3,
    'order': 4,
    'hidden': 5,
  })

  const csvData = getLanguageDataResult(
    datas,
    createLocaleMapping({
      'caption': 0,
      'constant-formula': 1,
    })
  )

  csvData.forEach((rowData, index) => {
    if (index === 0) {
      return
    }

    const { row } = createRowGetter(rowData)

    // Duplicate check
    if (characterSystem.findStatBase(row('base-name'))) {
      return
    }

    if (row('base-name') === '') {
      return
    }
    try {
      const stat = characterSystem.appendStatBase(
        row('base-name'),
        row('caption'),
        row('has-multiplier') !== '無',
        toInt(row('order')) ?? 999
      )
      if (row('constant-formula')) {
        stat.constantDisplayFormat = row('constant-formula')
      }
      stat.hidden = row('hidden') === '1'
      stat.devOnly = row('hidden') === 'dev'
    } catch (err) {
      console.warn('[LoadStats] unknown error')
      console.error(err)
      console.log(row)
    }
  })
}
