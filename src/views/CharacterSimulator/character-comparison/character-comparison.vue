<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import type { Character } from '@/lib/Character/Character'
import {
  CHARACTER_COMPARISON_BUILD_TABLE_LIMIT,
  CHARACTER_COMPARISON_CHARACTER_LIMIT,
  CHARACTER_COMPARISON_TABLE_LIMIT,
  type CharacterComparisonTableBuild,
} from '@/lib/Character/CharacterComparisonTable'

import CharacterDashboardSection from '../character-dashboard/character-dashboard-section.vue'
import CharacterComparisonTableEditor from './character-comparison-table-editor.vue'
import CharacterComparisonTable from './character-comparison-table.vue'

import { useCharacterComparisonColumns } from './setup'

const { t } = useI18n()
const characterStore = useCharacterStore()
const currentTab = ref<'overview' | 'select'>('overview')
const build = computed<CharacterComparisonTableBuild>(
  () => characterStore.currentCharacter.comparisonTableBuild
)
const otherCharacters = computed<Character[]>(() =>
  characterStore.characters.filter(character => character.id !== characterStore.currentCharacter.id)
)
const comparedCharacters = computed<Character[]>(() =>
  build.value.comparedCharacters.filter(character =>
    otherCharacters.value.some(item => item.id === character.id)
  )
)
const columns = useCharacterComparisonColumns(comparedCharacters)
const isCompared = (character: Character) =>
  comparedCharacters.value.some(item => item.id === character.id)
</script>

<template>
  <CharacterDashboardSection
    :title="t('character-simulator.character-comparison.title')"
    title-icon="mdi:table-account"
  >
    <div class="px-4">
      <cy-tabs v-model="currentTab">
        <cy-tab value="overview">
          {{ t('character-simulator.character-comparison.overview') }}
        </cy-tab>
        <cy-tab value="select">
          {{ t('character-simulator.character-comparison.select-tables') }}
        </cy-tab>
      </cy-tabs>
    </div>
    <div v-if="currentTab === 'overview'" class="border-primary-10 border-t p-4">
      <div class="gap-icon text-primary-30 mb-2 inline-flex items-start px-2 text-sm">
        <cy-icon icon="ic-outline-info" small class="icon-first-line text-primary-30" />
        {{
          t('character-simulator.character-comparison.compare-characters', {
            num: CHARACTER_COMPARISON_CHARACTER_LIMIT,
          })
        }}
      </div>
      <div class="mb-4 flex flex-wrap gap-1">
        <div
          class="border-primary-20 gap-icon text-primary-70 mr-2 flex items-center border px-3 py-1"
        >
          <cy-icon icon="ic:round-check-circle-outline" />
          {{ characterStore.currentCharacter.name }}
        </div>
        <cy-button-check
          v-for="character in otherCharacters"
          :key="character.id"
          :selected="isCompared(character)"
          :disabled="
            !isCompared(character) &&
            comparedCharacters.length >= CHARACTER_COMPARISON_CHARACTER_LIMIT
          "
          @click="build.toggleCharacter(character)"
        >
          {{ character.name }}
        </cy-button-check>
      </div>
      <div v-if="build.tables.length" class="flex flex-col gap-3">
        <CharacterComparisonTable
          v-for="table in build.tables"
          :key="table.id"
          :table="table"
          :columns="columns"
        />
      </div>
      <div v-else class="text-primary-40 text-sm">
        {{ t('character-simulator.character-comparison.no-tables') }}
      </div>
    </div>
    <div v-else class="border-primary-10 border-t p-4">
      <div class="gap-icon text-primary-30 mb-1 flex items-start text-sm">
        <cy-icon icon="ic-outline-info" small class="icon-first-line text-primary-30" />
        {{
          t('character-simulator.character-comparison.table-limits', {
            selected: build.tables.length,
            selectionLimit: CHARACTER_COMPARISON_BUILD_TABLE_LIMIT,
            total: characterStore.comparisonTables.length,
            totalLimit: CHARACTER_COMPARISON_TABLE_LIMIT,
          })
        }}
      </div>
      <div class="gap-icon text-primary-30 mb-4 flex items-start text-sm">
        <cy-icon icon="ic-outline-info" small class="icon-first-line text-primary-30" />
        {{ t('character-simulator.character-comparison.shared-tables-tips') }}
      </div>
      <div class="flex flex-col gap-3">
        <CharacterComparisonTableEditor
          v-for="table in characterStore.comparisonTables"
          :key="table.id"
          :table="table"
          @update:name="table.name = $event"
        />
        <button
          type="button"
          class="border-primary-20 hover:border-primary-50 text-primary-40 hover:text-primary-60 cursor-pointer rounded-sm border p-6 duration-150"
          :disabled="characterStore.comparisonTables.length >= CHARACTER_COMPARISON_TABLE_LIMIT"
          @click="characterStore.appendComparisonTable()"
        >
          <div class="gap-icon flex items-center">
            <cy-icon icon="mdi:plus" />
            {{ t('global.create') }}
          </div>
        </button>
      </div>
    </div>
  </CharacterDashboardSection>
</template>
