import { reactive } from 'vue'
import { shallowReactive } from 'vue'
import { ref } from 'vue'

import { defineState } from '@/shared/setup/State'

import { SkillBranch } from '@/lib/Skill/Skill'
import { type SkillFormulaExtraProps } from '@/lib/Skill/SkillComputing'

export interface SkillFormulaExtraVarState extends SkillFormulaExtraProps {
  id: string
  text: string
  value: number
}

interface SkillBranchItemState {
  enabled: boolean
  formulaExtraIds: string[]
  getFormulaExtraState: (text: string, props?: SkillFormulaExtraProps) => SkillFormulaExtraVarState
}

const useSkillBranchStates = defineState(() => {
  const skillBranchStates: Map<SkillBranch, SkillBranchItemState> = reactive(new Map())
  return { skillBranchStates }
})

export function getSkillBranchState(skillBranch: SkillBranch) {
  const { skillBranchStates } = useSkillBranchStates()

  if (!skillBranchStates.has(skillBranch)) {
    const formulaExtraStates = ref(new Map<string, SkillFormulaExtraVarState>())
    const formulaExtraIds = shallowReactive([] as string[])
    const getFormulaExtraState = (id: string, props?: SkillFormulaExtraProps) => {
      if (!formulaExtraStates.value.has(id)) {
        formulaExtraStates.value.set(id, {
          id,
          text: id,
          value: 0,
          max: null,
          min: null,
        })
        formulaExtraIds.push(id)
      }
      const state = formulaExtraStates.value.get(id)!
      if (props) {
        const { max, min } = props
        state.max = max
        state.min = min
        if (max !== null) {
          state.value = Math.min(max, state.value)
        }
        if (min !== null) {
          state.value = Math.max(min, state.value)
        }
      }
      return state
    }
    const state: SkillBranchItemState = {
      enabled: true,
      formulaExtraIds,
      getFormulaExtraState,
    }
    skillBranchStates.set(skillBranch, state)
  }
  return skillBranchStates.get(skillBranch)!
}
