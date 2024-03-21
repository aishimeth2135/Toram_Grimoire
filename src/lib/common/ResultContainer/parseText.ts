// import {
//   ResultContainer,
//   TextResultContainerPart,
//   TextResultContainerPartValue,
// } from '.'
// import Grimoire from '@/shared/Grimoire'
// import { ResultContainerTypes, TextResultContainerPartTypes } from './enums'
// interface TextParseInnerHandler {
//   (value: string): {
//     parts: TextResultContainerPartValue[]
//     containers: ResultContainer[]
//   }
// }
// interface TextParseContext {
//   unit: string
//   containers: ResultContainer[]
//   parseHandlers: Record<string, TextParseInnerHandler>
// }
// interface TextParseHandler<
//   Value extends TextResultContainerPartValue = TextResultContainerPartValue
// > {
//   /**
//    * @param values - plain array contains the same results as `String.prototype.match(pattern)`
//    *                 note: some values may be `undefined` if some groups of RegExp do not exist
//    * @param context - some variables to access current context
//    */
//   (values: string[], context: TextParseContext): Value
// }
// export interface TextParseItem<
//   Value extends TextResultContainerPartValue = TextResultContainerPartValue
// > {
//   id: string
//   pattern?: RegExp | string
//   parseToken?: {
//     start: string
//     end: string
//   }
//   handler: TextParseHandler<Value>
//   beforeParse?: (value: string) => string
//   beforeNext?: (value: string) => string
//   units?: string[]
//   patternGroupsLength?: number
// }
// function handleTextSplit(
//   value: string,
//   start: string,
//   end: string,
//   pattern?: RegExp | string
// ): string[] {
//   interface TokenItem {
//     type: 'start' | 'end'
//     remove: boolean
//   }
//   // the result of `String.match` may includes `undefined`
//   const result: (string | undefined | TokenItem)[] = []
//   let current = ''
//   Array.from(value).forEach(char => {
//     current += char
//     if (current.endsWith(start)) {
//       result.push(current.slice(0, current.length - start.length), {
//         type: 'start',
//         remove: false,
//       })
//       current = ''
//     } else if (current.endsWith(end)) {
//       const target = current.slice(0, current.length - end.length)
//       const match = pattern ? target.match(pattern) : null
//       if (match && match.length > 1) {
//         result.push(...match.slice(1))
//       } else {
//         result.push(target)
//       }
//       result.push({ type: 'end', remove: false })
//       current = ''
//     }
//   })
//   if (current !== '') {
//     result.push(current)
//   }
//   if (result.length === 1) {
//     return result as string[]
//   }
//   // set remove flag
//   const tmpResult: (string | undefined | TokenItem)[] = []
//   const startTokenRefs: TokenItem[] = []
//   const endTokenRefs: TokenItem[] = []
//   result.forEach(item => {
//     if (typeof item === 'string' || item === undefined) {
//       tmpResult.push(item)
//       return
//     }
//     if (item.type === 'start') {
//       startTokenRefs.push(item)
//       tmpResult.push(item)
//       return
//     }
//     item.remove = true
//     if (startTokenRefs.length > 0) {
//       startTokenRefs.shift()!.remove = true
//       endTokenRefs.push(item)
//     } else if (endTokenRefs.length > 0) {
//       endTokenRefs.shift()!.remove = false
//       endTokenRefs.push(item)
//     }
//     tmpResult.push(item)
//   })
//   let mergeFlag = false
//   // remove and merge items by remove flag
//   const splitResult: (string | undefined)[] = []
//   tmpResult.forEach(item => {
//     if (typeof item === 'string') {
//       if (mergeFlag) {
//         splitResult[splitResult.length - 1] += item
//         mergeFlag = false
//       } else {
//         splitResult.push(item)
//       }
//       return
//     }
//     mergeFlag = false
//     if (item === undefined) {
//       splitResult.push(item)
//       return
//     }
//     if (!item.remove) {
//       const val = item.type === 'start' ? start : end
//       if (splitResult[splitResult.length - 1] !== undefined) {
//         splitResult[splitResult.length - 1] += val
//         mergeFlag = true
//       } else {
//         splitResult.push(val)
//       }
//     }
//   })
//   return splitResult as string[]
// }
// export function handleParseText(rootValue: string, order: TextParseItem[]) {
//   const handle = (
//     value: string,
//     currentIdx: number,
//     containers: ResultContainer[]
//   ) => {
//     const {
//       pattern,
//       handler,
//       beforeParse,
//       beforeNext,
//       units = [],
//       parseToken,
//       patternGroupsLength = 1,
//     } = order[currentIdx]
//     let parseParts: string[]
//     if (!parseToken && !pattern) {
//       Grimoire.Logger.warn('handleParseText', 'invalid params.')
//       parseParts = [rootValue]
//     } else {
//       const currentValue = beforeParse?.(value) ?? value
//       parseParts = !parseToken
//         ? currentValue.split(pattern!)
//         : handleTextSplit(
//             currentValue,
//             parseToken.start,
//             parseToken.end,
//             pattern
//           )
//     }
//     const parts: TextResultContainerPartValue[] = []
//     const groupStep = patternGroupsLength + 1
//     const parseHandlers: Record<string, TextParseInnerHandler> = {}
//     order.forEach((item, idx) => {
//       parseHandlers[item.id] = _value => handle(_value, idx, containers)
//     })
//     let currentValues: string[] = []
//     parseParts.forEach((str, idx) => {
//       if (str === '') {
//         return
//       }
//       if (idx % groupStep === 0) {
//         if (str === undefined) {
//           Grimoire.Logger.start('handleParseText', 'unexpected value.')
//             .log(
//               'Please ensure "patternGroupsLength" of options match the "pattern".'
//             )
//             .end()
//           return
//         }
//         if (currentIdx === order.length - 1) {
//           parts.push(str)
//           return
//         }
//         if (beforeNext) {
//           str = beforeNext(str)
//         }
//         const parseResult = handle(str, currentIdx + 1, containers)
//         if (
//           parseResult.parts.length === 1 &&
//           typeof parseResult.parts[0] === 'string'
//         ) {
//           parts.push(str)
//           return
//         }
//         parts.push(...parseResult.parts)
//         containers.push(...parseResult.containers)
//         return
//       }
//       currentValues.push(str)
//       if (idx % groupStep !== groupStep - 1) {
//         return
//       }
//       const next = idx === parseParts.length - 1 ? null : parseParts[idx + 1]
//       let unit = ''
//       if (next && units.includes(next[0])) {
//         parseParts[idx + 1] = next.slice(1)
//         unit = next[0]
//       }
//       const context: TextParseContext = {
//         unit,
//         containers,
//         parseHandlers,
//       }
//       const part = handler(currentValues, context)
//       parts.push(part)
//       if (part instanceof ResultContainer) {
//         containers.push(part)
//       }
//       currentValues = []
//     })
//     return {
//       parts,
//       containers,
//     }
//   }
//   return handle(rootValue, 0, [])
// }
// interface ParseValueOptions {
//   computedValue?: (value: string) => string
// }
// export function getCommonTextParseItems(options: ParseValueOptions = {}) {
//   const units = ['%', 'm']
//   let incresement = 0
//   const replacements = new Map<string, string>()
//   const rollbackReplacement = (value: string) => {
//     replacements.forEach((original, replacement) => {
//       if (value.includes(replacement)) {
//         value = value.replace(replacement, `\${${original}}`)
//         replacements.delete(replacement)
//       }
//     })
//     return value
//   }
//   const separateParse: TextParseItem<TextResultContainerPart> = {
//     id: 'separate',
//     parseToken: {
//       start: '((',
//       end: '))',
//     },
//     beforeParse(value) {
//       const strs = handleTextSplit(value, '${', '}').map((item, idx) => {
//         if (idx % 2 === 1) {
//           const replacement = `__SEPARATE_PARSE_INNER_VALUE_${incresement}__`
//           incresement += 1
//           replacements.set(replacement, item)
//           return replacement
//         }
//         return item
//       })
//       return strs.join('')
//     },
//     beforeNext(value) {
//       return rollbackReplacement(value)
//     },
//     handler([value], context) {
//       value = rollbackReplacement(value)
//       let parts = context.parseHandlers.value?.(value).parts ?? [value]
//       if (parts.length === 1) {
//         parts = context.parseHandlers.glossaryTag?.(value).parts ?? [value]
//         console.log(parts)
//       }
//       return new TextResultContainerPart(
//         TextResultContainerPartTypes.Separate,
//         parts,
//         context.unit
//       )
//     },
//     units,
//   }
//   const valueParse: TextParseItem<ResultContainer> = {
//     id: 'value',
//     parseToken: {
//       start: '${',
//       end: '}',
//     },
//     handler(values, context) {
//       const value = values[0]
//       const computedValue = options.computedValue?.(value) ?? value
//       const container = new ResultContainer(
//         ResultContainerTypes.Number,
//         value,
//         computedValue
//       )
//       container.displayOptions.unit = context.unit
//       return container
//     },
//     units,
//   }
//   const glossaryTagParse: TextParseItem<TextResultContainerPart> = {
//     id: 'glossary-tag',
//     pattern: /#\[([^\]]+)\](?:\[([^\]]+)\])?/g,
//     handler(values) {
//       const [value1, value2] = values
//       if (value2) {
//         const newPart = new TextResultContainerPart(
//           TextResultContainerPartTypes.GlossaryTag,
//           value2
//         )
//         newPart.metadata.set('display-name', value1)
//         return newPart
//       }
//       return new TextResultContainerPart(
//         TextResultContainerPartTypes.GlossaryTag,
//         value1
//       )
//     },
//     patternGroupsLength: 2,
//   }
//   return {
//     separate: separateParse,
//     value: valueParse,
//     glossaryTag: glossaryTagParse,
//   }
// }
// export function getMarkTextParseItems() {
//   const markParse: TextParseItem = {
//     id: 'mark',
//     pattern: /\(\(!((?:(?!\(\().)+)\)\)/g,
//     handler(values) {
//       const [value] = values
//       const newPart = new TextResultContainerPart(
//         TextResultContainerPartTypes.Other,
//         value
//       )
//       newPart.subType = 'mark'
//       return newPart
//     },
//   }
//   const underlineParse: TextParseItem = {
//     id: 'underline',
//     pattern: /\(\(_((?:(?!\(\().)+)\)\)/g,
//     handler(values) {
//       const [value] = values
//       const newPart = new TextResultContainerPart(
//         TextResultContainerPartTypes.Other,
//         value
//       )
//       newPart.subType = 'underline'
//       return newPart
//     },
//   }
//   return {
//     mark: markParse,
//     underline: underlineParse,
//   }
// }
import {
  ResultContainer,
  TextResultContainerPart,
  TextResultContainerPartValue,
} from '.'

import Grimoire from '@/shared/Grimoire'

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
  Value extends TextResultContainerPartValue = TextResultContainerPartValue
> {
  (context: TextParseContext): Value
}

export interface TextParseItem<
  Value extends TextResultContainerPartValue = TextResultContainerPartValue
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
          Grimoire.Logger.start('handleParseText', 'unexpected value.')
            .log(
              'Please ensure "patternGroupsLength" of options match the "pattern".'
            )
            .end()
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
