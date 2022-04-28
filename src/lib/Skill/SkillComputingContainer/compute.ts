import { handleFormula, HandleFormulaMethods, HandleFormulaTexts, HandleFormulaVars } from '@/shared/utils/data'
import { isNumberString } from '@/shared/utils/string'
import Grimoire from '@/shared/Grimoire'

import { StatComputed } from '@/lib/Character/Stat'

import { SkillBranchItem, SkillBranchItemBaseChilds, SkillBranchItemSuffix } from '.'
import { ResultContainerBase, ResultContainer, ResultContainerStat, TextResultContainer, TextResultContainerParseResult } from './ResultContainer'
import { FormulaDisplayModes } from './enums'
import { SkillBranchNames } from '../Skill/enums'

function computeBranchValue(str: string, helper: ComputedBranchHelperResult): string {
  const {
    vars,
    texts,
    methods,
    handleFormulaExtra,
  } = helper
  if (typeof str !== 'string') {
    console.warn('[computeBranchValue] unexpected value: ' + str, helper)
    return '0'
  }
  str = str
    // convert "A,,B" to "(A)+(B)"
    .split(/\s*,,\s*/).map(part => `(${part})`).join('+')
    // convert "stack+A" to "stack[0]+A"
    .replace(/stack(?!\[)/g, 'stack[0]')

  str = handleFormulaExtra(str)
  return handleFormula(str, { vars, texts, methods }) as string
}

function handleDisplayValue(container: ResultContainer, helper: ComputedBranchHelperResult): void {
  if (helper.branchItem.hasProp(container.key, 'display')) {
    const displayValue = computeBranchValue(helper.branchItem.prop(container.key, 'display'), helper)
    container.initDisplayValue(displayValue)
  }
}

interface HighlightTextOptionsDetail {
  beforeHighlight?: (current: string) => string | string;
}
type HighlightTextOptions = string | HighlightTextOptionsDetail
function handleHighlight(container: ResultContainerBase, options: HighlightTextOptions = {}) {
  if (typeof options === 'string') {
    const unit = options
    options = {
      beforeHighlight: value => value + unit,
    }
  }
  let { beforeHighlight } = options
  if (typeof beforeHighlight === 'string') {
    const unit = beforeHighlight
    beforeHighlight = value => value + unit
  }
  container.handle(value => !isNumberString(value) ? `<span class="cy--text-separate">${value}</span>` : value)
  if (beforeHighlight) {
    container.handle(beforeHighlight)
  }
  const originalFormula = container.origin
  const className = isNumberString(container.value) && parseFloat(container.value) < 0 ?
    (originalFormula.includes('stack') ? 'result-value--stack value-dark' : 'text-gray') :
    (originalFormula.includes('stack') ? 'result-value--stack' : 'text-light-3')
  container.handle((value, suffix) => `<span class="${className}">${value + suffix}</span>`)
}

interface ComputedBranchHelperResult {
  vars: HandleFormulaVars;
  texts: HandleFormulaTexts;
  methods: HandleFormulaMethods;
  branchItem: SkillBranchItemBaseChilds;
  handleFormulaExtra: (formula: string) => string;
  formulaDisplayMode: FormulaDisplayModes;
}
const HANDLE_FORMULA_EXTRA_PATTERN_1 = /&(\d+):/g
const HANDLE_FORMULA_EXTRA_PATTERN_2 = /extra\[(\d+)\]/g
/**
 * Create data contains vars and texts of branchItem to compute formula.
 * @param branchItem
 * @param values - it will check value of every values whether it contains "stack[n]", and ensure stack[n] is not undefined
 * @param [formulaDisplayMode] - formula display mode, default value is from ComoutingContainer.config
 * @returns data using for compute
 */
function computedBranchHelper(branchItem: SkillBranchItemBaseChilds, values: string[] = [], formulaDisplayMode?: FormulaDisplayModes): ComputedBranchHelperResult {
  let vars: HandleFormulaVars
  let texts: HandleFormulaTexts

  formulaDisplayMode = formulaDisplayMode ?? branchItem.parent.parent.parent.config.formulaDisplayMode

  const branchItemStack: SkillBranchItem = branchItem instanceof SkillBranchItemSuffix ? branchItem.mainBranch : branchItem
  const stackIds = branchItemStack.linkedStackIds

  const handleFormulaExtends = branchItem.belongContainer.handleFormulaExtends
  const extendsDatas = {
    vars: { ...handleFormulaExtends.vars },
    texts: { ...handleFormulaExtends.texts },
    methods: {
      getSkillLevel: () => 0,
    },
  }
  branchItem.belongContainer.handleFormulaDynamicExtends.forEach(getter => {
    const data = getter()
    Object.assign(extendsDatas.vars, data.vars)
    Object.assign(extendsDatas.texts, data.texts)
    if (data.methods) {
      Object.assign(extendsDatas.methods, data.methods)
    }
  })

  if (formulaDisplayMode === FormulaDisplayModes.OriginalFormula) {
    const stack: string[] = []
    const { t } = Grimoire.i18n

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
      const stackMatches = Array.from(value.matchAll(/stack\[(\d+)\]/g))
      stackMatches.forEach(match => {
        const idxValue = parseInt(match[1], 10)
        if (stack[idxValue] === undefined) {
          stack[idxValue] = `${t('skill-query.branch.stack.base-name')}${idxValue + 1}`
        }
      })
    })

    vars = {
      ...extendsDatas.vars,
    } as HandleFormulaVars
    texts = {
      'SLv': t('skill-query.skill-level'),
      'CLv': t('skill-query.character-level'),
      'stack': stack,
      ...extendsDatas.texts,
    } as HandleFormulaTexts
  } else {
    const stack: number[] = []

    if (stackIds.length > 0) {
      const getFormulaExtraValue = branchItem.belongContainer.config.getFormulaExtraValue
      const stackStates = branchItem.parent.stackStates
      const stackValues = stackIds.map(id => {
        const item = stackStates.find(state => state.stackId === id)
        if (!item) {
          return 0
        }
        if (!getFormulaExtraValue || !item.branch.hasProp('value')) {
          return item.value
        }
        return getFormulaExtraValue(item.branch.prop('value')) ?? item.value
      })
      stack.push(...stackValues)
    }

    const STACK_ITEM_PATTERN = /stack\[(\d+)\]/g
    values.forEach(value => {
      const stackMatches = Array.from(value.matchAll(STACK_ITEM_PATTERN))
      stackMatches.forEach(match => {
        const idxValue = parseInt(match[1], 10)
        if (stack[idxValue] === undefined) {
          stack[idxValue] = 0
        }
      })
    })

    if (stack.length === 0) {
      stack.push(0)
    }

    vars = {
      ...extendsDatas.vars,
      'SLv': branchItem.belongContainer.varGetters.skillLevel?.(branchItem.default.parent.parent) ?? branchItem.belongContainer.vars.skillLevel,
      'CLv': branchItem.belongContainer.varGetters.characterLevel?.() ?? branchItem.belongContainer.vars.characterLevel,
      'stack': stack,
    } as HandleFormulaVars
    texts = {
      ...extendsDatas.texts,
    } as HandleFormulaTexts
  }

  const getTextKey = (idx: number) => '__FORMULA_EXTRA_TEXT_' + idx.toString() + '__'

  let mainBranchItem
  if (branchItem instanceof SkillBranchItem) {
    mainBranchItem = branchItem
  } else if (branchItem instanceof SkillBranchItemSuffix) {
    mainBranchItem = branchItem.mainBranch
  }

  const formulaExtra = mainBranchItem?.suffixBranches.find(suf => suf.is(SkillBranchNames.FormulaExtra)) ?? null

  if (mainBranchItem && formulaExtra) {
    const extraTexts = (formulaExtra.prop('texts')).split(/\s*,\s*/)
    extraTexts.forEach((text, idx) => {
      const key = getTextKey(idx)
      texts[key] = text
    })
  }

  return {
    vars,
    texts,
    methods: extendsDatas.methods,
    handleFormulaExtra: (str) => {
      const getFormulaExtraValue = branchItem.belongContainer.config.getFormulaExtraValue
      if (!getFormulaExtraValue || !formulaExtra) {
        return str
          .replace(HANDLE_FORMULA_EXTRA_PATTERN_1, (match, p1) => getTextKey(p1))
          .replace(HANDLE_FORMULA_EXTRA_PATTERN_2, (match, p1) => getTextKey(p1))
      }
      const getFormula = (index: string) => formulaExtra.prop('values', index)
      return str
        .replace(HANDLE_FORMULA_EXTRA_PATTERN_1, (match, p1) => getFormulaExtraValue(getFormula(p1))?.toString() ?? getTextKey(p1))
        .replace(HANDLE_FORMULA_EXTRA_PATTERN_2, (match, p1) => getFormulaExtraValue(getFormula(p1))?.toString() ?? getTextKey(p1))
    },
    branchItem,
    formulaDisplayMode,
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
  props: Record<string, string>,
  propKeys: Key[],
): Record<Key, string> {
  const propValues = {} as Record<Key, string>
  propKeys.forEach(propKey => {
    const str = props[propKey]
    if (str === undefined) {
      propValues[propKey] = '0'
      return
    }

    propValues[propKey] = computeBranchValue(str, helper)
  })

  return propValues
}

type HandleBranchValueAttrOptions = HighlightTextOptions
interface HandleBranchValuePropsMap {
  [key: string]: HighlightTextOptions | null;
}
type HandleBranchValuePropsResult<PropMap extends HandleBranchValuePropsMap> = {
  [key in keyof PropMap]: ResultContainer;
}
function handleBranchValueProps<PropMap extends HandleBranchValuePropsMap>(
  helper: ComputedBranchHelperResult,
  props: Record<string, string>,
  PropMap: PropMap,
): HandleBranchValuePropsResult<PropMap> {
  const propKeys = Object.keys(PropMap) as (keyof PropMap)[]
  const propValues = computeBranchValueProps(helper, props, propKeys as string[]) as Record<keyof PropMap, string>
  const propResult = {} as HandleBranchValuePropsResult<PropMap>
  propKeys.forEach(propKey => {
    const originalFormula = props[propKey as string]
    if (originalFormula === undefined) {
      propResult[propKey] = new ResultContainer(helper.branchItem, propKey as string, '0', '0')
      return
    }
    const options = (PropMap[propKey] || {}) as HandleBranchValueAttrOptions
    const container = new ResultContainer(helper.branchItem, propKey as string, originalFormula, propValues[propKey])
    handleDisplayValue(container, helper)
    handleHighlight(container, options)

    propResult[propKey] = container
  })

  return propResult
}

interface HandleBranchTextPropsMap {
  [key: string]: null;
}
type HandleBranchTextPropsResult<PropMap extends HandleBranchValuePropsMap> = {
  [key in keyof PropMap]: TextResultContainer;
}
function computedBranchText(
  helper: ComputedBranchHelperResult,
  propKey: string,
  propValue: string | undefined,
) {
  const textStr = propValue
  if (textStr === undefined) {
    const _parseResult = {
      containers: [],
      parts: ['0'],
    } as TextResultContainerParseResult
    return new TextResultContainer(helper.branchItem, propKey as string, '0', '0', _parseResult)
  }
  const parseResult = TextResultContainer.parse(helper.branchItem, propKey, textStr, value => computeBranchValue(value, helper))
  return new TextResultContainer(helper.branchItem, propKey as string, textStr, textStr, parseResult)
}
function handleBranchTextProps<PropMap extends HandleBranchTextPropsMap>(
  helper: ComputedBranchHelperResult,
  props: Record<string, string>,
  PropMap: PropMap,
): HandleBranchTextPropsResult<PropMap> {
  const propKeys = Object.keys(PropMap) as (keyof PropMap)[]
  const propResult = {} as HandleBranchTextPropsResult<PropMap>
  propKeys.forEach(propKey => {
    const container = computedBranchText(helper, propKey as string, props[propKey as string])
    const options = (PropMap[propKey] || {}) as HighlightTextOptions
    handleHighlight(container, options)
    propResult[propKey] = container
  })

  return propResult
}

function computedBranchStats(helper: ComputedBranchHelperResult, stats: StatComputed[]): StatComputed[] {
  return stats.map(stat => {
    const str = stat.value
    const newStat = stat.clone()
    newStat.value = computeBranchValue(str, helper)
    return newStat
  })
}

function handleBranchStats(helper: ComputedBranchHelperResult, stats: StatComputed[]): ResultContainerStat[] {
  const newStats = computedBranchStats(helper, stats)
  return newStats.map(stat => {
    const originalStat = stats.find(_stat => _stat.equals(stat)) as StatComputed
    const container = new ResultContainerStat(helper.branchItem, originalStat, stat)
    handleDisplayValue(container, helper)

    const displayTitleKey = helper.branchItem.propKey(container.key, 'displayTitle')
    if (helper.branchItem.hasProp(displayTitleKey)) {
      const displayTitleContainer = computedBranchText(
        helper,
        displayTitleKey,
        helper.branchItem.prop(displayTitleKey),
      )
      handleHighlight(displayTitleContainer)
      container.setDisplayTitle(displayTitleContainer.result)
    }
    const conditionValueKey = helper.branchItem.propKey(container.key, 'conditionValue')
    if (helper.branchItem.hasProp(conditionValueKey)) {
      container.setConditionValue(helper.branchItem.prop(conditionValueKey))
    }

    const showData = stat.getShowData()
    handleHighlight(container, {
      beforeHighlight: value => value + showData.tail,
    })
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
