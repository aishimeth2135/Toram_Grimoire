import { parseListProperty } from './List'

export const SKILL_SELF_BUFFS = ['guaranteed_critical', 'guaranteed_hit'] as const

export type SkillSelfBuff = (typeof SKILL_SELF_BUFFS)[number]

export function parseSkillSelfBuffs(value: string): SkillSelfBuff[] {
  return parseListProperty(value).filter((buff): buff is SkillSelfBuff =>
    SKILL_SELF_BUFFS.some(option => option === buff)
  )
}
