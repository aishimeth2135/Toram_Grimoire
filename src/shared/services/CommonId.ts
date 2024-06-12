import { Opaque } from '../utils/type'

export type CommonId<TypeId extends string> = Opaque<TypeId, number>

export class CommonIdGenerator<Id extends CommonId<string>> {
  private autoIncrement: number

  constructor() {
    this.autoIncrement = 0
  }

  generate(): Id {
    this.autoIncrement += 1
    return this.autoIncrement as Id
  }
}
