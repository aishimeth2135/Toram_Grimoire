<script lang="ts" setup>
import { type Ref, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { prepareFuzzySearch, simpleSearch } from '@/shared/utils/data'

import { EquipmentField } from '@/lib/Character/Character'
import { CharacterEquipment, EquipmentTypes } from '@/lib/Character/CharacterEquipment'
import { Items } from '@/lib/common/Items'

import CardRow from '@/components/card/card-row.vue'
import CardRows from '@/components/card/card-rows.vue'

import CommonSearchInput from '../common/common-search-input.vue'
import CommonSelectionIcon from '../common/common-selection-icon.vue'
import BrowseEquipmentTypeFilter from './browse-equipment-type-filter.vue'

import { setupEquipmentLabelFilter, useEquipmentsForSearch } from './setup'

interface Props {
  modelValue: CharacterEquipment[]
  currentField?: EquipmentField | null
  currentFieldTypes?: EquipmentTypes[]
}
interface Emits {
  (evt: 'update:model-value', value: CharacterEquipment[]): void
  (evt: 'update:current-field-types', value: EquipmentTypes[]): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const { allEquipments, getEquipmentSearchList } = useEquipmentsForSearch()

const selectedEquipmentTypes: Ref<EquipmentTypes[]> = ref([])
const serachText = ref('')

const labelFilter = setupEquipmentLabelFilter()

const baseFilteredEquipments = computed(() => {
  if (selectedEquipmentTypes.value.length === 0 && labelFilter.selectedLabels.value.length === 0) {
    return allEquipments.value
  }
  return allEquipments.value.filter(equipment => {
    const typeMatched = selectedEquipmentTypes.value.includes(equipment.type)
    if (!typeMatched) {
      return false
    }
    return labelFilter.selectedLabels.value.every(label => Items.includes(equipment.labels, label))
  })
})

const filteredEquipments = computed(() => {
  if (!serachText.value) {
    return baseFilteredEquipments.value
  }
  const text = prepareFuzzySearch(serachText.value)
  return baseFilteredEquipments.value.filter(equipment => {
    const searchList = getEquipmentSearchList(equipment)
    return searchList.some(str => simpleSearch(text, str))
  })
})

watch(
  filteredEquipments,
  newValue => {
    emit('update:model-value', newValue)
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex w-full max-w-xs items-center">
    <CommonSearchInput v-model="serachText" class="mr-2 w-full" />
    <BrowseEquipmentTypeFilter
      v-model="selectedEquipmentTypes"
      :current-field="currentField"
      :current-field-types="currentFieldTypes"
      @update:current-field-types="emit('update:current-field-types', $event)"
    />
    <cy-popover class="ml-2 shrink-0">
      <cy-button-circle icon="mdi:label" small />
      <template #popper>
        <CardRows class="px-1 py-2.5">
          <CardRow
            v-for="label in labelFilter.labelOptions"
            :key="label.id"
            class="flex cursor-pointer flex-wrap items-center px-3 py-2"
            :class="`text-${label.color}-60`"
            hover
            @click="labelFilter.toggleLabel(label)"
          >
            <CommonSelectionIcon :selected="labelFilter.labelSelected(label)" class="shrink-0" />
            <div class="mr-2 h-3.5 w-3.5 rounded-sm" :class="`bg-${label.color}-50`" />
            {{ label.text }}
          </CardRow>
        </CardRows>
        <div class="flex justify-end px-4 pb-2 pt-1">
          <span
            class="cursor-pointer text-sm text-primary-50"
            @click="labelFilter.selectedLabels.value = []"
          >
            {{ t('global.reset') }}
          </span>
        </div>
      </template>
    </cy-popover>
  </div>
</template>
