<template>
  <span
    v-if="!!(result instanceof ResultContainerStat)"
    class="inline-flex items-center"
  >
    <span class="text-primary-90">{{ result.statResultData.title }}</span>
    <span class="text-primary-50">{{ result.statResultData.sign }}</span>
    <span>
      <RenderResult />
    </span>
  </span>
  <RenderResult v-else />
</template>

<script lang="ts" setup>
import { VNode, h } from 'vue'
import { Translation } from 'vue-i18n'

import { isNumberString } from '@/shared/utils/string'

import {
  ResultContainer,
  ResultContainerBase,
  ResultContainerStat,
  TextResultContainer,
  TextResultContainerPart,
  TextResultContainerPartValue,
} from '@/lib/Skill/SkillComputingContainer/ResultContainer'
import { ResultContainerTypes } from '@/lib/Skill/SkillComputingContainer/enums'

interface Props {
  result: ResultContainerBase
  displayResult?: string
}

const props = defineProps<Props>()

const RenderContainerResult = (container: ResultContainer) => {
  const res = props.displayResult ?? container.result

  const {
    classNames: _classNames = [],
    end: _end = '',
    message,
  } = container.displayOptions ?? {}

  const classNames = _classNames.slice() ?? []

  // ignore `end` if message exist
  const end = message ? '' : _end

  const registletResult = container.subContainers.registlet?.result
  const registletNode = registletResult
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
      return h('span', { class: classNames }, [mainNode, end])
    }
  }
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
        [param]: () =>
          h('span', {
            innerHTML: res,
            class: classNames,
          }),
      }
    )
  }

  return h('span', {
    innerHTML: res + end,
    class: classNames,
  })
}

const RenderTextParts = (parts: TextResultContainerPartValue[]) => {
  return parts.map((part): string | VNode => {
    if (typeof part === 'string') {
      return h('span', { innerHTML: part })
    }
    if (part instanceof TextResultContainerPart) {
      const childs = RenderTextParts(part.parts)
      const classNames = part.type === 'separate' ? ['cy--text-separate'] : []
      if (part.end) {
        return h('span', { class: 'text-primary-50' }, [
          h('span', { class: classNames }, childs),
          part.end,
        ])
      }
      classNames.push('text-primary-50')
      return h('span', { class: classNames }, childs)
    }
    return RenderContainerResult(part)
  })
}

const RenderResult = () => {
  if (props.result instanceof ResultContainer) {
    return RenderContainerResult(props.result)
  }
  if (props.result instanceof TextResultContainer) {
    return h('div', RenderTextParts(props.result.parts))
  }
  return h('span', '')
}
</script>
