<script lang="ts" setup>
import { FoodsBuild } from '@/lib/Character/FoodBuild'

import { CharacterSimulatorRouteNames } from '@/router/Character'

import CharacterDashboardSideWrapper from './character-dashboard-side-wrapper.vue'

interface Props {
  foodBuild: FoodsBuild
}

defineProps<Props>()
</script>

<template>
  <CharacterDashboardSideWrapper
    icon="mdi:food-apple"
    :title="foodBuild.name"
    :tab-path-name="CharacterSimulatorRouteNames.Food"
  >
    <div class="5r space-y-1">
      <div
        v-for="food in foodBuild.selectedFoods"
        :key="food.foodBase.foodBaseId"
        class="flex items-center"
      >
        {{ food.stat().show() }}
        <div class="ml-2 text-sm text-primary-40">
          {{ `Lv.${food.level}` }}
        </div>
      </div>
    </div>
  </CharacterDashboardSideWrapper>
</template>
