<script lang="ts" setup>
import { h } from 'vue'

import { CommonTextParseItemIds, ResultContainer } from '@/lib/common/ResultContainer'
import { TextResultContainerPartTypes } from '@/lib/common/ResultContainer'
import { getCommonTextParseItem, handleParseText } from '@/lib/common/ResultContainer/parseText'

import GlossaryTagPopover from '@/views/GlossaryQuery/glossary-tag-popover.vue'

interface Props {
  text: string
  handleValue: (value: string) => string
}

const props = defineProps<Props>()

const RenderCaptionValue = () => {
  const { parts } = handleParseText(props.text, [
    getCommonTextParseItem(CommonTextParseItemIds.Value),
    getCommonTextParseItem(CommonTextParseItemIds.GlossaryTag),
  ])
  const children = parts.map(part => {
    if (typeof part === 'string') {
      return h('span', part)
    }
    if (part instanceof ResultContainer) {
      const mainNode = h(
        'span',
        { class: 'cy--text-separate text-primary-50' },
        props.handleValue(part.value)
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
  return h('span', { key: props.text }, children)
}
</script>

<template>
  <RenderCaptionValue />
</template>
