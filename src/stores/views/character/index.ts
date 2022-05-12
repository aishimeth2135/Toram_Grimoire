
import { defineStore } from 'pinia'
import { computed, Ref, readonly, ref } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { Character, CharacterSaveData } from '@/lib/Character/Character'
import { CharacterEquipment, EquipmentSaveData } from '@/lib/Character/CharacterEquipment'
import { FoodBuild, FoodsSaveData } from '@/lib/Character/Food'
import { Skill } from '@/lib/Skill/Skill'
import { CalculationItemIds } from '@/lib/Calculation/Damage/Calculation/enums'

import { SkillBuildState, useCharacterSkillStore } from './skill'
import { useCharacterFoodStore } from './food'
import { setupCharacterSkills, setupCharacterStats, setupFoodStats } from './setup'
import { SkillBuild, SkillBuildSaveData } from './skill-build/SkillBuild'
import { useCharacterSkillBuildStore } from './skill-build'
import setupDamageCalculation, { CalculationOptions, TargetProperties } from './setup/setupDamageCalculation'

interface EquipmentSaveDataWithIndex extends EquipmentSaveData {
  idx: number;
}

interface CharacterStoreSaveSummary {
  characterIndex: number;
  skillBuildIndex?: number;
  foodBuildIndex: number;
}

interface CharacterStoreCharacterStateSaveData {
  id: number;
  skillBuildId: number | null;
  foodBuildId: number | null;
}

interface CharacterSimulatorSaveData {
  characters: CharacterSaveData[];
  equipments: EquipmentSaveDataWithIndex[];
  skillBuilds: SkillBuildSaveData[];
  foodBuilds: FoodsSaveData[];
  characterStates: CharacterStoreCharacterStateSaveData[];
}

interface CharacterSimulatorSaveDataRoot {
  summary: CharacterStoreSaveSummary;
  datas: CharacterSimulatorSaveData;
}

const V2_AUTO_SAVE_STORAGE_KEY = 'app--character-simulator--data-v2--auto'

export const useCharacterStore = defineStore('view-character', () => {
  const currentCharacterIndex = ref(-1)
  const characterSimulatorHasInit = ref(false)
  const characters: Ref<Character[]> = ref([])
  const equipments: Ref<CharacterEquipment[]> = ref([])
  const autoSaveDisabled = ref(false)

  const skillStore = useCharacterSkillStore()
  const foodStore = useCharacterFoodStore()
  const skillBuildStore = useCharacterSkillBuildStore()

  const saveDisabled = ref(false)

  const setupOptions = ref({
    handleFood: true,
    handleActiveSkill: true,
    handlePassiveSkill: true,
    skillDisplayStatsOnly: true,
  })

  const currentCharacter = computed<Character>(() => characters.value[currentCharacterIndex.value])

  const characterSimulatorInitFinished = () => {
    characterSimulatorHasInit.value = true
  }

  const closeAutoSave = () => {
    autoSaveDisabled.value = false
  }

  const reset = () => {
    skillStore.resetSkillBuilds()
    characters.value = []
    equipments.value = []
    skillBuildStore.reset()
    foodStore.resetFoodBuilds()
  }

  const getCharacterState = (() => {
    const characterStates = new Map<Character, {
      skillBuild: SkillBuild | null;
      foodBuild: FoodBuild | null;
    }>()
    return (chara: Character) => {
      if (!characterStates.has(chara)) {
        characterStates.set(chara, {
          skillBuild: null,
          foodBuild: null,
        })
      }
      return characterStates.get(chara)!
    }
  })()

  const setCurrentCharacter = (idx: number | Character) => {
    if (typeof idx !== 'number') {
      idx = characters.value.indexOf(idx)
    }
    const previou = getCharacterState(currentCharacter.value)
    currentCharacterIndex.value = idx
    const current = getCharacterState(currentCharacter.value)
    if (current.skillBuild === null) {
      current.skillBuild = previou.skillBuild
    }
    skillBuildStore.setCurrentSkillBuild(current.skillBuild)
    if (current.foodBuild === null) {
      current.foodBuild = previou.foodBuild
    }
    foodStore.setCurrentFoodBuild(current.foodBuild)
  }

  const setCharacterSkillBuild = (skillBuild: SkillBuild) => {
    getCharacterState(currentCharacter.value).skillBuild = skillBuild
    skillBuildStore.setCurrentSkillBuild(skillBuild)
  }

  const setCharacterFoodBuild = (foodBuild: FoodBuild) => {
    getCharacterState(currentCharacter.value).foodBuild = foodBuild
    foodStore.setCurrentFoodBuild(foodBuild)
  }

  const createCharacter = (chara?: Character, updateIndex = true) => {
    if (chara) {
      characters.value.push(chara)
    } else {
      characters.value.push(new Character(Grimoire.i18n.t('character-simulator.character')  + ' ' + (characters.value.length + 1)))
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

  const moveEquipment = (equipment: CharacterEquipment, offset: number, datum?: CharacterEquipment) => {
    if (offset === 0) {
      return
    }
    const datumIdx = equipments.value.indexOf(datum ?? equipment)
    const equipmentIdx = equipments.value.indexOf(equipment)
    if (datumIdx > -1 && equipmentIdx > -1) {
      let targetIdx = datumIdx + offset
      if (datum) {
        targetIdx += (targetIdx > equipmentIdx ? -1 : 1)
      }
      equipments.value.splice(equipmentIdx, 1)
      equipments.value.splice(targetIdx, 0, equipment)
    }
  }

  const deleteAllSavedData = () => {
    const prefix = 'app--character-simulator--data-'
    const storage = window.localStorage

    let find = true, cnt = 0
    const list = ['', '--characters', '--equipments', '--skillBuilds', '--skillBuilds-v2', '--foodBuilds']
    while (find) {
      const curPrefix = prefix + cnt
      const finds = list.filter(suffixKey => {
        const item = curPrefix + suffixKey
        if (storage.getItem(item) !== null) {
          // backup[item] = storage.getItem(item);
          storage.removeItem(item)
          return true
        }
        return false
      })
      find = finds.length > 0
      cnt += 1
    }

    saveDisabled.value = true
  }

  const createCharacterSimulatorSaveData = (): CharacterSimulatorSaveData => {
    const charactersData = characters.value.map(item => item.save(equipments.value))
    const equipmentsData = equipments.value.map((item, idx) => ({ idx, ...item.save() }))
    const skillBuildsData = skillBuildStore.saveSkillBuilds()
    const foodBuildsData = foodStore.foodBuilds.map(item => item.save())
    const characterStates = characters.value.map(chara => ({
      id: chara.instanceId,
      skillBuildId: getCharacterState(chara).skillBuild?.instanceId ?? null,
      foodBuildId: getCharacterState(chara).foodBuild?.instanceId ?? null,
    }))

    return {
      characters: charactersData,
      equipments: equipmentsData,
      skillBuilds: skillBuildsData,
      foodBuilds: foodBuildsData,
      characterStates,
    }
  }
  const loadCharacterSimulatorSaveData = (() => {
    let _loadCount = 0

    return (saveData: CharacterSimulatorSaveData, { ignoreSkillBuilds = false }: { ignoreSkillBuilds?: boolean } = {}) => {
      _loadCount += 1
      const loadCategory = 'common-' + _loadCount

      // lagacy
      if (saveData.equipments.some(data => typeof data.idx !== 'number')) {
        saveData.equipments = saveData.equipments.map((item, idx) => ({ ...item, idx }))
      }

      const allValidEquipmentsLength = saveData.equipments.map(data => data.idx).reduce((cur, item2) => Math.max(cur, item2), 0)
      const allValidEquipments = Array<(CharacterEquipment | null)>(allValidEquipmentsLength).fill(null)
      saveData.equipments.forEach(data => {
        const equip = CharacterEquipment.loadEquipment(loadCategory, data)
        allValidEquipments[data.idx] = equip
      })

      saveData.characters.forEach(charaRow => {
        const chara = new Character()
        const load = chara.load(loadCategory, charaRow, allValidEquipments)
        if (load) {
          createCharacter(chara, false)
        }
      })

      appendEquipments(allValidEquipments.filter(equip => equip) as CharacterEquipment[])

      if (!ignoreSkillBuilds) {
        saveData.skillBuilds.forEach(buildData => {
          const build = SkillBuild.load(loadCategory, buildData)
          skillBuildStore.appendSkillBuild(build, false)
        })
      }

      saveData.foodBuilds.forEach(data => {
        const foods = foodStore.foodsBase!.createFoods()
        const load = foods.load(loadCategory, data)
        if (!load.error) {
          foodStore.createFoodBuild({ foodBuild: foods }, false)
        }
      })

      ;(saveData.characterStates || []).forEach(item => {
        const chara = characters.value.find(ch => ch.matchLoadedId(loadCategory, item.id))
        if (chara) {
          const skillBuild = (skillBuildStore.skillBuilds.find(build => build.matchLoadedId(loadCategory, item.skillBuildId)) ?? null) as (SkillBuild | null)
          getCharacterState(chara).skillBuild = skillBuild
          const foodBuild = (foodStore.foodBuilds.find(build => build.matchLoadedId(loadCategory, item.foodBuildId)) ?? null) as (FoodBuild | null)
          getCharacterState(chara).foodBuild = foodBuild
        }
      })
    }
  })()

  const loadCharacterSimulator = ({ index = 0 }: { index?: number } = {}) => {
    try {
      reset()

      const v2Data = window.localStorage.getItem(V2_AUTO_SAVE_STORAGE_KEY)
      if (v2Data !== null) {
        console.log('[character-simulator] datas version: v2')
        const { summary, datas } = JSON.parse(v2Data) as CharacterSimulatorSaveDataRoot
        loadCharacterSimulatorSaveData(datas)
        setCurrentCharacter(summary.characterIndex)
        foodStore.setCurrentFoodBuild(summary.foodBuildIndex ?? -1)
      } else {
        const prefix = 'app--character-simulator--data-' + index
        if (!window.localStorage.getItem(prefix)) {
          console.warn(`[character-simulator] index ${index} of data is not exist.`)
          return
        }
        const summary = JSON.parse(window.localStorage.getItem(prefix)!) as CharacterStoreSaveSummary
        const characterDatas = JSON.parse(window.localStorage.getItem(prefix + '--characters')!) as CharacterSaveData[]
        const equipmentDatas = JSON.parse(window.localStorage.getItem(prefix + '--equipments')!) as EquipmentSaveDataWithIndex[]
        const skillBuildsCsv = window.localStorage.getItem(prefix + '--skillBuilds') ?? null
        const skillBuildsV2OriginalData = window.localStorage.getItem(prefix + '--skillBuilds-v2')
        const skillBuildsV2Data = skillBuildsV2OriginalData ? JSON.parse(skillBuildsV2OriginalData) as SkillBuildSaveData[] : null

        const foodBuildsDataString = window.localStorage.getItem(prefix + '--foodBuilds')
        const foodBuilds = foodBuildsDataString ? JSON.parse(foodBuildsDataString) as FoodsSaveData[] : []

        const loadSkillBuildLagacy = !skillBuildsV2Data

        if (loadSkillBuildLagacy && skillBuildsCsv) {
          skillStore.loadSkillBuildsCsv({ csvString: skillBuildsCsv })
          ;(skillStore.skillBuilds as SkillBuildState[]).forEach(state => {
            const build = SkillBuild.loadFromLagacy(state)
            skillBuildStore.appendSkillBuild(build)
          })
        }

        loadCharacterSimulatorSaveData({
          characters: characterDatas,
          equipments: equipmentDatas,
          skillBuilds: skillBuildsV2Data ?? [],
          foodBuilds,
          characterStates: [],
        }, { ignoreSkillBuilds: loadSkillBuildLagacy })

        // 讀檔過程會改寫index，因此最後設定index
        setCurrentCharacter(summary.characterIndex)

        // lagacy
        if (typeof summary.skillBuildIndex === 'number') {
          setCharacterSkillBuild(skillBuildStore.skillBuilds[summary.skillBuildIndex] as SkillBuild)
        }

        foodStore.setCurrentFoodBuild(summary.foodBuildIndex ?? -1)
      }
    } catch (error) {
      reset()
      createCharacter()
      closeAutoSave()
      console.warn('[character-simulator] unexpected error.')
      throw error
    }
  }

  const saveCharacterSimulator = () => {
    if (saveDisabled.value) {
      return
    }
    const datas = createCharacterSimulatorSaveData()
    const summary: CharacterStoreSaveSummary = {
      characterIndex: currentCharacterIndex.value,
      foodBuildIndex: foodStore.currentFoodBuildIndex,
    }

    const originalData = window.localStorage.getItem(V2_AUTO_SAVE_STORAGE_KEY) || '{}'
    try {
      window.localStorage.setItem(V2_AUTO_SAVE_STORAGE_KEY, JSON.stringify({
        summary,
        datas,
      } as CharacterSimulatorSaveDataRoot))
      const list = ['', '--characters', '--equipments', '--skillBuilds', '--skillBuilds-v2', '--foodBuilds']
      list.some(suffixKey => {
        const item = 'app--character-simulator--data-0' + suffixKey
        if (window.localStorage.getItem(item) !== null) {
          window.localStorage.removeItem(item)
          return false
        }
        return true
      })
    } catch (err) {
      console.warn('[character-simulator] Unexpected error.')
      console.warn(err)
      window.localStorage.setItem(V2_AUTO_SAVE_STORAGE_KEY, originalData)
    }
  }

  const currentSkillBuild = computed(() => skillBuildStore.currentSkillBuild as (SkillBuild | null))

  const {
    activeSkillResultStates,
    passiveSkillResultStates,
    skillPureStats,
    getSkillBranchItemState,
  } = setupCharacterSkills(
    currentCharacter,
    currentSkillBuild,
    setupOptions,
  )

  const { allFoodBuildStats } = setupFoodStats(computed(() => foodStore.currentFoodBuild))

  const {
    characterStatCategoryResults,
    postponedActiveSkillResultStates,
    postponedPassiveSkillResultStates,
    damageSkillResultStates,
    setupCharacterStatCategoryResultsExtended,
  } = setupCharacterStats(
    currentCharacter,
    currentSkillBuild,
    {
      stats: skillPureStats,
      getSkillBranchItemState,
    },
    allFoodBuildStats,
    setupOptions,
  )

  const setupCharacterComparedStatCategoryResults = (comparedCharacter: Ref<Character | null>) => {
    const { characterStatCategoryResults: comparedCharacterStatCategoryResults } = setupCharacterStats(
      comparedCharacter,
      currentSkillBuild,
      {
        stats: skillPureStats,
        getSkillBranchItemState,
      },
      allFoodBuildStats,
      setupOptions,
    )
    return {
      comparedCharacterStatCategoryResults,
    }
  }

  const targetProperties: Ref<TargetProperties> = ref({
    physicalResistance: 0,
    magicResistance: 0,
    def: 0,
    mdef: 0,
    level: 0,
    criticalRateResistance: 0,
    criticalRateResistanceTotal: 0,
    dodge: 0,
    element: null,
    rangeDamage: CalculationItemIds.ShortRangeDamage,
  })

  const calculationOptions: Ref<CalculationOptions> = ref({
    proration: 150,
    comboMultiplier: 250,
  })

  const { setupDamageCalculationExpectedResult } = (() => {
    const allSkillResultStates = computed(() => ([
      ...activeSkillResultStates.value,
      ...passiveSkillResultStates.value,
      ...postponedActiveSkillResultStates.value,
      ...postponedPassiveSkillResultStates.value,
    ]))
    const getSkillLevel = (targetSkill: Skill) => {
      if (!currentSkillBuild.value) {
        return {
          valid: false,
          level: 0,
        }
      }
      return {
        valid: allSkillResultStates.value.some(state => state.skill === targetSkill && state.results.length > 0),
        level: currentSkillBuild.value.getSkillState(targetSkill).level,
      }
    }

    return setupDamageCalculation(
      currentCharacter,
      setupCharacterStatCategoryResultsExtended,
      getSkillLevel,
    )
  })()

  const getDamageCalculationSkillState = (() => {
    const skillStates = ref(new Map<Skill, { enabled: boolean }>())
    return (_skill: Skill) => {
      if (!skillStates.value.has(_skill)) {
        skillStates.value.set(_skill, { enabled: false })
      }
      return skillStates.value.get(_skill)!
    }
  })()

  return {
    characters,
    equipments,
    currentCharacter,
    currentCharacterIndex,
    characterSimulatorHasInit: readonly(characterSimulatorHasInit),
    setupOptions,

    autoSaveDisabled: readonly(autoSaveDisabled),
    characterSimulatorInitFinished,

    characterStatCategoryResults,
    setupCharacterComparedStatCategoryResults,

    activeSkillResultStates,
    passiveSkillResultStates,
    damageSkillResultStates,
    getSkillBranchItemState,

    postponedActiveSkillResultStates,
    postponedPassiveSkillResultStates,

    reset,
    setCurrentCharacter,
    setCharacterSkillBuild,
    setCharacterFoodBuild,
    createCharacter,
    removeCharacter,
    appendEquipments,
    removeEquipment,
    moveEquipment,

    // damage calculation
    setupDamageCalculationExpectedResult,
    targetProperties,
    calculationOptions,
    getDamageCalculationSkillState,

    deleteAllSavedData,
    loadCharacterSimulator,
    saveCharacterSimulator,
    loadCharacterSimulatorSaveData,

    createCharacterSimulatorSaveData,
  }
})

export type { CharacterSimulatorSaveData, EquipmentSaveDataWithIndex }
