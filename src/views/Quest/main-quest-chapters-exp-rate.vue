<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToggle } from '@/shared/setup/State'
import { numberToFixed } from '@/shared/utils/number'

import type { MainQuestSection, MainQuestSectionIndex } from '@/lib/Quest/Quest'

interface Props {
  selectedQuestSections: MainQuestSection[]
  skippedSubSectionIds: Set<MainQuestSectionIndex>
}

const props = defineProps<Props>()
const { t } = useI18n()

const expRateVisible = ref(false)
const toggleExpRateVisible = useToggle(expRateVisible)

const getSectionRealExp = (section: MainQuestSection) => {
  let sectionExp = section.exp
  if (!props.skippedSubSectionIds.has(section.index)) {
    sectionExp += section.skippableExp
  }
  return sectionExp
}

const displayDatas = computed(() => {
  type ChapterExpData = {
    expSum: number
    sections: MainQuestSection[]
  }

  let totalExpSum = 0
  const chapterSections = new Map<number, ChapterExpData>()

  props.selectedQuestSections.forEach(section => {
    if (!chapterSections.has(section.chapterId)) {
      chapterSections.set(section.chapterId, {
        expSum: 0,
        sections: [],
      })
    }
    const expData = chapterSections.get(section.chapterId)!
    expData.sections.push(section)
    const sectionExp = getSectionRealExp(section)
    totalExpSum += sectionExp
    expData.expSum += sectionExp
  })

  const results: {
    id: number | string
    title: string
    expRate: number
    titleClass: string
    barClass: string
  }[] = []

  Array.from(chapterSections).forEach(([chapterId, chapterExpData]) => {
    results.push({
      id: chapterId,
      title: `${chapterId.toString().padStart(2, '0')}.`,
      expRate: numberToFixed((chapterExpData.expSum * 100) / totalExpSum, 1),
      titleClass: 'text-gray-40',
      barClass: 'bg-primary-50',
    })
  })

  console.log(props.selectedQuestSections, chapterSections)

  return results
})
</script>

<template>
  <div class="w-full max-w-[30rem]">
    <div
      class="flex cursor-pointer items-center text-sm"
      :class="expRateVisible ? 'text-primary-70' : 'text-primary-40'"
      @click="toggleExpRateVisible"
    >
      {{ t('main-quest-calc.exp-rate-overview-button-title') }}
      <cy-icon
        :icon="expRateVisible ? 'ic:round-keyboard-arrow-down' : 'ic:round-keyboard-arrow-up'"
        :class="expRateVisible ? 'text-primary-70' : 'text-primary-40'"
        class="ml-1"
      />
    </div>
    <div v-if="expRateVisible" class="mt-2 w-full space-y-0.5">
      <div v-for="data in displayDatas" :key="data.id" class="flex w-full items-center">
        <div class="mr-2 w-6 shrink-0" :class="data.titleClass">
          {{ data.title }}
        </div>
        <div class="flex grow items-center">
          <div class="h-3" :class="data.barClass" :style="{ width: `${data.expRate}%` }" />
          <div class="ml-2 shrink-0 text-primary-50">
            {{ `${data.expRate}%` }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
