import { HandleLanguageData } from '@/shared/services/Language'

import GlossarySystem from '@/lib/Glossary'
import { GlossaryTag, GlossaryTagRow } from '@/lib/Glossary/GlossaryTag'

import { type LangCsvData } from './DownloadDatas'

export default function loadGlossaryTagData(root: GlossarySystem, datas: LangCsvData) {
  const // TAG_NAME = 0,
    FRAME_NAME = 1,
    // FRAME_VALUE = 2,
    INDEX = {
      TAG_NAME: 0,
      FRAME_NAME: 1,
      FRAME_VALUE: 2,
    },
    LANG_DATA = {
      TAG_NAME: 0,
      FRAME_VALUE: 1,
    }

  HandleLanguageData(datas, {
    [INDEX.TAG_NAME]: LANG_DATA.TAG_NAME,
    [INDEX.FRAME_VALUE]: LANG_DATA.FRAME_VALUE,
  })
  const data = datas[0]
  let curTag: GlossaryTag
  let curRow: GlossaryTagRow
  data.forEach((row, idx) => {
    if (idx === 0) {
      return
    }
    try {
      const name = row[INDEX.TAG_NAME]
      if (name !== '') {
        curTag = root.appendTag(name)
      }
      const fn = row[FRAME_NAME],
        fv = row[INDEX.FRAME_VALUE]
      if (fn !== '') {
        curRow = curTag.appendRow(fn, fv)
      } else {
        curRow?.appendValue(fv)
      }
    } catch (err) {
      console.warn('[LoadTag] unknown error')
      console.error(err)
      console.log(row)
    }
  })
}
