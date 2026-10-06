import { type VNode, h } from 'vue'
import { Translation } from 'vue-i18n'

import { isNumberString } from '@/shared/utils/string'

import {
  SkillBranchResult,
  type SkillBranchResultBase,
  SkillBranchStatResult,
  SkillBranchTextResult,
  type SkillBranchTextResultPartValue,
} from '@/lib/Skill/SkillComputing'
import {
  CommonTextParseItemIds,
  ResultContainerTypes,
  TextResultContainerPart,
  TextResultContainerPartTypes,
  type TextResultContainerPartValue,
  getCommonTextParseItem,
  handleParseText,
} from '@/lib/common/ResultContainer'

import CyPopover from '@/components/cyteria/cy-popover/cy-popover.vue'
import GlossaryTagPopover from '@/views/GlossaryQuery/glossary-tag-popover.vue'

import SkillBranchPopover from './skill-branch-popover.vue'
import SkillLinkPopover from './skill-link-popover.vue'

import './skill-branch-formula.css'

export interface NormalLayoutSubContent {
  key: string
  icon: string
  title?: string
  value?: string | SkillBranchResultBase
  custom?: boolean
  type?: 'primary' | 'normal' | 'cyan' | 'gray'
}

const glossaryTagParseItem = getCommonTextParseItem(CommonTextParseItemIds.GlossaryTag)

const hoveredFormulaElements = new Set<HTMLElement>()

function setFormulaHovered(element: HTMLElement, hovered: boolean) {
  if (hovered) {
    hoveredFormulaElements.add(element)
  } else {
    hoveredFormulaElements.delete(element)
  }

  document.body?.classList.toggle('skill-formula-hover', hoveredFormulaElements.size > 0)
}

function getContainerStatSign(container: SkillBranchResult, originalFormula: boolean) {
  if (!(container instanceof SkillBranchStatResult)) {
    return ''
  }

  const value = originalFormula
    ? (container.originalFormulaValue ?? container.value)
    : container.value
  return isNumberString(value) && parseFloat(value) < 0 ? '' : '+'
}

function renderContainerContent(
  container: SkillBranchResult,
  res: string,
  originalFormula: boolean,
  parseGlossaryTag: boolean
) {
  const { classNames: _classNames = [], unit: _unit = '', message } = container.displayOptions ?? {}

  const classNames = _classNames.slice() ?? []

  // ignore `end` if message exist
  const unit = message ? '' : _unit

  const registlet = container.subContainers.registlet
  const registletResult = originalFormula
    ? (registlet?.originalFormulaResult ?? registlet?.result)
    : registlet?.result
  const registletNode =
    registletResult && registletResult !== '0'
      ? h('span', {
          class: 'text-emerald-50 ml-0.5',
          innerHTML: registletResult.startsWith('-') ? registletResult : `+${registletResult}`,
        })
      : null

  const valueNode = parseGlossaryTag
    ? h('span', renderPlainTextParts(handleParseText(res, [glossaryTagParseItem]).parts))
    : h('span', { innerHTML: res })
  const mainNode =
    container.type === ResultContainerTypes.Number && (!isNumberString(res) || registletNode)
      ? h('span', { class: 'cy--text-separate' }, [valueNode, registletNode])
      : valueNode
  const sign = getContainerStatSign(container, originalFormula)
  const statSign = sign ? h('span', { class: 'text-primary-50' }, sign) : null
  return h('span', { class: classNames }, [statSign, mainNode, unit])
}

function _renderContainerResult(
  container: SkillBranchResult,
  displayResult?: string,
  parseGlossaryTag = false
) {
  const computedResult = displayResult ?? container.result
  const originalResult = container.originalFormulaResult
  const renderResult = (originalFormula: boolean) =>
    renderContainerContent(
      container,
      originalFormula ? (originalResult ?? computedResult) : computedResult,
      originalFormula,
      parseGlossaryTag
    )
  const registlet = container.subContainers.registlet
  if (
    originalResult === null ||
    (originalResult === computedResult &&
      getContainerStatSign(container, true) === getContainerStatSign(container, false) &&
      (!registlet || registlet.originalFormulaResult === registlet.result))
  ) {
    return renderResult(originalResult !== null && container.showOriginalFormula)
  }

  return h(
    CyPopover,
    {
      tag: 'span',
      triggers: 'hover click',
      popperContentClass: 'skill-branch-formula-popper-content px-3 py-2',
      class: 'skill-branch-formula-popover-wrapper cursor-pointer rounded-sm',
      onMouseenter: (event: MouseEvent) => {
        setFormulaHovered(event.currentTarget as HTMLElement, true)
      },
      onMouseleave: (event: MouseEvent) => {
        setFormulaHovered(event.currentTarget as HTMLElement, false)
      },
      onVnodeBeforeUnmount: (vnode: VNode) => {
        if (vnode.el instanceof HTMLElement) {
          setFormulaHovered(vnode.el, false)
        }
      },
    },
    {
      default: () => renderResult(container.showOriginalFormula),
      popper: () => renderResult(!container.showOriginalFormula),
    }
  )
}

export function renderContainerResult(
  container: SkillBranchResult,
  displayResult?: string,
  parseGlossaryTag = false
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
        [param]: () => _renderContainerResult(container, displayResult, parseGlossaryTag),
      }
    )
  }
  return _renderContainerResult(container, displayResult, parseGlossaryTag)
}

export function renderTextParts(parts: SkillBranchTextResultPartValue[]) {
  return parts.map((part): string | VNode => {
    if (typeof part === 'string') {
      return h('span', part.replace(/\*/g, '×'))
    }
    if (part instanceof TextResultContainerPart) {
      if (part.type === TextResultContainerPartTypes.BreakLine) {
        return h('br')
      }

      if (part.type === TextResultContainerPartTypes.Separate) {
        const childs = renderTextParts(part.parts)
        const classNames = ['cy--text-separate']
        if (part.unit) {
          return h('span', { class: 'text-primary-50' }, [
            h('span', { class: classNames }, childs),
            part.unit,
          ])
        }
        classNames.push('text-primary-50')
        return h('span', { class: classNames }, childs)
      }

      if (part.type === TextResultContainerPartTypes.GlossaryTag) {
        return h(GlossaryTagPopover, {
          name: part.value,
          displayName: part.metadata.get('display-name'),
        })
      }

      if (part.type === TextResultContainerPartTypes.Other) {
        if (part.subType === 'skill') {
          return h(SkillLinkPopover, { name: part.value })
        }
        if (part.subType === 'branch') {
          return h(SkillBranchPopover, { branchName: part.value })
        }
        if (part.subType === 'mark') {
          return h('span', { class: 'text-primary-50' }, part.value)
        }
      }
      return h('span', part.value)
    }
    return renderContainerResult(part)
  })
}

export function renderPlainTextParts(parts: TextResultContainerPartValue[]) {
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

export function renderTextResult(res: SkillBranchTextResult) {
  return h('div', renderTextParts(res.parts))
}

export function RenderText({ result }: { result: SkillBranchTextResult | string; class?: string }) {
  if (typeof result === 'string') {
    return h('div', result)
  }
  return renderTextResult(result)
}
