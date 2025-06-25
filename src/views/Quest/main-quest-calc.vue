<script lang="ts" setup>
import { shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { MainQuestSection } from '@/lib/Quest/Quest'

import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import MainQuestCalcOverview from './main-quest-calc-overview.vue'
import MainQuestChapters from './main-quest-chapters.vue'

const selectedSections = shallowRef([] as MainQuestSection[])

const { t } = useI18n()
</script>

<template>
  <AppLayoutMain>
    <div class="wd:flex">
      <div class="my-4 px-3">
        <div class="border-b border-primary-30 px-1.5 py-0.5 text-sm text-primary-30">
          {{ t('main-quest-calc.select-start-section-title') }}
        </div>
        <div class="mt-4 max-h-[32rem] overflow-y-auto wd:min-w-96">
          <MainQuestChapters @selected-sections-changed="selectedSections = $event" />
        </div>
      </div>
      <div class="grow px-3 py-4 wd:ml-2">
        <MainQuestCalcOverview :selected-quest-sections="selectedSections" />
      </div>
    </div>
  </AppLayoutMain>
</template>
