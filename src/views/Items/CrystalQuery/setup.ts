import { StatBase } from '@/lib/Character/Stat'
import { StatTypes } from '@/lib/Character/Stat'

export interface StatOptionItem {
  origin: StatBase
  type: StatTypes
  text: string
}
