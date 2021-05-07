const store = {
  namespaced: true,
  state: {
    redirectPath: null,
    version: '3.9.2'
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