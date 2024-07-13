<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToggleList } from '@/shared/setup/State'

import { EquipmentField } from '@/lib/Character/Character'
import {
  CharacterEquipment,
  EquipmentTypes,
} from '@/lib/Character/CharacterEquipment'

import {
  getEquipmentFieldFilterOptions,
  useEquipmentsDisplayedItems,
} from './setup'

interface Props {
  modelValue: EquipmentTypes[]
  currentField?: EquipmentField | null
  currentFieldTypes?: EquipmentTypes[]
}
interface Emits {
  (evt: 'update:model-value', value: EquipmentTypes[]): void
  (evt: 'update:current-field-types', value: EquipmentTypes[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const equipmentFieldOptions = getEquipmentFieldFilterOptions()
const selectedTypes = ref([] as EquipmentTypes[])
const allTypes = [...equipmentFieldOptions.values()].flat()

const { itemSelected: typeSelected, toggleItem: toggleType } =
  useToggleList(selectedTypes)

const selectAllTypes = () => {
  selectedTypes.value = allTypes.slice()
}

const getTypeOfField = (targetField: EquipmentField) => {
  return equipmentFieldOptions.get(targetField.type)!.slice()
}

const selectAllTypesOfField = (targetField: EquipmentField) => {
  selectedTypes.value = equipmentFieldOptions.get(targetField.type)!.slice()
}

const allTypesSelected = computed({
  get() {
    return selectedTypes.value.length === allTypes.length
  },
  set() {
    if (selectedTypes.value.length === allTypes.length) {
      selectedTypes.value = []
    } else {
      selectAllTypes()
    }
  },
})

const { displayedItems: displayedOptions } = useEquipmentsDisplayedItems()

const resetFieldsFilter = () => {
  if (props.currentField) {
    selectAllTypesOfField(props.currentField)
  } else {
    selectAllTypes()
  }
}

watch(
  () => props.currentField,
  newValue => {
    resetFieldsFilter()
    if (newValue) {
      emit('update:current-field-types', getTypeOfField(newValue))
    }
  },
  { immediate: true }
)

watch(
  selectedTypes,
  newValue => {
    emit('update:model-value', newValue)
  },
  { immediate: true }
)
</script>

<template>
  <cy-popover class="flex-shrink-0">
    <cy-button-circle icon="mdi:filter" small />
    <template #popper>
      <div class="p-3">
        <div class="mb-2 border-b border-primary-10 pb-2">
          <cy-button-check v-model:selected="allTypesSelected">
            <span class="text-primary-30">
              {{ t('global.select-all') }}
            </span>
          </cy-button-check>
        </div>
        <div
          v-for="[key, types] in displayedOptions"
          :key="key"
          class="flex flex-wrap items-center py-2"
        >
          <div v-for="equipmentType in types" :key="equipmentType">
            <cy-button-check
              :selected="typeSelected(equipmentType)"
              class="mr-2.5"
              @click="toggleType(equipmentType)"
            >
              <div class="flex items-center">
                <cy-icon
                  :icon="CharacterEquipment.getImagePath(equipmentType)"
                  class="mr-1"
                />
                {{ CharacterEquipment.getTypeText(equipmentType) }}
              </div>
            </cy-button-check>
          </div>
        </div>
      </div>
      <div class="flex justify-end px-4 pb-2">
        <span
          class="cursor-pointer text-sm text-primary-50"
          @click="resetFieldsFilter"
        >
          {{ t('global.reset') }}
        </span>
      </div>
    </template>
  </cy-popover>
</template>
