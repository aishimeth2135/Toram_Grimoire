import { CommonTextParseItemIds, TextResultContainerPart } from '@/lib/common/ResultContainer'
import { TextResultContainerPartTypes } from '@/lib/common/ResultContainer'
import { type TextParseItem, getCommonTextParseItem } from '@/lib/common/ResultContainer/parseText'

export const getTextParseItems = (() => {
  let items: TextParseItem[]
  return () => {
    if (!items) {
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
        getCommonTextParseItem(CommonTextParseItemIds.GlossaryTag),
        lagacyGlossaryTagParseItem,
        getCommonTextParseItem(CommonTextParseItemIds.Mark),
        getCommonTextParseItem(CommonTextParseItemIds.Underline),
        getCommonTextParseItem(CommonTextParseItemIds.Separate),
      ]
    }
    return items
  }
})()
