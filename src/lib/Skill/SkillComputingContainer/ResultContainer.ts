import { StatComputed } from '@/lib/Character/Stat'
import { StatRecorded } from '@/lib/Character/Stat'

import { SkillBranchItemBaseChilds } from '.'

type ResultHandler = (currentResult: string, suffix: string) => string

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

  /** suffix to insert before result if needed */
  suffix: string

  private _result: string
  private displayResult: string | null

  constructor(
    branch: SkillBranchItemBaseChilds,
    key: string,
    origin: string,
    value: string,
    suffix: string = ''
  ) {
    super()
    this.branch = branch
    this.key = key
    this.origin = origin
    this.value = value
    this._result = value.toString()
    this.displayResult = null
    this.suffix = suffix
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
    this._result = handler(this._result, this.suffix)
    if (this.displayResult !== null) {
      this.displayResult = handler(this.displayResult, this.suffix)
    }
  }

  initDisplayValue(value: string) {
    this.displayResult = value
  }
}

class ResultContainerStat extends ResultContainer {
  stat: StatComputed
  displayTitle: string | null
  conditionValue: string | null

  constructor(
    branch: SkillBranchItemBaseChilds,
    origin: StatComputed,
    stat: StatComputed
  ) {
    super(branch, stat.statId, origin.value, stat.value)
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

  toStatRecord(value: number): StatRecorded {
    return StatRecorded.from(this.stat.toStat(value), this.branch.default)
  }
}

interface TextResultContainerParseResult {
  containers: ResultContainer[]
  parts: (string | ResultContainer)[]
}
class TextResultContainer extends ResultContainerBase {
  override branch: SkillBranchItemBaseChilds
  override key: string
  override origin: string
  override value: string

  containers: ResultContainer[]
  parts: (string | ResultContainer)[]

  /**
   * Parse the text-type string data and convert it to TextResultContainer.
   * @param value - value to parse
   * @param calcValueHanlder - handler to calculate value
   * @returns the new TextResultContainer instance
   */
  static parse(
    branch: SkillBranchItemBaseChilds,
    key: string,
    value: string,
    calcValueHanlder: (value: string) => string
  ): TextResultContainerParseResult {
    const textParts = value.split(/\$\{([^}]+)\}/g)
    const parts: (string | ResultContainer)[] = [],
      containers: ResultContainer[] = []
    textParts.forEach((el, idx) => {
      if (idx % 2 === 0) {
        parts.push(el)
      } else {
        const next = idx === textParts.length - 1 ? null : textParts[idx + 1]
        let suffix = ''
        if (next && next[0] === '%') {
          textParts[idx + 1] = next.slice(1)
          suffix = '%'
        }
        const calculatedValue = calcValueHanlder(el)
        const container = new ResultContainer(
          branch,
          key,
          el,
          calculatedValue,
          suffix
        )
        containers.push(container)
        parts.push(container)
      }
    })

    return {
      parts,
      containers,
    }
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
}

export {
  ResultContainerBase,
  ResultContainer,
  ResultContainerStat,
  TextResultContainer,
}
export type { TextResultContainerParseResult }
