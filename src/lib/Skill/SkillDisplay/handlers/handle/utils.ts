import { lastElement } from '@/shared/utils/array'
import { numberToFixed } from '@/shared/utils/number'

function replaceArrayLookups(result: string): string {
  if (!result.includes('][')) {
    return result
  }

  const findClosingBracket = (start: number): number => {
    let depth = 0
    for (let idx = start; idx < result.length; idx += 1) {
      if (result[idx] === '[') {
        depth += 1
      } else if (result[idx] === ']') {
        depth -= 1
        if (depth === 0) {
          return idx
        }
      }
    }
    return -1
  }

  let display = ''
  let idx = 0
  while (idx < result.length) {
    const previous = result[idx - 1]
    if (result[idx] !== '[' || (idx > 0 && !/[\s+\-*/%(,?:=<>!&|]/.test(previous))) {
      display += result[idx]
      idx += 1
      continue
    }

    const itemsEnd = findClosingBracket(idx)
    if (itemsEnd < 0 || result[itemsEnd + 1] !== '[') {
      display += result[idx]
      idx += 1
      continue
    }
    const indexStart = itemsEnd + 1
    const indexEnd = findClosingBracket(indexStart)
    if (indexEnd < 0) {
      display += result[idx]
      idx += 1
      continue
    }

    const arrayItems = result.slice(idx + 1, itemsEnd)
    const arrayIndex = result.slice(indexStart + 1, indexEnd)
    display += `<span class="skill-formula-array-wrapper"><span class="name">LIST</span><span class="items">${arrayItems}</span><span class="index">${arrayIndex}</span></span>`
    idx = indexEnd + 1
  }
  return display
}

export function handleFunctionHighlight(result: string): string {
  const FUNCTION_PATTERN = /Math\.(floor|min|max)\(([^()]+)\)/g
  const arrayResult = replaceArrayLookups(result)

  if (arrayResult === result && !result.match(/Math\.(?:floor|min|max)/)) {
    return result
  }
  result = arrayResult

  const START = '<#--'
  const END = '--#>'
  const REPLACE_OFFSET = 3 // START/END length - 1 (Since START/END will replace one char)

  const handleStack: ('normal' | 'function')[] = []
  let offset = 0 // offset for START/END

  const varCharPattern = /[_a-zA-Z0-9]/
  result.split('').forEach((char, idx) => {
    if (char === '(') {
      if (idx === 0 || !varCharPattern.test(result[idx - 1 + offset])) {
        result = result.slice(0, idx + offset) + START + result.slice(idx + offset + 1)
        offset += REPLACE_OFFSET
        handleStack.push('normal')
      } else {
        handleStack.push('function')
      }
    } else if (char === ')') {
      if (lastElement(handleStack) === 'normal') {
        result = result.slice(0, idx + offset) + END + result.slice(idx + offset + 1)
        offset += REPLACE_OFFSET
      }
      handleStack.pop()
    }
  })

  const createFormulaText = (name: string, params: string) => {
    if (name === 'floor') {
      return `[${params}]`
    }
    return `<span class="skill-formula-function-wrapper key--${name}"><span class="name">${name.toUpperCase()}</span><span class="value">${params}</span></span>`
  }

  while (result.match(FUNCTION_PATTERN)) {
    result = result.replace(FUNCTION_PATTERN, (_match, funcName, params) =>
      createFormulaText(funcName, params)
    )
  }

  const START_PATTERN = new RegExp(START, 'g')
  const END_PATTERN = new RegExp(END, 'g')

  result = result.replace(START_PATTERN, '(').replace(END_PATTERN, ')')

  result = result.replace(/,/g, '<span class="param-separate"></span>')

  return result
}

export function numberStringToPercentage(str: string): string {
  return numberToFixed(100 * parseFloat(str), 1).toString() + '%'
}
