import Grimoire from '@/shared/Grimoire'
import {
  type HandleFormulaMethods,
  type HandleFormulaTexts,
  type HandleFormulaVars,
  computeFormula,
  handleFormula,
} from '@/shared/utils/data'
import { toIndex, toInt } from '@/shared/utils/number'

import { StatComputed } from '@/lib/Character/Stat'
import { ResultContainerTypes } from '@/lib/common/ResultContainer'

import { SkillBranchNames } from '../Skill'
import {
  SkillBranchItem,
  type SkillBranchItemBaseChilds,
  SkillBranchItemSuffix,
} from '../SkillComputing/SkillBranchItem'
import { SkillBranchResult, SkillBranchStatResult } from '../SkillComputing/SkillBranchResult'
import { SkillComputingContainer } from '../SkillComputing/SkillComputingContainer'
import { resolveStackName } from '../SkillComputing/branchProps'
import { FormulaDisplayModes } from '../SkillComputing/enums'
import { mergeFormulaExtendedData } from './FormulaExtended'
import {
  type RegistletFormulaVariables,
  attachRegistletFormulaResult,
  attachStatConditionFormula,
  getRegistletFormulaLevelCount,
  initializeRegistletFormulaLevels,
} from './FormulaSpecial'
import { parseFormulaListProperty, parseListProperty } from './List'

function computeBranchFormulaValue(str: string, helper: ComputedBranchHelperResult): string {
  const { vars, texts, methods, handleFormulaExtra } = helper
  if (typeof str !== 'string') {
    console.warn('[computeBranchValue] unexpected value: ' + str, helper)
    return '0'
  }
  // convert "A,,B" to "(A)+(B)"
  str = parseFormulaListProperty(str)
    .map(part => `(${part})`)
    .join('+')
    // convert "stack+A" to "stack[0]+A"
    .replace(/stack(?!\[)/g, 'stack[0]')
    .replace(/RLv(?!\[)/g, 'RLv[0]')

  str = handleFormulaExtra(str)
  return handleFormula(str, { vars, texts, methods }) as string
}

/**
 * generated from `computedBranchHelper()`
 */
interface ComputedBranchHelperResult {
  vars: HandleFormulaVars
  texts: HandleFormulaTexts
  methods: HandleFormulaMethods
  branchItem: SkillBranchItemBaseChilds
  props: ReadonlyMap<string, string>
  handleFormulaExtra: (formula: string) => string
  formulaDisplayMode: FormulaDisplayModes
  registletVariables: RegistletFormulaVariables
}
const HANDLE_FORMULA_EXTRA_PATTERN = /extra\[(\d+)\]/g
/**
 * Create data contains vars and texts of branchItem to compute formula.
 * @param branchItem
 * @param values - it will check value of every values whether it contains "stack[n]", and ensure `stack[n]` is not undefined
 * @param [formulaDisplayMode] - formula display mode, default value is from `ComputingContainer.config`
 * @returns datas using for compute
 */
function computedBranchHelper(
  computing: SkillComputingContainer,
  branchItem: SkillBranchItemBaseChilds,
  values: string[] = [],
  formulaDisplayMode?: FormulaDisplayModes,
  props: ReadonlyMap<string, string> = branchItem.allProps
): ComputedBranchHelperResult {
  let vars: HandleFormulaVars
  let texts: HandleFormulaTexts

  formulaDisplayMode = formulaDisplayMode ?? computing.config.formulaDisplayMode

  const branchItemStack: SkillBranchItem =
    branchItem instanceof SkillBranchItemSuffix ? branchItem.mainBranch : branchItem
  const stackIds = branchItemStack.linkedStackIds

  const handleFormulaConstants = computing.handleFormulaConstants
  const extendsDatas = {
    vars: { ...handleFormulaConstants.vars },
    texts: { ...handleFormulaConstants.texts },
    methods: {
      getSkillLevel: () => 0,
    },
  }
  computing.handleFormulaExtends.forEach(getter => {
    const data = getter()
    mergeFormulaExtendedData(extendsDatas, data)
  })

  const RLv = [...(computing.varGetters.registletLevel?.(branchItem.default.parent.parent) ?? [])]

  const STACK_ACCESS_PATTERN = /stack\[(\d+)\]/g

  if (formulaDisplayMode === FormulaDisplayModes.OriginalFormula) {
    const { t } = Grimoire.i18n

    const stack: string[] = []
    const RLvLength = getRegistletFormulaLevelCount(values)

    if (stackIds.length > 0) {
      const stackNames = stackIds.map((id, idx) => {
        const stackBranch = branchItem.parent.branchItems.find(item => item.stackId === id)
        const defaultName = t('skill-query.branch.stack.base-name')
        return stackBranch ? resolveStackName(stackBranch, defaultName) : `${defaultName}${idx + 1}`
      })
      stack.push(...stackNames)
    }

    values.forEach(value => {
      const stackMatches = Array.from(value.matchAll(STACK_ACCESS_PATTERN))
      stackMatches.forEach(match => {
        const idxValue = toIndex(match[1])
        if (stack[idxValue] === undefined) {
          stack[idxValue] = `${t('skill-query.branch.stack.base-name')}${idxValue + 1}`
        }
      })
    })

    if (stack[0] === undefined) {
      stack[0] = `${t('skill-query.branch.stack.base-name')}1`
    }
    vars = {
      ...extendsDatas.vars,
    } as HandleFormulaVars
    texts = {
      SLv: t('skill-query.skill-level'),
      CLv: t('skill-query.character-level'),
      RLv: Array(RLvLength).fill(t('skill-query.registlet-level-abbreviation')),
      stack: stack,
      ...extendsDatas.texts,
    } as HandleFormulaTexts
  } else {
    const stack: number[] = []

    if (stackIds.length > 0) {
      const computeFormulaExtraValue = computing.config.computeFormulaExtraValue
      const stackValues = stackIds.map(id => {
        const stackBranch = branchItem.parent.branchItems.find(item => item.stackId === id)
        if (!stackBranch) {
          return 0
        }
        const stackState = computing.config.getStackState?.(stackBranch)
        if (!stackState) {
          return 0
        }
        if (!computeFormulaExtraValue || !stackBranch.hasProp('value')) {
          return stackState.value
        }
        return computeFormulaExtraValue(stackBranch.prop('value')) ?? stackState.value
      })
      stack.push(...stackValues)
    }

    values.forEach(value => {
      const stackMatches = Array.from(value.matchAll(STACK_ACCESS_PATTERN))
      stackMatches.forEach(match => {
        const idxValue = toIndex(match[1])
        if (stack[idxValue] === undefined) {
          stack[idxValue] = 0
        }
      })
    })

    initializeRegistletFormulaLevels(RLv, values)

    if (stack[0] === undefined) {
      stack[0] = 0
    }
    if (RLv[0] === undefined) {
      RLv[0] = 0
    }

    vars = {
      ...extendsDatas.vars,
      SLv: computing.varGetters.skillLevel?.(branchItem.default.parent.parent) ?? 0,
      CLv: computing.varGetters.characterLevel?.() ?? 0,
      stack: stack,
      RLv,
    } as HandleFormulaVars
    texts = {
      ...extendsDatas.texts,
    } as HandleFormulaTexts
  }

  const getTextKey = (idx: number) => `__FORMULA_EXTRA_TEXT_${idx.toString()}__`

  let mainBranchItem: SkillBranchItem
  if (branchItem instanceof SkillBranchItemSuffix) {
    mainBranchItem = branchItem.mainBranch
  } else {
    mainBranchItem = branchItem
  }

  const formulaExtra =
    mainBranchItem.suffixBranches.find(suf => suf.is(SkillBranchNames.FormulaExtra)) ?? null

  let extraTexts: string[] = []
  if (formulaExtra) {
    extraTexts = parseListProperty(formulaExtra.prop('texts'))
    extraTexts.forEach((text, idx) => {
      const key = getTextKey(idx)
      texts[key] = text
    })
  }

  const { getFormulaExtraValue, computeFormulaExtraValue } = computing.config

  const getValue = (index: string): string | null => {
    if (!formulaExtra) {
      return null
    }
    if (formulaExtra.hasProp('values', index)) {
      return computeFormulaExtraValue?.(formulaExtra.prop('values', index))?.toString() ?? null
    }
    const idx = toInt(index)
    if (idx === null) {
      return null
    }
    const bounds = {
      max: formulaExtra.hasProp('values', index, 'max')
        ? (computeFormula(formulaExtra.prop('values', index, 'max'), vars, 0) as number)
        : null,
      min: formulaExtra.hasProp('values', index, 'min')
        ? (computeFormula(formulaExtra.prop('values', index, 'min'), vars, 0) as number)
        : null,
    }
    return getFormulaExtraValue?.(formulaExtra, extraTexts[idx], bounds)?.toString() ?? null
  }

  const handleFormulaExtra = !formulaExtra
    ? (str: string) => {
        return str.replace(HANDLE_FORMULA_EXTRA_PATTERN, (_match, p1) => getTextKey(p1))
      }
    : (str: string) => {
        return str.replace(
          HANDLE_FORMULA_EXTRA_PATTERN,
          (_match, p1) => getValue(p1) ?? getTextKey(p1)
        )
      }

  return {
    vars,
    texts,
    methods: extendsDatas.methods,
    handleFormulaExtra,
    branchItem,
    props,
    formulaDisplayMode,
    registletVariables: { RLv },
  }
}

/**
 * Compute value-type data.
 * - If key not exist in props, its computed value is "0"
 * @param helper
 * @param props - current props data
 * @param propKeys - props that want to computed
 * @returns object contains all pairs of key im propKeys and computed value
 */
function computeBranchValueProps<Key extends string>(
  helper: ComputedBranchHelperResult,
  props: Map<string, string>,
  propKeys: Key[]
): Map<Key, string> {
  const propValues = new Map<Key, string>()
  propKeys.forEach(propKey => {
    const str = props.get(propKey)
    if (str === undefined) {
      propValues.set(propKey, '0')
      return
    }

    propValues.set(propKey, computeBranchFormulaValue(str, helper))
  })

  return propValues
}

function computedBranchStats(
  helper: ComputedBranchHelperResult,
  stats: StatComputed[]
): StatComputed[] {
  return stats.map(stat => {
    const str = stat.value
    const newStat = stat.clone()
    newStat.value = computeBranchFormulaValue(str, helper)
    return newStat
  })
}

export {
  computeBranchFormulaValue as computeBranchValue,
  computedBranchHelper,
  computeBranchValueProps,
  computedBranchStats,
}
export type { ComputedBranchHelperResult }

/** Numeric results, including registlet bonuses, without display overrides or styling. */
export function computeBranchValueResults(
  helper: ComputedBranchHelperResult,
  props: ReadonlyMap<string, string>,
  keys: readonly string[]
): Record<string, SkillBranchResult> {
  const results: Record<string, SkillBranchResult> = {}
  keys.forEach(key => {
    const origin = props.get(key)
    const result = SkillBranchResult.create(
      ResultContainerTypes.Number,
      helper.branchItem,
      key,
      origin ?? '0',
      origin === undefined ? '0' : computeBranchFormulaValue(origin, helper)
    )
    if (origin === undefined) {
      result.markEmpty()
    } else {
      attachRegistletFormulaResult(result, {
        branchItem: helper.branchItem,
        properties: helper.props,
        variables: helper.registletVariables,
        compute: formula => computeBranchFormulaValue(formula, helper),
      })
    }
    results[key] = result
  })
  return results
}

export function computeBranchStatResults(
  helper: ComputedBranchHelperResult,
  stats: StatComputed[]
): SkillBranchStatResult[] {
  return computedBranchStats(helper, stats).map((stat, index) => {
    const result = SkillBranchStatResult.createForStat(helper.branchItem, stats[index], stat)
    attachRegistletFormulaResult(result, {
      branchItem: helper.branchItem,
      properties: helper.props,
      variables: helper.registletVariables,
      compute: formula => computeBranchFormulaValue(formula, helper),
    })
    attachStatConditionFormula(result, helper.branchItem, helper.props)
    return result
  })
}
