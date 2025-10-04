<template>
  <AppLayoutMain>
    <div v-if="searchResult.length > 0" class="py-4">
      <div class="mb-3 flex items-end" style="display: none">
        <cy-button-icon
          :icon="
            hasBookmark
              ? 'material-symbols:bookmark-added-rounded-sm'
              : 'material-symbols:bookmark-add-outline-rounded-sm'
          "
          :selected="hasBookmark"
          @click="toggleBookmark"
        />
      </div>
      <ItemQueryResult class="min-h-[70vh]" :equipments="searchResult" />
    </div>
    <cy-default-tips v-else icon="mdi-ghost" style="min-height: 30rem">
      {{ t('item-query.no-result-tips') }}
    </cy-default-tips>
    <AppLayoutBottom>
      <template #default>
        <div class="flex items-center">
          <template v-if="state.currentMode === SearchModes.Normal">
            <div class="ml-2 flex w-full items-center">
              <div class="relative flex w-full items-center">
                <cy-icon icon="ic-outline-search" class="shrink-0" />
                <input
                  v-model="modes[SearchModes.Normal].searchText"
                  type="text"
                  class="ml-2 inline-block w-full border-0 p-1"
                  :placeholder="t('global.search')"
                />
              </div>
              <cy-button-icon
                :class="{
                  invisible: modes[SearchModes.Normal].searchText === '',
                }"
                class="shrink-0"
                icon="mdi:close-circle"
                @click="modes[SearchModes.Normal].searchText = ''"
              />
              <cy-button-icon
                icon="heroicons-solid:menu"
                @click="
                  modes[SearchModes.Normal].optionsVisible =
                    !modes[SearchModes.Normal].optionsVisible
                "
              />
            </div>
          </template>
          <template v-else-if="state.currentMode === SearchModes.Stat">
            <cy-button-plain width-full @click="toggleSelectStatModalVisible">
              <template v-if="modes[SearchModes.Stat].currentStats.length === 0">
                {{ t('item-query.options-stat.select-stat.title') }}
              </template>
              <template v-else-if="modes[SearchModes.Stat].currentStats.length === 1">
                {{ modes[SearchModes.Stat].currentStats[0].text }}
              </template>
              <template v-else>
                {{
                  t('item-query.options-stat.select-stat.title-multiple', {
                    num: modes[SearchModes.Stat].currentStats.length,
                  })
                }}
              </template>
            </cy-button-plain>
          </template>
          <template v-else-if="state.currentMode === SearchModes.ItemLevel">
            <div class="flex items-center">
              <cy-icon icon="jam-hammer" class="ml-2" />
              <input
                v-model="itemLevelMinimum"
                type="text"
                placeholder="0"
                class="inline-block w-14 border-0 p-1 text-center"
              />
              <cy-icon icon="mdi-tilde" />
              <input
                v-model="itemLevelMaximum"
                type="text"
                placeholder="300"
                class="inline-block w-14 border-0 p-1 text-center"
              />
            </div>
          </template>
          <template v-else-if="state.currentMode === SearchModes.Dye">
            <div class="flex w-full items-center">
              <div class="relative flex w-full items-center">
                <cy-icon icon="ic-outline-palette" class="ml-2 shrink-0" />
                <input
                  v-model="modes[SearchModes.Dye].searchText"
                  type="text"
                  class="ml-2 inline-block w-full border-0 p-1"
                  :placeholder="t('global.search')"
                />
                <cy-button-icon
                  :class="{
                    invisible: modes[SearchModes.Dye].searchText === '',
                  }"
                  class="shrink-0"
                  icon="mdi:close-circle"
                  @click="modes[SearchModes.Dye].searchText = ''"
                />
              </div>
            </div>
          </template>
        </div>
      </template>
      <template #main-content>
        <AppLayoutBottomContent
          v-if="
            state.currentMode === SearchModes.Normal && modes[SearchModes.Normal].optionsVisible
          "
          class="p-3"
        >
          <cy-icon-text icon="bx-bx-target-lock" small text-color="fuchsia-60">
            {{ t('item-query.options-normal.title') }}
          </cy-icon-text>
          <div class="px-2 py-1">
            <cy-button-check
              v-for="item in modes[SearchModes.Normal].targets"
              :key="item.value"
              v-model:selected="item.selected"
            >
              {{ t('item-query.options-normal.' + item.value) }}
            </cy-button-check>
          </div>
        </AppLayoutBottomContent>
      </template>
      <template #main-start>
        <cy-options
          :value="modes[state.currentMode]"
          :options="Object.entries(modes).map(([id, item]) => ({ id, value: item }))"
          placement="top-start"
          @update:value="selectMode($event.id)"
        >
          <template #title>
            <cy-button-circle icon="ic:baseline-settings" color="blue" />
          </template>
          <template #item="{ value }">
            <cy-icon-text :icon="value.icon">
              {{ t('item-query.modes.' + value.id) }}
            </cy-icon-text>
          </template>
        </cy-options>
      </template>
      <template #side-buttons>
        <cy-button-circle
          v-if="
            state.currentMode === SearchModes.Stat || state.currentMode === SearchModes.ItemLevel
          "
          icon="heroicons-solid:switch-vertical"
          color="orange"
          @click="state.displayMode = state.displayMode === 0 ? 1 : 0"
        />
        <cy-button-circle
          icon="mdi-sort-variant"
          color="blue"
          :selected="sortOptionsVisible"
          float
          toggle
          @click="toggleOptionContents(false).after(toggleSortOptionsVisible)"
        />
        <cy-button-circle
          icon="mdi:filter"
          color="bright"
          :selected="conditionOptionsVisible"
          float
          toggle
          @click="toggleOptionContents(false).after(toggleConditionOptionsVisible)"
        />
      </template>
      <template #side-contents>
        <cy-transition mode="out-in">
          <AppLayoutBottomContent v-if="conditionOptionsVisible">
            <ItemQueryFilterMenu :equipments="equipments" @filter="validEquipments = $event" />
          </AppLayoutBottomContent>
          <AppLayoutBottomContent v-else-if="sortOptionsVisible" class="p-3">
            <div>
              <div>
                <cy-icon-text icon="mdi-sort-variant" color="fuchsia" small>
                  {{ t('item-query.sort-options.title') }}
                </cy-icon-text>
              </div>
              <cy-button-radio-group
                v-model:value="sortState.currentSelected"
                class="px-2 pb-2"
                :options="consts.sortOptions"
              />
            </div>
            <div>
              <div>
                <cy-icon-text icon="fluent-arrow-sort-24-filled" text-color="fuchsia-60" small>
                  {{ t('item-query.sort-options.order.title') }}
                </cy-icon-text>
              </div>
              <cy-button-radio-group
                v-model:value="sortState.currentOrder"
                class="px-2 pb-2"
                :options="consts.sortOrderOptions"
              />
            </div>
          </AppLayoutBottomContent>
        </cy-transition>
      </template>
    </AppLayoutBottom>
    <cy-modal v-model:visible="selectStatModalVisible" vertical-position="start" footer>
      <template #title>
        <cy-icon-text icon="mdi-rhombus-outline">
          {{ t('item-query.options-stat.select-stat.title') }}
        </cy-icon-text>
      </template>
      <template #default>
        <div class="sticky top-0 bg-white">
          <cy-title-input
            v-model:value="modes.stat.statSearchText"
            icon="ic-outline-category"
            :placeholder="t('item-query.options-stat.select-stat.search-placeholder')"
            clearable
          />
        </div>
        <div v-if="statsSearchResult.length !== 0" class="divide-y divide-primary-20">
          <div
            v-for="stat in statsSearchResult"
            :key="stat.origin.statId(stat.type)"
            class="hover:bg-primary-30/10 px-2 py-1 duration-200"
            @click="selectStat(stat)"
          >
            <cy-button-check
              :selected="modes[SearchModes.Stat].currentStats.includes(stat)"
              class="w-full"
            >
              {{ stat.text }}
            </cy-button-check>
          </div>
        </div>
        <cy-default-tips v-else icon="bx-bx-message-rounded-x">
          {{ t('item-query.no-result-tips') }}
        </cy-default-tips>
      </template>
      <template #footer-actions>
        <cy-button-action
          color="orange"
          icon="bx:reset"
          class="mr-auto"
          @click="modes[SearchModes.Stat].currentStats = []"
        >
          {{ t('global.reset') }}
        </cy-button-action>
      </template>
    </cy-modal>
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { BookmarkTypes, useBookmarkStore } from '@/stores/app/bookmark'

import Grimoire from '@/shared/Grimoire'
import { useToggle, useToggleGroup } from '@/shared/setup/State'
import { toFloat, toInt } from '@/shared/utils/number'

import { CharacterEquipment, EquipmentKinds } from '@/lib/Character/CharacterEquipment'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import ItemQueryFilterMenu from './item-query-filter-menu.vue'
import ItemQueryResult from './item-query-result.vue'

import { SearchModes, type StatOption, findObtainByDye, findStat, useItemQueryModes } from './setup'

defineOptions({
  name: 'ItemQuery',
})

const equipments = Grimoire.Items.equipments.map(equip =>
  CharacterEquipment.fromOriginEquipment(equip)
)

const handleCompareValue = (value: string) => toFloat(value) ?? -99999

const { state, modes } = useItemQueryModes()

const conditionOptionsVisible = ref(false)
const toggleConditionOptionsVisible = useToggle(conditionOptionsVisible)
const sortOptionsVisible = ref(false)
const toggleSortOptionsVisible = useToggle(sortOptionsVisible)

const toggleOptionContents = useToggleGroup([
  toggleConditionOptionsVisible,
  toggleSortOptionsVisible,
])

const selectStatModalVisible = ref(false)
const toggleSelectStatModalVisible = useToggle(selectStatModalVisible)

const { t } = useI18n()

const bookmarkStore = useBookmarkStore()
const currentBookmarkItem = computed(() => {
  const item = {
    type: BookmarkTypes.Item,
    payload: '',
  }
  switch (state.currentMode) {
    case SearchModes.Normal:
      item.payload = `${SearchModes.Normal}:${modes[SearchModes.Normal].searchText}`
      break
    case SearchModes.Stat:
      item.payload = `${SearchModes.Stat}:${modes[SearchModes.Stat].currentStats
        .map(stat => stat.origin.statId(stat.type))
        .join(',')}`
      break
    case SearchModes.ItemLevel:
      item.payload = `${SearchModes.ItemLevel}:${
        modes[SearchModes.ItemLevel].min
      }~${modes[SearchModes.ItemLevel].max}`
      break
    case SearchModes.Dye:
      item.payload = `${SearchModes.Dye}:${modes[SearchModes.Dye].searchText}`
      break
  }
  return item
})
const toggleBookmark = () => {
  bookmarkStore.toggleBookmark(currentBookmarkItem.value)
}
const hasBookmark = computed(() => {
  return bookmarkStore.hasBookmark(currentBookmarkItem.value)
})

const sortState = reactive({
  currentSelected: 'default',
  currentOrder: 'down',
})

type SortHandler = (item1: CharacterEquipment, item2: CharacterEquipment) => number

const idComparation = (item1: CharacterEquipment, item2: CharacterEquipment) => {
  const id1 = toInt(item1.origin!.id) ?? -1
  const id2 = toInt(item2.origin!.id) ?? -1
  return id1 - id2
}

const sortOptions: {
  [mode in SearchModes]: {
    default: SortHandler
  }
} & {
  global: Record<string, SortHandler>
} = {
  global: {
    atk: (item1, item2) => {
      const value1 = item1.basicValue + (item1.is(EquipmentKinds.Weapon) ? 9999 : 0),
        value2 = item2.basicValue + (item2.is(EquipmentKinds.Weapon) ? 9999 : 0)
      return value1 - value2
    },
    def: (item1, item2) => {
      const value1 = item1.basicValue + (item1.is(EquipmentKinds.Armor) ? 9999 : 0),
        value2 = item2.basicValue + (item2.is(EquipmentKinds.Armor) ? 9999 : 0)
      return value1 - value2
    },
    stability: (item1, item2) => {
      const value1 = item1.is(EquipmentKinds.Weapon) ? item1.stability : -1,
        value2 = item2.is(EquipmentKinds.Weapon) ? item2.stability : -1
      if (value1 === -1 && value2 === -1) {
        return sortOptions[state.currentMode].default(item1, item2)
      }
      return value1 - value2
    },
    name: (item1, item2) => item1.name.localeCompare(item2.name),
    id: idComparation,
  },
  [SearchModes.Normal]: {
    default: idComparation,
  },
  [SearchModes.Stat]: {
    default: (item1, item2) => {
      const stats = modes[SearchModes.Stat].currentStats
      if (!stats.length) {
        return 0
      }
      let sum1 = 0
      let sum2 = 0
      stats.some(stat => {
        const value1 = findStat(stat, item1.stats)?.value ?? -99999,
          value2 = findStat(stat, item2.stats)?.value ?? -99999
        if (value1 === value2) {
          return false
        }
        if (value1 > value2) {
          sum1 += 1
        } else {
          sum2 += 1
        }
        return true
      })
      return sum1 - sum2
    },
  },
  [SearchModes.ItemLevel]: {
    default: (item1, item2) => {
      const value1 = handleCompareValue(item1.origin!.recipe?.['item_level']?.toString() ?? ''),
        value2 = handleCompareValue(item2.origin!.recipe?.['item_level']?.toString() ?? '')
      return value1 - value2
    },
  },
  [SearchModes.Dye]: {
    default: idComparation,
  },
}

const consts = {
  sortOrderOptions: ['down', 'up'].map(id => ({
    value: id,
    text: t('item-query.sort-options.order.' + id),
  })),
  sortOptions: ['default', 'atk', 'def', 'stability', 'name', 'id'].map(id => ({
    value: id,
    text: t('item-query.sort-options.options.' + id),
  })),
}

const itemLevelMaximum = computed<number>({
  get() {
    return modes[SearchModes.ItemLevel].max
  },
  set(value) {
    modes[SearchModes.ItemLevel].max = Math.max(Math.min(500, value), 0)
  },
})
const itemLevelMinimum = computed<number>({
  get() {
    return modes[SearchModes.ItemLevel].min
  },
  set(value) {
    modes[SearchModes.ItemLevel].min = Math.max(Math.min(500, value), 0)
  },
})

const statsSearchResult = computed(() => {
  const searchText = modes[SearchModes.Stat].statSearchText.toLowerCase()
  return modes[SearchModes.Stat].stats.filter(stat => stat.text.toLowerCase().includes(searchText))
})

const validEquipments = shallowRef<CharacterEquipment[]>(equipments.slice())

const allSearchResult = computed(() => {
  if (state.currentMode === SearchModes.Normal) {
    const searchText = modes[SearchModes.Normal].searchText.toLowerCase()
    if (searchText === '') {
      return validEquipments.value
    }
    const targets = modes[SearchModes.Normal].targets
      .filter(opt => opt.selected)
      .map(opt => opt.value)
    return validEquipments.value.filter(equip => {
      const origin = equip.origin!
      return targets.find(target => {
        if (target === 'name') {
          return origin.name.toLowerCase().includes(searchText)
        } else if (target === 'material') {
          return (
            origin.recipe &&
            origin.recipe['materials'] &&
            origin.recipe['materials'].find(item => item.name.toLowerCase().includes(searchText))
          )
        } else if (target === 'obtain-name') {
          return origin.obtains.find(
            obtain => obtain['name']?.toLowerCase().includes(searchText) ?? false
          )
        } else if (target === 'map') {
          return origin.obtains.find(
            obtain => obtain['map']?.toLowerCase().includes(searchText) ?? false
          )
        }
      })
    })
  } else if (state.currentMode === SearchModes.Stat) {
    const searchStats = modes[SearchModes.Stat].currentStats
    if (searchStats.length === 0) {
      return []
    }
    return validEquipments.value.filter(equip =>
      searchStats.every(stat => findStat(stat, equip.stats))
    )
  } else if (state.currentMode === SearchModes.ItemLevel) {
    const min = modes[SearchModes.ItemLevel].min || 0,
      max = modes[SearchModes.ItemLevel].max || 999

    return validEquipments.value.filter(equip => {
      if (!equip.origin!.recipe?.['item_level']) {
        return false
      }
      const value = equip.origin!.recipe?.['item_level']
      return value >= min && value <= max
    })
  } else if (state.currentMode === SearchModes.Dye) {
    const searchText = modes[SearchModes.Dye].searchText
    if (searchText === '') {
      return []
    }
    return validEquipments.value.filter(equip => findObtainByDye(searchText, equip).length > 0)
  }
  return []
})

const searchResult = computed(() => {
  const sr = allSearchResult.value.slice()
  const mode = state.currentMode,
    target = sortState.currentSelected
  sr.sort(target === 'default' ? sortOptions[mode].default : sortOptions.global[target])
  return sortState.currentOrder === 'down' ? sr.reverse() : sr.slice()
})

const selectStat = (stat: StatOption) => {
  const searchStats = modes[SearchModes.Stat].currentStats
  const idx = searchStats.indexOf(stat)
  if (idx > -1) {
    searchStats.splice(idx, 1)
  } else {
    searchStats.push(stat)
  }
}

const selectMode = (id: SearchModes) => {
  state.currentMode = id
  state.displayMode = 0
}
</script>
