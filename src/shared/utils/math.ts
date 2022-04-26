export function getGcd(value1: number, value2: number): number {
  const max = Math.max(value1, value2)
  const min = Math.min(value1, value2)
  if (max % min === 0) {
    return min
  }
  return getGcd(max % min, min)
}

export function getLcm(value1: number, value2: number) {
  return value1 * value2 / getGcd(value1, value2)
}
