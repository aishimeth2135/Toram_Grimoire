<template>
  <AppLayoutMain>
    <div v-if="searchResult.length > 0" class="py-4">
      <ItemQueryResult class="search-result" :equipments="searchResult" />
    </div>
    <cy-default-tips v-else icon="mdi-ghost" style="min-height: 30rem;">
      {{t('item-query.no-result-tips') }}
    </cy-default-tips>
    <AppLayoutBottom>
      <template #default>
        <div class="flex items-center">
          <template v-if="state.currentMode === SearchModes.Normal">
            <div class="mode-normal-title ml-2">
              <div class="input-container">
                <cy-icon-text icon="ic-outline-search" class="icon" />
                <input
                  v-model="modes[SearchModes.Normal].searchText"
                  type="text"
                  :placeholder="t('global.search')"
                >
              </div>
              <cy-button-icon
                icon="heroicons-solid:menu"
                @click="modes[SearchModes.Normal].optionsVisible = !modes[SearchModes.Normal].optionsVisible"
              />
            </div>
          </template>
          <template v-else-if="state.currentMode === SearchModes.Stat">
            <cy-button-inline
              class="w-full"
              @click="toggle('modals/selecteStat')"
            >
              {{ modes[SearchModes.Stat].currentStat?.text ?? t('item-query.options-stat.select-stat.title') }}
            </cy-button-inline>
          </template>
          <template v-else-if="state.currentMode === SearchModes.ItemLevel">
            <div class="flex items-center">
              <cy-icon-text icon="jam-hammer" class="ml-2" />
              <input
                v-model="itemLevelMinimum"
                type="text"
                placeholder="0"
                class="border-0 p-1 inline-block w-14 text-center"
              >
              <cy-icon-text icon="mdi-tilde" />
              <input
                v-model="itemLevelMaximum"
                type="text"
                placeholder="300"
                class="border-0 p-1 inline-block w-14 text-center"
              >
            </div>
          </template>
          <template v-else-if="state.currentMode === SearchModes.Dye">
            <div class="mode-dye-title">
              <div class="input-container">
                <cy-icon-text icon="ic-outline-palette" class="ml-2" />
                <input
                  v-model="modes[SearchModes.Dye].searchText"
                  type="text"
                  :placeholder="t('global.search')"
                >
              </div>
            </div>
          </template>
        </div>
      </template>
      <template #main-content>
        <AppLayoutBottomContent
          v-if="state.currentMode === SearchModes.Normal && modes[SearchModes.Normal].optionsVisible"
          class="p-3"
        >
          <cy-icon-text
            icon="bx-bx-target-lock"
            small
            text-color="purple"
          >
            {{ t('item-query.options-normal.title') }}
          </cy-icon-text>
          <div style="padding: 0.2rem 0.4rem;">
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
            <cy-button-circle
              icon="ic:baseline-settings"
              main-color="water-blue"
            />
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
          v-if="state.currentMode === SearchModes.Stat || state.currentMode === SearchModes.ItemLevel"
          icon="heroicons-solid:switch-vertical"
          main-color="orange"
          @click="state.displayMode = state.displayMode === 0 ? 1 : 0"
        />
        <cy-button-circle
          icon="mdi-sort-variant"
          main-color="water-blue"
          @click="toggle('menus/sortOptions')"
        />
        <cy-button-circle
          icon="mdi:filter"
          border-color="light-3"
          @click="toggle('menus/conditionOptions')"
        />
      </template>
      <template #side-contents>
        <cy-transition type="fade">
          <AppLayoutBottomContent v-if="menus.conditionOptions" class="space-y-3 p-3">
            <div v-for="(type) in conditions.type" :key="type.id">
              <div class="flex items-center space-x-2">
                <cy-button-check
                  v-model:selected="type.selected"
                  class="mr-4 cursor-pointer"
                  main-color="orange"
                >
                  {{ t('common.Equipment.field.' + type.id) }}
                </cy-button-check>
                <template v-if="type.types.length > 1">
                  <cy-button-circle icon="ic-round-border-all" small @click="selectAll(type.types)" />
                  <cy-button-circle icon="eva-close-outline" small @click="cancelAll(type.types)" />
                </template>
              </div>
              <div v-if="type.types.length > 1" class="px-2">
                <cy-button-check
                  v-for="item in type.types"
                  :key="item.value"
                  :selected="type.selected && item.selected"
                  :selected-icon="item.imagePath"
                  selected-icon-src="image"
                  @click="toggleSelected(item)"
                >
                  {{ t('common.Equipment.category.' + item.value) }}
                </cy-button-check>
              </div>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <cy-icon-text class="mr-4">
                  {{ t('item-query.equipment-detail.content-titles.obtains') }}
                </cy-icon-text>
                <cy-button-circle icon="ic-round-border-all" small @click="selectAll(conditions.obtains)" />
                <cy-button-circle icon="eva-close-outline" small @click="cancelAll(conditions.obtains)" />
              </div>
              <div class="px-2">
                <cy-button-check
                  v-for="obtain in conditions.obtains"
                  :key="obtain.value"
                  v-model:selected="obtain.selected"
                >
                  {{ t('common.Equipment.obtain.' + obtain.value) }}
                </cy-button-check>
              </div>
            </div>
          </AppLayoutBottomContent>
          <AppLayoutBottomContent v-else-if="menus.sortOptions" class="p-3">
            <div>
              <div class="mb-1">
                <cy-icon-text icon="mdi-sort-variant" text-color="purple" small>
                  {{ t('item-query.sort-options.title') }}
                </cy-icon-text>
              </div>
              <cy-button-check-group
                v-model:value="sortState.currentSelected"
                class="px-2"
                :options="consts.sortOptions"
              />
            </div>
            <div>
              <div class="mb-1">
                <cy-icon-text
                  icon="fluent-arrow-sort-24-filled"
                  text-color="purple"
                  small
                >
                  {{ t('item-query.sort-options.order.title') }}
                </cy-icon-text>
              </div>
              <cy-button-check-group
                v-model:value="sortState.currentOrder"
                class="px-2"
                :options="consts.sortOrderOptions"
              />
            </div>
          </AppLayoutBottomContent>
        </cy-transition>
      </template>
    </AppLayoutBottom>
    <cy-modal v-model:visible="modals.selecteStat" vertical-position="start">
      <template #title>
        <cy-icon-text icon="mdi-rhombus-outline">
          {{ t('item-query.options-stat.select-stat.title') }}
        </cy-icon-text>
      </template>
      <template #default>
        <cy-title-input
          v-model:value="modes.stat.statSearchText"
          icon="ic-outline-category"
          :placeholder="t('item-query.options-stat.select-stat.search-placeholder')"
        />
        <template v-if="statsSearchResult.length != 0">
          <cy-list-item
            v-for="stat in statsSearchResult"
            :key="stat.origin.statId(stat.type)"
            :selected="stat == modes.stat.currentStat"
            @click="selectStat(stat)"
          >
            <cy-icon-text icon="mdi-rhombus-outline">
              {{ stat.text }}
            </cy-icon-text>
          </cy-list-item>
        </template>
        <cy-default-tips v-else icon="bx-bx-message-rounded-x">
          {{ t('item-query.no-result-tips') }}
        </cy-default-tips>
      </template>
    </cy-modal>
  </AppLayoutMain>
</template>

<script lang="ts">
export default {
  name: 'ItemQuery',
}
</script>

<script lang="ts" setup>
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'
import { isNumberString } from '@/shared/utils/string'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { MainWeaponTypeList, SubWeaponTypeList, SubArmorTypeList, EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums'

import ToggleService from '@/setup/ToggleService'

import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'

import ItemQueryResult from './item-query-result.vue'

import { CommonOption, StatOption, SearchModes, handleOptions, findStat, findObtainByDye, useItemQueryModes } from './setup'

const equipments = Grimoire.Items.equipments
  .map(equip => CharacterEquipment.fromOriginEquipment(equip, { statValueToNumber: false }))

const handleCompareValue = (value: string) => isNumberString(value) ? parseFloat(value) : -99999

const {
  state,
  modes,
} = useItemQueryModes()

const { menus, modals, toggle } = ToggleService({
  menus: ['conditionOptions', 'sortOptions'] as const,
  modals: ['selecteStat'] as const,
})

const { t } = useI18n()

interface EquipmentTypeOption extends CommonOption {
  imagePath: string;
}
const handleEquipmentTypes = (opts: EquipmentTypes[]): EquipmentTypeOption[] => {
  const newOpts = handleOptions(opts)
  const finalOpts = newOpts.map(opt => ({
    ...opt,
    imagePath: CharacterEquipment.getImagePath(opt.value as EquipmentTypes),
  }))
  return finalOpts
}

const sortState = reactive({
  currentSelected: 'default',
  currentOrder: 'down',
})

type SortHandler =(item1: CharacterEquipment, item2: CharacterEquipment) => number

const sortOptions: {
  [mode in SearchModes]: {
    default: SortHandler;
  };
} & {
  'global': Record<string, SortHandler>;
} = {
  global: {
    'atk': (item1, item2) => {
      const value1 = item1.isWeapon() ? item1.atk + 9999 : item1.def ?? 0,
        value2 = item2.isWeapon() ? item2.atk + 9999 : item2.def ?? 0
      return value1 - value2
    },
    'def': (item1, item2) => {
      const value1 = item1.isArmor() ? item1.def + 9999 : item2.atk ?? 0,
        value2 = item2.isArmor() ? item2.def + 9999 : item2.atk ?? 0
      return value1 - value2
    },
    'stability': (item1, item2) => {
      const value1 = item1.isWeapon() ? item1.stability : -1,
        value2 = item2.isWeapon() ? item2.stability : -1
      if (value1 === -1 && value2 === -1) {
        return sortOptions[state.currentMode].default(item1, item2)
      }
      return value1 - value2
    },
    'name':  (item1, item2) => item1.name.localeCompare(item2.name),
  },
  [SearchModes.Normal]: {
    default: (item1, item2) => item1.origin!.id - item2.origin!.id,
  },
  [SearchModes.Stat]: {
    default: (item1, item2) => {
      const cs = modes[SearchModes.Stat].currentStat
      if (!cs) {
        return 0
      }
      const value1 = findStat(cs, item1.stats)?.value ?? -99999,
        value2 = findStat(cs, item2.stats)?.value ?? -99999
      return value1 - value2
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
    default: (item1, item2) => item1.origin!.id - item2.origin!.id,
  },
}

const conditions: {
  type: {
    id: string;
    types: EquipmentTypeOption[];
    selected: boolean;
  }[];
  obtains: CommonOption[];
} = reactive({
  type: [{
    id: 'main-weapon',
    types: handleEquipmentTypes(MainWeaponTypeList),
    selected: true,
  }, {
    id: 'sub-weapon',
    types: [
      ...handleEquipmentTypes(SubWeaponTypeList),
      ...handleEquipmentTypes(SubArmorTypeList),
    ],
    selected: true,
  }, {
    id: 'body-armor',
    types: handleEquipmentTypes([EquipmentTypes.BodyNormal]),
    selected: true,
  }, {
    id: 'additional',
    types: handleEquipmentTypes([EquipmentTypes.Additional]),
    selected: true,
  }, {
    id: 'special',
    types: handleEquipmentTypes([EquipmentTypes.Special]),
    selected: true,
  }],
  obtains: handleOptions(['smith', 'boss', 'mini_boss', 'mobs', 'quest', 'box', 'exchange', 'other', 'unknow']),
})

const consts = {
  sortOrderOptions: ['down', 'up'].map(id => ({
    value: id,
    text: t('item-query.sort-options.order.' + id),
  })),
  sortOptions: ['default', 'atk', 'def', 'stability', 'name'].map(id => ({
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

const validEquipments = computed(() => {
  const validTypes = conditions.type.filter(type => type.selected)
  if (validTypes.length === 0) {
    validTypes.push({
      id: 'avatar',
      types: handleEquipmentTypes([EquipmentTypes.Avatar]),
      selected: true,
    })
  }
  const unknowObtain = conditions.obtains.find(obtain => obtain.value === 'unknow' && obtain.selected)
  const validObtains = conditions.obtains.filter(obtain => obtain.value !== 'unknow' && obtain.selected)
  return equipments.filter(equip => {
    const checkType = validTypes.some(typeItem => typeItem.types.some(item => item.selected && item.value === equip.type))
    const checkObtain = (unknowObtain && equip.origin!.obtains.length === 0) ||
      validObtains.find(obtain => equip.origin!.obtains.find(eqObtain => eqObtain['type'] === obtain.value))
    return checkType && checkObtain
  })
})

const allSearchResult = computed(() => {
  if (state.currentMode === SearchModes.Normal) {
    const searchText = modes[SearchModes.Normal].searchText.toLowerCase()
    if (searchText === '') {
      return validEquipments.value
    }
    const targets = modes[SearchModes.Normal].targets
      .filter(opt => opt.selected)
      .map(opt => opt.value)
    return validEquipments.value
      .filter(equip => {
        const origin = equip.origin!
        return targets.find(target => {
          if (target === 'name') {
            return origin.name.toLowerCase().includes(searchText)
          } else if (target === 'material') {
            return origin.recipe && origin.recipe['materials'] &&
              origin.recipe['materials'].find(item => item.name.toLowerCase().includes(searchText))
          } else if (target === 'obtain-name') {
            return origin.obtains.find(obtain => obtain['name']?.toLowerCase().includes(searchText) ?? false)
          } else if (target === 'map') {
            return origin.obtains.find(obtain => obtain['map']?.toLowerCase().includes(searchText) ?? false)
          }
        })
      })
  } else if (state.currentMode === SearchModes.Stat) {
    const searchStat = modes[SearchModes.Stat].currentStat
    if (!searchStat) {
      return []
    }
    return validEquipments.value.filter(equip => findStat(searchStat, equip.stats))
  } else if (state.currentMode === SearchModes.ItemLevel) {
    const min = modes[SearchModes.ItemLevel].min || 0,
      max = modes[SearchModes.ItemLevel].max || 999

    return validEquipments.value.filter(equip => {
      if (!equip.origin!.recipe?.['item_level']) {
        return false
      }
      let value = equip.origin!.recipe?.['item_level']
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
  let sr = allSearchResult.value.slice()
  const mode = state.currentMode,
    target = sortState.currentSelected
  sr.sort(target === 'default' ? sortOptions[mode].default : sortOptions.global[target])
  return sortState.currentOrder === 'down' ? sr.reverse() : sr.slice()
})

const toggleSelected = (item: CommonOption) => {
  item.selected = !item.selected
}
const selectAll = (list: CommonOption[]) => {
  list.forEach(item => item.selected = true)
}
const cancelAll = (list: CommonOption[]) => {
  list.forEach(item => item.selected = false)
}

const selectStat = (stat: StatOption) => {
  modes[SearchModes.Stat].currentStat = stat
  toggle('modals/selecteStat', false)
}

const selectMode = (id: SearchModes)  => {
  state.currentMode = id
  state.displayMode = 0
}
</script>

<style lang="postcss" scoped>
.search-result {
  min-height: 70vh;
}

.mode-normal-title, .mode-dye-title {
  display: flex;
  align-items: center;
  width: 100%;

  & .input-container {
    display: flex;
    align-items: center;
    width: 100%;

    & > input {
      border: 0;
      padding: 0.2rem;
      margin-left: 0.4rem;
      display: inline-block;
      width: 100%;
    }
  }
}
</style>
