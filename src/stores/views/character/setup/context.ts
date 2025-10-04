import type { ComputedRef } from 'vue'

import type { FoodsBuild } from '@/lib/Character/FoodBuild'
import type { PotionBuild } from '@/lib/Character/PotionBuild'
import type { RegistletBuild } from '@/lib/Character/RegistletBuild'
import type { SkillBuild } from '@/lib/Character/SkillBuild'
import type { StatRecorded } from '@/lib/Character/Stat'

export interface CharacterBuildsContext {
  skillBuild: SkillBuild | null
  registletBuild: RegistletBuild | null
  potionBuild: PotionBuild | null
  foodBuild: FoodsBuild | null
}

export interface CharacterPureStatsResult {
  skillStats: ComputedRef<StatRecorded[]>
  registletStats: ComputedRef<StatRecorded[]>
  potionStats: ComputedRef<StatRecorded[]>
  foodStats: ComputedRef<StatRecorded[]>
}
