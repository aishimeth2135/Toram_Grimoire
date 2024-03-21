export interface CommonItem<Id = any> {
  id: Id
}

export abstract class Items {
  static remove<Item extends CommonItem>(
    source: Item[],
    target: number | Item
  ): boolean {
    const id = typeof target !== 'object' ? target : target.id
    const idx = source.findIndex(item => item.id === id)
    if (idx > -1) {
      source.splice(idx, 1)
      return true
    }
    return false
  }

  static toggle<Item extends CommonItem>(source: Item[], target: Item): void {
    const id = target.id
    const idx = source.findIndex(item => item.id === id)
    if (idx > -1) {
      source.splice(idx, 1)
    } else {
      source.push(target)
    }
  }

  static includes<Item extends CommonItem>(source: Item[], target: Item) {
    return source.some(item => item.id === target.id)
  }
}
