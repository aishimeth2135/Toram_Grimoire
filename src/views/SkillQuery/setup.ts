import { provide, reactive, ref, shallowRef, watch } from 'vue'
import type { Ref } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { RegistletItemBaseSkill } from '@/lib/Registlet/RegistletItem'
import { Skill, SkillTree, SkillTreeCategory } from '@/lib/Skill/Skill'
import {
  EquipmentRestrictions,
  SkillBranchItem,
  SkillComputingContainer,
  SkillEffectItem,
  SkillEffectItemHistory,
  SkillItem,
} from '@/lib/Skill/SkillComputingContainer'

import { ComputingContainerInjectionKey } from './injection-keys'

export const useSkillQueryState = (() => {
  const currentSkillTreeCategory: Ref<SkillTreeCategory | null> = ref(null)
  const currentSkillTree: Ref<SkillTree | null> = ref(null)
  const currentSkill: Ref<Skill | null> = ref(null)
  const currentEquipment: Ref<EquipmentRestrictions> = ref(
    new EquipmentRestrictions()
  )

  const skillLevel = ref(10)
  const characterLevel = ref(300)

  return function () {
    return {
      skillLevel,
      characterLevel,
      currentSkill,
      currentSkillTree,
      currentSkillTreeCategory,
      currentEquipment,
    }
  }
})()

export interface SkillRegistletItemState {
  index: number
  item: RegistletItemBaseSkill
  level: number
  enabled: boolean
}

export function setupComputingContainer(skillRef: Ref<Skill | null>) {
  const skillRegistletItemsStates = new Map<Skill, SkillRegistletItemState[]>()
  const getSkillRegistletItemsState = (
    skill: Skill
  ): SkillRegistletItemState[] => {
    if (!skillRegistletItemsStates.has(skill)) {
      const registletItems = Grimoire.Registlet.getRegistletItemsBySkill(skill)
      skillRegistletItemsStates.set(
        skill,
        registletItems.map((registletItem, index) => {
          const maxLevel = registletItem.maxLevel
          return reactive({
            index,
            item: registletItem,
            level: ref(maxLevel),
            enabled: false,
          }) as SkillRegistletItemState
        })
      )
    }
    return skillRegistletItemsStates.get(skill)!
  }

  const { skillLevel, characterLevel } = useSkillQueryState()

  const computingContainer = new SkillComputingContainer()
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
    computingContainer.handleFormulaExtends.texts['$' + varName] =
      Grimoire.i18n.t(`skill-query.branch.formula-replaced-text.${varName}`)
  })
  computingContainer.varGetters.skillLevel = () => skillLevel.value
  computingContainer.varGetters.characterLevel = () => characterLevel.value
  computingContainer.varGetters.registletLevel = skill => {
    return getSkillRegistletItemsState(skill).map(state =>
      state.enabled ? state.level : 0
    )
  }

  const currentSkillItem = shallowRef<SkillItem | null>(null)
  watch(
    skillRef,
    newValue => {
      currentSkillItem.value = newValue ? new SkillItem(newValue) : null
      const vars = {
        slv: skillLevel.value,
        clv: characterLevel.value,
      }
      currentSkillItem.value?.effectItems.forEach(effectItem =>
        effectItem.resetStackStates(vars)
      )
    },
    { immediate: true }
  )

  const setStackValue = (branchItem: SkillBranchItem, value: number) => {
    const stackId = branchItem.stackId
    if (typeof stackId !== 'number') {
      return
    }
    const effect = branchItem.parent
    if (effect instanceof SkillEffectItem) {
      effect.parent.effectItems.forEach(effectItem => {
        const stackState = effectItem.getStackState(stackId)
        if (stackState) {
          stackState.value = value
        }
      })
    } else if (effect instanceof SkillEffectItemHistory) {
      const stackState = effect.getStackState(stackId)
      if (stackState) {
        stackState.value = value
      }
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
