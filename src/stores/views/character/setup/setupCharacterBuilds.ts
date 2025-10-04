import { type ComputedRef, type Ref, type ShallowReactive, computed } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { computeFormula } from '@/shared/utils/data'

import { Character, EquipmentFieldTypes } from '@/lib/Character/Character'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment'
import { FoodsBuild } from '@/lib/Character/FoodBuild'
import { PotionBuild, type PotionItem } from '@/lib/Character/PotionBuild'
import { RegistletBuild } from '@/lib/Character/RegistletBuild'
import { SkillBuild } from '@/lib/Character/SkillBuild'
import {
  EquipmentRestrictions,
  StatBase,
  StatRecorded,
  StatTypes,
  StatValueSourceTypes,
} from '@/lib/Character/Stat'
import { Skill } from '@/lib/Skill/Skill'
import { SkillEffectItem, SkillItem } from '@/lib/Skill/SkillComputing'

export interface SkillItemState {
  skillItem: SkillItem
  effectItem: ComputedRef<SkillEffectItem | null>
}

export function useGetSkillLevel(
  skillItemStates: Map<Skill, SkillItemState>,
  skillBuild: Ref<SkillBuild | null>
) {
  return (skill: Skill) => {
    if (!skillItemStates.get(skill)?.effectItem.value) {
      return 0
    }

    return skillBuild.value?.getSkillLevel(skill) ?? 0
  }
}

export function setupCharacterSkillItems(
  character: Ref<Character | null>,
  skillBuild: Ref<SkillBuild | null>
) {
  const currentCharacterEquipment = computed<EquipmentRestrictions>(() => {
    if (!character.value) {
      return new EquipmentRestrictions()
    }

    const main = character.value.equipmentField(EquipmentFieldTypes.MainWeapon).equipmentType
    const sub = character.value.equipmentField(EquipmentFieldTypes.SubWeapon).equipmentType
    const body = character.value.equipmentField(EquipmentFieldTypes.BodyArmor).equipmentType
    if (main === EquipmentTypes.OneHandSword && sub === EquipmentTypes.OneHandSword) {
      return new EquipmentRestrictions({
        main: EquipmentTypes.DualSword,
        body,
      })
    }
    return new EquipmentRestrictions({ main, sub, body })
  })

  const allSkills: Skill[] = []
  Grimoire.Skill.skillRoot.skillTreeCategorys.forEach(stc =>
    stc.skillTrees.forEach(st => allSkills.push(...st.skills))
  )

  const skillItemStates: Map<Skill, ShallowReactive<SkillItemState>> = new Map()

  const getSkillLevel = useGetSkillLevel(skillItemStates, skillBuild)

  allSkills.forEach(skill => {
    const skillItem = new SkillItem(skill)
    const currentEffectItem = computed(() =>
      skillItem.findEffectItem(currentCharacterEquipment.value, getSkillLevel)
    )
    skillItemStates.set(skill, {
      skillItem,
      effectItem: currentEffectItem,
    })
  })

  return { skillItemStates }
}

export function setupFoodStats(foodBuild: Ref<FoodsBuild | null>) {
  const allFoodBuildStats = computed(() => {
    if (!foodBuild.value) {
      return []
    }
    return foodBuild.value.selectedFoods
      .filter(food => food.level !== 0)
      .map(food => StatRecorded.from(food.stat(), food, StatValueSourceTypes.Food))
  })

  return {
    allFoodBuildStats,
  }
}

export function setupRegistletStats(registletBuild: Ref<RegistletBuild | null>) {
  const _items = computed(() => {
    if (!registletBuild.value) {
      return []
    }
    return registletBuild.value.items
      .filter(item => item.base.link instanceof StatBase)
      .map(item => {
        const statBase = item.base.link as StatBase
        const value = computeFormula(item.base.rows[0].value, {
          Lv: item.level,
        }) as number
        return {
          stat: StatRecorded.from(
            statBase.createStat(StatTypes.Constant, value),
            item.base,
            StatValueSourceTypes.Registlet
          ),
          item,
        }
      })
  })
  const allRegistletBuildStats = computed(() => {
    return _items.value.filter(item => item.item.enabled).map(item => item.stat)
  })

  return {
    allRegistletBuildStats,
  }
}

export function setupPotionStats(potionBuild: Ref<PotionBuild | null>) {
  const _items = computed(() => {
    if (!potionBuild.value) {
      return []
    }
    const statItems: { stat: StatRecorded; item: PotionItem }[] = []
    potionBuild.value.items.forEach(item => {
      item.base.stats.forEach(potionStat => {
        statItems.push({
          stat: StatRecorded.from(potionStat, item.base, StatValueSourceTypes.Potion),
          item,
        })
      })
    })
    return statItems
  })
  const allPotionBuildStats = computed(() => {
    return _items.value.filter(item => item.item.enabled).map(item => item.stat)
  })

  return {
    allPotionBuildStats,
  }
}
