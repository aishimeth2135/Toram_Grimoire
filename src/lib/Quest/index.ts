import { markRaw } from 'vue'

import { MainQuestChapter, MainQuestSection } from './Quest'

export default class QuestSystem {
  mainQuestChapters: Map<number, MainQuestChapter>
  mainQuestSections: Map<string, MainQuestSection>

  private constructor() {
    this.mainQuestChapters = new Map()
    this.mainQuestSections = new Map()
  }

  static create(): QuestSystem {
    return markRaw(new QuestSystem())
  }

  appendMainQuestChapter(src: MainQuestChapter) {
    this.mainQuestChapters.set(src.chapterId, src)
  }

  appendMainQuestSection(src: MainQuestSection) {
    this.mainQuestSections.set(`${src.chapterId}-${src.sectionId}`, src)
  }
}
