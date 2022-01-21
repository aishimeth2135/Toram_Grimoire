export function numberToFixed(number: number, digits: number): number {
  const base = Math.pow(10, digits)
  return Math.floor(number * base) / base
}

