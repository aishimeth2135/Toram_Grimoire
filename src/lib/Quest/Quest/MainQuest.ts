import type { CommonId } from '@/shared/services/CommonId'

import { QuestBase } from './QuestBase'

class MainQuestChapter {
  readonly chapterId: number
  name: string

  constructor(chapter: number, name: string) {
    this.chapterId = chapter
    this.name = name
  }
}

type MainQuestSectionIndex = CommonId<'MainQuestSection', number>

class MainQuestSection extends QuestBase {
  readonly index: MainQuestSectionIndex
  readonly chapterId: number
  readonly sectionId: number
  skippableSubSection: string
  skippableExp: number

  constructor(index: number, chapterId: number, sectionId: number, name: string, exp: number) {
    super(name, exp)
    this.index = index as MainQuestSectionIndex
    this.chapterId = chapterId
    this.sectionId = sectionId
    this.skippableSubSection = ''
    this.skippableExp = 0
  }

  setSkippableExp(name: string, exp: number): void {
    this.skippableSubSection = name
    this.skippableExp = exp
  }

  hasSubSection(): boolean {
    return this.skippableSubSection !== ''
  }

  isEqual(section: MainQuestSection) {
    return this.index === section.index
  }
}

export { type MainQuestSectionIndex, MainQuestChapter, MainQuestSection }
