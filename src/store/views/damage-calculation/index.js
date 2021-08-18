const storeState = {
  calculations: [],
  currentCalculationIndex: -1,
};

const storeGetters = {
  currentCalculation(state) {
    return state.calculations[state.currentCalculationIndex] ?? null;
  },
};

const mutations = {
  appendCalculation(state, calculation) {
    state.calculations.push(calculation);
    state.currentCalculationIndex += 1;
  },
};

const actions = {
  createCalculation({ commit, rootState }, { name }) {
    const calculationBase = rootState.datas.DamageCalculation.calculationBase;
    const calculation = calculationBase.createCalculation(name);
    commit('appendCalculation', calculation);
  },
};

import container from './container';

export default {
  namespaced: true,
  state: storeState,
  getters: storeGetters,
  mutations,
  actions,
  modules: {
    container,
  },
};
