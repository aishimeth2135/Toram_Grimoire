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
