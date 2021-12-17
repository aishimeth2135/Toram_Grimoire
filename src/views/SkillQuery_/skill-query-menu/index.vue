<template>
  <div class="sticky bottom-2 z-10 mx-2 mt-4">
    <div
      v-if="contents.advancedMenu"
      class="bg-white border-1 border-solid border-light-2 rounded-lg p-4 mb-3 overflow-y-auto"
      style="max-height: 60vh;"
    >
      <div class="space-y-3">
        <div
          v-for="({ key, value }) in equipmentOptions"
          :key="key"
        >
          <div>
            <cy-icon-text text-color="purple" size="small">
              {{ t(`skill-query.equipment.${key}: title`) }}
            </cy-icon-text>
          </div>
          <div class="flex items-start flex-wrap">
            <cy-button-radio
              v-for="equip in value"
              :key="equip"
              :selected="equip === selectedEquipment[key]"
              :selected-icon="getEquipmentImagePath(equip)"
              :selected-icon-src="equip === null ? 'iconify' : 'image'"
              @click="toggleCurrentEquipment(key, equip)"
            >
              {{ getEquipmentText(equip) }}
            </cy-button-radio>
          </div>
        </div>
      </div>
      <div class="mt-3">
        <cy-input-counter v-model:value="skillLevel" :range="[1, 10]">
          <template #title>{{ t('skill-query.skill-level') }}</template>
        </cy-input-counter>
      </div>
      <div class="mt-3">
        <cy-input-counter v-model:value="characterLevel" :range="[1, 250]" :step="10">
          <template #title>{{ t('skill-query.character-level') }}</template>
        </cy-input-counter>
      </div>
      <div class="mt-3">
        <div>
          <cy-icon-text text-color="purple" size="small">
            {{ t(`skill-query.formula-display-mode.title`) }}
          </cy-icon-text>
        </div>
        <div class="flex items-center flex-wrap">
          <cy-button-radio
            :selected="formulaDisplayMode === FormulaDisplayModes.Normal"
            @click="formulaDisplayMode = FormulaDisplayModes.Normal"
          >
            {{ t('skill-query.formula-display-mode.normal') }}
          </cy-button-radio>
          <cy-button-radio
            :selected="formulaDisplayMode === FormulaDisplayModes.OriginalFormula"
            @click="formulaDisplayMode = FormulaDisplayModes.OriginalFormula"
          >
            {{ t('skill-query.formula-display-mode.original-formula') }}
          </cy-button-radio>
        </div>
      </div>
    </div>
    <div class="flex items-center bg-white border-1 border-solid border-light-2 rounded-2xl px-4 py-1">
      <cy-button-inline icon="mdi:order-numeric-descending" @click="toggleSkillLevel">
        {{ `Lv.${skillLevel}` }}
      </cy-button-inline>
      <cy-button-inline
        v-for="({ key }) in equipmentOptions"
        :key="key"
        :icon="getEquipmentImagePath(selectedEquipment[key])"
        :icon-src="selectedEquipment[key] === null ? 'iconify' : 'image'"
        @click="toggleCurrentEquipment(key)"
      >
        {{ getEquipmentText(selectedEquipment[key]) }}
      </cy-button-inline>
      <cy-button-icon
        class="ml-auto"
        :icon="contents.advancedMenu ? 'akar-icons:circle-chevron-down' : 'akar-icons:circle-chevron-up'"
        @click="toggle('contents/advancedMenu')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import type { WritableComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { SkillTree } from '@/lib/Skill/Skill';
import SkillComputingContainer, { EquipmentRestriction } from '@/lib/Skill/SkillComputingContainer';
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputingContainer/enums';

import ToggleService from '@/setup/ToggleService';

import { setupEquipmentSelect, setupSkillLevel } from './setup';

interface Props {
  skillTree: SkillTree;
  skillComputingContainer: SkillComputingContainer;
  selectedEquipment: EquipmentRestriction;
}
const props = defineProps<Props>();

interface Emits {
  (event: 'update:selected-equipment', value: EquipmentRestriction): void;
}
const emit = defineEmits<Emits>();

const { skillTree, skillComputingContainer: computingContainer } = toRefs(props);

const skillLevel: WritableComputedRef<number> = computed({
  get() {
    return computingContainer.value.vars.skillLevel;
  },
  set(value) {
    computingContainer.value.vars.skillLevel = value;
  },
});
const characterLevel: WritableComputedRef<number> = computed({
  get() {
    return computingContainer.value.vars.characterLevel;
  },
  set(value) {
    computingContainer.value.vars.characterLevel = value;
  },
});
const formulaDisplayMode: WritableComputedRef<FormulaDisplayModes> = computed({
  get() {
    return computingContainer.value.config.formulaDisplayMode;
  },
  set(value) {
    computingContainer.value.config.formulaDisplayMode = value;
  },
});

const { contents, toggle } = ToggleService({
  contents: ['advancedMenu'],
});

const {
  equipmentOptions,
  getEquipmentText,
  getEquipmentImagePath,
  toggleCurrentEquipment,
} = setupEquipmentSelect(skillTree, emit);

const {
  toggleSkillLevel,
} = setupSkillLevel(skillLevel);

const { t } = useI18n();
</script>
