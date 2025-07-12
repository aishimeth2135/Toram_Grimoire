<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { numberWithCommas } from '@/shared/utils/number'

import { MainQuestSection } from '@/lib/Quest/Quest'

import CardRow from '@/components/card/card-row.vue'

interface Props {
  section: MainQuestSection
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <CardRow :item="section" class="flex cursor-pointer px-3 py-2">
    <div class="mr-2 text-primary-30">
      {{ section.sectionId.toString().padStart(2, '0') }}
    </div>
    <div>
      <div class="text-primary-80">
        {{ section.name }}
      </div>
      <div class="text-sm text-primary-50">
        {{ numberWithCommas(section.exp) }}
        <span class="text-primary-30">EXP</span>
      </div>
      <template v-if="section.hasSubSection()">
        <div class="mt-2 flex items-center text-gray-50">
          <span>{{ section.skippableSubSection }}</span>
          <span class="ml-2 text-sm text-orange-50">
            {{ t('main-quest-calc.skippable-sub-section-annotation') }}
          </span>
        </div>
        <div class="text-sm text-primary-50">
          {{ numberWithCommas(section.skippableExp) }}
          <span class="text-primary-30">EXP</span>
        </div>
      </template>
    </div>
  </CardRow>
</template>
