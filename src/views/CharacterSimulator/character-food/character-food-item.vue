<template>
  <cy-list-item>
    <cy-input-counter
      v-model:value="level"
      :range="foodLevelRange"
      type="line"
      inline
      class="w-full"
      style="max-width: 25rem"
    >
      <template #title>
        <cy-button-check v-model:selected="selected" inline>
          {{ food.stat().show() }}
        </cy-button-check>
      </template>
    </cy-input-counter>
  </cy-list-item>
</template>

<script lang="ts">
const FOOD_LEVEL_RANGE = [0, 10]
</script>

<script lang="ts" setup>
import { computed } from 'vue'

import { Food } from '@/lib/Character/Food'

import { setupCharacterFoodStore } from './setup'

interface Props {
  food: Food;
}

const props = defineProps<Props>()

const foodLevelRange = FOOD_LEVEL_RANGE

const { currentFoodBuild } = setupCharacterFoodStore()

const foodIndex = computed(() => currentFoodBuild.value.foods.indexOf(props.food))

const selected = computed<boolean>({
  set(value) {
    if (value) {
      currentFoodBuild.value.appendSelectedFood(foodIndex.value)
    } else {
      currentFoodBuild.value.removeSelectedFood(foodIndex.value)
    }
  },
  get() {
    return currentFoodBuild.value.foodSelected(foodIndex.value)
  },
})

const level = computed<number>({
  set(value) {
    if (props.food.level === 0 && value > 0) {
      selected.value = true
    }
    props.food.level = value/* eslint-disable-line vue/no-mutating-props */
  },
  get() {
    return props.food.level
  },
})
</script>
