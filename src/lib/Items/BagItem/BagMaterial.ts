class BagMaterialStack {
  itemName: string
  quantity: number

  private constructor(itemName: string, quantity: number) {
    this.itemName = itemName
    this.quantity = quantity
  }

  static create(itemName: string, quantity: number): BagMaterialStack {
    return new BagMaterialStack(itemName, quantity)
  }
}

export { BagMaterialStack }
