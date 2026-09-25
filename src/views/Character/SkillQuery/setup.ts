import { provide, ref, shallowReadonly, shallowRef, watch } from 'vue'
import type { Ref } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { defineState } from '@/shared/composables/State'

import { EquipmentRestrictions } from '@/lib/Character/Stat'
import { Skill, SkillTree, SkillTreeCategory } from '@/lib/Skill/Skill'
import {
  SkillBranchItem,
  SkillComputingContainer,
  SkillItem,
  createSkillStackStates,
} from '@/lib/Skill/SkillComputing'

import { ComputingContainerInjectionKey, type SkillRegistletItemState } from './injection-keys'

export const useSkillQueryState = defineState(() => {
  const currentSkillTreeCategory: Ref<SkillTreeCategory | null> = ref(null)
  const currentSkillTree: Ref<SkillTree | null> = ref(null)
  const currentSkill: Ref<Skill | null> = ref(null)
  const currentEquipment: Ref<EquipmentRestrictions> = ref(EquipmentRestrictions.create())

  const skillLevel = ref(10)
  const characterLevel = ref(300)

  const updateCurrentSkillTreeCategory = (category: SkillTreeCategory) => {
    currentSkillTreeCategory.value = category
    currentSkillTree.value = null
    currentSkill.value = null
  }

  const updateCurrentSkillTree = (tree: SkillTree) => {
    currentSkillTree.value = tree
    currentSkill.value = null
  }

  const updateCurrentSkill = (skill: Skill, syncParent = false) => {
    if (syncParent) {
      currentSkillTreeCategory.value = skill.parent.parent
      currentSkillTree.value = skill.parent
    }
    currentSkill.value = skill
  }

  return {
    skillLevel,
    characterLevel,
    currentEquipment,

    currentSkill: shallowReadonly(currentSkill),
    currentSkillTree: shallowReadonly(currentSkillTree),
    currentSkillTreeCategory: shallowReadonly(currentSkillTreeCategory),

    updateCurrentSkillTreeCategory,
    updateCurrentSkillTree,
    updateCurrentSkill,
  }
})

export function setupSkillQueryComputingContainer(skillRef: Ref<Skill | null>) {
  const skillRegistletItemsStates = new Map<Skill, SkillRegistletItemState[]>()
  const getSkillRegistletItemsState = (skill: Skill): SkillRegistletItemState[] => {
    if (!skillRegistletItemsStates.has(skill)) {
      const registletItems = Grimoire.Registlet.getRegistletItemsBySkill(skill)
      const registletItemStates = registletItems.map(registletItem => {
        const level = ref(registletItem.maxLevel)
        const enabled = ref(false)
        return {
          item: registletItem,
          get level() {
            return level.value
          },
          get enabled() {
            return enabled.value
          },
          setLevel: (value: number) => {
            level.value = value
          },
          setEnabled: (value: boolean) => {
            enabled.value = value
          },
        }
      })
      skillRegistletItemsStates.set(skill, registletItemStates)
    }
    return skillRegistletItemsStates.get(skill)!
  }

  const { skillLevel, characterLevel } = useSkillQueryState()

  const computingContainer = SkillComputingContainer.create()
  const FORMULA_REPLACED_VARS = [
    'BSTR',
    'BINT',
    'BAGI',
    'BVIT',
    'BDEX',
    'TEC',
    'CRT',
    'LUK',
    'MEN',
    'STR',
    'INT',
    'AGI',
    'VIT',
    'DEX',
    'shield_refining',
    'dagger_atk',
    'target_def',
    'target_level',
    'guard_power',
  ]
  FORMULA_REPLACED_VARS.forEach(varName => {
    computingContainer.handleFormulaConstants.texts['$' + varName] = Grimoire.i18n.t(
      `skill-query.branch.formula-replaced-text.${varName}`
    )
  })
  computingContainer.varGetters.skillLevel = () => skillLevel.value
  computingContainer.varGetters.characterLevel = () => characterLevel.value
  computingContainer.varGetters.registletLevel = skill => {
    return getSkillRegistletItemsState(skill).map(state => (state.enabled ? state.level : 0))
  }

  const currentSkillItem = shallowRef<SkillItem | null>(null)
  const stackStates = createSkillStackStates()
  const getStackState = (branchItem: SkillBranchItem) =>
    stackStates.getStackState(branchItem, { slv: skillLevel.value, clv: characterLevel.value })
  computingContainer.config.getStackState = getStackState

  watch(
    [skillRef, skillLevel, characterLevel],
    () => {
      stackStates.resetStackStates()
      currentSkillItem.value = skillRef.value ? SkillItem.create(skillRef.value) : null
    },
    { immediate: true }
  )

  const setStackValue = (branchItem: SkillBranchItem, value: number) => {
    const stackState = getStackState(branchItem)
    if (stackState) {
      stackState.value = value
    }
  }

  provide(ComputingContainerInjectionKey, {
    rootComputingContainer: computingContainer,
    setStackValue,
    getSkillRegistletItemsState,
    currentSkillItem,
  })

  return {
    currentSkillItem,
    computingContainer,
  }
}
