import Grimoire from '@/shared/Grimoire'
import { isNumberString, trimFloatStringZero } from '@/shared/utils/string'

import { StatComputed } from '@/lib/Character/Stat'
import { SkillBranchNames } from '@/lib/Skill/Skill'
import {
  SkillBranchResult,
  SkillBranchResultBase,
} from '@/lib/Skill/SkillComputingContainer'
import {
  SkillBranchItemBaseChilds,
  SkillBranchItemOverwriteRecords,
  SkillBranchItemSuffix,
  SkillComputingContainer,
  SkillEffectItemHistory,
} from '@/lib/Skill/SkillComputingContainer'
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputingContainer'
import {
  ComputedBranchHelperResult,
  HandleBranchTextPropsMap,
  HandleBranchValuePropsMap,
  computeBranchValue,
  computedBranchHelper,
  handleBranchStats,
  handleBranchTextProps,
  handleBranchValueProps,
} from '@/lib/Skill/SkillComputingContainer/compute'
import { ResultContainerTypes } from '@/lib/common/ResultContainer'

import DisplayDataContainer from './DisplayDataContainer'
import { handleFunctionHighlight, numberStringToPercentage } from './utils'

function cloneBranchProps(
  branchItem: SkillBranchItemBaseChilds,
  initValueMap?: Record<string, string | ((value: string) => string)>
): Map<string, string> {
  const props = new Map(branchItem.allProps)
  if (typeof initValueMap === 'object') {
    Object.entries(initValueMap).forEach(([key, value]) => {
      if (props.has(key)) {
        return
      }
      if (typeof value === 'function') {
        props.set(key, value(props.get(key) || ''))
      } else {
        props.set(key, value)
      }
    })
  }
  return props
}

interface HandleBranchLangPropsOptions {
  rootKey?: SkillBranchNames
  type?: 'auto' | 'normal' | 'value' | 'boolean'
  afterHandle?: ((value: string) => string) | null
}
interface HandleBranchLangPropsMap {
  [key: string]: HandleBranchLangPropsOptions | null
}
function handleBranchLangProps<PropMap extends HandleBranchLangPropsMap>(
  helper: ComputedBranchHelperResult,
  props: Map<string, string>,
  propMap: PropMap
): Record<keyof PropMap, SkillBranchResult> {
  const { t } = Grimoire.i18n
  const { branchItem } = helper

  const attrValues = {} as Record<keyof PropMap, SkillBranchResult>
  const attrKeys = Object.keys(propMap) as (keyof PropMap)[]
  attrKeys.forEach(attrKey => {
    const {
      type = 'auto',
      rootKey,
      afterHandle = null,
    } = (propMap[attrKey] || {}) as HandleBranchLangPropsOptions
    const value = props.get(attrKey as string)
    if (!value) {
      return
    }
    let resultStr: string
    if (type === 'value') {
      const resultValue = computeBranchValue(value, helper)
      const sign =
        isNumberString(resultValue) && parseFloat(resultValue) < 0
          ? 'negative'
          : 'positive'
      const displayValue =
        sign === 'negative' ? -1 * parseFloat(resultValue) : resultValue
      resultStr = t(
        `skill-query.branch.${rootKey ?? branchItem.name}.${String(
          attrKey
        )}.${sign}`,
        { value: displayValue.toString() }
      )
    } else {
      let displayValue = value
      if (
        (type === 'auto' || type === 'boolean') &&
        (displayValue === '1' || displayValue === '0')
      ) {
        displayValue = displayValue === '1' ? 'true' : 'false'
      }
      let preName: string
      if (rootKey) {
        preName = rootKey
      } else {
        preName = branchItem.name
        preName =
          branchItem instanceof SkillBranchItemSuffix
            ? branchItem.mainBranch.name + ': ' + preName
            : preName
      }
      const result = t(
        `skill-query.branch.${preName}.${String(attrKey)}.${displayValue}`
      )
      resultStr = afterHandle ? afterHandle(result) : result
    }
    attrValues[attrKey] = new SkillBranchResult(
      ResultContainerTypes.String,
      branchItem,
      attrKey as string,
      value,
      resultStr
    )
  })
  return attrValues
}

type HandleDisplayDataOptionFilterValidation = (value: string) => boolean
interface HandleDisplayDataOptionFilterItem {
  validation: HandleDisplayDataOptionFilterValidation
  calc?: boolean
}
interface HandleDisplayDataOptionFilters {
  [key: string]:
    | HandleDisplayDataOptionFilterValidation
    | HandleDisplayDataOptionFilterItem
}
interface HandleDisplayDataOptions {
  values?: HandleBranchValuePropsMap
  texts?: HandleBranchTextPropsMap
  langs?: HandleBranchLangPropsMap
  filters?: HandleDisplayDataOptionFilters
  pureValues?: string[]
  pureDatas?: string[]
  titles?: string[]
  formulaDisplayMode?: FormulaDisplayModes
}

type SkillDisplayData = Map<string, string>

const FORMULA_VALUE_TO_PERCENTAGE_PATTERN =
  /([$_a-zA-Z][$_a-zA-Z0-9]*)\*(\d\.\d+)/g
const MUL_PATTERN = /\*/g
const FORMULA_FLOAT_TO_FIXED = /(\d+\.)(\d{4,})/g

function handleDisplayData<Branch extends SkillBranchItemBaseChilds>(
  computing: SkillComputingContainer,
  branchItem: Branch,
  props: Map<string, string>,
  {
    values = {},
    texts = {},
    langs = {},
    filters = {},
    pureValues = [],
    pureDatas = [],
    titles = [],
    formulaDisplayMode,
  }: HandleDisplayDataOptions
): DisplayDataContainer<Branch> {
  const { t } = Grimoire.i18n

  const helper = computedBranchHelper(
    computing,
    branchItem,
    [
      ...Object.keys(values).map(key => branchItem.prop(key)),
      ...Object.keys(texts).map(key => branchItem.prop(key)),
      ...pureValues.map(key => branchItem.prop(key)),
      ...branchItem.stats.map(stat => stat.value),
    ],
    formulaDisplayMode
  )

  formulaDisplayMode = helper.formulaDisplayMode

  const ignoreProp = (key: string) => {
    delete values[key]
    delete langs[key]
    delete texts[key]
    const idxTitle = titles.indexOf(key)
    idxTitle > -1 && titles.splice(idxTitle, 1)
    const idxPureValues = pureValues.indexOf(key)
    idxPureValues > -1 && pureValues.splice(idxPureValues, 1)
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (!props.has(key)) {
      ignoreProp(key)
      return
    }
    const propValue = props.get(key)!
    if (typeof value === 'function') {
      value = { validation: value }
    }
    const { validation, calc = false } = value
    const validatedValue = calc
      ? computeBranchValue(propValue, helper)
      : propValue
    if (!validation(validatedValue)) {
      props.delete(key)
      ignoreProp(key)
    }
  })

  const valueDatas = handleBranchValueProps(helper, props, values)
  const textDatas = handleBranchTextProps(helper, props, texts)
  const langDatas = handleBranchLangProps(helper, props, langs)
  const statDatas = handleBranchStats(helper, branchItem.stats)

  const titlesResult: SkillDisplayData = new Map()

  const handleContainerFormulaValue = (container: SkillBranchResultBase) => {
    container.handle(value => {
      return value
        .replace(
          FORMULA_VALUE_TO_PERCENTAGE_PATTERN,
          (match, p1, p2) => p1 + '*' + numberStringToPercentage(p2)
        )
        .replace(MUL_PATTERN, '×')
    })
    container.handle(value =>
      value.replace(
        FORMULA_FLOAT_TO_FIXED,
        (match, m1, m2) => m1 + m2.slice(0, 4)
      )
    )
    container.handle(trimFloatStringZero)
  }

  const branchRecordKeys = ['overwrite', 'append', 'remove'] as const

  const handlePropHistoryHighlight =
    branchItem.parent instanceof SkillEffectItemHistory
      ? (targetResult: SkillBranchResult) => {
          const key = targetResult.key
          const searchKeys = branchRecordKeys
          const check = searchKeys.some(
            searchKey =>
              branchItem.record.props[searchKey].includes(key) ||
              branchItem.historyRecord?.props[searchKey].includes(key)
          )
          if (check) {
            targetResult.mergeDisplayOptions({
              classNames: ['history-compare--mark'],
            })
          }
        }
      : () => {}

  const handleStatHistoryHighlight =
    branchItem.parent instanceof SkillEffectItemHistory
      ? (stat: StatComputed, value: string) => {
          const searchKeys = branchRecordKeys
          const _find = (target: SkillBranchItemOverwriteRecords | null) =>
            searchKeys.some(searchKey =>
              target?.stats[searchKey].some(
                ([baseId, type]) => stat.baseId === baseId && stat.type === type
              )
            )
          if (_find(branchItem.record) || _find(branchItem.historyRecord)) {
            return `<span class="history-compare--mark">${value}</span>`
          }
          return value
        }
      : (stat: StatComputed, value: string) => value

  Object.values(valueDatas).forEach(container => {
    handleContainerFormulaValue(container)
    container.handleDisplay(str => handleFunctionHighlight(str))
    handlePropHistoryHighlight(container)
  })

  Object.values(textDatas).forEach(container => {
    handleContainerFormulaValue(container)

    container.containers.forEach(ctner => {
      handlePropHistoryHighlight(ctner)
      ctner.handleDisplay(str => handleFunctionHighlight(str))
    })
  })

  Object.values(langDatas).forEach(container => {
    handlePropHistoryHighlight(container)
  })

  statDatas.forEach(container => {
    handleContainerFormulaValue(container)
    container.handle(value => handleStatHistoryHighlight(container.stat, value))
    container.handleDisplay(value => handleFunctionHighlight(value))

    const sign =
      isNumberString(container.value) && parseFloat(container.value) < 0
        ? ''
        : '+'
    const showData = container.stat.getShowData()
    const title = container.displayTitle ?? showData.title
    container.storeStatResultData({ title, sign })
    // container.handle(value => title + sign + value)
  })

  titles.forEach(key => {
    titlesResult.set(
      key,
      t(`skill-query.branch.${branchItem.name}.${key}: title`)
    )
  })

  const containers = new Map([
    ...Object.entries(valueDatas),
    ...Object.entries(textDatas),
    ...Object.entries(langDatas),
  ] as [string, SkillBranchResult][])

  pureValues.forEach(key => {
    const origin = props.get(key) || '0'
    const value = computeBranchValue(origin, helper)
    const container = new SkillBranchResult(
      ResultContainerTypes.Number,
      branchItem,
      key,
      origin,
      value
    )

    if (formulaDisplayMode === FormulaDisplayModes.OriginalFormula) {
      handleContainerFormulaValue(container)
    }

    container.handleDisplay(str => handleFunctionHighlight(str))

    containers.set(key, container)
  })

  pureDatas.forEach(key => {
    if (!props.has(key)) {
      return
    }
    const value = props.get(key)!
    containers.set(
      key,
      new SkillBranchResult(
        ResultContainerTypes.String,
        branchItem,
        key,
        value,
        value
      )
    )
  })

  return new DisplayDataContainer({
    branchItem,
    containers,
    titles: titlesResult,
    statContainers: statDatas,
  })
}

export { cloneBranchProps, handleDisplayData }
export type {
  HandleDisplayDataOptionFilters,
  HandleBranchLangPropsMap,
  SkillDisplayData,
}
