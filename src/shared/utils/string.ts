const NUMBER_STRING_PATTERN = /^-?\d+(?:\.\d+)?$/
export function isNumberString(str: string): boolean {
  if (str.length > 1 && str.startsWith('0')) {
    return false
  }
  return NUMBER_STRING_PATTERN.test(str)
}

export function isIntegerString(str: string): boolean {
  if (str.length > 1 && str.startsWith('0')) {
    return false
  }
  return Number.isInteger(parseInt(str, 10))
}

const TRIM_ZERO_PATTERN = /(\d+)(\.[^0]*)(0+)$/g
/**
 * trim zero of end of given number.
 * (ex: number.toFixed(n) may cause useless 0 at the end)
 */
export function trimFloatStringZero(num: string): string {
  return num.replace(TRIM_ZERO_PATTERN, (m, m1, m2) => m1 + (m2 === '.' ? '' : m2))
}
