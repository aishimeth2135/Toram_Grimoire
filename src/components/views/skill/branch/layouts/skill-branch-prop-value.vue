<template>
  <span v-if="!result"></span>
  <span v-else-if="result.isEmpty()">
    {{ result.result }}
  </span>
  <template v-else-if="!!(result instanceof SkillBranchStatResult)">
    <RenderText v-if="result.displayCaption" :result="result.displayCaption" />
    <span v-else class="inline-flex items-center">
      <RenderText class="text-primary-90" :result="result.statResultData.title" />
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

import { RenderText, renderContainerResult, renderTextResult } from './setup'

interface Props {
  result: SkillBranchResultBase | null
  displayResult?: string
  parseGlossaryTag?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  parseGlossaryTag: false,
})

const RenderResult = () => {
  if (props.result instanceof SkillBranchResult) {
    return renderContainerResult(props.result, props.displayResult, props.parseGlossaryTag)
  }
  if (props.result instanceof SkillBranchTextResult) {
    return renderTextResult(props.result)
  }
  return h('span', '')
}
</script>
