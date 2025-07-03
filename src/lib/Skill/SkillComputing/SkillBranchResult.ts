import { defineState } from '@/shared/setup/State'
import { toFloat, toInt } from '@/shared/utils/number'
import { escapeRegExp, splitComma } from '@/shared/utils/string'

import { StatComputed, StatRecorded, StatValueSourceTypes } from '@/lib/Character/Stat'
import {
  CommonTextParseItemIds,
  ResultContainerTypes,
  TextResultContainerPartTypes,
} from '@/lib/common/ResultContainer'
import {
  ResultContainer,
  ResultContainerBase,
  TextResultContainer,
  TextResultContainerPart,
} from '@/lib/common/ResultContainer/index'
import {
  type TextParseHandler,
  type TextParseItem,
  getCommonTextParseItemBase,
  getCommonTextParseItemHandler,
  handleParseText,
} from '@/lib/common/ResultContainer/parseText'

import type { SkillBranchItemBaseChilds } from './SkillBranchItem'

type ResultHandler = (currentResult: string) => string

interface SkillBranchResultBase extends ResultContainerBase {
  readonly branch: SkillBranchItemBaseChilds

  /** The key of prop */
  readonly key: string

  get valueSum(): number
}

class SkillBranchResult extends ResultContainer implements SkillBranchResultBase {
  branch: SkillBranchItemBaseChilds
  key: string

  private displayResult: string | null

  readonly subContainers: {
    registlet: SkillBranchResult | null
  }

  static from(container: ResultContainer, branch: SkillBranchItemBaseChilds, key: string) {
    const result = new SkillBranchResult(
      container.type,
      branch,
      key,
      container.origin,
      container.value
    )
    result.mergeDisplayOptions(container.displayOptions)
    return result
  }

  constructor(
    type: ResultContainerTypes,
    branch: SkillBranchItemBaseChilds,
    key: string,
    origin: string,
    value: string
  ) {
    super(type, origin, value)
    this.branch = branch
    this.key = key
    this.displayResult = null
    this.subContainers = {
      registlet: null,
    }
  }

  override get result() {
    return this.displayResult ?? this._result
  }

  get valueResult() {
    return this._result
  }

  get valueSum() {
    const value = toInt(this.value)
    const registletValue = toInt(this.subContainers.registlet?.value)
    let result = 0
    if (value !== null) {
      result += value
    }
    if (registletValue !== null) {
      result += registletValue
    }
    return result
  }

  /**
   * Modify value of result
   * @param handler
   */
  override handle(handler: ResultHandler) {
    this._result = handler(this._result)
    if (this.displayResult !== null) {
      this.displayResult = handler(this.displayResult)
    }
  }

  handleDisplay(handler: ResultHandler) {
    if (this.displayResult === null) {
      this.displayResult = this._result
    }
    this.displayResult = handler(this.displayResult)
  }

  initDisplayValue(value: string) {
    this.displayResult = value
  }
}

class SkillBranchStatResult extends SkillBranchResult {
  stat: StatComputed

  /**
   * The result data of stat will store the result that before handling by stat title.
   * note: init in `handleDisplayData`
   */
  statResultData!: {
    title: string | SkillBranchTextResult
    sign: string
    value: string
  }

  // The display title that priority is higher than the original title of `stat`.
  displayTitle: SkillBranchTextResult | null

  // The condition value that will be calc and result is `boolean`.
  conditionValue: string | null

  constructor(branch: SkillBranchItemBaseChilds, origin: StatComputed, stat: StatComputed) {
    super(ResultContainerTypes.Number, branch, stat.statId, origin.value, stat.value)
    this.stat = stat
    this.displayTitle = null
    this.conditionValue = null
  }

  override get valueSum() {
    // float instead of integer
    const value = toFloat(this.value)
    const registletValue = toFloat(this.subContainers.registlet?.value)
    let result = 0
    if (value !== null) {
      result += value
    }
    if (registletValue !== null) {
      result += registletValue
    }
    return result
  }

  setDisplayTitle(title: SkillBranchTextResult) {
    this.displayTitle = title
  }

  setConditionValue(title: string) {
    this.conditionValue = title
  }

  storeStatResultData(data: { title: string | SkillBranchTextResult; sign: string }) {
    this.statResultData = {
      title: data.title,
      sign: data.sign,
      value: this.result,
    }
  }

  toStatRecorded(value: number): StatRecorded {
    return StatRecorded.from(
      this.stat.toStat(value),
      this.branch.default,
      StatValueSourceTypes.Skill
    )
  }
}

const useTextResultBaseParseItems = defineState(() => {
  const glossaryTagHandler = getCommonTextParseItemHandler(CommonTextParseItemIds.GlossaryTag)
  const glossaryTagItem: TextParseItem = {
    ...getCommonTextParseItemBase(CommonTextParseItemIds.GlossaryTag),
    handler(context) {
      return SkillBranchTextResultPart.from(glossaryTagHandler(context))
    },
  }

  const separateHandler = getCommonTextParseItemHandler(CommonTextParseItemIds.Separate)
  const separateItem: TextParseItem = {
    ...getCommonTextParseItemBase(CommonTextParseItemIds.Separate),
    handler(context) {
      return SkillBranchTextResultPart.from(separateHandler(context))
    },
  }

  const getSkillQueryMarkHandler = (typeForSkillResultDipslay: string) =>
    (context => {
      const newPart = new SkillBranchTextResultPart(
        TextResultContainerPartTypes.Other,
        context.values[0]
      )
      newPart.subType = typeForSkillResultDipslay
      return newPart
    }) as TextParseHandler

  const simpleMark: TextParseItem = {
    id: '@mark-simple',
    pattern: /!\[([^\]]+)\]/,
    handler: getSkillQueryMarkHandler('mark'),
  }
  const skillMark: TextParseItem = {
    id: '@mark-skill',
    pattern: /!S\[([^\]]+)\]/,
    handler: getSkillQueryMarkHandler('skill'),
  }
  const skillBranchMark: TextParseItem = {
    id: '@mark-skill-branch',
    pattern: /!B\[([^\]]+)\]/,
    handler: getSkillQueryMarkHandler('branch'),
  }

  const getParseItems = (valueParseItem: TextParseItem): TextParseItem[] => {
    return [glossaryTagItem, valueParseItem, separateItem, skillMark, skillBranchMark, simpleMark]
  }

  return { getParseItems }
})

type SkillBranchTextResultPartValue = SkillBranchTextResultPart | SkillBranchResult | string

interface SkillBranchTextResultParseResult {
  containers: SkillBranchResult[]
  parts: SkillBranchTextResultPartValue[]
}
class SkillBranchTextResult extends TextResultContainer implements SkillBranchResultBase {
  branch: SkillBranchItemBaseChilds
  key: string

  declare containers: SkillBranchResult[]
  declare parts: SkillBranchTextResultPartValue[]

  static parse(
    branch: SkillBranchItemBaseChilds,
    key: string,
    rootValue: string,
    computedValue: (value: string) => string
  ): SkillBranchTextResultParseResult {
    const valueParseHandlerBase = getCommonTextParseItemHandler(CommonTextParseItemIds.Value, {
      computedValue,
    })
    const valueParseItem: TextParseItem = {
      ...getCommonTextParseItemBase(CommonTextParseItemIds.Value),
      handler(context) {
        return SkillBranchResult.from(valueParseHandlerBase(context), branch, key)
      },
    }

    const { getParseItems } = useTextResultBaseParseItems()
    const parseItems = getParseItems(valueParseItem)

    const handleOtherParse = (propKey: string) => {
      if (branch.hasProp(propKey)) {
        const values = splitComma(branch.prop(propKey))
        if (values.length === 1 && !values[0]) {
          return
        }

        const handler: TextParseHandler<SkillBranchTextResultPart> = context => {
          const newPart = new SkillBranchTextResultPart(
            TextResultContainerPartTypes.Other,
            context.values[0]
          )
          newPart.subType = propKey
          return newPart
        }

        const item: TextParseItem<SkillBranchTextResultPart> = {
          id: propKey,
          pattern: new RegExp(`(${values.map(value => escapeRegExp(value)).join('|')})`),
          handler,
        }
        parseItems.push(item)
      }
    }
    handleOtherParse('skill')
    handleOtherParse('branch')
    handleOtherParse('mark')

    const result = handleParseText(rootValue, parseItems)

    return {
      parts: result.parts as SkillBranchTextResultPartValue[],
      containers: result.containers as SkillBranchResult[],
    }
  }

  constructor(
    branch: SkillBranchItemBaseChilds,
    key: string,
    origin: string,
    value: string,
    parseResult: SkillBranchTextResultParseResult
  ) {
    super(origin, value, parseResult)
    this.branch = branch
    this.key = key
  }

  get valueSum() {
    return 0
  }
}

export class SkillBranchTextResultPart extends TextResultContainerPart {
  declare parts: SkillBranchTextResultPartValue[]

  static from(resultPart: TextResultContainerPart): SkillBranchTextResultPart {
    const parts = resultPart.parts.map(part => {
      if (part instanceof TextResultContainerPart) {
        return SkillBranchTextResultPart.from(part)
      }
      return part
    })
    const newPart = new SkillBranchTextResultPart(resultPart.type, parts, resultPart.unit)
    for (const [key, value] of resultPart.metadata.entries()) {
      newPart.metadata.set(key, value)
    }
    return newPart
  }
}

export { SkillBranchResult, SkillBranchStatResult, SkillBranchTextResult }
export type {
  SkillBranchResultBase,
  SkillBranchTextResultParseResult,
  SkillBranchTextResultPartValue,
}
