import { StatComputed } from '@/lib/Character/Stat'

type ResultHandler = (currentResult: string, suffix: string) => string

abstract class ResultContainerBase {
  /** The key of attr */
  abstract readonly key: string

  /** The original data of attr */
  abstract readonly origin: string

  /** The calculated value of attr */
  abstract readonly value: string

  /** result to display */
  abstract get result(): string

  /** method to modify result */
  abstract handle(handler: ResultHandler): void
}

class ResultContainer extends ResultContainerBase {
  override key: string
  override origin: string
  override value: string

  /** suffix to insert before result if needed */
  suffix: string

  private _result: string

  constructor(key: string, origin: string, value: string, suffix: string = '') {
    super()
    this.key = key
    this.origin = origin
    this.value = value
    this._result = value.toString()
    this.suffix = suffix
  }

  override get result() {
    return this._result
  }

  /**
   * Modify value of result
   * @param handler
   */
  override handle(handler: ResultHandler) {
    this._result = handler(this._result, this.suffix)
  }
}

class ResultContainerStat extends ResultContainer {
  stat: StatComputed

  constructor(origin: StatComputed, stat: StatComputed) {
    super(origin.baseName, origin.value, stat.value)
    this.stat = stat
  }
}

interface TextResultContainerParseResult {
  containers: ResultContainer[];
  parts: (string | ResultContainer)[];
}
class TextResultContainer extends ResultContainerBase {
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
  static parse(key: string, value: string, calcValueHanlder: (value: string) => string): TextResultContainerParseResult {
    const textParts = value.split(/\$\{([^}]+)\}/g)
    const
      parts: (string | ResultContainer)[] = [],
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
        const container = new ResultContainer(key, el, calculatedValue, suffix)
        containers.push(container)
        parts.push(container)
      }
    })

    return {
      parts,
      containers,
    }
  }

  constructor(key: string, origin: string, value: string, parseResult: TextResultContainerParseResult) {
    super()

    const { parts, containers } = parseResult

    this.key = key
    this.parts = parts
    this.containers = containers
    this.origin = origin
    this.value = value
  }

  override get result() {
    return this.parts.map(part => typeof part === 'string' ? part : part.result).join('')
  }

  override handle(handler: ResultHandler) {
    this.containers.forEach(container => container.handle(handler))
  }
}

export { ResultContainerBase, ResultContainer, ResultContainerStat, TextResultContainer }
export type { TextResultContainerParseResult }

