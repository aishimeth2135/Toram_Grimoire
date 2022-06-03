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
        <cy-button-toggle v-model:selected="selected" inline>
          {{ food.stat().show() }}
        </cy-button-toggle>
      </template>
    </cy-input-counter>
  </cy-list-item>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Food } from '@/lib/Character/Food'

import Notify from '@/setup/Notify'

import { setupCharacterFoodStore } from './setup'

interface Props {
  food: Food;
}

const props = defineProps<Props>()

const { t } = useI18n()
const { notify } = Notify()

const foodLevelRange = [0, 10]

const { currentFoodBuild } = setupCharacterFoodStore()

const foodIndex = computed(() => currentFoodBuild.value.foods.indexOf(props.food))

const selected = computed<boolean>({
  set(value) {
    if (value) {
      if (!currentFoodBuild.value.appendSelectedFood(foodIndex.value)) {
        notify(t('character-simulator.food-build.selected-food-limit-reached'))
      }
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
    if (props.food.level === 0 && value > 0 && !selected.value) {
      selected.value = true
    }
    props.food.level = value/* eslint-disable-line vue/no-mutating-props */
  },
  get() {
    return props.food.level
  },
})
</script>
