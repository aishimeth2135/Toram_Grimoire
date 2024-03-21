<script lang="ts" setup>
import { Ref, ref, watch } from 'vue'

import { EquipmentField } from '@/lib/Character/Character'

import CommonEquipmentIcon from '../common/common-equipment-icon.vue'
import CharacterEquipmentFieldTab from './character-equipment-field-tab.vue'

import { setupCharacterStore } from '../setup'

const { currentCharacter } = setupCharacterStore()

const currentEquipmentField = ref(
  currentCharacter.value.equipmentFields[0]
) as Ref<EquipmentField>

watch(currentCharacter, newValue => {
  currentEquipmentField.value = newValue.equipmentFields[0]
})
</script>

<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="px-2 py-2">
    <div class="pb-2">
      <cy-tabs v-model="currentEquipmentField">
        <cy-tab
          v-for="field in currentCharacter.equipmentFields"
          :key="field.fieldId"
          :value="field"
        >
          <div class="pb-1">
            <CommonEquipmentIcon
              v-if="field.equipment"
              :equipment="field.equipment"
              width="1.5rem"
            />
            <cy-icon v-else width="1.5rem" icon="mdi:circle-outline" />
          </div>
        </cy-tab>
      </cy-tabs>
    </div>
    <CharacterEquipmentFieldTab
      :equipment-field="currentEquipmentField"
      @submit="currentEquipmentField.setEquipment($event)"
    />
  </div>
</template>
