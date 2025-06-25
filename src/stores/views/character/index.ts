import { defineStore } from 'pinia'
import { type Ref, computed, readonly, ref } from 'vue'

import { CommonLogger } from '@/shared/services/Logger'
import { filterNullish } from '@/shared/utils/array'

import { Character, type CharacterSaveData } from '@/lib/Character/Character'
import { type CharacterBuildLabelSaveData } from '@/lib/Character/Character/CharacterBuildLabel'
import { CharacterEquipment, type EquipmentSaveData } from '@/lib/Character/CharacterEquipment'
import { FoodsBase } from '@/lib/Character/Food'
import { FoodsBuild, type FoodsBuildSaveData } from '@/lib/Character/FoodBuild'
import { PotionBuild, type PotionBuildSaveData } from '@/lib/Character/PotionBuild'
import { RegistletBuild, type RegistletBuildSaveData } from '@/lib/Character/RegistletBuild'
import { SkillBuild, type SkillBuildSaveData } from '@/lib/Character/SkillBuild'
import { CalculationItemIds } from '@/lib/Damage/DamageCalculation'
import { Skill } from '@/lib/Skill/Skill'

import { useCharacterFoodStore } from './food-build'
import { useCharacterPotionBuildStore } from './potion-build'
import { useCharacterRegistletBuildStore } from './registlet-build'
import { getSkillBranchState } from './setup/getState'
import { prepareSetupCharacter } from './setup/setupCharacter'
import { useCharacterBuildLabelStore } from './setup/setupCharacterBuildLabels'
import {
  setupCharacterSkillItems,
  setupFoodStats,
  setupPotionStats,
  setupRegistletStats,
} from './setup/setupCharacterBuilds'
import { setupCharacters, setupEquipments } from './setup/setupCharacterStates'
import {
  type CalculationOptions,
  type TargetProperties,
  setupDamageCalculation,
} from './setup/setupDamageCalculation'
import { useCharacterSkillStore } from './skill'
import { useCharacterSkillBuildStore } from './skill-build'
import { migrateCharacterSimulatorSaveData } from './utils'

interface EquipmentSaveDataWithIndex extends EquipmentSaveData {
  idx: number
}

interface CharacterStoreSaveSummary {
  characterIndex: number
}

interface CharacterStoreCharacterStateSaveData {
  id: number
  skillBuildId: number | null
  foodBuildId: number | null
  registletBuildId: number | null
  potionBuildId: number | null
}

interface CharacterSimulatorSaveData {
  version: string

  characters: CharacterSaveData[]
  characterStates: CharacterStoreCharacterStateSaveData[]

  equipments: EquipmentSaveDataWithIndex[]

  skillBuilds: SkillBuildSaveData[]

  foodBuilds: FoodsBuildSaveData[]

  registletBuilds: RegistletBuildSaveData[]

  potionBuilds: PotionBuildSaveData[]

  buildLabels: CharacterBuildLabelSaveData[]
}

interface CharacterSimulatorSaveDataRoot {
  summary: CharacterStoreSaveSummary
  datas: CharacterSimulatorSaveData
}

const V2_AUTO_SAVE_STORAGE_KEY = 'app--character-simulator--data-v2--auto'

export const useCharacterStore = defineStore('view-character', () => {
  const characterSimulatorHasInit = ref(false)
  const autoSaveDisabled = ref(false)

  const skillStore = useCharacterSkillStore()
  const foodStore = useCharacterFoodStore()
  const skillBuildStore = useCharacterSkillBuildStore()
  const registletBuildStore = useCharacterRegistletBuildStore()
  const potionBuildStore = useCharacterPotionBuildStore()
  const buildLabelStore = useCharacterBuildLabelStore()

  const logger = new CommonLogger('character-simulator')

  const setupOptions = ref({
    handleFood: true,
    handleActiveSkill: true,
    handlePassiveSkill: true,
    handleRegistlet: true,
    handlePotion: true,
    skillDisplayStatsOnly: true,
  })

  const characterSimulatorInitFinished = () => {
    characterSimulatorHasInit.value = true
  }

  const {
    characters,
    currentCharacter,
    currentCharacterIndex,
    getCharacterState,
    setCurrentCharacter,
    setCharacterSkillBuild,
    setCharacterFoodBuild,
    setCharacterRegistletBuild,
    setCharacterPotionBuild,
    createCharacter,
    appendCharacter,
    removeCharacter,
    cloneCharacter,
  } = setupCharacters()

  const { equipments, appendEquipment, appendEquipments, removeEquipment } =
    setupEquipments(currentCharacter)

  const closeAutoSave = () => {
    autoSaveDisabled.value = false
  }

  const reset = () => {
    skillStore.resetSkillBuilds()
    characters.value = []
    equipments.value = []
    skillBuildStore.reset()
    foodStore.resetFoodBuildStore()
    registletBuildStore.resetRegistletBuildStore()
    potionBuildStore.resetPotionBuildStore()
    buildLabelStore.resetBuildLabelStore()
  }

  const deleteAllSavedData = () => {
    window.localStorage.removeItem(V2_AUTO_SAVE_STORAGE_KEY)
    closeAutoSave()
  }

  const createCharacterSimulatorSaveData = (): CharacterSimulatorSaveData => {
    const charactersData = characters.value.map(item => item.save(equipments.value))
    const equipmentsData = equipments.value.map((item, idx) => ({
      idx,
      ...item.save(),
    }))
    const skillBuildsData = skillBuildStore.saveSkillBuilds()
    const foodBuildsData = foodStore.foodBuilds.map(item => item.save())
    const registletBuildsData = registletBuildStore.registletBuilds.map(item => item.save())
    const potionBuildsData = potionBuildStore.potionBuilds.map(item => item.save())

    const characterStates = characters.value.map(chara => {
      const state = getCharacterState(chara)
      return {
        id: chara.id,
        skillBuildId: state.skillBuild?.id ?? null,
        foodBuildId: state.foodBuild?.id ?? null,
        registletBuildId: state.registletBuild?.id ?? null,
        potionBuildId: state.registletBuild?.id ?? null,
      }
    })

    const buildLabelsData = buildLabelStore.buildLabels.map(label => label.save())

    return {
      version: 'v2',
      characters: charactersData,
      equipments: equipmentsData,
      skillBuilds: skillBuildsData,
      foodBuilds: foodBuildsData,
      registletBuilds: registletBuildsData,
      potionBuilds: potionBuildsData,
      buildLabels: buildLabelsData,
      characterStates,
    }
  }
  const loadCharacterSimulatorSaveData = (() => {
    let _loadCount = 0

    return (saveData: CharacterSimulatorSaveData) => {
      migrateCharacterSimulatorSaveData(saveData)

      _loadCount += 1
      const loadedCategory = 'common-' + _loadCount

      // lagacy
      if (saveData.equipments.some(data => typeof data.idx !== 'number')) {
        saveData.equipments = saveData.equipments.map((item, idx) => ({
          ...item,
          idx,
        }))
      }

      // build labels
      saveData.buildLabels.forEach(data => {
        buildLabelStore.loadBuildLabel(loadedCategory, data)
      })

      // equipments
      const allValidEquipmentsLength = saveData.equipments
        .map(data => data.idx)
        .reduce((cur, item2) => Math.max(cur, item2), 0)
      const allValidEquipments = Array<CharacterEquipment | null>(allValidEquipmentsLength).fill(
        null
      )
      saveData.equipments.forEach(data => {
        const equip = CharacterEquipment.loadEquipment(
          loadedCategory,
          data,
          buildLabelStore.buildLabels
        )
        allValidEquipments[data.idx] = equip
      })

      // character
      saveData.characters.forEach(charaRow => {
        const chara = new Character()
        const loadSuccess = chara.load(loadedCategory, charaRow, allValidEquipments)
        if (loadSuccess) {
          appendCharacter(chara, false)
        }
      })

      appendEquipments(filterNullish(allValidEquipments))

      saveData.skillBuilds.forEach(buildData => {
        const build = SkillBuild.load(loadedCategory, buildData)
        skillBuildStore.appendSkillBuild(build, false)
      })

      saveData.foodBuilds.forEach(data => {
        const build = new FoodsBuild(foodStore.foodsBase as FoodsBase)
        const load = build.load(loadedCategory, data)
        if (!load.error) {
          foodStore.appendFoodBuild(build, false)
        }
      })

      saveData.registletBuilds.forEach(data => {
        const build = RegistletBuild.load(loadedCategory, data)
        registletBuildStore.appendRegistletBuild(build, false)
      })

      saveData.potionBuilds.forEach(data => {
        const build = PotionBuild.load(loadedCategory, data)
        potionBuildStore.appendPotionBuild(build, false)
      })

      saveData.characterStates.forEach(item => {
        const targetCharacter = characters.value.find(ch =>
          ch.matchLoadedId(loadedCategory, item.id)
        )
        if (targetCharacter) {
          const characterState = getCharacterState(targetCharacter)

          // skill
          const skillBuild = skillBuildStore.skillBuilds.find(build =>
            build.matchLoadedId(loadedCategory, item.skillBuildId)
          )
          characterState.skillBuild = skillBuild ?? null

          // food
          const foodBuild = foodStore.foodBuilds.find(build =>
            build.matchLoadedId(loadedCategory, item.foodBuildId)
          )
          characterState.foodBuild = foodBuild ?? null

          // registlet
          const registletBuild = registletBuildStore.registletBuilds.find(build =>
            build.matchLoadedId(loadedCategory, item.registletBuildId)
          )
          characterState.registletBuild = registletBuild ?? null

          // potion
          const potionBuild = potionBuildStore.potionBuilds.find(build =>
            build.matchLoadedId(loadedCategory, item.potionBuildId)
          )
          characterState.potionBuild = potionBuild ?? null
        }
      })
    }
  })()

  const loadCharacterSimulator = () => {
    try {
      reset()

      const v2Data = window.localStorage.getItem(V2_AUTO_SAVE_STORAGE_KEY)
      if (v2Data !== null) {
        logger.info('Datas version: v2')
        const { summary, datas } = JSON.parse(v2Data) as CharacterSimulatorSaveDataRoot

        loadCharacterSimulatorSaveData(datas)
        setCurrentCharacter(summary.characterIndex)
      }
    } catch (error) {
      reset()
      createCharacter()
      closeAutoSave()
      logger.addTitle('loadCharacterSimulator').start('Unexpected error occurs.').log(error).end()
      throw error
    }
  }

  const saveCharacterSimulator = () => {
    const datas = createCharacterSimulatorSaveData()
    const summary: CharacterStoreSaveSummary = {
      characterIndex: currentCharacterIndex.value,
    }

    const originalData = window.localStorage.getItem(V2_AUTO_SAVE_STORAGE_KEY) || '{}'
    try {
      const payload = {
        summary,
        datas,
      } as CharacterSimulatorSaveDataRoot
      window.localStorage.setItem(V2_AUTO_SAVE_STORAGE_KEY, JSON.stringify(payload))
    } catch (err) {
      logger.addTitle('saveCharacterSimulator').start('Unexpected error occurs.').log(err).end()
      window.localStorage.setItem(V2_AUTO_SAVE_STORAGE_KEY, originalData)
    }
  }

  const currentCharacterState = computed(() => getCharacterState(currentCharacter.value))
  const currentCharacterSkillBuild = computed(() => currentCharacterState.value.skillBuild)
  const currentCharacterRegistletBuild = computed(() => currentCharacterState.value.registletBuild)
  const currentCharacterPotionBuild = computed(() => currentCharacterState.value.potionBuild)
  const currentCharacterFoodBuild = computed(() => currentCharacterState.value.foodBuild)

  const { skillItemStates } = setupCharacterSkillItems(currentCharacter, currentCharacterSkillBuild)

  const { setupCharacterSkills, setupCharacterStats } = prepareSetupCharacter()

  const {
    skillComputingContainer,
    activeSkillResultStates,
    allActiveSkillResultStatesMap,
    allPassiveSkillResultStatesMap,
    passiveSkillResultStates,
    nextSkillResultStates,
    skillPureStats,
  } = setupCharacterSkills(
    currentCharacter,
    currentCharacterSkillBuild,
    skillItemStates,
    currentCharacterRegistletBuild,
    setupOptions
  )

  const { allFoodBuildStats } = setupFoodStats(currentCharacterFoodBuild)

  const { allRegistletBuildStats } = setupRegistletStats(currentCharacterRegistletBuild)

  const { allPotionBuildStats } = setupPotionStats(currentCharacterPotionBuild)

  const {
    characterStatCategoryResults,
    postponedActiveSkillResultStates,
    postponedPassiveSkillResultStates,
    damageSkillResultStates,
    setupCharacterStatCategoryResultsExtended,
  } = setupCharacterStats(
    currentCharacter,
    currentCharacterSkillBuild,
    skillPureStats,
    allFoodBuildStats,
    currentCharacterRegistletBuild,
    allRegistletBuildStats,
    allPotionBuildStats,
    skillItemStates,
    setupOptions
  )

  const setupCharacterComparedStatCategoryResults = (comparedCharacter: Ref<Character | null>) => {
    const { skillItemStates: _skillItemStates } = setupCharacterSkillItems(
      comparedCharacter,
      currentCharacterSkillBuild
    )
    const { characterStatCategoryResults: comparedCharacterStatCategoryResults } =
      setupCharacterStats(
        comparedCharacter,
        currentCharacterSkillBuild,
        skillPureStats,
        allFoodBuildStats,
        currentCharacterRegistletBuild,
        allRegistletBuildStats,
        allPotionBuildStats,
        _skillItemStates,
        setupOptions
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
    proration: 250,
    comboRate: 150,
    armorBreakDisplay: false,
    forceCritical: false,
  })

  const {
    setupDamageCalculationExpectedResult,
    getDamageCalculationSkillState,
    getDamageCalculationSkillBranchState,
  } = (() => {
    const allSkillResultStates = computed(() => [
      ...activeSkillResultStates.value,
      ...passiveSkillResultStates.value,
      ...postponedActiveSkillResultStates.value,
      ...postponedPassiveSkillResultStates.value,
    ])
    const getSkillLevel = (targetSkill: Skill) => {
      if (!currentCharacterSkillBuild.value) {
        return {
          valid: false,
          level: 0,
        }
      }
      return {
        valid: allSkillResultStates.value.some(
          state => state.skill === targetSkill && state.results.length > 0
        ),
        level: currentCharacterSkillBuild.value.getSkillLevel(targetSkill),
      }
    }

    return setupDamageCalculation(
      currentCharacter,
      setupCharacterStatCategoryResultsExtended,
      getSkillLevel
    )
  })()

  return {
    characters: characters,
    equipments: equipments,
    currentCharacter: currentCharacter,
    currentCharacterIndex,
    characterSimulatorHasInit: readonly(characterSimulatorHasInit),
    setupOptions,
    currentCharacterState,
    getCharacterState,

    autoSaveDisabled: readonly(autoSaveDisabled),
    characterSimulatorInitFinished,

    characterStatCategoryResults,
    setupCharacterComparedStatCategoryResults,

    skillItemStates: skillItemStates,

    skillComputingContainer,
    activeSkillResultStates,
    passiveSkillResultStates,
    allActiveSkillResultStatesMap,
    allPassiveSkillResultStatesMap,
    nextSkillResultStates,
    damageSkillResultStates,
    getSkillBranchState,

    postponedActiveSkillResultStates,
    postponedPassiveSkillResultStates,

    reset,
    setCurrentCharacter,
    setCharacterSkillBuild,
    setCharacterFoodBuild,
    setCharacterRegistletBuild,
    setCharacterPotionBuild,
    createCharacter,
    appendCharacter,
    cloneCharacter,
    removeCharacter,
    appendEquipment,
    appendEquipments,
    removeEquipment,

    // damage calculation
    setupDamageCalculationExpectedResult,
    targetProperties,
    calculationOptions,
    getDamageCalculationSkillState,
    getDamageCalculationSkillBranchState,

    deleteAllSavedData,
    loadCharacterSimulator,
    saveCharacterSimulator,
    loadCharacterSimulatorSaveData,

    createCharacterSimulatorSaveData,
  }
})

export type { CharacterSimulatorSaveData, EquipmentSaveDataWithIndex }
