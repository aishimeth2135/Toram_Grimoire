const store = {
  namespaced: true,
  state: {
    redirectPath: null
  },
  mutations: {
    setRedirectPath(state, path) {
      state.redirectPath = path;
    },
    clearRedirectPath(state) {
      state.redirectPath = null;
    }
  }
};

export default store;