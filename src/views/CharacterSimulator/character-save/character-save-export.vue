<template>
  <cy-modal :visible="visible" footer @close="emit('close')">
    <template #title>
      <cy-icon-text icon="mdi:export">
        {{ t('character-simulator.save-load-control.export-save-data-title') }}
      </cy-icon-text>
    </template>
    <template #default>
      <template v-for="datasItem in exportDatasDisplay" :key="datasItem.id">
        <div class="flex items-center sticky top-0 bg-white z-1">
          <cy-button-check
            :selected="datasItem.items.size === datasItem.originalItems.length"
            main-color="orange"
            @click="toggleItemAll(datasItem)"
          >
            {{ datasItem.title }}
          </cy-button-check>
          <div class="ml-auto">
            <cy-button-icon
              :icon="datasItem.collapse ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
              @click="toggleItemCollapse(datasItem)"
            />
          </div>
        </div>
        <div v-if="datasItem.collapse" class="pl-2">
          <cy-list-item
            v-for="item in datasItem.originalItems"
            :key="item.id"
            @click="toggleItem(datasItem, item.id)"
          >
            <cy-button-check :selected="datasItem.items.has(item.id)" inline>
              {{ item.origin.name }}
            </cy-button-check>
          </cy-list-item>
        </div>
      </template>
    </template>
    <template #footer="{ closeModal }">
      <div class="w-full">
        <div>
          <cy-title-input v-model:value="exportFileName" />
        </div>
        <div class="flex items-center">
          <cy-button-check v-model:selected="allSelected">
            {{ t('global.all') }}
          </cy-button-check>
          <div class="flex items-center ml-auto">
            <cy-button-action
              icon="ic-round-done"
              :disabled="submitDisabled"
              @click="submit"
            >
              {{ t('global.export') }}
            </cy-button-action>
            <cy-button-action icon="ic-round-close" color="secondary" @click="closeModal">
              {{ t('global.cancel') }}
            </cy-button-action>
          </div>
        </div>
      </div>
    </template>
  </cy-modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, reactive, Ref, ref, toRefs, watch } from 'vue'

import { SkillBuildSaveData } from '@/stores/views/character/skill-build/SkillBuild'
import { CharacterSimulatorSaveData, EquipmentSaveDataWithIndex } from '@/stores/views/character'

import Cyteria from '@/shared/utils/Cyteria'

import { CharacterSaveData } from '@/lib/Character/Character'
import { FoodsSaveData } from '@/lib/Character/Food'

import { setupCharacterStore } from '../setup'

interface Props {
  visible: boolean;
}
interface Emits {
  (evt: 'close'): void;
}

const props = defineProps<Props>()
const { visible } = toRefs(props)
const emit = defineEmits<Emits>()

const originalData: Ref<CharacterSimulatorSaveData | null> = ref(null)

const { t } = useI18n()
const { store } = setupCharacterStore()

const exportFileName = ref('character-simulator-export.txt')

interface DataAlly {
  name: string;
}
interface ExportDataItem<T extends DataAlly = DataAlly> {
  id: ExportDataItemIds;
  title: string;
  collapse: boolean;
  items: Set<number>;
  originalItems: ExportDataInnerItem<T>[];
}
interface ExportDataInnerItem<T extends DataAlly> {
  id: number;
  origin: T;
}
const enum ExportDataItemIds {
  Characters = 'characters',
  Equipments = 'equipments',
  SkillBuilds = 'skillBuilds',
  FoodBuilds = 'foodBuilds',
}
const exportDataItemCharacters: ExportDataItem<CharacterSaveData> = reactive({
  id: ExportDataItemIds.Characters,
  title: t('character-simulator.character-basic.title'),
  collapse: false,
  items: new Set(),
  originalItems: [],
})
const exportDataItemEquipments: ExportDataItem<EquipmentSaveDataWithIndex> = reactive({
  id: ExportDataItemIds.Equipments,
  title: t('character-simulator.equipment-info.equipment'),
  collapse: false,
  items: new Set(),
  originalItems: [],
})
const exportDataItemSkillBuilds: ExportDataItem<SkillBuildSaveData> = reactive({
  id: ExportDataItemIds.SkillBuilds,
  title: t('skill-simulator.skill-build'),
  collapse: false,
  items: new Set(),
  originalItems: [],
})
const exportDataItemFoodBuilds: ExportDataItem<FoodsSaveData> = reactive({
  id: ExportDataItemIds.FoodBuilds,
  title: t('character-simulator.food-build.food-build'),
  collapse: false,
  items: new Set(),
  originalItems: [],
})
const exportDatas: ExportDataItem[] = reactive([
  exportDataItemCharacters,
  exportDataItemEquipments,
  exportDataItemSkillBuilds,
  exportDataItemFoodBuilds,
])

const exportDatasDisplay = computed(() => exportDatas.filter(data => data.originalItems.length !== 0))

const allSelected = computed<boolean>({
  get() {
    return exportDatas.every(item => item.items.size === item.originalItems.length)
  },
  set(value) {
    if (value) {
      exportDatas.forEach(item => item.items = new Set(item.originalItems.map(_item => _item.id)))
    } else {
      exportDatas.forEach(item => item.items = new Set())
    }
  },
})

const submitDisabled = computed(() => exportDatas.every(item => item.items.size === 0))

const toggleItemCollapse = (item: ExportDataItem) => {
  item.collapse = !item.collapse
}

const toggleItemAll = (item: ExportDataItem) => {
  if (item.items.size === item.originalItems.length) {
    item.items = new Set()
  } else {
    item.items = new Set(item.originalItems.map(_item => _item.id))
  }
}

const toggleItem = (item: ExportDataItem, innerItemId: number) => {
  item.items.has(innerItemId) ? item.items.delete(innerItemId) : item.items.add(innerItemId)
}

const submit = () => {
  const getItems: <T extends DataAlly>(target: ExportDataItem<T>) => T[] = (target) => {
    return target.originalItems
      .filter(_item => target.items.has(_item.id))
      .map(_item => _item.origin)
  }
  const characters = getItems(exportDataItemCharacters)
  const datas: CharacterSimulatorSaveData = {
    characters,
    equipments: getItems(exportDataItemEquipments),
    skillBuilds: getItems(exportDataItemSkillBuilds),
    foodBuilds: getItems(exportDataItemFoodBuilds),
    characterStates: originalData.value!.characterStates.filter(state => characters.some(item => item.id === state.id)),
  }
  Cyteria.file.save({
    data: JSON.stringify(datas),
    fileName: exportFileName.value,
  })
  emit('close')
}

watch(visible, (newValue) => {
  if (newValue) {
    // init
    const handle: <T extends DataAlly>(target: ExportDataItem<T>, list: T[]) => void = (target, list) => {
      const originalItems = list.map((origin, id) => ({ id, origin }))
      target.originalItems = originalItems
      target.items = new Set(originalItems.map(_item => _item.id))
    }
    const datas = store.createCharacterSimulatorSaveData()
    handle(exportDataItemCharacters, datas.characters)
    handle(exportDataItemEquipments, datas.equipments)
    handle(exportDataItemSkillBuilds, datas.skillBuilds)
    handle(exportDataItemFoodBuilds, datas.foodBuilds)
    originalData.value = datas
    exportFileName.value = 'character-simulator-export.txt'
  }
})
</script>
