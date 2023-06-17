<template>
  <AppLayoutBottom>
    <template #default>
      <div class="flex items-center">
        <div class="flex items-center space-x-2 px-2">
          <cy-button-plain
            icon="mdi:order-numeric-descending"
            @click="toggleSkillLevel"
          >
            {{ `Lv.${skillLevel}` }}
          </cy-button-plain>
          <cy-button-plain
            v-for="{ key } in equipmentOptions"
            :key="key"
            :icon="getEquipmentImagePath(selectedEquipment[key])"
            :icon-src="selectedEquipment[key] === null ? 'iconify' : 'image'"
            @click="toggleCurrentEquipment(key)"
          >
            {{ getEquipmentText(selectedEquipment[key]) }}
          </cy-button-plain>
        </div>
        <cy-button-icon
          class="ml-auto"
          :icon="
            contents.advancedMenu
              ? 'akar-icons:circle-chevron-down'
              : 'akar-icons:circle-chevron-up'
          "
          @click="toggle('contents/advancedMenu', null, false)"
        />
      </div>
    </template>
    <template #side-buttons>
      <cy-button-circle
        v-if="skillItem"
        icon="mdi:checkbox-multiple-blank-circle-outline"
        color="blue"
        toggle
        float
        :selected="contents.switchEffect"
        @click="toggle('contents/switchEffect')"
      />
      <cy-button-circle
        icon="icon-park-outline:to-top-one"
        color="fuchsia"
        float
        @click="emit('go-skill-top')"
      />
    </template>
    <template #main-content>
      <AppLayoutBottomContent v-if="contents.advancedMenu" class="p-4">
        <div class="space-y-3">
          <div v-for="{ key, value } in equipmentOptions" :key="key">
            <div>
              <cy-icon-text text-color="fuchsia-60" small>
                {{ t(`skill-query.equipment.${key}: title`) }}
              </cy-icon-text>
            </div>
            <div class="flex flex-wrap items-start">
              <cy-button-radio
                v-for="equip in value"
                :key="equip ?? '--none--'"
                :selected="equip === selectedEquipment[key]"
                @click="toggleCurrentEquipment(key, equip)"
              >
                {{ getEquipmentText(equip) }}
              </cy-button-radio>
            </div>
          </div>
        </div>
        <div class="mt-3">
          <cy-input-counter
            v-model:value="skillLevel"
            :range="[1, 10]"
            :title="t('skill-query.skill-level')"
          />
        </div>
        <div class="mt-3">
          <cy-input-counter
            v-model:value="characterLevel"
            :range="[1, 250]"
            :step="10"
            :title="t('skill-query.character-level')"
          />
        </div>
        <div class="mt-3">
          <div>
            <cy-icon-text text-color="fuchsia-60" small>
              {{ t('skill-query.formula-display-mode.title') }}
            </cy-icon-text>
          </div>
          <div class="flex flex-wrap items-center">
            <cy-button-radio
              :selected="formulaDisplayMode === FormulaDisplayModes.Normal"
              @click="formulaDisplayMode = FormulaDisplayModes.Normal"
            >
              {{ t('skill-query.formula-display-mode.normal') }}
            </cy-button-radio>
            <cy-button-radio
              :selected="
                formulaDisplayMode === FormulaDisplayModes.OriginalFormula
              "
              @click="formulaDisplayMode = FormulaDisplayModes.OriginalFormula"
            >
              {{ t('skill-query.formula-display-mode.original-formula') }}
            </cy-button-radio>
          </div>
        </div>
      </AppLayoutBottomContent>
    </template>
    <template #side-contents>
      <AppLayoutBottomContent v-if="contents.switchEffect" class="p-3">
        <SkillSwitchEffectButtons
          :skill-item="skillItem!"
          @select-equipment="emit('update:selected-equipment', $event)"
        />
      </AppLayoutBottomContent>
    </template>
  </AppLayoutBottom>
</template>

<script lang="ts">
export default {
  name: 'SkillQueryMenu',
}
</script>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillTree } from '@/lib/Skill/Skill'
import { SkillComputingContainer, SkillItem } from '@/lib/Skill/SkillComputing'
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputing'
import { EquipmentRestrictions } from '@/lib/Character/Stat'

import ToggleService from '@/shared/setup/ToggleService'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'

import SkillSwitchEffectButtons from '../skill-switch-effect-buttons.vue'

import { setupEquipmentSelect, setupSkillLevel } from './setup'
import { useSkillQueryState } from '../setup'

interface Props {
  skillItem: SkillItem | null
  skillTree: SkillTree
  skillComputingContainer: SkillComputingContainer
  selectedEquipment: EquipmentRestrictions
}
const props = defineProps<Props>()

interface Emits {
  (evt: 'update:selected-equipment', value: EquipmentRestrictions): void
  (evt: 'go-skill-top'): void
}
const emit = defineEmits<Emits>()

const { skillTree, skillComputingContainer: computingContainer } = toRefs(props)

const { skillLevel, characterLevel } = useSkillQueryState()

const formulaDisplayMode = computed<FormulaDisplayModes>({
  get() {
    return computingContainer.value.config.formulaDisplayMode
  },
  set(value) {
    computingContainer.value.config.formulaDisplayMode = value
  },
})

const { contents, toggle } = ToggleService({
  contents: ['advancedMenu', 'switchEffect'] as const,
})

const {
  equipmentOptions,
  getEquipmentText,
  getEquipmentImagePath,
  toggleCurrentEquipment,
} = setupEquipmentSelect(skillTree, emit)

const { toggleSkillLevel } = setupSkillLevel(skillLevel)

const { t } = useI18n()
</script>
