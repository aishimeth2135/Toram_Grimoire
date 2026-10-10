import { ref, shallowReactive } from 'vue'
import type { Ref } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { useNotify } from '@/shared/composables/Notify'
import { lastElement } from '@/shared/utils/array'

import { Character } from '@/lib/Character/Character'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { FoodsBuild } from '@/lib/Character/FoodBuild'
import { PotionBuild } from '@/lib/Character/PotionBuild'
import { RegistletBuild } from '@/lib/Character/RegistletBuild'
import { SkillBuild } from '@/lib/Character/SkillBuild'

import { CHARACTER_SIMULATOR_BUILD_LIMIT, CHARACTER_SIMULATOR_EQUIPMENT_LIMIT } from '../consts'
import { useCharacterFoodStore } from '../food-build'
import { useCharacterPotionBuildStore } from '../potion-build'
import { useCharacterRegistletBuildStore } from '../registlet-build'
import { useCharacterSkillBuildStore } from '../skill-build'
import type { CharacterBuildsContext } from './context'
import { useCharacterBindingBuild } from './useCharacterBindingBuild'

export function setupCharacters() {
  const foodStore = useCharacterFoodStore()
  const skillBuildStore = useCharacterSkillBuildStore()
  const registletBuildStore = useCharacterRegistletBuildStore()
  const potionBuildStore = useCharacterPotionBuildStore()

  const {
    builds: characters,
    currentBuildIndex: currentCharacterIndex,
    currentBuild: currentCharacter,
    setCurrentBuild: selectCharacter,
    appendBuild,
    removeBuild,
    replaceBuilds: replaceCharacters,
    resetBuildStore,
  } = useCharacterBindingBuild<Character>(
    () => Character.create(Grimoire.i18n.t('character-simulator.character') + ' 1'),
    CHARACTER_SIMULATOR_BUILD_LIMIT
  )

  const characterStates = new Map<number, CharacterBuildsContext>()
  const getCharacterState = (chara: Character): CharacterBuildsContext => {
    const existing = characterStates.get(chara.id)
    if (existing) {
      return existing
    }

    const state = shallowReactive<CharacterBuildsContext>({
      skillBuild: skillBuildStore.currentSkillBuild,
      foodBuild: foodStore.currentFoodBuild,
      registletBuild: registletBuildStore.currentRegistletBuild,
      potionBuild: potionBuildStore.currentPotionBuild,
    })
    characterStates.set(chara.id, state)
    return state
  }

  const repairCharacterBuilds = () => {
    characterStates.forEach(state => {
      state.skillBuild =
        skillBuildStore.skillBuilds.find(build => build.id === state.skillBuild.id) ??
        skillBuildStore.currentSkillBuild
      state.foodBuild =
        foodStore.foodBuilds.find(build => build.id === state.foodBuild.id) ??
        foodStore.currentFoodBuild
      state.registletBuild =
        registletBuildStore.registletBuilds.find(build => build.id === state.registletBuild.id) ??
        registletBuildStore.currentRegistletBuild
      state.potionBuild =
        potionBuildStore.potionBuilds.find(build => build.id === state.potionBuild.id) ??
        potionBuildStore.currentPotionBuild
    })
  }
  skillBuildStore.onBuildsChange(repairCharacterBuilds)
  foodStore.onBuildsChange(repairCharacterBuilds)
  registletBuildStore.onBuildsChange(repairCharacterBuilds)
  potionBuildStore.onBuildsChange(repairCharacterBuilds)

  const setCurrentCharacter = (value: number | Character) => {
    selectCharacter(value)
    const current = getCharacterState(currentCharacter.value)
    skillBuildStore.setCurrentSkillBuild(current.skillBuild)
    foodStore.setCurrentFoodBuild(current.foodBuild)
    registletBuildStore.setCurrentRegistletBuild(current.registletBuild)
    potionBuildStore.setCurrentPotionBuild(current.potionBuild)
  }

  const setCharacterSkillBuild = (build: SkillBuild) => {
    skillBuildStore.setCurrentSkillBuild(build)
    getCharacterState(currentCharacter.value).skillBuild = skillBuildStore.currentSkillBuild
  }

  const setCharacterFoodBuild = (build: FoodsBuild) => {
    foodStore.setCurrentFoodBuild(build)
    getCharacterState(currentCharacter.value).foodBuild = foodStore.currentFoodBuild
  }

  const setCharacterRegistletBuild = (build: RegistletBuild) => {
    registletBuildStore.setCurrentRegistletBuild(build)
    getCharacterState(currentCharacter.value).registletBuild =
      registletBuildStore.currentRegistletBuild
  }

  const setCharacterPotionBuild = (build: PotionBuild) => {
    potionBuildStore.setCurrentPotionBuild(build)
    getCharacterState(currentCharacter.value).potionBuild = potionBuildStore.currentPotionBuild
  }

  const appendCharacter: typeof appendBuild = (character, options) => {
    const appended = appendBuild(character, options)
    if (appended) {
      getCharacterState(appended)
    }
    return appended
  }

  const createCharacter = (updateIndex = true) => {
    const character = Character.create(
      Grimoire.i18n.t('character-simulator.character') + ' ' + (characters.value.length + 1)
    )
    const appended = appendCharacter(character, { updateIndex })
    if (appended) {
      const state = getCharacterState(appended)
      state.skillBuild = skillBuildStore.skillBuilds[0] ?? skillBuildStore.currentSkillBuild
      state.foodBuild = foodStore.foodBuilds[0] ?? foodStore.currentFoodBuild
      state.registletBuild =
        registletBuildStore.registletBuilds[0] ?? registletBuildStore.currentRegistletBuild
      state.potionBuild = potionBuildStore.potionBuilds[0] ?? potionBuildStore.currentPotionBuild
      if (updateIndex) {
        setCurrentCharacter(appended)
      }
    }
    return appended
  }

  const cloneCharacter = (character: Character) => {
    const appended = appendCharacter(character.clone(), { updateIndex: false })
    if (appended) {
      Object.assign(getCharacterState(appended), getCharacterState(character))
    }
    return appended
  }

  const removeCharacter = (character: Character) => {
    const nextIdx = removeBuild(character)
    if (!characters.value.some(item => item.id === character.id)) {
      characterStates.delete(character.id)
      characters.value.forEach(item => {
        item.comparisonTableBuild.comparedCharacters =
          item.comparisonTableBuild.comparedCharacters.filter(
            compared => compared.id !== character.id
          )
      })
    }
    setCurrentCharacter(currentCharacter.value)
    return nextIdx
  }

  const resetCharacters = () => {
    characterStates.clear()
    resetBuildStore()
    setCurrentCharacter(0)
  }

  getCharacterState(currentCharacter.value)

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
    resetCharacters,
    replaceCharacters: (values: Character[]) => {
      characterStates.clear()
      replaceCharacters(values)
      characters.value.forEach(getCharacterState)
    },
  }
}

export function setupEquipments(currentCharacter: Ref<Character>) {
  const notify = useNotify()
  const equipments: Ref<CharacterEquipment[]> = ref([])

  const appendEquipment = (equip: CharacterEquipment, index = -1, checkLimit = true) => {
    if (checkLimit && equipments.value.length >= CHARACTER_SIMULATOR_EQUIPMENT_LIMIT) {
      notify(
        Grimoire.i18n.t('character-simulator.build-limit-reached', {
          num: CHARACTER_SIMULATOR_EQUIPMENT_LIMIT,
        })
      )
      return null
    }
    if (index < 0 || index >= equipments.value.length) {
      equipments.value.push(equip)
      return lastElement(equipments.value)
    }
    equipments.value.splice(index, 0, equip)
    return equipments.value[index + 1]
  }

  const appendEquipments = (eqs: CharacterEquipment[], index = -1, checkLimit = true) => {
    if (checkLimit && equipments.value.length + eqs.length > CHARACTER_SIMULATOR_EQUIPMENT_LIMIT) {
      notify(
        Grimoire.i18n.t('character-simulator.build-limit-reached', {
          num: CHARACTER_SIMULATOR_EQUIPMENT_LIMIT,
        })
      )
      return false
    }
    if (index < 0 || index >= equipments.value.length) {
      equipments.value.push(...eqs)
    } else {
      equipments.value.splice(index, 0, ...eqs)
    }
    return true
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
