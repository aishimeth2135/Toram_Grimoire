<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import type { CharacterBaseStat } from '@/lib/Character/Character'

import { CharacterSimulatorRouteNames } from '@/router/Character'

import CharacterDashboardEquipmentField from './character-dashboard-equipment-field.vue'
import CharacterDashboardFoodBuild from './character-dashboard-food-build.vue'
import CharacterDashboardPotionBuild from './character-dashboard-potion-build.vue'
import CharacterDashboardRegistletBuild from './character-dashboard-registlet-build.vue'
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
  <div class="px-3 py-3">
    <div class="shadow-xs border border-primary-20 wd:flex wd:items-stretch">
      <div class="w-full shrink-0 px-8 py-5 wd:max-w-xs">
        <div class="-mx-1 border-b border-primary-10 px-1 text-primary-80">
          {{ character.name }}
        </div>
        <div class="mt-3 text-primary-40">{{ `Lv.${character.level}` }}</div>
      </div>

      <div v-if="validBaseStats.length > 0" class="flex items-center px-8 py-5">
        <div
          class="mr-4 flex h-20 w-20 flex-col items-center justify-center rounded-full border-1 border-red-50"
        >
          <span class="text-sm text-primary-50">
            {{ primaryBaseStat.name }}
          </span>
          <span class="pb-1 text-primary-80">
            {{ primaryBaseStat.value }}
          </span>
        </div>
        <div
          v-if="secondaryBaseStat"
          class="mr-4 flex h-20 w-20 flex-col items-center justify-center rounded-full border-1 border-primary-30"
        >
          <span class="text-sm text-primary-50">
            {{ secondaryBaseStat.name }}
          </span>
          <span class="pb-1 text-primary-80">
            {{ secondaryBaseStat.value }}
          </span>
        </div>
      </div>
    </div>
    <div class="shadow-xs mt-7 border border-primary-20 wd:flex wd:items-stretch">
      <div class="relative w-full py-2 wd:border-r wd:border-primary-10">
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
        <div v-else class="px-4 py-2 text-sm text-primary-40">
          {{ t('character-simulator.character-dashboard.no--any-equipment-tips') }}
        </div>
      </div>
      <div class="flex w-full shrink-0 flex-col items-start wd:max-w-sm">
        <CharacterDashboardSkillBuild
          v-if="characterState.skillBuild"
          :skill-build="characterState.skillBuild"
        />
        <CharacterDashboardFoodBuild
          v-if="characterState.foodBuild"
          class="border-t border-primary-10"
          :food-build="characterState.foodBuild"
        />
        <CharacterDashboardPotionBuild
          v-if="characterState.potionBuild"
          class="border-t border-primary-10"
          :potion-build="characterState.potionBuild"
        />
        <CharacterDashboardRegistletBuild
          v-if="characterState.registletBuild"
          class="border-t border-primary-10"
          :registlet-build="characterState.registletBuild"
        />
      </div>
    </div>
  </div>
</template>
