import type { Opaque } from '../utils/type'

export type CommonId<
  TypeId extends string,
  Id extends number | string = number,
> = Opaque<TypeId, Id>

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
