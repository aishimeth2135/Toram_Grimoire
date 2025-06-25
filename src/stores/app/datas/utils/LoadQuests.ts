import { toInt } from '@/shared/utils/number'

import QuestSystem from '@/lib/Quest'
import { MainQuestChapter, MainQuestSection } from '@/lib/Quest/Quest'
import { QuestItemType } from '@/lib/Quest/Quest/enums'

import { type CsvData } from './DownloadDatas'

export default function LoadQuests(questSystem: QuestSystem, datas: CsvData) {
  const ROW_CHAPTER = 0,
    ROW_CHAPTER_NAME = 1,
    ROW_SECTION = 2,
    ROW_SECTION_NAME = 3,
    ROW_EXP = 4,
    // ROW_EXP_EXTENDED = 5,
    ROW_SUBMIT = 6,
    ROW_REWARD = 7,
    ROW_CAPTION = 8

  const handleIntData = (value: string) => toInt(value) ?? 0

  const questChapters: MainQuestChapter[] = []
  const questSections: MainQuestSection[] = []
  let currentChapter = 0
  let currentType: 'main' | 'side' = 'main'
  let currentQuest: MainQuestSection | null = null
  const INVALID_CHAPTER = 0
  const INVALID_SECTION = 0

  datas.forEach(row => {
    if (currentType === 'side') {
      // 暫時不支援支線任務
      return
    }

    if (row[ROW_CHAPTER]) {
      if (row[ROW_CHAPTER] === '支線任務') {
        currentType = 'side'
        return
      }

      currentChapter = handleIntData(row[ROW_CHAPTER])
      if (currentChapter === INVALID_CHAPTER) {
        return
      }

      const newChapter = new MainQuestChapter(currentChapter, row[ROW_CHAPTER_NAME])
      questChapters.push(newChapter)
    }

    if (currentChapter === INVALID_CHAPTER) {
      return
    }

    const currentSection = handleIntData(row[ROW_SECTION])

    if (currentSection !== INVALID_SECTION) {
      const newQuest = new MainQuestSection(
        currentChapter,
        handleIntData(row[ROW_SECTION]),
        row[ROW_SECTION_NAME],
        handleIntData(row[ROW_EXP])
      )
      parseSubmit(newQuest, row[ROW_SUBMIT])
      parseReward(newQuest, row[ROW_REWARD])
      newQuest.appendCaption(row[ROW_CAPTION])
      questSections.push(newQuest)
      currentQuest = newQuest
    } else if (row[ROW_EXP] && currentQuest) {
      currentQuest.setSkippableExp(row[ROW_SECTION_NAME], handleIntData(row[ROW_EXP]))
    }
  })

  questChapters.forEach(chapter => questSystem.appendMainQuestChapter(chapter))
  questSections.forEach(section => questSystem.appendMainQuestSection(section))
}

type HandleQuestItemCallback = (type: QuestItemType, name: string, quantity: number) => void
function handleQuestItem(data: string, cb: HandleQuestItemCallback) {
  const lines = data.split('\n')
  let currentType: QuestItemType = QuestItemType.Item
  const submitTypes: QuestItemType[] = [QuestItemType.Mob, QuestItemType.Item]
  lines.forEach(line => {
    if (!line) {
      return
    }
    let currentLine = line
    const submitTypeCheck = submitTypes.find(type => currentLine.startsWith(`${type}:`))
    if (submitTypeCheck) {
      currentType = submitTypeCheck
      currentLine = currentLine.replace(`${submitTypeCheck}:`, '').trim()
    }
    if (!currentLine) {
      return
    }
    const [name, quantity] = currentLine.split('#')
    if (name) {
      cb(currentType, name, toInt(quantity) ?? 0)
    }
  })
}

function parseSubmit(target: MainQuestSection, data: string) {
  handleQuestItem(data, (type, name, quantity) => {
    target.appendSubmitItem(type, name, quantity)
  })
}

function parseReward(target: MainQuestSection, data: string) {
  handleQuestItem(data, (type, name, quantity) => {
    target.appendRewardItem(type, name, quantity)
  })
}
