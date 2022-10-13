<template>
  <div v-if="equipment">
    <div>
      <cy-icon-text
        icon="mdi-clipboard-edit-outline"
        small
        text-color="fuchsia-60"
      >
        {{ t('character-simulator.equipment-basic-editor.equipment-name') }}
      </cy-icon-text>
    </div>
    <div class="mt-2">
      <cy-title-input
        v-model:value="currentEquipment.name"
        icon="mdi-clipboard-edit-outline"
      />
    </div>
    <template v-if="currentEquipment.customTypeList">
      <div class="mt-3">
        <cy-icon-text
          icon="mdi-clipboard-edit-outline"
          small
          text-color="fuchsia-60"
        >
          {{ t('character-simulator.equipment-basic-editor.equipment-type') }}
        </cy-icon-text>
      </div>
      <cy-button-radio-group
        v-model:value="currentEquipment.type"
        :options="
          currentEquipment.customTypeList.map(item => ({
            text: t('common.Equipment.category.' + item),
            value: item,
          }))
        "
        class="mt-1"
      />
    </template>
    <template
      v-if="
        equipment.is(EquipmentKinds.Weapon) ||
        equipment.is(EquipmentKinds.Armor)
      "
    >
      <div class="mt-3">
        <cy-icon-text
          icon="mdi-clipboard-edit-outline"
          small
          text-color="fuchsia-60"
        >
          {{ t('character-simulator.equipment-basic-editor.equipment-basic') }}
        </cy-icon-text>
      </div>
      <div class="mt-2 space-y-1.5 pl-1.5">
        <CharacterEquipmentBasicValue :equipment="equipment" />
        <div>
          <cy-input-counter
            v-if="currentEquipment.hasRefining"
            v-model:value="currentEquipment.refining"
          >
            <template #title>
              <cy-icon-text icon="mdi-rhombus-outline">
                {{ t('character-simulator.equipment-info.refining') }}
              </cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter
            v-if="currentEquipment.hasStability"
            v-model:value="currentEquipment.stability"
          >
            <template #title>
              <cy-icon-text icon="mdi-rhombus-outline">
                {{ t('character-simulator.equipment-info.stability') }}
              </cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
      </div>
    </template>
    <div class="mt-3">
      <cy-icon-text icon="mdi-rhombus-outline" small text-color="fuchsia-60">
        {{ t('character-simulator.equipment-basic-editor.equipment-stats') }}
      </cy-icon-text>
    </div>
    <Draggable
      v-model="currentEquipment.stats"
      class="mt-2 space-y-1.5 pl-1.5"
      :item-key="getStatKey"
    >
      <template #item="{ element: stat }">
        <div class="flex items-center">
          <cy-input-counter
            v-model:value="stat.value"
            input-width="2.6rem"
            :range="stat.isBoolStat ? ranges.boolStat : ranges.stat"
          >
            <template #title>
              <cy-icon-text icon="mdi-rhombus-outline">
                {{ stat.show() }}
              </cy-icon-text>
            </template>
          </cy-input-counter>
          <cy-icon-text icon="ic:baseline-drag-indicator" class="ml-auto" />
        </div>
      </template>
    </Draggable>
    <div class="mt-3">
      <cy-button-action icon="ic-round-add" @click="editStat(currentEquipment)">
        {{ t('character-simulator.equipment-basic-editor.edit-stats.title') }}
      </cy-button-action>
    </div>
    <template v-if="equipment.hasCrystal">
      <div class="mt-3">
        <cy-icon-text icon="mdi-rhombus-outline" small text-color="fuchsia-60">
          {{
            t('character-simulator.equipment-basic-editor.equipment-crystal')
          }}
        </cy-icon-text>
      </div>
      <CharacterEquipmentEditMask
        class="!block px-3 py-2"
        @click="editCrystal(currentEquipment)"
      >
        <div v-for="crystal in equipment.crystals" :key="crystal.id">
          <cy-icon-text
            :icon="crystal.crystalIconPath"
            icon-src="image"
            text-color="cyan-60"
          >
            {{ crystal.name }}
          </cy-icon-text>
        </div>
      </CharacterEquipmentEditMask>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { EquipmentKinds } from '@/lib/Character/CharacterEquipment/enums'
import { StatRestriction } from '@/lib/Character/Stat'

import CharacterEquipmentBasicValue from './character-equipment-basic-value.vue'
import CharacterEquipmentEditMask from './character-equipment-edit-mask.vue'

import { CharacterSimulatorInjectionKey } from '../injection-keys'

interface Props {
  equipment: CharacterEquipment | null
}

const props = defineProps<Props>()

const { t } = useI18n()

const ranges = {
  stability: [0, 100],
  stat: [null, null],
  boolStat: [1, 1],
}

const currentEquipment = computed(() => props.equipment!)

const { editStat, editCrystal } = inject(CharacterSimulatorInjectionKey)!

const getStatKey = (stat: StatRestriction) => stat.statId
</script>
