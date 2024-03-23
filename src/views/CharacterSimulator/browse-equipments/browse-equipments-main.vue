<script lang="ts" setup>
import { Ref, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import { EquipmentField, EquipmentFieldTypes } from '@/lib/Character/Character'
import {
  CharacterEquipment,
  EquipmentTypes,
} from '@/lib/Character/CharacterEquipment'

import CardRows from '@/components/card/card-rows.vue'

import BrowseEquipmentsItem from './browse-equipments-item.vue'
import BrowseEquipmentsListItem from './browse-equipments-list-item.vue'
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

const selectedEquipment = defineModel<CharacterEquipment | null>(
  'selectedEquipment',
  { required: true }
)

const { t } = useI18n()

const characterStore = useCharacterStore()
const allEquipments = computed(
  () => characterStore.equipments as CharacterEquipment[]
)

const currentFieldTypes: Ref<EquipmentTypes[]> = ref([])
const filteredEquipments: Ref<CharacterEquipment[]> = ref([])

const currentFieldEquipment = computed(
  () => props.currentField?.equipment ?? null
)

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
  return (
    !!selectedEquipment.value && checkEquipmentValid(selectedEquipment.value)
  )
})

watch(currentEquipmentValid, value => {
  emit('state-changed', { selectedEquipmentValid: value })
})

const enum DisplayModes {
  Grid,
  List,
}

const displayMode = ref(DisplayModes.List)

const toggleDisplayMode = () => {
  displayMode.value =
    displayMode.value === DisplayModes.Grid
      ? DisplayModes.List
      : DisplayModes.Grid
}
</script>

<template>
  <div class="flex h-full max-w-[45rem] flex-col">
    <div class="px-2">
      <div class="flex w-full flex-wrap items-center">
        <BrowseEquipmentsMainFilters
          v-model="filteredEquipments"
          v-model:current-field-types="currentFieldTypes"
          :current-field="currentField"
          class="mr-4 pb-4"
        />
        <div class="ml-auto flex items-center pb-4">
          <CharacterEquipmentAppendActions class="mr-5" />
          <cy-button-circle
            icon="mdi:format-list-bulleted-type"
            color="orange"
            small
            :selected="displayMode === DisplayModes.List"
            @click="toggleDisplayMode"
          />
        </div>
      </div>
    </div>
    <div
      v-if="displayMode === DisplayModes.Grid"
      class="flex flex-grow flex-col"
    >
      <div
        class="mx-1.5 mb-2 flex flex-wrap items-center rounded-full border border-primary-50 py-2 pl-5 pr-3"
      >
        <template v-if="selectedEquipment">
          <EquipmentBrowseTitle :equipment="selectedEquipment" class="mr-6" />
          <EquipmentBrowseActions
            :equip-disabled="!allowEquip"
            :equipment="selectedEquipment"
            :equipped="currentFieldEquipment === selectedEquipment"
            class="flex-grow"
            @equip="emit('equip', $event)"
            @equip-cancel="emit('equip-cancel')"
          />
        </template>
        <span v-else class="flex h-8 items-center text-sm text-primary-30">
          {{ t('character-simulator.browse-equipments.select-equipment-tips') }}
        </span>
      </div>
      <div class="flex-grow overflow-y-auto">
        <BrowseEquipmentsItem
          v-for="equip in filteredEquipments"
          :key="equip.id"
          :equipment="equip"
          :selected="selectedEquipment === equip"
          :equipped="currentFieldEquipment === equip"
          :invalid="!checkEquipmentValid(equip)"
          class="m-1.5"
          @click="selectedEquipment = equip"
        />
      </div>
    </div>
    <div
      v-else
      class="mx-2 mt-2 flex-grow overflow-y-auto rounded border border-primary-10 py-0.5"
    >
      <CardRows v-if="filteredEquipments.length > 0">
        <BrowseEquipmentsListItem
          v-for="equip in filteredEquipments"
          :key="equip.id"
          :equipment="equip"
          :selected="selectedEquipment === equip"
          :equipped="currentFieldEquipment === equip"
          :invalid="!checkEquipmentValid(equip)"
          :allow-equip="allowEquip"
          @click="selectedEquipment = equip"
          @equip="emit('equip', $event)"
          @equip-cancel="emit('equip-cancel')"
        />
      </CardRows>
      <div
        v-else-if="allEquipments.length !== 0"
        class="px-8 py-12 text-primary-50"
      >
        {{
          t('character-simulator.browse-equipments.serach-no-equipment-tips')
        }}
      </div>
      <div v-else>
        {{ t('character-simulator.browse-equipments.no-any-equipment-tips') }}
      </div>
    </div>
  </div>
</template>
