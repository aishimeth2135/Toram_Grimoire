import { markRaw } from 'vue'

import { QuestItemType } from './enums'

class QuestBase {
  readonly name: string
  caption: string
  readonly exp: number
  submitItems: QuestItem[] | null
  rewardItems: QuestItem[] | null

  protected constructor(name: string, exp: number) {
    this.name = name
    this.caption = ''
    this.exp = exp
    this.submitItems = null
    this.rewardItems = null
  }

  static createBase(name: string, exp: number): QuestBase {
    return markRaw(new QuestBase(name, exp))
  }

  hasSubmitItem(): boolean {
    return this.submitItems !== null
  }

  appendSubmitItem(type: QuestItemType, name: string, quantity: number) {
    if (!this.submitItems) {
      this.submitItems = []
    }
    this.submitItems.push(QuestItem.create(type, name, quantity))
  }

  appendRewardItem(type: QuestItemType, name: string, quantity: number) {
    if (!this.rewardItems) {
      this.rewardItems = []
    }
    this.rewardItems.push(QuestItem.create(type, name, quantity))
  }

  appendCaption(caption: string) {
    this.caption = caption
  }
}

class QuestItem {
  readonly type: QuestItemType
  readonly name: string
  readonly quantity: number

  private constructor(type: QuestItemType, name: string, quantity: number) {
    this.type = type
    this.name = name
    this.quantity = quantity
  }

  static create(type: QuestItemType, name: string, quantity: number): QuestItem {
    return markRaw(new QuestItem(type, name, quantity))
  }
}

export { QuestBase, QuestItem }
