import { TextResultContainerPart } from '@/lib/common/ResultContainer'
import { TextResultContainerPartTypes } from '@/lib/common/ResultContainer/enums'
import {
  TextParseItem,
  getCommonTextParseItems,
  getMarkTextParseItems,
} from '@/lib/common/ResultContainer/parseText'

export const getTextParseItems = (() => {
  let items: TextParseItem[]
  return () => {
    if (!items) {
      const commonTextParseItems = getCommonTextParseItems()
      const markTextParseItems = getMarkTextParseItems()
      const lagacyGlossaryTagParseItem: TextParseItem = {
        id: 'glossary-tag--lagacy',
        pattern: /#([^\s]+)\s/g,
        handler(values) {
          const [value] = values
          const text = value.replace(new RegExp('_', 'g'), ' ')
          const newPart = new TextResultContainerPart(
            TextResultContainerPartTypes.GlossaryTag,
            text
          )
          return newPart
        },
      }
      items = [
        markTextParseItems.mark,
        markTextParseItems.underline,
        commonTextParseItems.separate,
        commonTextParseItems.glossaryTag,
        lagacyGlossaryTagParseItem,
      ]
    }
    return items
  }
})()
