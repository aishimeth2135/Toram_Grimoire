/**
 * Prepare the source for fuzzy search.
 * note: prevent `toUpperCase` be invoke by every `fuzzySearch`
 */
export function prepareFuzzySearch(str: string) {
  return str.toUpperCase()
}

export function fuzzySearch(source: string, target: string) {
  return target.toUpperCase().includes(source)
}

export function simpleSearch(source: string, target: string) {
  return target.includes(source)
}
