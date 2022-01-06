import { computed, markRaw, readonly, ref } from 'vue';
import type { Ref } from 'vue';
import { defineStore } from 'pinia';

import { Foods, FoodsBase } from '@/lib/Character/Food';

export const useCharacterFoodStore = defineStore('view-character-food', () => {
  const foodsBase: Ref<FoodsBase | null> = ref(null);
  const foodBuilds: Ref<Foods[]> = ref([]);
  const currentFoodBuildIndex = ref(-1);

  const initFoodsBase = () => {
    foodsBase.value = markRaw(new FoodsBase());
  };

  const currentFoodBuild = computed(() => {
    return foodBuilds.value[currentFoodBuildIndex.value] ?? null;
  });

  const setCurrentFoodBuild = (idx: number) => currentFoodBuildIndex.value = idx;

  const createFoodBuild = ({ name, foodBuild }: { name?: string; foodBuild?: Foods }) => {
    if (!foodsBase.value) {
      return;
    }
    foodBuilds.value.push(foodBuild ?? foodsBase.value.createFoods(name));
    currentFoodBuildIndex.value = foodBuilds.value.length - 1;
  };

  const removeFoodBuild = (idx: number) => {
    foodBuilds.value.splice(idx, 1);
    if (currentFoodBuildIndex.value >= foodBuilds.value.length) {
      currentFoodBuildIndex.value = foodBuilds.value.length - 1;
    }
  };

  const resetFoodBuilds = () => {
    foodBuilds.value = [];
  };

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
  };
});

