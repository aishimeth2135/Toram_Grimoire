import { splitComma } from '@/shared/utils/string'

export function parseListProperty(value: string): string[] {
  return splitComma(value)
}

export function parseFormulaListProperty(value: string): string[] {
  return value.split(/\s*,,\s*/)
}
