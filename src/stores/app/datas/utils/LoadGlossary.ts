import { getLanguageDataResult } from '@/shared/services/Locale'

import GlossarySystem from '@/lib/Glossary'
import { GlossaryTag, GlossaryTagRow } from '@/lib/Glossary/GlossaryTag'

import { type LocaleCsvDatas } from './DownloadDatas'
import { getCsvDataRowGetterHelper } from './utils'

export function LoadGlossaryTag(root: GlossarySystem, datas: LocaleCsvDatas) {
  const { createRowGetter, createLocaleMapping } = getCsvDataRowGetterHelper({
    'tag/name': 0,
    'frame/name': 1,
    'frame/value': 2,
  })

  const data = getLanguageDataResult(
    datas,
    createLocaleMapping({
      'tag/name': 0,
      'frame/value': 1,
    })
  )

  let curTag: GlossaryTag
  let curRow: GlossaryTagRow
  data.forEach((rowData, idx) => {
    if (idx === 0) {
      return
    }

    const { row } = createRowGetter(rowData)

    try {
      const tagName = row('tag/name')
      if (tagName !== '') {
        curTag = root.appendTag(tagName)
      }
      const frameName = row('frame/name'),
        frameValue = row('frame/value')
      if (frameName !== '') {
        curRow = curTag.appendRow(frameName, frameValue)
      } else {
        curRow?.appendValue(frameValue)
      }
    } catch (err) {
      console.warn('[LoadTag] unknown error')
      console.error(err)
      console.log(row)
    }
  })
}
