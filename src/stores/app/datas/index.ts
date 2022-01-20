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
import TagSystem from '@/lib/Tag'

import DownloadDatas from './utils/DownloadDatas'
import loadCharacterStats from './utils/LoadCharacterStat'
import loadCrystals from './utils/LoadCrystals'
import loadEnchant from './utils/LoadEnchant'
import loadEquipments from './utils/LoadEquipments'
import { loadSkill, loadSkillMain } from './utils/LoadSkill'
import loadStats from './utils/LoadStats'
import loadTag from './utils/LoadTag'
import { DataStoreIds } from './enums'

export const DatasStoreBase: {
  Items: ItemsSystem | null;
  Character: CharacterSystem | null;
  Tag: TagSystem | null;
  Skill: SkillSystem | null;
  Enchant: EnchantSystem | null;
  DamageCalculation: DamageCalculationSystem | null;
} = shallowReactive({
  Items: null,
  Character: null,
  Tag: null,
  Skill: null,
  Enchant: null,
  DamageCalculation: null,
})

export const useDatasStore = defineStore('app-datas', () => {
  const Items = computed(() => DatasStoreBase.Items)
  const Character = computed(() => DatasStoreBase.Character)
  const Tag = computed(() => DatasStoreBase.Tag)
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

  const initTagInstance = () => {
    if (Tag.value === null) {
      DatasStoreBase.Tag = new TagSystem()
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

  const initItems = async function* () {
    const datas = await DownloadDatas('Equipment', 'Crystal')
    yield
    initItemsInstance()
    loadEquipments(Items.value!, datas[0][0])
    loadCrystals(Items.value!, datas[1][0])

    await InitCrystalIcons()
  }

  const initStats = async function* () {
    const datas = await DownloadDatas({ path: 'Stats', lang: true })
    yield
    initCharacterInstance()
    loadStats(Character.value!, datas[0])
    await InitEquipmentIcons()
  }

  const initCharacterStats = async function* () {
    const datas = await DownloadDatas({ path: 'Character Stats', lang: true })
    yield
    initCharacterInstance()
    loadCharacterStats(Character.value!, datas[0])
  }

  const initTag = async function* () {
    const datas = await DownloadDatas({ path: 'Tag', lang: true })
    yield
    initTagInstance()
    loadTag(Tag.value!, datas[0])
  }

  const initSkill = async function* () {
    const datas = await DownloadDatas({ path: 'Skill', lang: true }, { path: 'Skill Main', lang: true })
    yield
    initSkillInstance()

    loadSkill(Skill.value!, datas[0])
    loadSkillMain(Skill.value!, datas[1])
    const skillStore = useCharacterSkillStore()
    skillStore.initSkillRoot(Skill.value!.skillRoot)

    await InitSkillIcons()
  }

  const initFood = async function* () {
    // do nothing
    yield
    const foodStore = useCharacterFoodStore()
    foodStore.initFoodsBase()
  }

  const initEnchant = async function* () {
    const datas = await DownloadDatas('Enchant')
    yield
    initEnchantInstance()
    loadEnchant(Enchant.value!, datas[0][0])
  }

  const initDamageCalculation = async function* () {
    // do nothing
    yield
    initDamageCalculationInstance()
  }

  return {
    Items,
    Character,
    Skill,
    Tag,
    Enchant,
    DamageCalculation,

    checkLoad,
    loadFinished,
    initItems,
    initStats,
    initCharacterStats,
    initTag,
    initSkill,
    initFood,
    initEnchant,
    initDamageCalculation,
  }
})

