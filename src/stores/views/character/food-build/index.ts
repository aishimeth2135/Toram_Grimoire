import { defineStore } from 'pinia'
import { markRaw, ref } from 'vue'
import type { Ref } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { FoodsBase } from '@/lib/Character/Food'
import { FoodsBuild } from '@/lib/Character/FoodBuild'

import { CHARACTER_SIMULATOR_BUILD_LIMIT } from '../consts'
import { useCharacterBindingBuild } from '../setup/useCharacterBindingBuild'

export const useCharacterFoodStore = defineStore('view-character-food', () => {
  const {
    builds,
    currentBuildIndex,
    currentBuild,
    setCurrentBuild,
    appendBuild: appendFoodBuild,
    removeBuild: removeFoodBuild,
    resetBuildStore: resetFoodBuildStore,
  } = useCharacterBindingBuild<FoodsBuild>(CHARACTER_SIMULATOR_BUILD_LIMIT)

  const foodsBase: Ref<FoodsBase | null> = ref(null)

  const initFoodsBase = () => {
    foodsBase.value = markRaw(new FoodsBase())
  }

  const createFoodBuild = () => {
    const newBuild = new FoodsBuild(
      foodsBase.value!,

      Grimoire.i18n.t('character-simulator.food-build.food-build') + ' ' + (builds.value.length + 1)
    )
    return appendFoodBuild(newBuild, { updateIndex: false })
  }

  return {
    foodsBase: foodsBase,
    foodBuilds: builds,
    currentFoodBuildIndex: currentBuildIndex,
    currentFoodBuild: currentBuild,

    initFoodsBase,
    setCurrentFoodBuild: setCurrentBuild,
    createFoodBuild,
    appendFoodBuild,
    removeFoodBuild,
    resetFoodBuildStore,
  }
})
