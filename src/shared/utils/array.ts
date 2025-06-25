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
  return createEmptyArray(len).map((_item, idx) => idx)
}

/**
 * Get the last element of array.
 * @param ary - source array
 */
export function lastElement<E>(ary: E[]): E {
  return ary[ary.length - 1]
}

/**
 * Remove the element of array.
 * @param ary - source array
 * @param element - target element
 * @returns `true` if the source array contains target element, else `false`
 */
export function removeElement<E>(ary: E[], element: E): boolean {
  const idx = ary.indexOf(element)
  if (idx > -1) {
    ary.splice(idx, 1)
    return true
  }
  return false
}

export function toggleElement<E>(ary: E[], element: E): boolean {
  const idx = ary.indexOf(element)
  if (idx > -1) {
    ary.splice(idx, 1)
    return false
  } else {
    ary.push(element)
    return true
  }
}

export function inplaceAssign<E>(ary: E[], items: E[]) {
  return ary.splice(0, ary.length, ...items)
}

export function filterNullish<E>(ary: (E | null | undefined)[]): E[] {
  return ary.filter(item => item !== null && item !== undefined) as E[]
}
