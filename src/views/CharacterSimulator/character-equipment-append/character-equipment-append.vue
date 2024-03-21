<script lang="ts" setup>
import { Ref, computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import PageControl from '@/shared/setup/PageControl'
import { useToggleList } from '@/shared/setup/State'

import {
  CharacterEquipment,
  EquipmentTypes,
} from '@/lib/Character/CharacterEquipment'
import { BagEquipment } from '@/lib/Items/BagItem'

import FloatPageContent from '@/components/app-layout/float-page/float-page-content.vue'
import FloatPageSide from '@/components/app-layout/float-page/float-page-side.vue'
import FloatPage from '@/components/app-layout/float-page/float-page.vue'
import CardRow from '@/components/card/card-row.vue'
import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import BrowseEquipmentTypeFilter from '../browse-equipments/browse-equipment-type-filter.vue'
import CommonSearchInput from '../common/common-search-input.vue'
import CommonSearchableItems from '../common/common-searchable-items.vue'
import CharacterEquipmentAppendItem from './character-equipment-append-item.vue'

import { setupCharacterStore } from '../setup'
import { EquipmentSearchMode, StatOption, useEquipmentsSearch } from './setup'

interface Props {
  visible: boolean
}
interface Emits {
  (evt: 'update:visible', value: boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const selectedEquipmentTypes: Ref<EquipmentTypes[]> = ref([])

const {
  currentMode,
  normalSearchText,
  statSearchText,
  selectedStatOption,
  statOptionsSearchResults,
  searchResults,
  statModePreviewStatMap,
  sortByValue,
} = useEquipmentsSearch(selectedEquipmentTypes)

const selectedStatIds = computed(() => {
  if (!selectedStatOption.value) {
    return []
  }
  return [selectedStatOption.value.id]
})

const { currentItems, page, maxPage } = PageControl({
  items: searchResults,
  step: 30,
})

const previewStatOption = computed(() => {
  if (currentMode.value !== EquipmentSearchMode.Stat) {
    return null
  }
  return selectedStatOption.value
})

const topElement: Ref<HTMLElement | null> = ref(null)
const pageChanged = async () => {
  await nextTick()
  topElement.value?.scrollIntoView({ behavior: 'smooth' })
}

const appendedEquipments = ref([]) as Ref<CharacterEquipment[]>

const { toggleItem: toggleAppendedEquipments } =
  useToggleList(appendedEquipments)

const appendBagEquipment = (equip: BagEquipment) => {
  toggleAppendedEquipments(CharacterEquipment.fromOriginEquipment(equip))
}

const { store: characterStore } = setupCharacterStore()

const submitSelectedEquipments = () => {
  characterStore.appendEquipments(appendedEquipments.value)
  appendedEquipments.value = []
  emit('update:visible', false)
}

const selectStatOption = (option: StatOption) => {
  selectedStatOption.value = option
}
</script>

<template>
  <FloatPage
    :title="t('character-simulator.append-equipments.title')"
    title-icon="mdi:checkbox-blank-badge-outline"
    :visible="visible"
    columns="40rem"
    @update:visible="emit('update:visible', $event)"
  >
    <FloatPageSide>
      <div class="flex h-full flex-col">
        <div class="flex w-full max-w-sm items-center self-end">
          <div class="flex flex-grow items-center">
            <div
              class="flex flex-shrink-0 cursor-pointer items-center self-stretch rounded-l-full border border-r-0 border-primary-10 pl-3 pr-2 duration-150 hover:bg-primary-10"
              @click="
                currentMode =
                  currentMode === EquipmentSearchMode.Normal
                    ? EquipmentSearchMode.Stat
                    : EquipmentSearchMode.Normal
              "
            >
              <cy-icon icon="mdi:exchange" />
            </div>
            <div class="flex-grow rounded-r-full border border-primary-10">
              <div v-if="currentMode === EquipmentSearchMode.Normal">
                <CommonSearchInput v-model="normalSearchText" behind />
              </div>
              <cy-popover
                v-else-if="currentMode === EquipmentSearchMode.Stat"
                class="mr-2 flex flex-grow cursor-pointer items-center text-ellipsis py-1.5 pl-3 pr-2 text-sm leading-6 text-primary-30"
                custom
              >
                <template v-if="!selectedStatOption">
                  {{
                    t('character-simulator.append-equipments.search-stat-tips')
                  }}
                </template>
                <template v-else>
                  <div class="mr-2.5">
                    {{
                      t(
                        'character-simulator.append-equipments.current-selected-stat'
                      )
                    }}
                  </div>
                  <div class="text-base text-primary-80">
                    {{ selectedStatOption.text }}
                  </div>
                </template>
                <cy-icon
                  class="ml-auto"
                  icon="ic:round-keyboard-double-arrow-down"
                />
                <template #popper="{ hide }">
                  <CommonSearchableItems
                    v-if="currentMode === EquipmentSearchMode.Stat"
                    v-model:search-text="statSearchText"
                    :items="statOptionsSearchResults"
                    :selected-item-ids="selectedStatIds"
                    @select-item="selectStatOption($event), hide()"
                  >
                    <template #item="{ item }">
                      {{ item.text }}
                    </template>
                  </CommonSearchableItems>
                </template>
              </cy-popover>
            </div>
          </div>
          <div class="ml-2 flex flex-shrink-0 items-center">
            <BrowseEquipmentTypeFilter v-model="selectedEquipmentTypes" />
            <cy-button-circle
              icon="mdi:sort-bool-ascending"
              color="orange"
              class="ml-2"
              small
              toggle
              :selected="sortByValue"
              @click="sortByValue = !sortByValue"
            />
          </div>
        </div>
        <CardRowsWrapper
          class="mt-3 max-h-96 flex-grow overflow-x-auto wd:max-h-none"
        >
          <div class="min-w-min overflow-y-auto">
            <div ref="topElement"></div>
            <CardRows v-if="currentItems.length > 0">
              <CharacterEquipmentAppendItem
                v-for="result in currentItems"
                :key="result.id"
                :equipment="result"
                :preview-stat="statModePreviewStatMap.get(result) ?? null"
                @submit="appendBagEquipment"
              />
            </CardRows>
            <div v-else class="flex h-full items-center justify-center p-6">
              <cy-icon
                icon="material-symbols:search-off"
                width="2.5rem"
                class="text-gray-30"
              />
            </div>
          </div>
        </CardRowsWrapper>
        <div class="mt-3 flex-shrink-0">
          <cy-pagination
            v-model:value="page"
            :max-page="maxPage"
            @changed="pageChanged"
          />
        </div>
      </div>
    </FloatPageSide>
    <FloatPageContent>
      <div class="w-full max-w-sm">
        <div class="flex justify-end pb-3">
          <cy-button-action
            icon="ic:round-done-outline"
            :disabled="appendedEquipments.length === 0"
            @click="submitSelectedEquipments"
          >
            {{ t('global.confirm') }}
          </cy-button-action>
        </div>
        <CardRowsWrapper class="mb-4">
          <CardRows v-if="appendedEquipments.length > 0">
            <CardRow
              v-for="(equip, idx) in appendedEquipments"
              :key="equip.id + idx"
              class="flex cursor-pointer items-center px-3.5 py-2.5"
              @click="toggleAppendedEquipments(equip)"
            >
              <cy-icon icon="ic:round-close" class="mr-3.5" />
              <cy-icon
                v-if="!equip.origin!.unknowCategory"
                :path="equip.getCategoryImagePath()"
              />
              <cy-icon v-else icon="eva-star-outline" />
              <div class="ml-2 w-40">
                {{ equip.name }}
              </div>
            </CardRow>
          </CardRows>
          <div v-else class="px-6 py-4 text-sm text-primary-40">
            {{
              t(
                'character-simulator.append-equipments.selected-equipments-default-tips'
              )
            }}
          </div>
        </CardRowsWrapper>
      </div>
    </FloatPageContent>
  </FloatPage>
</template>
