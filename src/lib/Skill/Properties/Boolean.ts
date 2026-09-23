export function parseBooleanProperty(value: string | undefined): boolean {
  return value === '1'
}

export function normalizeBooleanProperty(value: string): string {
  if (value === '1') {
    return 'true'
  }
  if (value === '0') {
    return 'false'
  }
  return value
}
