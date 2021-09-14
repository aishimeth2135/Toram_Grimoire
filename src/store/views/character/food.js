import { markRaw } from 'vue';

import { FoodsBase } from '@/lib/Character/Food';

const storeState = {
  foodsBase: null,
  foodBuilds: [],
  currentFoodBuildIndex: -1,
};

const storeGetters = {
  currentFoodBuild(state) {
    return state.foodBuilds[state.currentFoodBuildIndex];
  },
};

const mutations = {
  setFoodsBase(state) {
    state.foodsBase = markRaw(new FoodsBase());
  },
  setCurrentFoodBuild(state, { index }) {
    state.currentFoodBuildIndex = index;
  },
  createFoodBuild(state, { name, foodBuild }) {
    state.foodBuilds.push(foodBuild ? foodBuild : state.foodsBase.createFoods(name));
    state.currentFoodBuildIndex = state.foodBuilds.length - 1;
  },
  removeFoodBuild(state, { index }) {
    state.foodBuilds.splice(index, 1);
    if (state.currentFoodBuildIndex >= state.foodBuilds.length)
      state.currentFoodBuildIndex = state.foodBuilds.length - 1;
  },
};

export default {
  namespaced: true,
  state: storeState,
  getters: storeGetters,
  mutations,
};
