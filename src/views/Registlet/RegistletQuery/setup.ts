import { h, reactive } from 'vue'

import { ViewNames } from '@/shared/consts/view'
import { defineViewState } from '@/shared/setup/State'

import { CommonTextParseItemIds, ResultContainer } from '@/lib/common/ResultContainer'
import { TextResultContainerPartTypes } from '@/lib/common/ResultContainer'
import { getCommonTextParseItem, handleParseText } from '@/lib/common/ResultContainer/parseText'

import GlossaryTagPopover from '@/views/GlossaryQuery/glossary-tag-popover.vue'

export const DisplayMode = {
  Category: 0,
  ObtainLevel: 1,
} as const
export type DisplayMode = (typeof DisplayMode)[keyof typeof DisplayMode]

export const useRegistletQueryState = defineViewState(ViewNames.RegistletQuery, () => {
  const registletQueryState = reactive({
    itemDefaultVisible: false,
    displayMode: DisplayMode.Category as DisplayMode,
  })

  return { registletQueryState }
})

export function getRegistletCaptionRender(handleValue: (value: string) => string) {
  return ({ text }: { text: string }) => {
    const { parts } = handleParseText(text, [
      getCommonTextParseItem(CommonTextParseItemIds.Value),
      getCommonTextParseItem(CommonTextParseItemIds.GlossaryTag),
    ])
    const childs = parts.map(part => {
      if (typeof part === 'string') {
        return h('span', part)
      }
      if (part instanceof ResultContainer) {
        const mainNode = h(
          'span',
          { class: 'cy--text-separate text-primary-50' },
          handleValue(part.value)
        )
        if (part.displayOptions.unit) {
          return h('span', { class: 'text-primary-50' }, [mainNode, part.displayOptions.unit])
        }
        return mainNode
      }
      if (part.type === TextResultContainerPartTypes.GlossaryTag) {
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
