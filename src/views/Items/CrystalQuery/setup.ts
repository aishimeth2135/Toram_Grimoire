import { StatBase } from '@/lib/Character/Stat'
import { StatTypes } from '@/lib/Character/Stat'

export interface StatOptionItem {
  id: string
  origin: StatBase
  type: StatTypes
  text: string
}

export type PreviewMode = 'default' | 'current-mode'
