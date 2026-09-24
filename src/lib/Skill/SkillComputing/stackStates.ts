import { reactive } from 'vue'

import { handleFormula } from '@/shared/utils/data'

import type { SkillBranchItem } from './SkillBranchItem'
import { resolveStackDefaultValue } from './branchProps'

export interface SkillStackState {
  value: number
}

export function createSkillStackStates() {
  const stackStates = reactive(new Map<string, SkillStackState>())

  const getStackState = (branchItem: SkillBranchItem, vars = { slv: 0, clv: 0 }) => {
    const id = branchItem.effectStackId
    if (id === null) {
      return null
    }

    if (!stackStates.has(id)) {
      stackStates.set(id, {
        value: handleFormula(resolveStackDefaultValue(branchItem.allProps), {
          vars: { SLv: vars.slv, CLv: vars.clv },
          toNumber: true,
        }) as number,
      })
    }

    return stackStates.get(id)!
  }

  const resetStackStates = () => stackStates.clear()

  return { stackStates, getStackState, resetStackStates }
}
