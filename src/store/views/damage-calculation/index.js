import { GetLang } from '@services/Language';

const SAVE_KEY = 'app--damage-calculation--v1--data';

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
  reset(state, newState) {
    state.calculations = newState.calculations;
    state.currentCalculationIndex = newState.currentCalculationIndex;
  },
  appendCalculation(state, calculation) {
    state.calculations.push(calculation);
    state.currentCalculationIndex = state.calculations.length - 1;
  },
  selectCalculation(state, index) {
    state.currentCalculationIndex = index;
  },
  removeCalculation(state, calculation) {
    const index = state.calculations.indexOf(calculation);
    state.calculations.splice(index, 1);
    state.currentCalculationIndex = index !== 0 ? index - 1 : index;
  },
};

const actions = {
  createCalculation({ state, commit, rootState }) {
    const name = GetLang('Damage Calculation/build') + ' ' + (state.calculations.length + 1).toString();
    const calculationBase = rootState.datas.DamageCalculation.calculationBase;
    const calculation = calculationBase.createCalculation(name);
    commit('appendCalculation', calculation);
  },
  save({ state }) {
    const data = {
      calculations: state.calculations.map(calculation => calculation.save()),
      currentCalculationIndex: state.currentCalculationIndex,
    };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  },
  load({ commit, dispatch, rootState }) {
    const dataString = window.localStorage.getItem(SAVE_KEY);
    if (!dataString) {
      dispatch('createCalculation');
      return;
    }
    const data = JSON.parse(dataString);

    try {
      const calculationBase = rootState.datas.DamageCalculation.calculationBase;
      const calculations = [];
      data.calculations.forEach(calculationData => {
        const calculation = calculationBase.createCalculation();
        calculation.load(calculationData);
        calculations.push(calculation);
      });
      commit('reset', {
        calculations,
        currentCalculationIndex: data.currentCalculationIndex,
      });
    } catch (error) {
      console.warn('[@/store/damage-calculation/load] unknow error');
      console.warn(error.message);
    }
  },
};

import container from './container';
import calculation from './calculation';

export default {
  namespaced: true,
  state: storeState,
  getters: storeGetters,
  mutations,
  actions,
  modules: {
    calculation,
    container,
  },
};
