<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useNotify } from '@/shared/composables/Notify'

import {
  BodyArmorTypeList,
  CharacterEquipment,
  MainWeaponTypeList,
} from '@/lib/Character/CharacterEquipment'
import { StatRestriction } from '@/lib/Character/Stat'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'

import { type EquipmentStatCombination, useEquipmentStatCombinations } from './setup'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const { t } = useI18n()
const notify = useNotify()
const { mainWeapon, bodyArmor } = useEquipmentStatCombinations()

type SectionId = 'positive' | 'negative'

const currentSectionId = ref<SectionId>('positive')

interface ReplacementSection {
  id: SectionId
  title: string
  combinations: EquipmentStatCombination[]
}

const replacementSections = computed(() => {
  const type = props.equipment.type
  const combinations = MainWeaponTypeList.includes(type)
    ? mainWeapon
    : BodyArmorTypeList.includes(type)
      ? bodyArmor
      : null
  if (!combinations) {
    return null
  }

  return {
    positive: {
      id: 'positive',
      title: t('character-simulator.select-stats.quick-replace-positive'),
      combinations: combinations.positive.value,
    },
    negative: {
      id: 'negative',
      title: t('character-simulator.select-stats.quick-replace-negative'),
      combinations: combinations.negative.value,
    },
  } satisfies Record<SectionId, ReplacementSection>
})

const currentSection = computed(() => {
  if (!replacementSections.value) {
    return null
  }
  return currentSectionId.value === 'positive'
    ? replacementSections.value.positive
    : replacementSections.value.negative
})

const replaceStats = (combination: EquipmentStatCombination, sectionId: SectionId) => {
  if (replacementSections.value === null) {
    return
  }

  const isPositive = sectionId === 'positive'
  const equipment = props.equipment
  const previousStats = equipment.stats.map(stat => stat.clone())
  const remainingStats = equipment.stats.filter(stat =>
    isPositive ? stat.value < 0 : stat.value >= 0
  )
  const replacementStats = combination.stats.map(stat =>
    StatRestriction.create(stat.base, stat.type, isPositive ? 1 : 0, stat.restriction)
  )
  if (isPositive) {
    equipment.stats = [...replacementStats, ...remainingStats]
  } else {
    equipment.stats = [...remainingStats, ...replacementStats]
  }
  notify.undo(t('character-simulator.select-stats.quick-replace-success'), {
    label: t('global.recovery'),
    onUndo: () => {
      equipment.stats = previousStats
    },
  })
}
</script>

<template>
  <div v-if="currentSection" class="flex h-full flex-col gap-2 overflow-y-auto pr-1">
    <div
      class="flex shrink-0 cursor-pointer items-center gap-3 text-sm"
      @click="currentSectionId = currentSectionId === 'positive' ? 'negative' : 'positive'"
    >
      <div
        v-for="section in replacementSections"
        :key="section.id"
        :class="section.id === currentSectionId ? 'text-primary-70' : 'text-primary-40'"
      >
        {{ section.title }}
      </div>
    </div>
    <div class="flex min-h-0 grow flex-col">
      <CardRowsWrapper class="divide-primary-10 max-h-full divide-y overflow-y-auto">
        <button
          v-for="combination in currentSection.combinations"
          :key="combination.id"
          type="button"
          class="hover:bg-primary-5 flex w-full cursor-pointer flex-wrap items-center gap-x-3 px-4 py-2"
          :class="currentSectionId === 'positive' ? 'text-primary-80' : 'text-primary-50'"
          @click="replaceStats(combination, currentSection.id)"
        >
          <span v-for="(stat, idx) in combination.stats" :key="idx">
            {{ stat.title }}
          </span>
        </button>
        <div
          v-if="currentSection.combinations.length === 0"
          class="text-primary-30 px-4 py-2 text-sm"
        >
          {{ t('common.tips.search-no-result') }}
        </div>
      </CardRowsWrapper>
    </div>
  </div>
</template>
