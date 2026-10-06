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
import { getFormulaReplacedTexts, mergeFormulaExtendedData } from './FormulaExtended'
import {
  type RegistletFormulaVariables,
  attachRegistletFormulaResult,
  attachStatConditionFormula,
  getRegistletFormulaLevelCount,
  initializeRegistletFormulaLevels,
} from './FormulaSpecial'
import { parseFormulaListProperty, parseListProperty } from './List'

function computeBranchFormulaValue(str: string, helper: BranchFormulaContext): string {
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
interface BranchFormulaContext {
  vars: HandleFormulaVars
  texts: HandleFormulaTexts
  methods: HandleFormulaMethods
  handleFormulaExtra: (formula: string) => string
}

interface ComputedBranchHelperResult extends BranchFormulaContext {
  branchItem: SkillBranchItemBaseChilds
  props: ReadonlyMap<string, string>
  originalFormula: BranchFormulaContext
  showOriginalFormula: boolean
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
  const { t } = Grimoire.i18n
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

  const stack: number[] = []
  const stackNames: string[] = []
  const defaultStackName = t('skill-query.branch.stack.base-name')
  stackIds.forEach((id, idx) => {
    const stackBranch = branchItem.parent.branchItems.find(item => item.stackId === id)
    stackNames[idx] = stackBranch
      ? resolveStackName(stackBranch, defaultStackName)
      : `${defaultStackName}${idx + 1}`
    const stackState = stackBranch && computing.config.getStackState?.(stackBranch)
    stack[idx] = stackState
      ? ((stackBranch.hasProp('value')
          ? computing.config.computeFormulaExtraValue?.(stackBranch.prop('value'))
          : undefined) ?? stackState.value)
      : 0
  })

  values.forEach(value => {
    for (const match of value.matchAll(STACK_ACCESS_PATTERN)) {
      const idx = toIndex(match[1])
      stack[idx] ??= 0
      stackNames[idx] ??= `${defaultStackName}${idx + 1}`
    }
  })
  stack[0] ??= 0
  stackNames[0] ??= `${defaultStackName}1`
  initializeRegistletFormulaLevels(RLv, values)
  RLv[0] ??= 0

  const vars: HandleFormulaVars = {
    ...extendsDatas.vars,
    SLv: computing.varGetters.skillLevel?.(branchItem.default.parent.parent) ?? 0,
    CLv: computing.varGetters.characterLevel?.() ?? 0,
    stack,
    RLv,
  }
  const texts: HandleFormulaTexts = { ...extendsDatas.texts }
  const originalTexts: HandleFormulaTexts = {
    SLv: t('skill-query.skill-level'),
    CLv: t('skill-query.character-level'),
    RLv: Array(getRegistletFormulaLevelCount(values)).fill(
      t('skill-query.registlet-level-abbreviation')
    ),
    stack: stackNames,
    ...getFormulaReplacedTexts(),
    ...extendsDatas.texts,
  }

  const getTextKey = (idx: number) => `__FORMULA_EXTRA_TEXT_${idx.toString()}__`

  let mainBranchItem: SkillBranchItem
  if (branchItem instanceof SkillBranchItemSuffix) {
    mainBranchItem = branchItem.mainBranch
  } else {
    mainBranchItem = branchItem
  }

  const formulaExtra =
    mainBranchItem.suffixBranches.find(suf => suf.isA(SkillBranchNames.FormulaExtra)) ?? null

  let extraTexts: string[] = []
  if (formulaExtra) {
    extraTexts = parseListProperty(formulaExtra.prop('texts'))
    extraTexts.forEach((text, idx) => {
      const key = getTextKey(idx)
      texts[key] = text
      originalTexts[key] = text
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

  const extraValues = new Map<string, string | null>()
  const handleFormulaExtra = (str: string) => {
    return str.replace(HANDLE_FORMULA_EXTRA_PATTERN, (_match, index: string) => {
      if (!extraValues.has(index)) {
        extraValues.set(index, getValue(index))
      }
      return extraValues.get(index) ?? getTextKey(toIndex(index))
    })
  }

  const handleOriginalFormulaExtra = (str: string) => {
    return str.replace(HANDLE_FORMULA_EXTRA_PATTERN, (_match, index: string) => {
      const key = getTextKey(toIndex(index))
      originalTexts[key] ||= `extra[${index}]`
      return key
    })
  }

  return {
    vars,
    texts,
    methods: extendsDatas.methods,
    handleFormulaExtra,
    branchItem,
    props,
    originalFormula: {
      vars: { ...extendsDatas.vars },
      texts: originalTexts,
      methods: extendsDatas.methods,
      handleFormulaExtra: handleOriginalFormulaExtra,
    },
    showOriginalFormula:
      (formulaDisplayMode ?? computing.config.formulaDisplayMode) ===
      FormulaDisplayModes.OriginalFormula,
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

export function computeBranchOriginalFormula(
  formula: string,
  helper: ComputedBranchHelperResult
): string {
  return computeBranchFormulaValue(formula, helper.originalFormula)
}

export function initializeBranchFormulaResult(
  result: SkillBranchResult,
  helper: ComputedBranchHelperResult
): void {
  result.initOriginalFormula(
    computeBranchOriginalFormula(result.origin, helper),
    helper.showOriginalFormula
  )
}

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
      initializeBranchFormulaResult(result, helper)
      attachRegistletFormulaResult(result, {
        branchItem: helper.branchItem,
        properties: helper.props,
        variables: helper.registletVariables,
        compute: formula => computeBranchFormulaValue(formula, helper),
        initializeResult: registlet => initializeBranchFormulaResult(registlet, helper),
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
    initializeBranchFormulaResult(result, helper)
    attachRegistletFormulaResult(result, {
      branchItem: helper.branchItem,
      properties: helper.props,
      variables: helper.registletVariables,
      compute: formula => computeBranchFormulaValue(formula, helper),
      initializeResult: registlet => initializeBranchFormulaResult(registlet, helper),
    })
    attachStatConditionFormula(result, helper.branchItem, helper.props)
    return result
  })
}
