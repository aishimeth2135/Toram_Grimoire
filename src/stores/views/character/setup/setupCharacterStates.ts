import { ref, shallowReactive } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { lastElement } from '@/shared/utils/array'

import { Character } from '@/lib/Character/Character'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { FoodsBuild } from '@/lib/Character/FoodBuild'
import { PotionBuild } from '@/lib/Character/PotionBuild'
import { RegistletBuild } from '@/lib/Character/RegistletBuild'
import { SkillBuild } from '@/lib/Character/SkillBuild'

import { useCharacterFoodStore } from '../food-build'
import { useCharacterPotionBuildStore } from '../potion-build'
import { useCharacterRegistletBuildStore } from '../registlet-build'
import { useCharacterSkillBuildStore } from '../skill-build'
import { useCharacterBindingBuild } from './useCharacterBindingBuild'

export function setupCharacters() {
  const foodStore = useCharacterFoodStore()
  const skillBuildStore = useCharacterSkillBuildStore()
  const registletBuildStore = useCharacterRegistletBuildStore()
  const potionBuildStore = useCharacterPotionBuildStore()

  const {
    builds: characters,
    currentBuildIndex: currentCharacterIndex,
    currentBuild: _currentCharacter,
    setCurrentBuild: _setCurrentCharacter,
    appendBuild: appendCharacter,
    removeBuild,
  } = useCharacterBindingBuild<Character>()

  const currentCharacter = _currentCharacter as ComputedRef<Character>

  const characterStates = new Map<
    number,
    {
      skillBuild: SkillBuild | null
      foodBuild: FoodsBuild | null
      registletBuild: RegistletBuild | null
      potionBuild: PotionBuild | null
    }
  >()
  const getCharacterState = (chara: Character) => {
    if (!characterStates.has(chara.id)) {
      characterStates.set(
        chara.id,
        shallowReactive({
          skillBuild: null,
          foodBuild: null,
          registletBuild: null,
          potionBuild: null,
        })
      )
    }
    return characterStates.get(chara.id)!
  }
  const removeCharacterState = (chara: Character) => {
    if (characterStates.has(chara.id)) {
      characterStates.delete(chara.id)
    }
  }

  const setCurrentCharacter = (idx: number | Character) => {
    const previou = getCharacterState(currentCharacter.value)
    _setCurrentCharacter(idx)
    if (!currentCharacter.value) {
      _setCurrentCharacter(0)
    }
    const current = getCharacterState(currentCharacter.value)

    if (current.skillBuild === null) {
      current.skillBuild =
        previou.skillBuild ??
        (skillBuildStore.skillBuilds[0] as SkillBuild) ??
        null
    }
    skillBuildStore.setCurrentSkillBuild(current.skillBuild)

    if (current.foodBuild === null) {
      current.foodBuild = previou.foodBuild ?? foodStore.foodBuilds[0] ?? null
    }
    foodStore.setCurrentFoodBuild(current.foodBuild)

    if (current.registletBuild === null) {
      current.registletBuild =
        previou.registletBuild ??
        (registletBuildStore.registletBuilds[0] as RegistletBuild) ??
        null
    }
    registletBuildStore.setCurrentRegistletBuild(current.registletBuild)
  }

  const setCharacterSkillBuild = (build: SkillBuild) => {
    getCharacterState(currentCharacter.value).skillBuild = build
    skillBuildStore.setCurrentSkillBuild(build)
  }

  const setCharacterFoodBuild = (build: FoodsBuild) => {
    getCharacterState(currentCharacter.value).foodBuild = build
    foodStore.setCurrentFoodBuild(build)
  }

  const setCharacterRegistletBuild = (build: RegistletBuild) => {
    getCharacterState(currentCharacter.value).registletBuild = build
    registletBuildStore.setCurrentRegistletBuild(build)
  }

  const setCharacterPotionBuild = (build: PotionBuild) => {
    getCharacterState(currentCharacter.value).potionBuild = build
    potionBuildStore.setCurrentPotionBuild(build)
  }

  const createCharacter = (updateIndex: boolean = true) => {
    const newCharacter = new Character(
      Grimoire.i18n.t('character-simulator.character') +
        ' ' +
        (characters.value.length + 1)
    )
    appendCharacter(newCharacter, updateIndex)
    const state = getCharacterState(newCharacter)
    state.skillBuild = (skillBuildStore.skillBuilds[0] as SkillBuild) ?? null
    state.foodBuild = (foodStore.foodBuilds[0] as FoodsBuild) ?? null
    state.registletBuild =
      (registletBuildStore.registletBuilds[0] as RegistletBuild) ?? null
    state.potionBuild =
      (potionBuildStore.potionBuilds[0] as PotionBuild) ?? null
    return newCharacter
  }

  const cloneCharacter = (character: Character) => {
    const newCharacter = character.clone()
    appendCharacter(newCharacter, false)

    const characterState = getCharacterState(character)
    const newCharacterState = getCharacterState(newCharacter)
    newCharacterState.skillBuild = characterState.skillBuild
    newCharacterState.foodBuild = characterState.foodBuild
    newCharacterState.registletBuild = characterState.registletBuild
    newCharacterState.potionBuild = characterState.potionBuild
  }

  const removeCharacter = (character: Character) => {
    const nextIdx = removeBuild(character)
    removeCharacterState(character)
    currentCharacterIndex.value = nextIdx
    return nextIdx
  }

  return {
    characters,
    currentCharacter,
    currentCharacterIndex,

    getCharacterState,
    setCurrentCharacter,
    setCharacterSkillBuild,
    setCharacterFoodBuild,
    setCharacterRegistletBuild,
    setCharacterPotionBuild,
    appendCharacter,
    createCharacter,
    removeCharacter,
    cloneCharacter,
  }
}

export function setupEquipments(currentCharacter: Ref<Character>) {
  const equipments: Ref<CharacterEquipment[]> = ref([])

  const appendEquipment = (equip: CharacterEquipment, index = -1) => {
    if (index < 0 || index >= equipments.value.length) {
      equipments.value.push(equip)
      return lastElement(equipments.value)
    }
    equipments.value.splice(index, 0, equip)
    return equipments.value[index + 1]
  }

  const appendEquipments = (eqs: CharacterEquipment[], index = -1) => {
    if (index < 0 || index >= equipments.value.length) {
      equipments.value.push(...eqs)
    } else {
      equipments.value.splice(index, 0, ...eqs)
    }
  }

  const removeEquipment = (equipment: CharacterEquipment) => {
    const idx = equipments.value.indexOf(equipment)
    if (idx > -1) {
      equipments.value.splice(idx, 1)
      currentCharacter.value.equipmentFields.forEach(field => {
        if (field.equipment?.instanceId === equipment.instanceId) {
          field.removeEquipment()
        }
      })
    }
    return idx - 1
  }

  return {
    equipments,
    appendEquipment,
    appendEquipments,
    removeEquipment,
  }
}
