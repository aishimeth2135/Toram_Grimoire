import { defineStore } from 'pinia'
import { type Ref, computed, readonly, ref } from 'vue'

import { CommonLogger } from '@/shared/services/Logger'
import { filterNullish } from '@/shared/utils/array'

import { Character, type CharacterBindingBuild } from '@/lib/Character/Character'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { FoodsBase } from '@/lib/Character/Food'
import { FoodsBuild } from '@/lib/Character/FoodBuild'
import { PotionBuild } from '@/lib/Character/PotionBuild'
import { RegistletBuild } from '@/lib/Character/RegistletBuild'
import { SkillBuild } from '@/lib/Character/SkillBuild'
import { CalculationItemIds } from '@/lib/Damage/DamageCalculation'
import { Skill } from '@/lib/Skill/Skill'

import { useCharacterFoodStore } from './food-build'
import {
  CharacterPersistenceService,
  type CharacterSimulatorSaveData,
  type CharacterSimulatorSaveDataRoot,
  type CharacterStoreSaveSummary,
  type EquipmentSaveDataWithIndex,
} from './persistence'
import { useCharacterPotionBuildStore } from './potion-build'
import { useCharacterRegistletBuildStore } from './registlet-build'
import type { CharacterPureStatsResult } from './setup/context'
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

export { V2_AUTO_SAVE_STORAGE_KEY, CharacterPersistenceService } from './persistence'

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
    const result = CharacterPersistenceService.delete()
    if (!result.success) {
      throw result.error
    }
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
        potionBuildId: state.potionBuild?.id ?? null,
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
          appendCharacter(chara, { updateIndex: false, source: 'load' })
        }
      })

      appendEquipments(filterNullish(allValidEquipments), -1, false)

      saveData.skillBuilds.forEach(buildData => {
        const build = SkillBuild.load(loadedCategory, buildData)
        skillBuildStore.appendSkillBuild(build, { updateIndex: false, source: 'load' })
      })

      saveData.foodBuilds.forEach(data => {
        const build = new FoodsBuild(foodStore.foodsBase as FoodsBase)
        const load = build.load(loadedCategory, data)
        if (!load.error) {
          foodStore.appendFoodBuild(build, { updateIndex: false, source: 'load' })
        }
      })

      saveData.registletBuilds.forEach(data => {
        const build = RegistletBuild.load(loadedCategory, data)
        registletBuildStore.appendRegistletBuild(build, { updateIndex: false, source: 'load' })
      })

      saveData.potionBuilds.forEach(data => {
        const build = PotionBuild.load(loadedCategory, data)
        potionBuildStore.appendPotionBuild(build, { updateIndex: false, source: 'load' })
      })

      const getMatchedBuild = <Build extends CharacterBindingBuild>(
        builds: Build[],
        id: number | null
      ): Build | null => {
        return builds.find(build => build.matchLoadedId(loadedCategory, id)) ?? null
      }

      saveData.characterStates.forEach(item => {
        const targetCharacter = getMatchedBuild(characters.value, item.id)

        if (targetCharacter) {
          const characterState = getCharacterState(targetCharacter)

          characterState.skillBuild = getMatchedBuild(
            skillBuildStore.skillBuilds,
            item.skillBuildId
          )
          characterState.foodBuild = getMatchedBuild(foodStore.foodBuilds, item.foodBuildId)
          characterState.registletBuild = getMatchedBuild(
            registletBuildStore.registletBuilds,
            item.registletBuildId
          )
          characterState.potionBuild = getMatchedBuild(
            potionBuildStore.potionBuilds,
            item.potionBuildId
          )
        }
      })
    }
  })()

  const loadCharacterSimulator = () => {
    try {
      reset()

      const result = CharacterPersistenceService.load()
      if (!result.success) {
        throw result.error
      }
      if (result.value !== null) {
        logger.info('Datas version: v2')
        const { summary, datas } = result.value

        loadCharacterSimulatorSaveData(datas)
        setCurrentCharacter(summary.characterIndex)
        CharacterPersistenceService.confirmLoaded()
      }
    } catch (error) {
      reset()
      createCharacter()
      closeAutoSave()
      logger.addTitle('loadCharacterSimulator').start('Unexpected error occurs.').track(error).end()
      throw error
    }
  }

  const saveCharacterSimulator = () => {
    const datas = createCharacterSimulatorSaveData()
    const summary: CharacterStoreSaveSummary = {
      characterIndex: currentCharacterIndex.value,
    }

    const payload: CharacterSimulatorSaveDataRoot = {
      summary,
      datas,
    }
    const result = CharacterPersistenceService.save(payload)
    if (!result.success) {
      logger
        .addTitle('saveCharacterSimulator')
        .start('Unexpected error occurs.')
        .track(result.error)
        .end()
    }
  }

  const currentCharacterBuildsContext = computed(() => getCharacterState(currentCharacter.value))
  const currentCharacterSkillBuild = computed(() => currentCharacterBuildsContext.value.skillBuild)
  const currentCharacterRegistletBuild = computed(
    () => currentCharacterBuildsContext.value.registletBuild
  )
  const currentCharacterPotionBuild = computed(
    () => currentCharacterBuildsContext.value.potionBuild
  )
  const currentCharacterFoodBuild = computed(() => currentCharacterBuildsContext.value.foodBuild)

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
    currentCharacterBuildsContext,
    skillItemStates,
    setupOptions
  )

  const { allFoodBuildStats } = setupFoodStats(currentCharacterFoodBuild)

  const { allRegistletBuildStats } = setupRegistletStats(currentCharacterRegistletBuild)

  const { allPotionBuildStats } = setupPotionStats(currentCharacterPotionBuild)

  const allPureStatsResult: CharacterPureStatsResult = {
    skillStats: skillPureStats,
    foodStats: allFoodBuildStats,
    registletStats: allRegistletBuildStats,
    potionStats: allPotionBuildStats,
  }

  const {
    characterStatCategoryResults,
    postponedActiveSkillResultStates,
    postponedPassiveSkillResultStates,
    damageSkillResultStates,
    setupCharacterStatCategoryResultsExtended,
  } = setupCharacterStats(
    currentCharacter,
    currentCharacterBuildsContext,
    allPureStatsResult,
    skillItemStates,
    setupOptions
  )

  // Not supported for current UI
  // const setupCharacterComparedStatCategoryResults = (comparedCharacter: Ref<Character | null>) => {
  //   const { skillItemStates: _skillItemStates } = setupCharacterSkillItems(
  //     comparedCharacter,
  //     currentCharacterSkillBuild
  //   )

  //   const { characterStatCategoryResults: comparedCharacterStatCategoryResults } =
  //     setupCharacterStats(
  //       comparedCharacter,
  //       currentCharacterBuildsContext,
  //       allPureStatsResult,
  //       _skillItemStates,
  //       setupOptions
  //     )
  //   return {
  //     comparedCharacterStatCategoryResults,
  //   }
  // }

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
    currentCharacterState: currentCharacterBuildsContext,
    getCharacterState,

    autoSaveDisabled: readonly(autoSaveDisabled),
    characterSimulatorInitFinished,

    characterStatCategoryResults,
    // setupCharacterComparedStatCategoryResults,

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
