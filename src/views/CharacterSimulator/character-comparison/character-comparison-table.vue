<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import type { CharacterStat } from '@/lib/Character/Character'
import type { CharacterComparisonTable } from '@/lib/Character/CharacterComparisonTable'

import CharacterDashboardSection from '../character-dashboard/character-dashboard-section.vue'

import type { CharacterComparisonColumn } from './setup'

interface Props {
  table: CharacterComparisonTable
  columns: CharacterComparisonColumn[]
}

const props = defineProps<Props>()
const { t } = useI18n()
const stats = computed<CharacterStat[]>(() => {
  const available = Grimoire.Character.characterStatCategoryList.flatMap(category => category.stats)
  return props.table.characterStatIds
    .map(id => available.find(stat => stat.id === id && stat.options.hidden !== 0))
    .filter((stat): stat is CharacterStat => !!stat)
})

const displayValue = (column: CharacterComparisonColumn, id: string) => {
  const stat = column.stats.get(id)
  return !stat || stat.hidden ? '-' : stat.displayValue
}
</script>

<template>
  <CharacterDashboardSection :title="table.name" title-icon="mdi:table" level="secondary">
    <div v-if="stats.length" class="w-full overflow-x-auto px-2 py-3">
      <table
        class="w-full table-fixed border-0"
        :style="{ minWidth: `${8 * (columns.length + 1)}rem` }"
      >
        <thead>
          <tr>
            <th
              scope="col"
              class="border-primary-30 text-primary-40 border-b px-3 py-1.5 text-left text-sm font-normal"
            >
              {{ t('character-simulator.character-stats') }}
            </th>
            <th
              v-for="column in columns"
              :key="column.character.id"
              scope="col"
              class="border-primary-30 text-primary-40 truncate whitespace-nowrap border-b px-3 py-1.5 text-left text-sm font-normal"
            >
              {{ column.character.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stat in stats" :key="stat.id">
            <th
              scope="row"
              class="border-primary-20 text-gray-70 truncate whitespace-nowrap border-b px-3 py-1.5 text-left text-sm font-normal"
            >
              {{ stat.name }}
            </th>
            <td
              v-for="column in columns"
              :key="column.character.id"
              class="border-primary-20 text-primary-80 border-b px-3 py-1.5"
            >
              {{ displayValue(column, stat.id) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-primary-40 p-4 text-sm">
      {{ t('character-simulator.character-comparison.no-stats') }}
    </div>
  </CharacterDashboardSection>
</template>
