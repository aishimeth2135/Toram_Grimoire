<script lang="ts" setup>
import { type Ref, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { MainQuestChapter, MainQuestSection } from '@/lib/Quest/Quest'

import CardRowsDelegation from '@/components/card/card-rows-delegation.vue'

import MainQuestSectionItem from './main-quest-section-item.vue'

interface Emits {
  (evt: 'selected-sections-changed', sections: MainQuestSection[]): void
}

const emit = defineEmits<Emits>()

const { t } = useI18n()

const { mainQuestChapters, mainQuestSections } = Grimoire.Quest

interface ChapterItem {
  chapter: MainQuestChapter
  sections: MainQuestSection[]
}

const chapterItems: ChapterItem[] = []
const allSections = [...mainQuestSections.values()]
const startSection: Ref<MainQuestSection> = ref(allSections[0])

for (const chapter of mainQuestChapters.values()) {
  const sections = allSections.filter(section => section.chapterId === chapter.chapterId).reverse()
  chapterItems.unshift({ chapter, sections })
}

const endSection: Ref<MainQuestSection> = ref(allSections[allSections.length - 1])
const isChangingEndSection = ref(false)
const selectSection = (section: MainQuestSection) => {
  if (isChangingEndSection.value) {
    if (!section.isEqual(endSection.value) && section.index >= startSection.value.index) {
      endSection.value = section
    }
  } else if (!section.isEqual(startSection.value)) {
    if (section.index <= endSection.value.index) {
      startSection.value = section
    }
  }
}

interface ChapterItemDisplayed {
  id: number
  name: string
  sections: MainQuestSection[]
}

const displayedChapterItems = computed(() => {
  const selecteds: ChapterItemDisplayed[] = []
  const frontUnselecteds: ChapterItemDisplayed[] = []
  const backUnselecteds: ChapterItemDisplayed[] = []
  const allSelectedSections: MainQuestSection[] = []

  /**
   *  | -- front -- | -- selected -- | -- end -- |
   *  A             B                C           D
   */
  chapterItems.forEach(({ chapter, sections }) => {
    // A >= chapter > B
    if (chapter.chapterId > endSection.value.chapterId) {
      frontUnselecteds.push({
        id: chapter.chapterId,
        name: chapter.name,
        sections: sections.slice(),
      })
      return
    }
    // C > chapter >= D
    if (chapter.chapterId < startSection.value.chapterId) {
      backUnselecteds.push({
        id: chapter.chapterId,
        name: chapter.name,
        sections: sections.slice(),
      })
      return
    }
    // B > chapter > C
    if (
      chapter.chapterId > startSection.value.chapterId &&
      chapter.chapterId < endSection.value.chapterId
    ) {
      selecteds.push({
        id: chapter.chapterId,
        name: chapter.name,
        sections: sections.slice(),
      })
      allSelectedSections.push(...sections)
      return
    }

    // chapter == B || chapter == C || chapter == B == C
    const frontUnselectedSections: MainQuestSection[] = []
    const selectedSections: MainQuestSection[] = []
    const backUnselectedSections: MainQuestSection[] = []

    sections.forEach(section => {
      if (
        chapter.chapterId === endSection.value.chapterId &&
        section.sectionId > endSection.value.sectionId
      ) {
        frontUnselectedSections.push(section)
        return
      }
      if (
        chapter.chapterId === startSection.value.chapterId &&
        section.sectionId < startSection.value.sectionId
      ) {
        backUnselectedSections.push(section)
        return
      }

      selectedSections.push(section)
      allSelectedSections.push(section)
    })

    let name = chapter.name
    if (frontUnselectedSections.length > 0) {
      frontUnselecteds.push({
        id: chapter.chapterId,
        name: name,
        sections: frontUnselectedSections,
      })
      name = ''
    }
    if (selectedSections.length > 0) {
      selecteds.push({
        id: chapter.chapterId,
        name: name,
        sections: selectedSections,
      })
      name = ''
    }
    if (backUnselectedSections.length > 0) {
      backUnselecteds.push({
        id: chapter.chapterId,
        name: '',
        sections: backUnselectedSections,
      })
    }
  })

  return { selecteds, frontUnselecteds, backUnselecteds, selectedSections: allSelectedSections }
})

watch(
  () => displayedChapterItems.value.selectedSections,
  value => {
    emit('selected-sections-changed', value)
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <div
      class="max-h-[32rem] overflow-y-auto border wd:min-w-96"
      :class="isChangingEndSection ? 'border-cyan-60' : 'border-primary-10'"
    >
      <div v-if="displayedChapterItems.frontUnselecteds.length > 0">
        <div v-for="{ id, name, sections } in displayedChapterItems.frontUnselecteds" :key="id">
          <div v-if="name" class="px-3 pt-2 text-sm text-gray-40">
            {{ `${id.toString().padStart(2, '0')}. ${name}` }}
          </div>
          <CardRowsDelegation @row-clicked="selectSection">
            <MainQuestSectionItem
              v-for="section in sections"
              :key="section.sectionId"
              :section="section"
            />
          </CardRowsDelegation>
        </div>
      </div>
      <div class="border border-primary-40">
        <div v-for="{ id, name, sections } in displayedChapterItems.selecteds" :key="id">
          <div v-if="name" class="px-3 pt-2 text-sm text-gray-40">
            {{ `${id.toString().padStart(2, '0')}. ${name}` }}
          </div>
          <CardRowsDelegation class="mt-1" @row-clicked="selectSection">
            <MainQuestSectionItem
              v-for="section in sections"
              :key="section.sectionId"
              :section="section"
            />
          </CardRowsDelegation>
        </div>
      </div>
      <div v-if="displayedChapterItems.backUnselecteds.length > 0">
        <div v-for="{ id, name, sections } in displayedChapterItems.backUnselecteds" :key="id">
          <div v-if="name" class="px-3 pt-2 text-sm text-gray-40">
            {{ `${id.toString().padStart(2, '0')}. ${name}` }}
          </div>
          <CardRowsDelegation @row-clicked="selectSection">
            <MainQuestSectionItem
              v-for="section in sections"
              :key="section.sectionId"
              :section="section"
            />
          </CardRowsDelegation>
        </div>
      </div>
    </div>
    <div class="mt-4">
      <cy-button-toggle v-model:selected="isChangingEndSection" color="cyan">
        {{ t('main-quest-calc.change-end-section-title') }}
      </cy-button-toggle>
    </div>
  </div>
</template>
