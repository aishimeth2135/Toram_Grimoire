export function isNumberString(str) {
  return /^-?\d+(?:\.\d+)?$/.test(str);
}

export function trimZero(num) {
  return num.replace(/(\d+)(\.[^0]*)(0+)$/g,
    (m, m1, m2) => m1 + (m2 === '.' ? '' : m2))
}