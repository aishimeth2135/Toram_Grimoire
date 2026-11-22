import { getLocaleDataResult } from '@/shared/services/Locale'
import { CommonLogger } from '@/shared/services/Logger'

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

  const data = getLocaleDataResult(
    datas,
    createLocaleMapping({
      'tag/name': 0,
      'frame/value': 1,
    })
  )

  let curTag: GlossaryTag | undefined
  let curRow: GlossaryTagRow | undefined
  data.forEach((rowData, idx) => {
    if (idx === 0) {
      return
    }

    const { row } = createRowGetter(rowData)

    try {
      const tagName = row('tag/name')
      if (tagName) {
        curTag = root.appendTag(tagName)
        curRow = undefined
      }
      if (!curTag) {
        return
      }

      const frameName = row('frame/name') ?? ''
      const frameValue = row('frame/value') ?? ''
      switch (frameName) {
        case 'category':
          curTag.categoryText = frameValue
          curRow = undefined
          break
        case 'caption':
        case 'list':
          curRow = curTag.appendRow(frameName, frameValue)
          break
        case '':
          curRow?.appendValue(frameValue)
          break
        default:
          curRow = undefined
      }
    } catch (err) {
      CommonLogger.start('LoadGlossaryTag', 'unknown error').warn(err).log(row).end()
    }
  })
}
