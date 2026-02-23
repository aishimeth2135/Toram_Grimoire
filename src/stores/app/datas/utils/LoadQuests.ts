import { toInt } from '@/shared/utils/number'

import QuestSystem from '@/lib/Quest'
import { MainQuestChapter, MainQuestSection } from '@/lib/Quest/Quest'
import { QuestItemType } from '@/lib/Quest/Quest/enums'

import { type CsvData } from './DownloadDatas'
import { getCsvDataRowGetterHelper } from './utils'

export function LoadQuests(questSystem: QuestSystem, datas: CsvData) {
  const { createRowGetter } = getCsvDataRowGetterHelper({
    'chapter': 0,
    'chapter-name': 1,
    'section': 2,
    'section-name': 3,
    'exp': 4,
    // 'exp-extended': 5,
    'submit': 6,
    'reward': 7,
    'caption': 8,
  })

  const handleIntData = (value: string) => toInt(value) ?? 0

  const questChapters: MainQuestChapter[] = []
  const questSections: MainQuestSection[] = []
  let currentChapter = 0
  let currentType: 'main' | 'side' = 'main'
  let currentQuest: MainQuestSection | null = null
  const INVALID_CHAPTER = 0
  const INVALID_SECTION = 0
  let sectionIndex = 0

  datas.forEach(rowData => {
    if (currentType === 'side') {
      // 暫時不支援支線任務
      return
    }

    const { row } = createRowGetter(rowData)

    if (row('chapter')) {
      if (row('chapter') === '支線任務') {
        currentType = 'side'
        return
      }

      currentChapter = handleIntData(row('chapter'))
      if (currentChapter === INVALID_CHAPTER) {
        return
      }

      const newChapter = new MainQuestChapter(currentChapter, row('chapter-name'))
      questChapters.push(newChapter)
    }

    if (currentChapter === INVALID_CHAPTER) {
      return
    }

    const currentSection = handleIntData(row('section'))

    if (currentSection !== INVALID_SECTION) {
      const newQuest = new MainQuestSection(
        sectionIndex,
        currentChapter,
        handleIntData(row('section')),
        row('section-name'),
        handleIntData(row('exp'))
      )
      sectionIndex += 1
      parseSubmit(newQuest, row('submit'))
      parseReward(newQuest, row('reward'))
      newQuest.appendCaption(row('caption'))
      questSections.push(newQuest)
      currentQuest = newQuest
    } else if (row('exp') && currentQuest) {
      currentQuest.setSkippableExp(row('section-name'), handleIntData(row('exp')))
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
