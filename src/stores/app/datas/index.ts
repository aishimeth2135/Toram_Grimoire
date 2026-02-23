import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useCharacterFoodStore } from '@/stores/views/character/food-build'
import { useCharacterSkillStore } from '@/stores/views/character/skill'

import Grimoire from '@/shared/Grimoire'
import { DataPathIds } from '@/shared/services/DataPath'
import { InitCrystalIcons, InitEquipmentIcons, InitSkillIcons } from '@/shared/services/Images'
import Notify from '@/shared/setup/Notify'

import CharacterSystem from '@/lib/Character'
import DamageCalculationSystem from '@/lib/Damage'
import EnchantSystem from '@/lib/Enchant'
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
  }

  const initItemsInstance = () => {
    if (DatasStoreBase.Items === null) {
      DatasStoreBase.Items = new ItemsSystem()
    }
    return DatasStoreBase.Items
  }

  const initCharacterInstance = () => {
    if (DatasStoreBase.Character === null) {
      DatasStoreBase.Character = new CharacterSystem()
    }
    return DatasStoreBase.Character
  }

  const initGlossaryInstance = () => {
    if (DatasStoreBase.Glossary === null) {
      DatasStoreBase.Glossary = new GlossarySystem()
    }
    return DatasStoreBase.Glossary
  }

  const initSkillInstance = () => {
    if (DatasStoreBase.Skill === null) {
      DatasStoreBase.Skill = new SkillSystem()
    }
    return DatasStoreBase.Skill
  }

  const initEnchantInstance = () => {
    if (DatasStoreBase.Enchant === null) {
      DatasStoreBase.Enchant = new EnchantSystem()
    }
    return DatasStoreBase.Enchant
  }

  const initDamageCalculationInstance = () => {
    if (DatasStoreBase.DamageCalculation === null) {
      DatasStoreBase.DamageCalculation = new DamageCalculationSystem()
    }
    return DatasStoreBase.DamageCalculation
  }

  const initRegistletInstance = () => {
    if (DatasStoreBase.Registlet === null) {
      DatasStoreBase.Registlet = new RegistletSystem()
    }
    return DatasStoreBase.Registlet
  }

  const initQuestInstance = () => {
    if (DatasStoreBase.Quest === null) {
      DatasStoreBase.Quest = new QuestSystem()
    }
    return DatasStoreBase.Quest
  }

  const prepareDataStore = async (dataId: DataStoreIds): Promise<() => Promise<void>> => {
    switch (dataId) {
      case DataStoreIds.Items: {
        const itemSystem = initItemsInstance()
        const [equipmentData, crystalData] = await DownloadDatas(
          { path: DataPathIds.Equipment, lang: true },
          DataPathIds.Crystal
        )
        return async () => {
          LoadEquipments(itemSystem, equipmentData)
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
        if (!enchantData.baseData[0][4].startsWith('額外上限')) {
          const { notify } = Notify()
          notify(Grimoire.i18n.t('app.notices.enchant-refactor'))
        }
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
    }
  }

  return {
    checkLoaded,
    waitLoaded,
    loadFinished,
    prepareDataStore,
  }
})
