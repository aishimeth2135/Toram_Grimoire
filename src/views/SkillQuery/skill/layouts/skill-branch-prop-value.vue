<template>
  <span
    v-if="!!(result instanceof SkillBranchStatResult)"
    class="inline-flex items-center"
  >
    <span class="text-primary-90">{{ result.statResultData.title }}</span>
    <span class="text-primary-50">{{ result.statResultData.sign }}</span>
    <span>
      <RenderResult :key="result.instanceId" />
    </span>
  </span>
  <RenderResult v-else :key="result.instanceId" />
</template>

<script lang="ts" setup>
import { VNode, h } from 'vue'
import { Translation } from 'vue-i18n'

import { isNumberString } from '@/shared/utils/string'

import {
  SkillBranchResult,
  SkillBranchResultBase,
  SkillBranchStatResult,
  SkillBranchTextResult,
  SkillBranchTextResultPartValue,
} from '@/lib/Skill/SkillComputingContainer/SkillBranchResult'
import {
  TextResultContainerPart,
  TextResultContainerPartValue,
} from '@/lib/common/ResultContainer'
import {
  ResultContainerTypes,
  TextResultContainerPartTypes,
} from '@/lib/common/ResultContainer/enums'
import {
  getCommonTextParseItems,
  handleParseText,
} from '@/lib/common/ResultContainer/parseText'

import GlossaryTagPopover from '@/views/GlossaryQuery/glossary-tag-popover.vue'

import SkillBranchPopover from './skill-branch-popover.vue'
import SkillLinkPopover from './skill-link-popover.vue'

interface Props {
  result: SkillBranchResultBase
  displayResult?: string
  parseGlossaryTag?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  parseGlossaryTag: false,
})

const _RenderContainerResult = (container: SkillBranchResult) => {
  const res = props.displayResult ?? container.result

  const {
    classNames: _classNames = [],
    unit: _unit = '',
    message,
  } = container.displayOptions ?? {}

  const classNames = _classNames.slice() ?? []

  // ignore `end` if message exist
  const unit = message ? '' : _unit

  const registletResult = container.subContainers.registlet?.result
  const registletNode =
    registletResult && registletResult !== '0'
      ? h('span', {
          class: 'ml-1 text-emerald-50',
          innerHTML: registletResult.startsWith('-')
            ? registletResult
            : `+${registletResult}`,
        })
      : null

  if (container.type === ResultContainerTypes.Number) {
    if (!isNumberString(res) || registletNode) {
      const mainNode = registletNode
        ? h('span', { class: 'cy--text-separate' }, [
            h('span', { innerHTML: res }),
            registletNode,
          ])
        : h('span', {
            innerHTML: res,
            class: 'cy--text-separate',
          })
      return h('span', { class: classNames }, [mainNode, unit])
    }
  }
  return h('span', {
    innerHTML: res + unit,
    class: classNames,
  })
}

const RenderContainerResult = (container: SkillBranchResult) => {
  const message = container.displayOptions?.message
  if (message) {
    const { id, param } = message
    return h(
      Translation,
      {
        keypath: id,
        tag: 'span',
        scope: 'global',
      },
      {
        [param]: () => _RenderContainerResult(container),
      }
    )
  }
  return _RenderContainerResult(container)
}

const RenderTextParts = (parts: SkillBranchTextResultPartValue[]) => {
  return parts.map((part): string | VNode => {
    if (typeof part === 'string') {
      return h('span', { innerHTML: part.replace(/\*/g, '×') })
    }
    if (part instanceof TextResultContainerPart) {
      if (part.type === TextResultContainerPartTypes.Separate) {
        const childs = part.hasMultipleParts
          ? RenderTextParts(part.parts)
          : h('span', { innerHTML: part.value.replace(/\*/g, '×') })
        const classNames = ['cy--text-separate']
        if (part.unit) {
          return h('span', { class: 'text-primary-50' }, [
            h('span', { class: classNames }, childs),
            part.unit,
          ])
        }
        classNames.push('text-primary-50')
        return h('span', { class: classNames }, childs)
      } else if (part.type === TextResultContainerPartTypes.GlossaryTag) {
        return h(GlossaryTagPopover, {
          name: part.value,
          displayName: part.metadata.get('display-name'),
        })
      } else if (part.type === TextResultContainerPartTypes.Custom) {
        if (part.customType === 'skill') {
          return h(SkillLinkPopover, { name: part.value })
        } else if (part.customType === 'branch') {
          return h(SkillBranchPopover, { branchName: part.value })
        } else if (part.customType === 'mark') {
          return h('span', { class: 'text-primary-50' }, part.value)
        }
      }
      return h('span', part.value)
    }
    return RenderContainerResult(part)
  })
}

const RenderPlainTextParts = (parts: TextResultContainerPartValue[]) => {
  return parts.map((part): string | VNode => {
    if (typeof part === 'string') {
      return h('span', { innerHTML: part.replace(/\*/g, '×') })
    }
    if (part instanceof TextResultContainerPart) {
      if (part.type === TextResultContainerPartTypes.GlossaryTag) {
        return h(GlossaryTagPopover, {
          name: part.value,
          displayName: part.metadata.get('display-name'),
        })
      }
    }
    return h('span', part.value)
  })
}

const glossaryTagParseItem = getCommonTextParseItems().glossaryTag

const RenderResult = () => {
  if (props.result instanceof SkillBranchResult) {
    if (props.parseGlossaryTag) {
      const parts = handleParseText(props.result.result, [
        glossaryTagParseItem,
      ]).parts
      return h('div', RenderPlainTextParts(parts))
    }
    return RenderContainerResult(props.result)
  }
  if (props.result instanceof SkillBranchTextResult) {
    return h('div', RenderTextParts(props.result.parts))
  }
  return h('span', '')
}
</script>
