import { defineStore } from 'pinia'
import { computed, shallowReactive, ref } from 'vue'

import { useCharacterFoodStore } from '@/stores/views/character/food'
import { useCharacterSkillStore } from '@/stores/views/character/skill'

import { InitCrystalIcons, InitEquipmentIcons, InitSkillIcons } from '@/shared/services/Images'

import DamageCalculationSystem from '@/lib/Calculation/Damage'
import CharacterSystem from '@/lib/Character'
import EnchantSystem from '@/lib/Enchant'
import ItemsSystem from '@/lib/Items'
import SkillSystem from '@/lib/Skill'
import GlossarySystem from '@/lib/Glossary'

import DownloadDatas from './utils/DownloadDatas'
import loadCharacterStats from './utils/LoadCharacterStat'
import loadCrystals from './utils/LoadCrystals'
import loadEnchant from './utils/LoadEnchant'
import loadEquipments from './utils/LoadEquipments'
import { loadSkill, loadSkillMain } from './utils/LoadSkill'
import loadStats from './utils/LoadStats'
import loadGlossaryTagData from './utils/LoadGlossary'
import { DataStoreIds } from './enums'

export const DatasStoreBase: {
  Items: ItemsSystem | null;
  Character: CharacterSystem | null;
  Glossary: GlossarySystem | null;
  Skill: SkillSystem | null;
  Enchant: EnchantSystem | null;
  DamageCalculation: DamageCalculationSystem | null;
} = shallowReactive({
  Items: null,
  Character: null,
  Glossary: null,
  Skill: null,
  Enchant: null,
  DamageCalculation: null,
})

export const useDatasStore = defineStore('app-datas', () => {
  const Items = computed(() => DatasStoreBase.Items)
  const Character = computed(() => DatasStoreBase.Character)
  const Glossary = computed(() => DatasStoreBase.Glossary)
  const Skill = computed(() => DatasStoreBase.Skill)
  const Enchant = computed(() => DatasStoreBase.Enchant)
  const DamageCalculation = computed(() => DatasStoreBase.DamageCalculation)
  const loaded = ref<Map<DataStoreIds, boolean>>(new Map())

  const checkLoad = (id: DataStoreIds) => loaded.value.has(id)

  const loadFinished = (id: DataStoreIds) => {
    loaded.value.set(id, true)
  }

  const initItemsInstance = () => {
    if (Items.value === null) {
      DatasStoreBase.Items = new ItemsSystem()
    }
  }

  const initCharacterInstance = () => {
    if (Character.value === null) {
      DatasStoreBase.Character = new CharacterSystem()
    }
  }

  const initGlossaryInstance = () => {
    if (Glossary.value === null) {
      DatasStoreBase.Glossary = new GlossarySystem()
    }
  }

  const initSkillInstance = () => {
    if (Skill.value === null) {
      DatasStoreBase.Skill = new SkillSystem()
    }
  }

  const initEnchantInstance = () => {
    if (Enchant.value === null) {
      DatasStoreBase.Enchant = new EnchantSystem()
    }
  }

  const initDamageCalculationInstance = () => {
    if (DamageCalculation.value === null) {
      DatasStoreBase.DamageCalculation = new DamageCalculationSystem()
    }
  }

  const initItems = async function () {
    const datas = await DownloadDatas('Equipment', 'Crystal')
    return async () => {
      initItemsInstance()
      loadEquipments(Items.value!, datas[0][0])
      loadCrystals(Items.value!, datas[1][0])

      await InitCrystalIcons()
    }
  }

  const initStats = async function () {
    const datas = await DownloadDatas({ path: 'Stats', lang: true })
    return async () => {
      initCharacterInstance()
      loadStats(Character.value!, datas[0])
      await InitEquipmentIcons()
    }
  }

  const initCharacterStats = async function () {
    const datas = await DownloadDatas({ path: 'Character Stats', lang: true })
    return async () => {
      initCharacterInstance()
      loadCharacterStats(Character.value!, datas[0])
    }
  }

  const initGlossary = async function () {
    const datas = await DownloadDatas({ path: 'Glossary', lang: true })
    return async () => {
      initGlossaryInstance()
      loadGlossaryTagData(Glossary.value!, datas[0])
    }
  }

  const initSkill = async function () {
    const datas = await DownloadDatas({ path: 'Skill', lang: true }, { path: 'Skill Main', lang: true })
    return async () => {
      initSkillInstance()

      loadSkill(Skill.value!, datas[0])
      loadSkillMain(Skill.value!, datas[1])
      const skillStore = useCharacterSkillStore()
      skillStore.initSkillRoot(Skill.value!.skillRoot)

      await InitSkillIcons()
    }
  }

  const initFood = async function () {
    return async () => {
      const foodStore = useCharacterFoodStore()
      foodStore.initFoodsBase()
    }
  }

  const initEnchant = async function () {
    const datas = await DownloadDatas('Enchant')
    return async () => {
      initEnchantInstance()
      loadEnchant(Enchant.value!, datas[0][0])
    }
  }

  const initDamageCalculation = async function () {
    return async () => {
      initDamageCalculationInstance()
    }
  }

  return {
    Items,
    Character,
    Skill,
    Glossary,
    Enchant,
    DamageCalculation,

    checkLoad,
    loadFinished,
    initItems,
    initStats,
    initCharacterStats,
    initGlossary,
    initSkill,
    initFood,
    initEnchant,
    initDamageCalculation,
  }
})

