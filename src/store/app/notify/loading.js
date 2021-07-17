const state = {
  active: false,
};

const mutations = {
  show(state) {
    state.active = true;
  },
  hide(state) {
    state.active = false;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
