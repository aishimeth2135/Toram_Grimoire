<template>
  <div class="space-y-3">
    <template v-for="row in infoRows" :key="row.type + row.value.join(',')">
      <RenderText v-if="row.type === 'caption'" :text="row.value[0]" />
      <div v-else-if="row.type === 'list'" class="pl-2">
        <div
          v-for="rowValue in row.value"
          :key="rowValue"
          class="relative py-0.5 pl-5"
        >
          <span
            class="absolute left-0 top-1 inline-block h-2 w-2 rounded-full bg-primary-30"
          />
          <RenderText :text="rowValue" />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, h } from 'vue'

import { GlossaryTag } from '@/lib/Glossary/GlossaryTag'
import { TextResultContainerPartTypes } from '@/lib/common/ResultContainer'
import { handleParseText } from '@/lib/common/ResultContainer/parseText'

import { getTextParseItems } from './setup'

interface Props {
  tag: GlossaryTag
}

const props = defineProps<Props>()

const infoRows = computed(() =>
  props.tag.rows.filter(row => row.type === 'caption' || row.type === 'list')
)

const textParseItems = getTextParseItems()

const RenderText = ({ text }: { text: string }) => {
  const { parts } = handleParseText(text, textParseItems)
  const childs = parts.map(part => {
    if (typeof part === 'string') {
      return h('span', { innerHTML: part })
    }
    if (part.type === TextResultContainerPartTypes.Separate) {
      return h(
        'span',
        { class: 'cy--text-separate text-primary-50' },
        part.value
      )
    } else if (part.type === TextResultContainerPartTypes.GlossaryTag) {
      return h(
        'span',
        {
          class: 'text-orange-60',
        },
        part.metadata.get('display-name') ?? part.value
      )
    } else if (part.type === TextResultContainerPartTypes.Other) {
      if (part.subType === 'mark') {
        return h('span', { class: 'text-primary-60' }, part.value)
      } else if (part.subType === 'underline') {
        return h('span', { class: 'text-primary-60 underline' }, part.value)
      }
    }
    return part.value
  })
  return h('span', { key: text }, childs)
}
</script>
