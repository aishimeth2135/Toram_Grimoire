const mutations = {
  setStatValue(state, { stat, value }) {
    stat.value = value;
  },
  removeStat(state, stat) {
    stat.remove();
  },
};

export default {
  namespaced: true,
  mutations,
};