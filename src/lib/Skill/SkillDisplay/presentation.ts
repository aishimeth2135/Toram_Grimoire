import { toInt } from '@/shared/utils/number'

import type DisplayDataContainer from './handlers/handle/DisplayDataContainer'

export function getStackInputWidth(container: DisplayDataContainer): string | undefined {
  const value = toInt(container.getValue('max') || container.getValue('default'))
  return value !== null && value > 999 ? '3rem' : undefined
}
