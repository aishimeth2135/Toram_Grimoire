import { HandleLanguageData } from '@/shared/services/Language'

import CharacterSystem from '@/lib/Character'

import type { LangCsvData } from './DownloadDatas'

export default function (characterSystem: CharacterSystem, datas: LangCsvData) {
  const
    BASE_NAME = 0,
    CAPTION = 1,
    CONSTANT_FORMULA = 2,
    HAS_MULTIPLIER = 3,
    ORDER = 4,
    HIDDEN = 5,
    LANG_DATA = {
      CAPTION: 0,
      CONSTANT_FORMULA: 1,
    }

  const csvData = datas[0]

  HandleLanguageData(datas, {
    [CAPTION]: LANG_DATA.CAPTION,
    [CONSTANT_FORMULA]: LANG_DATA.CONSTANT_FORMULA,
  })

  csvData.forEach((row, index) => {
    if (index === 0 || characterSystem.findStatBase(row[BASE_NAME])) {
      return
    }
    try {
      const stat = characterSystem.appendStatBase(
        row[BASE_NAME],
        row[CAPTION],
        row[HAS_MULTIPLIER] !== '無',
        row[ORDER] ? parseInt(row[ORDER], 10) : 999,
      )
      if (row[CONSTANT_FORMULA]) {
        stat.constantDisplayFormat = row[CONSTANT_FORMULA]
      }
      stat.hidden = row[HIDDEN] === '1'
      stat.devOnly = row[HIDDEN] === 'dev'
    } catch (err) {
      console.warn('[LoadStats] unknown error')
      console.error(err)
      console.log(row)
    }
  })
}
