import { lastElement } from '@/shared/utils/array'
import { numberToFixed } from '@/shared/utils/number'

export function handleFunctionHighlight(result: string): string {
  const FUNCTION_PATTERN = /Math\.(floor|min|max)\(([^()]+)\)/g

  if (!result.match(/Math\.(?:floor|min|max)/)) {
    return result
  }

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
