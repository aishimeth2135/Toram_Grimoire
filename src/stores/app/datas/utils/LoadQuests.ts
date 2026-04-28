import QuestSystem from '@/lib/Quest'
import { MainQuestChapter, MainQuestSection } from '@/lib/Quest/Quest'
import { QuestItemType } from '@/lib/Quest/Quest/enums'

import type { QuestData, QuestLocale } from '@/data/types/quest'

type HandleQuestItemCallback = (type: QuestItemType, name: string, quantity: number) => void

function handleQuestItem(data: string, cb: HandleQuestItemCallback) {
  const lines = data.split('\n')
  let currentType: QuestItemType = QuestItemType.Item
  const submitTypes: QuestItemType[] = [QuestItemType.Mob, QuestItemType.Item]
  lines.forEach(line => {
    if (!line) return
    let currentLine = line
    const submitTypeCheck = submitTypes.find(type => currentLine.startsWith(`${type}:`))
    if (submitTypeCheck) {
      currentType = submitTypeCheck
      currentLine = currentLine.replace(`${submitTypeCheck}:`, '').trim()
    }
    if (!currentLine) return
    const [name, quantity] = currentLine.split('#')
    if (name) cb(currentType, name, parseInt(quantity) || 0)
  })
}

export function LoadQuests(questSystem: QuestSystem, data: QuestData, locale?: QuestLocale) {
  data.chapters.forEach(ch => {
    const name = locale?.[`chapter:${ch.id}`]?.name ?? ch.name
    questSystem.appendMainQuestChapter(new MainQuestChapter(ch.id, name))
  })

  data.sections.forEach((sec, index) => {
    const name = locale?.[`section:${sec.chapter}:${sec.section}`]?.name ?? sec.name
    const quest = new MainQuestSection(index, sec.chapter, sec.section, name, sec.exp)
    if (sec.skippable) {
      quest.setSkippableExp(sec.skippable.name, sec.skippable.exp)
    }
    handleQuestItem(sec.submit, (type, name, qty) => quest.appendSubmitItem(type, name, qty))
    handleQuestItem(sec.reward, (type, name, qty) => quest.appendRewardItem(type, name, qty))
    quest.appendCaption(sec.caption)
    questSystem.appendMainQuestSection(quest)
  })
}
