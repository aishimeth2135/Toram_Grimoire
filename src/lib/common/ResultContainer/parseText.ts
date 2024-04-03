import {
  ResultContainer,
  TextResultContainerPart,
  TextResultContainerPartValue,
} from '.'

import { CommonLogger } from '@/shared/services/Logger'

import { ResultContainerTypes, TextResultContainerPartTypes } from './enums'

interface TextParseContext {
  /**
   * The plain array contains the same results as `String.prototype.match(pattern)`
   * note: some values may be `undefined` if some groups of RegExp do not exist
   */
  values: string[]
  parts: TextResultContainerPartValue[]
  unit: string
}

interface TextParseHandler<
  Value extends TextResultContainerPartValue = TextResultContainerPartValue,
> {
  (context: TextParseContext): Value
}

export interface TextParseItem<
  Value extends TextResultContainerPartValue = TextResultContainerPartValue,
> {
  id: string
  pattern: RegExp | string
  handler: TextParseHandler<Value>
  units?: string[]
  patternGroupsLength?: number
}

function generateCommonHandler(type: TextResultContainerPartTypes) {
  return (context: TextParseContext) => {
    return new TextResultContainerPart(type, context.parts, context.unit)
  }
}

export function handleParseText(rootValue: string, order: TextParseItem[]) {
  interface ParsedPart {
    original: string
    values: string[]
    unit: string
  }

  const logger = new CommonLogger('handleParseText')

  let incresement = 0
  const orderReplacements = new Map<string, Map<string, ParsedPart>>()
  const injectReplacememt = (id: string, parsed: ParsedPart) => {
    if (!orderReplacements.has(id)) {
      orderReplacements.set(id, new Map())
    }
    const replacement = `__PARSE_REPLACEMENT_${incresement}__`
    orderReplacements.get(id)!.set(replacement, parsed)
    incresement += 1
    return replacement
  }
  const extractReplacement = (id: string, value: string) => {
    if (!orderReplacements.has(id)) {
      return null
    }
    const replacements = orderReplacements.get(id)!

    for (const [replacement, parsed] of replacements.entries()) {
      if (value.includes(replacement)) {
        return { replacement, parsed }
      }
    }
    return null
  }

  const replacePatterns = (value: string, currentIdx: number): string => {
    if (currentIdx > order.length - 1) {
      return value
    }

    const {
      id,
      pattern: _pattern,
      units = [],
      patternGroupsLength = 1,
    } = order[currentIdx]

    let patternStr = _pattern.toString()
    const patternFlag = !patternStr.endsWith('/')
      ? patternStr.slice(-1)
      : undefined
    patternStr = patternStr.slice(1, patternFlag ? -2 : -1)
    const pattern = new RegExp('(' + patternStr + ')')

    const parseParts: string[] = value.split(pattern)
    const parts: TextResultContainerPartValue[] = []
    const groupStep = patternGroupsLength + 2

    let currentValues: string[] = []
    parseParts.forEach((str, idx) => {
      if (str === '') {
        return
      }
      if (idx % groupStep === 0) {
        if (str === undefined) {
          logger
            .addTitle('replacePatterns')
            .warn(
              'Please ensure "patternGroupsLength" of options match the "pattern".'
            )
          return
        }
        parts.push(str)
        return
      }

      currentValues.push(str)
      if (idx % groupStep !== groupStep - 1) {
        return
      }

      const next = idx === parseParts.length - 1 ? null : parseParts[idx + 1]
      const unit = next ? units.find(item => next.startsWith(item)) ?? '' : ''
      if (unit) {
        parseParts[idx + 1] = next!.slice(unit.length)
      }

      parts.push(
        injectReplacememt(id, {
          original: currentValues[0],
          values: currentValues.slice(1),
          unit,
        })
      )

      currentValues = []
    })

    return replacePatterns(parts.join(''), currentIdx + 1)
  }

  const rollback = (
    value: string,
    currentIdx: number,
    containers: ResultContainer[]
  ): {
    parts: TextResultContainerPartValue[]
    containers: ResultContainer[]
  } => {
    if (currentIdx < 0) {
      return {
        parts: [value],
        containers,
      }
    }

    const { id, handler } = order[currentIdx]

    const extracted = extractReplacement(id, value)
    if (!extracted) {
      return rollback(value, currentIdx - 1, containers)
    }

    const { replacement, parsed } = extracted

    const values = value.split(replacement)

    const currentParts = rollback(parsed.values[0], currentIdx - 1, containers)

    const context: TextParseContext = {
      values: parsed.values,
      parts: currentParts.parts,
      unit: parsed.unit,
    }
    const currentPart = handler(context)
    if (currentPart instanceof ResultContainer) {
      containers.push(currentPart)
    }

    const prevParts = values[0]
      ? rollback(values[0], order.length - 1, containers).parts
      : []

    const nextParts = values[1]
      ? rollback(values[1], order.length - 1, containers).parts
      : []

    const parts: TextResultContainerPartValue[] = [
      ...prevParts,
      currentPart,
      ...nextParts,
    ].filter(item => !!item)

    return {
      parts,
      containers,
    }
  }

  const replacedValue = replacePatterns(rootValue, 0)

  return rollback(replacedValue, order.length - 1, [])
}

interface ParseValueOptions {
  computedValue?: (value: string) => string
}

export function getCommonTextParseItems(options: ParseValueOptions = {}) {
  const units = ['%', 'm']

  const separateParse: TextParseItem<TextResultContainerPart> = {
    id: 'separate',
    pattern: /\(\(((?:[^)]|\)(?!\)))+)\)\)/,
    handler: generateCommonHandler(TextResultContainerPartTypes.Separate),
    units,
  }
  const valueParse: TextParseItem<ResultContainer> = {
    id: 'value',
    pattern: /\$\{([^}]+)\}/,
    handler(context) {
      const value = context.values[0]
      const computedValue = options.computedValue?.(value) ?? value
      const container = new ResultContainer(
        ResultContainerTypes.Number,
        value,
        computedValue
      )
      container.displayOptions.unit = context.unit
      return container
    },
    units,
  }
  const glossaryTagParse: TextParseItem<TextResultContainerPart> = {
    id: 'glossary-tag',
    pattern: /#\[([^\]]+)\](?:\[([^\]]+)\])?/,
    handler(context) {
      const [value1, value2] = context.values
      if (value2) {
        const newPart = new TextResultContainerPart(
          TextResultContainerPartTypes.GlossaryTag,
          value2
        )
        newPart.metadata.set('display-name', value1)
        return newPart
      }
      return new TextResultContainerPart(
        TextResultContainerPartTypes.GlossaryTag,
        value1
      )
    },
    patternGroupsLength: 2,
  }

  return {
    separate: separateParse,
    value: valueParse,
    glossaryTag: glossaryTagParse,
  }
}

export function getMarkTextParseItems() {
  const markParse: TextParseItem = {
    id: 'mark',
    pattern: /\(\(!((?:(?!\(\().)+)\)\)/,
    handler(context) {
      const [value] = context.values
      const newPart = new TextResultContainerPart(
        TextResultContainerPartTypes.Other,
        value
      )
      newPart.subType = 'mark'
      return newPart
    },
  }
  const underlineParse: TextParseItem = {
    id: 'underline',
    pattern: /\(\(_((?:(?!\(\().)+)\)\)/,
    handler(context) {
      const [value] = context.values
      const newPart = new TextResultContainerPart(
        TextResultContainerPartTypes.Other,
        value
      )
      newPart.subType = 'underline'
      return newPart
    },
  }
  return {
    mark: markParse,
    underline: underlineParse,
  }
}
