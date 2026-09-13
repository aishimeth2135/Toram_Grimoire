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
      <div class="px-3">
        <div class="wd:sticky top-0 flex flex-col py-4">
          <div class="border-primary-30 text-primary-30 border-b px-1.5 py-0.5 text-sm">
            {{ t('main-quest-calc.select-start-section-title') }}
          </div>
          <MainQuestChapters class="mt-4" @selected-sections-changed="selectedSections = $event" />
        </div>
      </div>
      <div class="wd:ml-2 grow px-3 py-4">
        <MainQuestCalcOverview :selected-quest-sections="selectedSections" />
      </div>
    </div>
  </AppLayoutMain>
</template>
