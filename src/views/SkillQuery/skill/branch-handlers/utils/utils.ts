const FUNCTION_HIGHLIGHT_LIST: {
  name: string;
  reg: RegExp;
  target?: (match: string, p1: string) => string;
}[] = [
  {
    name: 'floor', reg: /Math\.floor\(([^()]+)\)/g,
    target: (match: string, p1: string) => '[' + p1 + ']',
  },
  { name: 'min', reg: /Math\.min\(([^()]+)\)/g },
  { name: 'max', reg: /Math\.max\(([^()]+)\)/g },
]

const VAR_CHAR_PATTERN = /[_a-zA-Z0-9]/

function handleFunctionHighlight(result: string) {
  const handleStack: ('normal' | 'function')[] = []
  let offset = 0 // offset for "#left~" and "~right#"
  result.split('').forEach((char, idx) => {
    if (char === '(') {
      if (idx === 0 || !VAR_CHAR_PATTERN.test(result[idx - 1 + offset])) {
        result = result.slice(0, idx + offset) + '#left~' + result.slice(idx + offset + 1)
        offset += 5
        handleStack.push('normal')
      }
      else {
        handleStack.push('function')
      }
    } else if (char === ')') {
      if (handleStack[handleStack.length - 1] === 'normal') {
        result = result.slice(0, idx + offset) + '~right#' + result.slice(idx + offset + 1)
        offset += 6
      }
      handleStack.pop()
    }
  })

  const createFormulaText = (name: string, value: string) => `<span class="skill-formula-function-wrapper key--${name}"><span class="name">${name.toUpperCase()}</span><span class="value">${value}</span></span>`

  while (FUNCTION_HIGHLIGHT_LIST.find(item => result.match(item.reg))) {
    FUNCTION_HIGHLIGHT_LIST.forEach(item => result = result.replace(item.reg, item.target ?? ((match, p1) => createFormulaText(item.name, p1))))
  }
  result = result
    .replaceAll('#left~', '(')
    .replaceAll('~right#', ')')

  result = result.replace(/,/g, '<span class="param-separate"></span>')

  return result
}

export { handleFunctionHighlight }
