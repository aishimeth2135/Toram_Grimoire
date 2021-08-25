const mutations = {
  setCalculationName(state, { calculation, name }) {
    calculation.name = name;
  },
};

export default {
  namespaced: true,
  mutations,
};
