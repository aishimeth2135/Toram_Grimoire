import { lastElement } from '@/shared/utils/array'
import { numberToFixed } from '@/shared/utils/number'

export function handleFunctionHighlight(result: string): string {
  const functionPattern = /Math\.(floor|min|max)\(([^()]+)\)/g

  if (!result.match(functionPattern)) {
    return result
  }

  const handleStack: ('normal' | 'function')[] = []
  let offset = 0 // offset for "<#--" and "--#>"

  const varCharPattern = /[_a-zA-Z0-9]/
  result.split('').forEach((char, idx) => {
    if (char === '(') {
      if (idx === 0 || !varCharPattern.test(result[idx - 1 + offset])) {
        result =
          result.slice(0, idx + offset) +
          '<#--' +
          result.slice(idx + offset + 1)
        offset += 4
        handleStack.push('normal')
      } else {
        handleStack.push('function')
      }
    } else if (char === ')') {
      if (lastElement(handleStack) === 'normal') {
        result =
          result.slice(0, idx + offset) +
          '--#>' +
          result.slice(idx + offset + 1)
        offset += 4
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

  while (result.match(functionPattern)) {
    result = result.replace(functionPattern, (match, funcName, params) =>
      createFormulaText(funcName, params)
    )
  }

  result = result.replace(/<#--/g, '(').replace(/--#>/g, ')')

  result = result.replace(/,/g, '<span class="param-separate"></span>')

  return result
}

export function numberStringToPercentage(str: string): string {
  return numberToFixed(100 * parseFloat(str), 1).toString() + '%'
}
