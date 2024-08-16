import { computed } from 'vue'
import { reactive } from 'vue'
import { ref } from 'vue'

import { CHARACTER_MAX_LEVEL } from '@/lib/Character/Character'

export interface EnchantStoreConfig {
  characterLevel: number
  smithLevel: number
  materialSkillLevels: number[]
}

let characterMaxLevel = CHARACTER_MAX_LEVEL

export function updateCharacterMaxLevel(value: number) {
  characterMaxLevel = value
}

export const enchantConfig: EnchantStoreConfig = (() => {
  const _characterLevel = ref(characterMaxLevel)
  const _smithLevel = ref(0)
  return reactive({
    characterLevel: computed<number>({
      get() {
        return _characterLevel.value
      },
      set(value) {
        _characterLevel.value = Math.max(0, Math.min(characterMaxLevel, value))
      },
    }),
    smithLevel: computed<number>({
      get() {
        return _smithLevel.value
      },
      set(value) {
        _smithLevel.value = Math.max(0, Math.min(300, value))
      },
    }),
    materialSkillLevels: [0, 0, 0, 0, 0, 0],
  })
})()
