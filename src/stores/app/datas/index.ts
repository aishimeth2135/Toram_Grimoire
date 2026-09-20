import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useCharacterFoodStore } from '@/stores/views/character/food-build'
import { useCharacterSkillStore } from '@/stores/views/character/skill'

import { DataPathIds } from '@/shared/services/DataPath'
import { InitCrystalIcons, InitEquipmentIcons, InitSkillIcons } from '@/shared/services/Images'

import CharacterSystem from '@/lib/Character'
import DamageCalculationSystem from '@/lib/Damage'
import EnchantSystem from '@/lib/Enchant'
import EquipmentTraitSystem from '@/lib/EquipmentTrait'
import GlossarySystem from '@/lib/Glossary'
import ItemsSystem from '@/lib/Items'
import QuestSystem from '@/lib/Quest'
import RegistletSystem from '@/lib/Registlet'
import SkillSystem from '@/lib/Skill'

import { DatasStoreBase } from './DatasStoreBase'
import { DataStoreIds } from './enums'
import { DownloadDatas } from './utils/DownloadDatas'
import { LoadCharacterStats } from './utils/LoadCharacterStat'
import { LoadCrystals } from './utils/LoadCrystals'
import { LoadEnchant } from './utils/LoadEnchant'
import { LoadEquipmentTraits } from './utils/LoadEquipmentTrait'
import { LoadEquipments } from './utils/LoadEquipments'
import { LoadGlossaryTag } from './utils/LoadGlossary'
import { LoadPotions } from './utils/LoadPotions'
import { LoadQuests } from './utils/LoadQuests'
import { LoadRegistlet } from './utils/LoadRegistlet'
import { LoadSkill, LoadSkillMain } from './utils/LoadSkill'
import { LoadStats } from './utils/LoadStats'

export { DataStoreIds } from './enums'

export const useDatasStore = defineStore('app-datas', () => {
  const loaded = ref<Map<DataStoreIds, boolean>>(new Map())
  const waitLoadedTicks = ref<Map<DataStoreIds, ((value: boolean) => void)[]>>(new Map())
  const loadingPromises = new Map<DataStoreIds, Promise<void>>()

  const checkLoaded = (id: DataStoreIds) => loaded.value.has(id)

  const waitLoaded = (id: DataStoreIds) => {
    if (checkLoaded(id)) {
      return Promise.resolve()
    }
    if (!waitLoadedTicks.value.has(id)) {
      waitLoadedTicks.value.set(id, [])
    }
    return new Promise(resolve => {
      waitLoadedTicks.value.get(id)!.push(resolve)
    })
  }

  const loadFinished = (id: DataStoreIds) => {
    loaded.value.set(id, true)
    waitLoadedTicks.value.get(id)?.forEach(ticks => ticks(true))
    waitLoadedTicks.value.delete(id)
  }

  const initItemsInstance = () => {
    if (DatasStoreBase.Items === null) {
      DatasStoreBase.Items = ItemsSystem.create()
    }
    return DatasStoreBase.Items
  }

  const initCharacterInstance = () => {
    if (DatasStoreBase.Character === null) {
      DatasStoreBase.Character = CharacterSystem.create()
    }
    return DatasStoreBase.Character
  }

  const initGlossaryInstance = () => {
    if (DatasStoreBase.Glossary === null) {
      DatasStoreBase.Glossary = GlossarySystem.create()
    }
    return DatasStoreBase.Glossary
  }

  const initSkillInstance = () => {
    if (DatasStoreBase.Skill === null) {
      DatasStoreBase.Skill = SkillSystem.create()
    }
    return DatasStoreBase.Skill
  }

  const initEnchantInstance = () => {
    if (DatasStoreBase.Enchant === null) {
      DatasStoreBase.Enchant = EnchantSystem.create()
    }
    return DatasStoreBase.Enchant
  }

  const initDamageCalculationInstance = () => {
    if (DatasStoreBase.DamageCalculation === null) {
      DatasStoreBase.DamageCalculation = DamageCalculationSystem.create()
    }
    return DatasStoreBase.DamageCalculation
  }

  const initRegistletInstance = () => {
    if (DatasStoreBase.Registlet === null) {
      DatasStoreBase.Registlet = RegistletSystem.create()
    }
    return DatasStoreBase.Registlet
  }

  const initQuestInstance = () => {
    if (DatasStoreBase.Quest === null) {
      DatasStoreBase.Quest = QuestSystem.create()
    }
    return DatasStoreBase.Quest
  }

  const initEquipmentTraitInstance = () => {
    if (DatasStoreBase.EquipmentTrait === null) {
      DatasStoreBase.EquipmentTrait = EquipmentTraitSystem.create()
    }
    return DatasStoreBase.EquipmentTrait
  }

  const prepareDataStore = async (dataId: DataStoreIds): Promise<() => Promise<void>> => {
    switch (dataId) {
      case DataStoreIds.Items: {
        const itemSystem = initItemsInstance()
        const [equipmentData] = await DownloadDatas({ path: DataPathIds.Equipment, lang: true })
        return async () => {
          LoadEquipments(itemSystem, equipmentData)
        }
      }
      case DataStoreIds.Crystals: {
        const itemSystem = initItemsInstance()
        const [crystalData] = await DownloadDatas(DataPathIds.Crystal)
        return async () => {
          LoadCrystals(itemSystem, crystalData.baseData)
          await InitCrystalIcons()
        }
      }
      case DataStoreIds.Stats: {
        const characterSystem = initCharacterInstance()
        const [statsData] = await DownloadDatas({
          path: DataPathIds.Stats,
          lang: true,
        })
        return async () => {
          LoadStats(characterSystem, statsData)
          await InitEquipmentIcons()
        }
      }
      case DataStoreIds.CharacterStats: {
        const characterSystem = initCharacterInstance()
        const [characterStatsData] = await DownloadDatas({
          path: DataPathIds.CharacterStats,
          lang: true,
        })
        return async () => {
          LoadCharacterStats(characterSystem, characterStatsData)
        }
      }
      case DataStoreIds.Glossary: {
        const glossarySystem = initGlossaryInstance()
        const [glossaryData] = await DownloadDatas({
          path: DataPathIds.Glossary,
          lang: true,
        })
        return async () => {
          LoadGlossaryTag(glossarySystem, glossaryData)
        }
      }
      case DataStoreIds.Skill: {
        const skillSystem = initSkillInstance()
        const [skillData, skillMainData] = await DownloadDatas(
          { path: DataPathIds.Skill, lang: true },
          { path: DataPathIds.SkillMain, lang: true }
        )
        return async () => {
          LoadSkill(skillSystem, skillData)
          LoadSkillMain(skillSystem, skillMainData)
          const skillStore = useCharacterSkillStore()
          skillStore.initSkillRoot(skillSystem.skillRoot)

          await InitSkillIcons()
        }
      }
      case DataStoreIds.Food: {
        const foodStore = useCharacterFoodStore()
        return async () => {
          foodStore.initFoodsBase()
        }
      }
      case DataStoreIds.Enchant: {
        const enchantSystem = initEnchantInstance()
        const [enchantData] = await DownloadDatas(DataPathIds.Enchant)
        return async () => {
          LoadEnchant(enchantSystem, enchantData.baseData)
        }
      }
      case DataStoreIds.DamageCalculation: {
        initDamageCalculationInstance()
        return () => Promise.resolve()
      }
      case DataStoreIds.Registlet: {
        const registSystem = initRegistletInstance()
        const [registletData] = await DownloadDatas(DataPathIds.Registlet)
        return async () => {
          LoadRegistlet(registSystem, registletData.baseData)
        }
      }
      case DataStoreIds.ItemsPotion: {
        const itemsSystem = initItemsInstance()
        const [potionData] = await DownloadDatas(DataPathIds.Potion)
        return async () => {
          LoadPotions(itemsSystem.potionsRoot, potionData.baseData)
        }
      }
      case DataStoreIds.Quest: {
        const questSystem = initQuestInstance()
        const [mainQuestData] = await DownloadDatas(DataPathIds.Quest)
        return async () => {
          LoadQuests(questSystem, mainQuestData.baseData)
        }
      }
      case DataStoreIds.EquipmentTrait: {
        const equipmentTraitSystem = initEquipmentTraitInstance()
        const [equipmentTraitData] = await DownloadDatas(DataPathIds.EquipmentTrait)
        return async () => {
          LoadEquipmentTraits(equipmentTraitSystem, equipmentTraitData.baseData)
        }
      }
    }
  }

  const ensureLoaded = async (ids: DataStoreIds[], onPrepared?: (id: DataStoreIds) => void) => {
    interface LoadTask {
      id: DataStoreIds
      promise: Promise<void>
      owned: boolean
      resolve?: () => void
      reject?: (reason: unknown) => void
      preparePromise?: Promise<() => Promise<void>>
      init?: () => Promise<void>
      prepareFailed?: boolean
      prepareError?: unknown
    }

    const tasks = ids.map<LoadTask>(id => {
      if (checkLoaded(id)) {
        return { id, promise: Promise.resolve(), owned: false }
      }

      const loadingPromise = loadingPromises.get(id)
      if (loadingPromise) {
        return { id, promise: loadingPromise, owned: false }
      }

      let resolve: () => void
      let reject: (reason: unknown) => void
      const promise = new Promise<void>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise
        reject = rejectPromise
      })
      loadingPromises.set(id, promise)

      return {
        id,
        promise,
        owned: true,
        resolve: resolve!,
        reject: reject!,
        preparePromise: prepareDataStore(id).then(init => {
          onPrepared?.(id)
          return init
        }),
      }
    })

    const resultsPromise = Promise.all(
      tasks.map(async task => {
        try {
          await task.promise
          return { success: true as const }
        } catch (error) {
          return { success: false as const, error }
        }
      })
    )

    await Promise.all(
      tasks.map(async task => {
        if (!task.preparePromise) {
          return
        }
        try {
          task.init = await task.preparePromise
        } catch (error) {
          task.prepareFailed = true
          task.prepareError = error
        }
      })
    )

    const failedPrepareTask = tasks.find(task => task.owned && task.prepareFailed)
    if (failedPrepareTask) {
      tasks.forEach(task => {
        if (!task.owned) {
          return
        }
        task.reject!(failedPrepareTask.prepareError)
        if (loadingPromises.get(task.id) === task.promise) {
          loadingPromises.delete(task.id)
        }
      })
      return resultsPromise
    }

    for (const task of tasks) {
      if (!task.owned) {
        continue
      }

      try {
        await task.init!()
        loadFinished(task.id)
        task.resolve!()
      } catch (error) {
        task.reject!(error)
      } finally {
        if (loadingPromises.get(task.id) === task.promise) {
          loadingPromises.delete(task.id)
        }
      }
    }

    return resultsPromise
  }

  return {
    checkLoaded,
    waitLoaded,
    ensureLoaded,
  }
})
