import {
  ResultContainer,
  TextResultContainerPart,
  TextResultContainerPartValue,
} from '.'

import Grimoire from '@/shared/Grimoire'

import { ResultContainerTypes, TextResultContainerPartTypes } from './enums'

interface TextParseInnerHandler {
  (value: string): {
    parts: TextResultContainerPartValue[]
    containers: ResultContainer[]
  }
}

interface TextParseContext {
  unit: string
  containers: ResultContainer[]
  parseHandlers: Record<string, TextParseInnerHandler>
}

interface TextParseHandler<
  Value extends TextResultContainerPartValue = TextResultContainerPartValue
> {
  /**
   * @param values - plain array contains the same results as `String.prototype.match(pattern)`
   *                 note: some values may be `undefined` if some groups of RegExp do not exist
   * @param context - some variables to access current context
   */
  (values: string[], context: TextParseContext): Value
}

export interface TextParseItem<
  Value extends TextResultContainerPartValue = TextResultContainerPartValue
> {
  id: string
  pattern?: RegExp | string
  parseToken?: {
    start: string
    end: string
  }
  handler: TextParseHandler<Value>
  beforeParse?: (value: string) => string
  beforeNext?: (value: string) => string
  units?: string[]
  patternGroupsLength?: number
}

function handleTextSplit(
  value: string,
  start: string,
  end: string,
  pattern?: RegExp | string
): string[] {
  interface TokenItem {
    type: 'start' | 'end'
    remove: boolean
  }
  // the result of `String.match` may includes `undefined`
  const result: (string | undefined | TokenItem)[] = []

  let current = ''
  Array.from(value).forEach(char => {
    current += char
    if (current.endsWith(start)) {
      result.push(current.slice(0, current.length - start.length), {
        type: 'start',
        remove: false,
      })
      current = ''
    } else if (current.endsWith(end)) {
      const target = current.slice(0, current.length - end.length)
      const match = pattern ? target.match(pattern) : null
      if (match && match.length > 1) {
        result.push(...match.slice(1))
      } else {
        result.push(target)
      }
      result.push({ type: 'end', remove: false })
      current = ''
    }
  })

  if (current !== '') {
    result.push(current)
  }

  if (result.length === 1) {
    return result as string[]
  }

  // set remove flag
  const tmpResult: (string | undefined | TokenItem)[] = []
  const startTokenRefs: TokenItem[] = []
  const endTokenRefs: TokenItem[] = []
  result.forEach(item => {
    if (typeof item === 'string' || item === undefined) {
      tmpResult.push(item)
      return
    }

    if (item.type === 'start') {
      startTokenRefs.push(item)
      tmpResult.push(item)
      return
    }

    item.remove = true

    if (startTokenRefs.length > 0) {
      startTokenRefs.shift()!.remove = true
      endTokenRefs.push(item)
    } else if (endTokenRefs.length > 0) {
      endTokenRefs.shift()!.remove = false
      endTokenRefs.push(item)
    }
    tmpResult.push(item)
  })

  let mergeFlag = false

  // remove and merge items by remove flag
  const splitResult: (string | undefined)[] = []
  tmpResult.forEach(item => {
    if (typeof item === 'string') {
      if (mergeFlag) {
        splitResult[splitResult.length - 1] += item
        mergeFlag = false
      } else {
        splitResult.push(item)
      }
      return
    }
    mergeFlag = false

    if (item === undefined) {
      splitResult.push(item)
      return
    }

    if (!item.remove) {
      const val = item.type === 'start' ? start : end
      if (splitResult[splitResult.length - 1] !== undefined) {
        splitResult[splitResult.length - 1] += val
        mergeFlag = true
      } else {
        splitResult.push(val)
      }
    }
  })

  return splitResult as string[]
}

export function handleParseText(rootValue: string, order: TextParseItem[]) {
  const handle = (
    value: string,
    currentIdx: number,
    containers: ResultContainer[]
  ) => {
    const {
      pattern,
      handler,
      beforeParse,
      beforeNext,
      units = [],
      parseToken,
      patternGroupsLength = 1,
    } = order[currentIdx]

    let parseParts: string[]

    if (!parseToken && !pattern) {
      Grimoire.Logger.warn('handleParseText', 'invalid params.')
      parseParts = [rootValue]
    } else {
      const currentValue = beforeParse?.(value) ?? value
      parseParts = !parseToken
        ? currentValue.split(pattern!)
        : handleTextSplit(
            currentValue,
            parseToken.start,
            parseToken.end,
            pattern
          )
    }

    const parts: TextResultContainerPartValue[] = []

    const groupStep = patternGroupsLength + 1

    const parseHandlers: Record<string, TextParseInnerHandler> = {}
    order.forEach((item, idx) => {
      parseHandlers[item.id] = _value => handle(_value, idx, containers)
    })

    let currentValues: string[] = []
    parseParts.forEach((str, idx) => {
      if (str === '') {
        return
      }
      if (idx % groupStep === 0) {
        if (str === undefined) {
          Grimoire.Logger.start('handleParseText', 'unexpected value.')
            .log(
              'Please ensure "patternGroupsLength" of options match the "pattern".'
            )
            .end()
          return
        }
        if (currentIdx === order.length - 1) {
          parts.push(str)
          return
        }
        if (beforeNext) {
          str = beforeNext(str)
        }
        const parseResult = handle(str, currentIdx + 1, containers)
        if (
          parseResult.parts.length === 1 &&
          typeof parseResult.parts[0] === 'string'
        ) {
          parts.push(str)
          return
        }
        parts.push(...parseResult.parts)
        containers.push(...parseResult.containers)
        return
      }

      currentValues.push(str)
      if (idx % groupStep !== groupStep - 1) {
        return
      }

      const next = idx === parseParts.length - 1 ? null : parseParts[idx + 1]
      let unit = ''
      if (next && units.includes(next[0])) {
        parseParts[idx + 1] = next.slice(1)
        unit = next[0]
      }
      const context: TextParseContext = {
        unit,
        containers,
        parseHandlers,
      }
      const part = handler(currentValues, context)
      parts.push(part)
      if (part instanceof ResultContainer) {
        containers.push(part)
      }

      currentValues = []
    })
    return {
      parts,
      containers,
    }
  }
  return handle(rootValue, 0, [])
}

interface ParseValueOptions {
  computedValue?: (value: string) => string
}

export function getCommonTextParseItems(options: ParseValueOptions = {}) {
  const units = ['%', 'm']

  let incresement = 0
  const replacements = new Map<string, string>()
  const rollbackReplacement = (value: string) => {
    replacements.forEach((original, replacement) => {
      if (value.includes(replacement)) {
        value = value.replace(replacement, `\${${original}}`)
        replacements.delete(replacement)
      }
    })
    return value
  }

  const separateParse: TextParseItem<TextResultContainerPart> = {
    id: 'separate',
    parseToken: {
      start: '((',
      end: '))',
    },
    beforeParse(value) {
      const strs = handleTextSplit(value, '${', '}').map((item, idx) => {
        if (idx % 2 === 1) {
          const replacement = `__SEPARATE_PARSE_INNER_VALUE_${incresement}__`
          incresement += 1
          replacements.set(replacement, item)
          return replacement
        }
        return item
      })
      return strs.join('')
    },
    beforeNext(value) {
      return rollbackReplacement(value)
    },
    handler([value], context) {
      value = rollbackReplacement(value)
      const parts = context.parseHandlers.value?.(value).parts ?? value
      return new TextResultContainerPart(
        TextResultContainerPartTypes.Separate,
        parts,
        context.unit
      )
    },
    units,
  }
  const valueParse: TextParseItem<ResultContainer> = {
    id: 'value',
    parseToken: {
      start: '${',
      end: '}',
    },
    handler(values, context) {
      const value = values[0]
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
    pattern: /#\[([^\]]+)\](?:\[([^\]]+)\])?/g,
    handler(values) {
      const [value1, value2] = values
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
    pattern: /\(\(!((?:(?!\(\().)+)\)\)/g,
    handler(values) {
      const [value] = values
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
    pattern: /\(\(_((?:(?!\(\().)+)\)\)/g,
    handler(values) {
      const [value] = values
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
