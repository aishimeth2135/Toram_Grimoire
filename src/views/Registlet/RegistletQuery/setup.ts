import { h, reactive } from 'vue'

import { TextResultContainerPartTypes } from '@/lib/common/ResultContainer/enums'
import {
  TextParseItem,
  getCommonTextParseItems,
  handleParseText,
} from '@/lib/common/ResultContainer/parseText'

import GlossaryTagPopover from '@/views/GlossaryQuery/glossary-tag-popover.vue'

let registletQueryState: {
  itemDefaultVisible: boolean
  displayMode: 'category' | 'obtain-levels'
}

export function useRegistletQueryState() {
  if (!registletQueryState) {
    registletQueryState = reactive({
      itemDefaultVisible: false,
      displayMode: 'category',
    })
  }
  return registletQueryState
}

const getTextParseItems = (() => {
  let items: TextParseItem[]
  return () => {
    if (!items) {
      const commonTextParseItems = getCommonTextParseItems()
      commonTextParseItems.separate.pattern = /\$\{([^}]+)\}/g
      items = [commonTextParseItems.separate, commonTextParseItems.glossaryTag]
    }
    return items
  }
})()

export function getRegistletCaptionRender(
  handleValue: (value: string) => string
) {
  return ({ text }: { text: string }) => {
    const { parts } = handleParseText(text, getTextParseItems())
    const childs = parts.map(part => {
      if (typeof part === 'string') {
        return h('span', part)
      }
      if (part.type === TextResultContainerPartTypes.Separate) {
        return h(
          'span',
          { class: 'cy--text-separate text-primary-50' },
          handleValue(part.value)
        )
      } else if (part.type === TextResultContainerPartTypes.GlossaryTag) {
        return h(GlossaryTagPopover, {
          name: part.value,
          displayName: part.metadata.get('display-name'),
        })
      }
      return part.value
    })
    return h('span', { key: text }, childs)
  }
}
