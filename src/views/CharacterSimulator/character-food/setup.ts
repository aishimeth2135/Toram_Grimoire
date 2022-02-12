import { storeToRefs } from 'pinia'
import { Ref } from 'vue'

import { useCharacterFoodStore } from '@/stores/views/character/food'

import { FoodBuild } from '@/lib/Character/Food'

export function setupCharacterFoodStore() {
  const store = useCharacterFoodStore()
  const { currentFoodBuild, foodBuilds } = storeToRefs(store)

  return {
    store,
    foodBuilds: foodBuilds as Ref<FoodBuild[]>,
    currentFoodBuild: currentFoodBuild as Ref<FoodBuild>,
  }
}
