import { markRaw } from 'vue'

import { EnchantCategory } from './Enchant'

export default class {
  categorys: EnchantCategory[]

  constructor() {
    this.categorys = markRaw([])
  }
  appendCategory(title: string) {
    const category = markRaw(new EnchantCategory(title))
    this.categorys.push(category)
    return category
  }
}
