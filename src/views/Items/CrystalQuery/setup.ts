import { StatBase } from '@/lib/Character/Stat'
import { StatTypes } from '@/lib/Character/Stat'

export interface StatOptionItem {
  origin: StatBase
  type: StatTypes
  text: string
}

export const PreviewMode = {
  Default: 0,
  CurrentMode: 1,
} as const
export type PreviewMode = (typeof PreviewMode)[keyof typeof PreviewMode]
