import { defineStore } from 'pinia'
import { computed, ref, shallowReactive } from 'vue'

import { useCharacterFoodStore } from '@/stores/views/character/food-build'
import { useCharacterSkillStore } from '@/stores/views/character/skill'

import Grimoire from '@/shared/Grimoire'
import { DataPathIds } from '@/shared/services/DataPath'
import {
  InitCrystalIcons,
  InitEquipmentIcons,
  InitSkillIcons,
} from '@/shared/services/Images'

import DamageCalculationSystem from '@/lib/Calculation/Damage'
import CharacterSystem from '@/lib/Character'
import EnchantSystem from '@/lib/Enchant'
import GlossarySystem from '@/lib/Glossary'
import ItemsSystem from '@/lib/Items'
import RegistletSystem from '@/lib/Registlet'
import SkillSystem from '@/lib/Skill'

import Notify from '@/setup/Notify'

import { DataStoreIds } from './enums'
import DownloadDatas from './utils/DownloadDatas'
import loadCharacterStats from './utils/LoadCharacterStat'
import loadCrystals from './utils/LoadCrystals'
import loadEnchant from './utils/LoadEnchant'
import loadEquipments from './utils/LoadEquipments'
import loadGlossaryTagData from './utils/LoadGlossary'
import LoadPotions from './utils/LoadPotions'
import loadRegistlet from './utils/LoadRegistlet'
import { loadSkill, loadSkillMain } from './utils/LoadSkill'
import loadStats from './utils/LoadStats'

export const DatasStoreBase: {
  Items: ItemsSystem | null
  Character: CharacterSystem | null
  Glossary: GlossarySystem | null
  Skill: SkillSystem | null
  Enchant: EnchantSystem | null
  DamageCalculation: DamageCalculationSystem | null
  Registlet: RegistletSystem | null
} = shallowReactive({
  Items: null,
  Character: null,
  Glossary: null,
  Skill: null,
  Enchant: null,
  DamageCalculation: null,
  Registlet: null,
})

interface DataStoreInitHandler {
  (): Promise<() => Promise<void>>
}

export const useDatasStore = defineStore('app-datas', () => {
  const Items = computed(() => DatasStoreBase.Items)
  const Character = computed(() => DatasStoreBase.Character)
  const Glossary = computed(() => DatasStoreBase.Glossary)
  const Skill = computed(() => DatasStoreBase.Skill)
  const Enchant = computed(() => DatasStoreBase.Enchant)
  const DamageCalculation = computed(() => DatasStoreBase.DamageCalculation)
  const Registlet = computed(() => DatasStoreBase.Registlet)

  const loaded = ref<Map<DataStoreIds, boolean>>(new Map())
  const waitLoadedTicks = ref<Map<DataStoreIds, ((value: boolean) => void)[]>>(
    new Map()
  )

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

  const initRegistletInstance = () => {
    if (Registlet.value === null) {
      DatasStoreBase.Registlet = new RegistletSystem()
    }
  }

  const initItems: DataStoreInitHandler = async function () {
    initItemsInstance()
    const datas = await DownloadDatas(
      DataPathIds.Equipment,
      DataPathIds.Crystal
    )
    return async () => {
      loadEquipments(Items.value!, datas[0][0])
      loadCrystals(Items.value!, datas[1][0])

      await InitCrystalIcons()
    }
  }

  const initStats: DataStoreInitHandler = async function () {
    initCharacterInstance()
    const datas = await DownloadDatas({ path: DataPathIds.Stats, lang: true })
    return async () => {
      loadStats(Character.value!, datas[0])
      await InitEquipmentIcons()
    }
  }

  const initCharacterStats: DataStoreInitHandler = async function () {
    initCharacterInstance()
    const datas = await DownloadDatas({
      path: DataPathIds.CharacterStats,
      lang: true,
    })
    return async () => {
      loadCharacterStats(Character.value!, datas[0])
    }
  }

  const initGlossary: DataStoreInitHandler = async function () {
    initGlossaryInstance()
    const datas = await DownloadDatas({
      path: DataPathIds.Glossary,
      lang: true,
    })
    return async () => {
      loadGlossaryTagData(Glossary.value!, datas[0])
    }
  }

  const initSkill: DataStoreInitHandler = async function () {
    initSkillInstance()
    const datas = await DownloadDatas(
      { path: DataPathIds.Skill, lang: true },
      { path: DataPathIds.SkillMain, lang: true }
    )
    return async () => {
      loadSkill(Skill.value!, datas[0])
      loadSkillMain(Skill.value!, datas[1])
      const skillStore = useCharacterSkillStore()
      skillStore.initSkillRoot(Skill.value!.skillRoot)

      await InitSkillIcons()
    }
  }

  const initFood: DataStoreInitHandler = async function () {
    const foodStore = useCharacterFoodStore()
    return async () => {
      foodStore.initFoodsBase()
    }
  }

  const initEnchant: DataStoreInitHandler = async function () {
    initEnchantInstance()
    const datas = await DownloadDatas(DataPathIds.Enchant)
    if (!datas[0][0][0][4].startsWith('額外上限')) {
      const { notify } = Notify()
      notify(Grimoire.i18n.t('app.notices.enchant-refactor'))
      throw Error('[cy] init error')
    }
    return async () => {
      loadEnchant(Enchant.value!, datas[0][0])
    }
  }

  const initDamageCalculation: DataStoreInitHandler = async function () {
    initDamageCalculationInstance()
    return () => Promise.resolve()
  }

  const initRegistlet: DataStoreInitHandler = async function () {
    initRegistletInstance()
    const datas = await DownloadDatas(DataPathIds.Registlet)
    return async () => {
      loadRegistlet(Registlet.value!, datas[0][0])
    }
  }

  const initItemsPotion: DataStoreInitHandler = async function () {
    initItemsInstance()
    const datas = await DownloadDatas(DataPathIds.Potion)
    return async () => {
      LoadPotions(Items.value!.potionsRoot, datas[0][0])
    }
  }

  return {
    Items,
    Character,
    Skill,
    Glossary,
    Enchant,
    DamageCalculation,

    checkLoaded,
    waitLoaded,
    loadFinished,
    initItems,
    initStats,
    initCharacterStats,
    initGlossary,
    initSkill,
    initFood,
    initEnchant,
    initDamageCalculation,
    initRegistlet,
    initItemsPotion,
  }
})
