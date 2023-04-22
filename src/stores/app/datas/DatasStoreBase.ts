import { shallowReactive } from 'vue'

import type CharacterSystem from '@/lib/Character'
import type DamageCalculationSystem from '@/lib/Damage'
import type EnchantSystem from '@/lib/Enchant'
import type GlossarySystem from '@/lib/Glossary'
import type ItemsSystem from '@/lib/Items'
import type RegistletSystem from '@/lib/Registlet'
import type SkillSystem from '@/lib/Skill'

export const DatasStoreBase: {
  Items: ItemsSystem | null
  Character: CharacterSystem | null
  Glossary: GlossarySystem | null
  Skill: SkillSystem | null
  Enchant: EnchantSystem | null
  DamageCalculation: DamageCalculationSystem | null
  Registlet: RegistletSystem | null
} = shallowReactive({
  Items: null,
  Character: null,
  Glossary: null,
  Skill: null,
  Enchant: null,
  DamageCalculation: null,
  Registlet: null,
})
