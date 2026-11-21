export function getIterablePropertyKey(originalKey: string, index: number | string): string {
  return `${originalKey}.${index}`
}

export function getIterableSubPropertyKey(
  originalKey: string,
  index: number | string,
  subKey: string
): string {
  return `${originalKey}.${index}.${subKey}`
}
