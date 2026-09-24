import Grimoire from '@/shared/Grimoire'
import { numberToFixed } from '@/shared/utils/number'
import { isNumberString, trimFloatStringZero } from '@/shared/utils/string'

import { StatComputed } from '@/lib/Character/Stat'
import {
  type OptionsPropertyMap as HandleBranchLangPropsMap,
  createNumberPropertyResult,
  createStringPropertyResult,
  handleOptionsProperties,
} from '@/lib/Skill/Properties'
import {
  FormulaDisplayModes,
  type SkillBranchItemBaseChilds,
  type SkillBranchItemOverwriteRecords,
  SkillBranchResult,
  type SkillBranchResultBase,
  type SkillBranchResultSource,
  SkillComputingContainer,
  SkillEffectItemHistory,
} from '@/lib/Skill/SkillComputing'
import {
  collectBranchFormulaValues,
  computeBranchValue,
  computeBranchValueResults,
  computedBranchHelper,
} from '@/lib/Skill/SkillComputing'

import {
  type HandleBranchTextPropsMap,
  type HandleBranchValuePropsMap,
  handleBranchStats,
  handleBranchTextProps,
  handleBranchValueProps,
} from '../../compute'
import DisplayDataContainer from './DisplayDataContainer'
import { handleFunctionHighlight, numberStringToPercentage } from './utils'

function cloneBranchProps(
  branchItem: SkillBranchItemBaseChilds,
  initValueMap?: Record<string, string | ((value: string) => string)>
): Map<string, string> {
  const props = new Map(branchItem.allProps)
  if (typeof initValueMap === 'object') {
    Object.entries(initValueMap).forEach(([key, value]) => {
      if (typeof value === 'function') {
        props.set(key, value(props.get(key) || ''))
      } else if (!props.has(key)) {
        props.set(key, value)
      }
    })
  }
  return props
}

type HandleDisplayDataOptionFilterValidation = (value: string) => boolean
interface HandleDisplayDataOptionFilterItem {
  validation: HandleDisplayDataOptionFilterValidation
  source: 'raw' | 'computed'
}
interface HandleDisplayDataOptionFilters {
  [key: string]: HandleDisplayDataOptionFilterValidation | HandleDisplayDataOptionFilterItem
}
interface HandleDisplayDataOptions {
  values?: HandleBranchValuePropsMap
  texts?: HandleBranchTextPropsMap
  langs?: HandleBranchLangPropsMap
  filters?: HandleDisplayDataOptionFilters
  pureValues?: readonly string[]
  pureDatas?: readonly string[]
  titles?: readonly string[]
  formulaDisplayMode?: FormulaDisplayModes
  sources?: Readonly<Record<string, readonly SkillBranchResultSource[]>>
}

type SkillDisplayData = Map<string, string>

const FORMULA_VALUE_TO_PERCENTAGE_PATTERN = /([$_a-zA-Z][$_a-zA-Z0-9]*)\*(\d\.\d+)/g
const MUL_PATTERN = /\*/g
const FORMULA_FLOAT_TO_FIXED = /(\d+\.)(\d{4,})/g

function handleDisplayData<Branch extends SkillBranchItemBaseChilds>(
  computing: SkillComputingContainer,
  branchItem: Branch,
  sourceProps: ReadonlyMap<string, string>,
  options: HandleDisplayDataOptions
): DisplayDataContainer<Branch> {
  const { t } = Grimoire.i18n
  const props = new Map(sourceProps)
  const values = { ...options.values }
  const texts = { ...options.texts }
  const langs = { ...options.langs }
  const filters = options.filters ?? {}
  const pureValues = [...(options.pureValues ?? [])]
  const pureDatas = [...(options.pureDatas ?? [])]
  const titles = [...(options.titles ?? [])]

  let helper = computedBranchHelper(
    computing,
    branchItem,
    collectBranchFormulaValues(branchItem, props),
    options.formulaDisplayMode,
    props
  )

  const formulaDisplayMode = helper.formulaDisplayMode
  const computedValues = computeBranchValueResults(helper, props, Object.keys(values))
  const formulaKeys = [
    ...pureValues,
    ...Object.keys(langs).filter(key => langs[key]?.type === 'value'),
  ]
  formulaKeys.forEach(key => {
    if (computedValues[key]) {
      return
    }
    const origin = props.get(key) || '0'
    computedValues[key] = createNumberPropertyResult(helper, key, origin)
  })
  const applySource = (result: SkillBranchResultBase) => {
    const sources = options.sources?.[result.key]
    if (sources) {
      result.setSources(sources)
    }
  }
  Object.values(computedValues).forEach(applySource)

  const ignoreProp = (key: string) => {
    delete values[key]
    delete langs[key]
    delete texts[key]
    const idxTitle = titles.indexOf(key)
    if (idxTitle > -1) {
      titles.splice(idxTitle, 1)
    }
    const idxPureValues = pureValues.indexOf(key)
    if (idxPureValues > -1) {
      pureValues.splice(idxPureValues, 1)
    }
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (!props.has(key)) {
      ignoreProp(key)
      return
    }
    const propValue = props.get(key)!
    if (typeof value === 'function') {
      value = { validation: value, source: 'raw' }
    }
    const { validation, source } = value
    const validatedValue = source === 'computed' ? computeBranchValue(propValue, helper) : propValue
    if (!validation(validatedValue)) {
      props.delete(key)
      ignoreProp(key)
    }
  })

  const handleAsTextLangKeys: string[] = []
  Object.entries(langs).forEach(([key, langOptions]) => {
    if (langOptions?.handleAsText) {
      handleAsTextLangKeys.push(key)
    }
  })
  const langDatas = handleOptionsProperties(helper, props, langs)
  handleAsTextLangKeys.forEach(key => {
    const result = langDatas[key]
    if (!result) {
      return
    }
    props.set(key, result.result)
    texts[key] = null
    delete langDatas[key]
  })
  if (handleAsTextLangKeys.length > 0) {
    helper = computedBranchHelper(
      computing,
      branchItem,
      collectBranchFormulaValues(branchItem, props),
      formulaDisplayMode,
      props
    )
  }

  const valueContainers = handleBranchValueProps(helper, props, values, computedValues)
  const textContainers = handleBranchTextProps(helper, props, texts)
  const statContainers = handleBranchStats(helper, branchItem.stats)

  const titlesResult: SkillDisplayData = new Map()

  const handleContainerFormulaValue = (container: SkillBranchResultBase) => {
    container.handle(value => {
      return value
        .replace(
          FORMULA_VALUE_TO_PERCENTAGE_PATTERN,
          (_match, p1, p2) => p1 + '*' + numberStringToPercentage(p2)
        )
        .replace(MUL_PATTERN, '×')
    })
    container.handle(value =>
      value.replace(FORMULA_FLOAT_TO_FIXED, (_match, m1, m2) => m1 + m2.slice(0, 4))
    )
    container.handle(trimFloatStringZero)
  }

  const branchRecordKeys = ['overwrite', 'append', 'remove'] as const

  const handlePropHistoryHighlight =
    branchItem.parent instanceof SkillEffectItemHistory
      ? (targetResult: SkillBranchResult) => {
          const searchKeys = branchRecordKeys
          const check = targetResult.sources.some(({ branch, key }) =>
            searchKeys.some(
              searchKey =>
                branch.record.props[searchKey].includes(key) ||
                branch.historyRecord?.props[searchKey].includes(key)
            )
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
      : (_stat: StatComputed, value: string) => value

  Object.values(valueContainers).forEach(container => {
    handleContainerFormulaValue(container)
    container.handleDisplay(str => handleFunctionHighlight(str))
    handlePropHistoryHighlight(container)
  })

  Object.values(textContainers).forEach(container => {
    applySource(container)
    handleContainerFormulaValue(container)

    container.containers.forEach(ctner => {
      handlePropHistoryHighlight(ctner)
      ctner.handleDisplay(str => handleFunctionHighlight(str))
    })
  })

  Object.values(langDatas).forEach(container => {
    applySource(container)
    handlePropHistoryHighlight(container)
  })

  statContainers.forEach(container => {
    handleContainerFormulaValue(container)
    container.handle(value => {
      if (isNumberString(value)) {
        return numberToFixed(parseFloat(value), 2).toString()
      }
      return value
    })
    container.handle(value => handleStatHistoryHighlight(container.stat, value))
    container.handleDisplay(value => handleFunctionHighlight(value))

    const sign = isNumberString(container.value) && parseFloat(container.value) < 0 ? '' : '+'
    const showData = container.stat.getShowData()
    const title = container.displayTitle ?? showData.title
    container.storeStatResultData({ title, sign })
  })

  titles.forEach(key => {
    titlesResult.set(key, t(`skill-query.branch.${branchItem.name}.${key}: title`))
  })

  const containers = new Map([
    ...Object.entries(valueContainers),
    ...Object.entries(textContainers),
    ...Object.entries(langDatas),
  ] as [string, SkillBranchResult][])

  pureValues.forEach(key => {
    const container = computedValues[key].clone()

    if (formulaDisplayMode === FormulaDisplayModes.OriginalFormula) {
      handleContainerFormulaValue(container)
    }

    container.handleDisplay(str => handleFunctionHighlight(str))

    applySource(container)
    handlePropHistoryHighlight(container)
    containers.set(key, container)
  })

  pureDatas.forEach(key => {
    if (!props.has(key)) {
      return
    }
    const value = props.get(key)!
    const container = createStringPropertyResult(branchItem, key, value)
    applySource(container)
    handlePropHistoryHighlight(container)
    containers.set(key, container)
  })

  return new DisplayDataContainer({
    branchItem,
    containers,
    titles: titlesResult,
    statContainers: statContainers,
    computedValues: new Map(Object.entries(computedValues)),
  })
}

export { cloneBranchProps, handleDisplayData }
export type { HandleDisplayDataOptionFilters, HandleBranchLangPropsMap, SkillDisplayData }
