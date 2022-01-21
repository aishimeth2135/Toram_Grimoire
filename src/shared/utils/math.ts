export function getGcd(a: number, b: number): number {
  const max = Math.max(a, b)
  const min = Math.min(a, b)
  if (max % min === 0) {
    return min
  }
  return getGcd(max % min, min)
}

export function getLcm(a: number, b: number) {
  return a * b / getGcd(a, b)
}
