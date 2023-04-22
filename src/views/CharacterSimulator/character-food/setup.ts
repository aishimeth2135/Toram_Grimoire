import { storeToRefs } from 'pinia'
import { Ref } from 'vue'

import { useCharacterFoodStore } from '@/stores/views/character/food-build'

import { FoodsBuild } from '@/lib/Character/FoodBuild'

export function setupCharacterFoodStore() {
  const store = useCharacterFoodStore()
  const { currentFoodBuild, foodBuilds } = storeToRefs(store)

  return {
    store,
    foodBuilds: foodBuilds as Ref<FoodsBuild[]>,
    currentFoodBuild: currentFoodBuild as Ref<FoodsBuild>,
  }
}
