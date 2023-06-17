/**
 * Create a new array with the given length
 * @param len - length of new array
 */
export function createEmptyArray(len: number) {
  return Array(len).fill(undefined)
}

/**
 * Create a new array which elements from 0 to the given length
 * @param len - end index of range
 */
export function createRange(len: number) {
  return createEmptyArray(len).map((item, idx) => idx)
}

/**
 * Get the last element of array.
 * @param ary - target array
 */
export function lastElement<E extends any>(ary: E[]): E {
  return ary[ary.length - 1]
}

/**
 * Get the last element of array.
 * @param ary - target array
 */
export function inplaceAssign<E extends any>(ary: E[], items: E[]) {
  return ary.splice(0, ary.length, ...items)
}
