import { toIndex } from '@/shared/utils/number'

import { ResultContainerTypes } from '../../../common/ResultContainer'
import type { SkillBranchItemBaseChilds } from '../../SkillComputing/SkillBranchItem'
import { SkillBranchResult } from '../../SkillComputing/SkillBranchResult'

const REGISTLET_LEVEL_ACCESS_PATTERN = /RLv\[(\d+)\]/g

export interface RegistletFormulaVariables {
  RLv: readonly number[]
}

interface RegistletFormulaContext {
  branchItem: SkillBranchItemBaseChilds
  properties: ReadonlyMap<string, string>
  variables: RegistletFormulaVariables
  compute: (formula: string) => string
}

export function getRegistletFormulaLevelCount(values: readonly string[]): number {
  let length = 1
  values.forEach(value => {
    for (const match of value.matchAll(REGISTLET_LEVEL_ACCESS_PATTERN)) {
      length = Math.max(length, toIndex(match[1]) + 1)
    }
  })
  return length
}

export function initializeRegistletFormulaLevels(
  levels: number[],
  values: readonly string[]
): void {
  values.forEach(value => {
    for (const match of value.matchAll(REGISTLET_LEVEL_ACCESS_PATTERN)) {
      const index = toIndex(match[1])
      if (levels[index] === undefined) {
        levels[index] = 0
      }
    }
  })
}

export function isRegistletFormulaEnabled(
  formula: string,
  variables: RegistletFormulaVariables
): boolean {
  const levels = variables.RLv
  if (/RLv(?!\[)/.test(formula)) {
    return levels[0] > 0
  }
  const match = formula.matchAll(REGISTLET_LEVEL_ACCESS_PATTERN).next().value
  if (match !== undefined) {
    return levels[toIndex(match[1])] > 0
  }
  return true
}

export function attachRegistletFormulaResult(
  result: SkillBranchResult,
  context: RegistletFormulaContext
): void {
  const propertyKey = context.branchItem.propKey(result.key, 'registlet')
  const formula = context.properties.get(propertyKey)
  if (formula === undefined || !isRegistletFormulaEnabled(formula, context.variables)) {
    return
  }

  result.subContainers.registlet = SkillBranchResult.create(
    ResultContainerTypes.Number,
    context.branchItem,
    propertyKey,
    formula,
    context.compute(formula)
  )
}
