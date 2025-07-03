<template>
  <span v-if="!!(result instanceof SkillBranchStatResult)" class="inline-flex items-center">
    <RenderDisplayTitle class="text-primary-90" :title="result.statResultData.title" />
    <span class="text-primary-50">{{ result.statResultData.sign }}</span>
    <span>
      <RenderResult :key="result.instanceId" />
    </span>
  </span>
  <RenderResult v-else-if="result" :key="result.instanceId" />
</template>

<script lang="ts" setup>
import { h } from 'vue'

import {
  SkillBranchResult,
  type SkillBranchResultBase,
  SkillBranchStatResult,
  SkillBranchTextResult,
} from '@/lib/Skill/SkillComputing'
import { getCommonTextParseItem, handleParseText } from '@/lib/common/ResultContainer/parseText'

import { RenderContainerResult, RenderPlainTextParts, RenderTextParts } from './setup'
import { CommonTextParseItemIds } from '@/lib/common/ResultContainer'

interface Props {
  result: SkillBranchResultBase | null
  displayResult?: string
  parseGlossaryTag?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  parseGlossaryTag: false,
})

const glossaryTagParseItem = getCommonTextParseItem(CommonTextParseItemIds.GlossaryTag)

const RenderTextResult = (res: SkillBranchTextResult) => {
  return h('div', RenderTextParts(res.parts))
}

const RenderDisplayTitle = ({
  title,
}: {
  title: SkillBranchTextResult | string
  class?: string
}) => {
  if (typeof title === 'string') {
    return h('div', title)
  }
  return RenderTextResult(title)
}

const RenderResult = () => {
  if (props.result instanceof SkillBranchResult) {
    if (props.parseGlossaryTag) {
      const parts = handleParseText(props.result.result, [glossaryTagParseItem]).parts
      return h('div', RenderPlainTextParts(parts))
    }
    return RenderContainerResult(props.result, props.displayResult)
  }
  if (props.result instanceof SkillBranchTextResult) {
    return RenderTextResult(props.result)
  }
  return h('span', '')
}
</script>
