import { markRaw } from 'vue'

import { MainQuestChapter, MainQuestSection } from './Quest'

export default class QuestSystem {
  mainQuestChapters: Map<number, MainQuestChapter>
  mainQuestSections: Map<string, MainQuestSection>

  private constructor(
    mainQuestChapters: Map<number, MainQuestChapter>,
    mainQuestSections: Map<string, MainQuestSection>
  ) {
    this.mainQuestChapters = mainQuestChapters
    this.mainQuestSections = mainQuestSections
  }

  static create(): QuestSystem {
    return new QuestSystem(markRaw(new Map()), markRaw(new Map()))
  }

  appendMainQuestChapter(src: MainQuestChapter) {
    this.mainQuestChapters.set(src.chapterId, src)
  }

  appendMainQuestSection(src: MainQuestSection) {
    this.mainQuestSections.set(`${src.chapterId}-${src.sectionId}`, src)
  }
}
