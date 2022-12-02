import { defineStore } from 'pinia'
import { computed, markRaw, readonly, ref } from 'vue'
import type { Ref } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { FoodsBase } from '@/lib/Character/Food'

import { FoodsBuild } from '../../../../lib/Character/Food/FoodBuild'

export const useCharacterFoodStore = defineStore('view-character-food', () => {
  const foodsBase: Ref<FoodsBase | null> = ref(null)
  const foodBuilds: Ref<FoodsBuild[]> = ref([])
  const currentFoodBuildIndex = ref(-1)

  const initFoodsBase = () => {
    foodsBase.value = markRaw(new FoodsBase())
  }

  const currentFoodBuild = computed(
    () => foodBuilds.value[currentFoodBuildIndex.value]
  )

  const setCurrentFoodBuild = (idx: number | FoodsBuild | null) => {
    if (idx === null) {
      currentFoodBuildIndex.value = -1
      return
    }
    if (typeof idx !== 'number') {
      idx = foodBuilds.value.indexOf(idx)
    }
    currentFoodBuildIndex.value = idx
  }

  const createFoodBuild = (
    { name, foodBuild }: { name?: string; foodBuild?: FoodsBuild } = {},
    updateIndex = true
  ) => {
    const build =
      foodBuild ??
      new FoodsBuild(
        foodsBase.value!,
        name ||
          Grimoire.i18n.t('character-simulator.food-build.food-build') +
            ' ' +
            (foodBuilds.value.length + 1)
      )
    foodBuilds.value.push(build)
    if (updateIndex) {
      currentFoodBuildIndex.value = foodBuilds.value.length - 1
    }
    return build
  }

  const removeFoodBuild = (idx: number) => {
    foodBuilds.value.splice(idx, 1)
    if (currentFoodBuildIndex.value >= foodBuilds.value.length) {
      currentFoodBuildIndex.value = foodBuilds.value.length - 1
    }
  }

  const resetFoodBuilds = () => {
    foodBuilds.value = []
  }

  return {
    foodsBase: readonly(foodsBase),
    foodBuilds: foodBuilds,
    currentFoodBuildIndex: readonly(currentFoodBuildIndex),

    initFoodsBase,
    currentFoodBuild,
    setCurrentFoodBuild,
    createFoodBuild,
    removeFoodBuild,
    resetFoodBuilds,
  }
})
