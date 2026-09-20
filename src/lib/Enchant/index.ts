import { markRaw } from 'vue'

import { StatBase } from '../Character/Stat'
import { EnchantCategory, EnchantItem } from './Enchant'

export default class EnchantSystem {
  categorys: EnchantCategory[]

  private constructor() {
    this.categorys = []
  }

  static create(): EnchantSystem {
    return markRaw(new EnchantSystem())
  }

  appendCategory(title: string) {
    const category = EnchantCategory.create(title)
    this.categorys.push(category)
    return category
  }

  findEnchantItem(base: StatBase): EnchantItem | null {
    let result: EnchantItem | null = null
    this.categorys.some(cat => {
      result = cat.items.find(item => item.statBase === base) ?? null
      return result
    })
    return result
  }
}
