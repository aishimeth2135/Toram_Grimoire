import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useCharacterFoodStore } from '@/stores/views/character/food-build'
import { useCharacterSkillStore } from '@/stores/views/character/skill'
import { useLocaleStore } from '@/stores/app/locale'

import { InitCrystalIcons, InitEquipmentIcons, InitSkillIcons } from '@/shared/services/Images'

import CharacterSystem from '@/lib/Character'
import DamageCalculationSystem from '@/lib/Damage'
import EnchantSystem from '@/lib/Enchant'
import GlossarySystem from '@/lib/Glossary'
import ItemsSystem from '@/lib/Items'
import QuestSystem from '@/lib/Quest'
import RegistletSystem from '@/lib/Registlet'
import SkillSystem from '@/lib/Skill'

import type { StatLocale } from '@/data/types/stats'
import type { GlossaryLocale } from '@/data/types/glossary'
import type { EquipmentLocale } from '@/data/types/equipment'
import type { SkillLocale, SkillMainLocale } from '@/data/types/skill'
import type { CrystalLocale } from '@/data/types/crystal'
import type { RegistletLocale } from '@/data/types/registlet'
import type { QuestLocale } from '@/data/types/quest'
import type { PotionLocale } from '@/data/types/potion'
import type { EnchantLocale } from '@/data/types/enchant'
import type { CharacterStatLocale } from '@/data/types/character-stats'

import { DatasStoreBase } from './DatasStoreBase'
import { DataStoreIds } from './enums'
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

/** Numeric lang index → locale file suffix. Index 1 (zh-TW) is the base data, no file needed. */
const LANG_SUFFIX: Record<number, string> = {
  0: 'en',
  2: 'ja',
  3: 'zh_cn',
}

async function loadLocale<T>(
  langIndex: number,
  importer: (suffix: string) => Promise<{ default: T }>
): Promise<T | undefined> {
  const suffix = LANG_SUFFIX[langIndex]
  if (!suffix) return undefined
  try {
    return (await importer(suffix)).default
  } catch {
    return undefined
  }
}

export const useDatasStore = defineStore('app-datas', () => {
  const loaded = ref<Map<DataStoreIds, boolean>>(new Map())
  const waitLoadedTicks = ref<Map<DataStoreIds, ((value: boolean) => void)[]>>(new Map())

  const checkLoaded = (id: DataStoreIds) => loaded.value.has(id)

  const waitLoaded = (id: DataStoreIds) => {
    if (checkLoaded(id)) return Promise.resolve()
    if (!waitLoadedTicks.value.has(id)) waitLoadedTicks.value.set(id, [])
    return new Promise(resolve => {
      waitLoadedTicks.value.get(id)!.push(resolve)
    })
  }

  const loadFinished = (id: DataStoreIds) => {
    loaded.value.set(id, true)
    waitLoadedTicks.value.get(id)?.forEach(tick => tick(true))
  }

  const initItemsInstance = () => {
    if (DatasStoreBase.Items === null) DatasStoreBase.Items = new ItemsSystem()
    return DatasStoreBase.Items
  }
  const initCharacterInstance = () => {
    if (DatasStoreBase.Character === null) DatasStoreBase.Character = new CharacterSystem()
    return DatasStoreBase.Character
  }
  const initGlossaryInstance = () => {
    if (DatasStoreBase.Glossary === null) DatasStoreBase.Glossary = new GlossarySystem()
    return DatasStoreBase.Glossary
  }
  const initSkillInstance = () => {
    if (DatasStoreBase.Skill === null) DatasStoreBase.Skill = new SkillSystem()
    return DatasStoreBase.Skill
  }
  const initEnchantInstance = () => {
    if (DatasStoreBase.Enchant === null) DatasStoreBase.Enchant = new EnchantSystem()
    return DatasStoreBase.Enchant
  }
  const initDamageCalculationInstance = () => {
    if (DatasStoreBase.DamageCalculation === null)
      DatasStoreBase.DamageCalculation = new DamageCalculationSystem()
    return DatasStoreBase.DamageCalculation
  }
  const initRegistletInstance = () => {
    if (DatasStoreBase.Registlet === null) DatasStoreBase.Registlet = new RegistletSystem()
    return DatasStoreBase.Registlet
  }
  const initQuestInstance = () => {
    if (DatasStoreBase.Quest === null) DatasStoreBase.Quest = new QuestSystem()
    return DatasStoreBase.Quest
  }

  const prepareDataStore = async (dataId: DataStoreIds): Promise<() => Promise<void>> => {
    const { primaryLang, secondaryLang } = useLocaleStore()
    switch (dataId) {
      case DataStoreIds.Items: {
        const itemSystem = initItemsInstance()
        const [{ default: equipmentData }, { default: crystalData }, equipmentLocale, crystalLocale] =
          await Promise.all([
            import('@/data/equipment.json'),
            import('@/data/crystal.json'),
            loadLocale<EquipmentLocale>(primaryLang, suffix =>
              import(`@/data/equipment.${suffix}.json`)
            ),
            loadLocale<CrystalLocale>(primaryLang, suffix =>
              import(`@/data/crystal.${suffix}.json`)
            ),
          ])
        return async () => {
          LoadEquipments(itemSystem, equipmentData as any, equipmentLocale)
          LoadCrystals(itemSystem, crystalData as any, crystalLocale)
          await InitCrystalIcons()
        }
      }

      case DataStoreIds.Stats: {
        const characterSystem = initCharacterInstance()
        const [{ default: statsData }, statsLocale] = await Promise.all([
          import('@/data/stats.json'),
          loadLocale<StatLocale>(primaryLang, suffix => import(`@/data/stats.${suffix}.json`)),
        ])
        return async () => {
          LoadStats(characterSystem, statsData as any, statsLocale)
          await InitEquipmentIcons()
        }
      }

      case DataStoreIds.CharacterStats: {
        const characterSystem = initCharacterInstance()
        const [{ default: data }, charStatsLocale] = await Promise.all([
          import('@/data/character_stats.json'),
          loadLocale<CharacterStatLocale>(primaryLang, suffix =>
            import(`@/data/character_stats.${suffix}.json`)
          ),
        ])
        return async () => {
          LoadCharacterStats(characterSystem, data as any, charStatsLocale)
        }
      }

      case DataStoreIds.Glossary: {
        const glossarySystem = initGlossaryInstance()
        const [{ default: glossaryData }, glossaryLocale] = await Promise.all([
          import('@/data/glossary.json'),
          loadLocale<GlossaryLocale>(primaryLang, suffix =>
            import(`@/data/glossary.${suffix}.json`)
          ),
        ])
        return async () => {
          LoadGlossaryTag(glossarySystem, glossaryData as any, glossaryLocale)
        }
      }

      case DataStoreIds.Skill: {
        const skillSystem = initSkillInstance()
        const [{ default: skillData }, { default: skillMainData }, skillLocale, skillMainLocale] =
          await Promise.all([
            import('@/data/skill.json'),
            import('@/data/skill_main.json'),
            loadLocale<SkillLocale>(primaryLang, suffix =>
              import(`@/data/skill.${suffix}.json`)
            ),
            loadLocale<SkillMainLocale>(primaryLang, suffix =>
              import(`@/data/skill_main.${suffix}.json`)
            ),
          ])
        return async () => {
          LoadSkill(skillSystem, skillData as any, skillLocale)
          LoadSkillMain(skillSystem, skillMainData as any, skillMainLocale)
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
        const [{ default: data }, enchantLocale] = await Promise.all([
          import('@/data/enchant.json'),
          loadLocale<EnchantLocale>(primaryLang, suffix =>
            import(`@/data/enchant.${suffix}.json`)
          ),
        ])
        return async () => {
          LoadEnchant(enchantSystem, data as any, enchantLocale)
        }
      }

      case DataStoreIds.DamageCalculation: {
        initDamageCalculationInstance()
        return () => Promise.resolve()
      }

      case DataStoreIds.Registlet: {
        const registSystem = initRegistletInstance()
        const [{ default: data }, registletLocale] = await Promise.all([
          import('@/data/registlet.json'),
          loadLocale<RegistletLocale>(primaryLang, suffix =>
            import(`@/data/registlet.${suffix}.json`)
          ),
        ])
        return async () => {
          LoadRegistlet(registSystem, data as any, registletLocale)
        }
      }

      case DataStoreIds.ItemsPotion: {
        const itemsSystem = initItemsInstance()
        const [{ default: data }, potionLocale] = await Promise.all([
          import('@/data/potion.json'),
          loadLocale<PotionLocale>(primaryLang, suffix =>
            import(`@/data/potion.${suffix}.json`)
          ),
        ])
        return async () => {
          LoadPotions(itemsSystem.potionsRoot, data as any, potionLocale)
        }
      }

      case DataStoreIds.Quest: {
        const questSystem = initQuestInstance()
        const [{ default: data }, questLocale] = await Promise.all([
          import('@/data/quest.json'),
          loadLocale<QuestLocale>(primaryLang, suffix =>
            import(`@/data/quest.${suffix}.json`)
          ),
        ])
        return async () => {
          LoadQuests(questSystem, data as any, questLocale)
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
