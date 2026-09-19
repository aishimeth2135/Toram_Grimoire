<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import type { CharacterBaseStat } from '@/lib/Character/Character'

import { CharacterSimulatorRouteNames } from '@/router/Character'

import CharacterDashboardDamageCharts from './character-dashboard-damage-charts.vue'
import CharacterDashboardEquipmentField from './character-dashboard-equipment-field.vue'
import CharacterDashboardFoodBuild from './character-dashboard-food-build.vue'
import CharacterDashboardPotionBuild from './character-dashboard-potion-build.vue'
import CharacterDashboardRegistletBuild from './character-dashboard-registlet-build.vue'
import CharacterDashboardSection from './character-dashboard-section.vue'
import CharacterDashboardSkillBuild from './character-dashboard-skill-build.vue'

import { useCharacterSimulatorState } from '../setup'

const { t } = useI18n()
const characterStore = useCharacterStore()
const { currentCharacter: character } = storeToRefs(characterStore)

const validBaseStats = computed(() => {
  return character.value.baseStats
    .filter(item => item.value > 1)
    .sort((item1, item2) => item2.value - item1.value)
})

const primaryBaseStat = computed(() => validBaseStats.value[0])
const secondaryBaseStat = computed<CharacterBaseStat | null>(() => validBaseStats.value[1] ?? null)

const characterState = computed(() => characterStore.getCharacterState(character.value))

const { setCurrentTab } = useCharacterSimulatorState()
</script>

<template>
  <div class="flex flex-col gap-y-6 p-3">
    <div class="border-primary-20 shadow-xs wd:flex wd:items-stretch border">
      <div class="wd:max-w-xs w-full shrink-0 px-8 py-5">
        <div class="border-primary-10 text-primary-80 -mx-1 border-b px-1">
          {{ character.name }}
        </div>
        <div class="text-primary-40 mt-3">{{ `Lv.${character.level}` }}</div>
      </div>

      <div v-if="validBaseStats.length > 0" class="flex items-center px-8 py-5">
        <div
          class="mr-4 flex size-20 flex-col items-center justify-center rounded-full border-2 border-red-50"
        >
          <span class="text-primary-50 text-sm">
            {{ primaryBaseStat.name }}
          </span>
          <span class="text-primary-80 pb-1">
            {{ primaryBaseStat.value }}
          </span>
        </div>
        <div
          v-if="secondaryBaseStat"
          class="border-primary-30 mr-4 flex size-20 flex-col items-center justify-center rounded-full border-2"
        >
          <span class="text-primary-50 text-sm">
            {{ secondaryBaseStat.name }}
          </span>
          <span class="text-primary-80 pb-1">
            {{ secondaryBaseStat.value }}
          </span>
        </div>
      </div>
    </div>
    <CharacterDashboardSection
      :title="t('character-simulator.character-dashboard.character-build-title')"
    >
      <div class="border-primary-10 wd:flex wd:items-stretch border-t">
        <div class="wd:border-r wd:border-primary-10 relative w-full py-2">
          <cy-button-icon
            icon="mdi:square-edit-outline"
            class="absolute right-2 top-2"
            @click="setCurrentTab(CharacterSimulatorRouteNames.Equipment)"
          />
          <template v-if="character.equipmentFields.some(field => !field.isEmpty)">
            <CharacterDashboardEquipmentField
              v-for="(equipmentField, idx) in character.equipmentFields.filter(
                field => field.equipment
              )"
              :key="equipmentField.fieldId"
              :equipment-field="equipmentField"
              :class="idx % 2 !== 0 ? 'bg-primary-5/50' : ''"
            />
          </template>
          <div v-else class="text-primary-40 px-4 py-2 text-sm">
            {{ t('character-simulator.character-dashboard.no--any-equipment-tips') }}
          </div>
        </div>
        <div class="wd:max-w-sm flex w-full shrink-0 flex-col items-start">
          <CharacterDashboardSkillBuild
            v-if="characterState.skillBuild"
            :skill-build="characterState.skillBuild"
          />
          <CharacterDashboardFoodBuild
            v-if="characterState.foodBuild"
            class="border-primary-10 border-t"
            :food-build="characterState.foodBuild"
          />
          <CharacterDashboardPotionBuild
            v-if="characterState.potionBuild"
            class="border-primary-10 border-t"
            :potion-build="characterState.potionBuild"
          />
          <CharacterDashboardRegistletBuild
            v-if="characterState.registletBuild"
            class="border-primary-10 border-t"
            :registlet-build="characterState.registletBuild"
          />
        </div>
      </div>
    </CharacterDashboardSection>
    <CharacterDashboardDamageCharts />
  </div>
</template>
