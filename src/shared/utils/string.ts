export function isNumberString(str: string): boolean {
  return /^-?\d+(?:\.\d+)?$/.test(str)
}

/**
 * trim zero of end of given number.
 * (ex: number.toFixed(n) may cause useless 0 at the end)
 */
export function trimZero(num: string): string {
  return num.replace(/(\d+)(\.[^0]*)(0+)$/g,
    (m, m1, m2) => m1 + (m2 === '.' ? '' : m2))
}
