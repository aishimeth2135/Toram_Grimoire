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
import DownloadDatas from './utils/DownloadDatas'
import loadCharacterStats from './utils/LoadCharacterStat'
import loadCrystals from './utils/LoadCrystals'
import loadEnchant from './utils/LoadEnchant'
import loadEquipments from './utils/LoadEquipments'
import loadGlossaryTagData from './utils/LoadGlossary'
import LoadPotions from './utils/LoadPotions'
import LoadQuests from './utils/LoadQuests'
import loadRegistlet from './utils/LoadRegistlet'
import { loadSkill, loadSkillMain } from './utils/LoadSkill'
import loadStats from './utils/LoadStats'

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
        const datas = await DownloadDatas(DataPathIds.Equipment, DataPathIds.Crystal)
        return async () => {
          loadEquipments(itemSystem, datas[0][0])
          loadCrystals(itemSystem, datas[1][0])

          await InitCrystalIcons()
        }
      }
      case DataStoreIds.Stats: {
        const characterSystem = initCharacterInstance()
        const datas = await DownloadDatas({
          path: DataPathIds.Stats,
          lang: true,
        })
        return async () => {
          loadStats(characterSystem, datas[0])
          await InitEquipmentIcons()
        }
      }
      case DataStoreIds.CharacterStats: {
        const characterSystem = initCharacterInstance()
        const datas = await DownloadDatas({
          path: DataPathIds.CharacterStats,
          lang: true,
        })
        return async () => {
          loadCharacterStats(characterSystem, datas[0])
        }
      }
      case DataStoreIds.Glossary: {
        const glossarySystem = initGlossaryInstance()
        const datas = await DownloadDatas({
          path: DataPathIds.Glossary,
          lang: true,
        })
        return async () => {
          loadGlossaryTagData(glossarySystem, datas[0])
        }
      }
      case DataStoreIds.Skill: {
        const skillSystem = initSkillInstance()
        const datas = await DownloadDatas(
          { path: DataPathIds.Skill, lang: true },
          { path: DataPathIds.SkillMain, lang: true }
        )
        return async () => {
          loadSkill(skillSystem, datas[0])
          loadSkillMain(skillSystem, datas[1])
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
        const datas = await DownloadDatas(DataPathIds.Enchant)
        if (!datas[0][0][0][4].startsWith('額外上限')) {
          const { notify } = Notify()
          notify(Grimoire.i18n.t('app.notices.enchant-refactor'))
        }
        return async () => {
          loadEnchant(enchantSystem, datas[0][0])
        }
      }
      case DataStoreIds.DamageCalculation: {
        initDamageCalculationInstance()
        return () => Promise.resolve()
      }
      case DataStoreIds.Registlet: {
        const registSystem = initRegistletInstance()
        const datas = await DownloadDatas(DataPathIds.Registlet)
        return async () => {
          loadRegistlet(registSystem, datas[0][0])
        }
      }
      case DataStoreIds.ItemsPotion: {
        const itemsSystem = initItemsInstance()
        const datas = await DownloadDatas(DataPathIds.Potion)
        return async () => {
          LoadPotions(itemsSystem.potionsRoot, datas[0][0])
        }
      }
      case DataStoreIds.Quest: {
        const questSystem = initQuestInstance()
        const mainQuestDatas = await DownloadDatas(DataPathIds.Quest)
        return async () => {
          LoadQuests(questSystem, mainQuestDatas[0][0])
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
