export function isNumberString(str) {
  return /^-?\d+(?:\.\d+)?$/.test(str);
}

/**
 * trim zero of end of given number.
 * (ex: number.toFixed(n) may cause useless 0 at the end)
 * @param {string} num
 * @returns {string}
 */
export function trimZero(num) {
  return num.replace(/(\d+)(\.[^0]*)(0+)$/g,
    (m, m1, m2) => m1 + (m2 === '.' ? '' : m2))
}