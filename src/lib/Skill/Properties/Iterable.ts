export function createIterablePropertyKey(...keys: string[]): string {
  return keys.join('.')
}

export function appendIterablePropertyIndex(name: string, index: string): string {
  const [property, subProperty] = name.split('.')
  return property + index + (subProperty ? `.${subProperty}` : '')
}
