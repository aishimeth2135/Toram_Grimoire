<script lang="ts" setup>
import { type Ref, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import { useDevice } from '@/shared/setup/Device'

import { EquipmentField, EquipmentFieldTypes } from '@/lib/Character/Character'
import { CharacterEquipment, EquipmentTypes } from '@/lib/Character/CharacterEquipment'

import CommonSwitchModeButton from '../common/common-switch-mode-button.vue'
import BrowseEquipmentsGrid from './browse-equipments-grid.vue'
import BrowseEquipmentsList from './browse-equipments-list.vue'
import BrowseEquipmentsMainFilters from './browse-equipments-main-filters.vue'
import CharacterEquipmentAppendActions from './character-equipment-append-actions.vue'
import EquipmentBrowseActions from './equipment-browse-actions.vue'
import EquipmentBrowseTitle from './equipment-browse-title.vue'

interface Props {
  currentField?: EquipmentField | null
  allowEquip?: boolean
}

interface Emits {
  (evt: 'equip', equipment: CharacterEquipment): void
  (evt: 'equip-cancel'): void
  (evt: 'state-changed', state: { selectedEquipmentValid: boolean }): void
}

const props = withDefaults(defineProps<Props>(), {
  allowEquip: false,
})
const emit = defineEmits<Emits>()

const selectedEquipment = defineModel<CharacterEquipment | null>('selectedEquipment', {
  required: true,
})

const { t } = useI18n()
const { device } = useDevice()

const characterStore = useCharacterStore()
const allEquipments = computed(() => characterStore.equipments)

const currentFieldTypes: Ref<EquipmentTypes[]> = ref([])
const filteredEquipments: Ref<CharacterEquipment[]> = ref([])

const currentFieldEquipment = computed(() => props.currentField?.equipment ?? null)

const checkEquipmentValid = (equipment: CharacterEquipment) => {
  if (!currentFieldTypes.value) {
    return true
  }

  const currentField = props.currentField
  if (!currentField) {
    return true
  }

  if (
    currentField.type === EquipmentFieldTypes.SubWeapon &&
    !currentField!.belongCharacter.subWeaponValid(equipment.type)
  ) {
    return false
  }

  return currentFieldTypes.value.includes(equipment.type)
}

const currentEquipmentValid = computed(() => {
  return !!selectedEquipment.value && checkEquipmentValid(selectedEquipment.value)
})

const handleSelectItem = (equip: CharacterEquipment) => {
  if (selectedEquipment.value === equip) {
    if (props.allowEquip) {
      emit('equip', equip)
    }
  } else {
    selectedEquipment.value = equip
  }
}

watch(currentEquipmentValid, value => {
  emit('state-changed', { selectedEquipmentValid: value })
})

const DisplayModes = {
  Grid: 0,
  List: 1,
} as const
export type DisplayModes = (typeof DisplayModes)[keyof typeof DisplayModes]

const displayMode = ref<DisplayModes>(DisplayModes.List)

const toggleDisplayMode = (isListMode: boolean) => {
  displayMode.value = isListMode ? DisplayModes.List : DisplayModes.Grid
}
</script>

<template>
  <div class="max-w-180 flex grow flex-col">
    <div class="flex w-full shrink-0 flex-wrap items-center justify-end px-2 pb-1">
      <slot name="additional-actions" />
      <CharacterEquipmentAppendActions class="ml-2 mr-5" />
      <CommonSwitchModeButton
        :is-left="displayMode === DisplayModes.List"
        left-icon="ic:baseline-format-list-bulleted"
        right-icon="ic:baseline-grid-on"
        @update:is-left="toggleDisplayMode"
      />
    </div>
    <div class="border-primary-20 mx-2 mt-2 flex min-h-0 grow flex-col rounded-sm border py-0.5">
      <div class="border-primary-20 shrink-0 border-b px-2 py-1">
        <BrowseEquipmentsMainFilters
          v-model="filteredEquipments"
          v-model:current-field-types="currentFieldTypes"
          :current-field="currentField"
        />
      </div>
      <div
        v-if="displayMode === DisplayModes.Grid"
        class="border-primary-10 m-3 mb-2 flex shrink-0 flex-wrap items-center border py-1"
      >
        <template v-if="selectedEquipment">
          <EquipmentBrowseTitle
            v-if="!device.isMobile"
            :equipment="selectedEquipment"
            class="mr-6 pl-4"
          />
          <div v-else class="border-primary-10 mb-1 w-full border-b px-4 pb-1">
            <EquipmentBrowseTitle :equipment="selectedEquipment" />
          </div>
          <EquipmentBrowseActions
            :equip-disabled="!allowEquip"
            :equipment="selectedEquipment"
            :equipped="currentFieldEquipment === selectedEquipment"
            class="grow"
            @equip="emit('equip', $event)"
            @equip-cancel="emit('equip-cancel')"
          />
        </template>
        <span v-else class="text-primary-30 flex h-8 items-center pl-4 text-sm">
          {{ t('character-simulator.browse-equipments.select-equipment-tips') }}
        </span>
      </div>
      <BrowseEquipmentsList
        v-if="filteredEquipments.length > 0 && displayMode === DisplayModes.List"
        :equipments="filteredEquipments"
        :selected-equipment="selectedEquipment"
        :current-equipment="currentFieldEquipment"
        :allow-equip="allowEquip"
        :check-equipment-valid="checkEquipmentValid"
        @select="handleSelectItem"
        @equip="emit('equip', $event)"
        @equip-cancel="emit('equip-cancel')"
      />
      <BrowseEquipmentsGrid
        v-else-if="filteredEquipments.length > 0"
        :equipments="filteredEquipments"
        :selected-equipment="selectedEquipment"
        :current-equipment="currentFieldEquipment"
        :check-equipment-valid="checkEquipmentValid"
        @select="handleSelectItem"
      />
      <div v-else class="min-h-0 grow overflow-y-auto">
        <div v-if="allEquipments.length !== 0" class="text-primary-50 px-8 py-12">
          {{ t('character-simulator.browse-equipments.serach-no-equipment-tips') }}
        </div>
        <div v-else class="text-primary-40 px-4 py-3 text-sm">
          {{ t('character-simulator.browse-equipments.no-any-equipment-tips') }}
        </div>
      </div>
    </div>
  </div>
</template>
