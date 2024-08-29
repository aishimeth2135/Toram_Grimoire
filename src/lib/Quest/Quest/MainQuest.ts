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

type MainQuestSectionId = CommonId<'MainQuestSection', string>

class MainQuestSection extends QuestBase {
  readonly id: MainQuestSectionId
  readonly chapterId: number
  readonly sectionId: number
  skippableSubSection: string
  skippableExp: number

  constructor(chapterId: number, sectionId: number, name: string, exp: number) {
    super(name, exp)
    this.id = `${chapterId}-${sectionId}` as MainQuestSectionId
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
}

export { type MainQuestSectionId, MainQuestChapter, MainQuestSection }
