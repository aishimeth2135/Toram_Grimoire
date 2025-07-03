import {
  SkillBranchItem,
  type SkillBranchItemBaseChilds,
  SkillBranchItemSuffix,
  SkillComputingContainer,
} from '.'

import Grimoire from '@/shared/Grimoire'
import {
  type HandleFormulaMethods,
  type HandleFormulaTexts,
  type HandleFormulaVars,
  computeFormula,
  handleFormula,
} from '@/shared/utils/data'
import { toIndex, toInt } from '@/shared/utils/number'
import { isNumberString, splitComma } from '@/shared/utils/string'

import { StatComputed } from '@/lib/Character/Stat'
import type { ResultContainerDisplayOptions } from '@/lib/common/ResultContainer'
import { ResultContainerTypes } from '@/lib/common/ResultContainer'

import { SkillBranchNames } from '../Skill'
import {
  SkillBranchResult,
  SkillBranchStatResult,
  SkillBranchTextResult,
  type SkillBranchTextResultParseResult,
} from './SkillBranchResult'
import { FormulaDisplayModes } from './enums'

function computeBranchValue(str: string, helper: ComputedBranchHelperResult): string {
  const { vars, texts, methods, handleFormulaExtra } = helper
  if (typeof str !== 'string') {
    console.warn('[computeBranchValue] unexpected value: ' + str, helper)
    return '0'
  }
  str = str
    // convert "A,,B" to "(A)+(B)"
    .split(/\s*,,\s*/)
    .map(part => `(${part})`)
    .join('+')
    // convert "stack+A" to "stack[0]+A"
    .replace(/stack(?!\[)/g, 'stack[0]')
    .replace(/RLv(?!\[)/g, 'RLv[0]')

  str = handleFormulaExtra(str)
  return handleFormula(str, { vars, texts, methods }) as string
}

function handleDisplayValue(
  container: SkillBranchResult,
  helper: ComputedBranchHelperResult
): void {
  if (helper.branchItem.hasProp(container.key, 'display')) {
    const displayValue = computeBranchValue(
      helper.branchItem.prop(container.key, 'display'),
      helper
    )
    container.initDisplayValue(displayValue)
  }
}

function handleRegistletValue(
  container: SkillBranchResult,
  helper: ComputedBranchHelperResult
): void {
  const bch = helper.branchItem
  if (bch.hasProp(container.key, 'registlet')) {
    const originalValue = bch.prop(container.key, 'registlet')
    if (helper.checkRegistletLevel(originalValue)) {
      const value = computeBranchValue(originalValue, helper)
      const subContainer = new SkillBranchResult(
        ResultContainerTypes.Number,
        bch,
        bch.propKey(container.key, 'registlet'),
        originalValue,
        value
      )
      container.subContainers.registlet = subContainer
    }
  }
}

function handleHighlight(container: SkillBranchResult) {
  const originalFormula = container.origin
  const className =
    isNumberString(container.value) && parseFloat(container.value) < 0
      ? originalFormula.includes('stack')
        ? 'text-cyan-60'
        : 'text-gray'
      : originalFormula.includes('stack')
        ? 'text-blue-60'
        : 'text-primary-50'
  container.mergeDisplayOptions({ classNames: [className] })
}

/**
 * generated from `computedBranchHelper()`
 */
interface ComputedBranchHelperResult {
  vars: HandleFormulaVars
  texts: HandleFormulaTexts
  methods: HandleFormulaMethods
  branchItem: SkillBranchItemBaseChilds
  handleFormulaExtra: (formula: string) => string
  formulaDisplayMode: FormulaDisplayModes
  checkRegistletLevel: (value: string) => boolean
}
const HANDLE_FORMULA_EXTRA_PATTERN_1 = /&(\d+):/g
const HANDLE_FORMULA_EXTRA_PATTERN_2 = /extra\[(\d+)\]/g
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
  formulaDisplayMode?: FormulaDisplayModes
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
    Object.assign(extendsDatas.vars, data.vars)
    Object.assign(extendsDatas.texts, data.texts)
    if (data.methods) {
      Object.assign(extendsDatas.methods, data.methods)
    }
  })

  const RLv: number[] =
    computing.varGetters.registletLevel?.(branchItem.default.parent.parent) ?? []
  const hasRLv = RLv.length > 0 && RLv.some(item => item > 0)

  const STACK_ACCESS_PATTERN = /stack\[(\d+)\]/g
  const RLV_ACCESS_PATTERN = /RLv\[(\d+)\]/g

  const checkRegistletLevel = (str: string) => {
    if (/RLv(?!\[)/.test(str)) {
      return RLv[0] > 0
    }
    const match = str.match(RLV_ACCESS_PATTERN)
    if (match) {
      return RLv[toIndex(match[1])] > 0
    }
    return true
  }

  if (formulaDisplayMode === FormulaDisplayModes.OriginalFormula) {
    const { t } = Grimoire.i18n

    const stack: string[] = []
    let RLvLength = 1

    if (stackIds.length > 0) {
      const stackStates = branchItem.parent.stackStates
      const stackNames = stackIds.map((id, idx) => {
        const item = stackStates.find(state => state.stackId === id)
        let name = item ? item.branch.prop('name') : 'auto'
        if (name === 'auto') {
          name = `${t('skill-query.branch.stack.base-name')}${idx + 1}`
        }
        return name
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
      if (!hasRLv) {
        const rlvMatches = Array.from(value.matchAll(RLV_ACCESS_PATTERN))
        rlvMatches.forEach(match => {
          const idxValue = toIndex(match[1])
          if (RLvLength < idxValue) {
            RLvLength = idxValue
          }
        })
      }
    })

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
      const stackStates = branchItem.parent.stackStates
      const stackValues = stackIds.map(id => {
        const item = stackStates.find(state => state.stackId === id)
        if (!item) {
          return 0
        }
        if (!computeFormulaExtraValue || !item.branch.hasProp('value')) {
          return item.value
        }
        return computeFormulaExtraValue(item.branch.prop('value')) ?? item.value
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
      if (!hasRLv) {
        const rlvMatches = Array.from(value.matchAll(RLV_ACCESS_PATTERN))
        rlvMatches.forEach(match => {
          const idxValue = toIndex(match[1])
          if (RLv[idxValue] === undefined) {
            RLv[idxValue] = 0
          }
        })
      }
    })

    if (stack.length === 0) {
      stack.push(0)
    }
    if (RLv.length === 0) {
      RLv.push(0)
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
    extraTexts = splitComma(formulaExtra.prop('texts'))
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
    const props = {
      max: formulaExtra.hasProp('values', index, 'max')
        ? (computeFormula(formulaExtra.prop('values', index, 'max'), vars, 0) as number)
        : null,
      min: formulaExtra.hasProp('values', index, 'min')
        ? (computeFormula(formulaExtra.prop('values', index, 'min'), vars, 0) as number)
        : null,
    }
    return getFormulaExtraValue?.(mainBranchItem, extraTexts[idx], props)?.toString() ?? null
  }

  const handleFormulaExtra = !formulaExtra
    ? (str: string) => {
        return str
          .replace(HANDLE_FORMULA_EXTRA_PATTERN_1, (_match, p1) => getTextKey(p1))
          .replace(HANDLE_FORMULA_EXTRA_PATTERN_2, (_match, p1) => getTextKey(p1))
      }
    : (str: string) => {
        return str
          .replace(HANDLE_FORMULA_EXTRA_PATTERN_1, (_match, p1) => getValue(p1) ?? getTextKey(p1))
          .replace(HANDLE_FORMULA_EXTRA_PATTERN_2, (_match, p1) => getValue(p1) ?? getTextKey(p1))
      }

  return {
    vars,
    texts,
    methods: extendsDatas.methods,
    handleFormulaExtra,
    branchItem,
    formulaDisplayMode,
    checkRegistletLevel,
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

    propValues.set(propKey, computeBranchValue(str, helper))
  })

  return propValues
}

interface HandleBranchValueOptions extends ResultContainerDisplayOptions {
  toPersentage?: boolean
}
interface HandleBranchValuePropsMap {
  [key: string]: HandleBranchValueOptions | string | null
}
type HandleBranchValuePropsResult<PropMap extends HandleBranchValuePropsMap> = {
  [key in keyof PropMap]: SkillBranchResult
}
function handleBranchValueProps<PropMap extends HandleBranchValuePropsMap>(
  helper: ComputedBranchHelperResult,
  props: Map<string, string>,
  propMap: PropMap
): HandleBranchValuePropsResult<PropMap> {
  const propKeys = Object.keys(propMap) as (keyof PropMap)[]
  const propValues = computeBranchValueProps(helper, props, propKeys as string[]) as Map<
    keyof PropMap,
    string
  >
  const propResult = {} as HandleBranchValuePropsResult<PropMap>
  propKeys.forEach(propKey => {
    const originalFormula = props.get(propKey as string)
    if (originalFormula === undefined) {
      propResult[propKey] = new SkillBranchResult(
        ResultContainerTypes.Number,
        helper.branchItem,
        propKey as string,
        '0',
        '0'
      )
      return
    }
    const container = new SkillBranchResult(
      ResultContainerTypes.Number,
      helper.branchItem,
      propKey as string,
      originalFormula,
      propValues.get(propKey)!
    )
    const options = container.normalizeDisplayOptions<HandleBranchValueOptions>(propMap[propKey])
    if (options?.toPersentage) {
      container.handle(value => {
        if (isNumberString(value)) {
          return (parseFloat(value) * 100).toString()
        }
        return value
      })
      options.unit = '%'
    }
    container.mergeDisplayOptions(options)

    handleDisplayValue(container, helper)
    handleRegistletValue(container, helper)
    handleHighlight(container)

    propResult[propKey] = container
  })

  return propResult
}

interface HandleBranchTextPropsMap {
  [key: string]: null
}
type HandleBranchTextPropsResult<PropMap extends HandleBranchTextPropsMap> = {
  [key in keyof PropMap]: SkillBranchTextResult
}
function computedBranchText(
  helper: ComputedBranchHelperResult,
  propKey: string,
  propValue: string | undefined
) {
  const textStr = propValue
  if (textStr === undefined) {
    const _parseResult = {
      containers: [],
      parts: ['0'],
    } as SkillBranchTextResultParseResult
    return new SkillBranchTextResult(helper.branchItem, propKey as string, '0', '0', _parseResult)
  }
  const parseResult = SkillBranchTextResult.parse(helper.branchItem, propKey, textStr, value =>
    computeBranchValue(value, helper)
  )
  return new SkillBranchTextResult(
    helper.branchItem,
    propKey as string,
    textStr,
    textStr,
    parseResult
  )
}
function handleBranchTextProps<PropMap extends HandleBranchTextPropsMap>(
  helper: ComputedBranchHelperResult,
  props: Map<string, string>,
  propMap: PropMap
): HandleBranchTextPropsResult<PropMap> {
  const propKeys = Object.keys(propMap) as (keyof PropMap)[]
  const propResult = {} as HandleBranchTextPropsResult<PropMap>
  propKeys.forEach(propKey => {
    const container = computedBranchText(helper, propKey as string, props.get(propKey as string))
    container.containers.forEach(ctner => handleHighlight(ctner))
    propResult[propKey] = container
  })

  return propResult
}

function computedBranchStats(
  helper: ComputedBranchHelperResult,
  stats: StatComputed[]
): StatComputed[] {
  return stats.map(stat => {
    const str = stat.value
    const newStat = stat.clone()
    newStat.value = computeBranchValue(str, helper)
    return newStat
  })
}

function handleBranchStats(
  helper: ComputedBranchHelperResult,
  stats: StatComputed[]
): SkillBranchStatResult[] {
  const newStats = computedBranchStats(helper, stats)
  return newStats.map(stat => {
    const originalStat = stats.find(_stat => _stat.equals(stat)) as StatComputed
    const container = new SkillBranchStatResult(helper.branchItem, originalStat, stat)
    handleDisplayValue(container, helper)
    handleRegistletValue(container, helper)

    const displayTitleKey = helper.branchItem.propKey(container.key, 'displayTitle')
    if (helper.branchItem.hasProp(displayTitleKey)) {
      const displayTitleContainer = computedBranchText(
        helper,
        displayTitleKey,
        helper.branchItem.prop(displayTitleKey)
      )
      displayTitleContainer.containers.forEach(ctner => handleHighlight(ctner))
      container.setDisplayTitle(displayTitleContainer)
    }
    const conditionValueKey = helper.branchItem.propKey(container.key, 'conditionValue')
    if (helper.branchItem.hasProp(conditionValueKey)) {
      container.setConditionValue(helper.branchItem.prop(conditionValueKey))
    }

    const showData = stat.getShowData()
    container.mergeDisplayOptions(container.normalizeDisplayOptions(showData.tail))

    handleHighlight(container)

    return container
  })
}

export {
  computeBranchValue,
  computedBranchHelper,
  computeBranchValueProps,
  handleBranchValueProps,
  handleBranchTextProps,
  computedBranchStats,
  handleBranchStats,
}
export type { HandleBranchValuePropsMap, HandleBranchTextPropsMap, ComputedBranchHelperResult }
