const NUMBER_STRING_PATTERN = /^-?\d+(?:\.\d+)?$/
export function isNumberString(str: string): boolean {
  if (typeof str !== 'string') {
    str = '' + str
  }
  if (str.length > 1 && str.startsWith('0') && !str.includes('.')) {
    return false
  }
  return NUMBER_STRING_PATTERN.test(str)
}

const INTEGER_STRING_PATTERN = /^-?\d+(?:\.\d+)?$/
export function isIntegerString(str: string): boolean {
  if (typeof str !== 'string') {
    str = '' + str
  }
  if (str.length > 1 && str.startsWith('0')) {
    return false
  }
  return INTEGER_STRING_PATTERN.test(str)
}

const TRIM_ZERO_PATTERN = /(\d+)(\.[^0]*)(0+)$/g
/**
 * trim zero of end of given number.
 * (ex: number.toFixed(n) may cause useless 0 at the end)
 */
export function trimFloatStringZero(num: string): string {
  return num.replace(
    TRIM_ZERO_PATTERN,
    (_match, m1, m2) => m1 + (m2 === '.' ? '' : m2)
  )
}

const SPLIT_COMMA_PATTERN = /\s*,\s*/
export function splitComma(str: string): string[] {
  if (!str) {
    return []
  }
  return str.split(SPLIT_COMMA_PATTERN)
}

export function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function lastChar(str: string): string {
  return str[str.length - 1]
}
