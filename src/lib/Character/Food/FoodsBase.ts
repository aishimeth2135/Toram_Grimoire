import { markRaw } from 'vue'

import { StatTypes } from '@/lib/Character/Stat'

import { StatBase } from '../Stat'
import { initFoodsBase } from './utils'

type FoodAmount = [number, number]

class FoodsBase {
  foodBases: FoodBase[]

  private constructor(foodBases: FoodBase[]) {
    this.foodBases = foodBases
  }

  static create(): FoodsBase {
    const foodsBase = markRaw(new FoodsBase(markRaw([])))
    initFoodsBase(foodsBase)
    return foodsBase
  }

  appendFoodBase(base: StatBase, amount: FoodAmount, negative: boolean = false) {
    const foodBase = FoodBase.create(base, amount, negative)
    this.foodBases.push(foodBase)
    return foodBase
  }
}

class FoodBase {
  base: StatBase
  amount: FoodAmount
  negative: boolean

  foodBaseId: string

  private constructor(base: StatBase, amount: FoodAmount, negative: boolean) {
    this.base = base
    this.amount = amount
    this.negative = negative
    this.foodBaseId = this.base.getStatId(StatTypes.Constant)
  }

  static create(base: StatBase, amount: FoodAmount, negative: boolean): FoodBase {
    return markRaw(new FoodBase(base, amount, negative))
  }
  getStat(level: number) {
    const value = Math.min(level, 5) * this.amount[0] + Math.max(level - 5, 0) * this.amount[1]
    return this.base.createStat(StatTypes.Constant, this.negative ? -1 * value : value)
  }
  statTitle() {
    return this.base.title(StatTypes.Constant)
  }
}

export { FoodsBase, FoodBase }
export type { FoodAmount }
