import { reactive } from 'vue'
import { shallowReactive } from 'vue'
import { ref } from 'vue'

import { defineState } from '@/shared/composables/State'

import { SkillBranch } from '@/lib/Skill/Skill'
import {
  type SkillBranchItem,
  type SkillBranchItemSuffix,
  type SkillFormulaExtraProps,
  createSkillStackStates,
} from '@/lib/Skill/SkillComputing'

const SKILL_BRANCH_STATE_DEFAULT_ENABLED = true

export interface SkillFormulaExtraVarState extends SkillFormulaExtraProps {
  effectBranchId: string
  id: string
  text: string
  value: number
}

interface SkillBranchItemState {
  enabled: boolean
}

interface SkillFormulaExtraBranchState {
  formulaExtraIds: string[]
  getFormulaExtraState: (text: string, props?: SkillFormulaExtraProps) => SkillFormulaExtraVarState
}

const useSkillBranchStates = defineState(() => {
  const skillBranchStates: Map<string, SkillBranchItemState> = reactive(new Map())
  return { skillBranchStates }
})

const useSkillFormulaExtraStates = defineState(() => {
  const formulaExtraStates: Map<string, SkillFormulaExtraBranchState> = reactive(new Map())
  return { formulaExtraStates }
})

const useSkillStackStates = defineState(createSkillStackStates)

export function getSkillBranchState(skillBranch: SkillBranch) {
  const { skillBranchStates } = useSkillBranchStates()
  const branchId = skillBranch.branchId

  if (!skillBranchStates.has(branchId)) {
    skillBranchStates.set(branchId, { enabled: SKILL_BRANCH_STATE_DEFAULT_ENABLED })
  }
  return skillBranchStates.get(branchId)!
}

function getSkillFormulaExtraStateById(effectBranchId: string) {
  const { formulaExtraStates } = useSkillFormulaExtraStates()
  if (!formulaExtraStates.has(effectBranchId)) {
    const variableStates = ref(new Map<string, SkillFormulaExtraVarState>())
    const formulaExtraIds = shallowReactive([] as string[])
    const getFormulaExtraState = (id: string, props?: SkillFormulaExtraProps) => {
      if (!variableStates.value.has(id)) {
        variableStates.value.set(id, {
          effectBranchId,
          id,
          text: id,
          value: 0,
          max: null,
          min: null,
        })
        formulaExtraIds.push(id)
      }
      const state = variableStates.value.get(id)!
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
    formulaExtraStates.set(effectBranchId, { formulaExtraIds, getFormulaExtraState })
  }
  return formulaExtraStates.get(effectBranchId)!
}

export function getSkillFormulaExtraBranchState(branchItem: SkillBranchItemSuffix) {
  return getSkillFormulaExtraStateById(branchItem.effectBranchId)
}

export function getSkillStackState(branchItem: SkillBranchItem) {
  return useSkillStackStates().getStackState(branchItem)
}

export function resetSkillBranchStates() {
  useSkillBranchStates().skillBranchStates.clear()
  useSkillFormulaExtraStates().formulaExtraStates.clear()
}

export function resetSkillStackStates() {
  useSkillStackStates().resetStackStates()
}

export function createSkillBranchSaveData(): Record<string, { enabled: boolean }> {
  return Object.fromEntries(
    Array.from(useSkillBranchStates().skillBranchStates)
      .filter(([, state]) => state.enabled !== SKILL_BRANCH_STATE_DEFAULT_ENABLED)
      .map(([branchId, state]) => [branchId, { enabled: state.enabled }])
  )
}

export function loadSkillBranchSaveData(values?: Record<string, { enabled: boolean }>) {
  const { skillBranchStates } = useSkillBranchStates()
  skillBranchStates.clear()
  Object.entries(values ?? {}).forEach(([branchId, state]) => {
    if (typeof state?.enabled === 'boolean') {
      skillBranchStates.set(branchId, { enabled: state.enabled })
    }
  })
}

export function createSkillStackSaveData(): Record<string, number> {
  return Object.fromEntries(
    Array.from(useSkillStackStates().stackStates, ([id, state]) => [id, state.value])
  )
}

export function loadSkillStackSaveData(values?: Record<string, number>) {
  const { stackStates } = useSkillStackStates()
  stackStates.clear()
  Object.entries(values ?? {}).forEach(([id, value]) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      stackStates.set(id, { value })
    }
  })
}

export function createSkillFormulaExtraSaveData(): Record<string, Record<string, number>> {
  const { formulaExtraStates } = useSkillFormulaExtraStates()
  const values: Record<string, Record<string, number>> = {}

  formulaExtraStates.forEach((state, effectBranchId) => {
    if (state.formulaExtraIds.length > 0) {
      values[effectBranchId] = Object.fromEntries(
        state.formulaExtraIds.map(id => [id, state.getFormulaExtraState(id).value])
      )
    }
  })

  return values
}

export function loadSkillFormulaExtraSaveData(values?: Record<string, Record<string, number>>) {
  useSkillFormulaExtraStates().formulaExtraStates.clear()
  if (!values) {
    return
  }

  Object.entries(values).forEach(([effectBranchId, variableValues]) => {
    const state = getSkillFormulaExtraStateById(effectBranchId)
    Object.entries(variableValues).forEach(([id, value]) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        state.getFormulaExtraState(id).value = value
      }
    })
  })
}
