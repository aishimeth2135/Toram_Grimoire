/**
 * Create new array with given length
 * @param len - length of new array
 */
export function createEmptyArray(len: number) {
  return Array(len).fill(undefined)
}

/**
 * Get the last element of array.
 * @param ary - target array
 */
export function lastElement<E extends any>(ary: E[]): E {
  return ary[ary.length - 1]
}
