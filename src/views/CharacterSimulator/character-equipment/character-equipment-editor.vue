<!-- this component is editor for CharacterEquipment -->
<template>
  <div class="px-1 pt-2">
    <div
      v-if="equipment.customTypeList"
      class="mb-2 flex items-center"
    >
      <cy-icon-text
        icon="mdi-checkbox-multiple-blank-circle"
        class="mr-2"
        text-color="purple"
        small
      >
        {{ t('character-simulator.equipment-info.equipment-type') }}
      </cy-icon-text>
      <cy-button-action
        icon="heroicons-solid:switch-vertical"
        @click="equipment.setCustomType()"
      >
        {{ t('common.Equipment.category.' + equipment.type) }}
      </cy-button-action>
    </div>
    <cy-input-counter
      v-if="equipment.isWeapon()"
      v-model:value="equipment.atk/* eslint-disable-line vue/no-mutating-props */"
      class="mb-3"
      :range="baseValueRange"
    >
      <template #title>
        <cy-icon-text icon="mdi-sword">
          ATK
        </cy-icon-text>
      </template>
    </cy-input-counter>
    <cy-input-counter
      v-else-if="equipment.isArmor()"
      v-model:value="equipment.def/* eslint-disable-line vue/no-mutating-props */"
      class="mb-3"
      :range="baseValueRange"
    >
      <template #title>
        <cy-icon-text icon="mdi-shield">
          DEF
        </cy-icon-text>
      </template>
    </cy-input-counter>
    <cy-input-counter
      v-if="equipment.hasRefining"
      v-model:value="equipment.refining/* eslint-disable-line vue/no-mutating-props */"
      class="mb-3"
      :range="[0, 15]"
    >
      <template #title>
        <cy-icon-text icon="mdi-cube-send">
          {{ t('character-simulator.equipment-info.refining') }}
        </cy-icon-text>
      </template>
    </cy-input-counter>
    <div v-if="equipment.hasCrystal" class="crystals">
      <cy-button-action
        v-for="c in equipment.crystals"
        :key="c.id"
        :icon="c.crystalIconPath"
        icon-src="image"
        @click="editCrystal(equipment)"
      >
        {{ c.name }}
      </cy-button-action>
      <cy-button-action
        v-if="equipment.crystals.length < 2"
        icon="bx-bx-circle"
        @click="editCrystal(equipment)"
      >
        {{ t('character-simulator.equipment-info.crystal-empty') }}
      </cy-button-action>
    </div>
    <div class="mt-3 pt-2 border-t border-solid border-light">
      <cy-button-action
        icon="ic-round-edit"
        @click="editBasic(equipment)"
      >
        {{ t('character-simulator.equipment-basic-editor.title') }}
      </cy-button-action>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { inject, toRefs } from 'vue'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import { CharacterSimulatorInjectionKey } from '../injection-keys'

interface Props {
  equipment: CharacterEquipment;
}

const props = defineProps<Props>()

const { equipment } = toRefs(props)

const { t } = useI18n()

const baseValueRange = [0, 999]

const { editCrystal, editBasic } = inject(CharacterSimulatorInjectionKey)!
</script>
