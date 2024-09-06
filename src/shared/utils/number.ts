export function numberToFixed(number: number, digits: number): number {
  const base = Math.pow(10, digits)
  return Math.floor(number * base) / base
}

/**
 * Get random integer between min and max. (include min, not include max)
 * @param min
 * @param max
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

export function toInt(value: string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null
  }
  const res = parseInt(value, 10)
  return Number.isNaN(res) ? null : res
}

export function toFloat(value: string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null
  }
  const res = parseFloat(value)
  return Number.isNaN(res) ? null : res
}

export function toIndex(value: string): number {
  const res = parseInt(value, 10)
  return Number.isNaN(res) ? -1 : res
}

export function normalizeInteger(value: string | number): number {
  if (typeof value !== 'number') {
    value = parseInt(value, 10)
  }
  return Number.isNaN(value) ? 0 : value
}

/**
 * Get the number with the commas.
 * example: 1234567 -> 1,234,567
 */
export function numberWithCommas(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
