<template>
  <AppLayoutBottom>
    <template #default>
      <div class="flex items-center">
        <div class="flex items-center space-x-2 px-2">
          <cy-button-plain icon="mdi:order-numeric-descending" @click="toggleSkillLevel">
            {{ `Lv.${skillLevel}` }}
          </cy-button-plain>
          <cy-button-plain
            v-for="{ key } in equipmentOptions"
            :key="key"
            :icon="
              selectedEquipment[key] !== null
                ? getEquipmentImagePath(selectedEquipment[key])
                : 'mdi:radiobox-marked'
            "
            @click="toggleCurrentEquipment(key)"
          >
            {{ getEquipmentText(selectedEquipment[key]) }}
          </cy-button-plain>
        </div>
        <cy-button-icon
          class="ml-auto"
          :icon="
            advancedMenuVisible ? 'akar-icons:circle-chevron-down' : 'akar-icons:circle-chevron-up'
          "
          @click="handlingToggleAdvancedMenu"
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
        :selected="switchEffectVisible"
        @click="toggleSwitchEffect"
      />
      <cy-button-circle
        icon="icon-park-outline:to-top-one"
        color="fuchsia"
        float
        @click="emit('go-skill-top')"
      />
    </template>
    <template #main-content>
      <AppLayoutBottomContent v-if="advancedMenuVisible" class="p-4">
        <div class="space-y-3">
          <div v-for="{ key, value } in equipmentOptions" :key="key">
            <div class="text-sm text-primary-30">
              {{ t(`skill-query.equipment.${key}: title`) }}
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
            :range="[1, CHARACTER_MAX_LEVEL]"
            :step="10"
            :title="t('skill-query.character-level')"
          />
        </div>
        <div class="mt-3">
          <div class="text-sm text-primary-30">
            {{ t('skill-query.formula-display-mode.title') }}
          </div>
          <div class="flex flex-wrap items-center">
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
      </AppLayoutBottomContent>
    </template>
    <template #side-contents>
      <AppLayoutBottomContent v-if="switchEffectVisible" class="p-3">
        <SkillSwitchEffectButtons
          :skill-item="skillItem!"
          @select-equipment="emit('update:selected-equipment', $event)"
        />
      </AppLayoutBottomContent>
    </template>
  </AppLayoutBottom>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToggle } from '@/shared/setup/State'

import { CHARACTER_MAX_LEVEL } from '@/lib/Character/Character'
import { EquipmentRestrictions } from '@/lib/Character/Stat'
import { SkillTree } from '@/lib/Skill/Skill'
import { SkillComputingContainer, SkillItem } from '@/lib/Skill/SkillComputing'
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputing'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'

import SkillSwitchEffectButtons from '../skill-switch-effect-buttons.vue'

import { useSkillQueryState } from '../setup'
import { setupEquipmentSelect, setupSkillLevel } from './setup'

defineOptions({
  name: 'SkillQueryMenu',
})

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

const advancedMenuVisible = ref(false)
const switchEffectVisible = ref(false)

const toggleAdvancedMenu = useToggle(advancedMenuVisible)
const toggleSwitchEffect = useToggle(switchEffectVisible)

const handlingToggleAdvancedMenu = () => {
  toggleAdvancedMenu()
  toggleSwitchEffect(false)
}

const { equipmentOptions, getEquipmentText, getEquipmentImagePath, toggleCurrentEquipment } =
  setupEquipmentSelect(skillTree, emit)

const { toggleSkillLevel } = setupSkillLevel(skillLevel)

const { t } = useI18n()
</script>
