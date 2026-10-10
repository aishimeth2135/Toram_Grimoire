import { defineStore } from 'pinia'
import { type Ref, computed, readonly, ref } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { CommonLogger } from '@/shared/services/Logger'
import { filterNullish } from '@/shared/utils/array'

import { Character, type CharacterBindingBuild } from '@/lib/Character/Character'
import {
  CHARACTER_COMPARISON_TABLE_LIMIT,
  CharacterComparisonTable,
} from '@/lib/Character/CharacterComparisonTable'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
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
import type { CharacterBuildsContext, CharacterPureStatsResult } from './setup/context'
import { prepareSetupCharacter } from './setup/setupCharacter'
import { useCharacterBuildLabelStore } from './setup/setupCharacterBuildLabels'
import {
  setupCharacterSkillItems,
  setupFoodStats,
  setupPotionStats,
  setupRegistletStats,
} from './setup/setupCharacterBuilds'
import { setupCharacterComparisonTables } from './setup/setupCharacterComparison'
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
    resetCharacters,
    replaceCharacters,
  } = setupCharacters()

  const currentCharacterBuildsContext = computed<CharacterBuildsContext>(() =>
    getCharacterState(currentCharacter.value)
  )
  const { comparisonTables, appendComparisonTable, removeComparisonTable, resetComparisonTables } =
    setupCharacterComparisonTables(characters)
  const currentCharacterSkillBuild = computed(() => currentCharacterBuildsContext.value.skillBuild)
  const { skillItemStates } = setupCharacterSkillItems(currentCharacter, currentCharacterSkillBuild)

  const { equipments, appendEquipment, appendEquipments, removeEquipment } =
    setupEquipments(currentCharacter)

  const closeAutoSave = () => {
    autoSaveDisabled.value = true
  }

  const resetHandlers: (() => void)[] = []
  const reset = () => {
    skillStore.resetSkillBuilds()
    equipments.value = []
    skillBuildStore.reset()
    foodStore.resetFoodBuildStore()
    registletBuildStore.resetRegistletBuildStore()
    potionBuildStore.resetPotionBuildStore()
    resetCharacters()
    resetComparisonTables()
    buildLabelStore.resetBuildLabelStore()
    resetHandlers.forEach(handler => handler())
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
      comparisonTables: comparisonTables.value.map(table => table.save()),
    }
  }

  const loadCharacterSimulatorSaveData = (() => {
    let _loadCount = 0

    return (saveData: CharacterSimulatorSaveData, replace = false) => {
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

      const loadedCharacters: Character[] = []
      if (replace && saveData.comparisonTables === undefined) {
        resetComparisonTables()
      }
      const tableCapacity =
        CHARACTER_COMPARISON_TABLE_LIMIT - (replace ? 0 : comparisonTables.value.length)
      const loadedComparisonTables =
        saveData.comparisonTables === undefined
          ? replace
            ? comparisonTables.value
            : []
          : saveData.comparisonTables
              .slice(0, tableCapacity)
              .map(data => CharacterComparisonTable.load(loadedCategory, data))
      comparisonTables.value = replace
        ? loadedComparisonTables
        : [...comparisonTables.value, ...loadedComparisonTables]
      const loadedSkillBuilds: SkillBuild[] = []
      const loadedFoodBuilds: FoodsBuild[] = []
      const loadedRegistletBuilds: RegistletBuild[] = []
      const loadedPotionBuilds: PotionBuild[] = []

      // character
      saveData.characters.forEach(charaRow => {
        const chara = Character.create()
        const loadSuccess = chara.load(loadedCategory, charaRow, allValidEquipments)
        if (loadSuccess) {
          loadedCharacters.push(chara)
        }
      })

      saveData.skillBuilds.forEach(buildData => {
        const build = SkillBuild.load(loadedCategory, buildData)
        loadedSkillBuilds.push(build)
      })

      saveData.foodBuilds.forEach(data => {
        const build = FoodsBuild.create(foodStore.foodsBase)
        const load = build.load(loadedCategory, data)
        if (!load.error) {
          loadedFoodBuilds.push(build)
        }
      })

      saveData.registletBuilds.forEach(data => {
        const build = RegistletBuild.load(loadedCategory, data)
        loadedRegistletBuilds.push(build)
      })

      saveData.potionBuilds.forEach(data => {
        const build = PotionBuild.load(loadedCategory, data)
        loadedPotionBuilds.push(build)
      })

      const getMatchedBuild = <Build extends CharacterBindingBuild>(
        builds: Build[],
        id: number | null
      ): Build | null => {
        return builds.find(build => build.matchLoadedId(loadedCategory, id)) ?? null
      }

      // Missing bindings use an empty build, never an unrelated configured build.
      const missingSkillBuild = loadedCharacters.some(chara => {
        const state = saveData.characterStates.find(item =>
          chara.matchLoadedId(loadedCategory, item.id)
        )
        return !getMatchedBuild(loadedSkillBuilds, state?.skillBuildId ?? null)
      })
        ? SkillBuild.create(
            Grimoire.i18n.t('skill-simulator.skill-build') + ' ' + (loadedSkillBuilds.length + 1)
          )
        : null
      const missingFoodBuild = loadedCharacters.some(chara => {
        const state = saveData.characterStates.find(item =>
          chara.matchLoadedId(loadedCategory, item.id)
        )
        return !getMatchedBuild(loadedFoodBuilds, state?.foodBuildId ?? null)
      })
        ? FoodsBuild.create(
            foodStore.foodsBase,
            Grimoire.i18n.t('character-simulator.food-build.food-build') +
              ' ' +
              (loadedFoodBuilds.length + 1)
          )
        : null
      const missingRegistletBuild = loadedCharacters.some(chara => {
        const state = saveData.characterStates.find(item =>
          chara.matchLoadedId(loadedCategory, item.id)
        )
        return !getMatchedBuild(loadedRegistletBuilds, state?.registletBuildId ?? null)
      })
        ? RegistletBuild.create(
            Grimoire.i18n.t('character-simulator.registlet-build.registlet-build') +
              ' ' +
              (loadedRegistletBuilds.length + 1)
          )
        : null
      const missingPotionBuild = loadedCharacters.some(chara => {
        const state = saveData.characterStates.find(item =>
          chara.matchLoadedId(loadedCategory, item.id)
        )
        return !getMatchedBuild(loadedPotionBuilds, state?.potionBuildId ?? null)
      })
        ? PotionBuild.create(
            Grimoire.i18n.t('character-simulator.potion-build.potion-build') +
              ' ' +
              (loadedPotionBuilds.length + 1)
          )
        : null

      if (missingSkillBuild) {
        loadedSkillBuilds.push(missingSkillBuild)
      }
      if (missingFoodBuild) {
        loadedFoodBuilds.push(missingFoodBuild)
      }
      if (missingRegistletBuild) {
        loadedRegistletBuilds.push(missingRegistletBuild)
      }
      if (missingPotionBuild) {
        loadedPotionBuilds.push(missingPotionBuild)
      }

      skillBuildStore.replaceBuilds(
        replace ? loadedSkillBuilds : [...skillBuildStore.skillBuilds, ...loadedSkillBuilds]
      )
      foodStore.replaceBuilds(
        replace ? loadedFoodBuilds : [...foodStore.foodBuilds, ...loadedFoodBuilds]
      )
      registletBuildStore.replaceBuilds(
        replace
          ? loadedRegistletBuilds
          : [...registletBuildStore.registletBuilds, ...loadedRegistletBuilds]
      )
      potionBuildStore.replaceBuilds(
        replace ? loadedPotionBuilds : [...potionBuildStore.potionBuilds, ...loadedPotionBuilds]
      )
      appendEquipments(filterNullish(allValidEquipments), -1, false)
      if (replace) {
        replaceCharacters(loadedCharacters)
      } else {
        loadedCharacters.forEach(chara =>
          appendCharacter(chara, { updateIndex: false, source: 'load' })
        )
      }

      loadedCharacters.forEach(chara => {
        const characterData = saveData.characters.find(data =>
          chara.matchLoadedId(loadedCategory, data.id)
        )
        if (characterData?.comparison) {
          chara.comparisonTableBuild.load(
            loadedCategory,
            characterData.comparison,
            chara,
            loadedCharacters,
            loadedComparisonTables
          )
        }
        const item = saveData.characterStates.find(state =>
          chara.matchLoadedId(loadedCategory, state.id)
        )
        const state = getCharacterState(chara)
        state.skillBuild =
          getMatchedBuild(skillBuildStore.skillBuilds, item?.skillBuildId ?? null) ??
          skillBuildStore.skillBuilds.find(build => build.id === missingSkillBuild?.id) ??
          skillBuildStore.currentSkillBuild
        state.foodBuild =
          getMatchedBuild(foodStore.foodBuilds, item?.foodBuildId ?? null) ??
          foodStore.foodBuilds.find(build => build.id === missingFoodBuild?.id) ??
          foodStore.currentFoodBuild
        state.registletBuild =
          getMatchedBuild(registletBuildStore.registletBuilds, item?.registletBuildId ?? null) ??
          registletBuildStore.registletBuilds.find(
            build => build.id === missingRegistletBuild?.id
          ) ??
          registletBuildStore.currentRegistletBuild
        state.potionBuild =
          getMatchedBuild(potionBuildStore.potionBuilds, item?.potionBuildId ?? null) ??
          potionBuildStore.potionBuilds.find(build => build.id === missingPotionBuild?.id) ??
          potionBuildStore.currentPotionBuild
      })
    }
  })()

  const loadCharacterSimulator = () => {
    try {
      reset()
      autoSaveDisabled.value = false

      const result = CharacterPersistenceService.load()
      if (!result.success) {
        throw result.error
      }
      if (result.value !== null) {
        logger.info('Datas version: v2')
        const { summary, datas } = result.value

        loadCharacterSimulatorSaveData(datas, true)
        setCurrentCharacter(summary.characterIndex)
        CharacterPersistenceService.confirmLoaded()
      }
    } catch (error) {
      reset()
      closeAutoSave()
      logger.addTitle('loadCharacterSimulator').start('Unexpected error occurs.').track(error).end()
      throw error
    } finally {
      characterSimulatorInitFinished()
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

  const currentCharacterRegistletBuild = computed(
    () => currentCharacterBuildsContext.value.registletBuild
  )
  const currentCharacterPotionBuild = computed(
    () => currentCharacterBuildsContext.value.potionBuild
  )
  const currentCharacterFoodBuild = computed(() => currentCharacterBuildsContext.value.foodBuild)

  const { setupCharacterSkills, setupCharacterStats } = prepareSetupCharacter()

  const {
    skillComputingContainer,
    activeSkillResultStates,
    buffSkillResultStates,
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
    postponedSkillComputingContainer,
    postponedActiveSkillResultStates,
    postponedBuffSkillResultStates,
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

  const setupCharacterComparedStatCategoryResults = (comparedCharacter: Ref<Character>) => {
    const buildsContext = computed<CharacterBuildsContext>(() =>
      getCharacterState(comparedCharacter.value)
    )
    const skillBuild = computed<SkillBuild>(() => buildsContext.value.skillBuild)
    const { skillItemStates: comparedSkillItemStates } = setupCharacterSkillItems(
      comparedCharacter,
      skillBuild
    )
    const { skillPureStats: skillStats } = setupCharacterSkills(
      comparedCharacter,
      buildsContext,
      comparedSkillItemStates,
      setupOptions
    )
    const { allFoodBuildStats: foodStats } = setupFoodStats(
      computed<FoodsBuild>(() => buildsContext.value.foodBuild)
    )
    const { allRegistletBuildStats: registletStats } = setupRegistletStats(
      computed<RegistletBuild>(() => buildsContext.value.registletBuild)
    )
    const { allPotionBuildStats: potionStats } = setupPotionStats(
      computed<PotionBuild>(() => buildsContext.value.potionBuild)
    )
    return setupCharacterStats(
      comparedCharacter,
      buildsContext,
      { skillStats, foodStats, registletStats, potionStats },
      comparedSkillItemStates,
      setupOptions
    ).characterStatCategoryResults
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
  })

  const availableBuffResults = computed(() => {
    const skillBuild = currentCharacterSkillBuild.value
    if (!skillBuild) {
      return []
    }
    if (!setupOptions.value.handleActiveSkill) {
      return []
    }
    return [...buffSkillResultStates.value, ...postponedBuffSkillResultStates.value]
      .filter(
        state =>
          skillBuild.getSkillLevel(state.skill) > 0 && skillBuild.getSkillState(state.skill).enabled
      )
      .flatMap(state =>
        state.results.filter(
          result => skillBuild.getSkillBranchState(result.container.branchItem).enabled
        )
      )
  })

  const availableRegistletBuffItems = computed(() =>
    (currentCharacterRegistletBuild.value?.items ?? []).filter(
      item => item.enabled && item.isSpecial() && !!item.base.buffStats?.length
    )
  )

  const {
    enemyDebuffService,
    setupDamageCalculationExpectedResult,
    setupDamageCalculationExpectedResultSweep,
  } = (() => {
    const allSkillResultStates = computed(() => [
      ...activeSkillResultStates.value,
      ...buffSkillResultStates.value,
      ...passiveSkillResultStates.value,
      ...postponedActiveSkillResultStates.value,
      ...postponedBuffSkillResultStates.value,
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
      getSkillLevel,
      currentCharacterSkillBuild,
      availableBuffResults,
      availableRegistletBuffItems
    )
  })()

  return {
    comparisonTables,
    appendComparisonTable,
    removeComparisonTable,
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
    setupCharacterComparedStatCategoryResults,

    skillItemStates: skillItemStates,

    skillComputingContainer,
    postponedSkillComputingContainer,
    activeSkillResultStates,
    buffSkillResultStates,
    passiveSkillResultStates,
    allActiveSkillResultStatesMap,
    allPassiveSkillResultStatesMap,
    nextSkillResultStates,
    damageSkillResultStates,
    availableBuffResults,
    availableRegistletBuffItems,

    postponedActiveSkillResultStates,
    postponedBuffSkillResultStates,
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
    enemyDebuffService,
    setupDamageCalculationExpectedResult,
    setupDamageCalculationExpectedResultSweep,
    targetProperties,
    calculationOptions,

    deleteAllSavedData,
    loadCharacterSimulator,
    saveCharacterSimulator,
    loadCharacterSimulatorSaveData,

    createCharacterSimulatorSaveData,
  }
})

export type { CharacterSimulatorSaveData, EquipmentSaveDataWithIndex }
