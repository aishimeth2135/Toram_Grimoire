<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { numberWithCommas } from '@/shared/utils/number'

import { CHARACTER_MAX_LEVEL } from '@/lib/Character/Character'
import { MainQuestSection } from '@/lib/Quest/Quest'
import type { MainQuestSectionIndex } from '@/lib/Quest/Quest'
import { QuestItemType } from '@/lib/Quest/Quest/enums'

import CommonPropNumberInput from '@/views/CharacterSimulator/common/common-prop-number-input.vue'

import MainQuestChaptersExpRate from './main-quest-chapters-exp-rate.vue'

interface Props {
  selectedQuestSections: MainQuestSection[]
}

const props = defineProps<Props>()
const { t } = useI18n()

const characterStartLevel = ref(1)
const characterStartPercentage = ref(0)
const diaryRounds = ref(1)

const firstSection = computed<MainQuestSection | null>(
  () => props.selectedQuestSections[props.selectedQuestSections.length - 1] ?? null
)
const lastSection = computed(() => props.selectedQuestSections[0])

const skippedSubSectionIds = reactive(new Set<MainQuestSectionIndex>())

const skippableSubSectionItems = computed(() => {
  return props.selectedQuestSections
    .filter(section => section.hasSubSection() && section.skippableExp !== 0)
    .map(section => ({
      section,
      name: section.skippableSubSection,
      exp: section.skippableExp,
    }))
})

const toggleSkippedSubSection = (id: MainQuestSectionIndex) => {
  if (skippedSubSectionIds.has(id)) {
    skippedSubSectionIds.delete(id)
  } else {
    skippedSubSectionIds.add(id)
  }
}

const expSum = computed(() => {
  let resultRxp = props.selectedQuestSections.reduce((cur, section) => cur + section.exp, 0)
  resultRxp += skippableSubSectionItems.value
    .filter(({ section }) => !skippedSubSectionIds.has(section.index))
    .reduce((cur, { exp }) => cur + exp, 0)
  return resultRxp
})

const getRequiredExp = (currentLevel: number) => {
  return Math.floor(currentLevel ** 4 / 40) + currentLevel * 2
}

const levelDiff = computed(() => {
  const startPercentageExp = Math.floor(
    (getRequiredExp(characterStartLevel.value) * characterStartPercentage.value) / 100
  )
  let remainingExp = expSum.value * diaryRounds.value + startPercentageExp
  let requiredExp = 0
  let currentLevel = characterStartLevel.value

  while (true) {
    requiredExp = getRequiredExp(currentLevel)
    if (requiredExp > remainingExp) {
      break
    }
    remainingExp -= requiredExp
    currentLevel += 1
  }

  return {
    level: currentLevel,
    percentage: Math.floor((remainingExp * 100) / requiredExp),
  }
})

const submitItemDatas = computed(() => {
  return props.selectedQuestSections
    .filter(
      section =>
        section.hasSubmitItem() &&
        section.submitItems!.some(item => item.type === QuestItemType.Item)
    )
    .reverse()
    .map(section => ({
      section,
      items: section.submitItems!.filter(item => item.type === QuestItemType.Item),
    }))
})
</script>

<template>
  <div v-if="firstSection">
    <div class="border-b border-primary-30 px-1.5 py-0.5 text-sm text-primary-30">
      {{ t('main-quest-calc.common-settings-title') }}
    </div>
    <div class="mt-3 flex flex-wrap items-center space-x-4">
      <CommonPropNumberInput
        v-model:value="characterStartLevel"
        :title="t('main-quest-calc.character-start-level-title')"
        :range="[1, CHARACTER_MAX_LEVEL]"
      />
      <CommonPropNumberInput
        v-model:value="characterStartPercentage"
        :title="t('main-quest-calc.character-start-level-percentage-title')"
        :range="[0, 100]"
        unit="%"
      />
    </div>
    <div class="mt-3">
      <CommonPropNumberInput
        v-model:value="diaryRounds"
        :title="t('main-quest-calc.diary-rounds')"
        :range="[1, null]"
      />
    </div>
    <div class="mt-6 border-b border-primary-30 px-1.5 py-0.5 text-sm text-primary-30">
      {{ t('main-quest-calc.select-skipped-sub-section-title') }}
    </div>
    <div v-if="skippableSubSectionItems.length > 0" class="mt-4 space-y-2">
      <div v-for="{ section, name, exp } in skippableSubSectionItems" :key="section.index">
        <div class="px-1.5 text-sm text-gray-40">
          {{ `${section.chapterId}.${section.sectionId} ${section.name}` }}
        </div>
        <div class="mt-2 flex items-start">
          <cy-button-check
            :selected="skippedSubSectionIds.has(section.index)"
            @update:selected="toggleSkippedSubSection(section.index)"
          />
          <div class="ml-2">
            <div class="text-primary-80">
              {{ name }}
            </div>
            <div class="text-sm text-primary-50">
              {{ numberWithCommas(exp) }}
              <span class="text-primary-30">EXP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-6 border-b border-primary-30 px-1.5 py-0.5 text-sm text-primary-30">
      {{ t('main-quest-calc.calc-result-title') }}
    </div>
    <div class="mt-4 px-2">
      <div class="text-sm text-gray-50">
        {{ t('main-quest-calc.selected-section-range-title') }}
      </div>
      <div class="mt-0.5 text-primary-80">
        <span>{{ `${firstSection.chapterId}.${firstSection.sectionId}` }}</span>
        <cy-icon icon="mdi:arrow-right" width="1rem" class="mx-3 text-primary-30" />
        <span>{{ `${lastSection.chapterId}.${lastSection.sectionId}` }}</span>
      </div>
      <div class="mt-3 text-sm text-gray-50">
        {{ t('main-quest-calc.exp-sum-title') }}
      </div>
      <div class="mt-0.5 flex items-center space-x-1 text-primary-80">
        <span>{{ numberWithCommas(expSum) }}</span>
        <span class="text-primary-30">EXP</span>
        <template v-if="diaryRounds > 1">
          <cy-icon icon="mdi-close" width="1rem" class="text-primary-30" />
          <span class="text-primary-50">{{ diaryRounds }}</span>
        </template>
      </div>
      <div class="mt-3 text-sm text-gray-50">
        {{ t('main-quest-calc.character-level-diff-title') }}
      </div>
      <div class="mt-0.5 flex items-center text-primary-80">
        <span>
          {{ `Lv.${characterStartLevel}` }}
        </span>
        <span v-if="characterStartPercentage > 0" class="ml-2 text-primary-50">
          {{ `${characterStartPercentage}%` }}
        </span>
        <cy-icon icon="mdi:arrow-right" width="1rem" class="ml-3 text-primary-30" />
        <span class="ml-3">
          {{ `Lv.${levelDiff.level}` }}
        </span>
        <span class="ml-2 text-primary-50">
          {{ `${levelDiff.percentage}%` }}
        </span>
      </div>
      <MainQuestChaptersExpRate
        class="mt-4"
        :selected-quest-sections="selectedQuestSections"
        :skipped-sub-section-ids="skippedSubSectionIds"
      />
    </div>
    <div class="mt-6 border-b border-primary-30 px-1.5 py-0.5 text-sm text-primary-30">
      {{ t('main-quest-calc.submit-items-title') }}
    </div>
    <div class="mt-4 space-y-3 px-1.5">
      <div v-for="{ section, items } in submitItemDatas" :key="section.index" class="text-sm">
        <div class="text-sm text-gray-40">
          {{ `${section.chapterId}.${section.sectionId} ${section.name}` }}
        </div>
        <div class="mt-1 space-y-0.5">
          <div v-for="item in items" :key="item.name" class="flex items-center">
            <span>{{ item.name }}</span>
            <span class="ml-1 text-primary-50">
              {{ `×${item.quantity}` }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
