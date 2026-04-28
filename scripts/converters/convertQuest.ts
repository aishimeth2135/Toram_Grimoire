import type { CsvData } from '../utils'
import type { QuestData, QuestChapter, QuestSection } from '../../src/data/types/quest'

export function convertQuest(csv: CsvData): QuestData {
  const chapters: QuestChapter[] = []
  const sections: QuestSection[] = []

  let currentChapter = 0
  let currentType: 'main' | 'side' = 'main'
  let currentQuest: QuestSection | null = null

  csv.forEach((row, index) => {
    if (index === 0) return
    if (currentType === 'side') return

    const chapterCol = row[0]
    const chapterName = row[1]
    const sectionCol = row[2]
    const sectionName = row[3]
    const exp = row[4]
    const submit = row[6] ?? ''
    const reward = row[7] ?? ''
    const caption = row[8] ?? ''

    if (chapterCol) {
      if (chapterCol === '支線任務') {
        currentType = 'side'
        return
      }
      currentChapter = parseInt(chapterCol) || 0
      if (currentChapter === 0) return
      chapters.push({ id: currentChapter, name: chapterName })
    }

    if (currentChapter === 0) return

    const sectionNum = parseInt(sectionCol) || 0
    if (sectionNum !== 0) {
      const newSection: QuestSection = {
        chapter: currentChapter,
        section: sectionNum,
        name: sectionName,
        exp: parseInt(exp) || 0,
        submit,
        reward,
        caption,
      }
      sections.push(newSection)
      currentQuest = newSection
    } else if (exp && currentQuest) {
      currentQuest.skippable = {
        name: sectionName,
        exp: parseInt(exp) || 0,
      }
    }
  })

  return { chapters, sections }
}
