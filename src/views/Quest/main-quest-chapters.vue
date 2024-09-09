<script lang="ts" setup>
import { type Ref, computed, ref, watch } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { MainQuestChapter, MainQuestSection } from '@/lib/Quest/Quest'

import CardRowsDelegation from '@/components/card/card-rows-delegation.vue'

import MainQuestSectionItem from './main-quest-section-item.vue'

interface Emits {
  (evt: 'selected-sections-changed', sections: MainQuestSection[]): void
}

const emit = defineEmits<Emits>()

const { mainQuestChapters, mainQuestSections } = Grimoire.Quest

interface ChapterItem {
  chapter: MainQuestChapter
  sections: MainQuestSection[]
}

const chapterItems: ChapterItem[] = []
const allSections = [...mainQuestSections.values()]
const startSection: Ref<MainQuestSection> = ref(allSections[0])

for (const chapter of mainQuestChapters.values()) {
  const sections = allSections
    .filter(section => section.chapterId === chapter.chapterId)
    .reverse()
  chapterItems.unshift({ chapter, sections })
}

interface ChapterItemDisplayed {
  id: number
  name: string
  sections: MainQuestSection[]
}

const displayedChapterItems = computed(() => {
  const selecteds: ChapterItemDisplayed[] = []
  const unselecteds: ChapterItemDisplayed[] = []
  const allSelectedSections: MainQuestSection[] = []
  let selectedFlag = true

  chapterItems.forEach(({ chapter, sections }) => {
    const selectedSections: MainQuestSection[] = []
    const unselectedSections: MainQuestSection[] = []

    sections.forEach(section => {
      if (selectedFlag) {
        selectedSections.push(section)
        allSelectedSections.push(section)
      } else {
        unselectedSections.push(section)
      }
      if (
        selectedFlag &&
        section.chapterId === startSection.value.chapterId &&
        section.sectionId <= startSection.value.sectionId
      ) {
        selectedFlag = false
      }
    })

    if (selectedSections.length === 0) {
      unselecteds.push({
        id: chapter.chapterId,
        name: chapter.name,
        sections: unselectedSections,
      })
    } else {
      selecteds.push({
        id: chapter.chapterId,
        name: chapter.name,
        sections: selectedSections,
      })
      unselecteds.push({
        id: chapter.chapterId,
        name: '',
        sections: unselectedSections,
      })
    }
  })

  return { selecteds, unselecteds, selectedSections: allSelectedSections }
})

watch(
  () => displayedChapterItems.value.selectedSections,
  value => {
    emit('selected-sections-changed', value)
  },
  { immediate: true }
)

const selectStartSection = (section: MainQuestSection) => {
  startSection.value = section
}
</script>

<template>
  <div>
    <div class="border border-primary-40">
      <div
        v-for="{ id, name, sections } in displayedChapterItems.selecteds"
        :key="id"
      >
        <div v-if="name" class="px-3 pt-2 text-sm text-gray-40">
          {{ `${id.toString().padStart(2, '0')}. ${name}` }}
        </div>
        <CardRowsDelegation class="mt-1" @row-clicked="selectStartSection">
          <MainQuestSectionItem
            v-for="section in sections"
            :key="section.sectionId"
            :section="section"
          />
        </CardRowsDelegation>
      </div>
    </div>
    <div class="border border-t-0 border-primary-10">
      <div
        v-for="{ id, name, sections } in displayedChapterItems.unselecteds"
        :key="id"
      >
        <div v-if="name" class="px-3 pt-2 text-sm text-gray-40">
          {{ `${id.toString().padStart(2, '0')}. ${name}` }}
        </div>
        <CardRowsDelegation @row-clicked="selectStartSection">
          <MainQuestSectionItem
            v-for="section in sections"
            :key="section.sectionId"
            :section="section"
          />
        </CardRowsDelegation>
      </div>
    </div>
  </div>
</template>
