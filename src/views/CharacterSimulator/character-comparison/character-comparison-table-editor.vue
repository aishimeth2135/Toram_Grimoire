<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import Grimoire from '@/shared/Grimoire'

import type { CharacterStat } from '@/lib/Character/Character'
import {
  CHARACTER_COMPARISON_BUILD_TABLE_LIMIT,
  CHARACTER_COMPARISON_TABLE_LIMIT,
  type CharacterComparisonTable,
  type CharacterComparisonTableBuild,
} from '@/lib/Character/CharacterComparisonTable'

import CommonEditModeButton from '../common/common-edit-mode-button.vue'
import CommonSearchableItemsPopover from '../common/common-searchable-items-popover.vue'

interface Props {
  table: CharacterComparisonTable
}
interface Emits {
  (evt: 'update:name', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const characterStore = useCharacterStore()
const build = computed<CharacterComparisonTableBuild>(
  () => characterStore.currentCharacter.comparisonTableBuild
)
const selected = computed(() => build.value.tables.some(table => table.id === props.table.id))
const isEditing = ref(false)
const searchText = ref('')
const statOptions = computed<CharacterStat[]>(() => {
  const search = searchText.value.trim().toLocaleLowerCase()
  return Grimoire.Character.characterStatCategoryList
    .flatMap(category => category.stats)
    .filter(
      stat =>
        stat.options.hidden !== 0 &&
        (!search || stat.name.toLocaleLowerCase().includes(search) || stat.id.includes(search))
    )
})
const selectedStats = computed<CharacterStat[]>(() => {
  const available = Grimoire.Character.characterStatCategoryList.flatMap(category => category.stats)
  return props.table.characterStatIds
    .map(id => available.find(stat => stat.id === id && stat.options.hidden !== 0))
    .filter((stat): stat is CharacterStat => !!stat)
})
</script>

<template>
  <div
    class="pb-4.5 flex gap-2 rounded-sm border p-3"
    :class="selected ? 'border-primary-50' : 'border-primary-20'"
  >
    <div v-if="isEditing" class="grow">
      <div class="flex flex-wrap items-center gap-3">
        <cy-title-input
          :value="table.name"
          icon="ic:baseline-drive-file-rename-outline"
          @update:value="emit('update:name', $event)"
        />
        <cy-button-circle
          icon="bx:copy-alt"
          small
          :disabled="characterStore.comparisonTables.length >= CHARACTER_COMPARISON_TABLE_LIMIT"
          @click="characterStore.appendComparisonTable(table.clone())"
        />
        <cy-button-circle
          icon="ic-baseline-delete-outline"
          color="secondary"
          small
          @click="characterStore.removeComparisonTable(table)"
        />
      </div>
      <div class="mt-2 flex flex-col items-start px-1">
        <div class="border-primary-20 rounded-full border">
          <CommonSearchableItemsPopover
            v-model:search-text="searchText"
            :items="statOptions"
            :selected-item-ids="table.characterStatIds"
            class="pl-4.5 py-1.5 pr-4"
            @select-item="table.toggleCharacterStatIds($event.id)"
          >
            <span class="text-primary-60 text-sm">
              {{ t('character-simulator.character-comparison.select-stats') }}
            </span>
            <template #item="{ item }">{{ item.name }}</template>
          </CommonSearchableItemsPopover>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-2 px-2">
        <button
          v-for="stat in selectedStats"
          :key="stat.id"
          type="button"
          class="border-primary-20 text-primary-60 hover:border-primary-40 gap-icon flex cursor-pointer items-center rounded-sm border px-2 py-1 text-sm duration-150"
          @click="table.toggleCharacterStatIds(stat.id)"
        >
          {{ stat.name }}
          <cy-icon icon="mdi:close" small />
        </button>
      </div>
    </div>
    <div v-else class="grow">
      <div>
        <cy-button-toggle
          :selected="selected"
          :disabled="!selected && build.tables.length >= CHARACTER_COMPARISON_BUILD_TABLE_LIMIT"
          @click="build.toggleTable(table)"
        >
          {{ table.name }}
        </cy-button-toggle>
      </div>
      <div class="mt-1 flex flex-wrap gap-2 px-2">
        <span
          v-for="stat in selectedStats"
          :key="stat.id"
          class="border-primary-20 text-primary-60 rounded-sm border px-2 py-1 text-sm"
        >
          {{ stat.name }}
        </span>
      </div>
    </div>
    <div class="shrink-0">
      <CommonEditModeButton v-model:is-editing="isEditing" vertical />
    </div>
  </div>
</template>
