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
  return num.replace(TRIM_ZERO_PATTERN, (m, m1, m2) => m1 + (m2 === '.' ? '' : m2))
}
