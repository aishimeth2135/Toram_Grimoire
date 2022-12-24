<template>
  <CardRow class="flex items-center flex-wrap py-2.5 px-1.5">
    <div class="pl-0.5 flex">
      <cy-button-check
        v-model:selected="selected"
        inline
        style="min-width: 15rem"
      >
        {{ food.stat().show() }}
      </cy-button-check>
    </div>
    <div class="flex items-center ml-10">
      <div class="text-primary-30">Lv.</div>
      <cy-input-counter v-model:value="level" :range="foodLevelRange" inline />
    </div>
  </CardRow>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Food } from '@/lib/Character/Food/FoodBuild'

import Notify from '@/setup/Notify'

import CardRow from '@/components/card/card-row.vue'

import { setupCharacterFoodStore } from './setup'

interface Props {
  food: Food
}

const props = defineProps<Props>()

const { t } = useI18n()
const { notify } = Notify()

const foodLevelRange = [0, 10]

const { currentFoodBuild } = setupCharacterFoodStore()

const foodIndex = computed(() =>
  currentFoodBuild.value.foods.indexOf(props.food)
)

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
    props.food.level = value /* eslint-disable-line vue/no-mutating-props */
  },
  get() {
    return props.food.level
  },
})
</script>
