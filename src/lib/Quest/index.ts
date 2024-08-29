import { markRaw } from 'vue'

import { MainQuestChapter, MainQuestSection } from './Quest'

export default class QuestSystem {
  mainQuestChapters: Map<number, MainQuestChapter>
  mainQuestSections: Map<string, MainQuestSection>

  constructor() {
    this.mainQuestChapters = markRaw(new Map())
    this.mainQuestSections = markRaw(new Map())
  }

  appendMainQuestChapter(src: MainQuestChapter) {
    this.mainQuestChapters.set(src.chapterId, src)
  }

  appendMainQuestSection(src: MainQuestSection) {
    this.mainQuestSections.set(`${src.chapterId}-${src.sectionId}`, src)
  }
}
