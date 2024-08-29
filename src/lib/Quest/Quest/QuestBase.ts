import { QuestItemType } from './enums'

class QuestBase {
  name: string
  caption: string
  exp: number
  submitItems: QuestItem[] | null
  rewardItems: QuestItem[] | null

  constructor(name: string, exp: number) {
    this.name = name
    this.caption = ''
    this.exp = exp
    this.submitItems = null
    this.rewardItems = null
  }

  hasSubmitItem(): boolean {
    return this.submitItems !== null
  }

  appendSubmitItem(type: QuestItemType, name: string, quantity: number) {
    if (!this.submitItems) {
      this.submitItems = []
    }
    this.submitItems.push(new QuestItem(type, name, quantity))
  }

  appendRewardItem(type: QuestItemType, name: string, quantity: number) {
    if (!this.rewardItems) {
      this.rewardItems = []
    }
    this.rewardItems.push(new QuestItem(type, name, quantity))
  }

  appendCaption(caption: string) {
    this.caption = caption
  }
}

class QuestItem {
  type: QuestItemType
  name: string
  quantity: number

  constructor(type: QuestItemType, name: string, quantity: number) {
    this.type = type
    this.name = name
    this.quantity = quantity
  }
}

export { QuestBase, QuestItem }
