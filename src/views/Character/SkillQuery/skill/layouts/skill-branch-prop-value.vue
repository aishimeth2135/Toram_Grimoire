<template>
  <span v-if="!result"></span>
  <span v-else-if="result.isEmpty()">
    {{ result.result }}
  </span>
  <template v-else-if="!!(result instanceof SkillBranchStatResult)">
    <RenderText v-if="result.displayCaption" :result="result.displayCaption" />
    <span v-else class="inline-flex items-center">
      <RenderText class="text-primary-90" :result="result.statResultData.title" />
      <span class="text-primary-50">{{ result.statResultData.sign }}</span>
      <span>
        <RenderResult :key="result.instanceId" />
      </span>
    </span>
  </template>
  <RenderResult v-else :key="result.instanceId" />
</template>

<script lang="ts" setup>
import { h } from 'vue'

import {
  SkillBranchResult,
  type SkillBranchResultBase,
  SkillBranchStatResult,
  SkillBranchTextResult,
} from '@/lib/Skill/SkillComputing'
import { CommonTextParseItemIds } from '@/lib/common/ResultContainer'
import { getCommonTextParseItem, handleParseText } from '@/lib/common/ResultContainer'

import { RenderText, renderContainerResult, renderPlainTextParts, renderTextResult } from './setup'

interface Props {
  result: SkillBranchResultBase | null
  displayResult?: string
  parseGlossaryTag?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  parseGlossaryTag: false,
})

const glossaryTagParseItem = getCommonTextParseItem(CommonTextParseItemIds.GlossaryTag)

const RenderResult = () => {
  if (props.result instanceof SkillBranchResult) {
    if (props.parseGlossaryTag) {
      const parts = handleParseText(props.result.result, [glossaryTagParseItem]).parts
      return h('div', renderPlainTextParts(parts))
    }
    return renderContainerResult(props.result, props.displayResult)
  }
  if (props.result instanceof SkillBranchTextResult) {
    return renderTextResult(props.result)
  }
  return h('span', '')
}
</script>
