import { TextResultContainerPart } from '@/lib/common/ResultContainer'
import { TextResultContainerPartTypes } from '@/lib/common/ResultContainer'
import {
  type TextParseItem,
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
        handler(context) {
          const [value] = context.values
          const text = value.replace(new RegExp('_', 'g'), ' ')
          const newPart = new TextResultContainerPart(
            TextResultContainerPartTypes.GlossaryTag,
            text
          )
          return newPart
        },
      }
      items = [
        commonTextParseItems.glossaryTag,
        lagacyGlossaryTagParseItem,
        markTextParseItems.mark,
        markTextParseItems.underline,
        commonTextParseItems.separate,
      ]
    }
    return items
  }
})()
