import { defineStore } from 'pinia'
import { shallowRef } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { FoodsBase } from '@/lib/Character/Food'
import { FoodsBuild } from '@/lib/Character/FoodBuild'

import { CHARACTER_SIMULATOR_BUILD_LIMIT } from '../consts'
import { useCharacterBindingBuild } from '../setup/useCharacterBindingBuild'

export const useCharacterFoodStore = defineStore('view-character-food', () => {
  const foodsBase = shallowRef<FoodsBase>(FoodsBase.create())
  const {
    builds,
    onBuildsChange,
    replaceBuilds,
    currentBuildIndex,
    currentBuild,
    setCurrentBuild,
    appendBuild: appendFoodBuild,
    removeBuild: removeFoodBuild,
    resetBuildStore: resetFoodBuildStore,
  } = useCharacterBindingBuild<FoodsBuild>(
    () =>
      FoodsBuild.create(
        foodsBase.value,
        Grimoire.i18n.t('character-simulator.food-build.food-build') + ' 1'
      ),
    CHARACTER_SIMULATOR_BUILD_LIMIT
  )

  const createFoodBuild = () => {
    const newBuild = FoodsBuild.create(
      foodsBase.value,
      Grimoire.i18n.t('character-simulator.food-build.food-build') + ' ' + (builds.value.length + 1)
    )
    return appendFoodBuild(newBuild, { updateIndex: false })
  }

  return {
    foodsBase: foodsBase,
    foodBuilds: builds,
    currentFoodBuildIndex: currentBuildIndex,
    currentFoodBuild: currentBuild,

    onBuildsChange,
    replaceBuilds,
    setCurrentFoodBuild: setCurrentBuild,
    createFoodBuild,
    appendFoodBuild,
    removeFoodBuild,
    resetFoodBuildStore,
  }
})
