import { storeToRefs } from 'pinia'
import { Ref } from 'vue'

import { useCharacterStore } from '@/stores/views/character'
import { useCharacterFoodStore } from '@/stores/views/character/food-build'
import { useCharacterPotionBuildStore } from '@/stores/views/character/potion-build'
import { useCharacterRegistletBuildStore } from '@/stores/views/character/registlet-build'
import { CharacterStatCategoryResult } from '@/stores/views/character/setup'
import { useCharacterSkillBuildStore } from '@/stores/views/character/skill-build'

import { Character } from '@/lib/Character/Character'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { FoodsBuild } from '@/lib/Character/FoodBuild'
import { PotionBuild } from '@/lib/Character/PotionBuild'
import { RegistletBuild } from '@/lib/Character/RegistletBuild'
import { SkillBuild } from '@/lib/Character/SkillBuild'

export function setupCharacterStore() {
  const store = useCharacterStore()
  const {
    characters,
    equipments,
    currentCharacter,
    characterStatCategoryResults,
  } = storeToRefs(store)

  return {
    store,
    characters: characters as Ref<Character[]>,
    equipments: equipments as Ref<CharacterEquipment[]>,
    currentCharacter: currentCharacter as Ref<Character | null>,
    characterStatCategoryResults: characterStatCategoryResults as Ref<
      CharacterStatCategoryResult[]
    >,
  }
}

export function setupCharacterSkillBuildStore() {
  const store = useCharacterSkillBuildStore()
  const { skillBuilds, currentSkillBuild } = storeToRefs(store)

  return {
    store,
    skillBuilds: skillBuilds as Ref<SkillBuild[]>,
    currentSkillBuild: currentSkillBuild as Ref<SkillBuild | null>,
  }
}

export function setupCharacterFoodStore() {
  const store = useCharacterFoodStore()
  const { foodBuilds, currentFoodBuild } = storeToRefs(store)

  return {
    store,
    foodBuilds: foodBuilds as Ref<FoodsBuild[]>,
    currentFoodBuild: currentFoodBuild as Ref<FoodsBuild>,
  }
}

export function setupCharacterRegistletStore() {
  const store = useCharacterRegistletBuildStore()
  const { registletBuilds, currentRegistletBuild } = storeToRefs(store)

  return {
    store,
    registletBuilds: registletBuilds as Ref<RegistletBuild[]>,
    currentRegistletBuild: currentRegistletBuild as Ref<RegistletBuild>,
  }
}

export function setupCharacterPotionStore() {
  const store = useCharacterPotionBuildStore()
  const { potionBuilds, currentPotionBuild } = storeToRefs(store)

  return {
    store,
    potionBuilds: potionBuilds as Ref<PotionBuild[]>,
    currentPotionBuild: currentPotionBuild as Ref<PotionBuild>,
  }
}

export const enum TabIds {
  Basic = 'basic',
  EquipmentFields = 'equipmentFields',
  Equipments = 'equipments',
  Skill = 'skill',
  Food = 'food',
  Save = 'save',
  Registlet = 'registlet',
  Potion = 'potion',
  EquipmentBrowse = 'equipmentBrowse',
}
