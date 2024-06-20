import {
  InstanceId,
  InstanceIdGenerator,
  InstanceWithId,
} from '@/shared/services/InstanceId'

import { ResultContainerTypes, TextResultContainerPartTypes } from './enums'

interface ResultHandler {
  (currentResult: string): string
}

interface ResultContainerDisplayOptions {
  unit?: string
  classNames?: string[]
  message?: {
    id: string
    param: string
  }
}

abstract class ResultContainerBase implements InstanceWithId {
  private static _idGenerator = new InstanceIdGenerator()

  instanceId: InstanceId

  /** The original data of prop */
  abstract readonly origin: string

  /** The calculated value of prop */
  abstract readonly value: string

  /** result to display */
  abstract get result(): string

  /** method to modify result */
  abstract handle(handler: ResultHandler): void

  constructor() {
    this.instanceId = ResultContainerBase._idGenerator.generate()
  }
}

class ResultContainer extends ResultContainerBase {
  override origin: string
  override value: string

  readonly type: ResultContainerTypes

  protected _result: string
  protected _displayOptions!: ResultContainerDisplayOptions

  constructor(type: ResultContainerTypes, origin: string, value: string) {
    super()
    this.type = type
    this.origin = origin
    this.value = value
    this._result = value.toString()
  }

  override get result() {
    return this._result
  }

  /**
   * Modify value of result
   * @param handler
   */
  override handle(handler: ResultHandler) {
    this._result = handler(this._result)
  }

  get displayOptions(): ResultContainerDisplayOptions {
    if (!this._displayOptions) {
      this._displayOptions = {}
    }
    return this._displayOptions
  }

  mergeDisplayOptions(options: ResultContainerDisplayOptions | string | null) {
    if (!options) {
      return
    }
    if (typeof options === 'string') {
      options = {
        unit: options,
      }
    }
    Object.entries(options).forEach(([key, value]) => {
      const _key = key as keyof ResultContainerDisplayOptions
      if (_key === 'classNames') {
        if (!this.displayOptions.classNames) {
          this.displayOptions.classNames = []
        }
        this.displayOptions.classNames.push(...value)
      } else {
        this.displayOptions![_key] = value
      }
    })
  }
}

type TextResultContainerPartValue =
  | TextResultContainerPart
  | ResultContainer
  | string

interface TextResultContainerParseResult {
  containers: ResultContainer[]
  parts: TextResultContainerPartValue[]
}

class TextResultContainer extends ResultContainerBase {
  override origin: string
  override value: string

  containers: ResultContainer[]
  parts: TextResultContainerPartValue[]

  constructor(
    origin: string,
    value: string,
    parseResult: TextResultContainerParseResult
  ) {
    super()

    const { parts, containers } = parseResult

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
    this.parts.forEach((part, idx) => {
      if (typeof part === 'string') {
        this.parts[idx] = handler(part)
      } else if (part instanceof TextResultContainerPart) {
        part.parts.forEach((subPart, subIdx) => {
          if (typeof subPart === 'string') {
            part.parts[subIdx] = handler(subPart)
          }
        })
      }
    })
  }
}

class TextResultContainerPart {
  readonly type: TextResultContainerPartTypes
  unit: string

  // must be init when type is "custom"
  subType?: string

  readonly parts: TextResultContainerPartValue[]

  private _metadata!: Map<string, string>

  constructor(
    type: TextResultContainerPartTypes,
    value: string | TextResultContainerPartValue[],
    unit: string = ''
  ) {
    this.type = type
    this.parts = typeof value === 'string' ? [value] : value
    this.unit = unit
  }

  get hasMultipleParts() {
    return this.parts.length > 1
  }

  get value(): string {
    const value = this.parts[0]
    return typeof value === 'string' ? value : value.result
  }

  get result(): string {
    return this.value
  }

  get metadata() {
    if (!this._metadata) {
      this._metadata = new Map()
    }
    return this._metadata
  }
}

export {
  ResultContainerBase,
  ResultContainer,
  TextResultContainer,
  TextResultContainerPart,
}

export type {
  TextResultContainerPartValue,
  TextResultContainerParseResult,
  ResultContainerDisplayOptions,
}
