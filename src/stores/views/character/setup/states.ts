import { Ref, computed, ref } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { Character } from '@/lib/Character/Character'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { RegistletBuild } from '@/lib/Character/RegistletBuild/RegistletBuild'

import { FoodsBuild } from '../../../../lib/Character/Food/FoodBuild'
import { SkillBuild } from '../../../../lib/Character/SkillBuild/SkillBuild'
import { useCharacterFoodStore } from '../food-build'
import { useCharacterSkillBuildStore } from '../skill-build'

export function setupCharacters() {
  const foodStore = useCharacterFoodStore()
  const skillBuildStore = useCharacterSkillBuildStore()

  const currentCharacterIndex = ref(-1)
  const characters: Ref<Character[]> = ref([])

  const getCharacterState = (() => {
    const characterStates = new Map<
      Character,
      {
        skillBuild: SkillBuild | null
        foodBuild: FoodsBuild | null
        registletBuild: RegistletBuild | null
      }
    >()
    return (chara: Character) => {
      if (!characterStates.has(chara)) {
        characterStates.set(chara, {
          skillBuild: null,
          foodBuild: null,
          registletBuild: null,
        })
      }
      return characterStates.get(chara)!
    }
  })()

  const currentCharacter = computed<Character>(
    () => characters.value[currentCharacterIndex.value]
  )

  const setCurrentCharacter = (idx: number | Character) => {
    if (typeof idx !== 'number') {
      idx = characters.value.indexOf(idx)
    }
    const previou = getCharacterState(currentCharacter.value)
    currentCharacterIndex.value = idx
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
  }

  const setCharacterSkillBuild = (skillBuild: SkillBuild) => {
    getCharacterState(currentCharacter.value).skillBuild = skillBuild
    skillBuildStore.setCurrentSkillBuild(skillBuild)
  }

  const setCharacterFoodBuild = (foodBuild: FoodsBuild) => {
    getCharacterState(currentCharacter.value).foodBuild = foodBuild
    foodStore.setCurrentFoodBuild(foodBuild)
  }

  const createCharacter = (chara?: Character, updateIndex = true) => {
    if (chara) {
      characters.value.push(chara)
    } else {
      characters.value.push(
        new Character(
          Grimoire.i18n.t('character-simulator.character') +
            ' ' +
            (characters.value.length + 1)
        )
      )
    }
    if (updateIndex) {
      currentCharacterIndex.value = characters.value.length - 1
    }
  }

  const removeCharacter = (idx: number = currentCharacterIndex.value) => {
    characters.value.splice(idx, 1)
    if (currentCharacterIndex.value >= characters.value.length) {
      currentCharacterIndex.value = characters.value.length - 1
    }
  }

  return {
    characters,
    currentCharacter,
    currentCharacterIndex,

    getCharacterState,
    setCurrentCharacter,
    setCharacterSkillBuild,
    setCharacterFoodBuild,
    createCharacter,
    removeCharacter,
  }
}

export function setupEquipments(currentCharacter: Ref<Character>) {
  const equipments: Ref<CharacterEquipment[]> = ref([])

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
  }

  const moveEquipment = (
    equipment: CharacterEquipment,
    offset: number,
    datum?: CharacterEquipment
  ) => {
    if (offset === 0) {
      return
    }
    const datumIdx = equipments.value.indexOf(datum ?? equipment)
    const equipmentIdx = equipments.value.indexOf(equipment)
    if (datumIdx > -1 && equipmentIdx > -1) {
      let targetIdx = datumIdx + offset
      if (datum) {
        targetIdx += targetIdx > equipmentIdx ? -1 : 1
      }
      equipments.value.splice(equipmentIdx, 1)
      equipments.value.splice(targetIdx, 0, equipment)
    }
  }

  return {
    equipments,
    appendEquipments,
    removeEquipment,
    moveEquipment,
  }
}
