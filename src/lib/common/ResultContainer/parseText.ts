import Grimoire from '@/shared/Grimoire'

import {
  ResultContainer,
  TextResultContainerPart,
  TextResultContainerPartValue,
} from '.'
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
  pattern: RegExp | string
  handler: TextParseHandler<Value>
  units?: string[]
  patternGroupsLength?: number
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
      units = [],
      patternGroupsLength = 1,
    } = order[currentIdx]
    const parseParts = value.split(pattern)
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
        const parseResult = handle(str, currentIdx + 1, containers)
        if (parseResult.parts.length === 1) {
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
  const separateParse: TextParseItem<TextResultContainerPart> = {
    id: 'separate',
    pattern: /\(\(((?:(?!\(\().)+)\)\)/g,
    handler([value], context) {
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
    pattern: /\$\{([^}]+)\}/g,
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
      const newPart = new TextResultContainerPart(
        TextResultContainerPartTypes.GlossaryTag,
        value1
      )
      if (value2) {
        newPart.metadata.set('display-name', value2)
      }
      return newPart
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
