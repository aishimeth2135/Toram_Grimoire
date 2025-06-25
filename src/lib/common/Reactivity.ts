import { type Raw, type ShallowRef, markRaw, shallowReactive, shallowRef } from 'vue'

import { type CommonItem, Items } from './Items'

// export interface ReactivityItem {
//   reactivity: (...args: any) => unknown
// }

export interface ReactivityItem extends CommonItem {}

export class ReactivityList<Item extends ReactivityItem> {
  private _list: ShallowRef<Item[]>

  constructor() {
    this._list = shallowRef(shallowReactive([]))
  }

  /**
   * Only for external to access
   */
  get value(): Item[] {
    return this._list.value
  }

  unshift(target: Item): number {
    return this._list.value.unshift(target)
  }

  push(target: Item): number {
    return this._list.value.push(target)
  }

  remove(target: number | Item): void {
    Items.remove(this._list.value, target)
  }

  at(index: number): Item {
    return this._list.value.at(index)!
  }

  reset(): void {
    this._list.value = shallowReactive([])
  }

  // [Symbol.iterator]() {
  //   let current = 0

  //   return {
  //     next: () => {
  //       if (current < this._list.value.length) {
  //         const value = this._list.value[current]
  //         current += 1
  //         return { value, done: false }
  //       } else {
  //         return { done: true }
  //       }
  //     },
  //   }
  // }

  static create<Item extends ReactivityItem>(): Raw<ReactivityList<Item>> {
    return markRaw(new ReactivityList<Item>())
  }
}
