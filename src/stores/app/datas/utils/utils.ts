import { normalizeFloat } from '@/shared/utils/number'

import { StatTypes } from '@/lib/Character/Stat'

export function parseStatValueData(dataValue: string): {
  value: number
  type: StatTypes
} {
  let tail = dataValue.slice(-1),
    value = dataValue
  if (tail !== '%' && tail !== '~') {
    tail = ''
  } else {
    value = dataValue.slice(0, -1)
  }

  const resultValue = normalizeFloat(value)

  let type = StatTypes.Constant
  if (tail === '%') {
    type = StatTypes.Multiplier
  } else if (tail === '~') {
    type = StatTypes.Total
  }

  return { value: resultValue, type }
}

type RowGetterMapping = Record<string, number>
type RowGetter<Mapping extends RowGetterMapping> = (key: keyof Mapping) => string

export function getCsvDataRowGetterHelper<Mapping extends RowGetterMapping>(columnMap: Mapping) {
  const createRowGetter = (row: string[]): { row: RowGetter<Mapping> } => {
    // Define the name `row` to unify the usage
    return {
      row: (key: keyof Mapping) => row[columnMap[key]],
    }
  }

  const createLocaleMapping = (
    localeMapping: Partial<Record<keyof Mapping, number>>
  ): Record<number, number> => {
    const result: Record<number, number> = {}
    for (const key in localeMapping) {
      const columnIndex = columnMap[key]
      const localeIndex = localeMapping[key]! // Since for loop is key of localeMapping
      if (columnIndex !== undefined) {
        result[columnIndex] = localeIndex
      }
    }
    return result
  }

  return {
    createRowGetter,
    createLocaleMapping,
  }
}
