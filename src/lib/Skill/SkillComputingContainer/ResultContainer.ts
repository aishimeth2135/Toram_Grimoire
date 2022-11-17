import { StatComputed } from '@/lib/Character/Stat'
import { StatRecorded } from '@/lib/Character/Stat'

import { SkillBranchItemBaseChilds } from '.'
import { ResultContainerTypes } from './enums'

type ResultHandler = (currentResult: string) => string

interface PropDisplayOptionsDetail {
  end?: string
  classNames?: string[]
  message?: {
    id: string
    param: string
  }
}
type PropDisplayOptions = PropDisplayOptionsDetail | string

abstract class ResultContainerBase {
  abstract readonly branch: SkillBranchItemBaseChilds

  /** The key of prop */
  abstract readonly key: string

  /** The original data of prop */
  abstract readonly origin: string

  /** The calculated value of prop */
  abstract readonly value: string

  /** result to display */
  abstract get result(): string

  /** method to modify result */
  abstract handle(handler: ResultHandler): void
}

class ResultContainer extends ResultContainerBase {
  override branch: SkillBranchItemBaseChilds
  override key: string
  override origin: string
  override value: string

  private _result: string
  private displayResult: string | null

  readonly subContainers: {
    registlet: ResultContainer | null
  }

  type: ResultContainerTypes
  displayOptions: PropDisplayOptionsDetail | null

  constructor(
    type: ResultContainerTypes,
    branch: SkillBranchItemBaseChilds,
    key: string,
    origin: string,
    value: string
  ) {
    super()
    this.type = type
    this.branch = branch
    this.key = key
    this.origin = origin
    this.value = value
    this._result = value.toString()
    this.displayResult = null

    this.subContainers = {
      registlet: null,
    }

    this.displayOptions = null
  }

  override get result() {
    return this.displayResult ?? this._result
  }

  get valueResult() {
    return this._result
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

  initDisplayValue(value: string) {
    this.displayResult = value
  }

  setDisplayOptions(options: PropDisplayOptions | null) {
    if (!options) {
      return
    }
    if (!this.displayOptions) {
      this.displayOptions = {}
    }
    if (typeof options === 'string') {
      options = {
        end: options,
      }
    }
    Object.entries(options).forEach(([key, value]) => {
      const _key = key as keyof PropDisplayOptionsDetail
      this.displayOptions![_key] = value
    })
  }
}

class ResultContainerStat extends ResultContainer {
  stat: StatComputed

  /**
   * The result data of stat will store the result that before handling by stat title.
   * note: init in `handleDisplayData`
   */
  statResultData!: {
    title: string
    sign: string
    value: string
  }

  // The display title that priority is higher than the original title of `stat`.
  displayTitle: string | null

  // The condition value that will be calc and result is `boolean`.
  conditionValue: string | null

  constructor(
    branch: SkillBranchItemBaseChilds,
    origin: StatComputed,
    stat: StatComputed
  ) {
    super(
      ResultContainerTypes.Number,
      branch,
      stat.statId,
      origin.value,
      stat.value
    )
    this.stat = stat
    this.displayTitle = null
    this.conditionValue = null
  }

  setDisplayTitle(title: string) {
    this.displayTitle = title
  }

  setConditionValue(title: string) {
    this.conditionValue = title
  }

  storeStatResultData(data: { title: string; sign: string }) {
    this.statResultData = {
      title: data.title,
      sign: data.sign,
      value: this.result,
    }
  }

  toStatRecorded(value: number): StatRecorded {
    return StatRecorded.from(this.stat.toStat(value), this.branch.default)
  }
}

type TextResultContainerPartValue =
  | TextResultContainerPart
  | ResultContainer
  | string

const TEXT_SEPARATE_PARSE_PATTERN = /\(\(((?:(?!\(\().)+)\)\)/g
const TEXT_VALUE_PARSE_PATTERN = /\$\{([^}]+)\}/g

const PART_UNIT_LIST = ['%', 'm']

interface TextResultContainerParseResult {
  containers: ResultContainer[]
  parts: TextResultContainerPartValue[]
}
class TextResultContainer extends ResultContainerBase {
  override branch: SkillBranchItemBaseChilds
  override key: string
  override origin: string
  override value: string

  containers: ResultContainer[]
  parts: TextResultContainerPartValue[]

  /**
   * Parse the text-type string data and convert it to TextResultContainer.
   * @param value - value to parse
   * @param calcValueHanlder - handler to calculate value
   * @returns the new TextResultContainer instance
   */
  static parse(
    branch: SkillBranchItemBaseChilds,
    key: string,
    rootValue: string,
    calcValueHanlder: (value: string) => string
  ): TextResultContainerParseResult {
    const subParse = (value: string) => {
      const textParts = value.split(TEXT_VALUE_PARSE_PATTERN)
      const parts: (string | ResultContainer)[] = [],
        containers: ResultContainer[] = []
      textParts.forEach((el, idx) => {
        if (idx % 2 === 0) {
          if (el === '') {
            return
          }
          parts.push(el)
        } else {
          const next = idx === textParts.length - 1 ? null : textParts[idx + 1]
          let suffix = ''
          if (next && PART_UNIT_LIST.includes(next[0])) {
            textParts[idx + 1] = next.slice(1)
            suffix = next[0]
          }
          const calculatedValue = calcValueHanlder(el)
          const container = new ResultContainer(
            ResultContainerTypes.Number,
            branch,
            key,
            el,
            calculatedValue
          )
          container.setDisplayOptions(suffix)
          containers.push(container)
          parts.push(container)
        }
      })

      return {
        parts,
        containers,
      }
    }

    const mainParse = (
      value: string,
      containersStore: ResultContainer[]
    ): TextResultContainerParseResult => {
      const mainParts = value.split(TEXT_SEPARATE_PARSE_PATTERN)
      const parts: TextResultContainerPartValue[] = []
      mainParts.forEach((part, idx) => {
        if (idx % 2 === 0) {
          if (part === '') {
            return
          }
          const parseResult = subParse(part)
          if (parseResult.containers.length === 0) {
            parts.push(part)
            return
          }
          parts.push(...parseResult.parts)
          containersStore.push(...parseResult.containers)
          return
        }
        const next = idx === mainParts.length - 1 ? null : mainParts[idx + 1]
        let end = ''
        if (next && PART_UNIT_LIST.includes(next[0])) {
          mainParts[idx + 1] = next.slice(1)
          end = next[0]
        }
        const parseResult = mainParse(part, containersStore)
        containersStore.push(...parseResult.containers)
        const newPart = new TextResultContainerPart(
          'separate',
          parseResult.containers.slice(),
          parseResult.parts,
          end
        )
        parts.push(newPart)
      })

      return {
        containers: containersStore,
        parts,
      }
    }
    return mainParse(rootValue, [])
  }

  constructor(
    branch: SkillBranchItemBaseChilds,
    key: string,
    origin: string,
    value: string,
    parseResult: TextResultContainerParseResult
  ) {
    super()

    const { parts, containers } = parseResult

    this.branch = branch
    this.key = key
    this.parts = parts
    this.containers = containers
    this.origin = origin
    this.value = value
  }

  override get result() {
    return this.parts
      .map(part => (typeof part === 'string' ? part : part.result))
      .join('')
  }

  override handle(handler: ResultHandler) {
    this.containers.forEach(container => container.handle(handler))
  }

  handleStrings(handler: (value: string) => string) {
    const handle = (parts: TextResultContainerPartValue[]) => {
      parts.forEach((part, idx) => {
        if (typeof part === 'string') {
          parts[idx] = handler(part)
        } else if (part instanceof TextResultContainerPart) {
          handle(part.parts)
        }
      })
    }
    handle(this.parts)
  }
}

class TextResultContainerPart {
  type: 'separate'
  containers: ResultContainer[]
  parts: TextResultContainerPartValue[]
  end: string

  constructor(
    type: 'separate',
    containers: ResultContainer[],
    parts: TextResultContainerPartValue[],
    end: string = ''
  ) {
    this.type = type
    this.containers = containers
    this.parts = parts
    this.end = end
  }

  get result(): string {
    return this.parts
      .map(part => (typeof part === 'string' ? part : part.result))
      .join('')
  }
}

export {
  ResultContainerBase,
  ResultContainer,
  ResultContainerStat,
  TextResultContainer,
  TextResultContainerPart,
}
export type {
  TextResultContainerParseResult,
  PropDisplayOptions,
  TextResultContainerPartValue,
}
