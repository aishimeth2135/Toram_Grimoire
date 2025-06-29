import { toFloat, toInt } from '@/shared/utils/number'
import { escapeRegExp, splitComma } from '@/shared/utils/string'

import { StatComputed, StatRecorded, StatValueSourceTypes } from '@/lib/Character/Stat'
import { ResultContainerTypes, TextResultContainerPartTypes } from '@/lib/common/ResultContainer'
import {
  ResultContainer,
  ResultContainerBase,
  TextResultContainer,
  TextResultContainerPart,
} from '@/lib/common/ResultContainer/index'
import {
  type TextParseItem,
  getCommonTextParseItems,
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
    const commonParseItems = getCommonTextParseItems({ computedValue })

    const originalHandlers = {
      value: commonParseItems.value.handler,
      separate: commonParseItems.separate.handler,
      glossaryTag: commonParseItems.glossaryTag.handler,
    }
    commonParseItems.value.handler = context => {
      return SkillBranchResult.from(originalHandlers.value(context), branch, key)
    }
    commonParseItems.separate.handler = context => {
      return SkillBranchTextResultPart.from(originalHandlers.separate(context))
    }
    commonParseItems.glossaryTag.handler = context => {
      return SkillBranchTextResultPart.from(originalHandlers.glossaryTag(context))
    }

    const items = [commonParseItems.glossaryTag, commonParseItems.value, commonParseItems.separate]

    const handleOtherParse = (propKey: string) => {
      if (branch.hasProp(propKey)) {
        const values = splitComma(branch.prop(propKey))
        if (values.length === 1 && !values[0]) {
          return
        }
        const item: TextParseItem<SkillBranchTextResultPart> = {
          id: propKey,
          pattern: new RegExp(`(${values.map(value => escapeRegExp(value)).join('|')})`),
          handler(context) {
            const newPart = new SkillBranchTextResultPart(
              TextResultContainerPartTypes.Other,
              context.values[0]
            )
            newPart.subType = propKey
            return newPart
          },
        }
        items.push(item)
      }
    }
    handleOtherParse('skill')
    handleOtherParse('mark')
    handleOtherParse('branch')

    const result = handleParseText(rootValue, items)

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

class SkillBranchTextResultPart extends TextResultContainerPart {
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
