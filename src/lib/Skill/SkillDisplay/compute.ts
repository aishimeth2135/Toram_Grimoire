import { isNumberString } from '@/shared/utils/string'

import type { StatComputed } from '@/lib/Character/Stat'
import {
  type ComputedBranchHelperResult,
  SkillBranchResult,
  SkillBranchStatResult,
  SkillBranchTextResult,
  type SkillBranchTextResultParseResult,
  computeBranchStatResults,
  computeBranchValue,
  computeBranchValueResults,
} from '@/lib/Skill/SkillComputing'
import type { ResultContainerDisplayOptions } from '@/lib/common/ResultContainer'

function handleDisplayValue(
  container: SkillBranchResult,
  helper: ComputedBranchHelperResult
): void {
  const formula = helper.props.get(helper.branchItem.propKey(container.key, 'display'))
  if (formula !== undefined) {
    const displayValue = computeBranchValue(formula, helper)
    container.initDisplayValue(displayValue)
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
  propMap: PropMap,
  computedResults?: Readonly<Record<string, SkillBranchResult>>
): HandleBranchValuePropsResult<PropMap> {
  const propKeys = Object.keys(propMap) as (keyof PropMap)[]
  const values = computedResults ?? computeBranchValueResults(helper, props, propKeys as string[])
  const propResult = {} as HandleBranchValuePropsResult<PropMap>
  propKeys.forEach(propKey => {
    const container = values[propKey as string].clone()
    propResult[propKey] = container
    if (container.isEmpty()) {
      return
    }
    const sourceOptions = container.normalizeDisplayOptions<HandleBranchValueOptions>(
      propMap[propKey]
    )
    const options = sourceOptions ? { ...sourceOptions } : null
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
      parts: [''],
    } as SkillBranchTextResultParseResult
    const resultContainer = SkillBranchTextResult.createForBranch(
      helper.branchItem,
      propKey,
      '0',
      '0',
      _parseResult
    )
    resultContainer.markEmpty()
    return resultContainer
  }
  const parseResult = SkillBranchTextResult.parse(helper.branchItem, propKey, textStr, value =>
    computeBranchValue(value, helper)
  )
  return SkillBranchTextResult.createForBranch(
    helper.branchItem,
    propKey,
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

function handleBranchStats(
  helper: ComputedBranchHelperResult,
  stats: StatComputed[]
): SkillBranchStatResult[] {
  return computeBranchStatResults(helper, stats).map(container => {
    handleDisplayValue(container, helper)

    const displayTitleKey = helper.branchItem.propKey(container.key, 'displayTitle')
    if (helper.props.has(displayTitleKey)) {
      const displayTitleContainer = computedBranchText(
        helper,
        displayTitleKey,
        helper.props.get(displayTitleKey)
      )
      displayTitleContainer.containers.forEach(ctner => handleHighlight(ctner))
      container.setDisplayTitle(displayTitleContainer)
    }
    const showData = container.stat.getShowData()
    container.mergeDisplayOptions(container.normalizeDisplayOptions(showData.tail))

    handleHighlight(container)

    return container
  })
}

export { handleBranchValueProps, handleBranchTextProps, handleBranchStats }
export type { HandleBranchValuePropsMap, HandleBranchTextPropsMap }
