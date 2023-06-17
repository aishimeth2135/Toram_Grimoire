import { VNode, h } from 'vue'
import { Translation } from 'vue-i18n'

import { isNumberString } from '@/shared/utils/string'

import {
  SkillBranchResult,
  SkillBranchTextResultPartValue,
} from '@/lib/Skill/SkillComputing'
import {
  TextResultContainerPart,
  TextResultContainerPartValue,
} from '@/lib/common/ResultContainer'
import {
  ResultContainerTypes,
  TextResultContainerPartTypes,
} from '@/lib/common/ResultContainer'

import GlossaryTagPopover from '@/views/GlossaryQuery/glossary-tag-popover.vue'

import SkillBranchPopover from './skill-branch-popover.vue'
import SkillLinkPopover from './skill-link-popover.vue'

export interface NormalLayoutSubContent {
  key: string
  icon: string
  title?: string
  value?: string
  custom?: boolean
  type?: 'primary' | 'normal' | 'cyan' | 'gray'
}

function _RenderContainerResult(
  container: SkillBranchResult,
  displayResult?: string
) {
  const res = displayResult ?? container.result

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
          class: 'text-emerald-50 ml-0.5',
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

function RenderContainerResult(
  container: SkillBranchResult,
  displayResult?: string
) {
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
  return _RenderContainerResult(container, displayResult)
}

function RenderTextParts(parts: SkillBranchTextResultPartValue[]) {
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
      } else if (part.type === TextResultContainerPartTypes.Other) {
        if (part.subType === 'skill') {
          return h(SkillLinkPopover, { name: part.value })
        } else if (part.subType === 'branch') {
          return h(SkillBranchPopover, { branchName: part.value })
        } else if (part.subType === 'mark') {
          return h('span', { class: 'text-primary-50' }, part.value)
        }
      }
      return h('span', part.value)
    }
    return RenderContainerResult(part)
  })
}

function RenderPlainTextParts(parts: TextResultContainerPartValue[]) {
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

export { RenderContainerResult, RenderTextParts, RenderPlainTextParts }
