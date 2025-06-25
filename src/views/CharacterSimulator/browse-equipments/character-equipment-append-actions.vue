<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import { CharacterEquipment, EquipmentTypes } from '@/lib/Character/CharacterEquipment'

import CharacterEquipmentAppend from '../character-equipment-append/character-equipment-append.vue'

import { useCharacterSimulatorState } from '../setup'
import { useEquipmentsDisplayedItems } from './setup'

const characterStore = useCharacterStore()

const { t } = useI18n()

const { editEquipment } = useCharacterSimulatorState()

const equipmentAppendVisible = ref(false)

const getEquipmentTypeImage = CharacterEquipment.getImagePath

const createCustomEquipment = (type: EquipmentTypes) => {
  const name = t('character-simulator.create-custom-equipment.equipment-default-name', {
    type: CharacterEquipment.getTypeText(type),
  })
  const newEquip = CharacterEquipment.createEmpty(name, type)
  editEquipment(characterStore.appendEquipment(newEquip))
}

const { displayedItems } = useEquipmentsDisplayedItems()
</script>

<template>
  <div class="flex items-center">
    <cy-button-circle
      small
      icon="mdi:checkbox-blank-badge-outline"
      class="mr-2"
      @click="equipmentAppendVisible = true"
    />
    <cy-popover placement="bottom-end">
      <cy-button-circle icon="mdi:pencil-add" small />
      <template #popper="{ hide }">
        <div class="space-y-2.5 px-2 py-3">
          <div
            v-for="[category, types] of displayedItems"
            :key="category"
            class="flex flex-wrap items-center"
          >
            <div
              v-for="item of types"
              :key="item"
              class="m-1.5 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-1 border-primary-10 duration-150 hover:border-primary-40"
              hover
              @click="(createCustomEquipment(item), hide())"
            >
              <cy-icon :icon="getEquipmentTypeImage(item)" width="1.5rem" />
            </div>
          </div>
        </div>
        <div class="px-4 py-3 text-sm text-gray-50">
          {{ t('character-simulator.create-custom-equipment.select-equipment-type-message') }}
        </div>
      </template>
    </cy-popover>

    <CharacterEquipmentAppend v-model:visible="equipmentAppendVisible" />
  </div>
</template>
